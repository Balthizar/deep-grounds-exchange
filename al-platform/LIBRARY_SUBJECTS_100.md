# The Library's Hundred — subject roadmap

> **Ledger accounting (30 Jul).** 100 rows · **100 sourced** · 0 open — **COMPLETE**. Every subject is anchored to
> one of the **12 AL storyline regions**, and the roster is split **9 / 9 / 9 / 9 and 8 across the other
> eight** — waterdeep, moonsea, underdark and icewinddale at 9, the rest at 8. All five DMG categories
> remain at exactly **20**. `npm run check:ledger` gates this file against the live registry.
>
> **Region doctrine (Frank's ruling, 30 Jul).** Breadth is a requirement, not an aspiration: the roster
> had drifted to 15 Waterdeep rows against 0 for the Dessarin Valley, because subjects were being chosen
> for *interlock* with what was already written, which is a feedback loop into the densest region. The
> roster now covers only regions touched by an AL storyline, evenly. The five regions outside that set —
> neverwinter, silvermarches, cormyr, dalelands, heartlands — were retired, but **nothing authored was
> destroyed**: all ten sourced subjects anchored there were re-anchored to a storyline region they
> genuinely touch, and the correction was paid for entirely out of unauthored rows.
>
> **Re-anchored, not struck:** Myth Drannor, the Weeping War, the Cult of the Dragon and Elminster to
> `moonsea`; the Harpers and Neverwinter to `swordcoast`; the Order of the Gauntlet to `dessarin`; the
> Emerald Enclave to `chult`; the Crown of Horns to `baldursgate`; the Staff of the Magi to `waterdeep`.
>
> **Waterdeep is closed.** It holds 9 sourced subjects against a target of 9, so no further Waterdeep
> row can be added. This **overturns the 30 Jul ruling that kept the two Blackstaff rows separate** —
> both were unauthored, both fell to the regional cap, along with Ahghairon, Khelben, the Time of
> Troubles and Halaster's Apprentices. Reversing that costs another region a slot; it is a live call.

The candidate list for the Library's d20-fact subjects. Selection principle (Frank, 29 Jul):
**deepest within the DMG's five topic types**, every subject **anchored to a region a bastion can
be set in** (the 17 `BASTION_REGIONS`), each chosen for being Realms-famous *and* deep enough in the
wiki to honestly fill toward 20 sourced facts.

**Split** — the DMG's Library entry names five topic types ("a legend, a known event or location, a
person of significance, a type of creature, or a famous object"), so the roster splits **evenly, 20
per category** — the split the DMG's own list recommends. All five categories stand at **20 each**, and the twelve
storyline regions at 9 or 8. Legend ran to 22 for a time because the five AL organized-play factions
are all filed there (see the faction note at the foot of this file); two duplicate legend rows were
struck on 30 Jul to restore the even split, and the region reallocation the same day held it there.

**Status:** this is the *selection*, not the facts. Facts are sourced + tagged one subject at a time
(the incremental marathon, same as the facilities). `waterdeep` is done (proof subject). The `id` is
the key; `region` ties it to the bastion regions; a subject is minted when its d-table is authored.

Legend — ⬜ to source · ✅ done

---

## LEGEND / MYTH (20) — famous tales, prophecies, orders, and storied happenings

1. ✅ **The Trollwars** · `waterdeep` — the decade of war that forged early Waterdeep against the trolls
2. ✅ **The Fall of Myth Drannor** · `moonsea` — the ruin of the great elven city of Cormanthor
3. ✅ **The Weeping War** · `moonsea` — the long siege that ended Myth Drannor
4. ✅ **The Sundering** · `swordcoast` — the world-remaking upheaval of the late 1400s DR
5. ✅ **The Rage of Demons** · `underdark` — the demon lords loosed into the Underdark
6. ✅ **The Curse of Strahd** · `barovia` — the dark tale of the vampire lord and his valley
7. ✅ **The Dark Gift of Zariel** · `avernus` — the fall of the angel who became an archdevil
8. ✅ **The Prophecy of the Frostmaiden** · `icewinddale` — Auril's long night over the Dale
9. ✅ **The Harpers** · `swordcoast` — the secret fellowship watching over the Realms
10. ✅ **The Lords' Alliance** · `swordcoast` — the coalition of the free cities of the North
11. ✅ **The Zhentarim** · `moonsea` — the Black Network, from its Moonsea cradle
12. ✅ **The Order of the Gauntlet** · `dessarin` — the militant faith-alliance against evil
13. ✅ **The Emerald Enclave** · `chult` — the wardens of the wild places of the Realms
14. ✅ **The Cult of the Dragon** · `moonsea` — Sammaster's death-worshipping dracoliches
15. ✅ **The Dead Three** · `baldursgate` — Bane, Bhaal, and Myrkul and their murderous faith
16. ✅ **The Wild Hunt** · `feywild` — the Feywild's terrible archfey ride
17. ✅ **The Prophecy of the Elder Elemental Eye** · `dessarin` — the doom the four cults preached in the Sumber Hills
18. ✅ **The Unhuman Wars** · `wildspace` — the long war against the goblin fleets
19. ✅ **The Laws of Fey Bargains** · `feywild` — why a promise binds harder here than anywhere
20. ✅ **The Descent of the Drow** · `underdark` — how the dark elves were driven below

## EVENT OR LOCATION (20) — known events and famous places

21. ✅ **Waterdeep** · `waterdeep` — the City of Splendors *(proof subject, done)*
22. ✅ **Baldur's Gate** · `baldursgate` — the great mercantile city of the Sword Coast
23. ✅ **Neverwinter** · `swordcoast` — the Jewel of the North, rebuilt from ruin
24. ✅ **Menzoberranzan** · `underdark` — the drow City of Spiders
25. ✅ **Undermountain** · `waterdeep` — the mad mage's endless dungeon beneath the city
26. ✅ **Skullport** · `waterdeep` — the Port of Shadows in the Underdark below
27. ✅ **Candlekeep** · `swordcoast` — the great library-fortress of the Sword Coast
28. ✅ **Phlan** · `moonsea` — the much-fought-over Moonsea town
29. ✅ **Ten-Towns** · `icewinddale` — the ten hardy settlements of Icewind Dale
30. ✅ **Barovia** · `barovia` — Strahd's mist-walled valley of the Domains of Dread
31. ✅ **Port Nyanzaru** · `chult` — the merchant-prince city of the jungle coast
32. ✅ **The Yawning Portal** · `waterdeep` — the famous tavern over Undermountain's well
33. ✅ **Avernus** · `avernus` — the first layer of the Nine Hells, plain of endless war
34. ✅ **Red Larch** · `dessarin` — the crossroads village on the Long Road
35. ✅ **The Sumber Hills** · `dessarin` — the broken country hiding the elemental temples
36. ✅ **The Outer City** · `baldursgate` — the sprawl beyond the walls, and who lives in it
37. ✅ **The Rock of Bral** · `wildspace` — the asteroid port and its crooked docks
38. ✅ **Prismeer** · `feywild` — the shattered domain of the archfey Zybilna
39. ✅ **Elturel** · `avernus` — the city that was dragged down, and what came back
40. ✅ **The Witchlight Carnival** · `feywild` — the wandering fair that crosses between worlds

## PERSON OF SIGNIFICANCE (20) — famous figures, living and dead

41. ✅ **King Hekaton** · `swordcoast` — the storm giant monarch and his broken ordning
42. ✅ **Elminster Aumar** · `moonsea` — the Sage of Shadowdale, Mystra's Chosen
43. ✅ **Drizzt Do'Urden** · `icewinddale` — the renegade drow ranger of the North
44. ✅ **Halaster Blackcloak** · `waterdeep` — the Mad Mage who made Undermountain
45. ✅ **Strahd von Zarovich** · `barovia` — the first vampire, lord of Barovia
46. ✅ **Zariel** · `avernus` — the archdevil who rules the first layer of Hell
47. ✅ **Laeral Silverhand** · `waterdeep` — the Open Lord of Waterdeep, one of the Seven Sisters
48. ✅ **Manshoon** · `moonsea` — the founder of the Zhentarim and his many clones
49. ✅ **Auril the Frostmaiden** · `icewinddale` — the goddess of winter over the Dale
50. ✅ **Artus Cimber** · `chult` — the bearer of the Ring of Winter in the jungle
51. ✅ **Ras Nsi** · `chult` — the bara of the yuan-ti and his undead legions
52. ✅ **Vlaakith** · `wildspace` — the lich-queen of the githyanki in the Astral
53. ✅ **Jarlaxle Baenre** · `underdark` — the roguish drow mercenary of Bregan D'aerthe
54. ✅ **Ulder Ravengard** · `baldursgate` — the Grand Duke and Marshal of Baldur's Gate
55. ✅ **Gar Shatterkeel** · `dessarin` — prophet of the Crushing Wave
56. ✅ **Aerisi Kalinoth** · `dessarin` — the elf prophet of the Howling Hatred
57. ✅ **Mizora** · `baldursgate` — the cambion broker of infernal bargains
58. ✅ **Zybilna** · `feywild` — the archfey of Prismeer, and what holds her still
59. ✅ **Bel** · `avernus` — the deposed Lord of the First and his war
60. ✅ **Madam Eva** · `barovia` — the Vistani seer at Tser Pool

## TYPE OF CREATURE (20) — famous kinds of monster and being

61. ✅ **Doppelgangers** · `baldursgate` — the shapechangers the Guild keeps on retainer
62. ✅ **The Undead of Phlan** · `moonsea` — what still walks in the ruined quarters
63. ✅ **Beholders** · `underdark` — the paranoid eye-tyrants of the deep
64. ✅ **Mind Flayers** · `underdark` — the illithids and their hive-cities
65. ✅ **Drow** · `underdark` — the dark elves of the Underdark
66. ✅ **Dragons of the North** · `swordcoast` — the great wyrms of the Sword Coast (e.g. white dragons)
67. ✅ **Yuan-ti** · `chult` — the serpent-folk of the jungle temples
68. ✅ **Zombies of Chult** · `chult` — the death-curse undead of the jungle
69. ✅ **Trolls** · `waterdeep` — the regenerating horrors of the Trollwars and the North
70. ✅ **Frost Giants** · `icewinddale` — the reaving giants of the frozen North
71. ✅ **Remorhaz** · `icewinddale` — the burning polar worms of the ice
72. ✅ **Demons of the Abyss** · `underdark` — the demon lords loosed in the Rage of Demons
73. ✅ **Devils of the Hells** · `avernus` — the baatezu legions of the Nine Hells
74. ✅ **Hags** · `feywild` — the green, sea, and night hags of the Feywild's edges
75. ✅ **Redcaps & Fey** · `feywild` — the wicked small folk of the Feywild
76. ✅ **Githyanki** · `wildspace` — the astral raiders on their red dragons
77. ✅ **Vampires** · `barovia` — the undead lords of the Domains of Dread
78. ✅ **Aberrations of the Far Realm** · `wildspace` — the alien horrors beyond the stars
79. ✅ **Elementals of the Four Temples** · `dessarin` — the bound elementals of the Dessarin cults
80. ✅ **Neogi** · `wildspace` — the slaver-spiders of the spaceways

## FAMOUS OBJECT (20) — artifacts, relics, and storied items

81. ✅ **The Ring of Winter** · `chult` — the artifact of eternal winter sought in Chult
82. ✅ **The Wand of Orcus** · `underdark` — the demon lord's skull-topped wand
83. ✅ **The Crown of Horns** · `baldursgate` — Myrkul's cursed relic of undeath
84. ✅ **The Sunsword** · `barovia` — the radiant blade that can end Strahd
85. ✅ **The Holy Symbol of Ravenkind** · `barovia` — the relic against Barovia's vampire
86. ✅ **The Tomb of the Nine Gods relics** · `chult` — the trials and treasures of Acererak's tomb
87. ✅ **The Codicil of White** · `icewinddale` — the frost-touched lore of the Frostmaiden's cult
88. ✅ **The Ythryn Mythallar** · `icewinddale` — the Netherese engine beneath the ice
89. ✅ **Auril's Roc / the Frostmaiden's relics** · `icewinddale` — the cold divine tokens of the Dale
90. ✅ **The Pool of Radiance** · `moonsea` — the corrupting magical pool beneath Phlan
91. ✅ **The Infernal Contracts of Avernus** · `avernus` — the soul-bargains of the Nine Hells
92. ✅ **The Sword Coast Trade Bars** · `swordcoast` — the standardized metal currency of the coast
93. ✅ **The Witchlight Carnival relics** · `feywild` — the strange wonders of the traveling fey fair
94. ✅ **Spelljamming Helms** · `wildspace` — the arcane engines that sail ships between worlds
95. ✅ **The Staff of the Magi** · `waterdeep` — the great arcane staff of Realms legend
96. ✅ **The Elemental Weapons** · `dessarin` — Drown, Ironfang, Tinderstrike and Windvane
97. ✅ **The Shield of the Hidden Lord** · `baldursgate` — the artifact at the heart of Elturel's fall
98. ✅ **The Spelljammer** · `wildspace` — the living ship that no crew ever truly keeps
99. ✅ **Infernal War Machines** · `avernus` — the fuel they burn and the price of driving one
100. ✅ **The Tarokka Deck** · `barovia` — the cards that name where the weapons lie

---

## Sourcing order (suggested)

Start with the subjects that are richest *and* most likely to come up at a Sword Coast / Waterdeep
table, so the earliest-authored subjects are the most-used: Baldur's Gate, Neverwinter, Menzoberranzan,
Candlekeep, Undermountain, Elminster, Drizzt, Beholders, Mind Flayers, the Ring of Winter. Then fill
by region as the campaign visits them. Each subject: fetch its wiki page(s), author up to 20 short
sourced sentences in the Exchange's own words, tag each with a primary + secondaries from
`LIBRARY_ASPECTS`, add to `LIBRARY_SUBJECTS`. The machine already reads them correctly (proven on
Waterdeep).


## AL faction set (subtle player education)
The five AL organized-play factions are all Library subjects so a player who shelves a faction book learns who they've joined, sideways through play: **Harpers ✅**, **Order of the Gauntlet ✅**, **Emerald Enclave ✅**, **Lords' Alliance ✅**, **Zhentarim ✅**. Filed under "legend" for the data model (consistent with all five). Four of the five sat in `heartlands` or `dalelands`, which the 30 Jul region ruling retired — so all four were re-anchored rather than struck, and the factions remain in the Library where an organized-play platform needs them.
