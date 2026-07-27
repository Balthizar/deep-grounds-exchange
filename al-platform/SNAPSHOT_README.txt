FULL SNAPSHOT — the complete project as it stands. Not a delta.
Verified before packing: tsc 0 errors · vite build clean · jsdom render OK (102,352 chars).

=========================================================================
READ THIS FIRST: I AM NOT A BACKUP.
My working container can be reset between sessions. If that happens, anything
that exists only there is gone. THIS ZIP is the durable copy. Download it,
and keep it somewhere your computer syncs.
=========================================================================

HOW TO USE IT
  This REPLACES your al-platform folder wholesale - it is not a patch.
  1. Rename your current al-platform folder (e.g. al-platform-old) - don't delete it yet.
  2. Unzip this in its place.
  3. cd al-platform
  4. npm install          (node_modules is not in the zip - it regenerates)
  5. npm run dev
  If anything looks wrong, your old folder is still sitting right there.

WHAT'S IN HERE (everything from our sessions, in one consistent state)

  THE VITE PROJECT
    package.json, vite.config.ts, tsconfig*.json, index.html, public/
    src/main.tsx            mounts App (no StrictMode - the reducer mutates and returns state)
    src/app.tsx              ~900 lines (was 18,143 when the split started); Phase 1c overlay draft lives here
  src/lib/util.ts         dependency-free primitives (pick, pickN) that BOTH app.tsx and the
                          bastion modules import - the anti-cycle layer
    src/styles.ts           752 lines - the CSS, first module extracted
    src/types.ts            401 lines - all domain shapes + every action type

  DECOMPOSED DATA
    srd-source/             SOURCE OF TRUTH: spells, equipment, magic items, monsters, _ids
    scripts/gen-srd.mjs     composes spells + all mundane gear, applies the AL legality layer
    scripts/gen-magic-tables.mjs  one-shot authoring aid (provenance only; see its header)
    src/data/srd/           GENERATED - do not hand-edit (spells, mundane_gear, _excluded)
    src/data/catalog.ts     the curated 32-item catalog (hand-authored, NOT generated)
    src/data/magic_tables.ts  Implements/Armaments/Arcana/Relics - SRD rows + typed slots
    src/data/events.ts      EVENT_CAST + FESTIVAL_FEATURES (1,113 lines of authored data)
    src/data/adventures.ts  ADVENTURES + ADVENTURE_TAGS + ADV_BY_ID (520 lines)
    src/data/bastion.ts     38 pure bastion data blocks - the facilities catalogue, orders,
                            events, flavour, regions, forms (636 lines)

  DOCUMENTS
    SRD_AL_SWEEP.md         the AL legality audit, every rule quoted and cited
    MAGIC_TABLES_REVIEW.md  all 20 tiers row by row, for your table-by-table pass

  FEATURES BUILT (all tested through the reducer, not just compiled)
    * SRD spells + mundane gear composed from source, cited, AL-filtered
    * hybrid magic tables: concrete SRD rows + medium-granularity player-filled slots
    * player-entered items: rolled bastion slots, character import, paper/certificate claims
    * DM-authored adventure items (certified self-certifies; provisional -> their mentor)
    * DM verification queue, scoped by store AND organisation
    * organisation membership + reporting (orgMembership -> counts by role)
    * character import UI: "new or existing?" fork -> import form -> looping item entry
    * certificates land on PLAYER_SHELF as EVENT_CERT; ASSIGN_CERT / GIFT_CERT work on them

REDUCER - FULLY SEGMENTED
  reducerImpl went 2,736 -> 163 lines. It now builds the copy-on-write draft state and
  delegates; all 182 cases live in per-domain modules:
      bastion/actions.ts     26 cases   reducer/items.ts       43 cases
      reducer/play.ts        55 cases   reducer/characters.ts  20 cases
      reducer/org.ts         28 cases   reducer/social.ts      10 cases
  Each exports fn(s, action, dropNotice) -> next state, or undefined for "not mine".
  Shared constraint modules sit below both the reducer and the UI:
      lib/rules.ts   item/permission rules   lib/play.ts   session & DM-standing rules
      lib/core.ts    accounts, item construction, provenance, dice
      lib/util.ts    dependency-free primitives (the anti-cycle layer)

  A REGRESSION THIS CAUGHT, worth knowing about: buildKnownActions() discovers valid action
  names by reading reducerImpl.toString() and regex-scanning for `case "X":`. Moving the cases
  out left it finding almost nothing, so its own size guard returned null and UNKNOWN ACTIONS
  STOPPED BEING REJECTED - the exact silent failure the default clause exists to prevent. It
  now scans every delegate. harness/behaviour.cjs tests this so it cannot regress quietly.

