#!/usr/bin/env python3
"""
srd_kb_lint.py - read-only integrity linter for the SRD 5.2.1 machine-readable KB.

Codifies the page-break corruption patterns found while cleaning spells.jsonl:
PDF page/column breaks split a record's text across fields, leaving telltale
signatures. This tool DETECTS them; it never modifies files.

Checks (per string value, anywhere in the structure):
  [E] page_footer        "<n> System Reference Document 5.2.1" boilerplate
  [E] unbalanced_parens  '(' count != ')' count  (split material components etc.)
  [W] dangling_end       value ends on a function word -> truncation
  [W] frag_start         sentence-like value starts lowercase -> leaked head
Structural checks (per file):
  [E] bad_json           a .jsonl line that won't parse
  [W] duplicate_name     repeated "name" among records
  [I] empty_field        empty string / [] values (informational; some are legit)
  [E] count_mismatch     record count != manifest's declared count (with --manifest)

Usage:
  python3 srd_kb_lint.py spells.jsonl equipment.json
  python3 srd_kb_lint.py /path/to/kb_dir            # all *.json / *.jsonl in dir
  python3 srd_kb_lint.py kb_dir --manifest manifest.json
  python3 srd_kb_lint.py spells.jsonl --strict      # warnings also fail exit code

Exit code: 0 = clean (no errors; also no warnings under --strict), 1 = issues found.
Stdlib only. Python 3.8+.
"""
import argparse, glob, json, os, re, sys

PAGE_FOOTER = re.compile(r'(?:\d+\s+)?System Reference Document 5\.2\.1')
DANGLING = re.compile(
    r'\b(a|an|or|to|the|of|and|with|for|in|on|at|by|worth|than|into|from|'
    r'when|you|see|are|take|immediately|after|up|as|that|this)$', re.IGNORECASE)

def iter_strings(node, path=""):
    """Yield (path, string) for every string value anywhere in the structure."""
    if isinstance(node, dict):
        for k, v in node.items():
            yield from iter_strings(v, f"{path}.{k}" if path else str(k))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from iter_strings(v, f"{path}[{i}]")
    elif isinstance(node, str):
        yield path, node

def top_level_records(node):
    """Return the file's PRIMARY records only (not nested sub-records like a
    monster's individual actions/traits, which legitimately reuse names).
      - list                    -> its dict items
      - dict of lists (e.g. equipment: {weapons:[...], armor:[...]}) -> all items
      - any other dict          -> that dict as a single record
    """
    if isinstance(node, list):
        return [r for r in node if isinstance(r, dict)]
    if isinstance(node, dict):
        if node and all(isinstance(v, list) for v in node.values()):
            return [r for vals in node.values() for r in vals if isinstance(r, dict)]
        return [node]
    return []

def sentence_like(s):
    s = s.strip()
    return (" " in s) and (len(s) > 25 or s.endswith("."))

def load_file(path):
    """Return (parsed_obj, records_count, bad_lines). Handles .jsonl and .json."""
    bad = []
    if path.endswith(".jsonl"):
        recs = []
        with open(path, encoding="utf-8") as f:
            for i, line in enumerate(f, 1):
                if not line.strip():
                    continue
                try:
                    recs.append(json.loads(line))
                except Exception as e:
                    bad.append((i, str(e)))
        return recs, len(recs), bad
    else:
        with open(path, encoding="utf-8") as f:
            obj = json.load(f)
        rc = len(obj) if isinstance(obj, list) else None
        return obj, rc, bad

def string_checks(obj):
    findings = []  # (severity, check, path, snippet)
    for path, val in iter_strings(obj):
        if "source" in path.lower():          # 'SRD 5.2.1' in a source field is fine
            if PAGE_FOOTER.search(val) and val.strip() not in ("SRD 5.2.1", "SRD 5.1"):
                findings.append(("E", "page_footer", path, val[:70]))
            continue
        if PAGE_FOOTER.search(val):
            m = PAGE_FOOTER.search(val)
            findings.append(("E", "page_footer", path,
                             val[max(0, m.start()-20):m.end()+15]))
        if val.count("(") != val.count(")"):
            findings.append(("E", "unbalanced_parens", path, val[:70]))
        if DANGLING.search(val.strip()):
            findings.append(("W", "dangling_end", path, "..."+val.strip()[-45:]))
        if sentence_like(val) and val.strip()[0].islower():
            findings.append(("W", "frag_start", path, val.strip()[:55]))
        # line-break hyphenation artifact: "word- word" (skip suspended and/or/to)
        for hm in re.finditer(r'([A-Za-z]+)- ([A-Za-z]+)', val):
            if hm.group(2).lower() not in ("and", "or", "to"):
                findings.append(("W", "hyphenation", path,
                                 val[max(0, hm.start()-12):hm.end()+12]))
                break
        # trailing name/header leak: prose ending "<sentence>. TitleCase" w/o terminal punct
        if sentence_like(val):
            vs = val.rstrip()
            if vs and not re.search(r'[.!?)\]"]$', vs):
                tm = re.search(r'\.\s+([A-Z][A-Za-z\'’ -]*)$', vs)
                if tm and not re.search(r'[:,;0-9]', tm.group(1)) \
                        and len(tm.group(1).split()) <= 4:
                    findings.append(("W", "trailing_leak", path, "..." + vs[-45:]))
    return findings

