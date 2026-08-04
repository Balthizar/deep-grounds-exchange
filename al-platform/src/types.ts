// ============================================================================
// SHAPES — my domain types for the whole app. I extracted these out of app.tsx.
// ============================================================================

/* ================================================================================================
   THE SHAPES
   ================================================================================================
   These exist for ONE reason and it is worth being honest about which: NOT to catch bugs. Of the
   ~20 real bugs found in the last two days, types would have caught six, and all six were caught in
   seconds by running the code anyway. None of the fourteen that mattered: `pendingEvent` doing two
   jobs is perfectly typed; `days` meaning both an AL cost and a countdown is `number` either way;
   base64 pixels in state are a `string`; a Proxy that resurrected deleted items is `object` all the
   way down.

   They exist because 415 of tsc's 520 errors are `Object.values(state.items)` and
   `Object.values(state.characters)` arriving as `unknown` and every downstream `.filter(x => x.id)`
   inheriting it. That is not type safety, it is a compiler that has been told nothing. Two
   interfaces and the file can actually be checked — which is the precondition for the thing that
   DOES pay: a typed action union, so a misspelled dispatch cannot compile.

   NB THE FILE WAS NEVER COMPILED AS TYPESCRIPT UNTIL TODAY. Every build ran
   `esbuild --loader:.tsx=jsx`, which parses a .tsx file as plain JSX and ignores the type system
   entirely. esbuild reads .tsx as TypeScript by default; the flag actively disabled it. So none of
   this was possible and nobody knew, for a week, in a file named .tsx.

   DERIVED FROM THE SEED, not invented — every field below was read off the real objects, and `?`
   means the seed actually varies. `[k: string]: any` on the records is deliberate and temporary: it
   admits that these shapes are still growing, and it makes the interfaces useful today instead of a
   two-day rewrite that stops the bastion work. Tighten them when the domain stops moving.
   ============================================================================================== */

export interface Holder { type: string; id: string; }
export interface ItemRecord {
  id: string; catalogId: string; itemClass: string; holder: Holder;
  available: boolean; attuned: boolean; equipped: boolean; escrow: boolean;
  campaign: string | null; history: any[]; lineage: any[]; origin: any; provenance: any;
  shelvedFrom?: string;
  [k: string]: any;
}
export interface CharacterRecord {
  id: string; name: string; ownerId: string; race: string; cls: string;
  /** The subclass, where the player has chosen one. Optional: a character below 3rd level does not
   *  have one, and the roster predates the field. Frank, 2 Aug: *"we need to know what pact a
   *  warlock has"* — the subclass is where a CHOSEN HIRE entitlement lives, and a Fiend pact and an
   *  Archfey pact are the same class calling completely different things. */
  subclass?: string;
  level: number; tier: number; faction: string; campaign: string; ddb: string;
  dt: number; wishlist: any[];
  // WORK IN PROGRESS at the workbench (31 Jul). PH ch.6 "Crafting Equipment" prices a Heavy Crossbow
  // at 5 days and Plate Armor at 150; a character rarely holds that many downtime days at once, so
  // long work has to SPAN turns rather than be refused. One at a time: the PH's own Bastion analogue
  // says the facility "can't be used to craft anything else" while work is on the bench, and the same
  // logic holds for a pair of hands. `kind` distinguishes the two doors that share this record.
  wip?: { kind: "item" | "scroll"; catalogId?: string; spellId?: string; spellName?: string;
          label: string; daysNeeded: number; daysDone: number; gpPaid: number; startedAt: string } | null;
  gp?: number; status?: string; licensed?: boolean; shared?: boolean;
  lifestyle?: string; credits?: any[]; epitaph?: string; favors?: any[]; friends?: any[];
  gifts?: any[]; retireTale?: any[]; pregen?: boolean; pregenOwner?: string;
  bastion?: Bastion;
  [k: string]: any;
}