SHARED-UI SEAM ESTABLISHED - every remaining section is now independently extractable
  src/lib/ui.tsx grew from 5 primitives to the full shared set (~950 lines): the small chips
  (StoreChip, OrgLogo, Seal, ProvBadge, StatRow, tierLabel) plus the genuinely cross-cutting
  components - CharacterCard (roster + retirement screens), ItemEntryModal (bastion slots,
  character import, outside-table claims) and ScrollPicker - with their private helpers.

  RESULT: each of the ten remaining sections now has ZERO shared dependencies (one has 1):
      SessionsView 381   DMDeskView 324   AdminView 301   MarketView 274
      OrganizationView 249   MessagesView 229   ProfileView 180   RetirementView 169
      ResourcesView 149   CommunityView 122
  They can be extracted in ANY order, one at a time, with the harness green after each.

  Three things had to move DOWN to keep the layering honest, and all three were misplaced:
    bastionEligible  (ch) => ch.level >= 5  - a character rule, not bastion machinery
    earnedRegions    reads the character's approved log - adventure/character data
    REGION_TAGS      pure data, was sitting in bastion/ui
  Rule of thumb this illustrates: if lib/ needs something from a feature package, the thing
  is usually in the wrong package - not a reason to import upward.


WHERE THE THINKING IS WRITTEN DOWN
  IDEAS.md              features discussed but not built: the dungeon/map generator for the
                        writers' tab (with the copyright trap spelled out), player contacts
                        + "where are my people playing?" (and the friends NAMING COLLISION -
                        `friends` already means in-fiction NPC friends on a character), and
                        the Resources -> Authors' Desk rename.
  OPEN_QUESTIONS.md     decided-but-not-built, built-but-not-wired, and awaiting-your-ruling.
                        Includes the treasure roller (works, nothing triggers it), the short
                        common tier, ammo weights, missing player registration, and the five
                        AL enforcement checks that are app logic rather than data.
  SRD_AL_SWEEP.md       the AL legality audit, every rule quoted and cited to a line.
  MAGIC_TABLES_REVIEW.md  all 20 tiers row by row, with before/after category mixes.
  PERFORMANCE.md        what was measured, what was actually slow, and the TRIGGERS for the
                        optimisations deliberately not done yet.

FEATURE PACKAGES - eight, each owning its own screens AND modals
  src/bastion/   registry.ts  engine.ts  actions.ts  ui.tsx     the keep, end to end
  src/player/    ui.tsx       the roster: profile page + retirement screen
  src/market/    ui.tsx       listings, matching, trades in flight
  src/sessions/  ui.tsx       scheduling, the DM desk, logsheet review, verification queue
  src/org/       ui.tsx       the organisation page, community view, org/store/module modals
  src/admin/     ui.tsx       the guildmaster's desk: accounts under review, certification,
                              mentor searches, store requests, Warhorn import
  src/social/    ui.tsx       messages, threads, trade proposals, the notification inbox
  src/authors/   ui.tsx       the writers' tools (tab still labelled "Resources" - rename
                              when you settle on Authors' Desk / Writers' Room; the package
                              boundary is already right, and IDEAS.md points the dungeon
                              generator here)
  src/seed.ts                 the demo state. NOT in data/ - the files there are pure
                              literals, while this COMPOSES state with mkItem and the
                              registries, so it sits above the feature packages.

  ONE intentional cross-feature import remains, documented at its source: player/ui renders
  BastionRegionLine, because the profile page shows a character's bastion region. That is a
  real feature relationship, not a misplacement. Everything else two packages share is in lib/.

  app.tsx is now ~1,000 lines: the shell, tab routing, the reducer shell that delegates to the
  six domain modules, the Modal ROUTER (a switch over modal.kind - it renders every feature's
  modals, so it belongs to the shell, not to lib/), and KNOWN_ACTIONS.
  Each package now holds its MODALS too - session/logsheet modals with sessions, character
  and pregen modals with player, listing and wish modals with market, and so on.
  Zero cross-feature imports: no package reaches sideways into another. Anything two
  features both need lives in lib/.

UI SEPARATED BY FEATURE
  src/lib/ui.tsx        shared presentational primitives (Empty, SectionHead, RARITY,
                        Avatar, getBlob, activeListings) - below every feature package
  src/bastion/ui.tsx    the keep's screens (~1,240 lines): BastionWorkspace, FacilityDetail,
                        Build/Furnishing/Ruin modals, region + alerts, and their private
                        helpers. Completes the bastion package:
                            registry.ts  what a facility IS
                            engine.ts    how a keep BEHAVES
                            actions.ts   the reducer cases
                            ui.tsx       what the player SEES
  The blob store (BLOBS/putBlob/sweepBlobs/blobHash) moved from bastion/engine to lib/core -
  it is generic image storage, not bastion logic, and lib/ui needed it.

