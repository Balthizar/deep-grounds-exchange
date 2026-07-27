
// FNV-1a string hash. Pure, dependency-free - the seeded RNG and the blob store both use it.
// Uniform record: every henchman carries THREE distinct trait tags and a (possibly empty) bonds ledger.
// New hires roll three distinct (randHench); anyone already in state gets topped up DETERMINISTICALLY
// from their id — so a reload never reshuffles who they are, and a hand-authored trait is kept, not lost.
export const strHash = (s) => { let h = 0; const str = String(s); for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return h; };
// ============================================================================
// Shared primitives. Deliberately dependency-free so BOTH app.tsx and the bastion
// modules can import them without an import cycle - the thing that makes a split
// like this go wrong is two modules needing each other at load time.
// ============================================================================

export const pick = (a) => a[Math.floor(Math.random() * a.length)];

export const pickN = (arr, n) => { const a = [...arr]; const out: any[] = []; for (let i = 0; i < n && a.length; i++) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]); return out; };


// ---------------------------------------------------------------------------------------------
// OVERLAY DRAFT SUPPORT (Phase 1c). My reducer's object-map collections are copy-on-write
// overlays: an immutable base plus a small override layer. I keep these in util.ts — my
// dependency-free anti-cycle layer — because both app.tsx (which builds my drafts) and my
// feature packages (which sometimes need raw, no-clone iteration) touch them.
export const OVERLAY = Symbol.for("dg.overlay");
export const TOUCHED = Symbol.for("dg.touched");   // my draft -> which top-level collections an action drafted; a symbol so JSON and equality never see it
const DEAD_ = Symbol.for("dg.dead");
export const isDead = (v: any) => v === DEAD_;
export const DEAD = DEAD_;

// I iterate a collection WITHOUT triggering my draft's clone-on-read. For read-only passes
// (my bastion due-scan, my push sweep's prepass) where cloning every record I read would
// re-create the very cost the overlay removed. This yields LIVE records — future me: you do
// not mutate what comes out of here. Read it, count it, put it down.
export function* rawEntries(coll: any): Generator<[string, any]> {
  if (!coll) return;
  const meta = coll[OVERLAY];
  if (!meta) {
    if (Array.isArray(coll)) { for (let i = 0; i < coll.length; i++) yield [String(i), coll[i]]; return; }
    for (const k of Object.keys(coll)) yield [k, coll[k]]; return;
  }
  if (meta.arr) { const a = meta.arr; for (let i = 0; i < a.length; i++) yield [String(i), a[i]]; return; }
  const { base, over } = meta;
  for (const k of Object.keys(base)) {
    const v = Object.prototype.hasOwnProperty.call(over, k) ? over[k] : base[k];
    if (!isDead(v)) yield [k, v];
  }
  for (const k of Object.keys(over)) {
    if (!Object.prototype.hasOwnProperty.call(base, k) && !isDead(over[k])) yield [k, over[k]];
  }
}
// Local calendar date, YYYY-MM-DD. My ledger's dates are evidence; toISOString() is the UTC
// day, which stamped every evening session in the Americas with tomorrow. [FINDINGS: BUG-2]
export function localDate(ts: number): string {
  const d = new Date(ts);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
export function todayLocal(): string {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