/* ------------------------------------------------------------------------------------------------
   THE BASTION DOMAIN — the shapes the reducer builds and mutates every week.
   Load-bearing fields are pinned; everything incidental rides the [k: string]: any escape hatch,
   the same convention CharacterRecord/ItemRecord use. The point is not to enumerate every field —
   it is to make the state whose corruption actually costs something (a room's working/building
   status, a turn's resolution, an order's target, a hireling's identity) impossible to construct
   malformed. See stateViolations() for the runtime counterpart these types shadow at compile time.
   ------------------------------------------------------------------------------------------------ */
// A named member of a facility's household. Once I name it, it can be lost, argued with, and
// written into crafting provenance — which is exactly why it's a person, not a capacity token.
export interface Hireling {
  id?: string; name: string; role: string;
  traits: string[]; bonds: any[];
  note?: string;
  [k: string]: any;
}
// Construction in flight. Discriminated on `what`: a build has no target, a rebuild names the new
// defId, an enlarge names the new size. readyAt is the wall-clock the derived calendar reads.
export type ConstructionJob =
  | { what: "build";   days: number; issuedAt: number; readyAt: number }
  | { what: "rebuild"; days: number; issuedAt: number; readyAt: number; toDefId: string }
  | { what: "enlarge"; days: number; issuedAt: number; readyAt: number; toSize: string };
// One order line issued to one facility for one week.
export interface BastionOrder {
  facId: string; orderId: string; detail: string; gp: number;
  outId: string | null; craftItem: any | null;
  pickId?: string | null;   // the catalogue row chosen for a mundane tool-craft (31 Jul)
  [k: string]: any;
}
// A single Bastion week. `resolved` is the field two-unresolved-turns invariants hang off; `orders`
// is empty on a Maintain week. Narrative fields (flavor, household, eventFlavor) ride the hatch.
export interface BastionTurn {
  n: number; date: string; dtSpent: number;
  issuedAt: number; readyAt: number; resolved: boolean;
  maintain?: boolean; away?: boolean;
  event: string | null; daysOwed?: number;
  orders: BastionOrder[]; benefits: any[];
  [k: string]: any;
}
// A room. `working` holds the turn number it is busy for (null = free); `building` holds the job
// raising/reshaping it (null/absent = built). Those two are the fields the impossible-state
// invariants police — a room cannot be both, and a resolved turn must free it.
export interface Facility {
  id: string; defId: string; size: string;
  lastOrder: string | null; working: number | null;
  building?: ConstructionJob | null;
  trainer?: string; dormant?: boolean; description?: string;
  furnishings?: any[]; henchmen?: Hireling[];
  taps?: string[]; books?: string[];
  choresDone?: any[]; staffLostOn?: any;
  [k: string]: any;
}
// The keep itself. The two collections are the spine; the long tail (defenders, happening,
// pendingCall, relics, fallenLord, neglect, map…) rides the hatch because it accretes over a
// bastion's whole life, and pinning all of it would be a second full-time interface for me.
export interface Bastion {
  name: string; location: string;
  region: string | null; form: string | null;
  builtAtLevel: number; buildBudget: number;
  facilities: Facility[]; turns: BastionTurn[];
  neglect?: number; abandoned?: boolean;
  defenders?: any[]; defenderGraveyard?: any[];
  /** Staff this bastion from the character's CHOSEN pool rather than from the region — a
   *  necromancer's risen, a Fiend-pact warlock's bound, an Archfey warlock's invited.
   *  Frank, 2 Aug: a bastion-level toggle that *only appears* for a class that has such a pool.
   *  Setting it without the entitlement does nothing: see `chosenHiresActive`. */
  chosenHires?: boolean;
  [k: string]: any;
}
/* ------------------------------------------------------------------------------------------------
   EVERY ACTION THIS APP HAS.

   The review asked for a discriminated union — { type: "TAKE_BASTION_TURN"; charId: string; ... }
   | ... x167 — so a malformed dispatch cannot compile. That is the right answer eventually and it
   is 167 payload declarations that will rot the first time somebody adds a field and does not
   update them, at which point the union lies and everyone learns to cast around it.

   This is the 90% of the value in one declaration: the PROVEN bug is the NAME, not the payload.
   ENLARGE_FACILITY vs ENLARGE_BASTION_FACILITY cost an hour and hid a dead test for who knows how
   long; no payload type would have caught either, and this catches both at compile time.

   Generated from the reducer's own case labels. When you add a case, add it here — and the
   runtime guard on `default` catches it in the meantime, in every environment that actually runs.
   Belt and braces, deliberately: one for the compiler, one for the browser with no compiler in it.
   ------------------------------------------------------------------------------------------------ */
