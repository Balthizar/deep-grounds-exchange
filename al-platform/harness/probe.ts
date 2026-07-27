
// ---- fingerprint probe ------------------------------------------------------------------
// Appended to a COPY of app.tsx to expose internals for fingerprinting.
//
// This imports everything it needs EXPLICITLY. It used to rely on whatever app.tsx happened
// to have in scope, which broke the moment 380 unused imports were cleaned out of the shell:
// esbuild bundled it happily and it died at runtime on `BASTION_FACILITIES is not defined`.
// A test harness must not depend on the incidental imports of the thing it measures.
import * as __reg from "./bastion/registry";
import * as __eng from "./bastion/engine";
import * as __core from "./lib/core";
import * as __soc from "./social/ui";
import { BASTION_FACILITIES as __BF } from "./data/bastion";
import { EVENT_CAST as __EC, FESTIVAL_FEATURES as __FF } from "./data/events";
import { ADVENTURES as __ADV, ADVENTURE_TAGS as __AT, ADV_BY_ID as __ABI } from "./data/adventures";
import { CATALOG as __CAT } from "./data/catalog";
import { IMPLEMENTS as __IMP, ARMAMENTS as __ARM, ARCANA as __ARC, RELICS as __REL } from "./data/magic_tables";
import __MG from "./data/srd/mundane_gear.json";
import __SP from "./data/srd/spells.json";

export const __probe = {
  registries: {
    FACILITY_ROLES: __reg.FACILITY_ROLES,
    FACILITY_STAFF_BY_SIZE: __reg.FACILITY_STAFF_BY_SIZE,
    FACILITY_FURNISHINGS: __reg.FACILITY_FURNISHINGS,
    FURNISHING_WEIGHT: __reg.FURNISHING_WEIGHT,
    FURNISHING_LADDER: __reg.FURNISHING_LADDER,
    BASTION_SIZE_FLAVOR: __reg.BASTION_SIZE_FLAVOR,
    FACILITY_RUIN: __reg.FACILITY_RUIN,
    FACILITY_REACTIONS: __reg.FACILITY_REACTIONS,
    BASTION_LIFE_TASKS: __reg.BASTION_LIFE_TASKS,
    FACILITY_BEHAVIOR: __reg.FACILITY_BEHAVIOR,
    BASTION_FACILITIES: __BF,
  },
  data: {
    EVENT_CAST: __EC, FESTIVAL_FEATURES: __FF,
    ADVENTURES: __ADV, ADVENTURE_TAGS: __AT, ADV_BY_ID: __ABI,
    CATALOG: __CAT, IMPLEMENTS: __IMP, ARMAMENTS: __ARM, ARCANA: __ARC, RELICS: __REL,
    MUNDANE_GEAR: __MG, SPELLS: __SP,
    NOTICE_VIEW: Object.keys(__soc.NOTICE_VIEW), NOTICE_TARGET: Object.keys(__soc.NOTICE_TARGET),
  },
  fns: {
    mkRng: __eng.mkRng,
    resolveBastionOrder: __eng.resolveBastionOrder,
    resolveBastionEvent: __eng.resolveBastionEvent,
    itemCat: __core.itemCat,
  },
  seed, reducer,
};
