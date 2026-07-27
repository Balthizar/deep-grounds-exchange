# SRD Data — AL Legality: Full Verification Pass

**Every rule below was read from the source document and quoted. Nothing here is paraphrase or recall.**

## Sources verified
| Tag | Document | Location |
|---|---|---|
| `[ALPG-176]` | AL Players Guide v2026.4 | L176 / L254 — purchasing |
| `[ALPG-CL]` | AL Players Guide v2026.4 | L349 — change log |
| `[ALPG-312]` | AL Players Guide v2026.4 | L312 — Firearms |
| `[DC-36]` | AL Dungeoncraft DG v1.9c | L36 — rewards |
| `[DC-68]` | AL Dungeoncraft DG v1.9c | L68 — treasure |
| `[HARNESS]` | AL_Harness_bundle (this project) | L6318-6345, L8394-8407 — prior ruling |

## 1. The parent rule — what may be purchased
> **[ALPG-176]** "You may purchase mundane equipment and spell components from your character's campaign-available sources (in this case, excluding the DMG). You may sell mundane equipment using the PH rules."

> **[ALPG-176]** "When AL guidance refers to a 'campaign-available' source... find them in the PH and Appendix A. Items listed in Appendix B are unavailable."

Everything else follows from this: **PH + Appendix A are purchasable; the DMG is not.**

## 2. Poisons
> **[ALPG-CL]** "Excluded DMG purchases of poisons and trade goods."

> **[HARNESS]** (this project's own prior ruling) "if AL excludes poisons, there are no poisons. A campaign that took them out of the shops did not mean for them to grow in the greenhouse instead." — applied **structurally at import**, closing the harvest/craft gap.

**Implemented:** pattern exclusion, not a hand-list — `/\bpoison\b/i` **plus** a named-poison list (Assassin's Blood, Malice, Pale Tincture, Truth Serum, Burnt Othur Fumes, Essence of Ether, Torpor, venoms). The word boundary deliberately **keeps Poisoner's Kit** (a legal tool).

**Result:** `Poison, Basic` excluded. Zero poison-named items remain.

## 3. Trade goods & vehicles
> **[ALPG-CL]** "Excluded DMG purchases of poisons and trade goods."

> **[DC-68]** "Trade goods and vehicles are story items when placed in adventures."

**Result:** none present in the SRD equipment set (audited: livestock, commodities, ingots, vehicles, mounts — all zero). Rule encoded so a future pull cannot introduce one.

## 4. Firearms
> **[ALPG-312]** "Mundane or magic firearms (e.g., muskets, pistols) awarded in encounter text (never stat block) may be kept, but not replicated, repaired, purchased, crafted, traded, or chosen as a weapon type. Mundane firearms may be sold or loaned. Proficiency with martial weapons includes PH firearms. Bullets and Smokepowder are required for firing. Bullets may be rewarded or purchased in an adventure or crafted by a character proficient in Smith's Tools."

> **[DC-36]** "...(no firearm magic items)."

**WEAPONS — flagged `firearm: true`:** Musket (`g_musket`), Pistol (`g_pistol`)
**AMMUNITION — deliberately NOT flagged:** Bullets, Firearm (`g_bulletsfirearm`) — bullets are rewardable, purchasable in an adventure, and craftable.

> ⚠️ **Correction on record:** an earlier pass of this filter stated firearms were "not awardable" and bullets "not purchasable". **Both were wrong** — encoded from description rather than the text. Corrected above against L312.

## 5. Spells — explicitly out of scope for item filters
The item patterns are **item-scoped only**. Applying them to spells would wrongly exclude the legal **Detect Poison and Disease**, **Poison Spray**, and **Protection from Poison**. `composeSpells()` does not call the filter, and the code says so.

## 6. Filter stress test (future-pull protection)
| Candidate | Verdict |
|---|---|
| Poison, Basic | EXCLUDED (poison) |
| Potion of Poison | EXCLUDED (poison) |
| Assassin's Blood | EXCLUDED (named poison) |
| Serpent Venom | EXCLUDED (named poison) |
| Malice / Torpor / Truth Serum | EXCLUDED (named poison) |
| Silk / Ox / Salt | EXCLUDED (trade good) |
| Poisoner's Kit | allowed (tool) |
| Antitoxin | allowed |
| Longsword / Healer's Kit | allowed |
| Pistol | allowed, **flagged** firearm |

## 7. Enforcement still to verify in APP LOGIC (not data)
1. **Purchase path** must not offer firearm weapons ([ALPG-312] bars purchase).
2. **"Purchased in an adventure"** vs downtime shopping — bullets are in-adventure purchasable.
3. **"Chosen as a weapon type"** — firearms barred from weapon-choice class features.
4. **Smokepowder** (50 GP / 5 shots outside its adventure) if firing is modeled.
5. **Story items** — trade goods/vehicles route to the story-item class, never the mundane store [DC-68].

## Verdict
Data audited: **339 spells, 167 mundane items**. No prohibited content present. Firearms correctly flagged. All citations verified against source text.
