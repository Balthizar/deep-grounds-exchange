// ═══════════════════════════════════════════════════════════════════════════════════════════════
// TEST:PEOPLE — ten deliberately improbable people, each asserted only to be COHERENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════
//
// FRANK'S TECHNIQUE, 1 Aug. He asked whether the app could produce "Roger the orcish pastry chef and
// his lizardfolk trans husband who is a guard", and said afterwards that he had designed it as a
// catch-all filter. It found THREE bugs the whole assertion suite had missed:
//
//   * pairing could not leave a room, so no couple spanned two facilities and no defender could marry
//   * a marriage REWROTE the second party's species, turning a lizardfolk sentry into an orc
//   * a marriage read back as "close friend", because Layer 2 arrived after pairUp and nobody returned
//
// WHY IT BEAT THE SUITE. Every assertion in `transitions` checks ONE property in isolation. The
// failure mode this project keeps hitting is different: a table written and never read, a feature
// that never reaches defenders, a label with no word for the case. Those are invisible to isolated
// checks and obvious the moment somebody asks for a SPECIFIC PERSON who can only exist if every
// layer agrees.
//
// So: ten improbable people, each crossing many subsystems, each asserted only as "this person is
// coherent". Cheap to write, and it catches the class of defect that has cost the most time.
//
// A NOTE ON THE ASSERTIONS. They deliberately check COHERENCE rather than values — that a lizardfolk
// stayed a lizardfolk, that a mindless worker has no inner life, that a label exists for the case.
// Pinning values would make this a second copy of the transitions suite and would break every time a
// table is tuned. **What must never break is that the person makes sense.**

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.log("  FAIL  " + msg); } };

// ---- build the same shim the other suites use --------------------------------------------------
// ⚠ RELATIVE PATHS, NOT ABSOLUTE (Frank, 3 Aug). This built an esbuild command by interpolating
// ABSOLUTE paths — and his repo lives at `C:\Users\user\Desktop\Deep Grounds Exchange\al-platform`.
// **Two spaces in the path, and the shell split the command into three broken arguments.**
//
// It never showed here because this container sits at `/home/claude/dge`, which has no spaces —
// **a bug that only exists on the machine that actually runs the project.** `transitions.cjs` uses
// relative paths and has always been fine on Windows; this suite was written later and did not copy
// that, which is the whole of the difference.
const ROOT = path.resolve(__dirname, "..");
const SHIM_REL = "src/__people.tsx";
const BUNDLE_REL = "harness/.people.cjs";
const SHIM = path.join(ROOT, "src", "__people.tsx");
const BUNDLE = path.join(ROOT, "harness", ".people.cjs");
fs.writeFileSync(SHIM, [
  'export { seed } from "./seed";',
  'export { rollPerson, randName, randSpecies, staffFacility, pairUp, pairHousehold, mutuallyDrawn,',
  '         rollAttraction, orientationOf, interspeciesChance } from "./bastion/registry";',
  'export { bondEvent, bondLabel, bondOf, applyBond, driftOf, effectiveProfile, reactionOf, REACTION_TO,',
  '         randDefender, runHouseholdWeek, bastionHousing, resolveBastionOrder } from "./bastion/engine";',
  'export { biologyOf, pairingOf, opennessOf, incongruenceFactor, orientationFactor, traitsOf,',
  '         speciesCanHire, speciesCanHireAt, facilityIsOutdoor, speciesCanDefend, speciesMindless, BOND_DIMS, BOND_LABELS, PROFILE_AXES,',
  '         SPECIES_BY_REGION, SPECIES_BY_LOCALE, CLASS_BY_ROLE, postLean, postMaleShare } from "./data/bastion";',
].join("\n"));
try {
  execSync(`npx --no-install esbuild "${SHIM_REL}" --bundle --format=cjs --outfile="${BUNDLE_REL}" --external:react --external:react-dom --loader:.tsx=tsx --loader:.json=json --jsx=automatic --log-level=error`, { cwd: ROOT, stdio: "pipe" });
} finally { fs.rmSync(SHIM, { force: true }); }
const M = require(BUNDLE);

// ---- helpers -----------------------------------------------------------------------------------
// Build a specific person. The POINT is to construct people the random draw would produce only once
// in thousands of households, and check they hold together when it does.
const person = (species, sexAtBirth, gender, role, age, opts = {}) => {
  const nm = M.randName(species, sexAtBirth);
  const p = M.rollPerson(species, { name: nm.name, sex: sexAtBirth, odd: false }, age, role);
  p.id = "tp" + (person._n = (person._n || 0) + 1);
  p.species = species;
  if (gender) p.gender = gender;
  Object.assign(p, M.rollAttraction(p.gender, species));
  if (opts.drawnTo) p.attracted = opts.drawnTo;
  return p;
};

