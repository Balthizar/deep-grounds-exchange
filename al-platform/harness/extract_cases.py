"""Lift a set of reducer cases out of reducerImpl into their own module.

The cases capture `s` (the copy-on-write draft), `action`, and `dropNotice` from the reducer's
closure. Those are passed in explicitly instead, which is the only reason the cases can leave.
Every case in reducerImpl returns, so pulling a group out and delegating before the switch is
behaviour-preserving."""
import re, json, sys

def reducer_span(lines):
    i = next(i for i, l in enumerate(lines) if l.startswith('function reducerImpl'))
    j = next(j for j in range(i+1, len(lines)) if re.match(r'^(const|function|interface|type|let) ', lines[j]))
    return i, j

def case_spans(body):
    cs = [(k, re.match(r'\s*case "([A-Z_]+)"', l).group(1))
          for k, l in enumerate(body) if re.match(r'\s*case "[A-Z_]+"', l)]
    out = []
    for n, (k, name) in enumerate(cs):
        end = cs[n+1][0] if n+1 < len(cs) else len(body)
        out.append((k, end, name))
    return out

def lift(path, names, out_path, fn_name, header):
    lines = open(path, encoding='utf-8').read().split('\n')
    i, j = reducer_span(lines)
    body = lines[i:j]
    spans = [(a, b, n) for a, b, n in case_spans(body) if n in names]
    if not spans: raise SystemExit("no matching cases")
    spans.sort()
    for (a1, b1, n1), (a2, b2, n2) in zip(spans, spans[1:]):
        if b1 > a2: raise SystemExit(f"REFUSING: case spans overlap {n1}/{n2}")
    text = '\n'.join('\n'.join(body[a:b]).rstrip() for a, b, _ in spans)
    mod = (header +
           f'export function {fn_name}(s: any, action: any, dropNotice: (p: any) => void): AppState | undefined {{\n'
           '  switch (action.type) {\n' + text + '\n  }\n'
           '  return undefined;   // not ours\n}\n')
    open(out_path, 'w', encoding='utf-8').write(mod)
    for a, b, _ in sorted(spans, key=lambda x: -x[0]): del body[a:b]
    # delegate just before the switch, after any earlier delegations
    sw = next(k for k, l in enumerate(body) if re.match(r'\s*switch\s*\(', l))
    body[sw:sw] = ['  {', f'    const handled = {fn_name}(s, action, dropNotice);',
                   '    if (handled !== undefined) return handled;', '  }']
    lines[i:j] = body
    open(path, 'w', encoding='utf-8').write('\n'.join(lines))
    return len(spans), sum(b-a for a, b, _ in spans)