// NOTE: SET_PUB_TAP / SET_ARCHIVE_BOOK / SET_BASTION_TRAINER were removed from these
// unions. They belonged to the pub, archive and training_area facilities, which were
// deleted as placeholders; their reducer cases went with them, but these declarations
// were left behind - so the type system claimed three actions the runtime would
// silently ignore. Re-add them WITH their reducer cases when those facilities are
// re-minted. A declared action with no case is a false contract, not a to-do.
export type ActionType =
    "ACCEPT_MENTOR_TABLE"
  | "ADD_BASTION_FACILITY"
  | "ADD_FACILITY_FURNISHING"
  | "REMOVE_FACILITY_FURNISHING"
  | "ROLL_ITEM_SLOT"
  | "SUBMIT_SLOT_ITEM"
  | "VERIFY_SLOT_ITEM"
  | "REJECT_SLOT_ITEM"
  | "SUBMIT_DM_ITEM"
  | "VERIFY_DM_ITEM"
  | "REJECT_DM_ITEM"
  | "IMPORT_CHARACTER_ITEM"
  | "SET_ORG_MEMBERSHIP"
  | "VERIFY_IMPORT_ITEM"
  | "REJECT_IMPORT_ITEM"
  | "CLAIM_PAPER_ITEM"
  | "VERIFY_PAPER_ITEM"
  | "REJECT_PAPER_ITEM"
  | "ADD_CHARACTER"
  | "ADD_FAVOR"
  | "ADD_FRIEND"
  | "ADD_HOME_STORE"
  | "ADD_MODULE_CREDIT"
  | "ACCEPT_CHARM_GIFT" | "ADD_PREGEN"
  | "ADD_PREGEN_ITEM"
  | "ADD_RETIRE_TALE"
  | "ADD_SESSION_TO_LOG"
  | "ADD_STORE"
  | "ADD_WISH"
  | "ANSWER_CALL"
  | "ANSWER_POLL"
  | "APPROVE_CERTIFICATION"
  | "APPROVE_DM"
  | "APPROVE_LOG"
  | "APPROVE_PROVISIONAL"
  | "ARM_BASTION"
  | "ASSIGN_CERT"
  | "ASSIGN_DM"
  | "AUTHENTICATE_CERT"
  | "AUTHENTICATE_TICKET"
  | "BAN_USER"
  | "BLOCK_USER"
  | "BROADCAST_ORG_MESSAGE"
  | "BUILD_BASTION"
  | "BUILD_BASTION_WALLS"
  | "CANCEL_SESSION"
  | "CANCEL_SIGNUP"
  | "CANCEL_TRADE"
  | "CHECKOUT_MARKET"
  | "CRAFT_ITEM"
  | "ADVANCE_WIP"
  | "ABANDON_WIP"
  | "SCRIBE_SCROLL"
  | "SELL_TO_RONALDO"
  | "PROPOSE_PROV_TABLE"
  | "PICK_PROV_TABLE_DATE"
  | "DECLINE_PROV_TABLE"
  | "BUY_SCROLL"
  | "CHECK_IN"
  | "CLAIM_CERT"
  | "CLAIM_TABLE"
  | "COMPLETE_SESSION"
  | "CONFIRM_TRADE"
  | "CREATE_DM_FLAG"
  | "CREATE_EVENT"
  | "CREATE_MODULE_LISTING"
  | "CREATE_ORG"
  | "CREATE_SESSION"
  | "DEACTIVATE_USER"
  | "DECLARE_PREREQ"
  | "DECLINE_MENTOR_TABLE"
  | "DECLINE_CHARM_GIFT" | "DELETE_ITEM"
  | "DEMOTE_DM"
  | "DENY_DM"
  | "DISMISS_NOTICE"
  | "DISMISS_PROV_REQUEST"
  | "DISMISS_REPORT"
  | "DISMISS_STORE_REQUEST"
  | "DISMISS_SWAP"
  | "EDIT_CHARACTER"
  | "EDIT_LOG"
  | "EDIT_MODULE_LISTING"
  | "EDIT_ORG"
  | "EDIT_SESSION"
  | "EDIT_STORE"
  | "ENLARGE_BASTION_FACILITY"
  | "EXPAND_RETIRE_TALE"
  | "FLAG_STORE_FIELD"
  | "FORWARD_MENTORS"
  | "GIFT_CERT"
  | "GRANT_LICENSE"
  | "GRANT_ROLE"
  | "IMPORT_WARHORN"
  | "INVALIDATE"
  | "KILL_CHARACTER"
  | "LOG_BASTION_NEGLECT"
  | "LOG_DM_SESSION"
  | "MARK_LOST"
  | "MARK_THREAD_READ"
  | "ACCEPT_LEVEL"
  | "DECLINE_LEVEL"
  | "ACK_PUSH_REPORT"
  | "PUSH_SWEEP"
  | "MARK_WARHORN_ALL"
  | "MARK_WARHORN_PUSHED"
  | "MONITOR_REPORT"
  | "PICK_MENTOR"
  | "PROPOSE_BASTION_COMBINE"
  | "MINT_BOOK_ITEM"
  | "OFFER_CHARM_GIFT" | "PROPOSE_TRADE"
  | "PUBLISH_TABLE"
  | "RAZE_BASTION"
  | "REACTIVATE_USER"
  | "REASSIGN_SHELF_ITEM"
  | "REBUILD_FACILITY"
  | "RECONCILE_WARHORN"
  | "RECRUIT_EVENT"
  | "REFURNISH"
  | "REFUSE_CALL"
  | "REJECT_LOG"
  | "RELEASE_TABLE"
  | "REMOVE_CHARACTER"
  | "REMOVE_FAVOR"
  | "REMOVE_FRIEND"
  | "REMOVE_GIFT"
  | "REMOVE_HOME_STORE"
  | "REMOVE_MODULE_CREDIT"
  | "REMOVE_WARNING"
  | "REMOVE_WISH"
  | "RENAME_FACILITY_HENCHMAN"
  | "REPORT_MESSAGE"
  | "REQUEST_AUTH"
  | "REQUEST_DM"
  | "REQUEST_STORE"
  | "RESOLVE_BASTION_TURNS"
  | "RESOLVE_FLAG"
  | "RESOLVE_STORE_FLAG"
  | "RESPOND_BASTION_COMBINE"
  | "RESTORE_MODULE_LISTING"
  | "RETIRE_CHARACTER"
  | "RETRACT_MODULE_LISTING"
  | "RETURN_LOG"
  | "REVIEW_OBSERVER"
  | "REVIEW_PROV_LOG"
  | "SELL_FURNISHING"
  | "SEND_MESSAGE"
  | "SEND_TRADE_PROPOSAL"
  | "SET_AVATAR"
  | "SET_ARCHIVE_BOOK"
  | "SET_SCRIPTORIUM_SCRIBE"
  | "SET_WORKSHOP_TOOLS"
  | "SET_BASTION_FORM"
  | "SET_BASTION_MAP"
  | "SET_BASTION_PENDING_EVENT"
  | "SET_BASTION_REGION"
  | "SET_BIO"
  | "SET_CHARACTER_IMAGE"
  | "SET_DM_NOTE"
  | "SET_EPITAPH"
  | "SET_FACILITY_DESCRIPTION"
  | "SET_FACILITY_IMAGE"
  | "SET_FURNISHING_NOTE"
  | "SET_LIFESTYLE"
  | "SET_MENTOR"
  | "SET_ORG_ASSISTANT"
  | "SET_ORG_LEADER"
  | "SET_ORG_SCHEDULER"
  | "SET_PROVISIONAL"
  | "SET_STORE_LOGO"
  | "SET_WARHORN_SLUG"
  | "SIGNUP_SESSION"
  | "START_MENTOR_SEARCH"
  | "SET_CHARM_DESC" | "SUBMIT_DISPOSAL"
  | "SUBMIT_LOG"
  | "SUBMIT_OBSERVER_LOG"
  | "SUBMIT_PROV_LOG"
  | "SUGGEST_ADVENTURE"
  | "TAKE_BASTION_TURN"
  | "TOGGLE_ATTENDANCE"
  | "TOGGLE_ATTUNED"
  | "TOGGLE_AVAILABLE"
  | "TOGGLE_CARRIED"
  | "TOGGLE_EQUIPPED"
  | "TOGGLE_FAVOR_FADED"
  | "TOGGLE_GIFT_CARRIED"
  | "TOGGLE_MODULE_AUTHOR"
  | "TOGGLE_SHARE_HERO"
  | "TOGGLE_WISHLIST"
  | "TRANSFER_PREGEN"
  | "UNASSIGN_CERT"
  | "UNBLOCK_USER"
  | "UNCOMBINE_BASTIONS"
  | "UNRETIRE_CHARACTER"
  | "UPGRADE_FURNISHING"
  | "SET_QUARTERS"
  | "WARN_USER"
  | "WITHDRAW_LICENSE"
  ;