def structural_checks(obj, records_count, bad_lines, declared_count):
    findings = []
    for ln, err in bad_lines:
        findings.append(("E", "bad_json", f"line {ln}", err[:70]))
    seen = {}
    for rec in top_level_records(obj):        # primary records only
        nm = rec.get("name")
        if nm is not None:
            seen[nm] = seen.get(nm, 0) + 1
        for k, v in rec.items():              # direct fields only, not nested
            if v in ("", [], None):
                findings.append(("I", "empty_field", f"{nm}.{k}", ""))
    for nm, cnt in seen.items():
        if cnt > 1:
            findings.append(("W", "duplicate_name", nm, f"x{cnt}"))
    if declared_count is not None:
        actual = records_count if records_count is not None else len(seen)
        if actual != declared_count:
            findings.append(("E", "count_mismatch", "-",
                             f"found {actual}, manifest says {declared_count}"))
    return findings

def manifest_counts(manifest_path):
    """Map filename -> declared record count (jsonl: int; json: not auto-derived)."""
    out = {}
    try:
        m = json.load(open(manifest_path, encoding="utf-8"))
    except Exception:
        return out
    for fname, meta in m.get("files", {}).items():
        recs = meta.get("records")
        if isinstance(recs, int):
            out[fname] = recs
    return out

def lint_file(path, declared_count, strict):
    obj, rc, bad = load_file(path)
    findings = string_checks(obj) + structural_checks(obj, rc, bad, declared_count)
    errors = [f for f in findings if f[0] == "E"]
    warns = [f for f in findings if f[0] == "W"]
    infos = [f for f in findings if f[0] == "I"]

    label = "CLEAN" if not errors and (not strict or not warns) else "ISSUES"
    print(f"\n=== {os.path.basename(path)}  [{label}]  "
          f"errors={len(errors)} warnings={len(warns)} info={len(infos)} ===")
    by_check = {}
    for sev, chk, p, snip in findings:
        by_check.setdefault((sev, chk), []).append((p, snip))
    order = {"E": 0, "W": 1, "I": 2}
    for (sev, chk), items in sorted(by_check.items(), key=lambda x: (order[x[0][0]], x[0][1])):
        if sev == "I":  # summarize info, don't spam
            print(f"  [I] {chk}: {len(items)} field(s) empty (often legitimate)")
            continue
        print(f"  [{sev}] {chk}: {len(items)}")
        for p, snip in items[:12]:
            print(f"        {p}: {snip!r}")
        if len(items) > 12:
            print(f"        ... and {len(items)-12} more")
    return len(errors), len(warns)

def main():
    ap = argparse.ArgumentParser(description="Read-only integrity linter for the SRD 5.2.1 KB.")
    ap.add_argument("paths", nargs="+", help="KB files or directories")
    ap.add_argument("--manifest", help="manifest.json for record-count cross-checks")
    ap.add_argument("--strict", action="store_true", help="warnings also fail the exit code")
    args = ap.parse_args()

    declared = manifest_counts(args.manifest) if args.manifest else {}

    files = []
    for p in args.paths:
        if os.path.isdir(p):
            files += sorted(glob.glob(os.path.join(p, "*.jsonl")) +
                            glob.glob(os.path.join(p, "*.json")))
        else:
            files.append(p)
    files = [f for f in files if os.path.basename(f) != os.path.basename(args.manifest or "")]

    tot_e = tot_w = 0
    for f in files:
        e, w = lint_file(f, declared.get(os.path.basename(f)), args.strict)
        tot_e += e; tot_w += w

    print(f"\n{'='*54}\nTOTAL: {len(files)} file(s), {tot_e} error(s), {tot_w} warning(s)")
    fail = tot_e > 0 or (args.strict and tot_w > 0)
    print("RESULT:", "FAIL" if fail else "PASS")
    sys.exit(1 if fail else 0)

if __name__ == "__main__":
    main()
