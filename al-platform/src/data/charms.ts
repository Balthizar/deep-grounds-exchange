// ============================================================================
// CHARM APPEARANCES — house content, the Exchange's own. [TABLE]
//
// FRANK'S DESIGN (25 Jul): a charm item gets a look — either the player writes
// one, or the platform assembles one from FOUR d20 tables, "each fragment
// acting as not only a sentence fragment but a descriptive fragment." Four
// slots, twenty entries each: 20^4 = 160,000 appearances from eighty lines.
//
// The grammar contract that makes composition safe:
//   FORM      — a noun phrase with its article ("a slender ring")
//   MATERIAL  — an of-phrase                   ("of hammered copper")
//   MARK      — a participial phrase           ("etched with a spiral of tiny stars")
//   QUIRK     — an adjectival/absolute phrase  ("always faintly warm to the touch")
// Composed:  FORM + " " + MATERIAL + ", " + MARK + " — " + QUIRK + "."
//
// None of this is rules text. The Charm's mechanics live in the DMG; this is
// what the thing LOOKS like on the table when the goat sets it down.
// ============================================================================

export const CHARM_FORMS: readonly string[] = [
  "a slender ring",
  "a coin-sized disc",
  "a knotted loop of cord",
  "a tiny stoppered vial",
  "a smooth river-stone",
  "a braided band",
  "a crescent of shell",
  "a miniature key",
  "a teardrop pendant",
  "a rough-cut bead",
  "a small folded charm",
  "a thin bone whistle",
  "a carved animal no larger than a thumbnail",
  "a small hollow sphere",
  "a flat oval token",
  "a twist of wire",
  "a sliver of mirror in a plain frame",
  "a diminutive bell with no clapper",
  "a linked pair of rings",
  "a pressed flower sealed in resin",
];

export const CHARM_MATERIALS: readonly string[] = [
  "of hammered copper",
  "of pale bone",
  "of sea-worn glass",
  "of tarnished silver",
  "of dark riverwood",
  "of milky quartz",
  "of braided horsehair",
  "of cold iron",
  "of honey-colored amber",
  "of chalk-white clay",
  "of tightly woven reed",
  "of smoky crystal",
  "of beaten tin",
  "of green-veined stone",
  "of lacquered leather",
  "of frost-colored pewter",
  "of old ivory gone golden",
  "of rain-darkened bronze",
  "of translucent horn",
  "of glass with a bubble of air trapped inside",
];

export const CHARM_MARKS: readonly string[] = [
  "etched with a spiral of tiny stars",
  "wrapped in faded scarlet thread",
  "stamped with a worn crescent moon",
  "pricked with a perfect ring of pinholes",
  "carved with letters no sage can place",
  "inlaid with a single fleck of gold",
  "scored by three parallel lines",
  "painted with a fading blue eye",
  "girdled by a hair-fine silver seam",
  "nicked as if once bitten",
  "dotted with seven tiny studs",
  "banded in alternating light and dark",
  "bearing a fingerprint fired into its surface",
  "traced with a river-map of fine cracks",
  "set with a chip of some nameless gem",
  "marked by a scorch it never earned",
  "wound with a single strand of copper",
  "embossed with overlapping feathers",
  "pierced by a hole worn smooth with handling",
  "graven with a knot that has no ends",
];

export const CHARM_QUIRKS: readonly string[] = [
  "always faintly warm to the touch",
  "cool as well-water even by the fire",
  "humming just below hearing when the room is quiet",
  "heavier than it has any right to be",
  "nearly weightless in the palm",
  "smelling faintly of rain on stone",
  "catching lamplight a heartbeat late",
  "refusing to gather dust",
  "ticking softly, twice a minute, like a slow heart",
  "drawn gently toward moonlight",
  "sweating a single bead of dew at dawn",
  "silent in a way that quiets the hand that holds it",
  "flickering at the edge of sight when unwatched",
  "tasting of winter air if kissed",
  "turning to face north when set down",
  "growing briefly cold when a lie is told nearby",
  "glinting with colors the eye cannot keep",
  "thrumming once when its holder's name is spoken",
  "leaving the faint scent of woodsmoke on the skin",
  "warm on one face and cold on the other, always",
];

// One look, four dice. The rng is the caller's — the Observatory hands in its
// seeded week-stream, so the same keep in the same week bestows the same object.
export function composeCharmAppearance(rng: () => number): string {
  const pick = (t: readonly string[]) => t[Math.floor(rng() * t.length)];
  return pick(CHARM_FORMS) + " " + pick(CHARM_MATERIALS) + ", " + pick(CHARM_MARKS) + " \u2014 " + pick(CHARM_QUIRKS) + ".";
}