// One raw order line as the UI submits it for a Bastion week (before openBastionWeek normalizes it).
export interface BastionOrderInput { facId: string; orderId: string; detail?: string; gp?: number; outId?: string | null; craftItem?: any; pickId?: string | null; }

// The Bastion slice of the action space, as a discriminated union on `type`. Members are strict (no
// index signature) so a misspelled or mistyped field on a dispatch is a compile error, and `by`/
// `charId` — the actor and the character every bastion order needs — are required. Action-specific
// fields are pinned by type but optional, so a call site may omit the ones a given order doesn't use.
// This is the compile-time contract for the reducer's bastion cases and every dispatch that feeds them.
export type BastionAction =
  | { type: "TAKE_BASTION_TURN"; by: string; charId: string; orders?: BastionOrderInput[]; maintain?: boolean }
  | { type: "RESOLVE_BASTION_TURNS"; by?: string; charId?: string }
  | { type: "BUILD_BASTION"; by: string; charId: string; name?: string; location?: string; region?: string | null; form?: string | null; cramped?: string; roomy?: string }
  | { type: "ADD_BASTION_FACILITY"; by: string; charId: string; defId: string; size?: string; trainer?: string }
  | { type: "REBUILD_FACILITY"; by: string; charId: string; defId: string; facId: string }
  | { type: "ENLARGE_BASTION_FACILITY"; by: string; charId: string; facId: string; size: string }
  | { type: "ANSWER_CALL"; by: string; charId: string; send?: any; yes?: boolean }
  | { type: "REFUSE_CALL"; by: string; charId: string }
  | { type: "DECLARE_PREREQ"; by: string; charId: string; prereq: string; on?: boolean }
  | { type: "SET_BASTION_REGION"; by: string; charId: string; region?: string | null }
  | { type: "SET_BASTION_PENDING_EVENT"; by: string; charId: string; event?: any }
  | { type: "LOG_BASTION_NEGLECT"; by: string; charId: string; turns?: number }
  | { type: "RAZE_BASTION"; by: string; charId: string }
  | { type: "PROPOSE_BASTION_COMBINE"; by: string; charId: string; withCharId: string }
  | { type: "RESPOND_BASTION_COMBINE"; by: string; pactId: string; accept?: boolean }
  | { type: "UNCOMBINE_BASTIONS"; by: string; charId: string; withCharId: string }
  | { type: "ARM_BASTION"; by: string; charId: string }
  | { type: "BUILD_BASTION_WALLS"; by: string; charId: string }
  | { type: "SET_BASTION_FORM"; by: string; charId: string; form?: string | null }
  | { type: "SET_BASTION_MAP"; by: string; charId: string; dataURL?: string | null }
  | { type: "SET_FACILITY_DESCRIPTION"; by: string; charId: string; facId: string; text?: string }
  | { type: "SET_FACILITY_IMAGE"; by: string; charId: string; facId: string; dataURL?: string | null }
  | { type: "UPGRADE_FURNISHING"; by: string; charId: string; facId: string; furnId: string; name?: string; note?: string }
  | { type: "SELL_FURNISHING"; by: string; charId: string; facId: string; furnId: string; note?: string }
  | { type: "REFURNISH"; by: string; charId: string; facId: string; furnId: string; note?: string }
  | { type: "SET_FURNISHING_NOTE"; by: string; charId: string; facId: string; furnId: string; note?: string }
  | { type: "ADD_FACILITY_FURNISHING"; by: string; charId: string; facId: string; note?: string; gp?: number }
  | { type: "REMOVE_FACILITY_FURNISHING"; by: string; charId: string; facId: string; furnId: string }
  | { type: "RENAME_FACILITY_HENCHMAN"; by: string; charId: string; facId: string; henchId: string; name?: string; note?: string; role?: string }
  | { type: "CRAFT_ITEM"; by: string; charId: string; catalogId: string }
  | { type: "ADVANCE_WIP"; by: string; charId: string; days?: number }
  | { type: "ABANDON_WIP"; by: string; charId: string }
  | { type: "SCRIBE_SCROLL"; by: string; charId: string; spellId: string };