// A person is COHERENT if nothing about them contradicts anything else about them.
const coherent = (p, label) => {
  ok(!!p.name && p.name.indexOf("{") === -1, `${label}: has a real name`);
  ok(!!p.species, `${label}: knows what they are`);
  ok(typeof p.age === "number" && p.age > 0, `${label}: has an age`);
  const bio = M.biologyOf(p.species);
  ok(p.age <= bio.lifespan, `${label}: is not older than their people live (${p.age} of ${bio.lifespan})`);
  if (p.mindless) {
    ok(!p.profile && (p.traits || []).length === 0 && !p.faith,
       `${label}: a mindless worker has no inner life at all`);
  } else {
    ok(!!p.profile && M.PROFILE_AXES.every((a) => typeof p.profile[a] === "number"), `${label}: has a whole profile`);
    ok(Array.isArray(p.traits), `${label}: has derived traits`);
    ok(!!p.attracted && typeof p.libido === "number", `${label}: has attraction weights`);
    ok(M.orientationOf(p) !== "unknown", `${label}: an orientation can be read from them`);
    ok(!!p.socialClass, `${label}: has a place in the household`);
  }
  ok(p.marital !== "married" || !!p.spouseId, `${label}: is only married if there is somebody to be married TO`);
};

const married = (a, b, label) => {
  const was = { sp: b.species, age: b.age, faith: b.faith, name: b.name.split(" ")[0] };
  const done = M.pairUp(a, b);
  ok(done, `${label}: the marriage happens`);
  if (!done) return;
  ok(b.species === was.sp, `${label}: and does not rewrite what the spouse IS`);
  ok(b.age === was.age, `${label}: nor their age`);
  ok(b.faith === was.faith, `${label}: nor their god`);
  ok(b.name.split(" ")[0] === was.name, `${label}: nor their given name`);
  ok(a.spouseId === b.id && b.spouseId === a.id, `${label}: both sides point at each other`);
  ok(M.bondLabel(a, b) === "spouse", `${label}: and the bond reads as a marriage, not a friendship`);
};

console.log("TEN IMPROBABLE PEOPLE\n");

// ── 1 ── Frank's own. Orc in a household post, lizardfolk trans guard, same-gender, cross-facility.
{
  const cook = person("Orc", "m", "man", "Cook", 34, { drawnTo: { man: 85, woman: 20, nonbinary: 0 } });
  const guard = person("Lizardfolk", "f", "man", "Sentry", 41, { drawnTo: { man: 80, woman: 15, nonbinary: 0 } });
  coherent(cook, "1 orc cook");
  coherent(guard, "1 lizardfolk trans guard");
  ok(M.postLean("Orc", "Cook") > 0, "1: an orc can be a cook at all — the lean is never a gate");
  ok(M.speciesCanDefend("Lizardfolk"), "1: a lizardfolk can hold a wall");
  ok(M.incongruenceFactor("Lizardfolk") > M.incongruenceFactor("Human"),
     "1: a barely-dimorphic people has MORE gender incongruence than humans, so this person is likelier here than elsewhere");
  married(cook, guard, "1");
  console.log(`  1  ${cook.name} (Orc cook) + ${guard.name} (Lizardfolk sentry, trans) — ${M.bondLabel(cook, guard)}`);
}

// ── 2 ── A 480-year-old elf scullion. Crosses lifespan, post lean AGAINST the grain, and social class.
{
  const p = person("Elf", "f", "woman", "Scullion", 480);
  coherent(p, "2 ancient elf scullion");
  ok(p.age > M.biologyOf("Human").lifespan * 4, "2: is older than five human lifetimes");
  ok(M.CLASS_BY_ROLE.Scullion === "labouring", "2: and is labouring class, because the POST decides that and not the years");
  ok((p.traits || []).includes("old-hand"), "2: reads as an old hand");
  console.log(`  2  ${p.name} — Elf, ${p.age}, Scullion, ${p.socialClass} — ${(p.traits || []).slice(0, 3).join(", ")}`);
}

// ── 3 ── An ogre archivist. The most extreme post lean in the table, in the letters.
{
  const p = person("Ogre", "m", "man", "Archivist", 40);
  coherent(p, "3 ogre archivist");
  ok(M.postLean("Ogre", "Archivist") < 0.5, "3: an ogre leans hard AWAY from the letters");
  ok(M.postLean("Ogre", "Archivist") > 0, "3: and is still not barred from them");
  // ⚠ WAS `speciesCanHire("Ogre")` unqualified. An ogre is LARGE — the same test that keeps a troll
  // and a minotaur out of a workroom. I had let it through because it SEEMED biddable, which is
  // temperament admitting somebody the body excludes: the same error as temperament excluding
  // somebody the body admits. Its own voice says so — "ducks constantly", "apologises for doorways".
  ok(M.speciesCanHireAt("Ogre", "courtyard") && !M.speciesCanHireAt("Ogre", "kitchen"),
     "3: an ogre works the yard, and apologises to every doorway it does not fit");
  console.log(`  3  ${p.name} — Ogre, ${p.age}, Archivist (lean x${M.postLean("Ogre", "Archivist")})`);
}