LAYERING - now clean and checkable
      types  <  data  <  lib  <  bastion  <  reducer  <  app.tsx
  Every import points DOWN the stack. Zero inversions, zero import cycles.
  Fixed in this pass:
    * isAdmin was living in bastion/engine - a general permission check in a feature module,
      which forced lib/rules to import UPWARD. Moved to lib/rules; 7 importers repointed.
    * lib/play imported 9 names from bastion/engine and used ONE. The other 8 were dead
      imports left by earlier extractions. Removed.
    * lib/play and lib/rules imported each other (orgRec / isAdmin) - a genuine cycle. It was
      harmless in practice (both uses sit inside function bodies, so they resolve at call
      time) but it is exactly the hazard lib/util was created to avoid. orgRec moved down to
      lib/core, which neither imports. Cycle gone.

  A TOOL BUG WORTH KNOWING: harness/extract.py indexed only bare `const`/`function`, so
  `export default function App()` was invisible AS A BOUNDARY - the previous declaration's
  span ran straight through it and carried the whole App component into another module.
  decl_index now matches export / export default / let / var / class. Every extraction before
  this fix was lucky rather than safe.

VERIFICATION HARNESS (new - use it before and after every refactor)
    harness/fingerprint.sh <out.json>     capture the app's RUNTIME behaviour: every registry,
                                          every dataset, the seeded RNG sequence, the whole
                                          seed state. Compares VALUES, never source text.
    node harness/compare.mjs <a> <b>      deep-compare two fingerprints; non-zero exit on any
                                          difference.
    node harness/behaviour.cjs            BEHAVIOURAL gate: dispatches a real action through
                                          every delegated domain, and checks the unknown-action
                                          guard still fires. The fingerprint compares DATA and
                                          would not have caught the regression above.
    harness/extract.py                    safe block extraction. Computes all spans first and
                                          REFUSES to run if any two overlap.
  The harness was tested against a deliberate 3-character corruption of a data value and caught
  it; a comment-only change correctly reports identical. The extractor's overlap guard fired on
  its first real use, on exactly the pattern that previously destroyed ADV_BY_ID.

REGENERATING THE COMPOSED DATA (optional - already current in this zip)
    node scripts/gen-srd.mjs
    node scripts/gen-magic-tables.mjs

CATALOG SAFETY PASS - DONE (this snapshot)
  Every read of a catalogue row off an ITEM now goes through itemCat(), which returns the
  catalogue row when there is one and the item's OWN facts when there isn't. 60 call sites
  rewritten; zero unguarded reads remain.
  This does more than stop the crash: player-entered items now DISPLAY correctly, because
  their name / category / rarity live on the instance and itemCat() finds them there.
  Verified: normal catalogue items resolve to the IDENTICAL object (no behaviour change);
  an imported item resolves its own name/category; ASSIGN_CERT (the path that actually threw)
  completes; equipping and attuning an imported item works.

BASTION REGISTRY - DONE (895 lines)
  src/bastion/registry.ts now owns, as one self-contained unit:
    * the MUTABLE registries (FACILITY_ROLES, FURNISHING_LADDER, FACILITY_RUIN, ...)
    * registerFacility + every facility spec that calls it
    * every function that reads those registries (staffFacility, furnishFacility,
      furnishingValue, ruinFacilityFlavor, restockFacilitySlots, hirelingLossReason, ...)
    * facEstablishment / furnishingName / furnTierIndex - these LOOK like general helpers
      but read the registries, so they belong here, not in lib/
    * henchman name/role/trait tables and the illness tables the staffing code needs
  The dependency graph is one-way and cycle-free:
      lib/util.ts + data/*  <-  bastion/registry.ts  <-  app.tsx
  The module needs NOTHING from app.tsx. app.tsx imports 19 names back from it.
  ZERO external writes into the registries remain (a stray Object.assign in app.tsx that
  reached into FURNISHING_WEIGHT was moved in, completing the encapsulation).

  ONE KNOWN, VERIFIED-BENIGN DIFFERENCE: FURNISHING_WEIGHT's key INSERTION ORDER changed
  (same 14 keys, same values, 159 chars either way) because registerFacility's calls now run
  in a slightly different sequence. Checked every use: it is only ever read as
  FURNISHING_WEIGHT[slot] and never iterated, so order cannot affect behaviour.

KNOWN OUTSTANDING WORK
  * CORRECTION: I had repeatedly said NOTICE_VIEW was ~4,700 lines and the biggest thing left.
    That was wrong - it is 124 lines. A bracket matcher fooled by the file's content produced
    the figure and I quoted it for several turns without re-checking. Re-measured properly, the
    real sizes are: reducerImpl 2,736 · registerFacility+specs 573 · BastionWorkspace 436 ·
    the view components 170-250 each. The remaining big win is the REDUCER, not a data table.
  * No player registration / account creation flow yet.
  * The slot chain is now complete in the UI: an unfilled slot shows on the character card
    ("An item you haven't claimed yet" -> Fill it in) and opens the item form in slot mode,
    which shows what the roll OWED alongside what they enter.
  * BUT nothing calls rollMagicItem() yet. The random-roll path has no trigger because the
    facility that used it (trophy room) was one of the placeholders removed earlier. Deciding
    WHICH order or event rolls for treasure is a design call - once made, it is a one-line wire.