// Everything the discriminated union does not name stays on the loose contract, keyed so a bastion
// type can never resolve to this member (that is what makes the union above actually narrow).
export type BastionActionType = BastionAction["type"];
export interface AppAction { type: ActionType; [k: string]: any; }
export type Action = BastionAction | { type: Exclude<ActionType, BastionActionType>; [k: string]: any };

export interface AppState {
  characters: Record<string, CharacterRecord>;
  items: Record<string, ItemRecord>;
  logEntries: any[]; sessions: any[]; notices: any[];
  wishlists: Record<string, string[]>;
  organizations: Record<string, any>;
  storeRegistry: Record<string, any>;
  // Rolled item slots a player fills from their own books; each waits on DM verification.
  itemSlots?: Record<string, any>;
  // account -> nextId watermark at the moment they last said "my sheet is updated"
  pushMarks?: Record<string, number>;
  // Account -> organisation(s) it belongs to. Authoritative membership; drives reporting.
  orgMembers?: Record<string, string[]>;
  nextId: number;
  [k: string]: any;
}

export interface FacilityBehavior {
  slotField?: "taps" | "books";
  slotCount?: (fac: Facility) => number;
  slotSource?: (form: any) => any[];
  onBuild?: (newFac: Facility, action: any) => void;
  [k: string]: any;
}

export interface FacilitySpec {
  id: string;
  roles?: string[];
  staffBySize?: Record<string, any>;
  furnishings?: any[];
  formNames?: Record<string, string>;
  furnishingWeight?: Record<string, number>;
  furnishingLadder?: Record<string, any>;
  sizeFlavor?: Record<string, any>;
  ruin?: any;
  reactions?: Record<string, any>;
  lifeTasks?: Record<string, any>;
  [k: string]: any;
}