// ── 4 ── A married pair of minotaurs. The LOWEST pairing multiplier that is not zero.
{
  const a = person("Minotaur", "m", "man", "Sergeant", 30, { drawnTo: { man: 10, woman: 85, nonbinary: 0 } });
  const b = person("Minotaur", "f", "woman", "Striker", 28, { drawnTo: { man: 85, woman: 10, nonbinary: 0 } });
  coherent(a, "4 minotaur sergeant"); coherent(b, "4 minotaur striker");
  ok(M.pairingOf("Minotaur").kind === "herd", "4: minotaurs are a herd people");
  ok(M.pairingOf("Minotaur").couples < 0.6, "4: so a married pair is genuinely unusual");
  ok(M.pairingOf("Minotaur").couples > 0, "4: and not impossible");
  // ⚠ WAS `!speciesCanHire("Minotaur")` — "holds a wall and not a ledger", which is the reflex Frank
  // named: a claim about what a minotaur IS. It has hands and enormous strength; what it does not
  // have is a frame that fits a corridor. So: the YARD, not nowhere.
  ok(M.speciesCanHireAt("Minotaur", "courtyard") && !M.speciesCanHireAt("Minotaur", "kitchen")
     && M.speciesCanDefend("Minotaur"),
     "4: a minotaur works the yard and holds a wall, and fits no doorway in between");
  married(a, b, "4");
  console.log(`  4  ${a.name} + ${b.name} — two Minotaurs married (herd people, x${M.pairingOf("Minotaur").couples})`);
}

// ── 5 ── An imp clerk in Avernus, hired where 45% of the population cannot work at all.
{
  const p = person("Imp", "m", "man", "Scribe", 22);
  coherent(p, "5 imp scribe");
  ok(M.speciesCanHire("Imp"), "5: an imp can keep a ledger — small, literate, constitutionally nosy");
  ok(!M.speciesCanHire("Lemure"), "5: while most of what lives around them cannot");
  const pool = M.SPECIES_BY_LOCALE.avernus.warcamp;
  ok((pool.Lemure || 0) > 40, "5: and lemures really are most of that place");
  console.log(`  5  ${p.name} — Imp, ${p.age}, Scribe in a war camp that is ${pool.Lemure}% lemures`);
}

// ── 6 ── A drow and a svirfneblin married, in the Underdark. Two peoples who should not.
{
  const a = person("Drow", "f", "woman", "Librarian", 190, { drawnTo: { man: 85, woman: 20, nonbinary: 0 } });
  const b = person("Svirfneblin", "m", "man", "Porter", 120, { drawnTo: { man: 15, woman: 85, nonbinary: 0 } });
  coherent(a, "6 drow librarian"); coherent(b, "6 svirfneblin porter");
  married(a, b, "6");
  ok(a.species !== b.species, "6: a cross-species couple keeps both peoples");
  ok(a.name.split(" ").slice(1).join(" ") !== b.name.split(" ").slice(1).join(" "),
     "6: and both surnames, because a shared one would be a lie");
  ok(M.interspeciesChance("underdark") > M.interspeciesChance("cormyr"),
     "6: and the Underdark pairs across peoples more than Cormyr does, which is a fact about the place");
  console.log(`  6  ${a.name} (Drow) + ${b.name} (Svirfneblin) — ${M.bondLabel(a, b)}, both names kept`);
}

// ── 7 ── A thri-kreen in the Feywild. Hive pairing, insectoid, in the most fey place there is.
{
  const p = person("Thri-kreen", "m", "man", "Artisan", 20);
  coherent(p, "7 thri-kreen artisan");
  // ⚠ WAS `kind === "hive"`. The sources say outright that **thri-kreen are NOT a hive-minded
  // species** — they have a collective racial memory and a pack instinct, and they are individuals.
  // Found because Frank asked whether they resembled the Antinium, which genuinely are hive-minded.
  ok(M.pairingOf("Thri-kreen").kind === "pack", "7: a clutch-mate is not a spouse, and a pack is not a hive");
  ok(M.biologyOf("Thri-kreen").lifespan < 40, "7: and thirty years is a short life");
  ok(p.age < M.biologyOf("Thri-kreen").lifespan, "7: so twenty is most of it");
  ok(M.orientationFactor("Thri-kreen") < 1, "7: a short life narrows the orientation spread");
  console.log(`  7  ${p.name} — Thri-kreen, ${p.age} of a ${M.biologyOf("Thri-kreen").lifespan}-year life, Artisan`);
}

