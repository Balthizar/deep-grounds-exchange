"""Safe block extraction. Computes every span FIRST, refuses to proceed if any two overlap,
then writes the module and deletes from the source highest-index-first.

The overlap guard exists because an earlier hand-rolled version silently destroyed a
declaration (ADV_BY_ID) that sat between two blocks whose spans overlapped by three lines."""
import re, sys

def decl_index(lines):
    """Every TOP-LEVEL declaration, including exported and default-exported ones.

    Missing a form here is dangerous, not merely incomplete: a declaration the index cannot
    see is invisible as a BOUNDARY, so the previous declaration's span runs straight through
    it. That is how `export default function App()` once ended up swallowed inside a hook's
    span and carried off into another module."""
    out = []
    pat = re.compile(r'^(?:export\s+default\s+|export\s+)?'
                     r'(?:const|let|var|function|interface|type|class)\s+([A-Za-z_$][\w$]*)')
    for i, l in enumerate(lines):
        m = pat.match(l)
        if m: out.append((i, m.group(1)))
    return out

def adjusted_starts(lines, idx):
    """Every declaration's start, pulled back over its own leading comment block.
    Done for ALL declarations first, so a block's END can be the NEXT block's ADJUSTED
    start - otherwise comment walk-back makes neighbouring spans overlap."""
    out = []
    for k, (i, n) in enumerate(idx):
        prev = idx[k-1][0] if k > 0 else -1
        s = i
        while s-1 > prev and lines[s-1].lstrip().startswith('//'): s -= 1
        out.append(s)
    return out

def span_of(lines, idx, name, starts=None):
    ks = [k for k, (i, n) in enumerate(idx) if n == name]
    if not ks: raise SystemExit(f"NOT FOUND: {name}")
    k = ks[0]
    if starts is None: starts = adjusted_starts(lines, idx)
    begin = starts[k]
    end = starts[k+1] if k+1 < len(idx) else len(lines)
    return begin, end

def extract(path, names, out_path, header, import_from=None):
    lines = open(path, encoding='utf-8').read().split('\n')
    idx = decl_index(lines)
    starts = adjusted_starts(lines, idx)
    spans = {n: span_of(lines, idx, n, starts) for n in names}
    # OVERLAP GUARD
    ordered = sorted(spans.items(), key=lambda kv: kv[1][0])
    for (n1,(a1,b1)), (n2,(a2,b2)) in zip(ordered, ordered[1:]):
        if b1 > a2:
            raise SystemExit(f"REFUSING: spans overlap - {n1} ends {b1}, {n2} starts {a2}")
    # capture text BEFORE any deletion
    chunks = {n: '\n'.join(lines[a:b]).rstrip() for n, (a, b) in spans.items()}
    # EMIT IN SOURCE ORDER. `const` declarations are in a temporal dead zone until executed,
    # so writing them alphabetically (or in whatever order the caller listed them) can put a
    # use before its declaration. Source order is already known-good - preserve it.
    body = header
    for n in sorted(names, key=lambda x: spans[x][0]):
        body += re.sub(r'^(const|function|interface|type) ', r'export \1 ',
                       chunks[n], count=1, flags=re.M) + '\n\n'
    open(out_path, 'w', encoding='utf-8').write(body)
    # delete highest-first so earlier indices stay valid
    for n, (a, b) in sorted(spans.items(), key=lambda kv: -kv[1][0]):
        del lines[a:b]
    open(path, 'w', encoding='utf-8').write('\n'.join(lines))
    return {n: spans[n][1]-spans[n][0] for n in names}