// ── 8 ── A nonbinary astral elf stargazer, 600 years old, in Wildspace.
{
  const p = person("Astral Elf", "f", "nonbinary", "Stargazer", 600);
  coherent(p, "8 astral elf stargazer");
  ok(p.gender === "nonbinary", "8: is nonbinary");
  ok(M.incongruenceFactor("Astral Elf") > 1, "8: which their people see more of than humans do");
  ok(M.orientationFactor("Astral Elf") > 1.5, "8: and nine centuries widen the orientation spread furthest of anybody");
  ok(M.orientationOf(p) !== "unknown", "8: and an orientation still reads cleanly for a nonbinary person");
  console.log(`  8  ${p.name} — Astral Elf, ${p.age}, nonbinary, Stargazer — ${M.orientationOf(p)}`);
}

// ── 9 ── An autognome in a kitchen. Mindless-adjacent, construct, zero pairing.
{
  const p = person("Autognome", "m", "man", "Potboy", 40);
  coherent(p, "9 autognome potboy");
  ok(M.pairingOf("Autognome").couples === 0, "9: a construct does not marry");
  ok(M.pairUp(p, person("Human", "f", "woman", "Cook", 30)) === false || !p.spouseId,
     "9: and cannot be married to");
  ok(!M.speciesMindless("Autognome"), "9: but is NOT mindless — it thinks, it has opinions, it keeps them");
  ok(!!p.profile, "9: so it has a profile like anybody else");
  console.log(`  9  ${p.name} — Autognome, Potboy — thinking, unmarriageable`);
}

// ── 10 ── The whole thing at once: a household in Avernus, staffed and garrisoned, one turn.
{
  const s = M.seed();
  const ch = Object.values(s.characters).find((c) => c.bastion && c.bastion.facilities);
  const b = ch.bastion; b.facilities.length = 0; b.defenders = []; ch.level = 13;
  b.region = "avernus"; b.locale = "warcamp";
  for (const [id, size] of [["kitchen", "roomy"], ["smithy", "roomy"], ["barrack", "roomy"], ["bedroom", "roomy"]]) {
    const f = { id: "tp_" + id, defId: id, size, henchmen: [], furnishings: [] };
    b.facilities.push(f);
    try { M.staffFacility(s, f, undefined, b.region, b.locale); } catch (e) { /* shape varies */ }
  }
  M.resolveBastionOrder(s, ch, { n: 1, date: "2026-08-01", benefits: [], mintables: [], resolved: true }, { facId: "tp_barrack", orderId: "recruit" }, null);
  M.pairHousehold(b);
  const all = [...b.facilities.flatMap((f) => f.henchmen || []), ...(b.defenders || [])];
  ok(all.length > 4, `10: a keep in Hell staffs itself — ${all.length} people`);
  all.forEach((h, i) => { if (i < 3) coherent(h, `10 person ${i + 1}`); });
  // NOBODY UNEMPLOYABLE HOLDS A POST. This is the check that would have caught lemures in the kitchen.
  const badHire = b.facilities.flatMap((f) => f.henchmen || []).filter((h) => !M.speciesCanHire(h.species));
  ok(badHire.length === 0, `10: nobody who cannot hold a post is holding one${badHire.length ? " — " + badHire[0].species : ""}`);
  const badWall = (b.defenders || []).filter((d) => !M.speciesCanDefend(d.species));
  ok(badWall.length === 0, `10: nor anybody who cannot hold a wall${badWall.length ? " — " + badWall[0].species : ""}`);
  // Run a week and check nothing malformed comes out of the most alien place in the app.
  let lines = 0, bad = 0;
  for (let n = 2; n < 8; n++) {
    b.id = "tenpeople" + n;
    const t = { n, date: "2026-08-01", benefits: [], away: true, orders: [], events: ["All Is Well"], resolved: true };
    M.runHouseholdWeek(s, ch, t);
    (t.household || []).forEach((d) => [...d.morning, ...d.chores].forEach((l) => { lines++; if (/\{|undefined|NaN|  /.test(l)) bad++; }));
  }
  ok(bad === 0, `10: six weeks in Avernus produce no malformed line — ${lines} lines, ${bad} bad`);
  console.log(`  10 a keep in Avernus: ${all.length} people, ${lines} lines of week, ${bad} malformed`);
}

fs.rmSync(BUNDLE, { force: true });
console.log("");
if (fails) { console.log(`PEOPLE: ${fails} of ${checks} checks FAILED`); process.exit(1); }
console.log(`PEOPLE: all ${checks} checks passed — ten improbable people, each coherent`);
