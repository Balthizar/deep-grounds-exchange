// ============================================================================
// LIBRARY SUBJECTS — the sourced-fact tables behind Library books.
//
// The Library differs from the Archive in KIND of knowledge (Frank, 29 Jul). An Archive book is a
// POINTER: a title + a wiki link, no facts inside — the link is the depth. A Library book is
// CONTAINED knowledge: a title + three tied-together sourced sentences forming a short paragraph,
// no link — the three facts ARE the DMG's "up to three accurate pieces of information," physically
// in the book.
//
// THE MODEL. Each subject carries a d-table of up to 20 facts (die floats to the subject's real
// sourced fact-count; a rich subject fills 20, an honest thin one fills fewer — never padded). Each
// fact is a single sourced sentence carrying a SET of aspect tags — a primary and secondaries — so
// the draw can DRIFT along shared tags and read like a writer expanding one thread of the subject
// (Frank's battle→sewers→hiding-spot associative flow, 29 Jul).
//
// THE DRAW (see composeLibraryParagraph in engine): roll fact #1 free → its tags seed the thread →
// roll #2 sharing >=1 tag (prefer the seed's primary, accept an adjacent secondary) → roll #3
// sharing >=1 tag with #2 → roll a genre connective sentence tied to the title's genre → stitch. So
// two books on the same subject read differently (different 3-of-N, different thread, different
// genre voice) while every sentence stays individually true and sourced. C(20,3)=1,140 raw combos
// per full subject, before tag-threading and genre framing — deep, and all honest.
//
// SOURCING DISCIPLINE. Every fact is a short sentence in the Exchange's OWN words, stating a real
// fact drawn from the cited page — never copied text. The `src` is the page it was drawn from. These
// are flavor-grade, wiki-sourced notes presented as the librarian's gathered knowledge; consistent
// with the DMG ("the DM determines what you learn"), so the platform's facts are a courtesy and the
// DM's word governs at the table. Facts NEVER combine across subjects — all of a subject's facts are
// about that one subject — so no draw can ever produce an untrue statement.
// ============================================================================

// The controlled aspect-tag vocabulary. Adjacency is by SHARED TAG, so the tags must be a fixed
// lexicon consistently applied — "sewers" and "tunnels" as two tags would break the drift. Author
// every fact's tags from THIS set only. (Grows as subject types demand, but stays controlled.)
export const LIBRARY_ASPECTS = [
  // shared / place aspects
  "origin",      // founding, ancient past, how the thing came to be
  "governance",  // rule, law, who holds power
  "trade",       // commerce, wealth, the economy
  "people",      // populace, culture, character of the inhabitants
  "underground", // what lies beneath — tunnels, sewers, the deep places
  "conflict",    // wars, sieges, struggles
  "structure",   // physical layout, walls, wards, districts
  "landmark",    // specific notable places
  "intrigue",    // crime, secrets, hidden powers
  "faith",       // temples, gods, religion
  "legend",      // myth, story, the famous tale
  // creature aspects
  "nature",      // biology, form, physical traits
  "behavior",    // habits, ways, how it acts
  "society",     // how a creature or people organizes itself
  "habitat",     // where it is found
  "threat",      // the danger it poses
  // person aspects
  "deeds",       // what a figure did
  "character",   // personality, temperament
  "power",       // abilities, might, magic
  "allies",      // friends, factions, enemies
  "legacy",      // what remains, influence after
  // object aspects
  "make",        // how it was made, its form
  "history",     // what has happened to it, who held it
] as const;
export type LibraryAspect = (typeof LIBRARY_ASPECTS)[number];

export interface LibraryFact {
  t: string;                    // the sentence, in the Exchange's own words
  p: LibraryAspect;             // primary aspect
  s?: LibraryAspect[];          // secondary aspects (enable the drift)
  src: string;                  // the page this fact was drawn from (internal citation)
}

export interface LibrarySubject {
  id: string;
  label: string;                // display name of the subject
  category: "legend" | "event" | "location" | "person" | "creature" | "object";  // the DMG's five topic types
  facts: LibraryFact[];         // up to 20; the die floats to this length
}

// ---------------------------------------------------------------------------------------
// WATERDEEP — the proof subject (a LOCATION). Fully sourced from the Forgotten Realms wiki and
// related pages; 20 facts, multi-tagged. The underground/sewers cluster is deliberately deep so the
// drift example (a book that walks the city → its underside → what hides there) is demonstrable.
// ---------------------------------------------------------------------------------------
const FR = "forgottenrealms.fandom.com/wiki/Waterdeep";
const FR_HIST = "forgottenrealms.fandom.com/wiki/History_of_Waterdeep";
const FR_SEW = "forgottenrealms.fandom.com/wiki/Waterdeep/Sewers";
const FR_UNDER = "forgottenrealms.fandom.com/wiki/Undermountain";
const FR_SKULL = "forgottenrealms.fandom.com/wiki/Skullport";

export const WATERDEEP: LibrarySubject = {
  id: "waterdeep",
  label: "Waterdeep",
  category: "location",
  facts: [
    { t: "Waterdeep is called the City of Splendors, and stands among the largest and most influential cities on all of Faerûn.", p: "structure", s: ["people", "trade"], src: FR },
    { t: "The site was once the elven settlement of Aelinthaldaar, capital of the realm of Illefarn, long before any human city rose there.", p: "origin", s: ["legend"], src: FR_HIST },
    { t: "The city took its name from the great natural deepwater harbor that made it a haven for ships of the Sword Coast.", p: "origin", s: ["trade", "structure"], src: FR },
    { t: "Waterdeep grew into the commercial crossroads of the North, where the mineral wealth of the mountains met the merchant kingdoms of the south.", p: "trade", s: ["structure"], src: FR },
    { t: "The city is governed by the Masked Lords, a body of mostly anonymous rulers who conceal their identities behind enchanted masks.", p: "governance", s: ["intrigue"], src: FR },
    { t: "Ahghairon became the first Lord of Waterdeep in 1032 DR, the year from which the city reckons its own calendar.", p: "governance", s: ["origin"], src: FR_HIST },
    { t: "In its earliest days the settlement was little more than a gathering of warlords, first noted around 900 DR.", p: "origin", s: ["conflict"], src: FR_HIST },
    { t: "Its warlords once banded together to drive off invading trolls in a decade of fighting remembered as the Trollwars.", p: "conflict", s: ["origin", "legend"], src: FR_HIST },
    { t: "For a time the city's guild-masters ruled, and fell to such murderous in-fighting that they all but destroyed one another.", p: "conflict", s: ["governance", "intrigue"], src: FR_HIST },
    { t: "Though vast and wealthy, its people are known as largely good-natured, kept so by the Masked Lords and the vigilance of the City Watch.", p: "people", s: ["governance"], src: FR },
    { t: "Waterdhavians are a worldly, outspoken folk who prize the gathering of wealth yet will not stomach conquest or empire.", p: "people", s: ["trade"], src: FR },
    { t: "Though chiefly a human city, it is home to great numbers of moon elves, dwarves, halflings, half-elves, and gnomes.", p: "people", s: ["structure"], src: FR },
    { t: "Beneath the streets runs a sanitation system of sewer tunnels that connects to nearly every quarter of the city, and to its dungeons below.", p: "underground", s: ["structure"], src: FR_SEW },
    { t: "The depth of the sewers varies across the city, deepened in the north by Mount Waterdeep and the plateau the city was raised upon.", p: "underground", s: ["structure"], src: FR_SEW },
    { t: "Tales tell that the Xanathar's thieves kept trained guard-rats in the sewers, and that slavers crept up from the dungeons by night to steal citizens away.", p: "intrigue", s: ["underground", "legend"], src: FR_SEW },
    { t: "Far beneath the city sprawls Undermountain, a vast dungeon of interconnected chambers first delved by the dwarves of Clan Melairkyn.", p: "underground", s: ["origin", "legend"], src: FR_UNDER },
    { t: "Undermountain is ruled by the mad wizard Halaster Blackcloak, who descended into madness as he dug ever deeper beneath the city.", p: "legend", s: ["underground", "intrigue"], src: FR_UNDER },
    { t: "Deeper still lies Skullport, the Port of Shadows, a subterranean city more than a mile below Waterdeep and built upon an ancient Netherese ruin.", p: "underground", s: ["intrigue", "legend"], src: FR_SKULL },
    { t: "Skullport could be reached through hidden ways from the sewers and sea-caves, its water-locks worked by magic to keep the passages from flooding.", p: "underground", s: ["structure", "intrigue"], src: FR_SKULL },
    { t: "The city holds many dangers close to home besides Undermountain — the Citadel of the Bloody Hand, the Dungeon of the Crypt, and the drowned chasm called Umberlee's Cache among them.", p: "landmark", s: ["underground", "faith"], src: FR_UNDER },
  ],
};

// The subject registry. Grows to the chosen 100 (deepest within the DMG's five categories); seeded
// here with the proof subject.
const FR_BG = "forgottenrealms.fandom.com/wiki/Baldur's_Gate";

export const BALDURS_GATE: LibrarySubject = {
  id: "baldursgate",
  label: "Baldur's Gate",
  category: "location",
  facts: [
    { t: "Baldur's Gate, called the City of Blood and simply the Gate, was one of the largest and most prosperous merchant city-states on the whole Sword Coast.", p: "trade", s: ["structure", "people"], src: FR_BG },
    { t: "The city stands on the north bank of the River Chionthar, some forty miles upstream from the sea, between Waterdeep to the north and Amn to the south.", p: "structure", s: ["trade"], src: FR_BG },
    { t: "Curved around its sheltered harbor, the city's shape gives it the look of a crescent moon against the coast.", p: "structure", s: ["landmark"], src: FR_BG },
    { t: "Its bay lies well away from the tides that batter the open coast, which made it an ideal place to trade goods by sea and up and down the river.", p: "trade", s: ["structure"], src: FR_BG },
    { t: "Baldur's Gate is a place of commerce that grew rich by handling the coins of other powers and making them its own.", p: "trade", s: ["people"], src: FR_BG },
    { t: "The city is split into three districts: the wealthy Upper City on the hills, the bustling Lower City around the harbor, and the lawless Outer City beyond the walls.", p: "structure", s: ["people", "intrigue"], src: FR_BG },
    { t: "Nine great gates guard the passages between the districts, and it is from these gates that the city takes its name.", p: "structure", s: ["origin", "landmark"], src: FR_BG },
    { t: "Baldur's Gate is ruled by the Council of Four, dukes who vote among themselves on the law and policy of the city.", p: "governance", s: [], src: FR_BG },
    { t: "One of the four is chosen as Grand Duke, empowered to break a tie when the council is deadlocked.", p: "governance", s: [], src: FR_BG },
    { t: "Order in the city is kept by a strong Watch and by the powerful Flaming Fist mercenary company, who police the Lower City with brutal efficiency.", p: "governance", s: ["conflict"], src: FR_BG },
    { t: "The city's ruling families are the patriars, a closed nobility that even the wealthiest merchants can almost never hope to join.", p: "people", s: ["governance"], src: FR_BG },
    { t: "The population has always been chiefly human, though elves, dwarves, and even some drow settled there and were not looked upon differently.", p: "people", s: [], src: FR_BG },
    { t: "Baldurians take great pride in the openness of their city, where anyone might make a home or start a new life regardless of race or past.", p: "people", s: [], src: FR_BG },
    { t: "The city has a storied and dark connection to Bhaal, the dead god of murder, whose return it has more than once endured.", p: "faith", s: ["legend", "intrigue"], src: FR_BG },
    { t: "Three deities are favored above the rest: Umberlee for safety at sea, Tymora for luck in trade, and Gond for the city's love of craft and invention.", p: "faith", s: ["trade"], src: FR_BG },
    { t: "In the Temples District stands the High House of Wonders, a great temple-workshop of Gond, and the Hall of Wonders that displays its makers' craft.", p: "faith", s: ["landmark", "trade"], src: FR_BG },
    { t: "The heart of the city's rule is the High Hall, where the Council of Four and the Parliament of Peers meet and the city's laws and records are kept.", p: "governance", s: ["landmark"], src: FR_BG },
    { t: "Beneath the streets, underground basins and aqueducts carry the region's endless rain into a great cistern below the Temples District.", p: "underground", s: ["structure"], src: FR_BG },
    { t: "The land around the Gate is poor for farming, so the city has always lived by its harbor and the goods that flow through it rather than the soil.", p: "trade", s: ["structure"], src: FR_BG },
    { t: "Though long a neutral power, the city's leaders sit among the Lords' Alliance of the free cities of the west.", p: "governance", s: ["allies"], src: FR_BG },
  ],
};

const FR_MENZ = "forgottenrealms.fandom.com/wiki/Menzoberranzan";

export const MENZOBERRANZAN: LibrarySubject = {
  id: "menzoberranzan",
  label: "Menzoberranzan",
  category: "location",
  facts: [
    { t: "Menzoberranzan, the City of Spiders, is the greatest drow city of the northern Underdark, a place of ancient intrigue and casual cruelty.", p: "structure", s: ["people", "intrigue"], src: FR_MENZ },
    { t: "The city was founded by a priestess of Lolth named Menzoberra the Kinless, who gave it her name in the depths of prehistory.", p: "origin", s: ["faith"], src: FR_MENZ },
    { t: "It lies in a vast cavern of the northern Underdark, its darkness lit by luminous fungi and by the great pillar called Narbondel.", p: "structure", s: ["landmark"], src: FR_MENZ },
    { t: "Narbondel is the city's clock: a wizard sets it aglow each morning, and the slow fading of its heat marks the passing of a single day.", p: "landmark", s: ["structure"], src: FR_MENZ },
    { t: "Drow society is fiercely matriarchal, with the females holding nearly all power and the males regarded as lesser beings.", p: "society", s: ["people"], src: FR_MENZ },
    { t: "The city is ruled by the Ruling Council, the matron mothers of the eight highest-ranked noble houses at any given time.", p: "governance", s: ["society"], src: FR_MENZ },
    { t: "For centuries the foremost of the houses has been House Baenre, whose matron mother long held sway over the whole city.", p: "governance", s: ["allies"], src: FR_MENZ },
    { t: "The endless struggle of the houses for rank and for Lolth's favor defines the city, and open war between them is far from rare.", p: "intrigue", s: ["conflict", "faith"], src: FR_MENZ },
    { t: "A weaker house that destroys a stronger one takes its rank — and the destruction is only a crime if any survivor can prove it was done.", p: "intrigue", s: ["society", "conflict"], src: FR_MENZ },
    { t: "Nearly all the city worships Lolth, the Spider Queen, whose favor is the currency of every ambition within it.", p: "faith", s: ["society"], src: FR_MENZ },
    { t: "The city's young are trained at the Academy, in Sorcere for wizards, Arach-Tinilith for the priestesses of Lolth, and Melee-Magthere for warriors.", p: "society", s: ["power"], src: FR_MENZ },
    { t: "A separate council of mages governs the arcane, but since all its members are male it sits wholly within the grip of the matron mothers.", p: "governance", s: ["power", "society"], src: FR_MENZ },
    { t: "The most powerful male in the city is the Archmage of Menzoberranzan, a station of great arcane might but little true independence.", p: "power", s: ["governance"], src: FR_MENZ },
    { t: "Beneath the nobility toils a great mass of commoners and slaves, whose labor and lives are spent at the houses' whim.", p: "society", s: ["people"], src: FR_MENZ },
    { t: "At its height the city could field an army of some twenty thousand drow, drawn from the fighting strength of its many houses.", p: "conflict", s: ["society"], src: FR_MENZ },
    { t: "Matron Yvonnel Baenre once led half the city in an all-or-nothing assault on the dwarven stronghold of Mithral Hall.", p: "conflict", s: ["legend"], src: FR_MENZ },
    { t: "That war ended in defeat when Matron Baenre herself was felled by the axe of Bruenor Battlehammer, and the drow retreat was sounded.", p: "conflict", s: ["legend"], src: FR_MENZ },
    { t: "The city endured the Silence of Lolth, when the goddess withdrew her spells and left her priestesses powerless before their enemies.", p: "faith", s: ["conflict", "legend"], src: FR_MENZ },
    { t: "During that silence a slave uprising and an invasion by the duergar of Gracklstugh together brought the city near to ruin.", p: "conflict", s: ["society"], src: FR_MENZ },
    { t: "Great constructs of jade in the shape of spiders stand among the city's guardians, a fitting watch for the City of Spiders.", p: "structure", s: ["faith", "power"], src: FR_MENZ },
  ],
};

const FR_BEH = "forgottenrealms.fandom.com/wiki/Beholder";

export const BEHOLDERS: LibrarySubject = {
  id: "beholders",
  label: "Beholders",
  category: "creature",
  facts: [
    { t: "A beholder, sometimes called a sphere of many eyes or an eye tyrant, is a large aberration most often found in the Underdark.", p: "nature", s: ["habitat"], src: FR_BEH },
    { t: "It is a floating orb dominated by a single great central eye, ringed by ten smaller eyes upon writhing stalks, above a wide and gaping maw.", p: "nature", s: [], src: FR_BEH },
    { t: "Because eyes cover its whole body, a beholder can see in all directions at once, which makes it very nearly impossible to ambush.", p: "nature", s: ["behavior"], src: FR_BEH },
    { t: "Each of its many eyes holds a different deadly magic, so that a single beholder is an arsenal of spells wrapped around one hungry mouth.", p: "power", s: ["nature", "threat"], src: FR_BEH },
    { t: "Its central eye projects a cone of antimagic that snuffs out spells and effects caught within it — even, at need, the beholder's own eye-rays.", p: "power", s: ["threat"], src: FR_BEH },
    { t: "The lesser eyes can, among other horrors, disintegrate, turn flesh to stone, charm, slay, sleep, slow, frighten, and wound at a glance.", p: "power", s: ["threat"], src: FR_BEH },
    { t: "Beholders are powerful and cunning, and count themselves among the greatest threats the world has ever known.", p: "threat", s: ["behavior"], src: FR_BEH },
    { t: "They are schemers without equal, spinning and discarding scores of elaborate plots at once; to a beholder, the intrigues of humankind are the fumbling of infants.", p: "behavior", s: ["intrigue"], src: FR_BEH },
    { t: "Above all a beholder is xenophobic, holding every creature unlike itself — and often those very like itself — in cold contempt.", p: "behavior", s: [], src: FR_BEH },
    { t: "Beholders do not breed as other creatures do; instead they reproduce through their own dreams.", p: "nature", s: ["legend"], src: FR_BEH },
    { t: "A sleeping beholder can warp reality with its dreaming mind and spawn a fully grown beholder out of nothing where it sleeps.", p: "nature", s: ["legend"], src: FR_BEH },
    { t: "If it dreams of itself it may make an exact copy, and if its dreams are troubled it may make a lesser beholderkin or some wholly new eye-horror.", p: "nature", s: ["legend"], src: FR_BEH },
    { t: "The same fevered dreaming can even alter a beholder's own body, so that no two are ever quite alike.", p: "nature", s: [], src: FR_BEH },
    { t: "When an old beholder dreams of cheating death, its flesh may rot away and leave a death tyrant, an undead skull-orb with points of red light for eyes.", p: "nature", s: ["threat", "legend"], src: FR_BEH },
    { t: "Beholderkin abound — gazers, spectators, gauths, and others — lesser things dreamed into being, most as cruel as their makers if not as clever.", p: "society", s: ["nature"], src: FR_BEH },
    { t: "In the Realms, beholders infiltrate and seek to control whole sectors of society, some allied to the Zhentarim and some to the Red Wizards of Thay.", p: "society", s: ["intrigue"], src: FR_BEH },
    { t: "Beneath Waterdeep, a beholder called the Xanathar rules the city's thieves' and slavers' guild from the shadows of Skullport.", p: "society", s: ["intrigue", "legend"], src: FR_BEH },
    { t: "\"The Xanathar\" is a title, not a name, passed from one eye tyrant to the next every few decades across nearly two centuries.", p: "legend", s: ["society", "intrigue"], src: FR_BEH },
    { t: "An eye tyrant is a beholder that chooses to dwell among other creatures, ruling them from a throne of assumed superiority.", p: "behavior", s: ["society"], src: FR_BEH },
    { t: "Most beholders originate in the Underdark, and there they endlessly compete with one another for dominion over its lightless reaches.", p: "habitat", s: ["society", "conflict"], src: FR_BEH },
  ],
};

const FR_ELM = "forgottenrealms.fandom.com/wiki/Elminster";

export const ELMINSTER: LibrarySubject = {
  id: "elminster",
  label: "Elminster Aumar",
  category: "person",
  facts: [
    { t: "Elminster Aumar, most often called the Sage of Shadowdale or simply the Old Mage, is among the most famous and powerful wizards in all Faerûn.", p: "character", s: ["power", "legacy"], src: FR_ELM },
    { t: "His name is known from the Sword Coast to the jungles of Chult to the eastern realm of Thay, and few in the Realms have not heard some tale of him.", p: "legacy", s: [], src: FR_ELM },
    { t: "He is the favored Chosen of Mystra, the goddess of magic, and much of his long power flows from that bond.", p: "power", s: ["faith", "allies"], src: FR_ELM },
    { t: "Elminster was born in the year 212 DR in the village of Heldon, in the fallen kingdom of Athalantar.", p: "origin", s: [], src: FR_ELM },
    { t: "His early life was shattered when a magelord of Athalantar razed his village and killed his family, leaving him an orphan bent on revenge.", p: "origin", s: ["deeds"], src: FR_ELM },
    { t: "That path of revenge became a lifelong pursuit of magic and justice, and in time he helped bring down the magelords who had ruined him.", p: "deeds", s: ["origin"], src: FR_ELM },
    { t: "Offered the throne of Athalantar for his part in its liberation, he declined it, preferring a life of wandering and learning.", p: "character", s: ["deeds"], src: FR_ELM },
    { t: "Over a life stretching across centuries he saved the folk of Faerûn from ruin or conquest more times than any chronicle can rightly count.", p: "deeds", s: ["legacy"], src: FR_ELM },
    { t: "It is whispered that he had a hand in the founding of Waterdeep, or at least in the ordering of the city in its early days.", p: "legacy", s: ["deeds", "legend"], src: FR_ELM },
    { t: "He was for a time an apprentice and companion in the elven city of Myth Drannor, in the days before its long and terrible fall.", p: "origin", s: ["legend"], src: FR_ELM },
    { t: "Though he thinks little of humankind in the mass, he has stood as its tireless champion against wizards, devils, and worse.", p: "character", s: ["deeds"], src: FR_ELM },
    { t: "He is known for a sharp wit and a disarming charm, and for a gift of persuading even the most stubborn to see reason.", p: "character", s: [], src: FR_ELM },
    { t: "Among his closest allies are his fellow Chosen of Mystra, with whom he shares a telepathic bond, and chief among them his lover the Simbul.", p: "allies", s: ["power"], src: FR_ELM },
    { t: "The Simbul, Witch-Queen of Aglarond, is one of the Seven Sisters and among the most feared archmages of the East.", p: "allies", s: ["legend"], src: FR_ELM },
    { t: "He served as foster-father to three more of Mystra's Chosen — Laeral, Storm, and Dove Silverhand.", p: "allies", s: ["legacy"], src: FR_ELM },
    { t: "With Khelben Blackstaff Arunsun, the archmage of Waterdeep, he shared something of a long and prickly rivalry.", p: "allies", s: [], src: FR_ELM },
    { t: "His faithful scribe Lhaeo kept his tower and his correspondence, no small task in the household of the busiest sage in the Realms.", p: "character", s: ["allies"], src: FR_ELM },
    { t: "The Knights of Myth Drannor counted among his close friends, and two or three were always in Shadowdale in case the dale came to peril.", p: "allies", s: ["deeds"], src: FR_ELM },
    { t: "In the god-shaking years of the Time of Troubles he played his part, as he has in nearly every great upheaval to cross the Realms.", p: "deeds", s: ["legend", "power"], src: FR_ELM },
    { t: "His creator Ed Greenwood made him one of the very first figures of the Realms, and his appearance echoes the old wizards of legend, Merlin and Gandalf both.", p: "legacy", s: ["legend"], src: FR_ELM },
  ],
};

const FR_NW = "forgottenrealms.fandom.com/wiki/Neverwinter";

export const NEVERWINTER: LibrarySubject = {
  id: "neverwinter",
  label: "Neverwinter",
  category: "location",
  facts: [
    { t: "Neverwinter, called the Jewel of the North and the City of Skilled Hands, is one of the most cultured and cosmopolitan cities of the Sword Coast North.", p: "structure", s: ["people", "trade"], src: FR_NW },
    { t: "The city takes its name from the Neverwinter River, whose waters never freeze even in the deepest winter.", p: "origin", s: ["landmark"], src: FR_NW },
    { t: "The river's warmth is said to come from Mount Hotenow, the volcano to the northeast whose fires warm the water underground.", p: "landmark", s: ["origin"], src: FR_NW },
    { t: "The city is famed for the craft of its people, whose skilled hands gave it its second name across the North.", p: "people", s: ["trade"], src: FR_NW },
    { t: "Neverwinter endured the Spellplague of 1385 DR, the cataclysm that warped magic across Faerûn, though not without loss.", p: "conflict", s: ["legend"], src: FR_NW },
    { t: "In 1451 DR the city was all but destroyed when Mount Hotenow erupted in the disaster remembered as the Ruining.", p: "conflict", s: ["legend"], src: FR_NW },
    { t: "The eruption came when adventurers beneath the volcano briefly woke the primordial Maegera, whose rage forced the mountain to burst.", p: "legend", s: ["conflict"], src: FR_NW },
    { t: "A pyroclastic flow of ash, fiery boulders, and lava poured over the city, killing thousands in a matter of heartbeats.", p: "conflict", s: [], src: FR_NW },
    { t: "The whole of the ruling Alagondar royal family perished in the eruption, ending the line that had kept the city stable for generations.", p: "governance", s: ["conflict"], src: FR_NW },
    { t: "A great rift, the Chasm, was torn open across the city where the shifting earth pulled the ground apart.", p: "structure", s: ["conflict"], src: FR_NW },
    { t: "In the aftermath, ash-choked zombies born of the disaster roamed the ruined districts and the land around them.", p: "conflict", s: ["threat"], src: FR_NW },
    { t: "Years later Lord Dagult Neverember, seeing opportunity, hired workers to rebuild the city and Mintarn mercenaries to guard it.", p: "governance", s: ["trade"], src: FR_NW },
    { t: "Claiming descent from the city's old rulers, Neverember named himself Lord Protector and launched the movement called New Neverwinter.", p: "governance", s: [], src: FR_NW },
    { t: "The Protector's Enclave, farthest from the eruption's heart, suffered least and became the seat of the Lord Protector's rule.", p: "structure", s: ["governance"], src: FR_NW },
    { t: "The Lord Protector rules from the Hall of Justice, the old temple of Tyr in the heart of the Enclave.", p: "governance", s: ["landmark", "faith"], src: FR_NW },
    { t: "With no guilds to restrict trade or building, anyone who wished to start a business in the rebuilt city could simply do so.", p: "trade", s: ["governance"], src: FR_NW },
    { t: "That freedom drew traders and workers alike, and even sellers of simple goods grew wealthy in the hungry, rebuilding city.", p: "trade", s: ["people"], src: FR_NW },
    { t: "Neverember forged a trading alliance with the restored dwarven city of Gauntlgrym, deep beneath the same mountains that had ruined Neverwinter.", p: "trade", s: ["allies"], src: FR_NW },
    { t: "In its early days the city was raised by the great Lord Nasher, and after him the Alagondar kings and queens ruled it justly for generations.", p: "origin", s: ["governance"], src: FR_NW },
    { t: "Though still a shadow of its former glory, the rebuilt city shows in its hardy, creative folk why it was once the Jewel of the North.", p: "people", s: ["legacy"], src: FR_NW },
  ],
};

const FR_CK = "forgottenrealms.fandom.com/wiki/Candlekeep";

export const CANDLEKEEP: LibrarySubject = {
  id: "candlekeep",
  label: "Candlekeep",
  category: "location",
  facts: [
    { t: "Candlekeep is the famous library-fortress that has stood as a bastion of knowledge on the Sword Coast for many centuries.", p: "structure", s: ["legend"], src: FR_CK },
    { t: "A many-towered keep upon a crag, it looks down over the Sea of Swords from the end of the road called the Way of the Lion.", p: "structure", s: ["landmark"], src: FR_CK },
    { t: "It houses the greatest collection of writings in all Faerûn, hundreds of thousands of books and scrolls of lore.", p: "structure", s: ["legend"], src: FR_CK },
    { t: "The keep is home to the Avowed, cloistered monks of no single faith who tend and guard the great library.", p: "people", s: ["faith"], src: FR_CK },
    { t: "The Avowed come from all walks of life, from clerics of the gods of knowledge to wizards and even warrior-monks, united only in their scholarship.", p: "people", s: ["society"], src: FR_CK },
    { t: "Above all the Avowed protect the wisdom held within the Great Library, holding that those who destroy knowledge are themselves destroyed.", p: "people", s: ["faith"], src: FR_CK },
    { t: "The keep reveres the great seer Alaundo, whose prophecies have proven true again and again across the long history of the Realms.", p: "legend", s: ["faith"], src: FR_CK },
    { t: "Alaundo came to Candlekeep in 75 DR to study its writings, and there his fame as a prophet was made.", p: "origin", s: ["legend"], src: FR_CK },
    { t: "Though many believe the keep grew up around Alaundo's tower, in truth it stood for centuries before the seer was ever born.", p: "origin", s: [], src: FR_CK },
    { t: "So amazed were the sages by his accuracy that in 82 DR the monks began a never-ending chant of his unfulfilled prophecies.", p: "faith", s: ["legend"], src: FR_CK },
    { t: "That Endless Chant is led by the Chanter and carried day and night through the keep by a procession of the Avowed.", p: "faith", s: [], src: FR_CK },
    { t: "As each prophecy comes to pass, the monks remove it from the chant, so the recitation is a living ledger of what is yet to be.", p: "faith", s: ["legend"], src: FR_CK },
    { t: "Among the prophecies of Alaundo was the foretelling of the coming of the Bhaalspawn, the mortal children of the dead god of murder.", p: "legend", s: ["faith"], src: FR_CK },
    { t: "To enter the halls of wisdom a petitioner had to present the seal of a renowned wizard and an entrance-gift worthy of the collection.", p: "governance", s: ["trade"], src: FR_CK },
    { t: "The gift had to be a book of great value, rarity, or history — the shrewd gatekeepers rarely accepted a tome worth less than a thousand gold.", p: "trade", s: ["governance"], src: FR_CK },
    { t: "The keep is funded by those who seek its knowledge, for rulers and wealthy patrons pay handsomely for what its vaults contain.", p: "trade", s: [], src: FR_CK },
    { t: "Once a year the Avowed publish a small book on a single subject, stamped with the sigil of the keep and attributed to the order alone.", p: "trade", s: ["people"], src: FR_CK },
    { t: "Those little books, sold in Candlekeep and the great cities, grow in value over the years and are often resold for far more than their first price.", p: "trade", s: [], src: FR_CK },
    { t: "Beneath the Great Library, tombs and sepulchers carved into the volcanic rock hold the resting sages of Candlekeep.", p: "underground", s: ["structure"], src: FR_CK },
    { t: "Among the faithful of Oghma, god of knowledge, Candlekeep is counted one of the most holy sites in all the Realms.", p: "faith", s: ["legacy"], src: FR_CK },
  ],
};

const FR_DZ = "forgottenrealms.fandom.com/wiki/Drizzt_Do'Urden";

export const DRIZZT: LibrarySubject = {
  id: "drizzt",
  label: "Drizzt Do'Urden",
  category: "person",
  facts: [
    { t: "Drizzt Do'Urden is a drow ranger, an atypical dark elf who forsook the evil ways of his people to become the legendary hero of the North.", p: "character", s: ["origin", "legacy"], src: FR_DZ },
    { t: "He was born in Menzoberranzan, the cruel Underdark city of the drow, and left it wishing never to return.", p: "origin", s: [], src: FR_DZ },
    { t: "Marked by unusual lavender eyes and a moral compass rare among his kind, he chose the surface and the path of good.", p: "character", s: ["origin"], src: FR_DZ },
    { t: "His father Zaknafein trained him in every weapon, and Drizzt came to favor the two-scimitar style above all others.", p: "origin", s: ["power"], src: FR_DZ },
    { t: "When his family's deceit was discovered, Zaknafein was sacrificed to Lolth in Drizzt's stead — a loss that shadowed him for years.", p: "origin", s: ["legend"], src: FR_DZ },
    { t: "He wanders the Underdark for years with only his companion Guenhwyvar before at last coming to the surface world.", p: "deeds", s: [], src: FR_DZ },
    { t: "Guenhwyvar is an astral panther summoned from a figurine of wondrous power, and the truest and most enduring of his companions.", p: "power", s: ["allies"], src: FR_DZ },
    { t: "On the surface he was taken in by the blind ranger Montolio Debrouchee, who taught him the ranger's ways and the faith of Mielikki.", p: "origin", s: ["faith"], src: FR_DZ },
    { t: "After Montolio's death he wandered six years more, seeking a place that would accept him despite his drow blood, before coming to Icewind Dale.", p: "deeds", s: [], src: FR_DZ },
    { t: "He wields two magic scimitars, named Twinkle and Icingdeath, with a speed and skill few living swordsmen can match.", p: "power", s: [], src: FR_DZ },
    { t: "About his ankles he wears the bracers won from Dantrag Baenre, weapon-master of Menzoberranzan's first house, which make him blindingly quick.", p: "power", s: ["deeds"], src: FR_DZ },
    { t: "In Icewind Dale he protected the folk of Ten-Towns from the tundra's monsters, though they did not fully accept him.", p: "deeds", s: ["character"], src: FR_DZ },
    { t: "There he found the companions who became his family: the dwarf king Bruenor, the halfling Regis, the barbarian Wulfgar, and the archer Catti-brie.", p: "allies", s: [], src: FR_DZ },
    { t: "He came in time to love Catti-brie, though for long years neither the world nor circumstance would let him say so.", p: "character", s: ["allies"], src: FR_DZ },
    { t: "He fought in the reclamation of the dwarven stronghold of Mithral Hall for Clan Battlehammer, a deed that spread his fame across the North.", p: "deeds", s: ["conflict", "allies"], src: FR_DZ },
    { t: "After Mithral Hall he grew openly welcome in Icewind Dale, in Luskan, and at last in fair Silverymoon itself.", p: "legacy", s: ["deeds"], src: FR_DZ },
    { t: "He made a lasting enemy of the assassin Artemis Entreri, whom he chased as far as distant Calimport to rescue his friend Regis.", p: "allies", s: ["conflict"], src: FR_DZ },
    { t: "Above all he is driven by a powerful personal code of honor, holding to virtue even where his birth and the world both told him not to.", p: "character", s: ["legacy"], src: FR_DZ },
    { t: "He is perhaps the most famous drow in the whole history of the Realms, a figure known far beyond the North.", p: "legacy", s: [], src: FR_DZ },
    { t: "His creator, the author R. A. Salvatore, first introduced him in The Crystal Shard and has followed him across dozens of books since.", p: "legacy", s: ["legend"], src: FR_DZ },
  ],
};

const FR_MF = "forgottenrealms.fandom.com/wiki/Mind_flayer";

export const MINDFLAYERS: LibrarySubject = {
  id: "mindflayers",
  label: "Mind Flayers",
  category: "creature",
  facts: [
    { t: "Mind flayers, also called illithids, are sadistic aberrations feared across many worlds for their terrible psionic powers.", p: "nature", s: ["threat"], src: FR_MF },
    { t: "They are humanoid in shape but for an octopus-like head, from which four writhing facial tentacles descend.", p: "nature", s: [], src: FR_MF },
    { t: "From twisted lairs deep in the Underdark they seek to expand their dominion over all other living things.", p: "habitat", s: ["threat", "society"], src: FR_MF },
    { t: "Masters of the mind, they dominate lesser creatures with their thoughts and devour the brains of their prey.", p: "power", s: ["threat", "behavior"], src: FR_MF },
    { t: "A mind flayer feeds not only on the flesh of a brain but on the psionic energy it draws from that brain in its final living moments.", p: "behavior", s: ["nature"], src: FR_MF },
    { t: "When it devours a brain it takes stray memories from its victim, and shares them with the other members of its colony.", p: "behavior", s: ["society"], src: FR_MF },
    { t: "The fortunate among their prey are simply slain; the unlucky have their minds warped and are left as mindless thralls.", p: "threat", s: ["behavior"], src: FR_MF },
    { t: "Illithids do not breed as other creatures do; they lay eggs that hatch into tadpoles, and from the tadpoles new mind flayers are made.", p: "nature", s: [], src: FR_MF },
    { t: "That making is the horror called ceremorphosis: a tadpole is set into a captive's skull, devours the brain, and becomes the new brain in its place.", p: "nature", s: ["threat"], src: FR_MF },
    { t: "Over the course of a week the host's body reshapes itself, and a wholly new mind flayer emerges where a person once stood.", p: "nature", s: [], src: FR_MF },
    { t: "The new illithid may keep a few dim memories of the life it replaced, but these vestiges rarely touch its new existence as a devourer of minds.", p: "nature", s: ["behavior"], src: FR_MF },
    { t: "Ceremorphosis takes cleanly only in a few humanoid kinds — humans, elves, drow, gith, and a handful of others of the right size.", p: "nature", s: [], src: FR_MF },
    { t: "A tadpole that survives but is never used swells uncontrolled into a vast rampaging predator called a neothelid.", p: "nature", s: ["threat"], src: FR_MF },
    { t: "At the heart of every illithid city, in a brine-filled pool, dwells the elder brain — the final stage of the mind flayer life cycle.", p: "society", s: ["nature"], src: FR_MF },
    { t: "The elder brain guides its colony, filling every illithid with dark dreams of the domination of all thinking life.", p: "society", s: ["behavior"], src: FR_MF },
    { t: "When a mind flayer dies, it is fed back to the elder brain, which absorbs all that the illithid ever knew.", p: "society", s: ["nature"], src: FR_MF },
    { t: "But it is a fiercely guarded secret that no part of the mind flayer's self survives that joining — only its knowledge is kept, and its soul is lost.", p: "society", s: ["legend"], src: FR_MF },
    { t: "Composed of the brains of the long-dead, an elder brain can speak mind to mind with any creature near it and sense every thinking thing for miles.", p: "power", s: ["society"], src: FR_MF },
    { t: "Illithids are planar travelers who worship no gods of the Outer Planes, holding their intellect above any promised afterlife.", p: "behavior", s: ["society"], src: FR_MF },
    { t: "To the githyanki, their ancient enemies and former slaves, the mind flayers are known by the hateful name ghaik.", p: "legend", s: ["society", "conflict"], src: FR_MF },
  ],
};

const FR_ROW = "forgottenrealms.fandom.com/wiki/Ring_of_Winter";

export const RING_OF_WINTER: LibrarySubject = {
  id: "ringofwinter",
  label: "The Ring of Winter",
  category: "object",
  facts: [
    { t: "The Ring of Winter is a fabled artifact that adventurers have sought for centuries, rumored to hold the power to make its wearer immortal.", p: "legend", s: ["power", "history"], src: FR_ROW },
    { t: "Legend holds that its full power could bring a second Ice Age crashing down upon the whole of the Realms.", p: "power", s: ["legend", "threat"], src: FR_ROW },
    { t: "The ring grants its wearer mastery over cold and ice, letting them wield frost as a weapon.", p: "power", s: [], src: FR_ROW },
    { t: "To one attuned to it the ring renders its bearer immune to cold and halts their aging entirely, so that they do not grow old.", p: "power", s: ["make"], src: FR_ROW },
    { t: "It also hides its wearer from divination, so that no scrying magic can find one who bears the ring.", p: "power", s: ["make"], src: FR_ROW },
    { t: "It can drastically boost the powers of other enchanted items, even lending them the strength to carry a bearer across great distances.", p: "power", s: ["make"], src: FR_ROW },
    { t: "But the ring is not a willing servant: it constantly strives to seize control of its wearer and compel needless harm and destruction.", p: "make", s: ["threat", "legend"], src: FR_ROW },
    { t: "For over a century the ring lay in the vaults of Candlekeep, from which it was at last stolen away.", p: "history", s: [], src: FR_ROW },
    { t: "Its most famous bearer is Artus Cimber, a former Harper who spent a decade of his life searching for it.", p: "history", s: [], src: FR_ROW },
    { t: "Cimber learned it lay hidden in the jungles of Chult and went south to claim it, against dinosaurs, a lost city, and worse.", p: "history", s: [], src: FR_ROW },
    { t: "He first used its power to repel a goblin invasion of the hidden Chultan city of Mezro.", p: "history", s: ["power"], src: FR_ROW },
    { t: "With the ring he froze an evil guardian spirit solid and shattered it to silver splinters.", p: "history", s: ["power"], src: FR_ROW },
    { t: "Where Cimber believed the ring's whispers were a test of his will, others were simply consumed by its hunger for destruction.", p: "make", s: ["character", "legend"], src: FR_ROW },
    { t: "His enemy Kaverin Ebonhand, sworn to the mad god Cyric, sought the ring's immortality to escape eternal torment after death.", p: "history", s: ["legend"], src: FR_ROW },
    { t: "Cimber, made immortal by the ring, at last avenged his fallen companion and destroyed the leader of the Cult of Frost.", p: "history", s: ["power"], src: FR_ROW },
    { t: "Long after, the frost giant Jarl Storvald hunted the ring relentlessly, dreaming of using it to bury the North in eternal winter.", p: "history", s: ["threat", "legend"], src: FR_ROW },
    { t: "The half-elven sorceress Xandala also came to Chult in pursuit of the ring, seeking to wrest it from Cimber by any means.", p: "history", s: [], src: FR_ROW },
    { t: "So many powers covet the ring that merely bearing it makes its keeper a target for giants, cultists, and thieves alike.", p: "history", s: ["threat"], src: FR_ROW },
    { t: "Its cold does not seem cold to one who has attuned to it, so that the bearer walks unharmed through the very winter they command.", p: "make", s: ["power"], src: FR_ROW },
    { t: "For all its promise of good in the right hands, the ring is at heart a thing of ultimate destruction, and few who sought it kept their souls intact.", p: "legend", s: ["make", "threat"], src: FR_ROW },
  ],
};

const FR_STR = "forgottenrealms.fandom.com/wiki/Strahd_von_Zarovich";

export const STRAHD: LibrarySubject = {
  id: "strahd",
  label: "Strahd von Zarovich",
  category: "person",
  facts: [
    { t: "Count Strahd von Zarovich is a vampire and the dark lord of the valley of Barovia, a Domain of Dread in a remote corner of the Shadowfell.", p: "character", s: ["legend"], src: FR_STR },
    { t: "He names himself neither dead nor alive, but undead, forever — the Ancient, the Land itself made flesh.", p: "character", s: ["power"], src: FR_STR },
    { t: "In his youth he was a prince and a conqueror, a general who won the valley of Barovia by the sword.", p: "origin", s: ["deeds"], src: FR_STR },
    { t: "After his wars he settled in the conquered valley and raised the great fortress of Castle Ravenloft, naming it for his mother Ravenovia.", p: "origin", s: ["landmark"], src: FR_STR },
    { t: "Feeling the weight of middle age, he forged a pact with the Dark Powers of the Shadowfell to win himself immortality.", p: "origin", s: ["legend"], src: FR_STR },
    { t: "The pact demanded the murder of his younger brother Sergei, so that Strahd might take Sergei's bride Tatyana, with whom he was madly in love.", p: "origin", s: ["legend", "allies"], src: FR_STR },
    { t: "He killed his brother on the wedding day and drank his blood to seal the bargain with death.", p: "deeds", s: ["legend"], src: FR_STR },
    { t: "He then chased the grieving Tatyana through his own gardens until, to escape him, she flung herself from the castle walls to her death.", p: "deeds", s: ["legend"], src: FR_STR },
    { t: "The castle guards turned on him and shot him down with their arrows, but he did not die — he rose instead as a vampire, the first of his kind.", p: "origin", s: ["legend"], src: FR_STR },
    { t: "As the price of his pact he was made deathless and bound forever within Barovia, unable to leave and unable to truly die.", p: "power", s: ["legend"], src: FR_STR },
    { t: "The whole valley was drawn out of the world and into the Shadowfell as his prison, the first of the Domains of Dread.", p: "legacy", s: ["legend"], src: FR_STR },
    { t: "Tatyana's soul was trapped in Barovia with him, doomed to be reborn again and again down the centuries.", p: "legend", s: ["allies"], src: FR_STR },
    { t: "Strahd is cursed to meet each reincarnation of Tatyana, to love her, and to lose her every time — a torment as much as a hunt.", p: "character", s: ["legend"], src: FR_STR },
    { t: "He rules his people openly from Castle Ravenloft, styling himself a descendant of the first Strahd though he is in truth the same undying man.", p: "governance", s: ["character"], src: FR_STR },
    { t: "His power over Barovia is near absolute: he commands its weather, its wolves, and the very mists that wall it from the world.", p: "power", s: ["governance"], src: FR_STR },
    { t: "By turns he is a cultured host and a merciless predator, a lord who will dine with intruders before he hunts them.", p: "character", s: ["behavior"], src: FR_STR },
    { t: "He has been challenged over the centuries by many, even by his own kin, such as his great-niece Lyssa, who became a vampire to contest his rule.", p: "conflict", s: ["allies"], src: FR_STR },
    { t: "Though defeated more than once by adventurers, he has never been kept down for long, always rising again to rule his cursed land.", p: "conflict", s: ["legacy"], src: FR_STR },
    { t: "He is openly modeled on Dracula, and is remembered as the first truly well-developed villain of the game — a foe who bends events to his own dark will.", p: "legacy", s: [], src: FR_STR },
    { t: "His story is told most fully in the tale of the Curse of Strahd, the dread chronicle of Barovia and its deathless count.", p: "legacy", s: ["legend"], src: FR_STR },
  ],
};

const FR_HARP = "forgottenrealms.fandom.com/wiki/Harpers";

export const HARPERS: LibrarySubject = {
  id: "harpers",
  label: "The Harpers",
  category: "legend",
  facts: [
    { t: "The Harpers, or Those Who Harp, are a semi-secret fellowship dedicated to preserving lore, keeping the balance between nature and civilization, and defending the innocent.", p: "society", s: ["origin"], src: FR_HARP },
    { t: "For their symbol they take a silver harp between the horns of a crescent moon, set on a field of black or royal blue.", p: "legend", s: [], src: FR_HARP },
    { t: "They have shaped many of the world-changing events of Faerûn's history, though rarely where any eye could see their hand.", p: "legacy", s: ["society"], src: FR_HARP },
    { t: "Their creed holds that no extreme is good — that for freedom to flourish, the powers of realms and the reach of city and wild must be kept in balance.", p: "society", s: [], src: FR_HARP },
    { t: "A Harper seeks neither power nor glory, only fair and equal treatment for all, and acts openly only as a last resort.", p: "society", s: ["character"], src: FR_HARP },
    { t: "They thwart tyrants and any leader or group grown too powerful, and aid the weak, the poor, and the oppressed.", p: "society", s: ["conflict"], src: FR_HARP },
    { t: "The Harpers police their own: one who seizes power and holds it above all else is counted a traitor to the harp, and traitors must die.", p: "society", s: ["intrigue"], src: FR_HARP },
    { t: "The order is led by a council of High Harpers, elected by secret ballot for long service and for extreme discretion in their plans.", p: "governance", s: ["society"], src: FR_HARP },
    { t: "An agent rises through the ranks — Watcher, Harpshadow, Brightcandle, Wise Owl — before ever being counted among the High Harpers.", p: "society", s: [], src: FR_HARP },
    { t: "For all their name, the Harpers are anything but organized — a loose confederation of cells and lone agents scattered across the Realms.", p: "society", s: [], src: FR_HARP },
    { t: "Agents are trained to work alone and rely on their own wits, not to count on rescue by their fellows when a scheme goes wrong.", p: "society", s: ["character"], src: FR_HARP },
    { t: "Yet the bonds between Harpers run deep, and the friendships forged in the work are said to be near unbreakable.", p: "character", s: ["society"], src: FR_HARP },
    { t: "They are recognized, when they wish to be, by harp-shaped pins and by a simple creed exchanged between those in the know.", p: "society", s: [], src: FR_HARP },
    { t: "The order was first founded in 324 DR as the Harpers at Twilight, in the long shadow of the fallen elven glories of the North.", p: "origin", s: ["legend"], src: FR_HARP },
    { t: "They hold the elven city of Myth Drannor, in the days just before its fall, to be the very pinnacle of civilized history.", p: "origin", s: ["legend"], src: FR_HARP },
    { t: "For much of their history they were split into two branches, a formal western order and a subtler eastern one, sharing goals and intelligence across the Heartlands.", p: "society", s: [], src: FR_HARP },
    { t: "The order has collapsed and reformed more than once, its power and its reputation waxing and waning like the moon on its banner.", p: "legacy", s: ["origin"], src: FR_HARP },
    { t: "To some they are wide-eyed idealists and lord protectors of the Realms; to others, insufferable meddlers who cannot keep to their own business.", p: "legacy", s: ["character"], src: FR_HARP },
    { t: "A schism once tore the order when Khelben Blackstaff Arunsun left it to found his own secret group, the Moonstars, in Waterdeep.", p: "conflict", s: ["allies"], src: FR_HARP },
    { t: "They are hated in slaving realms like Thay and Tethyr, above all for their vehement and unbending opposition to the trade in slaves.", p: "conflict", s: ["society"], src: FR_HARP },
  ],
};

const FR_DROW = "forgottenrealms.fandom.com/wiki/Drow";

export const DROW: LibrarySubject = {
  id: "drow",
  label: "The Drow",
  category: "creature",
  facts: [
    { t: "The drow, also called dark elves, are a black-skinned sub-race of elves who dwell almost wholly in the lightless reaches of the Underdark.", p: "nature", s: ["habitat"], src: FR_DROW },
    { t: "They are widely hated and feared for their cruelty, though a rare few among them are not evil, and rarer still are truly good.", p: "character", s: ["society"], src: FR_DROW },
    { t: "In form they resemble other elves, but for skin of obsidian black and hair most often stark white.", p: "nature", s: [], src: FR_DROW },
    { t: "Their fall began in the ancient Crown Wars, when the dark elves of Ilythiir embraced the worship of the Spider Queen.", p: "origin", s: ["conflict", "faith"], src: FR_DROW },
    { t: "For their crimes the remaining elven realms channeled the power of Corellon to curse all dark elves, transforming them into drow.", p: "origin", s: ["faith", "legend"], src: FR_DROW },
    { t: "That curse, remembered as the Descent, sundered them from the light of day and drove them violently underground.", p: "origin", s: ["legend"], src: FR_DROW },
    { t: "Once below, the goddess Lolth took the exiled people under her wing and guided them to build their subterranean empires.", p: "faith", s: ["origin", "society"], src: FR_DROW },
    { t: "Lolth was once Araushnee, an elven goddess of fate, who rebelled against Corellon and was cast into the Abyss for her treachery.", p: "faith", s: ["legend"], src: FR_DROW },
    { t: "Where the curse made the drow vulnerable to light, the Spider Queen granted them in turn a mastery over darkness other races lack.", p: "power", s: ["faith"], src: FR_DROW },
    { t: "Drow society is savagely matriarchal, and above all else it belongs to the priestesses of Lolth.", p: "society", s: ["faith"], src: FR_DROW },
    { t: "From an early age a drow is taught to trust no one, and to forge an alliance only when certain of outmatching the ally who might betray them.", p: "society", s: ["character"], src: FR_DROW },
    { t: "The great drow cities are ruled by noble houses that scheme, poison, and war against one another for rank and for Lolth's favor.", p: "society", s: ["intrigue", "conflict"], src: FR_DROW },
    { t: "In 1372 DR the Spider Queen fell silent in the calamity called the Silence of Lolth, cutting her priestesses off from their divine magic.", p: "faith", s: ["conflict", "legend"], src: FR_DROW },
    { t: "That silence plunged drow society into chaos, for those who ruled by Lolth's power suddenly held none.", p: "conflict", s: ["society", "faith"], src: FR_DROW },
    { t: "Not all drow bow to Lolth: some follow Vhaeraun, the god of drow who would reclaim the surface, and some the mad Ghaunadaur.", p: "faith", s: ["society"], src: FR_DROW },
    { t: "A gentler few turn instead to Eilistraee, the Dark Dancer, who calls her people back toward moonlight, mercy, and the surface world.", p: "faith", s: ["legend"], src: FR_DROW },
    { t: "Some drow struggle to shed Lolth's touch entirely and seek Corellon's aid, becoming crusaders of the elven god within their own dark realm.", p: "faith", s: ["character"], src: FR_DROW },
    { t: "The most famous of all drow is Drizzt Do'Urden, who forsook Lolth and Menzoberranzan both to become a hero of the surface world.", p: "legend", s: ["character"], src: FR_DROW },
    { t: "The drow grew strong in the deep, dominating their subterranean world with a zealous, unrelenting fervor.", p: "society", s: ["habitat"], src: FR_DROW },
    { t: "Among the orcs they are known simply as the Dark Ones, a name spoken with the same fear the surface world reserves for their whole race.", p: "legend", s: ["nature"], src: FR_DROW },
  ],
};


export const UNDERMOUNTAIN: LibrarySubject = {
  id: "undermountain",
  label: "Undermountain",
  category: "location",
  facts: [
    { t: "Undermountain is the largest and most infamous dungeon in all Faerûn, sprawling for miles beneath the city of Waterdeep.", p: "underground", s: ["structure", "legend"], src: FR_UNDER },
    { t: "It is a warren of buried kingdoms, forgotten ruins, arcane laboratories, and impossible corridors shaped by centuries of madness.", p: "structure", s: ["underground"], src: FR_UNDER },
    { t: "Its deepest levels were first delved by the Melairkyn dwarves, who found mithral ore beneath Mount Waterdeep and carved out their Underhalls.", p: "origin", s: ["underground"], src: FR_UNDER },
    { t: "In time the drow dug their own tunnels up from below, and the dwarven kingdom of the Melairkyn collapsed under the pressure.", p: "origin", s: ["conflict", "underground"], src: FR_UNDER },
    { t: "The mad archwizard Halaster Blackcloak claimed the ousted dwarves' halls for himself and made them his personal playground and laboratory.", p: "origin", s: ["legend"], src: FR_UNDER },
    { t: "Over centuries Halaster expanded the dungeon far beyond the dwarven halls, digging ever deeper as he descended into madness.", p: "legend", s: ["structure"], src: FR_UNDER },
    { t: "He riddled the dungeon with traps, monsters, and cursed magic gathered from across the multiverse, penning overpowered creatures in its levels.", p: "threat", s: ["legend"], src: FR_UNDER },
    { t: "Halaster's apprentices, some as broken of mind as their master, added levels of their own to the growing labyrinth.", p: "legend", s: ["structure"], src: FR_UNDER },
    { t: "The dungeon is honeycombed with portals Halaster set, linking it to distant parts of the Realms and to other worlds entirely.", p: "structure", s: ["legend"], src: FR_UNDER },
    { t: "Its most famous entrance is the well in the taproom of the Yawning Portal inn, built over the site of Halaster's own vanished tower.", p: "landmark", s: ["structure"], src: FR_UNDER },
    { t: "Durnan, who first descended by that well, raised the inn above it and to this day charges the brave or foolish a gold piece to climb down.", p: "landmark", s: ["origin"], src: FR_UNDER },
    { t: "Waterdeep's sewers hold several hidden connections to the dungeon, so the city's underside and Halaster's halls are quietly joined.", p: "underground", s: ["structure"], src: FR_UNDER },
    { t: "On its third level lies Skullport, the Port of Shadows, a city-sized cavern of crime midway between the dungeon and the Underdark.", p: "underground", s: ["intrigue", "landmark"], src: FR_UNDER },
    { t: "Near Skullport stands the Promenade of Eilistraee, a temple of the good drow who follow the Dark Dancer against the worship of Lolth.", p: "faith", s: ["underground"], src: FR_UNDER },
    { t: "The ruins of an ancient drow city that worshipped Ghaunadaur lie in the dungeon, its people driven out single-handed by Halaster in his delving.", p: "underground", s: ["legend", "conflict"], src: FR_UNDER },
    { t: "The dungeon's very geography shifts, resets, and reacts to intrusion, so that no two descents ever map quite the same halls.", p: "structure", s: ["legend"], src: FR_UNDER },
    { t: "Some who know it best say the dungeon seems to remember those who enter — and to enjoy their failures.", p: "legend", s: ["threat"], src: FR_UNDER },
    { t: "Its shifting staircases, false paths, and warped caverns where gravity inverts have claimed countless adventurers over the ages.", p: "threat", s: ["structure"], src: FR_UNDER },
    { t: "No accurate count of its levels has ever been made; some who have mapped it call it perhaps the deepest dungeon in any world.", p: "structure", s: ["legend"], src: FR_UNDER },
    { t: "For all its dangers, its allure is a siren song, and the promise of what Halaster left buried still draws the bold down the well.", p: "legend", s: ["threat"], src: FR_UNDER },
  ],
};

const FR_ZHENT = "forgottenrealms.fandom.com/wiki/Zhentarim";

export const ZHENTARIM: LibrarySubject = {
  id: "zhentarim",
  label: "The Zhentarim",
  category: "legend",
  facts: [
    { t: "The Zhentarim, also called the Black Network or simply the Zhents, is a cadre of self-serving thieves, spies, assassins, and malevolent wizards.", p: "society", s: ["intrigue"], src: FR_ZHENT },
    { t: "Over its two centuries the Network has grown from a mercenary company into a vast and shadowy mercantile empire across Faerûn.", p: "society", s: ["trade", "origin"], src: FR_ZHENT },
    { t: "It was founded by the dark and powerful wizard Manshoon in the fortified town of Zhentil Keep, on the shore of the Moonsea.", p: "origin", s: ["governance"], src: FR_ZHENT },
    { t: "Manshoon built the Network through guile, murder, and intrigue, rising to power by eliminating his rivals — his own family among them.", p: "origin", s: ["intrigue"], src: FR_ZHENT },
    { t: "He gathered a cabal of like-minded wizards, wealthy Moonsea merchants, beholders, and the servants of evil temples to his banner.", p: "society", s: ["allies"], src: FR_ZHENT },
    { t: "Chief among his allies was the temple of Bane, the god of tyranny, whose faithful gave the Network a dark and disciplined core.", p: "faith", s: ["allies"], src: FR_ZHENT },
    { t: "Manshoon ran his secret empire of thousands through a handful of hand-picked lieutenants, chief among them his second, Sememmon.", p: "governance", s: ["society"], src: FR_ZHENT },
    { t: "Its long ambition is to dominate the lands from the Moonsea to the Sword Coast North — by manipulation, by control, or by extinction where control fails.", p: "society", s: ["conflict"], src: FR_ZHENT },
    { t: "The Network's power runs along a trade route linking the Moonsea to the Waterdeep region through its strongholds at Zhentil Keep and Darkhold.", p: "trade", s: ["structure"], src: FR_ZHENT },
    { t: "It enriches itself by smuggling slaves, poisons, and weapons, and by selling the services of its assassins to any who can pay.", p: "trade", s: ["intrigue"], src: FR_ZHENT },
    { t: "Manshoon cemented an alliance with Fzoul Chembryl, an ambitious cleric of Bane, in the years before the god-shaking Time of Troubles.", p: "allies", s: ["faith"], src: FR_ZHENT },
    { t: "After the purge called the Banedeath and the near-ruin of Zhentil Keep, control of the Network passed to the Bane-worshipping Fzoul.", p: "governance", s: ["conflict", "faith"], src: FR_ZHENT },
    { t: "Fzoul declared himself tyrant of Zhentil Keep and made secret deals to raise temples to Bane's divine son across the Moonsea's city-states.", p: "governance", s: ["faith", "intrigue"], src: FR_ZHENT },
    { t: "Under Fzoul the Keep became less a home than an armory and a haven, one base among many for a Network whose reach had outgrown any one city.", p: "structure", s: ["governance"], src: FR_ZHENT },
    { t: "Manshoon is infamous for his many clones, secretly grown so that the death of one Manshoon need never mean the end of the man.", p: "legend", s: ["origin"], src: FR_ZHENT },
    { t: "He quietly shifted the Network's true strength from Zhentil Keep to the hidden mountain fastness of the Citadel of the Raven.", p: "structure", s: ["governance"], src: FR_ZHENT },
    { t: "The Black Cloaks, Manshoon's cabal of loyal wizards, gave the Network an arcane might few rival powers could hope to match.", p: "society", s: ["allies"], src: FR_ZHENT },
    { t: "For a time the Network's leaders bound it to the service of Cyric, but its patient malice was always better suited to the calculating Bane.", p: "faith", s: ["conflict"], src: FR_ZHENT },
    { t: "The Zhentarim are the sworn archenemies of the Harpers, and the two have warred in the shadows across the whole of the Realms.", p: "conflict", s: ["society"], src: FR_ZHENT },
    { t: "Once a purely secret society, the Black Network in time grew bold enough to operate all but openly across the Moonsea and the North.", p: "society", s: ["legacy"], src: FR_ZHENT },
  ],
};

const FR_WAND = "forgottenrealms.fandom.com/wiki/Wand_of_Orcus";

export const WAND_OF_ORCUS: LibrarySubject = {
  id: "wandoforcus",
  label: "The Wand of Orcus",
  category: "object",
  facts: [
    { t: "The Wand of Orcus is the primary weapon of the demon lord Orcus, Prince of the Undead, and one of the most feared artifacts in all the planes.", p: "make", s: ["legend", "power"], src: FR_WAND },
    { t: "It is a rod of black obsidian and iron, topped with the skull of a human hero once slain by Orcus himself.", p: "make", s: [], src: FR_WAND },
    { t: "Wielded in melee it strikes as a cruel magic mace, and its blows tear at the living with the cold of the grave.", p: "power", s: [], src: FR_WAND },
    { t: "Its most dread power is simply to slay: it can end the life of nearly any living being at a touch.", p: "power", s: ["threat"], src: FR_WAND },
    { t: "Any creature but Orcus who dares attune to the wand risks death outright — and a mortal so slain rises again as a zombie.", p: "power", s: ["threat"], src: FR_WAND },
    { t: "While Orcus holds it, he can summon undead of every kind, and they do not perish at dawn but linger until he dismisses them.", p: "power", s: ["legend"], src: FR_WAND },
    { t: "Any holy water within ten feet of the wand is destroyed, for the thing is anathema to all that is sacred.", p: "power", s: [], src: FR_WAND },
    { t: "The wand is sentient, with a cruel and nihilistic mind, and it speaks with its wielder in the tongues of the Abyss and of mortals.", p: "make", s: ["character"], src: FR_WAND },
    { t: "Its one purpose is to help Orcus slay everything in the multiverse; it is bereft of humor and empty of any mercy.", p: "character", s: ["threat"], src: FR_WAND },
    { t: "To further its master's ends it will feign devotion to whatever mortal holds it, making grand promises it never means to keep.", p: "character", s: ["intrigue"], src: FR_WAND },
    { t: "One of its favorite lies is to vow it will help its wielder overthrow Orcus — a promise offered only to lure them deeper into ruin.", p: "character", s: ["intrigue", "legend"], src: FR_WAND },
    { t: "Orcus does not always keep the wand close; he lets it slip into the Realms to corrupt some mortal fool enough to claim it.", p: "history", s: ["legend"], src: FR_WAND },
    { t: "It appears wherever the demon lord senses a chance to work some fell design, a lure baited with power for the ambitious and the damned.", p: "history", s: ["threat"], src: FR_WAND },
    { t: "Orcus himself began as a mortal spellcaster, most likely a priest of some dark god, before his soul clawed its way to demonhood in the Abyss.", p: "history", s: ["legend"], src: FR_WAND },
    { t: "The wand once fell to a dead elder brain that Orcus raised and ruled, before the demon lord was cast back down to the Abyss by Demogorgon.", p: "history", s: ["legend"], src: FR_WAND },
    { t: "It figures at the heart of the legendary Bloodstone campaign, in which heroes braved the Abyss to steal it from Orcus in his own fortress.", p: "history", s: ["legend"], src: FR_WAND },
    { t: "In that tale it was destroyed at last by Gareth Dragonsbane and his companions, who took it from Orcus and unmade it.", p: "history", s: ["legend"], src: FR_WAND },
    { t: "Yet an artifact of such power is rarely gone for good, and the wand has a way of being found again wherever undeath festers.", p: "history", s: ["legend", "threat"], src: FR_WAND },
    { t: "Orcus rules from Thanatos, a frozen layer of the Abyss infested with the undead, and the wand is the truest symbol of his dominion.", p: "history", s: ["legend"], src: FR_WAND },
    { t: "Though many worship Orcus as a god of undeath, he is no true deity, and it is the wand more than any prayer that carries his terror into the world.", p: "legend", s: ["power"], src: FR_WAND },
  ],
};

const FR_SUN = "forgottenrealms.fandom.com/wiki/Sun_blade";

export const SUNSWORD: LibrarySubject = {
  id: "sunsword",
  label: "The Sunsword",
  category: "object",
  facts: [
    { t: "The Sunsword, also called the Bright Blade, is a sentient magic sword bound up with the doom of the vampire lord of Barovia.", p: "make", s: ["legend"], src: FR_SUN },
    { t: "It once belonged to Sergei von Zarovich, the brother whose murder set Strahd on the path to becoming a vampire.", p: "history", s: ["legend"], src: FR_SUN },
    { t: "In its original form it had a platinum hilt and guard and a thin crystal blade said to be as strong as steel.", p: "make", s: [], src: FR_SUN },
    { t: "After Sergei's death, Strahd set a powerful wizard to destroy the weapon, so that no blade might threaten his new immortality.", p: "history", s: ["legend"], src: FR_SUN },
    { t: "The wizard managed to separate the crystal blade from the hilt, and set about unmaking the blade itself.", p: "history", s: [], src: FR_SUN },
    { t: "But his own apprentice stole the hilt and fled with it, saving that much of the sword from destruction.", p: "history", s: ["legend"], src: FR_SUN },
    { t: "The apprentice never escaped Barovia; her mutilated corpse was later found in the Svalich Woods, but the hilt was gone.", p: "history", s: ["legend"], src: FR_SUN },
    { t: "To escape Strahd's wrath, the wizard lied and told the count that the whole weapon had been destroyed.", p: "history", s: ["intrigue"], src: FR_SUN },
    { t: "So the Sunsword survives as a platinum hilt alone, its crystal blade lost, waiting for a hand to wake it again.", p: "make", s: ["legend"], src: FR_SUN },
    { t: "When a worthy bearer attunes to the hilt, a blade of pure radiance springs into being at their will.", p: "power", s: ["make"], src: FR_SUN },
    { t: "The light it sheds is true sunlight, and its radiance is a special bane to the undead that no shadow can abide.", p: "power", s: ["threat"], src: FR_SUN },
    { t: "Against undead its blade bites all the harder, and against a creature of the night it is deadlier still.", p: "power", s: [], src: FR_SUN },
    { t: "The sword is sentient, and its dearest purpose is the destruction of Strahd von Zarovich himself.", p: "character", s: ["legend"], src: FR_SUN },
    { t: "Yet its hunger is less for Barovia's freedom than for revenge — vengeance for the crystal blade that was torn from it.", p: "character", s: [], src: FR_SUN },
    { t: "In its weakened, blade-shorn state the Sunsword secretly fears its own destruction, and guards against it.", p: "character", s: ["make"], src: FR_SUN },
    { t: "It is said the Dark Powers themselves saw the Bright Blade drawn into Barovia, so that it might forever trouble the count's rest.", p: "legend", s: ["history"], src: FR_SUN },
    { t: "Sages hold that the many sun blades scattered across the worlds were all modeled upon this one original Sunsword.", p: "legend", s: ["make"], src: FR_SUN },
    { t: "Among its imitators are Dawnbringer, lost in the Underdark, and Scintilmorn, a vampire-slaying blade lost in Undermountain.", p: "legend", s: ["history"], src: FR_SUN },
    { t: "A bearer who trusts the sword may find in it a true and single-minded ally, for it wants the same doom the hunter of Strahd wants.", p: "character", s: ["power"], src: FR_SUN },
    { t: "Its tale is woven through the Curse of Strahd, for the Bright Blade is one of the few things in all Barovia that the deathless count has cause to fear.", p: "legend", s: ["history"], src: FR_SUN },
  ],
};

const FR_MD = "forgottenrealms.fandom.com/wiki/Weeping_War";

export const FALL_OF_MYTH_DRANNOR: LibrarySubject = {
  id: "myth_drannor",
  label: "The Fall of Myth Drannor",
  category: "legend",
  facts: [
    { t: "Myth Drannor, the City of Song, was once held to be the very pinnacle of shared knowledge and culture in all Faerûn, and a rare beacon of harmony among the races.", p: "origin", s: ["legend"], src: FR_MD },
    { t: "It was the mythal-clad capital of the elven empire of Cormanthyr, raised in the great forest of Cormanthor.", p: "origin", s: ["structure"], src: FR_MD },
    { t: "The seeds of its doom were three greater nycaloths — Aulmpiter, Gaulguth, and Malimshaer — who had brooded in a magical prison for nearly two thousand years.", p: "origin", s: ["legend"], src: FR_MD },
    { t: "They had first been summoned by a Netherese archwizard, loosed into the elven woods to test what magic the elves could muster against Netheril.", p: "origin", s: ["legend"], src: FR_MD },
    { t: "Freed at last, the three nycaloths raised a host of orcs, gnolls, trolls, goblins, and lesser fiends that came to be called the Army of Darkness.", p: "conflict", s: ["origin"], src: FR_MD },
    { t: "Bent on revenge against the elves who had imprisoned them, the Army marched on Cormanthor and began the long agony known as the Weeping War.", p: "conflict", s: [], src: FR_MD },
    { t: "The war opened in 711 DR with the Northern Massacres, as the Army of Darkness poured into Cormanthyr's northern reaches.", p: "conflict", s: [], src: FR_MD },
    { t: "The elven army of Cormanthor, the Akh'Velahr, fought back fiercely and in time slew all three of the nycaloth lords who led the invasion.", p: "conflict", s: [], src: FR_MD },
    { t: "But the drow intervened to cut Cormanthyr off from its allies, so that no aid came from Evereska, Evermeet, or Silverymoon.", p: "conflict", s: ["intrigue"], src: FR_MD },
    { t: "The war ended in 714 DR, the Year of Doom, with the Siege of Shadow, the Army of Darkness closing at last upon the city itself.", p: "conflict", s: ["legend"], src: FR_MD },
    { t: "By the siege's height only some three thousand defenders remained, the forward army and the best of the wizards already fallen.", p: "conflict", s: [], src: FR_MD },
    { t: "At the climax came the Banes' Duel, when the last nycaloth lord Aulmpiter and Captain Fflar of Myth Drannor met in single combat.", p: "conflict", s: ["legend"], src: FR_MD },
    { t: "Both were slain when a magical blast engulfed them together, and their bodies were never recovered from the ruin.", p: "conflict", s: ["legend"], src: FR_MD },
    { t: "Wizards who refused to abandon their towers died as those towers were blown apart, spreading devastation and wild magic across the city.", p: "conflict", s: ["structure"], src: FR_MD },
    { t: "Though thousands of the Army of Darkness were slain, they were far too many to be stopped, and the City of Song was overrun, burned, and pillaged.", p: "conflict", s: [], src: FR_MD },
    { t: "For over six centuries afterward the ruins lay fiend-infested, home to alhoons, devils, dragons, and worse among the fallen marble.", p: "legacy", s: ["threat"], src: FR_MD },
    { t: "The elves sealed and hid the place as best they could, and it became a legend — one of the most dangerous adventuring sites in all the Realms.", p: "legacy", s: ["legend"], src: FR_MD },
    { t: "Its perilous magics forever tempted the power-hungry, and raiders and adventuring bands braved the ruin in search of elven treasure.", p: "legacy", s: ["threat"], src: FR_MD },
    { t: "The Harpers, who watch over the Realms, hold the city just before its fall to be the very height of civilization, and strive to see its like again.", p: "legacy", s: ["legend"], src: FR_MD },
    { t: "Centuries on, the elves of Evermeet reclaimed the ruin and Myth Drannor knew a brief renaissance — before, in the end, it fell once more.", p: "legacy", s: ["legend"], src: FR_MD },
  ],
};

const FR_COTD = "forgottenrealms.fandom.com/wiki/Cult_of_the_Dragon";

export const CULT_OF_THE_DRAGON: LibrarySubject = {
  id: "cult_of_the_dragon",
  label: "The Cult of the Dragon",
  category: "legend",
  facts: [
    { t: "The Cult of the Dragon, also called the Followers of the Scaly Way and the Wearers of Purple, is one of Faerûn's oldest and most dangerous secret societies.", p: "society", s: ["intrigue"], src: FR_COTD },
    { t: "It venerates not gods nor kings but dracoliches — dragons transformed into undead lords — holding them to be the rightful and eternal rulers of the world.", p: "society", s: ["faith"], src: FR_COTD },
    { t: "The cult was founded by Sammaster, a powerful wizard who had once, like Elminster and Blackstaff, been a Chosen of Mystra.", p: "origin", s: ["legend"], src: FR_COTD },
    { t: "But Sammaster's power brought him delusions of godhood and madness, and he fell from Mystra's grace into obsession and ruin.", p: "origin", s: ["character"], src: FR_COTD },
    { t: "His madness took root when he re-translated an ancient prophecy, the Chronicle of Years to Come, and read in it a false and fatal meaning.", p: "origin", s: ["legend"], src: FR_COTD },
    { t: "Where the true words spoke of shattered thrones ruled by none, Sammaster read instead that the dead dragons shall rule the world entire.", p: "legend", s: ["origin"], src: FR_COTD },
    { t: "Convinced an apocalypse was coming, he set out not to raise the dead to life but to bring undeath upon living dragons.", p: "origin", s: [], src: FR_COTD },
    { t: "With the aid of a dark deity, Sammaster made the first dracolich in 902 DR, transforming the great red wyrm Shargrailar the Dark.", p: "origin", s: ["legend"], src: FR_COTD },
    { t: "He named himself First Speaker of his growing sect, and he and his followers made many more dracoliches against the apocalypse they were sure would come.", p: "society", s: ["governance"], src: FR_COTD },
    { t: "The cult gathers wealth and power through spycraft, illegal dealings, magical research, and dark alliances with evil dragons.", p: "society", s: ["trade", "intrigue"], src: FR_COTD },
    { t: "Its ranks range from zealous priests and necromancers to dragon-worshipping fanatics and mercenaries bound only by greed.", p: "society", s: [], src: FR_COTD },
    { t: "The cult organizes itself into independent cells, each devoted to a single dracolich or to a dragon it means to make into one.", p: "society", s: ["structure"], src: FR_COTD },
    { t: "Sammaster's obsession had begun with a doomed love: a bitter, ruinous romance with the Chosen Alustriel Silverhand that ended in madness and necromancy.", p: "origin", s: ["character", "legend"], src: FR_COTD },
    { t: "A priest of Bane named Algashon ingratiated himself to the failing wizard and helped turn his private madness into a preaching creed.", p: "origin", s: ["allies", "faith"], src: FR_COTD },
    { t: "Sammaster has died, risen as a lich, and fallen again, yet each time his cult has outlived him and carried on his work.", p: "legacy", s: ["legend"], src: FR_COTD },
    { t: "After his final destruction the cult endured a period of dormancy, waiting in the shadows for a new hand to guide it.", p: "legacy", s: [], src: FR_COTD },
    { t: "In time a cultist named Severin Silrajin declared that Sammaster had mistranslated the prophecy, and that living dragons, not dead ones, should rule.", p: "legacy", s: ["legend"], src: FR_COTD },
    { t: "Under Severin the cult turned its whole strength toward summoning the dragon-goddess Tiamat herself into Faerûn.", p: "legacy", s: ["faith"], src: FR_COTD },
    { t: "The cult was always strongest in the Cold Lands and the North, where dragons were most abundant, and in the Western Heartlands.", p: "society", s: [], src: FR_COTD },
    { t: "Whether serving dead dragons or living ones, the cult remains a patient and apocalyptic terror, forever laboring toward a world ruled by wyrms.", p: "society", s: ["threat", "legacy"], src: FR_COTD },
  ],
};

const FR_OOTG = "forgottenrealms.fandom.com/wiki/Order_of_the_Gauntlet";

export const ORDER_OF_THE_GAUNTLET: LibrarySubject = {
  id: "order_of_the_gauntlet",
  label: "The Order of the Gauntlet",
  category: "legend",
  facts: [
    { t: "The Order of the Gauntlet is a coalition of morally upstanding warriors, knights, paladins, and clerics who dedicate themselves to the destruction of evil.", p: "society", s: ["faith"], src: FR_OOTG },
    { t: "For their symbol they take a gauntlet grasping a sword by the blade, a sign of righteous strength held in a righteous hand.", p: "society", s: [], src: FR_OOTG },
    { t: "To the order evil cannot be ignored: it must be met in the field and smashed, or it will swiftly overcome all.", p: "society", s: ["conflict"], src: FR_OOTG },
    { t: "Its members are bonded by fervent faith or by a staunch dedication to justice, and most often by both together.", p: "society", s: ["character"], src: FR_OOTG },
    { t: "The order holds faith itself to be the greatest weapon against evil — faith in one's god, in one's friends, and in oneself.", p: "faith", s: ["character"], src: FR_OOTG },
    { t: "Its knights most often venerate Helm the guardian, Torm and Tyr of the Triad, and Hoar the poet of justice.", p: "faith", s: [], src: FR_OOTG },
    { t: "The four faiths whose followers founded the order — Helm, Hoar, Torm, and Tyr — still shape its highest councils.", p: "origin", s: ["faith"], src: FR_OOTG },
    { t: "The order is governed by a tribunal called the Righteous Hand: a justiciar and four veteran high champions drawn from its founding faiths.", p: "governance", s: ["faith"], src: FR_OOTG },
    { t: "A knight rises through its ranks — Chevall, Marcheon, Whitehawk, Vindicator — before ever sitting among the Righteous Hand.", p: "society", s: ["governance"], src: FR_OOTG },
    { t: "A new member is given the order's insignia and holds to its creed, the Code of Scales and Weights.", p: "society", s: [], src: FR_OOTG },
    { t: "The order takes orders from no government and no temple, though it holds the counsel of holy figures in great esteem.", p: "governance", s: [], src: FR_OOTG },
    { t: "It is a young organization, eager and restless, and it maintains chapters in cities across the western Realms.", p: "society", s: ["structure"], src: FR_OOTG },
    { t: "The Gauntlet will never strike first: it lashes out the moment evil acts, and not a moment before.", p: "society", s: ["conflict"], src: FR_OOTG },
    { t: "When evil breaks a law or a code, the order strikes hard and fast without waiting for a ruler's leave or a distant temple's blessing.", p: "conflict", s: ["society"], src: FR_OOTG },
    { t: "It will never punish one who has done no evil, nor one who has merely voiced an immoral thought — only deeds draw its blade.", p: "character", s: ["society"], src: FR_OOTG },
    { t: "To act swiftly its knights keep fortified strongholds along the border lands, well-stocked armories, and bodies honed by daily drill.", p: "structure", s: ["conflict"], src: FR_OOTG },
    { t: "The order draws chiefly clerics, paladins, and fighters, though the honorable of any calling or race are welcome to its ranks.", p: "society", s: [], src: FR_OOTG },
    { t: "Working with the Harpers, the Gauntlet tracked the shipments of the Cult of the Dragon across the Sword Coast to unravel its schemes.", p: "allies", s: ["conflict"], src: FR_OOTG },
    { t: "Though the two orders work in very different ways, the Harpers and the Gauntlet share the same hopes for the future of Faerûn.", p: "allies", s: ["society"], src: FR_OOTG },
    { t: "When the summoning of Tiamat threatened the world, the Gauntlet took its seat among the powers gathered as the Council of Waterdeep.", p: "allies", s: ["legend"], src: FR_OOTG },
  ],
};

const FR_EE = "forgottenrealms.fandom.com/wiki/Emerald_Enclave";

export const EMERALD_ENCLAVE: LibrarySubject = {
  id: "emerald_enclave",
  label: "The Emerald Enclave",
  category: "legend",
  facts: [
    { t: "The Emerald Enclave is a widespread coalition of druids, rangers, and wilderness survivalists who preserve the natural order and root out unnatural threats.", p: "society", s: ["faith"], src: FR_EE },
    { t: "Its members call themselves Caretakers, and they hold the balance between wilderness and civilization to be a thing worth any sacrifice.", p: "society", s: ["character"], src: FR_EE },
    { t: "That natural order is exemplified by places where people and the wild live in harmony, where neither settlement nor wilderness overwhelms the other.", p: "society", s: [], src: FR_EE },
    { t: "The Enclave is not opposed to civilization or progress; it strives only to keep them in balance with the wild.", p: "society", s: [], src: FR_EE },
    { t: "It does not conquer, its members say, but corrects — for when nature falters, so does all life.", p: "society", s: ["character"], src: FR_EE },
    { t: "The Enclave was founded long ago in the Vilhon Reach, on the island of Ilighôn, over a thousand years past.", p: "origin", s: ["structure", "society"], src: FR_EE },
    { t: "It is decentralized, hardy, and reclusive; its branches are scattered across Faerûn and often act wholly alone.", p: "society", s: ["structure"], src: FR_EE },
    { t: "That isolation teaches every Caretaker a fierce self-reliance and a hard-won mastery of survival and the wild.", p: "character", s: ["society"], src: FR_EE },
    { t: "Its members wear an article of emerald-green cloth as their sign, often bearing the emblem of a stag's head.", p: "society", s: [], src: FR_EE },
    { t: "Members are drawn most often from druids, rangers, and barbarians of good or neutral heart who know and respect the wild's ways.", p: "society", s: [], src: FR_EE },
    { t: "The Enclave is organized into circles, each led by its longest-serving sages — ancient druids and ranger-elders known as Verdant Ones.", p: "governance", s: ["society"], src: FR_EE },
    { t: "A Verdant One leads the lunar rituals, trains new Caretakers, and passes judgment where the balance of natural forces is unclear.", p: "governance", s: ["faith"], src: FR_EE },
    { t: "Every member is taught a secret tongue, druidspeak, akin to thieves' cant, that takes a year or more to learn and is never shared with outsiders.", p: "society", s: ["intrigue"], src: FR_EE },
    { t: "The Enclave does not forbid the axe, but demands that logging be done in balance, each felled tree answered by new ones planted.", p: "society", s: [], src: FR_EE },
    { t: "Its work is quiet and practical: a ranger guarding a caravan through a mountain pass, a druid helping a village survive a brutal winter.", p: "society", s: ["deeds"], src: FR_EE },
    { t: "Its members venerate the gods of the wild, chief among them Silvanus, Mielikki, and Eldath.", p: "faith", s: [], src: FR_EE },
    { t: "The eldest and most honored Caretakers are said to be blessed by those gods, hidden from scrying and proof against charm, disease, and even age.", p: "power", s: ["faith", "legend"], src: FR_EE },
    { t: "In Icewind Dale a Caretaker might guide travelers across the frozen tundra, and in the jungles of Chult the Enclave keeps hidden outposts against the undead.", p: "society", s: ["deeds"], src: FR_EE },
    { t: "Above all the Enclave contains or destroys what is unnatural — the undead, the aberrant, and the planar blights that have no place in the world.", p: "conflict", s: ["society"], src: FR_EE },
    { t: "To the Caretaker, the good of the whole outweighs any single life, and a member will give even their own to keep the balance whole.", p: "character", s: ["society"], src: FR_EE },
  ],
};

const FR_LA = "forgottenrealms.fandom.com/wiki/Lords'_Alliance";

export const LORDS_ALLIANCE: LibrarySubject = {
  id: "lords_alliance",
  label: "The Lords' Alliance",
  category: "legend",
  facts: [
    { t: "The Lords' Alliance, also called the Council of Lords, is a coalition of the rulers of the free cities of the North and the Western Heartlands.", p: "governance", s: ["society"], src: FR_LA },
    { t: "Its members agree on one hard truth: that no city stands strong enough alone, and that some solidarity is needed to keep evil at bay.", p: "society", s: ["governance"], src: FR_LA },
    { t: "The partnership was founded in the early 14th century DR, and for a century and more has been the most influential power in the North.", p: "origin", s: ["legacy"], src: FR_LA },
    { t: "Its founding purpose was to oppose the rising influence of the Zhentarim's Black Network, the Shadow Thieves of Amn, and the raiders of the wild.", p: "origin", s: ["conflict"], src: FR_LA },
    { t: "The rulers of Waterdeep, Silverymoon, Neverwinter, and Baldur's Gate dominate the Alliance, with other free cities making up the rest.", p: "governance", s: ["structure"], src: FR_LA },
    { t: "Waterdeep holds the most power of all, and its Open Lord is reckoned the official leader of the whole Alliance.", p: "governance", s: [], src: FR_LA },
    { t: "In its present day the Open Lord of Waterdeep is Laeral Silverhand, a Chosen of Mystra and a key voice among the lords.", p: "governance", s: ["allies"], src: FR_LA },
    { t: "Its first leader was Lord Piergeiron of Waterdeep, and its first goal the unified defense of the northern cities and their trade.", p: "origin", s: ["governance"], src: FR_LA },
    { t: "The lords of the Alliance will never fully set aside their differences, yet they can pull together when the survival of all is at stake.", p: "society", s: ["governance"], src: FR_LA },
    { t: "Every lord in the Alliance works first for the fortune of their own settlement, so the coalition is as much rivalry as it is friendship.", p: "society", s: ["intrigue"], src: FR_LA },
    { t: "Depending on who is asked, the Alliance is either a strong coalition or an unsteady pact of jealous political powers.", p: "society", s: [], src: FR_LA },
    { t: "Member cities work toward mutual betterment through mercantile treaties and official pledges, binding their prosperity together.", p: "trade", s: ["governance"], src: FR_LA },
    { t: "The agents of the Alliance are sophisticated bards, zealous paladins, talented mages, and grizzled warriors, chosen above all for loyalty.", p: "society", s: [], src: FR_LA },
    { t: "They are trained in observation, stealth, innuendo, and combat, and carry fine equipment often disguised to look common.", p: "society", s: ["intrigue"], src: FR_LA },
    { t: "The Alliance has long hired adventurers, for tasks from simple information-gathering to raids on Zhentarim strongholds.", p: "society", s: ["conflict"], src: FR_LA },
    { t: "A local adventurer can win status and powerful friends by serving the Alliance — and just as easily make enemies of the Zhentarim.", p: "society", s: ["conflict"], src: FR_LA },
    { t: "The Alliance is long allied with the Harpers, and long at odds with the Zhentarim, Luskan, Amn, and the church of Bane.", p: "allies", s: ["conflict"], src: FR_LA },
    { t: "Should an agent fall into legal trouble, a councillor of the Alliance may come to their aid with a writ of pardon.", p: "governance", s: ["society"], src: FR_LA },
    { t: "It draws mostly those at home in civilized lands — fighters, sorcerers, and city-folk — and seldom the wild rangers and druids of the Emerald Enclave.", p: "society", s: ["allies"], src: FR_LA },
    { t: "Its creed is blunt: threats to home must be ended without prejudice, and its agents fight for the security and glory of their people.", p: "society", s: ["character"], src: FR_LA },
  ],
};

const FR_HAL = "forgottenrealms.fandom.com/wiki/Halaster_Blackcloak";

export const HALASTER: LibrarySubject = {
  id: "halaster",
  label: "Halaster Blackcloak",
  category: "person",
  facts: [
    { t: "Halaster Blackcloak is the infamous Mad Mage of Undermountain, and among the most prodigious wizards in the whole of the Realms.", p: "character", s: ["power", "legend"], src: FR_HAL },
    { t: "He came to the base of Mount Waterdeep over a thousand years ago, drawn there from a distant land by chance or by providence.", p: "origin", s: ["legend"], src: FR_HAL },
    { t: "Some say he hailed from the near-forgotten Cradlelands, the ancient empire that first spread humankind across Faerûn and beyond.", p: "origin", s: ["legend"], src: FR_HAL },
    { t: "He arrived in the company of seven apprentices, remembered simply as the Seven, and with their help summoned beings from other planes to raise his tower.", p: "origin", s: ["allies"], src: FR_HAL },
    { t: "He broke into the abandoned dwarven Underhalls beneath the mountain and claimed the endless tunnels for his own.", p: "origin", s: ["deeds"], src: FR_HAL },
    { t: "There he began to build Undermountain, transforming the ancient caves into the deadliest and most renowned dungeon in all Faerûn.", p: "deeds", s: ["legend"], src: FR_HAL },
    { t: "His chief delight is collecting: he captures strange and powerful creatures from across the multiverse and pens them within his dungeon.", p: "character", s: ["power"], src: FR_HAL },
    { t: "By his art he made Undermountain into a kind of mythal, and within its bounds he gained vast powers and a measure of immortality.", p: "power", s: ["legend"], src: FR_HAL },
    { t: "He was more gregarious as a young man, hosting magefairs and spellmoots and taking many apprentices to his side.", p: "character", s: ["origin"], src: FR_HAL },
    { t: "But as his power grew he dealt more and more with beings from other planes, and that dealing slowly drove him mad.", p: "origin", s: ["character"], src: FR_HAL },
    { t: "Within Undermountain he knows only rare moments of lucidity, yet outside its bounds his mind clears and his old dignity returns.", p: "character", s: [], src: FR_HAL },
    { t: "Lucid, he is cold, meticulous, and courtly — but thoroughly evil, tolerating no insult and forgetting neither an offense nor a kindness.", p: "character", s: [], src: FR_HAL },
    { t: "As a mighty archmage he guards his life with contingencies and with clones of himself, so that no single spell-battle can truly end him.", p: "power", s: [], src: FR_HAL },
    { t: "Within his dungeon he commands crawling claws, helmed horrors, and golems of every kind, and the portals that riddle its depths.", p: "power", s: [], src: FR_HAL },
    { t: "Several of his apprentices grew mighty in their own right, though every one of them was in time infected by his madness.", p: "allies", s: ["legacy"], src: FR_HAL },
    { t: "Trobriand the Metal Mage built constructs and monstrosities; Muiral the Misshapen grafted his own body onto a giant scorpion.", p: "allies", s: ["legend"], src: FR_HAL },
    { t: "Arcturia, perhaps his most ambitious apprentice, delighted in cruel experiments, polymorphing others and herself to suit her whims.", p: "allies", s: ["legend"], src: FR_HAL },
    { t: "One apprentice, Jhesiyra Kestellharp, turned herself into a living wish spell to escape him — yet even so he dragged her back to Undermountain.", p: "allies", s: ["legend"], src: FR_HAL },
    { t: "A ritual once scattered his essence across the planes, and only after the Spellplague ended could he draw himself back together and return.", p: "legacy", s: ["power", "legend"], src: FR_HAL },
    { t: "It is said that without Halaster, Undermountain would unravel — its portals running wild and spilling monsters up into the city above.", p: "legacy", s: ["power", "threat"], src: FR_HAL },
  ],
};

const FR_FG = "forgottenrealms.fandom.com/wiki/Frost_giant";

export const FROST_GIANTS: LibrarySubject = {
  id: "frost_giants",
  label: "Frost Giants",
  category: "creature",
  facts: [
    { t: "Frost giants, who call themselves isejotunen, are among the tallest of the true giants, towering higher than twenty feet.", p: "nature", s: [], src: FR_FG },
    { t: "Their skin and hair run through a wide range of blues and whites, though some bear dirty yellow hair, all of it suited to the ice.", p: "nature", s: ["habitat"], src: FR_FG },
    { t: "Their glacial coloring lets them camouflage in the icy lands they haunt, and they often raid during ice storms to hide their approach.", p: "behavior", s: ["nature"], src: FR_FG },
    { t: "They are immune to cold and to the frozen lands they dwell in, but they are vulnerable to fire, and grow uncomfortably hot in milder climes.", p: "nature", s: ["threat"], src: FR_FG },
    { t: "They are feared as brutal and wantonly destructive raiders, living by the hunt and by plunder rather than by any settled craft.", p: "behavior", s: ["threat"], src: FR_FG },
    { t: "Frost giants see no point in farming: their immense strength makes it far easier to simply raid smaller folk for whatever they need.", p: "behavior", s: ["society"], src: FR_FG },
    { t: "In the Realms they dwell in the cold reaches, and Icewind Dale in the far North is among their most storied haunts.", p: "habitat", s: [], src: FR_FG },
    { t: "They make their lairs in crude castles of ice and stone or in frigid caverns carved from the glaciers.", p: "habitat", s: [], src: FR_FG },
    { t: "Frost giant society is bound by the ordning, a strict order of rank determined by an individual's strength and skill at fighting.", p: "society", s: [], src: FR_FG },
    { t: "The leader of a community bears the title of jarl, claimed never by birth or vote but by raw might, and armed with the tribe's finest gear.", p: "society", s: ["governance"], src: FR_FG },
    { t: "A jarl may bear armor of dragon scales and a maul or warpick fashioned from a dragon's teeth or claws.", p: "society", s: [], src: FR_FG },
    { t: "The jarl assigns each giant its task — childrearing, crafting, or hunting — according to that giant's strength and endurance.", p: "society", s: ["governance"], src: FR_FG },
    { t: "When giants of different clans meet and their rank is unclear, they wrestle for dominance, sometimes as festival, sometimes as chaotic brawl.", p: "society", s: ["behavior"], src: FR_FG },
    { t: "Beneath the ordning, the deepest bond in frost giant life is that of family, honored above nearly all else.", p: "society", s: ["character"], src: FR_FG },
    { t: "Their skalds are runecasters and poets who record the sagas of their leaders, earning honor equal to any warrior's.", p: "society", s: [], src: FR_FG },
    { t: "So central is lineage that each figure in a saga is introduced with a full recitation of ancestry, sung to fitting music.", p: "society", s: [], src: FR_FG },
    { t: "They speak their own tongue, Jotun, and worship Thrym, the giant god of cold and ice.", p: "society", s: ["faith"], src: FR_FG },
    { t: "A frost giant may live to two hundred and fifty years, though by their violent way of life most die in battle long before.", p: "nature", s: ["behavior"], src: FR_FG },
    { t: "In battle they open at a distance, hurling great rocks, then close to wade in with enormous battleaxes.", p: "threat", s: ["behavior"], src: FR_FG },
    { t: "In Icewind Dale the ghosts of the old jarls are said to gather at the Jarlmoot, a ring of seven giant thrones where they boast of the deeds of their lives.", p: "legend", s: ["habitat"], src: FR_FG },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 6 (30 Jul) — FAMOUS OBJECT, the thinnest DMG category (3 sourced, 17 open at batch start).
// Four subjects, four regions: heartlands, barovia, moonsea, silvermarches. All four chosen because
// the wiki carries enough to fill 20 honestly; see FINDINGS B-42 for the two candidates that do not.
// ---------------------------------------------------------------------------------------
const FR_COH = "forgottenrealms.fandom.com/wiki/Crown_of_Horns";
const FR_HH = "forgottenrealms.fandom.com/wiki/Horned_harbinger";

export const CROWN_OF_HORNS: LibrarySubject = {
  id: "crown_of_horns",
  label: "The Crown of Horns",
  category: "object",
  facts: [
    { t: "The Crown of Horns was an evil and intelligent artifact of great power, and it carried a long history of corruption and tragedy with it.", p: "make", s: ["legend"], src: FR_COH },
    { t: "Its origins are disputed: some hold it was forged in ancient Netheril, others that Myrkul, the old god of death, made it himself.", p: "origin", s: ["legend", "faith"], src: FR_COH },
    { t: "One account names the Netherese archwizard Trebbe as its maker, the same who founded the flying enclave of Shadowtop Borough.", p: "origin", s: ["make"], src: FR_COH },
    { t: "In its first shape it was a helmet of electrum covered over with small horns, set with a row of black gems around a black diamond.", p: "make", s: [], src: FR_COH },
    { t: "After it was broken and remade it took the form of a silver circlet with four bone horns at its edge and a black diamond at the brow.", p: "make", s: ["history"], src: FR_COH },
    { t: "Before Myrkul took it, the only powers anyone could name in it were its own awareness and its knack for working on the minds of those who wore it.", p: "power", s: ["make"], src: FR_COH },
    { t: "Once the god was in it, the crown wrapped its wearer in an aura of undeath much like the aura that surrounds a lich.", p: "power", s: ["faith"], src: FR_COH },
    { t: "A wearer became immune to necromantic magic and to death magic of every kind.", p: "power", s: [], src: FR_COH },
    { t: "No one could take the crown off again unless the will inside it wanted a new host to wear it.", p: "power", s: ["intrigue"], src: FR_COH },
    { t: "Wearers grew steadily more suspicious about keeping it, and in the end gave way to madness and undeath and became liches themselves.", p: "power", s: ["legend"], src: FR_COH },
    { t: "It gave command over the undead and hung a fear about its wearer that few could stand against.", p: "power", s: ["conflict"], src: FR_COH },
    { t: "Anyone who came within a hundred feet of it felt an urge to take the crown for themselves.", p: "power", s: ["intrigue"], src: FR_COH },
    { t: "Those who touched the crown and held to Myrkul after his death were called Horned Harbingers, and by the last account the crown had passed to one of them, a yuan-ti pureblood who then vanished from Skullport altogether.", p: "legacy", s: ["faith", "underground"], src: FR_HH },
    { t: "Its ray of undeath killed where it struck and raised the slain again as lesser shadowraths.", p: "power", s: ["conflict"], src: FR_COH },
    { t: "The power called Myrkul's Hand sheathed the wearer's hands in black flame, and their touch set creatures alight with it.", p: "power", s: ["make"], src: FR_COH },
    { t: "It is said the crown exploded while Trebbe worked on it and took a whole block of the enclave with it, though the crown itself was only lost.", p: "history", s: ["origin"], src: FR_COH },
    { t: "Centuries later the archwizard Requiar used it to kill thirty of his peers and seize Shadowtop Borough, and it drove him witless for his trouble.", p: "history", s: ["conflict"], src: FR_COH },
    { t: "The lich Aumvor the Undying left it where Laeral Silverhand and her company the Nine would find it, meaning to make her his bride.", p: "history", s: ["intrigue"], src: FR_COH },
    { t: "Laeral put it on, and the crown's power fought her spellfire and drove her into madness instead.", p: "history", s: ["conflict"], src: FR_COH },
    { t: "The archmage Khelben Arunsun sundered it and shut the pieces inside Blackstaff Tower, and when Myrkul died in the Time of Troubles he tore the shards out again and reforged them around what was left of himself.", p: "history", s: ["legend", "faith"], src: FR_COH },
  ],
};

const FR_HSR = "forgottenrealms.fandom.com/wiki/Holy_Symbol_of_Ravenkind";

export const HOLY_SYMBOL_OF_RAVENKIND: LibrarySubject = {
  id: "holy_symbol_of_ravenkind",
  label: "The Holy Symbol of Ravenkind",
  category: "object",
  facts: [
    { t: "The Holy Symbol of Ravenkind was a single amulet, holy to the good folk of Barovia and to no other place.", p: "make", s: ["faith"], src: FR_HSR },
    { t: "It was known first by a plainer name, the Holy Symbol of the High Priest.", p: "history", s: ["faith"], src: FR_HSR },
    { t: "The amulet was round and shaped like the sun, and worked in platinum.", p: "make", s: [], src: FR_HSR },
    { t: "A great red crystal sat at the sun's center.", p: "make", s: [], src: FR_HSR },
    { t: "Symbols of light and of truth were cut into it around the stone.", p: "make", s: ["faith"], src: FR_HSR },
    { t: "It held ten charges of divine power and drew back five to ten of them each day at dawn.", p: "power", s: [], src: FR_HSR },
    { t: "One charge would hold a vampire or its spawn fast where it stood.", p: "power", s: ["conflict"], src: FR_HSR },
    { t: "A cleric or paladin turning undead could spend three charges to put real weight behind it.", p: "power", s: ["faith", "conflict"], src: FR_HSR },
    { t: "Five charges drew true sunlight out of the stone at its heart, which is death to anything that drinks blood.", p: "power", s: ["conflict"], src: FR_HSR },
    { t: "That light reached thirty feet and could be held for as long as ten minutes.", p: "power", s: [], src: FR_HSR },
    { t: "Only good paladins and clerics could wield it at all.", p: "faith", s: ["power"], src: FR_HSR },
    { t: "Its deeper powers opened only to a wielder who had bound themselves to it by ritual.", p: "faith", s: ["power"], src: FR_HSR },
    { t: "That binding asked fifteen hundred gold pieces' worth of offerings.", p: "faith", s: [], src: FR_HSR },
    { t: "Before the ritual could even begin, the wearer had to have destroyed a vampire or one of its spawn while wearing the amulet.", p: "faith", s: ["conflict"], src: FR_HSR },
    { t: "Then came eight hours of prayer with the amulet in hand, to a good god or to a raven intercessor, and a tithe paid.", p: "faith", s: [], src: FR_HSR },
    { t: "The binding cost the bearer a small hurt that never healed, and parting from the amulet afterwards left them weakened.", p: "faith", s: ["power"], src: FR_HSR },
    { t: "A bound wearer could call up dancing lights, a flare, or plain light at will on a word.", p: "power", s: [], src: FR_HSR },
    { t: "Bound, they could feel the undead within sixty feet by concentrating, and could wound undead that shrugged off ordinary and magical harm alike.", p: "power", s: ["conflict"], src: FR_HSR },
    { t: "A skilled maker of wondrous things could copy it with a detect evil spell, a thousand gold in materials, and two days at the work.", p: "make", s: [], src: FR_HSR },
    { t: "It is older than any church that stood in Strahd's day, and the story goes that a giant raven, or an angel wearing that shape, brought it to the paladin Lugdana among Barovia's first settlers; she hunted vampires with it until she died, and the clergy of Ravenloft took it up after her.", p: "origin", s: ["legend", "history", "faith"], src: FR_HSR },
  ],
};

const FR_POR = "forgottenrealms.fandom.com/wiki/Pool_of_radiance";

export const POOL_OF_RADIANCE: LibrarySubject = {
  id: "pool_of_radiance",
  label: "The Pool of Radiance",
  category: "object",
  facts: [
    { t: "A pool of radiance was a thing that occurred of itself, a liquid much like water but for its shimmer and its glow.", p: "make", s: ["origin"], src: FR_POR },
    { t: "The pools were among the most potent sources of arcane power anywhere in the Realms.", p: "power", s: [], src: FR_POR },
    { t: "Their water was raw magic: now and then the Weave gathers its energies in one place, and that gathering always shows itself as a glowing liquid.", p: "origin", s: ["power"], src: FR_POR },
    { t: "Sages compared the pools to exposed nerve clusters, or to the lymph nodes of a body, serving the Weave in the same way.", p: "origin", s: ["legend"], src: FR_POR },
    { t: "One could rise anywhere at all: in a scorching desert, in the middle of a populated city, in a shaded grove nobody visits.", p: "origin", s: ["landmark"], src: FR_POR },
    { t: "The water could not be carried off. Separated from the body of the pool, its power was gone inside a minute.", p: "make", s: ["power"], src: FR_POR },
    { t: "A spellcaster who tapped a pool could lift their own power to an extraordinary height, which is why wizards of every alignment hunted them.", p: "power", s: ["intrigue"], src: FR_POR },
    { t: "The raw power of a pool was always stronger than a wizard's will, and most who tried to master one met backlash instead.", p: "power", s: ["legend"], src: FR_POR },
    { t: "Someone with no arcane skill at all might touch the water and walk away entirely unchanged.", p: "power", s: [], src: FR_POR },
    { t: "But a creature with any arcane talent who touched it was almost certainly altered forever, and what the change would be was a matter of chance.", p: "power", s: ["legend"], src: FR_POR },
    { t: "Among the recorded outcomes are instant death, instant aging, and dying on the spot only to rise again as undead.", p: "power", s: ["conflict"], src: FR_POR },
    { t: "Others grew black snake scales across the whole body and went blind while their remaining senses sharpened beyond measure.", p: "power", s: [], src: FR_POR },
    { t: "Others still were remade as gilled things that could live only in salt water.", p: "power", s: [], src: FR_POR },
    { t: "Whatever a pool did to a creature was permanent.", p: "power", s: [], src: FR_POR },
    { t: "A pool could be corrupted by ritual or by the power of some great creature of the planes, and a corrupted pool was called a pool of darkness.", p: "power", s: ["intrigue"], src: FR_POR },
    { t: "A pool took on the nature of whatever successfully tapped it, and good powers were known to corrupt pools too, mostly by accident.", p: "power", s: ["legend"], src: FR_POR },
    { t: "In the middle of the fourteenth century a pool was found in the caves beneath Valjevo Castle in Phlan, with the possessing spirit Tyranthraxus asleep in its waters.", p: "history", s: ["underground"], src: FR_POR },
    { t: "Tyranthraxus took the body of a bronze dragon that had decided to bathe in the glowing water, corrupted the pool, and ruled the ruins of Phlan from the castle above it.", p: "history", s: ["conflict", "legend"], src: FR_POR },
    { t: "The corruption at Phlan was worked by assembling a hexagonal figure of power with ioun stones set into its corners.", p: "make", s: ["intrigue"], src: FR_POR },
    { t: "After the Time of Troubles the Phlan pool was ordinary fresh water again, and the city still set guards on the pool chamber and on Kuto's Well above it; left uncorrupted, a pool sinks back into the Weave in its own time.", p: "history", s: ["governance", "origin"], src: FR_POR },
  ],
};

const FR_SOM = "forgottenrealms.fandom.com/wiki/Staff_of_the_magi";

export const STAFF_OF_THE_MAGI: LibrarySubject = {
  id: "staff_of_the_magi",
  label: "The Staff of the Magi",
  category: "object",
  facts: [
    { t: "The staff of the magi was reckoned an artifact, not merely a powerful staff.", p: "make", s: ["power"], src: FR_SOM },
    { t: "It was a long wooden staff cased in iron and written over with magical sigils and runes.", p: "make", s: [], src: FR_SOM },
    { t: "Some of its powers were always present; others had to be spent out of the staff's charges.", p: "power", s: ["make"], src: FR_SOM },
    { t: "It gave its bearer resistance to spells simply by being held.", p: "power", s: [], src: FR_SOM },
    { t: "The bearer could willingly drop that resistance to drink in a spell's energy and add charges to the staff.", p: "power", s: [], src: FR_SOM },
    { t: "If the charges ever rose past fifty, or if the bearer chose it, the staff broke and let its magic out all at once.", p: "power", s: ["make"], src: FR_SOM },
    { t: "In that burst the bearer stood even odds of being destroyed outright or being carried away to another plane entirely.", p: "power", s: ["legend"], src: FR_SOM },
    { t: "Detect magic, hold portal, light, mage armor and mage hand could be drawn from it as often as the bearer liked.", p: "power", s: [], src: FR_SOM },
    { t: "Later accounts of the staff put arcane lock, enlarge and reduce, and protection from evil and good among the powers it gave freely.", p: "power", s: ["history"], src: FR_SOM },
    { t: "A staff of the magi was made with fifty charges in it.", p: "make", s: ["power"], src: FR_SOM },
    { t: "A single charge bought dispel magic, fireball, ice storm, invisibility, knock, lightning bolt, passwall, pyrotechnics, wall of fire, or web.", p: "power", s: [], src: FR_SOM },
    { t: "Two charges reached further still: plane shift, telekinesis of up to four hundred pounds, or a summoning of the ninth order.", p: "power", s: [], src: FR_SOM },
    { t: "Later reckonings price the same magics differently, asking three charges for dispel magic, five for passwall, and seven to conjure an elemental.", p: "power", s: ["history"], src: FR_SOM },
    { t: "Its aura is described as strong in every school of magic at once.", p: "power", s: ["make"], src: FR_SOM },
    { t: "In its most recent reckoning it is a legendary item, and only a sorcerer, warlock or wizard can attune to it.", p: "power", s: ["make"], src: FR_SOM },
    { t: "Anastra Syluné Silverhand, one of the Seven Sisters, died breaking her staff of the magi to shield the Twisted Tower.", p: "history", s: ["legacy", "conflict"], src: FR_SOM },
    { t: "Sammaster carried one, who had been a Chosen of Mystra before he founded the Cult of the Dragon.", p: "history", s: ["legend", "faith"], src: FR_SOM },
    { t: "Rhangaun, a lich and a senior member of the Twisted Rune, held one, as did Larloch, once Sorcerer-King of Jiksidur.", p: "history", s: ["intrigue"], src: FR_SOM },
    { t: "Ulraunt, Keeper of the Tomes at Candlekeep, was said to bear a staff with all the powers of one and several more besides.", p: "history", s: ["legend"], src: FR_SOM },
    { t: "Some bearers are remembered chiefly by where they were lost: Hoch Miraz of Calimshan is thought to have gone down off Gundarlun with his, and Braethan Cazondur held one when he moved against the Open Lord of Waterdeep.", p: "history", s: ["intrigue", "legacy"], src: FR_SOM },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 7 (30 Jul) — PERSON and CREATURE, the two thinnest DMG categories at batch start (4 each).
// Five subjects, five regions: avernus, moonsea, chult, feywild, wildspace. Leaves the corpus at
// location 6 / creature 7 / person 6 / object 7 / legend 7 — flat across all five DMG topic types.
// ---------------------------------------------------------------------------------------
const FR_ZAR = "forgottenrealms.fandom.com/wiki/Zariel";

export const ZARIEL: LibrarySubject = {
  id: "zariel",
  label: "Zariel",
  category: "person",
  facts: [
    { t: "Zariel, titled the Archduchess of Avernus and the Lord of the First, was the archdevil who ruled the first layer of the Nine Hells.", p: "power", s: ["governance"], src: FR_ZAR },
    { t: "She was an angel of the Seven Heavens before she became an archdevil, and she is one of the few who fell that far.", p: "origin", s: ["legend"], src: FR_ZAR },
    { t: "She was originally a solar under the Morning Lord Lathander, and her name is said to have meant Companion of Light.", p: "origin", s: ["faith"], src: FR_ZAR },
    { t: "In her first form she was a beautiful solar with flawless skin, gold-feathered wings, and a blindfold across her eyes.", p: "origin", s: [], src: FR_ZAR },
    { t: "After her fall a halo of fire burned above her head, her skin was scorched, and her wings were ruined by flame and turned leathery.", p: "character", s: ["legend"], src: FR_ZAR },
    { t: "She put the blindfold aside, and what it had covered were eyes that glowed with white-hot rage.", p: "character", s: [], src: FR_ZAR },
    { t: "She lost one of her hands in the fall and put a flail in its place.", p: "character", s: ["conflict"], src: FR_ZAR },
    { t: "From Mount Celestia she had been set to track how the Blood War went, and from watching it she came to want a part in it.", p: "origin", s: ["deeds"], src: FR_ZAR },
    { t: "She held that a single assault from the hosts of Celestia could end both sides of that war at once and free the multiverse of them.", p: "character", s: ["faith"], src: FR_ZAR },
    { t: "Her superiors forbade her again and again to enter the conflict, and she chastised them for standing by as neutral observers.", p: "allies", s: ["conflict"], src: FR_ZAR },
    { t: "She drew the line when Yeenoghu slaughtered a village that stood under her protection.", p: "deeds", s: ["conflict"], src: FR_ZAR },
    { t: "Late in 1354 DR she defied her orders and led the Hellriders of Elturel, mortals she had trained herself, into Avernus, in the battle since called the Ride.", p: "deeds", s: ["conflict", "legend"], src: FR_ZAR },
    { t: "The army was outnumbered and broke, and the survivors fled in terror and shame; Asmodeus sent osyluths to lift her body out from under a mountain of the dead.", p: "deeds", s: ["conflict"], src: FR_ZAR },
    { t: "Asmodeus let her recover, congratulated her, and made her an archdevil and his champion.", p: "allies", s: ["deeds"], src: FR_ZAR },
    { t: "She judged others by their skill at arms and their willingness to use it, and prized zealous fury as highly as discipline.", p: "character", s: [], src: FR_ZAR },
    { t: "She was reckless and refused to play politics, which made her a pariah among the other archdevils, any of whom would gladly depose her.", p: "character", s: ["allies", "intrigue"], src: FR_ZAR },
    { t: "She could beat a balor in single combat and needed only a few seconds afterwards to collect herself.", p: "power", s: ["conflict"], src: FR_ZAR },
    { t: "Her powers took on a motif of fire: fireballs and walls of flame at will, weapons that seared, and a stare that could set a creature alight.", p: "power", s: [], src: FR_ZAR },
    { t: "Where a solar can cast resurrection and heal disease or blindness with a touch, she instead cast finger of death, and her touch inflicted the very things an angel's touch would cure.", p: "power", s: ["legend"], src: FR_ZAR },
    { t: "The longsword she lost along with her hand became the Sword of Zariel, hidden away by her most loyal general and by Lulu, the hollyphant who had been her friend for centuries and who grieved what she became.", p: "legacy", s: ["allies", "legend"], src: FR_ZAR },
  ],
};

const FR_MAN = "forgottenrealms.fandom.com/wiki/Manshoon";
const FR_SCL = "forgottenrealms.fandom.com/wiki/Stasis_clone";
const FR_CLN = "forgottenrealms.fandom.com/wiki/Cloning";

export const MANSHOON: LibrarySubject = {
  id: "manshoon",
  label: "Manshoon",
  category: "person",
  facts: [
    { t: "Manshoon founded the Zhentarim, the organization better known as the Black Network.", p: "deeds", s: ["allies"], src: FR_MAN },
    { t: "He founded the Black Network in the Year of Bright Dreams, 1261 DR.", p: "deeds", s: ["origin"], src: FR_MAN },
    { t: "Feeling exposed, he first gathered a cabal of mages he called his Black Cloaks to guard him, and recruited Fzoul Chembryl early among them.", p: "deeds", s: ["allies", "intrigue"], src: FR_MAN },
    { t: "He trusted none of his new allies: he knew the priests would obey Bane before anyone, and he assumed the wizards were as ambitious as he was.", p: "character", s: ["intrigue"], src: FR_MAN },
    { t: "The stasis clone spell was developed by him and heavily used by him.", p: "power", s: ["deeds"], src: FR_SCL },
    { t: "A stasis clone was identical to its original in every physical particular, and kept all the memories, experience, skills and appearance the original had when the spell's component was taken.", p: "power", s: [], src: FR_SCL },
    { t: "A clone was always slightly less vital than what it copied, so cloning a clone and then cloning that would in the end produce something too weak to exist at all.", p: "power", s: ["legend"], src: FR_SCL },
    { t: "He was slain in the Year of the Tankard, 1370 DR, by his own ally Fzoul Chembryl and by Lord Orgauth.", p: "deeds", s: ["conflict", "intrigue"], src: FR_MAN },
    { t: "About a dozen of his clones woke at once and turned immediately on his murderers.", p: "legacy", s: ["conflict"], src: FR_CLN },
    { t: "Malevolent archmages appeared across the Realms — in Cormyr, in the Dalelands, at Darkhold and beyond — each of them convinced it was the real Manshoon.", p: "legacy", s: ["legend"], src: FR_CLN },
    { t: "Each was compelled to kill any other of its kind on sight, and the fighting that followed is remembered as the Manshoon Wars.", p: "legacy", s: ["conflict"], src: FR_SCL },
    { t: "Only three of his clones are known to have lived into the late 1370s DR, having mastered the killing compulsion by spells and devices.", p: "legacy", s: ["power"], src: FR_MAN },
    { t: "Some of the survivors lived out secluded lives under the protection of the Realms' most powerful wizards, among them Halaster Blackcloak of Undermountain, the lich-king Larloch, and even the Simbul of Aglarond.", p: "legacy", s: ["allies", "intrigue"], src: FR_SCL },
    { t: "One surviving clone returned to the Zhentarim meaning to carry on the research and leave the running of the Black Network to others.", p: "character", s: ["allies"], src: FR_SCL },
    { t: "Orbakh, who led the Night Masks of Westgate, was a clone that had been infected with vampirism while it lay in stasis.", p: "legacy", s: ["intrigue"], src: FR_SCL },
    { t: "Orbakh was destroyed in a spell-duel with Elminster.", p: "legacy", s: ["conflict"], src: FR_CLN },
    { t: "The last surviving clone took the original name again and moved to the haunted castle of Stormwatch.", p: "legacy", s: ["deeds"], src: FR_MAN },
    { t: "There he rebuilt the Zhentarim's strength, adding his own undead thralls to the few living Zhents who remained, holding Stormwatch and Darkhold as his bases.", p: "deeds", s: ["governance", "conflict"], src: FR_MAN },
    { t: "What he rebuilt was only a mercenary company, propped up by priests of Cyric out of Darkhold, and never the organization it had been.", p: "governance", s: ["legacy"], src: FR_MAN },
    { t: "Long after the Spellplague the vampiric Manshoon set about taking Cormyr, gathering word of items said to hold the spirits of the Nine — the blueflame ghosts — whose power together was rumored enough to breach the wards on the royal palace at Suzail.", p: "deeds", s: ["intrigue", "power"], src: FR_MAN },
  ],
};

const FR_YT = "forgottenrealms.fandom.com/wiki/Yuan-ti";
const FR_YTP = "forgottenrealms.fandom.com/wiki/Yuan-ti_pureblood";
const FR_YTM = "forgottenrealms.fandom.com/wiki/Yuan-ti_malison";
const FR_YTA = "forgottenrealms.fandom.com/wiki/Yuan-ti_abomination";

export const YUAN_TI: LibrarySubject = {
  id: "yuan_ti",
  label: "Yuan-ti",
  category: "creature",
  facts: [
    { t: "The yuan-ti were made millennia ago by the sarrukh, one of the creator races, in controlled magical breeding that combined humans, serpents, and the sarrukh themselves.", p: "origin", s: ["nature"], src: FR_YTM },
    { t: "There are three main breeds: the purebloods, the halfbloods that are also called malisons, and the abominations.", p: "nature", s: ["society"], src: FR_YTP },
    { t: "The more serpentine a yuan-ti is, the higher it stands: abominations above halfbloods, halfbloods above purebloods.", p: "society", s: ["nature"], src: FR_YT },
    { t: "Within a breed they are ranked by what they have achieved and by the favor Sseth is seen to show them.", p: "society", s: ["faith"], src: FR_YT },
    { t: "A pureblood looks nearly human, betrayed only by snake-like eyes, a forked tongue, and patches of scale on the skin.", p: "nature", s: [], src: FR_YTP },
    { t: "Purebloods stand and weigh within the human range and grow up at the same rate a human does.", p: "nature", s: [], src: FR_YTP },
    { t: "Even the purebloods hold psionic power, and like all their kind they can take the form of a serpent.", p: "nature", s: ["threat"], src: FR_YTP },
    { t: "Purebloods serve as liaisons, agents, spies and assassins, precisely because they can hide what they are.", p: "society", s: ["intrigue"], src: FR_YTP },
    { t: "Purebloods also oversee the lesser servitor breeds, the broodguards and the tainted ones.", p: "society", s: [], src: FR_YTP },
    { t: "Halfbloods take their orders from abominations and rule the purebloods in their turn.", p: "society", s: [], src: FR_YTM },
    { t: "Halfbloods serve as captains and elite troops and make up the bulk of yuan-ti defenses.", p: "society", s: ["threat"], src: FR_YTM },
    { t: "Almost every priest of Sseth is a halfblood of the serpent-headed sort.", p: "faith", s: ["society"], src: FR_YTM },
    { t: "Halfbloods are cleverer than purebloods and a little less clever than abominations, and they are always plotting.", p: "behavior", s: [], src: FR_YTM },
    { t: "An abomination looks like a massive snake some eight to twelve feet long, with scale-covered humanoid arms.", p: "nature", s: [], src: FR_YTA },
    { t: "Abominations hold both great intelligence and powerful magic, and form the highest caste of the whole race.", p: "nature", s: ["society"], src: FR_YTA },
    { t: "Abominations find humans repugnant and barely tolerate even purebloods.", p: "behavior", s: [], src: FR_YTA },
    { t: "Abominations are obligate carnivores who prefer warm-blooded prey, and their favorite meals are birds and humans.", p: "nature", s: ["threat"], src: FR_YTA },
    { t: "They hatch from eggs, come to adulthood by twelve years, and live eighty years on average, though some reach a hundred and twenty.", p: "nature", s: [], src: FR_YTM },
    { t: "Their culture centers on their temples, which are often found in ancient ruins or hidden deep beneath human cities.", p: "society", s: ["underground"], src: FR_YT },
    { t: "Most worship Sseth, and the other serpent gods some of them have followed over the years are held to be either masks Sseth wears or false gods of the Scaleless Ones.", p: "faith", s: ["legend"], src: FR_YT },
  ],
};

const FR_HAG = "forgottenrealms.fandom.com/wiki/Hag";
const FR_GH = "forgottenrealms.fandom.com/wiki/Green_hag";
const FR_ANN = "forgottenrealms.fandom.com/wiki/Annis";
const FR_NH = "forgottenrealms.fandom.com/wiki/Night_hag";
const FR_HGL = "forgottenrealms.fandom.com/wiki/Hag_language";

export const HAGS: LibrarySubject = {
  id: "hags",
  label: "Hags",
  category: "creature",
  facts: [
    { t: "How long a hag lies dormant before she comes into the world is said to vary with the method used to make her, but it always ends in what hags themselves call the change.", p: "origin", s: ["nature"], src: FR_HAG },
    { t: "One born after the ordinary nine months usually lives to her mid-forties showing only small hints of what she will become.", p: "nature", s: [], src: FR_HAG },
    { t: "A young annis is often dark-skinned, powerful, and aggressive well before the change.", p: "nature", s: ["behavior"], src: FR_HAG },
    { t: "A young green hag is an attractive prima donna, and a young sea hag plain and pale with a toxic temper.", p: "nature", s: ["behavior"], src: FR_HAG },
    { t: "Past the mid-forties the alterations come plainly, until the juvenile is reborn a true hag of the same kind as her mother.", p: "nature", s: [], src: FR_HAG },
    { t: "A hag made from a devoured child grows far faster: that child lives only to her thirteenth birthday, and then becomes a near-copy of the hag who took her.", p: "threat", s: ["nature"], src: FR_HAG },
    { t: "One origin story ties the green, annis, and sea hags together with the hag goddess Cegilune, and ogres and hill giants tell a matching myth.", p: "origin", s: ["legend", "faith"], src: FR_HAG },
    { t: "In that story the world was young and dark and many terrors lurked in the shadows, and the fearful races sought protection from what went bump in the night.", p: "origin", s: ["legend"], src: FR_HAG },
    { t: "The moon goddess, left full of hate, spent what divinity remained to her on ruining the mortal races she thought had betrayed her and on putting out the risen stars she took for impostor gods.", p: "origin", s: ["faith", "legend"], src: FR_HAG },
    { t: "Hag history is hard to trace at all, because hags lie and exaggerate in their own interest as a matter of course.", p: "behavior", s: ["legend"], src: FR_ANN },
    { t: "Green hags are the commonest kind, foul crones known for deceitful ways and corrupting natures.", p: "nature", s: ["behavior"], src: FR_GH },
    { t: "A green hag living near a river or a swamp is called a shellycoat.", p: "nature", s: ["habitat"], src: FR_GH },
    { t: "Like dark druids they hold a strong connection to the natural world, and they prey on primal vices to sow anguish and drag everything down into bestial savagery.", p: "behavior", s: ["threat"], src: FR_GH },
    { t: "Of all the hags the green are the least physically menacing, and their resemblance to ordinary people is exactly what makes them worse.", p: "nature", s: ["threat"], src: FR_GH },
    { t: "Being the most tolerant of their kind, green hags can infiltrate the very civilizations they mean to terrorize, and have been known to join adventuring parties to get it done.", p: "behavior", s: ["intrigue"], src: FR_GH },
    { t: "Green hags blend into towns and cities more readily than other hags, and will hunt prey in its own home rather than lure it out to theirs.", p: "behavior", s: ["habitat", "threat"], src: FR_GH },
    { t: "Covens form far more often among green hags than among any other kind, including covens that mix their sort with others.", p: "society", s: ["behavior", "nature"], src: FR_GH },
    { t: "Annis hags have bruise-blue skin and nubs of black horn, which led some scholars to tie them to ogre mages and others to the night hags.", p: "nature", s: ["origin"], src: FR_ANN },
    { t: "One theory holds green hags to be the degenerate grandchildren of night hags and mortals, and the annis the offspring of green hags with ogres and giants, shorter-lived and poorer in magic; hags share a tongue that scholars call Annis after them.", p: "origin", s: ["legend", "people"], src: FR_HGL },
    { t: "The Sewn Sisters were a coven of night hags who helped Acererak raise the Soulmonger in Chult, and so set the death curse loose on the world.", p: "legend", s: ["faith", "threat"], src: FR_NH },
  ],
};

const FR_GY = "forgottenrealms.fandom.com/wiki/Githyanki";
const FR_GSS = "forgottenrealms.fandom.com/wiki/Githyanki_silver_sword";

export const GITHYANKI: LibrarySubject = {
  id: "githyanki",
  label: "Githyanki",
  category: "creature",
  facts: [
    { t: "The githyanki are a race of Astral Plane dwellers, survivors of a long enslavement by mind flayers who became ruthless raiders of many worlds.", p: "origin", s: ["habitat", "threat"], src: FR_GY },
    { t: "The word githyanki means followers of Gith, or children of Gith, in the Gith tongue.", p: "people", s: ["origin"], src: FR_GY },
    { t: "They are tall and slender, with rough leathery yellow skin, bright black eyes set deep, long angular skulls, and ears pointed and serrated at the back.", p: "nature", s: [], src: FR_GY },
    { t: "Every one of them holds psionic power, a legacy of the centuries their masters spent breeding and altering them.", p: "nature", s: ["origin"], src: FR_GY },
    { t: "Because time does not pass in the Astral Plane, they cannot age there, so eggs must be hatched and the young raised in other planes until they are grown.", p: "nature", s: ["habitat"], src: FR_GY },
    { t: "The young are raised in hidden creches in remote corners of the Material Plane by caretakers called varsh, and a clutch is timed so that every egg hatches at once.", p: "society", s: ["habitat"], src: FR_GY },
    { t: "There are no families among them; children are raised collectively, and the closest bonds most form are with their training partners.", p: "society", s: ["behavior"], src: FR_GY },
    { t: "Training is rigid from a very young age, expectations rise and punishments worsen, and fights to the death among trainees are not uncommon.", p: "society", s: ["threat"], src: FR_GY },
    { t: "The last test of a young githyanki's training is to kill a mind flayer and carry its head to Vlaakith in Tu'narath, which is how one enters adulthood.", p: "society", s: ["faith", "conflict"], src: FR_GY },
    { t: "Their society is martial and meritocratic, with no regard at all for blood ties, and both males and females train hard in magic and in arms.", p: "society", s: [], src: FR_GY },
    { t: "Their society divides into three castes: the military, the smaller mlar who handle crafts, and the g'lathk who handle food and labor.", p: "society", s: [], src: FR_GY },
    { t: "The mlar build the weapons, the astral ships, and every building and tool, using psionic power to shape stone and fabricate at a speed no ordinary worker could match.", p: "society", s: ["structure"], src: FR_GY },
    { t: "The g'lathk coax food out of a plane where nothing grows, raising sunless fungus, harvesting what grows on the bodies of the god-isles, or cultivating in tanks of treated water.", p: "society", s: ["habitat"], src: FR_GY },
    { t: "Their digestive systems have atrophied from long spells without eating, so away from the Astral Plane they need frequent meals, often heavy in meat, and they find the gravity of Material worlds uncomfortable.", p: "nature", s: ["habitat"], src: FR_GY },
    { t: "They have no religion, having built their cities on the corpses of dead gods and having a culture too individual for organized faith to take root, but they revere Vlaakith almost to that pitch.", p: "faith", s: ["society"], src: FR_GY },
    { t: "Their capital and largest city, Tu'narath, stands on the corpse of a dead power known only as The One in the Void.", p: "structure", s: ["habitat", "legend"], src: FR_GY },
    { t: "Raids are the center of their culture, and are opened by Vlaakith herself, who can hold a gate into a Material world long enough for thousands of soldiers and tens of sky ships to pass through in formation.", p: "behavior", s: ["threat", "conflict"], src: FR_GY },
    { t: "A small contingent of red dragons serves high-ranking githyanki as mounts, under a treaty struck with Tiamat early in their history; the terms forbid the githyanki from bending the dragons with psionics.", p: "allies", s: ["society", "legend"], src: FR_GY },
    { t: "Every knight carries a silver sword, greatswords that wound the mind as well as the body and that can sever the silver cord tying an astral traveler's soul to the body it left behind.", p: "threat", s: ["power", "society"], src: FR_GY },
    { t: "Some sages held that making a silver sword required a fragment of the Living Gate, which is why the githyanki search the Astral Plane for such fragments in secret expeditions, and any outsider found holding a silver sword is pursued without rest.", p: "behavior", s: ["origin", "intrigue"], src: FR_GSS },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 8 (30 Jul) — EVENT OR LOCATION and PERSON, tied thinnest at 6 each. Two subjects, two
// regions (moonsea, waterdeep), which brings every one of the five DMG categories to exactly 7.
// Smaller than the last two batches on purpose: sourcing is the expensive step, not the writing,
// and two subjects fully sourced to 20 beats four thinned to fit a number.
// ---------------------------------------------------------------------------------------
const FR_PHL = "forgottenrealms.fandom.com/wiki/Phlan";
const FR_OPH = "forgottenrealms.fandom.com/wiki/Phlan/Old_Phlan";

export const PHLAN: LibrarySubject = {
  id: "phlan",
  label: "Phlan",
  category: "location",
  facts: [
    { t: "Phlan, called the Jewel of the Moonsea, was a frontier town on the northern shore of that sea with a long and much-interrupted history.", p: "structure", s: ["trade"], src: FR_PHL },
    { t: "The town was founded in the Year of Shying Eyes, 367 DR, as a trading post between the elves of Myth Drannor and the dwarves of the Dragonspine Mountains.", p: "origin", s: ["trade"], src: FR_PHL },
    { t: "It was built atop Valjevo Isle, a small island in the delta at the mouth of the Stojanow, and grew up around the castle that shares the isle's name.", p: "origin", s: ["structure"], src: FR_PHL },
    { t: "Cycles of ruin and stubborn rebuilding left the place walled into two halves: the ruined neighborhoods of Old Phlan and the surviving community of Civilized Phlan.", p: "structure", s: ["conflict"], src: FR_PHL },
    { t: "The town was leveled for the first time in the Year of the Blue Shield, 400 DR, when the Dark Alliance of humanoids swept down onto the Moonsea.", p: "conflict", s: ["origin"], src: FR_PHL },
    { t: "After three centuries lying in ruin, Milsor the Valjevo had the town rebuilt in 712 DR and commissioned Valjevo Castle, which took eighteen years to finish.", p: "origin", s: ["landmark"], src: FR_PHL },
    { t: "Refugees poured in after the fall of Myth Drannor in the Year of Doom, 714 DR, and the town grew to be the largest settlement on the whole north shore.", p: "people", s: ["origin"], src: FR_PHL },
    { t: "Ogres overran the unprepared town in the Year of the Evening Sun, 1303 DR, and that was the second destruction.", p: "conflict", s: [], src: FR_PHL },
    { t: "Three years after the ogres, a host of dragons out of Thar fell on the town in the Dragon Run; no neighbor sent help, and this time the citizens were slaughtered to the last.", p: "conflict", s: ["legend"], src: FR_PHL },
    { t: "The great city walls were reckoned by many to be the town's best defense, especially in the years when it could muster little army of its own.", p: "structure", s: ["conflict"], src: FR_PHL },
    { t: "A thieves' guild called the Welcomers operated openly for most of the town's history; its members cut off the left ear as a sign of loyalty and preyed on visitors, which is how the guild got its name.", p: "intrigue", s: ["people"], src: FR_PHL },
    { t: "By the mid-fourteenth century the place was governed by the Council of Ten, judges who presided over the courts, headed by an officer titled Number One who also served as mayor.", p: "governance", s: [], src: FR_PHL },
    { t: "That council had a very high turnover, since no-confidence elections were held for even the smallest of mishaps.", p: "governance", s: ["people"], src: FR_PHL },
    { t: "The oligarchy ended when Zhentarim forces took the town and Cvaal Daoran dissolved the Council of Ten and named himself Lord Protector; the throne stayed in the Daoran line for decades and was called the Cinnabar Throne.", p: "governance", s: ["conflict"], src: FR_PHL },
    { t: "The whole town was built on the ruins of its own past in the most literal sense, over an aging sewer system whose spillway opened into the Stojanow River.", p: "underground", s: ["structure"], src: FR_PHL },
    { t: "The sealed chambers of Old Phlan were known to hold both wondrous treasure and deadly monsters, and builders often refused to work in those quarters at all.", p: "underground", s: ["legend"], src: FR_OPH },
    { t: "Stojanow Gate, which guarded the courtyard entrance to Valjevo Castle, was rumored to have been raised by fire giants.", p: "landmark", s: ["legend"], src: FR_PHL },
    { t: "Scholar's Square held the town's trade schools, wizard academies and sage houses, and Mantor's Library, which answered to the Lord Sage of Phlan.", p: "landmark", s: ["people"], src: FR_PHL },
    { t: "To say a man was swinging from Stojanow meant he had been hanged, after the local watch's habit of hanging criminals from that gate; the town also gave Faerun the game of Old Men's Bones.", p: "people", s: ["legend"], src: FR_PHL },
    { t: "The Iron Route ran west along the Moonsea to Zhentil Keep, seventy miles off, and Melvaunt lay fifty-five miles east along the Phlan Path; the town exported gems and mineral ore brought down by caravan from the mining communities north of it.", p: "trade", s: ["structure"], src: FR_PHL },
  ],
};

const FR_LAE = "forgottenrealms.fandom.com/wiki/Laeral_Silverhand";

export const LAERAL_SILVERHAND: LibrarySubject = {
  id: "laeral_silverhand",
  label: "Laeral Silverhand",
  category: "person",
  facts: [
    { t: "Laeral Silverhand was born Anamanue Silverhand, and was known in her time as the Witch-Queen of the North and later as the Lady Mage of Waterdeep.", p: "origin", s: ["character"], src: FR_LAE },
    { t: "She was one of the Seven Sisters, a Chosen of Mystra, and Open Lord of Waterdeep in the late fifteenth century.", p: "power", s: ["governance"], src: FR_LAE },
    { t: "She was born in the Year of the Cowl, 765 DR, the fifth of seven daughters, all of them spellcasters, to the ranger Dornal Silverhand and his wife Elue.", p: "origin", s: ["allies"], src: FR_LAE },
    { t: "After their mother died she and two of her sisters were placed in Elminster's care, and when the others left the Old Sage she stayed on as his apprentice.", p: "origin", s: ["allies"], src: FR_LAE },
    { t: "She left Elminster's tutelage to join the Harpers, and left the Harpers early.", p: "deeds", s: ["allies"], src: FR_LAE },
    { t: "In the Year of the Warrior's Rest, 806 DR, at the age of forty-one, she was a self-styled queen ruling the realm of Stornanter from Port Llast.", p: "governance", s: ["deeds"], src: FR_LAE },
    { t: "She set out to rebuild and resettle the ruins of Illusk, and before she did she explored the Host Tower of the Arcane, where she found several liches of the old Grand Cabal and sealed them inside the tower with magic.", p: "deeds", s: ["power"], src: FR_LAE },
    { t: "Barely ten years into her reign over Stornanter her court mage Malek Aldhanek, with whom she had worked very closely, was apparently assassinated; realizing too late that she had loved him, she quit her court and spent twenty-five years wandering Stornanter.", p: "deeds", s: ["character"], src: FR_LAE },
    { t: "Malek had never existed at all: he was Khelben Arunsun in disguise, who faked the death to deal with a dire prophecy he had found in the works of Alaundo.", p: "legend", s: ["intrigue"], src: FR_LAE },
    { t: "In the Year of the Leaping Lion, 834 DR, she came into conflict with the great kraken Slarkrethel; he was driven off, but he took with him the magical throne she had made.", p: "conflict", s: ["deeds"], src: FR_LAE },
    { t: "She and her sister Sylune were drawn into a spell-battle in 841 DR without either recognizing the other, having grown up apart, until Mystra manifested to explain their heritage and offered them both the mantle of Chosen.", p: "origin", s: ["faith", "conflict"], src: FR_LAE },
    { t: "Under an assumed name she made herself a hard-drinking and fearless adventurer, and came to lead the band known as the Nine.", p: "character", s: ["deeds"], src: FR_LAE },
    { t: "In the Year of the Wandering Maiden, 1337 DR, she and the Nine found the Crown of Horns at Yulash, planted there for her by the lich Aumvor the Undying, who meant to use it to make her his bride; she put it on, and its power fought her spellfire and drove her mad.", p: "deeds", s: ["legend", "conflict"], src: FR_LAE },
    { t: "Twenty years later Khelben Arunsun came to the Stronghold of the Nine in the High Forest and freed her from the Crown and from the madness it had worked; after that the two were inseparable.", p: "allies", s: ["legend"], src: FR_LAE },
    { t: "She was called Lady Arunsun though the two never married, and she let those who wished Khelben harm believe she was enslaved to him, so that they would come to her as an ally against him.", p: "character", s: ["intrigue"], src: FR_LAE },
    { t: "Having been in thrall to the Crown of Horns and made to commit heinous acts by it, she held that she understood the nature of evil better than most, and often mediated disputes with rogues, undesirables and sentient monsters.", p: "character", s: ["legacy"], src: FR_LAE },
    { t: "She kept an alias in Skullport under the name Irusyl Eraneth and acted there as a spy for the Lords of Waterdeep.", p: "intrigue", s: ["deeds"], src: FR_LAE },
    { t: "One of the most prolific makers of magic items on record, she could often tell what an item did merely by holding it without activating it, and she concealed a gift from Mystra that could make magic items malfunction at her touch.", p: "power", s: [], src: FR_LAE },
    { t: "She was infuriated by magic-users who used their power to deceive and dominate others, disliked doppelgangers and slave-owners, and though she had no need of sleep she insisted on being left alone for her highsun nap.", p: "character", s: [], src: FR_LAE },
    { t: "Her stated aims were to bring Cormyr, Amn, Westgate and Luskan into the Lords' Alliance and to drive Zhentarim influence out of the North, but her ultimate goal was to unite every thinking race — dwarf, elf, human, orc — in a goodly purpose.", p: "governance", s: ["legacy", "allies"], src: FR_LAE },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 9 (30 Jul) — EVENT OR LOCATION. One subject, chosen for interlock rather than count:
// Skullport touches four subjects already in the corpus (Undermountain, the Crown of Horns whose
// last holder vanished from here, Laeral Silverhand who spied here under an alias, and the Drow).
// ---------------------------------------------------------------------------------------

export const SKULLPORT: LibrarySubject = {
  id: "skullport",
  label: "Skullport",
  category: "location",
  facts: [
    { t: "Skullport, also called the Port of Shadows, was a subterranean city far below Waterdeep on the third level of Undermountain, the Sargauth Level.", p: "structure", s: ["underground"], src: FR_SKULL },
    { t: "Rumors of the place persisted throughout the surface world, yet few of its own inhabitants knew where any of the entrances lay.", p: "intrigue", s: ["people"], src: FR_SKULL },
    { t: "The city sat over a mile beneath the surface, built on an ancient Netherese ruin inside an immense cavern, and was in every sense a dark reflection of the City of Splendors above.", p: "structure", s: ["origin", "underground"], src: FR_SKULL },
    { t: "The city was built in three tiers joined by narrow catwalks and rickety scaffolding, with creaking houses on stilts crowded into what amounted to a shantytown.", p: "structure", s: [], src: FR_SKULL },
    { t: "Four wards were generally agreed on — Skull Island, the Port, the Trade Lanes, and the Heart — and locals also spoke of three vertical tiers, the Crown, the Venter and the Dredge.", p: "structure", s: ["people"], src: FR_SKULL },
    { t: "Phosphorescent mosses and fungi grew on the cavern walls and veins of luminescent mineral gave off a diffuse multicolored glow, so the whole cavern lay in dim light the locals called the gloam.", p: "landmark", s: ["underground"], src: FR_SKULL },
    { t: "The depth and the crowd kept the temperature steady at about sixty-five degrees, and the seasons above made almost no difference to it.", p: "landmark", s: [], src: FR_SKULL },
    { t: "Salt air drawn in from the sea caves and water seeping constantly from the ceiling kept the air wet enough to rot timber and masonry alike, and the smell of must and mildew was the city's defining note.", p: "landmark", s: ["structure"], src: FR_SKULL },
    { t: "About three-fifths of the city's fresh air came in through the South Sea Caves, the rest through pipes cut into the cavern walls and a one-way portal to the Elemental Plane of Air in Whisperhaunt Pass.", p: "underground", s: ["structure"], src: FR_SKULL },
    { t: "More than half the food had to be imported from the surface, including every fruit, vegetable and grain; the local staple was cultivated fungus, supplemented by hunted Underdark animals and a large blind fish of the Sargauth the locals called gumpfish.", p: "trade", s: ["people"], src: FR_SKULL },
    { t: "In order of importance the largest trades were slaves, drugs and poisons, cadavers and body parts, hireswords, and smugglers.", p: "trade", s: ["intrigue"], src: FR_SKULL },
    { t: "Bodies and separate body parts were traded for spellcraft and necromancy by a concern called Cryptkey Facilitations, which robbed the City of the Dead up in Waterdeep to get them.", p: "trade", s: ["intrigue", "faith"], src: FR_SKULL },
    { t: "Snatch bands were gangs hired to kidnap people out of Waterdeep and sell them below; wealthy victims fetched a premium and were often held for ransom, though they were rarely freed.", p: "intrigue", s: ["trade", "conflict"], src: FR_SKULL },
    { t: "The city had no elected officials, no hereditary rulers and no nobility, and to a casual eye it looked like anarchy; in practice it ran as an oligarchy of competing power groups whose alliances shifted constantly.", p: "governance", s: ["people"], src: FR_SKULL },
    { t: "Real authority belonged to the Skulls of Skullport, thirteen flaming skulls that were what remained of the Netherese mages who first settled the cavern, and though they mostly stayed aloof their word was final when they chose to give it.", p: "governance", s: ["legend", "origin"], src: FR_SKULL },
    { t: "There was no written law at all: order rested on the universal wish not to attract the attention of the Skulls, who were easily roused by anything that interfered with trade or destroyed property.", p: "governance", s: ["conflict"], src: FR_SKULL },
    { t: "Offenders sometimes faced a strange sort of court in Skull Square, where witnesses testified and the gathered crowd served as jury while the Skulls judged; in 1370 DR an orator named Amet'ned-thoth was paid to argue cases there.", p: "governance", s: ["people"], src: FR_SKULL },
    { t: "Dedicated churches, shrines and temples were forbidden outright, and worshippers of good and lawful gods who tried to reform the place were met with destruction; even so, a cult of Cyric managed to keep a temple standing there.", p: "faith", s: ["conflict"], src: FR_SKULL },
    { t: "Every year at midnight before Highharvestide the Skulls left the city for a full day and went somewhere unknown, and on that one holiday chaos reigned and old scores were settled, with most folk retiring indoors before the Skulls came back.", p: "people", s: ["legend", "faith"], src: FR_SKULL },
    { t: "When Netheril fell the mantle over the enclave backfired, collapsing the ceilings and burying the settlement, and the essence of the wizards was absorbed into it and turned thirteen of them into the Skulls; centuries later one of Halaster Blackcloak's seven apprentices ventured in against his master's warning, struck a bargain with them, and founded a trading post that grew into one of the chief ports of the Underdark.", p: "origin", s: ["legend", "trade"], src: FR_SKULL },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 10 (30 Jul) — LEGEND / MYTH. The Weeping War, which is the event that emptied Myth Drannor
// (already in the corpus) and sent the refugees who swelled Phlan (also in the corpus).
// ---------------------------------------------------------------------------------------
const FR_CMY = "forgottenrealms.fandom.com/wiki/Cormanthyr";
const FR_MDR = "forgottenrealms.fandom.com/wiki/Myth_Drannor";
const FR_HMD = "forgottenrealms.fandom.com/wiki/History_of_Myth_Drannor";
const FR_AOD = "forgottenrealms.fandom.com/wiki/Army_of_Darkness";

export const WEEPING_WAR: LibrarySubject = {
  id: "weeping_war",
  label: "The Weeping War",
  category: "legend",
  facts: [
    { t: "The Weeping War was a fierce conflict that came to its head on the fifteenth of Flamerule in the Year of Doom, 714 DR, when the Akh'Velahr, the army of Cormanthor, was defeated by the invading Army of Darkness.", p: "conflict", s: ["origin"], src: FR_MD },
    { t: "The defeat of the elves brought down Myth Drannor, which at the time was the greatest and most powerful bastion of civilization in the Realms and a beacon of harmony between the races.", p: "conflict", s: ["legend"], src: FR_MD },
    { t: "Who first worked the summoning that started it all is unknown; the guesses run to a flind or orc shaman, or else a human archmage.", p: "origin", s: ["legend"], src: FR_MD },
    { t: "The one who worked that first summoning, whoever they were, called up yugoloths to raid the lands of the Dragonreach, and three of the fiends broke free of the control that bound them.", p: "origin", s: ["conflict"], src: FR_MD },
    { t: "The three that broke loose were the nycaloths Aulmpiter, Gaulguth and Malimshaer, remembered afterwards as the Trio Nefarious, and they gathered up huge numbers of goblinkin from the country around them.", p: "conflict", s: ["legend", "people"], src: FR_MD },
    { t: "In the Year of Bound Evils, 708 DR, the long-imprisoned nycaloths were released from an extradimensional prison suspended high above the city itself.", p: "origin", s: ["legend"], src: FR_HMD },
    { t: "Within eighteen months the three had amassed a great host of orcs, gnolls, trolls, goblins and lesser fiends and monsters, some three thousand strong.", p: "conflict", s: [], src: FR_HMD },
    { t: "What drove the Trio Nefarious was revenge against the elves who had imprisoned them in the first place.", p: "conflict", s: ["legend"], src: FR_HMD },
    { t: "Gathering the Army of Darkness took twenty-nine months altogether.", p: "conflict", s: [], src: FR_AOD },
    { t: "The army's first action was not against the elves at all: in the late autumn of 711 DR it fell on the mining and trading camps of the western Moonsea, in the country that would one day hold Zhentil Keep.", p: "conflict", s: ["trade"], src: FR_AOD },
    { t: "By the Feast of the Moon of that same year the host had turned on the forest of Cormanthor, and that is where the war is reckoned to begin.", p: "origin", s: ["conflict"], src: FR_AOD },
    { t: "Word of the gathering host reached Captain Fflar of Myth Drannor, who set a watchpost north of the city at Helmgrove and gave it to the company called the Shield of Myth Drannor.", p: "conflict", s: ["structure", "people"], src: FR_MD },
    { t: "In the Year of Despairing Elves, 711 DR, the Trio Nefarious came into the northern woods of Cormanthor, struck at the eladrin outposts there, and moved steadily closer to the capital.", p: "conflict", s: ["origin"], src: FR_MDR },
    { t: "The elves of the city did not stand alone: men of the Dalelands and a number of Cormyrean War Wizards came to help hold it.", p: "people", s: ["conflict"], src: FR_MDR },
    { t: "The elves fought bravely enough to kill all three of the nycaloths who led the army against them.", p: "conflict", s: ["legend"], src: FR_CMY },
    { t: "With their commanders dead the monsters reverted to ordinary horde tactics and swept down on the city all at once.", p: "conflict", s: [], src: FR_AOD },
    { t: "Killing the three commanders made no difference in the end: by the Year of Doom, 714 DR, Myth Drannor had fallen under fiendish control and the realm around it collapsed into shambles, its former residents scattering across the Realms.", p: "conflict", s: ["people", "legend"], src: FR_CMY },
    { t: "The elves living in the woods spent the two years after the fall clearing their land of the bugbears, flinds, gnolls and orcs the army had left behind, and took heavy casualties doing it.", p: "people", s: ["conflict"], src: FR_MD },
    { t: "The elves who held the ruins afterwards closed the surrounding country to outsiders and to other races entirely, so that no second army could ever come at them the same way.", p: "governance", s: ["people"], src: FR_MD },
    { t: "For centuries afterwards the elves tried to keep the fiendish evil penned inside the ruins, having moved their seat of power to Elven Court, until in 1344 DR they began the Retreat and more than nine in ten of them left the woods of Cormanthor altogether; drow moved into the homes their kin had abandoned and set about seizing the mythals.", p: "governance", s: ["legend", "intrigue"], src: FR_CMY },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 11 (30 Jul) — TYPE OF CREATURE. Trolls, anchored to `waterdeep`: the Trollwars fact
// already sits in the Waterdeep table and the North is where the Realms remembers them.
//
// SCOPE RULING (sourcing discipline). The Trollwars have their OWN ledger row (1, legend/myth),
// so the war narrative — Nimoar the Reaver, Ahghairon's ending stroke in 952 DR, the nine-day
// Long Battle, the traitors Aviss and Fellandar and their thwarted third war — is deliberately
// NOT drawn down into this subject. Trolls gets only facts about the creature, plus the two
// anchors that make it a Waterdeep subject: where the trolls came from and where the survivors
// went. Authoring the war here would have hollowed out row 1 before it was ever written.
// ---------------------------------------------------------------------------------------
const FR_TRL = "forgottenrealms.fandom.com/wiki/Troll";
const FR_TRW = "forgottenrealms.fandom.com/wiki/Trollwars";
const FR_MDM = "forgottenrealms.fandom.com/wiki/Mere_of_Dead_Men";
const FR_TRT = "forgottenrealms.fandom.com/wiki/Trolltide";

export const TROLLS: LibrarySubject = {
  id: "trolls",
  label: "Trolls",
  category: "creature",
  facts: [
    { t: "Trolls are called the Spawn of Vaprak and the Undying Ones, a ravenous and predatory kind of giant humanoid found in nearly every region and climate of Faerûn, from the arctic wastes to the tropic jungles.", p: "nature", s: ["habitat", "threat"], src: FR_TRL },
    { t: "Some reckon them among the giants, but no line has ever been traced from them to Annam All-Father or to Othea, so they count as neither true giants nor giant-kin.", p: "origin", s: ["nature"], src: FR_TRL },
    { t: "A grown troll stands around nine feet tall on long ungainly legs and weighs some five hundred pounds.", p: "nature", s: [], src: FR_TRL },
    { t: "Their deceptively thin frames are covered in thick rubbery hide of mossy green or putrid grey, with long hanging arms ending in heavy claws and a ragged growth of black or iron-grey hair.", p: "nature", s: [], src: FR_TRL },
    { t: "They walk with so severe a hunch that the backs of their hands drag along the ground, yet for all that awkwardness they are surprisingly agile and superb climbers.", p: "nature", s: ["behavior"], src: FR_TRL },
    { t: "The best-known thing about a troll is its regeneration: slashes close and severed limbs mend, and only fire or acid will halt the healing.", p: "nature", s: ["threat"], src: FR_TRL },
    { t: "A troll's severed limb goes on clawing at its enemies after it has been parted from the body.", p: "threat", s: ["nature"], src: FR_TRL },
    { t: "Because the blood carries that same regenerative virtue it is worth a great deal — upward of four hundred gold from a single troll — and goes into the making of poisons, antidotes, and certain healing potions.", p: "trade", s: ["nature"], src: FR_TRL },
    { t: "A wizard named Huhhus once distilled troll flesh into a regeneration draught so foul that nobody would drink it, and a student of his later worked troll ichor and brain into rings of regeneration instead.", p: "trade", s: ["legend"], src: FR_TRL },
    { t: "They hunt nearly anything that lives and never trouble themselves over the size or the number of their prey, having no fear at all of death.", p: "threat", s: ["behavior"], src: FR_TRL },
    { t: "They do not fear humans, but they do respect them, for humans are known to carry fire.", p: "behavior", s: ["threat"], src: FR_TRL },
    { t: "Trolls keep little in the way of society, traveling in clans of three to a dozen that do not migrate, and settling into a lair — most often a cave — wherever the prey is thick.", p: "society", s: ["habitat"], src: FR_TRL },
    { t: "They favor lairs near small settlements and traveled roads, since anyone who strays from the path is food, and they will eat a country bare before moving on to the next.", p: "behavior", s: ["habitat", "threat"], src: FR_TRL },
    { t: "A troll den is a filthy place ruled by a shamanistic matriarch, and every clan traces its founding to a great mother it holds to have been a daughter of the ogre god Vaprak.", p: "society", s: ["faith"], src: FR_TRL },
    { t: "They have no tongue of their own, speaking Jotun and a guttural borrowing from other languages that outsiders call Trollspeak, and whatever culture they keep is passed by mouth within a single clan.", p: "society", s: [], src: FR_TRL },
    { t: "They come in many strains — fell, fire, ice, cave, snow, forest, mountain and tree trolls, the rotting kind, and the water-dwelling scrags that plague the rivers and seas.", p: "nature", s: ["habitat"], src: FR_TRL },
    { t: "The Zhentilar made bladeragers of them, grafting steel blades and plating directly onto the living troll.", p: "conflict", s: ["nature"], src: FR_TRL },
    { t: "Orcs united under the Brotherhood of the Scarlet Scourge drove a great population of trolls out of the Sword Mountains in 932 DR, and they came down on the young city that would in time be called Waterdeep.", p: "habitat", s: ["origin", "conflict"], src: FR_TRW },
    { t: "The trolls who survived those wars against Waterdeep withdrew north into the swamp called the Mere of Dead Men, and found refuge there.", p: "habitat", s: ["conflict"], src: FR_MDM },
    { t: "The city keeps the memory of them in Trolltide, when Waterdhavian children go about dressed as trolls, growling at doors from highsun to dusk and collecting treats to keep the trolls from the threshold.", p: "legend", s: ["people"], src: FR_TRT },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 11 (30 Jul) — PERSON OF SIGNIFICANCE. Jarlaxle Baenre, anchored to `underdark`, chosen
// for interlock: he touches Menzoberranzan, the Drow, and Drizzt, all three already in the corpus.
// ---------------------------------------------------------------------------------------
const FR_JAR = "forgottenrealms.fandom.com/wiki/Jarlaxle";
const FR_BDA = "forgottenrealms.fandom.com/wiki/Bregan_D'aerthe";

export const JARLAXLE: LibrarySubject = {
  id: "jarlaxle",
  label: "Jarlaxle Baenre",
  category: "person",
  facts: [
    { t: "Jarlaxle is a drow mercenary and the leader of the company called Bregan D'aerthe, one of the very few males ever to hold real power in a city given over to Lolth.", p: "deeds", s: ["power", "society"], src: FR_JAR },
    { t: "He was born to Yvonnel Baenre, matron mother of House Baenre, the first house of Menzoberranzan.", p: "origin", s: ["allies"], src: FR_JAR },
    { t: "By the order of his birth he was to be sacrificed to Lolth, but the matron mother's sacrificial blade would not pierce the infant.", p: "origin", s: ["legend", "faith"], src: FR_JAR },
    { t: "When his brother Doquaio was ordered to help with the killing, the force of the stroke was turned back upon him by the psionic power of the matron of House Oblodra, and Doquaio died in his place.", p: "origin", s: ["power", "legend"], src: FR_JAR },
    { t: "The failure was kept secret, and his mother feared him ever after and believed her own fate bound up with his, while the city took him for a favorite of the Spider Queen.", p: "intrigue", s: ["character", "legend"], src: FR_JAR },
    { t: "Lolth did favor him for a time as an agent of chaos, but he rejected her and she withdrew that favor — a thing the matron mothers of Menzoberranzan never learned.", p: "faith", s: ["character", "intrigue"], src: FR_JAR },
    { t: "He trained at Melee-Magthere, the warriors' academy, and was marked there for his mastery of strategy and tactics rather than for his arm, though he is a fine swordsman besides.", p: "power", s: ["deeds"], src: FR_JAR },
    { t: "He left his house and his name behind him — though not his connections — and founded Bregan D'aerthe, a band of rogue males that grew into an underworld empire of its own inside Menzoberranzan.", p: "deeds", s: ["society", "intrigue"], src: FR_JAR },
    { t: "The band was built mostly of houseless drow males out of the ruined houses of Menzoberranzan and Ched Nasad.", p: "society", s: ["people"], src: FR_BDA },
    { t: "It is hired by the ruling houses themselves, and by House Baenre above all, which has both the coin to keep it on retainer and the reason, Jarlaxle being a Baenre.", p: "society", s: ["governance", "trade"], src: FR_BDA },
    { t: "He reckons the surest way for a male to survive and prosper under a matriarchy is to stand outside the system altogether and make himself too valuable to remove, and he has been audacious enough to live that way.", p: "character", s: ["society"], src: FR_JAR },
    { t: "His wealth is considerable, but rank in drow society means nothing to him, and he takes open pleasure in the noble houses having to come to him.", p: "character", s: ["trade"], src: FR_JAR },
    { t: "He would far rather talk than fight, and talking is what he does best; his words carry past the evil reputation of his race and turn would-be enemies into allies.", p: "character", s: ["power"], src: FR_JAR },
    { t: "He dislikes killing anyone who might instead be manipulated to his purpose, which is an odd trait in a drow, and now and then he has played the hero for no better reason than the doing of it.", p: "character", s: ["deeds"], src: FR_JAR },
    { t: "His lieutenant Kimmuriel Oblodra understood that the gambling and the apparent foolishness were a very good façade laid over a frighteningly intelligent mind.", p: "character", s: ["allies"], src: FR_JAR },
    { t: "He is particularly taken with Drizzt Do'Urden as the one who escaped the heritage and the fate of the drow, and in time the two came to count each other friends.", p: "allies", s: ["character", "legacy"], src: FR_JAR },
    { t: "He wears a wide-brimmed purple hat set with a great white feather that summons an Underdark diatryma and grows back after every use, and the hat itself serves him as a hat of disguise.", p: "power", s: ["make"], src: FR_JAR },
    { t: "A bracer at each wrist yields him a nearly endless supply of throwing daggers, of which only one in every three is real and the rest illusion.", p: "power", s: ["threat"], src: FR_JAR },
    { t: "He keeps a portable hole in the underside of that hat, and an instant fortress shaped like one of the stalagmite castles of Menzoberranzan which houses its soldiers even while shrunken, so that he carries a small army in his pocket.", p: "power", s: ["make", "structure"], src: FR_JAR },
    { t: "He gave the running of Bregan D'aerthe over to Kimmuriel and went up to the World Above, where he came to hold Luskan through Ship Kurth and to own the inn and tavern called One-Eyed Jax.", p: "deeds", s: ["governance", "trade"], src: FR_JAR },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 11 (30 Jul) — FAMOUS OBJECT. The Ythryn Mythallar, anchored to `icewinddale`. Netheril
// already underpins Skullport's origin in the corpus, and the closing fact ties forward to the
// Codicil of White (ledger row 90), which is the way into the buried city.
//
// SOURCING NOTE. The mythallar also exists as a published magic item with a full rules block.
// None of that is drawn on here: those numbers are adventure text, not wiki lore, and the Library
// deals in flavor-grade sourced notes. Every fact below comes from the wiki pages cited.
// ---------------------------------------------------------------------------------------
const FR_MYT = "forgottenrealms.fandom.com/wiki/Mythallar";
const FR_YTH = "forgottenrealms.fandom.com/wiki/Ythryn";
const FR_IRI = "forgottenrealms.fandom.com/wiki/Iriolarthas";

export const YTHRYN_MYTHALLAR: LibrarySubject = {
  id: "ythryn_mythallar",
  label: "The Ythryn Mythallar",
  category: "object",
  facts: [
    { t: "A mythallar is a Netherese device that opens onto vast amounts of raw magic.", p: "make", s: ["legend"], src: FR_MYT },
    { t: "It has the look of an enormous crystal ball, held perfectly spherical in an ornate stand.", p: "make", s: [], src: FR_MYT },
    { t: "The globe sheds a light as bright as the disc of the sun, with dimmer shadows and shapes drifting across its surface.", p: "make", s: ["landmark"], src: FR_MYT },
    { t: "It was built to dig down into the Weave itself, convert that raw unfiltered magic, and spread the energy through the country around it, so that all manner of magical effects could be worked there.", p: "make", s: ["origin"], src: FR_MYT },
    { t: "Netheril's arcanists used mythallars widely in the making of quasimagical items.", p: "trade", s: ["make"], src: FR_MYT },
    { t: "The empire set mythallars at strategic points along the Narrow Sea and used them to warm its water and hold back the advance of the High Ice.", p: "history", s: ["governance"], src: FR_MYT },
    { t: "A mythallar can be destroyed by a disintegrate spell, which is how the enclave of Tanathras was lost.", p: "history", s: ["conflict"], src: FR_MYT },
    { t: "Ythryn was one of Netheril's flying enclaves, and like the others it was held up by a single mythallar.", p: "make", s: ["structure", "history"], src: FR_YTH },
    { t: "That one engine was the source of the city's flight, and it could also restore magic items that had been spent.", p: "make", s: ["trade"], src: FR_YTH },
    { t: "The enclave was raised upon a great disc, crowded above with odd-shaped towers and turrets and lower domed halls.", p: "structure", s: ["landmark"], src: FR_YTH },
    { t: "Fourteen wizards' spires dotted the rim of that disc, each one like a single claw reaching out over the city's edge.", p: "structure", s: ["landmark"], src: FR_YTH },
    { t: "Ythryn's mythallar was the work of Iriolarthas, an arcanist of Netheril powerful enough to build his own engine and raise his own flying city upon it.", p: "origin", s: ["history"], src: FR_IRI },
    { t: "He had already made himself a lich long before the city ever came down.", p: "history", s: ["legend"], src: FR_IRI },
    { t: "The enclave was governed by a cabal of eight arcanists known as the Wizards of the Ebon Star.", p: "governance", s: ["structure"], src: FR_YTH },
    { t: "When the mythallar was first lit and the city rose, Iriolarthas and his apprentices took it north, hunting the long-lost magics of Ostoria, the ancient giant realm remembered for its war against the dragons.", p: "history", s: ["origin", "legend"], src: FR_YTH },
    { t: "In the autumn of the Year of Chilled Marrow, −343 DR, the arcanists of Ythryn brought up a great stone spindle covered in strange sigils from the floor of the Sea of Moving Ice.", p: "history", s: ["legend"], src: FR_YTH },
    { t: "During a routine examination the spindle was somehow set off, and the burst of power it loosed dispelled every magical effect in the city at once — the mythallar holding Ythryn aloft among them.", p: "history", s: ["conflict"], src: FR_IRI },
    { t: "The city came down, and Ythryn lies buried beneath the Reghed Glacier in the far North.", p: "history", s: ["structure"], src: FR_YTH },
    { t: "A tomb tapper still guards the mythallar against anyone who would come at it.", p: "threat", s: ["history"], src: FR_YTH },
    { t: "The Codicil of White is rumored to hold a spell or a rite that could carve a passage down through the Reghed Glacier to the buried city.", p: "legend", s: ["history"], src: FR_YTH },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 12 (30 Jul) — LEGEND / MYTH. The Trollwars. All five categories stood dead level at 8 at
// batch start, so interlock chose the batch: this is the war deliberately held OUT of the Trolls
// table in Batch 11 so that this row would still have something to be about. Sources are reused
// constants where the page was already declared (P: one page, one name — B-45).
// ---------------------------------------------------------------------------------------
const FR_952 = "forgottenrealms.fandom.com/wiki/952_DR";
const FR_FEL = "forgottenrealms.fandom.com/wiki/Fellandar";
const FR_HWI = "forgottenrealms.fandom.com/wiki/History_of_Waterdeep_(in-universe)";

export const TROLLWARS: LibrarySubject = {
  id: "trollwars",
  label: "The Trollwars",
  category: "legend",
  facts: [
    { t: "The Trollwars were two wars fought between the humans of Waterdeep and the trolls of the nearby Trollmoors.", p: "conflict", s: ["legend"], src: FR_TRW },
    { t: "Before the wars the place was Nimoar's Hold, the Town of Waters Deep, and Nimoar raised the first wooden palisades around it to keep it safe.", p: "origin", s: ["structure"], src: FR_HWI },
    { t: "Fighting between elves and orcs north of the Hold drove large populations of trolls south, and they settled in the nearby Evermoors.", p: "origin", s: ["conflict"], src: FR_HWI },
    { t: "The orcs that displaced them out of the Sword Mountains had been united under the Brotherhood of the Scarlet Scourge.", p: "origin", s: ["conflict"], src: FR_TRW },
    { t: "The First Trollwar came in 932 DR, when the trolls fell upon the city that would one day be called Waterdeep and were met by forces under Nimoar the Reaver.", p: "conflict", s: ["origin", "people"], src: FR_TRW },
    { t: "Nimoar's retaliation burned away large parts of the Evermoors and purged it of trolls.", p: "conflict", s: ["landmark"], src: FR_TRW },
    { t: "After Nimoar's passing the settlement came to be known simply as Waterdeep, and it was its warlords who rallied together to throw back the trolls.", p: "origin", s: ["governance", "people"], src: FR_HWI },
    { t: "The second conflict broke out in the Year of the Cold Claws, 940 DR, when the trolls began making continual raids on human settlements, and it ran on for twelve years.", p: "conflict", s: [], src: FR_HIST },
    { t: "It was fought by Waterdeep in alliance with the cities of the North against the trolls of the Evermoors.", p: "conflict", s: ["governance"], src: FR_TRW },
    { t: "The Waterdhavian defenders first drove the trolls back from their walls.", p: "conflict", s: ["structure"], src: FR_TRW },
    { t: "The human realms then united under Aeroth, War Captain of Silverymoon, Ahghairon of Waterdeep, and Samular Caradoon of Tyr, and together they scoured the trolls from the Evermoors.", p: "conflict", s: ["governance", "faith"], src: FR_TRW },
    { t: "The might of the trolls was broken at last in a nine-day fight remembered afterward as the Long Battle.", p: "legend", s: ["conflict"], src: FR_952 },
    { t: "In the Year of the Rings Royal, 952 DR, the mage Ahghairon — then thirty-two years old — used his arcane power to turn the war and end it in a decisive victory.", p: "legend", s: ["power", "governance"], src: FR_HIST },
    { t: "The victory cost the city all six of its Warlords, killed in the fighting.", p: "conflict", s: ["governance", "legacy"], src: FR_HIST },
    { t: "It was around this time that the name Waterdeep came into common use in place of Nimoar's Hold.", p: "origin", s: ["people"], src: FR_HIST },
    { t: "Samular Caradoon, a knight of Tyr, was named a hero of the war and went on to found the Holy Order of Samular.", p: "faith", s: ["legacy", "people"], src: FR_HIST },
    { t: "House Belabranta was raised to the nobility, most likely for what Ilithrew Belabranta did during the wars.", p: "legacy", s: ["governance"], src: FR_952 },
    { t: "A third Trollwar nearly came in the Year of the Thundering Horde, 963 DR, when the traitors Aviss and Fellandar led an army of troll survivors out of the Mere of Dead Men against the city.", p: "intrigue", s: ["conflict", "legend"], src: FR_TRW },
    { t: "The pair had lived in Waterdeep and come to despise it, and they gave up their humanity in a certain pool in the Mere whose fell magic remade them as inhuman things of raw and primal power.", p: "intrigue", s: ["legend"], src: FR_FEL },
    { t: "They knew the city's defenses well and Castle Waterdeep had only just been begun, but Ahghairon and a band of wizards hurled the two of them into an extra-dimensional prison and the attack came to nothing.", p: "legend", s: ["intrigue", "structure"], src: FR_TRW },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 12 (30 Jul) — EVENT OR LOCATION. The Yawning Portal, which became the sole home for this
// subject when the duplicate legend row was struck on 30 Jul. Interlocks Undermountain, Halaster
// and Skullport, all three already sourced.
// ---------------------------------------------------------------------------------------
const FR_YP = "forgottenrealms.fandom.com/wiki/Yawning_Portal";
const FR_DUR = "forgottenrealms.fandom.com/wiki/Durnan";
const FR_D6 = "forgottenrealms.fandom.com/wiki/Durnan_the_Sixth";
const FR_MHA = "forgottenrealms.fandom.com/wiki/Mhaere_Dryndilstann";

export const YAWNING_PORTAL: LibrarySubject = {
  id: "yawning_portal",
  label: "The Yawning Portal",
  category: "location",
  facts: [
    { t: "The Yawning Portal was an inn and tavern in Waterdeep, renowned as the chief open route into Undermountain.", p: "landmark", s: ["structure", "underground"], src: FR_YP },
    { t: "A well within its walls led straight down into the first level of that vast dungeon.", p: "underground", s: ["structure"], src: FR_YP },
    { t: "It was owned and run by the famous adventurer Durnan the Wanderer.", p: "people", s: ["governance"], src: FR_YP },
    { t: "The name pointed at the deep well, and also at the habit its patrons had of telling wild stories.", p: "origin", s: ["people", "legend"], src: FR_YP },
    { t: "It was a favorite attraction for visitors to the city, a common point of departure for expeditions into the dungeon, and a refuge for those who came back out of it.", p: "people", s: ["trade", "underground"], src: FR_YP },
    { t: "In the Year of the Broken Helm, 1302 DR, Durnan and Mirt the Merciless went down into Undermountain and returned not only alive but rich, among the first ever to survive a foray into Halaster's property.", p: "legend", s: ["underground", "people"], src: FR_DUR },
    { t: "Durnan spent that looted wealth tearing down what remained of Halaster's Hold and raising the inn on the spot.", p: "origin", s: ["structure", "legend"], src: FR_DUR },
    { t: "He spread word of the size of Undermountain and the wealth to be had in it, and with the inn standing on so good a site he made his living selling gear to those who meant to go down.", p: "trade", s: ["intrigue"], src: FR_DUR },
    { t: "He gave up adventuring because he had promised the woman he loved that he would come back to her once he had made his fortune.", p: "people", s: ["character"], src: FR_DUR },
    { t: "He came to consider himself the self-appointed gatekeeper of Undermountain.", p: "character", s: ["underground"], src: FR_DUR },
    { t: "Gruff, burly and close-mouthed, he was in time raised to a place among the Masked Lords of Waterdeep.", p: "governance", s: ["character"], src: FR_DUR },
    { t: "That authority did not stop him taking the law into his own hands, and he led a band of vigilantes called the Red Sashes.", p: "intrigue", s: ["governance"], src: FR_DUR },
    { t: "If trouble broke out in the taproom Durnan had a horn he would sound to call the Red Sashes to him.", p: "intrigue", s: ["conflict"], src: FR_MHA },
    { t: "The inn was managed alongside him by his wife Mhaere Dryndilstann, a cleric of Lathander, hard-working and brisk about her duties.", p: "people", s: ["faith"], src: FR_MHA },
    { t: "She gathered a great deal of gossip behind that bar and was not one to spread it.", p: "people", s: ["intrigue"], src: FR_MHA },
    { t: "She often healed adventurers coming up out of the dungeon, and though Durnan charged a gold piece to be lifted out of the well, she would now and then drop one down to somebody in dire need while his back was turned.", p: "people", s: ["trade", "character"], src: FR_MHA },
    { t: "A trapdoor in the taproom opened onto a chute, warded so that only Durnan could lift it; around 1339 DR he sent inconvenient corpses down it to be devoured by something far below, though the noise tended to put diners off their meal.", p: "intrigue", s: ["underground"], src: FR_YP },
    { t: "Mops were kept close to hand — swung as improvised staves in brawls, and used to help people in and out of the well.", p: "landmark", s: ["people"], src: FR_YP },
    { t: "From the deepest wine cellar an arched passage and a flight of stone steps ran down to a secret door opening into Bonewatch Pass, a tunnel leading directly to Skullport, though the route was heavily trapped and no road for the careless.", p: "underground", s: ["intrigue", "structure"], src: FR_YP },
    { t: "Durnan the Sixth kept the inn in the 1470s DR and carried on his ancestor's custom of lowering willing patrons down the well for ten gold a head, until the original Durnan returned after nearly a century, bought the place back, and let his descendant quietly retire.", p: "legacy", s: ["legend", "people"], src: FR_D6 },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 12 (30 Jul) — FAMOUS OBJECT. The Codicil of White, which the Ythryn Mythallar's closing
// fact (Batch 11) points forward to. Grimskalle brings Frost Giants in as well, so this subject
// ties two already-sourced icewinddale rows together.
// ---------------------------------------------------------------------------------------
const FR_COW = "forgottenrealms.fandom.com/wiki/The_Codicil_of_White";
const FR_CAU = "forgottenrealms.fandom.com/wiki/Church_of_Auril";
const FR_GRM = "forgottenrealms.fandom.com/wiki/Grimskalle";
const FR_FW = "forgottenrealms.fandom.com/wiki/Frost_Witches";

export const CODICIL_OF_WHITE: LibrarySubject = {
  id: "codicil_of_white",
  label: "The Codicil of White",
  category: "object",
  facts: [
    { t: "The Codicil of White is a magical book holding the basic rites, rituals, services and major ceremonies of Auril's faith.", p: "make", s: ["faith"], src: FR_COW },
    { t: "Several of its pages are given over to the arcane magic the goddess favors, which is what sets it apart from the other ritual books of her church.", p: "make", s: ["faith"], src: FR_COW },
    { t: "It is a tall, thin volume bound between two planks of seasoned white pine with a spine of leather.", p: "make", s: [], src: FR_COW },
    { t: "Front, back and spine are covered by a single piece of white ermine fur sewn onto the pine boards, worn about the edges.", p: "make", s: ["landmark"], src: FR_COW },
    { t: "Thirteen of its pages deal with the major ceremonies of the faith — the dedication of holy sites, the ordination of priests, burial rites, a coming-of-age ceremony, investiture and the transfer of authority, and ceremonial vows for services and contracts.", p: "faith", s: ["make"], src: FR_COW },
    { t: "The Church of Auril is a loose and informal thing rather than an ordered hierarchy.", p: "faith", s: ["governance"], src: FR_CAU },
    { t: "Her clerics are mostly women, are called chillbringers, and for the most part wander the colder parts of Toril alone.", p: "faith", s: ["people"], src: FR_CAU },
    { t: "They wear ice-white robes trimmed in blue and a wide silver belt with a ceremonial axe hanging from it, and a circlet of silver about the head.", p: "faith", s: ["make"], src: FR_CAU },
    { t: "Her specialty priests are called icepriestesses, and unlike the rank and file they cannot turn undead.", p: "faith", s: ["power"], src: FR_CAU },
    { t: "The most powerful of her clerics can call up the effect of an ice storm unaided, and summon para-elementals of ice.", p: "power", s: ["faith"], src: FR_CAU },
    { t: "A priestess named Cefra wandered for weeks, then made careful contact with a tribe of bugbears and, by bribes and helpful applications of her magic, talked her way in, struck a pact with their chief, and became their priestess.", p: "history", s: ["intrigue", "people"], src: FR_COW },
    { t: "She converted the whole tribe to the worship of Auril and set up an order among them run to her own ideas of how such things ought to be conducted.", p: "history", s: ["faith", "governance"], src: FR_COW },
    { t: "A possible sighting of the book comes from Hammer 13, 1372 DR: a survivor of a bugbear attack in the hills north of the Cold Wood in Luruar reported a woman in the distance holding a rectangular piece of white fur above her head and shouting at the bugbears.", p: "history", s: ["legend"], src: FR_COW },
    { t: "The Frost Witches set down tomes of frost magic of their own, and were rumored to know where the Codicil lay.", p: "legend", s: ["intrigue"], src: FR_FW },
    { t: "The book was later found at the fortress of Grimskalle, on the island of Solstice in the Sea of Moving Ice, during the Everlasting Rime.", p: "history", s: ["landmark"], src: FR_COW },
    { t: "Grimskalle was raised as a frost giant fortress, and was claimed afterward by Auril herself as her personal domain while she dwelt on Toril in the late 15th century DR.", p: "history", s: ["faith", "conflict"], src: FR_GRM },
    { t: "It stands dead center on the isle of Solstice between gardens of ice sculptures shaped by the Frostmaiden's own magic, and has the look of an imposing skull wearing a horned crown.", p: "landmark", s: ["structure"], src: FR_GRM },
    { t: "The runes cut over its entrance are Dethek, and they say nothing more than the fortress's own name.", p: "structure", s: ["landmark"], src: FR_GRM },
    { t: "Within, the Hall of the Four Winds holds four tablets inscribed with the dogma of the Aurilian faithful, each one bound to a spirit out of the Elemental Plane of Air; past it lie two smaller rooms, one housing the Codicil and one that bestows the blessing of the Frostmaiden.", p: "structure", s: ["faith", "power"], src: FR_GRM },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 13 (30 Jul) — first batch selected by the three-tier rule (region → category within
// region → deepest source first). Tier 1: `avernus`, 1 sourced, tied thinnest. Tier 2: legend,
// location, creature and object all at 0 there. Tier 3: of the six open candidates, the Avernus
// page is far the deepest — the infernal-contract and dark-gift pages are stub-grade, and a thin
// page cannot honestly fill 20 facts.
// ---------------------------------------------------------------------------------------
const FR_AVE = "forgottenrealms.fandom.com/wiki/Avernus";

export const AVERNUS: LibrarySubject = {
  id: "avernus",
  label: "Avernus",
  category: "location",
  facts: [
    { t: "Avernus was the first layer of the Nine Hells of Baator.", p: "landmark", s: ["origin"], src: FR_AVE },
    { t: "It was the likeliest beachhead for any attack by demon-kind, and so the primary battleground of the Blood War.", p: "conflict", s: ["threat"], src: FR_AVE },
    { t: "Legions of devils marched its plains in continual readiness to throw back the demon hordes that sailed the Styx into the layer.", p: "conflict", s: ["people"], src: FR_AVE },
    { t: "It was the largest layer of Baator and among the most traditionally infernal — a blasted hellscape of lava rivers, barren hills and low rocky mountains as far as sight reached.", p: "landmark", s: ["structure"], src: FR_AVE },
    { t: "Obsidian, quartz and other crystals jutted from the jagged ground, cutting cloth and flesh, so that climbing or moving quickly was unwise at best.", p: "threat", s: ["landmark"], src: FR_AVE },
    { t: "Rocks and boulders lay everywhere, some of them seeming to hold tormented faces and the shapes of creatures, and they made the ground treacherous at any pace above a fast walk.", p: "landmark", s: ["threat"], src: FR_AVE },
    { t: "Rubble covered the ashen plains, dotted with bubbling tar pits, sucking quicksand, lakes of lava, and salt flats formed out of the tears of the damned.", p: "landmark", s: ["threat"], src: FR_AVE },
    { t: "Fireballs raced across the dark sky and fell to the scorched earth — seemingly at random, though closer study showed them drawn to movement — leaving smoking craters and burnt corpses behind.", p: "threat", s: ["structure"], src: FR_AVE },
    { t: "The acrid air was clouded with pumice and volcanic ash out of the fumaroles, and blighted besides with swarms of flies.", p: "landmark", s: ["threat"], src: FR_AVE },
    { t: "There was neither sun nor stars above it, only a constant blood-red light suffusing the air beneath roiling clouds of red and black shot through with orange flame.", p: "landmark", s: [], src: FR_AVE },
    { t: "Blood was the leitmotif of the place: the River of Blood ran through it, gathering rivulets from every gulch, stream and pool, and from the victims of millions of battles.", p: "landmark", s: ["conflict"], src: FR_AVE },
    { t: "As on all the lower planes the Styx ran through Avernus with its offshoots and falls; it once flowed at the layer's edge and later at its center, after relentless baatezu campaigns conquered the gate-towns along the rim.", p: "structure", s: ["conflict"], src: FR_AVE },
    { t: "Whether for the living or the dead, Avernus was the entry point to Baator and the most visited of the Nine Hells, because Asmodeus forbade portals opening to any other layer.", p: "governance", s: ["origin"], src: FR_AVE },
    { t: "That restriction had a purpose: a demonic invasion wanting the deeper layers of Hell would first have to conquer and hold the one above it.", p: "governance", s: ["conflict"], src: FR_AVE },
    { t: "The layer was once a rich and civilized realm of cities and commerce, and centuries of the Blood War reduced it to abandoned waste where only perpetually rebuilt strongholds still stood.", p: "history", s: ["structure"], src: FR_AVE },
    { t: "Its ruler held the title Lord of the First: Zariel held it, was betrayed and supplanted by the pit fiend general Bel, and took it back when Bel fell out of Asmodeus's favor for failing to repel a demonic invasion — after which Bel was made to serve as her advisor.", p: "governance", s: ["people", "intrigue"], src: FR_AVE },
    { t: "Baatorian green steel was found nowhere but the wastes of Avernus, drawn up from deep shafts sunk into the wastes and forged into a green-tinted steel tougher, sharper and lighter than any steel of the Prime.", p: "trade", s: ["make", "landmark"], src: FR_AVE },
    { t: "The Bronze Citadel was a fortress-city dozens of square miles across, ringed by twelve heavily defended walls and housing hundreds of thousands of lesser devils and their war machines, and the Lord of the First reigned from within it.", p: "structure", s: ["governance"], src: FR_AVE },
    { t: "The Pillar of Skulls was a landmark built of trophy-skulls taken in the Blood War, standing more than a mile high, and it rose close by the crossing into the second layer.", p: "landmark", s: ["conflict"], src: FR_AVE },
    { t: "A portal to Avernus was raised in the Burial Glen of Myth Drannor in 1346 DR by Banites acting under Zhentarim influence; it was meant to stand only briefly, but interference made it permanent, and the Knights of Myth Drannor did not close it until 1357 DR.", p: "intrigue", s: ["history", "origin"], src: FR_AVE },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 14 (30 Jul) — `feywild` at Frank's direction (it was tied thinnest at 1 anyway, so tier 1
// was satisfied either way). Tier 2: legend, location, person and object all at 0 there; only
// creature had anything. Tier 3: of the seven open candidates the Wild Hunt page is much the
// deepest, and it carries satellites besides (Cerunnos, the hounds, the Gloaming Fey, Herne).
//
// SOURCING TRAP, RECORDED. The FR wiki carries a SEPARATE "High Hunt", a quarterly religious rite
// in tribute to Malar that is ALSO called a Wild Hunt. It is a different thing entirely — a
// Faerûnian blood-sport of the Beast Lord, not the fey phenomenon — and nothing from that page is
// used here. A name collision between two pages is exactly the sort of thing that produces a fact
// cited to the right-looking page and sourced from the wrong one.
// ---------------------------------------------------------------------------------------
const FR_WH = "forgottenrealms.fandom.com/wiki/Wild_Hunt";

export const WILD_HUNT: LibrarySubject = {
  id: "wild_hunt",
  label: "The Wild Hunt",
  category: "legend",
  facts: [
    { t: "The Wild Hunt was a haunting phenomenon — some called it a physical manifestation of good life force — of wild frenzied hunting, in which a being known as Cerunnos, the Master of the Hunt, swept through the land with his hounds and a great many other creatures.", p: "legend", s: ["nature"], src: FR_WH },
    { t: "It rode on many planes: in the divine realms of Tir na Og and Annwn, in the Feywild, in the Shadowfell, and on the Prime Material itself.", p: "landmark", s: ["origin"], src: FR_WH },
    { t: "On worlds where the Celtic pantheon was worshiped, druids raised standing stones in the belief that the Hunt could use them as beacons.", p: "faith", s: ["landmark"], src: FR_WH },
    { t: "Accounts disagree: some held it rode only in autumn and winter, some that a chase might run for days or weeks, and others that it rode only by night — and that only one Hunt could ride the Prime on any given night.", p: "legend", s: [], src: FR_WH },
    { t: "Whenever it manifested it seemed to come out of thin air, its first riders descending from the sky.", p: "threat", s: ["legend"], src: FR_WH },
    { t: "Cerunnos sounded his hunting horn behind the pack at every mile, deliberately raising a ruckus to draw attention and to warn the quarry that the Hunt was coming.", p: "behavior", s: ["threat"], src: FR_WH },
    { t: "That horn was the Horn of the Undying, and in his hands its note could carry across any distance.", p: "make", s: ["legend"], src: FR_WH },
    { t: "Relentless as it was in pursuit, the Hunt never went indoors and never went underground.", p: "threat", s: ["behavior"], src: FR_WH },
    { t: "Any mortal who watched it pass and failed to resist its magical aura was compelled to join it, and those who went chasing after the sound of the horn most of all.", p: "threat", s: ["people"], src: FR_WH },
    { t: "The peasantry had a name for that curse: the Faerie Raed.", p: "people", s: ["legend"], src: FR_WH },
    { t: "Those under it followed wherever the Hunt went and took the Master of the Hunt for their own master, fighting even against their nature at his bidding, and the same magic let them keep pace with his hounds.", p: "threat", s: ["people"], src: FR_WH },
    { t: "The taken stopped aging while they rode; once freed they had gaps in their memory, came to in places they did not expect, and rarely recalled more than a few details of Cerunnos's face.", p: "legend", s: ["people"], src: FR_WH },
    { t: "On Celtic worlds it manifested wherever some great force of evil stood — a single grossly evil act, an evil temple, an army, a priest or a wizard — always ten miles off from it, and it went seeking that source to destroy it.", p: "conflict", s: ["faith"], src: FR_WH },
    { t: "If the Master and his hounds were slain, they returned the next night, and every night after, until the evil that had summoned them was gone.", p: "legend", s: ["threat"], src: FR_WH },
    { t: "Legend held that one who knew the proper rites could use the horn to summon and even command the Hunt, Cerunnos obeying begrudgingly — though he would leave clues for others on how to break the binding and set it free again.", p: "intrigue", s: ["make"], src: FR_WH },
    { t: "Some said the Hunt rode for no reason but to please an archfey called the Maiden of the Moon, most often on the night of a crimson moon, and that it fell above all upon her sworn enemies, the lycanthropes.", p: "faith", s: ["legend"], src: FR_WH },
    { t: "Its membership never held fixed, but it was always presided over by Cerunnos and twenty of his hounds — Wild Hunt hounds, a breed out of the Feywild that he alone had power over.", p: "nature", s: ["society"], src: FR_WH },
    { t: "Whatever force stood behind the Hunt kept it eternal: if death came to Cerunnos, to his hounds, or to his warlocks, their bodies would vanish and reconstitute themselves.", p: "legend", s: ["nature"], src: FR_WH },
    { t: "Escape was rare, and there were only three known ways of it: elude the Hunt until morning, get beyond the ten-mile radius of the evil that had called it, or kill Cerunnos and his whole pack.", p: "threat", s: [], src: FR_WH },
    { t: "Around the middle of the 14th century DR the Wild Hunt was known to ride in the country around Phlan in the Moonsea lands, rarely and for reasons the locals never learned, and folk there were warned to stay indoors.", p: "history", s: ["people"], src: FR_WH },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 15 (30 Jul) — `wildspace` at Frank's direction; it was tied thinnest at 1 sourced, so
// tier 1 held anyway. Tier 2: legend, location, person and object all at 0 there, creature alone
// at 1. Tier 3: of the five eligible candidates Vlaakith runs deepest — a main page, a separate
// Vlaakith I page for the dynasty, and the Githyanki page for the cult around her.
// FR_GY is REUSED, not redeclared (one page, one name — B-45 rule 2).
// ---------------------------------------------------------------------------------------
const FR_VL7 = "forgottenrealms.fandom.com/wiki/Vlaakith_CLVII";
const FR_VL1 = "forgottenrealms.fandom.com/wiki/Vlaakith_I";
const FR_TOK = "forgottenrealms.fandom.com/wiki/Token_of_Vlaakith";

export const VLAAKITH: LibrarySubject = {
  id: "vlaakith",
  label: "Vlaakith",
  category: "person",
  facts: [
    { t: "Vlaakith CLVII, known as the Lich Queen, was the ruler of the githyanki.", p: "deeds", s: ["power"], src: FR_VL7 },
    { t: "Vlaakith was the name borne by many rulers of the githyanki after the disappearance of Gith, the rebel leader who had united them against the illithids.", p: "origin", s: ["legacy"], src: FR_VL7 },
    { t: "The first of them, Vlaakith I, helped seal the pact between the githyanki and the red dragons, and every queen after her took her name.", p: "origin", s: ["allies"], src: FR_VL7 },
    { t: "Vlaakith I was the second great leader of the gith people and the first of at least a hundred and fifty-seven rulers of that title.", p: "origin", s: ["legacy"], src: FR_VL1 },
    { t: "She began the millennia-long dynasty of undead queens that ruled the war-hungry githyanki of the Astral Plane.", p: "origin", s: ["governance"], src: FR_VL1 },
    { t: "She was an adept leader and ever-efficient in her manipulations, but wholly treacherous, holding no true loyalty to her allies and serving in the end only her own interests.", p: "character", s: ["allies"], src: FR_VL1 },
    { t: "She held out to her people that any githyanki warrior who proved themselves in battle might achieve ascension and be welcomed into her divine court.", p: "faith", s: ["society"], src: FR_VL1 },
    { t: "Vlaakith CLVII stood apart from all the others by becoming a lich.", p: "power", s: ["legacy"], src: FR_VL7 },
    { t: "That undying reign, and her success at removing anyone who might have challenged her, let her hold the throne longer than any Vlaakith before her.", p: "legacy", s: ["power", "intrigue"], src: FR_VL7 },
    { t: "She was jealous and paranoid above all, and would eat the souls of any who grew strong enough to matter — of whatever kind — both to secure her position and to feed her own strength.", p: "character", s: ["power", "threat"], src: FR_VL7 },
    { t: "After centuries of undeath she grew mad.", p: "character", s: [], src: FR_VL7 },
    { t: "She was deeply learned in arcane, historic, planar and religious matters.", p: "power", s: ["character"], src: FR_VL7 },
    { t: "The insane lich set herself to ascend into the ranks of divinity.", p: "faith", s: ["character"], src: FR_VL7 },
    { t: "To that end she began installing a priest caste in githyanki society, and sent loyal lieutenants out to quell any unrest that might arise — preparing the ground by degrees for her ascension and for her people to worship her as a god.", p: "governance", s: ["faith", "intrigue"], src: FR_VL7 },
    { t: "There was no religion in githyanki society: their culture rested too strongly on individuality for any organized faith to take hold.", p: "society", s: ["faith"], src: FR_GY },
    { t: "As a civilization that raised its cities upon the corpses of dead gods, they had trouble recognizing divinity at all.", p: "society", s: ["origin", "faith"], src: FR_GY },
    { t: "Yet they revered Vlaakith almost to the pitch of religious worship, and the lich-queen destroyed any githyanki who took to following another deity.", p: "faith", s: ["society", "threat"], src: FR_GY },
    { t: "Githyanki clerics did exist, but they were vanishingly rare and had to live in hiding.", p: "faith", s: ["society"], src: FR_GY },
    { t: "The nearest thing they had to religious figures were their knights, whose devotion to Vlaakith ran comparable to a paladin's and granted them a few paladin-like powers — though because she was no true deity, they received nothing that worked against the undead.", p: "faith", s: ["power", "society"], src: FR_GY },
    { t: "A token of Vlaakith was a silver disk engraved with the Lich Queen's visage and set with red gems, carried as a symbol of her by githyanki of her creches.", p: "legacy", s: ["make", "faith"], src: FR_TOK },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 16 (30 Jul) — `dessarin`, tier 1 outright at 1 sourced. Tier 2: location, person, creature
// and object all at 0 there (only the Order of the Gauntlet is sourced, a legend). Tier 3: Red
// Larch is the deepest of the six candidates.
//
// FIRST SUBJECT THAT DOES NOT REACH 20, AND IT IS NOT PADDED TO GET THERE. The Red Larch page has
// a rich STRUCTURE — geography, trade, defenses, history, named shops and taverns, 61 catalogued
// inhabitants — but a short prose body. Drawing in its satellites (the Dessarin Valley, the River
// Dessarin, Larrakh) reaches 17 honest facts and no further. The die floats to the real sourced
// count, exactly as the model intends; inventing three more would be the only alternative and it
// is not one. This is also the first evidence that the dessarin rows drafted on 30 Jul run thinner
// than the inherited ones — a thing worth knowing early rather than at row eight.
// ---------------------------------------------------------------------------------------
const FR_RL = "forgottenrealms.fandom.com/wiki/Red_Larch";
const FR_DV = "forgottenrealms.fandom.com/wiki/Dessarin_Valley";
const FR_RIV = "forgottenrealms.fandom.com/wiki/River_Dessarin";
const FR_LAR = "forgottenrealms.fandom.com/wiki/Larrakh";

export const RED_LARCH: LibrarySubject = {
  id: "red_larch",
  label: "Red Larch",
  category: "location",
  facts: [
    { t: "Red Larch was a waystop on the Long Road, seven days north of Waterdeep.", p: "landmark", s: ["trade"], src: FR_RL },
    { t: "It stood at the meeting of three trails: one running to the Bargewright Inn, one to Kheldell, and one up into the hills toward derelict, monster-infested keeps.", p: "landmark", s: ["threat", "trade"], src: FR_RL },
    { t: "The town sat atop a low ridge along the western edge of the Dessarin Valley.", p: "landmark", s: ["structure"], src: FR_RL },
    { t: "It took its name from a stand of red larches that ran along that ridge, felled by the first settlers about the time of the founding.", p: "origin", s: ["landmark"], src: FR_RL },
    { t: "Those settlers chose the spot for a natural spring that fed a small pond, water enough to serve burden animals on the road.", p: "origin", s: ["trade"], src: FR_RL },
    { t: "Red Larch was known for crumblecake — nourishing, and otherwise entirely unremarkable.", p: "people", s: ["trade"], src: FR_RL },
    { t: "A crumblecake was baked into a moist loaf from nuts, chickpea mash, chopped roots and greens, and scraps of turkey and wildfowl, all put in together.", p: "trade", s: ["people"], src: FR_RL },
    { t: "Around the Year of the Staff, 1366 DR, the town kept a militia of about a hundred skilled archers, most of them younger boys, who trained by keeping predators off Mhandyvver's Poultry.", p: "conflict", s: ["people"], src: FR_RL },
    { t: "That militia was reason enough for orc raiding parties to leave the town alone.", p: "conflict", s: ["threat"], src: FR_RL },
    { t: "By about 1366 DR it also held a farmer's market and a cattle market.", p: "trade", s: ["people"], src: FR_RL },
    { t: "Its best-known houses were the Swinging Sword inn and the Helm at Highsun tavern, which stood across the way from one another.", p: "structure", s: ["people"], src: FR_RL },
    { t: "The Dessarin Valley, which its own residents called the Gateway to the North, lay between the Sword Mountains and the High Forest.", p: "landmark", s: ["origin"], src: FR_DV },
    { t: "The valley's main industry was agriculture, and though it was largely unsettled — scattered remote villages and farmsteads — it was far safer than the rest of the Savage Frontier had been in years past.", p: "trade", s: ["people"], src: FR_DV },
    { t: "The Stone Bridge crossed the River Dessarin north and east of the town.", p: "landmark", s: ["structure"], src: FR_RIV },
    { t: "During the Elemental Evil crisis a priest of the Cult of the Black Earth named Larrakh worked out of Red Larch, in contact with a local group called the Believers.", p: "intrigue", s: ["conflict"], src: FR_LAR },
    { t: "Larrakh stood in disgrace with his own masters, having failed them on several missions.", p: "intrigue", s: ["character"], src: FR_LAR },
    { t: "His plan for redeeming himself was to take the town sideways — turn the Believers into a nefarious organization, then unmask and defeat them himself, and so stand a hero in the eyes of the citizens.", p: "intrigue", s: ["governance"], src: FR_LAR },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 17 (30 Jul) — `avernus`, tier 1 by the driver (2 sourced, first of a five-way tie).
// Tier 2: legend, creature and object all at 0 there. Tier 3: of the four candidates the devil
// pages run far the deepest — Devil, Baatezu, Archdevil and the individual rank pages — against
// three adventure-item stubs. The promotion machinery is the part worth a book: devils rise by
// learning the one lesson their current form exists to teach them.
// ---------------------------------------------------------------------------------------
const FR_DEV = "forgottenrealms.fandom.com/wiki/Devil";
const FR_BAA = "forgottenrealms.fandom.com/wiki/Baatezu";
const FR_FND = "forgottenrealms.fandom.com/wiki/Fiend";
const FR_ARC = "forgottenrealms.fandom.com/wiki/Archdevil";
const FR_BAR = "forgottenrealms.fandom.com/wiki/Barbazu";

export const DEVILS_OF_THE_HELLS: LibrarySubject = {
  id: "devils_of_the_hells",
  label: "Devils of the Hells",
  category: "creature",
  facts: [
    { t: "Devils were a lawful evil race of fiends who hailed from the Nine Hells of Baator.", p: "nature", s: ["origin"], src: FR_DEV },
    { t: "They were vicious creatures, capable of attacking and killing others for essentially no reason at all.", p: "threat", s: ["nature"], src: FR_DEV },
    { t: "They were extremely vindictive and unable to accept their own mistakes: the instinct on suffering a setback was to find somebody else to blame and then to go and exact vengeance.", p: "character", s: ["behavior"], src: FR_DEV },
    { t: "They looked constantly for ways to be promoted, and the goal behind it was the fulfillment of their own desires — rise the hierarchy far enough and the rules can be bent to suit you. That was the root of their dedication to lawful evil.", p: "society", s: ["governance"], src: FR_DEV },
    { t: "For all their lawfulness they could act on emotion, vengeance most of all, and with enough provocation could be led into acting against their own ultimate goal — as far as death in pursuit of it.", p: "character", s: ["behavior"], src: FR_DEV },
    { t: "A great many devils carried an aura of fear, which they used to break enemy groups apart.", p: "power", s: ["threat"], src: FR_DEV },
    { t: "Most had some command of illusion, used to sow confusion — a common trick being to conjure illusory reinforcements for themselves and exploit an enemy's inability to tell false support from real.", p: "power", s: ["intrigue"], src: FR_DEV },
    { t: "They coveted mortal souls, and worked steadily to turn a mortal's ethical and moral outlook toward lawful evil.", p: "faith", s: ["intrigue"], src: FR_DEV },
    { t: "Every hunting ground had a devil assigned to it, holding the title undercontroller or factotum where the ground teemed with lawful evil folk — a coveted posting given only to those in an archdevil's favor.", p: "governance", s: ["society"], src: FR_DEV },
    { t: "Among the fiends of the Hells the baatezu were the dominant kind.", p: "nature", s: ["society"], src: FR_FND },
    { t: "Despite their lawful evil outlook, low-ranking baatezu still held some shred of chaos inside them, which could make them behave disobediently.", p: "behavior", s: ["nature"], src: FR_BAA },
    { t: "The first impulse of the savage sort — the mindless lemures and nupperibos, and the sapient abishai with them — was to attack first and ask questions never.", p: "behavior", s: ["threat"], src: FR_BAA },
    { t: "It was difficult to get the psychological better of a baatezu, particularly a high-ranking one, but acting on superficially chaotic reflexes could at least throw a lawful creature into confusion — a tactic that worked only on the dim and the low-ranking, since an intelligent baatezu could see the system behind apparent randomness.", p: "intrigue", s: ["behavior"], src: FR_BAA },
    { t: "It was possible, though difficult, to outwit a baatezu by somehow convincing it that its whole way of life was wrong.", p: "intrigue", s: ["character"], src: FR_BAA },
    { t: "A baatezu became eligible for promotion once it had learned the one lesson its current form existed to teach it about the nature of lawful evil — with lemures and nupperibos the exception.", p: "society", s: ["governance"], src: FR_BAA },
    { t: "Promotion came by two roads: by chance, which was open to lemures alone, and by intent, which was a bureaucratic process.", p: "governance", s: ["society"], src: FR_BAA },
    { t: "Those who followed the ideals of lawful evil advanced sooner than those who did not, and the qualities preferred in a candidate were a capacity for betrayal and for deceit.", p: "society", s: ["character"], src: FR_BAA },
    { t: "Archdevils were powerful, unique devils standing plainly at the top of Baator's hierarchy, and the most powerful of them were the archdukes, called the Lords of the Nine.", p: "governance", s: ["power"], src: FR_ARC },
    { t: "The barbazu, the bearded devils, were bred for battle and every other devil acknowledged their worth in a fight — though they had a bad name for an impulsive nature that got them brutally disciplined, and they led the charge in infernal armies without ever commanding one.", p: "conflict", s: ["society"], src: FR_BAR },
    { t: "When unclaimed souls turned up, barbazu serving different lords fell into frenzied bartering that often collapsed into outright brawling, since any that delivered such a soul to their archdevil was credited with the capture and improved his chances of promotion.", p: "trade", s: ["conflict"], src: FR_BAR },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 18 (30 Jul) — `baldursgate`, tier 1 (2 sourced, first of a four-way tie). Tier 2: legend,
// person and creature all at 0 there. Tier 3: the Dead Three pages run deepest by a distance
// against Ulder Ravengard, Mizora and Doppelgangers.
// ---------------------------------------------------------------------------------------
const FR_D3 = "forgottenrealms.fandom.com/wiki/Dead_Three";
const FR_BHA = "forgottenrealms.fandom.com/wiki/Bhaal";

export const DEAD_THREE: LibrarySubject = {
  id: "dead_three",
  label: "The Dead Three",
  category: "legend",
  facts: [
    { t: "In the mists of the past, centuries before Dale Reckoning, the Dark Three were three power-hungry mortals: Bane the tyrant, Myrkul the necromancer, and Bhaal the assassin.", p: "origin", s: ["people", "legend"], src: FR_D3 },
    { t: "They forged a pact between them to achieve godhood or else die in the attempt.", p: "origin", s: ["intrigue", "faith"], src: FR_D3 },
    { t: "Before his ascension Bhaal was a power-hungry adventurer on Toril, and together with Bane and Myrkul Bey al-Kursi he set out after the portfolio of Jergal, the god of the dead.", p: "origin", s: ["faith", "people"], src: FR_BHA },
    { t: "Having defeated one of the Seven Lost Gods, the three were able to travel into Jergal's own domain, the Castle of Bone in the Gray Waste.", p: "deeds", s: ["landmark", "faith"], src: FR_BHA },
    { t: "Jergal willingly offered them his realm, and they could not decide among themselves which of them should rule it.", p: "faith", s: ["character", "governance"], src: FR_BHA },
    { t: "At Jergal's own suggestion they divided his power by the outcome of a game, and the game they played was knucklebones.", p: "legend", s: ["faith", "governance"], src: FR_BHA },
    { t: "Bane won, and claimed hatred, strife and tyranny for his own.", p: "governance", s: ["power", "faith"], src: FR_BHA },
    { t: "Myrkul came second and chose rule over the dead — which is the ultimate fate of all of Bane's minions.", p: "governance", s: ["power", "faith"], src: FR_BHA },
    { t: "Bhaal was left the divine province of death itself.", p: "governance", s: ["power", "faith"], src: FR_BHA },
    { t: "Bhaal's reign of terror in the Moonshae Isles in the Year of the Bloodbird, 1346 DR, stood as a fair example of his cruelty.", p: "history", s: ["threat", "legend"], src: FR_BHA },
    { t: "In the Time of Troubles, Cyric — having betrayed Kelemvor, Adon and Midnight after Bane and Torm killed one another — rallied his Zhentilar soldiers to hunt down his former friends and the Tablet of Fate they carried.", p: "intrigue", s: ["conflict", "people"], src: FR_D3 },
    { t: "Both Bhaal and Myrkul learned of that artifact, and the Lord of the Dead sent his night riders to intercept the party in the Hermit's Wood in Cormyr.", p: "conflict", s: ["intrigue", "people"], src: FR_D3 },
    { t: "The party escaped the ambush and went on westward to the town of Eveningstar.", p: "history", s: ["conflict", "people"], src: FR_D3 },
    { t: "Cyric came to the reunion that followed armed with the sword Godsbane.", p: "make", s: ["intrigue", "people"], src: FR_D3 },
    { t: "When their cults rose again in Baldur's Gate, the cultists were financed by Duke Thalamra Vanthampur.", p: "governance", s: ["trade", "intrigue"], src: FR_D3 },
    { t: "Their true leaders were the newly-risen chosen of the Dead Three: Lord Enver Gortash, devotee of Bane; the Dark Urge, holy assassin of Bhaal; and General Ketheric Thorm, the beleaguered supplicant of Myrkul.", p: "people", s: ["faith", "intrigue"], src: FR_D3 },
    { t: "Gortash and the Dark Urge laid a plot to win their gods dominion over Baldur's Gate, and countless murders within it and beyond.", p: "intrigue", s: ["conflict", "governance"], src: FR_D3 },
    { t: "They stole a powerful relic called the Crown of Karsus from the archdevil Mephistopheles.", p: "deeds", s: ["make", "intrigue"], src: FR_D3 },
    { t: "That crown they forced upon the elder brain which dwelt in the depths of Moonrise Towers.", p: "deeds", s: ["structure", "make"], src: FR_D3 },
    { t: "They then worked the elder brain into infecting scores of Faerûnians with illithid tadpoles that induced a latent ceremorphosis, making the so-called True Souls.", p: "threat", s: ["intrigue", "people"], src: FR_D3 },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 19 (30 Jul) — `dessarin`, tier 1 (2 sourced, first of a three-way tie). Tier 2: person,
// creature and object all at 0 there. Tier 3: Gar Shatterkeel is the deepest of the four.
//
// SECOND SUB-20 SUBJECT, AND THE SECOND IN THIS REGION. 17 honest facts. Red Larch came in at 17
// too. The pattern from B-16 is confirming rather than coincidental: the dessarin rows drafted on
// 30 Jul run lighter than the inherited ones, and this region will not average 20.
//
// SCOPE. The cult's doctrine belongs to the Prophecy of the Elder Elemental Eye row, and the four
// weapons to the Elemental Weapons row. Only enough cult context is drawn here to make the man
// legible — the same reservation made for Trolls against the Trollwars in Batch 11.
// ---------------------------------------------------------------------------------------
const FR_GAR = "forgottenrealms.fandom.com/wiki/Gar_Shatterkeel";
const FR_ELE = "forgottenrealms.fandom.com/wiki/Elemental_Evil";
const FR_1491 = "forgottenrealms.fandom.com/wiki/1491_DR";

export const GAR_SHATTERKEEL: LibrarySubject = {
  id: "gar_shatterkeel",
  label: "Gar Shatterkeel",
  category: "person",
  facts: [
    { t: "Gar Shatterkeel was the Prophet of Water and the leader of the Cult of the Crushing Wave in the late 15th century DR.", p: "deeds", s: ["governance", "faith"], src: FR_GAR },
    { t: "He was born in a poor fishing village in the Nelanther Isles.", p: "origin", s: ["people", "trade"], src: FR_GAR },
    { t: "While he was still young, sahuagin came against that village and slaughtered everyone in it.", p: "origin", s: ["threat", "people"], src: FR_GAR },
    { t: "Soon after, he was conscripted by a Tethyrian merchant galley and grew up in a brutal indentured servitude that was little better than slavery.", p: "origin", s: ["trade", "threat"], src: FR_GAR },
    { t: "When pirates destroyed that ship he clung to the wreckage for days, until a shark tore off his left arm.", p: "origin", s: ["threat", "nature"], src: FR_GAR },
    { t: "His skin was covered over in barnacles.", p: "nature", s: ["origin", "threat"], src: FR_GAR },
    { t: "In place of the lost left arm he wore a great mechanical crab claw.", p: "nature", s: ["make", "origin"], src: FR_GAR },
    { t: "As Prophet he wielded a magical trident called Drown.", p: "power", s: ["make", "faith"], src: FR_GAR },
    { t: "Each of the four cults of Elemental Evil was devoted to one of the Princes of Elemental Evil — godlike entities embodying air, earth, fire and water — and each was led by a nihilistic prophet corrupted by power.", p: "faith", s: ["society", "governance"], src: FR_ELE },
    { t: "The mutilated sailor meant to drown the world, and the Cult of the Crushing Wave was how he intended to do it.", p: "character", s: ["threat", "faith"], src: FR_ELE },
    { t: "In 1491 DR the four cults rose as a single union when the prophets took possession of the elemental weapons, Gar taking the trident Drown for his own.", p: "deeds", s: ["make", "faith"], src: FR_1491 },
    { t: "Together they formed the Fane of the Eye, beneath the ruins of the ancient dwarven fortress-city of Tyar-Besil in the Sumber Hills of the Dessarin Valley, in order to summon the Princes of Elemental Evil.", p: "structure", s: ["faith", "governance"], src: FR_1491 },
    { t: "The cults used devastation orbs, forged of raw elemental power, to ravage Faerûn with earthquakes, typhoons, tornados and other disasters.", p: "threat", s: ["make", "conflict"], src: FR_ELE },
    { t: "After months of working in secret the Cult of the Black Earth attacked a delegation out of Mirabar bound for Waterdeep, which drew the attention of the Lords' Alliance, the Harpers, the Order of the Gauntlet, the Emerald Enclave, and even the Zhentarim, all of whom sent agents.", p: "conflict", s: ["allies", "governance"], src: FR_1491 },
    { t: "Gar was killed by adventurers along with the other three prophets, and the Cult of Elemental Evil came apart, its followers scattering into hiding.", p: "conflict", s: ["legacy", "people"], src: FR_1491 },
    { t: "He did not stay dead: after that defeat the sea goddess Umberlee saved him, and he served thereafter as one of her Chosen.", p: "faith", s: ["legacy", "power"], src: FR_GAR },
    { t: "As Umberlee's Chosen he carried a different trident, called Wave.", p: "power", s: ["make", "legacy"], src: FR_GAR },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 20 (30 Jul) — `feywild`, tier 1 (2 sourced, first of a two-way tie). Tier 2: location,
// person and object all at 0 there. Tier 3: the Witchlight Carnival runs deepest of the four,
// carrying Mister Witch and Diana Cloppington as satellites.
// Constant NAMES checked as well as URLs before declaring — the B-50 lesson.
// ---------------------------------------------------------------------------------------
const FR_WC = "forgottenrealms.fandom.com/wiki/Witchlight_Carnival";
const FR_MW = "forgottenrealms.fandom.com/wiki/Mister_Witch";
const FR_DC = "forgottenrealms.fandom.com/wiki/Diana_Cloppington";
const FR_WBW = "forgottenrealms.fandom.com/wiki/The_Wild_Beyond_the_Witchlight";

export const WITCHLIGHT_CARNIVAL: LibrarySubject = {
  id: "witchlight_carnival",
  label: "The Witchlight Carnival",
  category: "location",
  facts: [
    { t: "The Witchlight Carnival was a traveling circus that ventured across both the Feywild and the Prime Material plane.", p: "landmark", s: ["trade"], src: FR_MW },
    { t: "Once every eight years it touched down upon a world, carrying its joy to one settlement after the next.", p: "landmark", s: ["trade"], src: FR_WBW },
    { t: "When it arrived it would set up outside a large population center.", p: "structure", s: ["trade"], src: FR_WC },
    { t: "It came to the town of Daggerford at least twice over the course of eight years.", p: "history", s: ["landmark"], src: FR_WC },
    { t: "It was owned and operated by two shadar-kai, Mister Witch and Mister Light.", p: "governance", s: ["people"], src: FR_WC },
    { t: "The two of them grew up together in Gloomwrought, a city of the Shadowfell, before entering into business as carnivaleers.", p: "origin", s: ["people"], src: FR_WC },
    { t: "Before it was so named, the carnival belonged to an eladrin called Isolde.", p: "origin", s: ["governance"], src: FR_WC },
    { t: "After a night of drinking, Isolde swapped her fey-themed carnival for the one those two shadar-kai were running.", p: "legend", s: ["origin"], src: FR_WC },
    { t: "Mister Witch was born Naeryx Krumple.", p: "people", s: ["origin"], src: FR_MW },
    { t: "He set himself apart from the rest of the carnival by his fine attire, which ran to a top hat and a walking stick.", p: "people", s: ["character"], src: FR_MW },
    { t: "Authoritative and stern, and outright dour at first glance, he preferred tidiness and structure and brought order to whatever he touched.", p: "character", s: ["governance"], src: FR_MW },
    { t: "His most prized possession was the Witchlight Watch, which let him magically pack and unpack the entire carnival within the span of an hour.", p: "make", s: ["power", "people"], src: FR_MW },
    { t: "Where Mister Witch was reserved and pragmatic, Mister Light was ostentatious and extravagant.", p: "character", s: ["people"], src: FR_MW },
    { t: "A hundred and twenty-four workers kept the place running, and they were known as the Witchlight hands.", p: "society", s: ["people"], src: FR_WC },
    { t: "The hands ran the games and the booths, maintained the equipment, kept the animals, and took the tickets.", p: "society", s: ["trade"], src: FR_WC },
    { t: "Among the performers were Thaco, a human clown loyal to Mister Witch and fond of his bubble pipe; Treaclewise, a pleasant goblin with an unusual manner of speech; and Zephixo, a dwarf who designed and operated the Mystery Mine.", p: "people", s: ["society"], src: FR_WC },
    { t: "Several of the carnival's folk were awakened animals: Biscuit a hamster, Beatrice a heron, Red a squirrel, and Pinecone a pug who would obey nobody but pixies.", p: "nature", s: ["people"], src: FR_WC },
    { t: "Feathereen, an arrogant giant swan, gave gondola rides, and the grounds also held races run by giant snails.", p: "nature", s: ["landmark"], src: FR_WC },
    { t: "Diana Cloppington took the tickets for the carousel, cursed by a bargain with a hag of the Hourglass Coven into a shape resembling a piebald centaur.", p: "people", s: ["threat"], src: FR_DC },
    { t: "She had lost her beloved warhorse and went into Prismeer seeking Granny Skabatha Nightshade to get it back; instead the hag fused her body with her mount's, and afterward she fled, and Mister Light felt for her plight and gave her work and a home.", p: "legend", s: ["threat", "people"], src: FR_DC },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 21 (30 Jul) — `wildspace`, tier 1 alone at the floor with 2. Tier 2: legend, location and
// object all at 0 there. Tier 3: the Spelljammer runs deepest of the four, carrying the Smalljammer
// page as a satellite. One subject brings wildspace level with the pack at 3 and tightens the
// region-spread ratchet from 7 to 6.
// ---------------------------------------------------------------------------------------
const FR_SJS = "forgottenrealms.fandom.com/wiki/Spelljammer_(spelljammer)";
const FR_SMJ = "forgottenrealms.fandom.com/wiki/Smalljammer";
const FR_SJ = "forgottenrealms.fandom.com/wiki/Spelljammer";

export const THE_SPELLJAMMER: LibrarySubject = {
  id: "the_spelljammer",
  label: "The Spelljammer",
  category: "object",
  facts: [
    { t: "The Spelljammer was a legendary sentient ship, the only one of its kind and the largest spelljammer in all of known space.", p: "make", s: ["legend"], src: FR_SJS },
    { t: "It was shaped like something between a manta ray and a scorpion.", p: "make", s: ["nature"], src: FR_SJS },
    { t: "Estimates put it at a million and a half tons, some fifteen hundred feet across and better than three thousand feet from end to end.", p: "make", s: ["structure"], src: FR_SJS },
    { t: "Its armament ran to heavy, medium and light catapults and ballistae by the dozen, and a sphere of annihilation besides.", p: "threat", s: ["make"], src: FR_SJS },
    { t: "Some held that the ship was no god itself but the seed of one — a thing that would in time spring forth a full-blown god, with its watchers there to worship it.", p: "faith", s: ["legend"], src: FR_SJS },
    { t: "One rumor had it built by gnomes, and said the building used up the whole of their cleverness, which is why nothing has worked properly for them since.", p: "legend", s: ["origin"], src: FR_SJS },
    { t: "An emperor who had seen the ship with his own eyes ordered a man named Lu Pi to go and find it and bring it back for his personal collection.", p: "history", s: ["intrigue"], src: FR_SJS },
    { t: "Some time before the 13th century DR the Krynnish gnome Judd Oskoshtormirange witnessed the destruction of a Spelljammer at the hands of the neogi.", p: "history", s: ["conflict"], src: FR_SJS },
    { t: "Judd was a slave aboard one of the neogi ships at the time, and he reported that the assault had required a fleet of more than fifty vessels.", p: "conflict", s: ["people"], src: FR_SJS },
    { t: "Most of that fleet was destroyed in the attempt, and the neogi presence in wildspace has been considerably the weaker ever since.", p: "conflict", s: ["legacy"], src: FR_SJS },
    { t: "The sea elf Dolphinlaugh claimed to have watched it sail above the surface of Toril, and to have felt the strong allure of the thing.", p: "legend", s: ["people"], src: FR_SJS },
    { t: "A spelljammer of the ordinary sort is a magically powered vessel able to travel great distances, even out into the Sea of Night.", p: "make", s: ["landmark"], src: FR_SJ },
    { t: "Each such ship carries a magical helm — a captain's chair — that lets a sufficiently powerful mage pilot the vessel.", p: "make", s: ["power"], src: FR_SJ },
    { t: "Smalljammers were living spelljammers created as part of the great ship's own reproductive cycle.", p: "nature", s: ["origin"], src: FR_SMJ },
    { t: "They took after their parent, resembling manta rays with an upswept tail, and they could disguise their true appearance at will.", p: "nature", s: ["make"], src: FR_SMJ },
    { t: "A smalljammer would accept a major or minor spelljamming helm and no other kind; fit it with a lifejammer and the ship died and broke apart within days.", p: "make", s: ["threat"], src: FR_SMJ },
    { t: "They felt no affinity for their siblings or their parent beyond a bare empathic level, considered themselves unique in the universe, and disliked lying near too many other ships.", p: "nature", s: ["character"], src: FR_SMJ },
    { t: "Like the Spelljammer itself they bonded psychically with their captains, and that bond could be broken by the captain's death, by abandonment, or by constantly putting the ship in danger.", p: "power", s: ["character"], src: FR_SMJ },
    { t: "Aboard one, the captain and every passenger enjoyed perfect hospitality: the ship raised doorways and furnishings out of its own material to suit whatever they needed.", p: "make", s: ["people"], src: FR_SMJ },
    { t: "They were bred once in each new captain's lifetime, around a hundred vessels raised in the great ship's gardens over some eighteen weeks.", p: "origin", s: ["nature"], src: FR_SMJ },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 22 (30 Jul) — FLOOR SWEEP, 1 of 7. Seven regions stood level at 3 sourced, so rather than
// let one pull ahead the sweep takes a single subject through each in turn, lifting the whole floor
// to 4 before anything advances. `barovia` first by tier order; legend, location and creature all
// at 0 there; Vampires runs deepest of the three candidates.
//
// Mechanics deliberately excluded: the vampire stat block's numbered weaknesses are published rules
// text, not wiki lore. The Library deals in flavor-grade sourced notes, so the weaknesses appear
// here only as they are described in prose.
// ---------------------------------------------------------------------------------------
const FR_VAM = "forgottenrealms.fandom.com/wiki/Vampire";
const FR_VSP = "forgottenrealms.fandom.com/wiki/Vampire_spawn";
const FR_NOS = "forgottenrealms.fandom.com/wiki/Nosferatu";
const FR_VDR = "forgottenrealms.fandom.com/wiki/Vampiric_dragon";

export const VAMPIRES: LibrarySubject = {
  id: "vampires",
  label: "Vampires",
  category: "creature",
  facts: [
    { t: "Vampires were a kind of powerful and much-feared undead that fed on blood, showed no mercy, and held no feeling of compassion.", p: "nature", s: ["threat"], src: FR_VAM },
    { t: "For the most part a vampire kept the appearance it had held in life.", p: "nature", s: [], src: FR_VAM },
    { t: "The differences were a pallor of the skin and a sharpening of the features, which together gave them a predatory aspect.", p: "nature", s: ["behavior"], src: FR_VAM },
    { t: "Whatever color the eyes had been in life, after the change they turned to a red that was hard to forget.", p: "nature", s: [], src: FR_VAM },
    { t: "Their hands ended in sharp, glassy claws.", p: "nature", s: ["threat"], src: FR_VAM },
    { t: "They carried retractable monstrous canines, kept for piercing the flesh of what they fed upon.", p: "nature", s: ["threat"], src: FR_VAM },
    { t: "In the Year of Three Ships Sailing, 1492 DR, a vampire lord out of Kozakura named Cazador attempted a ritual granted him by the archdevil Mephistopheles, meant to make him a vampire ascendant — stripped of every undead weakness and given back the pleasures of the living.", p: "legend", s: ["intrigue"], src: FR_VAM },
    { t: "The preparation for that ritual took him two centuries.", p: "legend", s: ["history"], src: FR_VAM },
    { t: "His favored spawn gathered countless victims and turned them all into spawn in their turn, to be sacrificed in empowering the vampire at the ritual's center.", p: "intrigue", s: ["threat"], src: FR_VAM },
    { t: "Vampire spawn were undead created by vampires.", p: "origin", s: ["nature"], src: FR_VSP },
    { t: "Spawn did not possess all the abilities of a true vampire, yet they still suffered every one of the traditional weaknesses and vulnerabilities.", p: "nature", s: ["threat"], src: FR_VSP },
    { t: "They were masters of stealth and of charismatic cunning, and could hold their ground against most any foe.", p: "behavior", s: ["power"], src: FR_VSP },
    { t: "Battle was a simple matter to them: what they could not win by force they escaped, vanishing into gaseous form or climbing away like spiders.", p: "behavior", s: ["power"], src: FR_VSP },
    { t: "Their bite and their touch alike caused blood drain and domination.", p: "threat", s: ["power"], src: FR_VSP },
    { t: "Spawn typically believed themselves superior to any other creature living or undead, however powerful that creature actually was, and pride was the true driver of them.", p: "behavior", s: ["character"], src: FR_VSP },
    { t: "Those that took to adventuring sought vengeance upon their creators, or penance for their new damnation; and if they could master their ravenous emotions they might go seeking knowledge, glory, or power instead.", p: "behavior", s: ["character"], src: FR_VSP },
    { t: "In the Demiplane of Dread the vampire Strahd von Zarovich kept numerous spawn, some serving in his castle and others hidden away in settlements across Barovia.", p: "society", s: ["people", "threat"], src: FR_VSP },
    { t: "The nosferatu were a strain of vampire out of the Domains of Dread, with gaunt faces, pale grey skin cold to the touch, and eyes that glowed with an unholy light.", p: "nature", s: ["origin"], src: FR_NOS },
    { t: "A nosferatu depended on blood far more heavily than a common vampire, near to the point of addiction, and grew hungrier with every passing night.", p: "behavior", s: ["threat"], src: FR_NOS },
    { t: "Where an ordinary vampire was anchored to its coffin, a vampiric dragon was anchored instead to its hoard.", p: "nature", s: ["habitat"], src: FR_VDR },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 22 (30 Jul) — FLOOR SWEEP, 2 of 7. `chult`; location and person both at 0 there; Port
// Nyanzaru runs deepest of the three candidates, carrying the Merchants' Ward, Fort Nyanzaru and
// four of the merchant princes as satellites.
// ---------------------------------------------------------------------------------------
const FR_PN = "forgottenrealms.fandom.com/wiki/Port_Nyanzaru";
const FR_PNM = "forgottenrealms.fandom.com/wiki/Port_Nyanzaru/Merchants'_Ward";
const FR_FN = "forgottenrealms.fandom.com/wiki/Fort_Nyanzaru";
const FR_JOB = "forgottenrealms.fandom.com/wiki/Jobal";
const FR_JES = "forgottenrealms.fandom.com/wiki/Jessamine";
const FR_WAK = "forgottenrealms.fandom.com/wiki/Wakanga_O'tamu";

export const PORT_NYANZARU: LibrarySubject = {
  id: "port_nyanzaru",
  label: "Port Nyanzaru",
  category: "location",
  facts: [
    { t: "Port Nyanzaru was a port city in northern Chult and the major trading center for the whole of Chult.", p: "landmark", s: ["trade"], src: FR_PN },
    { t: "Independent through the mid-to-late 14th century DR, it became an Amnian colony until at least 1479 DR, and regained its independence sometime in the 1480s.", p: "history", s: ["governance"], src: FR_PN },
    { t: "It stood on the Bay of Chult, at the mouths of the River Soshenstar and the River Tiryki.", p: "landmark", s: ["structure"], src: FR_PN },
    { t: "The city was built atop four hills, among them Mount Sibasa, Temple Hill and Throne Hill.", p: "landmark", s: ["structure"], src: FR_PN },
    { t: "Smugglers and black-market sellers were dealt with particularly harshly under the city's laws.", p: "governance", s: ["trade"], src: FR_PN },
    { t: "Slavery was not illegal there, but it was unwelcome, and slavers could do no business with the merchant princes.", p: "governance", s: ["trade"], src: FR_PN },
    { t: "Abundant wealth passed through the port, and goods both mundane and exotic could be found in it.", p: "trade", s: ["people"], src: FR_PN },
    { t: "The Merchants' Ward held both the city's many temples and the grand villa estates of its merchant princes, which made it the upper-class district.", p: "structure", s: ["people"], src: FR_PNM },
    { t: "That ward made up the western half of the walled portion of the city, abutting the Harbor Ward to the east.", p: "structure", s: ["landmark"], src: FR_PNM },
    { t: "Its southern portion was open ground dominated by the Grand Souk, a huge covered marketplace.", p: "trade", s: ["structure"], src: FR_PNM },
    { t: "Goldenthrone, a magnificent palace atop Throne Hill, served as the meeting place and audience chamber of the merchant princes.", p: "governance", s: ["structure"], src: FR_PNM },
    { t: "A more exclusive twin of the Grand Souk sat at the base of Throne Hill, and there Chultan gemstones were bought and sold.", p: "trade", s: ["landmark"], src: FR_PNM },
    { t: "The holy house of Savras at the top of Temple Hill was perhaps the most magnificent building in all of Port Nyanzaru.", p: "faith", s: ["structure"], src: FR_PNM },
    { t: "For all the ward's name, most merchants could not afford to live in it and made their homes in the Market Ward instead; the Merchants' Ward housed the city's wealthiest citizens.", p: "people", s: ["trade"], src: FR_PNM },
    { t: "Fort Nyanzaru was raised to defend the city against attackers out of the Bay of Chult, and stood in the Harbor Ward at the mouth of the harbor itself.", p: "conflict", s: ["structure"], src: FR_FN },
    { t: "A dungeon beneath that fort was used by the merchant princes to store treasure that was important or cursed.", p: "intrigue", s: ["governance"], src: FR_FN },
    { t: "A massive iron chain spanned the mouth of the harbor between the fort and the lighthouse.", p: "conflict", s: ["structure"], src: FR_FN },
    { t: "Jobal, called the Spider, was the merchant prince who hired out the guides and mercenaries that aided expeditions into the jungle — and by law every guide in the city gave him a cut of their pay.", p: "people", s: ["trade"], src: FR_JOB },
    { t: "Jessamine dealt in herbs and in poisons, and in sanctioned assassinations approved by herself and her fellow princes; she was a trained assassin whose specialty was poison, and she rarely spoke.", p: "people", s: ["intrigue"], src: FR_JES },
    { t: "Wakanga O'tamu was an information broker among the princes, offering lost lore and arcane knowledge and dealing in magic items, and the only arcane spellcaster of the seven.", p: "people", s: ["intrigue"], src: FR_WAK },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 23 (30 Jul) — FLOOR SWEEP, 3 of 7. `avernus`; legend and object both at 0 there. Tier 3:
// Infernal War Machines runs deepest of the three, carrying infernal iron and the Wandering
// Emporium as satellites. Interlocks Baldur's Gate through the Gondian steel watchers built for
// Enver Gortash, and Elturel through the chains that bound the city to the layer.
// ---------------------------------------------------------------------------------------
const FR_IWM = "forgottenrealms.fandom.com/wiki/Infernal_war_machine";
const FR_IIR = "forgottenrealms.fandom.com/wiki/Infernal_iron";
const FR_WEM = "forgottenrealms.fandom.com/wiki/Wandering_Emporium";

export const INFERNAL_WAR_MACHINES: LibrarySubject = {
  id: "infernal_war_machines",
  label: "Infernal War Machines",
  category: "object",
  facts: [
    { t: "Infernal war machines were terrible vehicles of war, manufactured and used by the devils of the Nine Hells and powered by the souls of mortals.", p: "make", s: ["threat"], src: FR_IWM },
    { t: "They were only one weapon among the many in the endless arsenals of the Hells.", p: "threat", s: ["conflict"], src: FR_IWM },
    { t: "The engine of each machine held a receptacle into which soul coins could be inserted.", p: "make", s: ["power"], src: FR_IWM },
    { t: "The soul trapped within such a coin was siphoned at once into the machine's furnace, processed into power, and destroyed within a matter of days.", p: "threat", s: ["power"], src: FR_IWM },
    { t: "Liquid demon ichor could be applied directly into the furnace to bolster a machine's performance.", p: "make", s: ["trade"], src: FR_IWM },
    { t: "The devils raced them across the battlefield of Avernus.", p: "conflict", s: ["landmark"], src: FR_IWM },
    { t: "Particular models carried names — the Merry Widow, Hells' Belle, the Buzz Killer among them.", p: "make", s: ["people"], src: FR_IWM },
    { t: "Some designs went so far as to incorporate the wings of a red dragon.", p: "make", s: ["nature"], src: FR_IWM },
    { t: "Infernal iron was a metallic substance found in the Nine Hells.", p: "make", s: ["origin"], src: FR_IIR },
    { t: "It was forged into a variety of hellish things: battle standards of infernal power, hellfire weapons, the war machines themselves, shattersticks, and soul coins.", p: "make", s: ["trade"], src: FR_IIR },
    { t: "Hellfire weapons claimed the souls of those they slew and directed them to the river Styx.", p: "threat", s: ["make"], src: FR_IIR },
    { t: "A battle standard of infernal power imbued the weapons of its carrier's allies with magical energy.", p: "power", s: ["conflict"], src: FR_IIR },
    { t: "Shattersticks were non-magical rods that created a small, concentrated earthquake.", p: "make", s: ["threat"], src: FR_IIR },
    { t: "Soul coins were a form of currency in common use throughout the Nine Hells.", p: "trade", s: ["governance"], src: FR_IIR },
    { t: "Steel watchers were constructs conceived and made by the Gondians of Baldur's Gate for Enver Gortash.", p: "make", s: ["intrigue"], src: FR_IIR },
    { t: "Among the unique things wrought from infernal iron were the gargantuan spikes and chains that bound the city of Elturel to Avernus.", p: "structure", s: ["landmark"], src: FR_IIR },
    { t: "The metal was mined in Cania, the eighth layer of the Nine Hells, and in Dis, the second.", p: "origin", s: ["trade"], src: FR_IIR },
    { t: "The Wandering Emporium held merchants peddling goods and services along with the devilish drivers who piloted its infernal war machines, and nearly all of them were indentured to Mahadi in one manner or another.", p: "people", s: ["trade"], src: FR_WEM },
    { t: "The salamanders of the Firesnake Forge serviced the emporium's war machines, and sold weapons and armor to its patrons besides.", p: "trade", s: ["people"], src: FR_WEM },
    { t: "Fhet'Ahla the amnizu offered currency exchange and messengers in return for soul coins, and preferred those that held the souls of celestial beings.", p: "trade", s: ["intrigue"], src: FR_WEM },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 23 (30 Jul) — FLOOR SWEEP, 4 of 7. `baldursgate`; person and creature both at 0 there.
//
// SOURCING RULING MADE HERE (see FINDINGS B-52). The Doppelganger page carries explicit
// [citation needed] flags on several of its claims — the batrachi-origin story and the fondness for
// working with the magically inclined among them — and states that part of its text derives from
// Wikipedia. Those flagged claims are EXCLUDED. A wiki page telling you which of its own sentences
// are unsourced is doing the Library a favour, and repeating them as sourced facts would launder an
// uncited claim into an authoritative one. 19 facts, not 20, and that is the honest count.
// ---------------------------------------------------------------------------------------
const FR_DOP = "forgottenrealms.fandom.com/wiki/Doppelganger";
const FR_GDP = "forgottenrealms.fandom.com/wiki/Greater_doppelganger";
const FR_CHG = "forgottenrealms.fandom.com/wiki/Changeling";

export const DOPPELGANGERS: LibrarySubject = {
  id: "doppelgangers",
  label: "Doppelgangers",
  category: "creature",
  facts: [
    { t: "Doppelgangers were monstrous humanoids, infamous for a shapeshifting that let them mimic almost any humanoid creature.", p: "nature", s: ["threat"], src: FR_DOP },
    { t: "They were lazy but cunning, killing or otherwise disposing of people and then assuming their place.", p: "behavior", s: ["threat"], src: FR_DOP },
    { t: "They were not actually evil, but they were extremely self-centered and inclined to look down upon their victims.", p: "behavior", s: ["character"], src: FR_DOP },
    { t: "They were feared above all for the ability to take the form of any humanoid they encountered.", p: "threat", s: ["nature"], src: FR_DOP },
    { t: "Beings all over the world made use of them as spies and as assassins.", p: "society", s: ["intrigue"], src: FR_DOP },
    { t: "Many of them lived a stolen life: coming upon a person whose appearance or station they wanted, they used their mental powers to learn everything they could about that target.", p: "intrigue", s: ["behavior"], src: FR_DOP },
    { t: "Once they had all the knowledge they needed they quietly eliminated the target and took their place in life.", p: "intrigue", s: ["threat"], src: FR_DOP },
    { t: "In their true form they appeared as tall, elven, gray-skinned humanoids, their thin bodies making them look to human eyes as though they had no sex at all.", p: "nature", s: [], src: FR_DOP },
    { t: "Even that form was deceptive: it suggested physical weakness where in truth they were quite strong and agile.", p: "nature", s: ["threat"], src: FR_DOP },
    { t: "Their ordinary appearance was a gray-skinned humanoid with a formless face and pale white eyes, and no hair upon them at all.", p: "nature", s: [], src: FR_DOP },
    { t: "They called their own species the Shallar.", p: "society", s: ["nature"], src: FR_DOP },
    { t: "The greater sort were called elder doppelgangers, or else mirrorkin.", p: "nature", s: ["society"], src: FR_GDP },
    { t: "Where a common doppelganger could adopt the appearance of a person, a greater one could adopt their entire personality.", p: "power", s: ["threat"], src: FR_GDP },
    { t: "They looked much as their lesser kin did — gangly, hairless, gray-skinned, with pale eyes.", p: "nature", s: [], src: FR_GDP },
    { t: "They were faster and more agile than the common sort.", p: "nature", s: ["power"], src: FR_GDP },
    { t: "Changelings were a race related to the doppelgangers, with a natural gift for shapeshifting that made them effective as actors, as spies, and as criminals.", p: "nature", s: ["society"], src: FR_CHG },
    { t: "In its true form a changeling looked rather like a doppelganger, though it bore less resemblance to a regular humanoid.", p: "nature", s: [], src: FR_CHG },
    { t: "Set beside a human they appeared faded and lacking in detail, and might be taken for somebody with albinism.", p: "nature", s: ["people"], src: FR_CHG },
    { t: "A typical changeling had skin of a pale grey hue and thin hair upon the head.", p: "nature", s: ["people"], src: FR_CHG },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 24 (30 Jul) — FLOOR SWEEP, 5 of 7. `dessarin`; creature and object both at 0 there. Tier 3:
// the Elemental Weapons run deeper than the Elementals row, because the four weapons drag in
// Vizeran DeVir and the Fane of the Eye behind them. This is also the FIRST dessarin subject to
// reach a full 20 — the region's thinness (B-16, Batch 19) is not uniform, and a row whose subject
// has satellites can still carry its weight. FR_1491 is REUSED, not redeclared.
// ---------------------------------------------------------------------------------------
const FR_TIN = "forgottenrealms.fandom.com/wiki/Tinderstrike";
const FR_VIZ = "forgottenrealms.fandom.com/wiki/Vizeran_DeVir";
const FR_FOE = "forgottenrealms.fandom.com/wiki/Fane_of_the_Eye";

export const ELEMENTAL_WEAPONS: LibrarySubject = {
  id: "elemental_weapons",
  label: "The Elemental Weapons",
  category: "object",
  facts: [
    { t: "The four elemental weapons were the spear Windvane, the dagger Tinderstrike, the war pick Ironfang, and the trident Drown.", p: "make", s: ["people", "origin"], src: FR_1491 },
    { t: "Tinderstrike was a flint dagger with an exceptionally sharp blade.", p: "make", s: ["nature", "origin"], src: FR_TIN },
    { t: "Whoever carried Tinderstrike grew impatient and reckless.", p: "threat", s: ["character", "make"], src: FR_TIN },
    { t: "Vizeran DeVir, a drow worshiper of the Elder Elemental Eye, forged that dagger using part of the essence of Imix, Prince of Evil Fire, in the temple called the Fane of the Eye.", p: "make", s: ["origin", "faith"], src: FR_TIN },
    { t: "He left it there to await its prophesied bearer.", p: "legend", s: ["origin", "make"], src: FR_TIN },
    { t: "In the Year of the Scarlet Witch, 1491 DR, the tiefling Vanifer found it.", p: "history", s: ["people", "make"], src: FR_TIN },
    { t: "Vizeran DeVir was an exiled drow archmage of the late 15th century DR.", p: "people", s: ["origin", "intrigue"], src: FR_VIZ },
    { t: "Centuries before that time he crafted Ironfang, Drown, Windvane and Tinderstrike for the cults of Elemental Evil, in the Fane of the Eye beneath Tyar-Besil.", p: "make", s: ["history", "origin"], src: FR_VIZ },
    { t: "Gromph discovered Vizeran's true devotion to the Elder Elemental Eye and arranged to have him exposed as no believer in Lolth, which brought about his disgrace and his exile.", p: "intrigue", s: ["faith", "people"], src: FR_VIZ },
    { t: "That exile ironically spared him the downfall of House DeVir at the hands of House Do'Urden.", p: "legacy", s: ["intrigue", "history"], src: FR_VIZ },
    { t: "In exile he became a great archmage, raising his tower of Araj and plotting his revenge.", p: "origin", s: ["structure", "intrigue"], src: FR_VIZ },
    { t: "His aim was revenge upon Gromph for what had been done to him, and upon Lolth for the dominion she held over all drow.", p: "character", s: ["intrigue", "people"], src: FR_VIZ },
    { t: "His plans were entirely self-serving, and he would sacrifice anyone at all without hesitation to further them.", p: "character", s: ["people", "intrigue"], src: FR_VIZ },
    { t: "He dealt with only two beings — his death slaad Kleve and his apprentice Grin Ousstyl — and he trusted neither of them.", p: "allies", s: ["character", "people"], src: FR_VIZ },
    { t: "The Fane of the Eye was a large cavern complex deep beneath the Dessarin Valley.", p: "structure", s: ["underground", "origin"], src: FR_FOE },
    { t: "It was centered upon a black ziggurat temple raised by renegade drow and dedicated to the Elder Elemental Eye.", p: "structure", s: ["faith", "origin"], src: FR_FOE },
    { t: "The cult that built it eventually died out, or else was hunted down by drow loyal to Lolth.", p: "history", s: ["conflict", "faith"], src: FR_FOE },
    { t: "The complex lay abandoned until Vizeran DeVir found it and put it to use forging the four weapons.", p: "origin", s: ["make", "structure"], src: FR_FOE },
    { t: "He left them lying there until the Fane was rediscovered in 1491 DR by the latest incarnation of the Cult of Elemental Evil.", p: "history", s: ["legend", "make"], src: FR_FOE },
    { t: "Taking possession of the weapons, the prophets made the Fane their own beneath the ruins of Tyar-Besil in the Sumber Hills, and set about summoning the Princes of Elemental Evil.", p: "structure", s: ["faith", "legend"], src: FR_1491 },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 25 (30 Jul) — FLOOR SWEEP, 6 of 7. `feywild`; person and object both at 0 there. Tier 3
// applied with the SATELLITE TEST from Batch 24: Zybilna beats the Carnival relics not because her
// own page is longer but because she is also Iggwilv, which hangs Prismeer, the Palace of Heart's
// Desire, the Hourglass Coven and the League of Malevolence off a single row. The relics are a
// list; she is a web. The test predicted 20 facts and delivered them.
//
// Closes the loop on Batch 20: she is the patron of the Witchlight Carnival.
// ---------------------------------------------------------------------------------------
const FR_IGG = "forgottenrealms.fandom.com/wiki/Iggwilv";
const FR_PRI = "forgottenrealms.fandom.com/wiki/Prismeer";
const FR_PHD = "forgottenrealms.fandom.com/wiki/Palace_of_Heart's_Desire";
const FR_ARF = "forgottenrealms.fandom.com/wiki/Archfey";

export const ZYBILNA: LibrarySubject = {
  id: "zybilna",
  label: "Zybilna",
  category: "person",
  facts: [
    { t: "Iggwilv, known also as Tasha or Natasha and under the alias Zybilna, was an Oerthian archmage and demonologist.", p: "origin", s: ["people", "character"], src: FR_IGG },
    { t: "She famously wrote the Demonomicon of Iggwilv, a tome of demonic lore.", p: "deeds", s: ["legacy", "legend"], src: FR_IGG },
    { t: "Later in life she created her own Domain of Delight in the Feywild and ascended as one of that plane's powerful archfey.", p: "deeds", s: ["origin", "power"], src: FR_IGG },
    { t: "Her exact appearance was unknown to most: some described a ravishing beauty, and others a bald and hideous crone.", p: "character", s: ["legend", "people"], src: FR_IGG },
    { t: "She sought always to garner more power for herself, made many enemies among the chaotic fiends, and fled to worlds beyond for her own safety.", p: "character", s: ["conflict", "power"], src: FR_IGG },
    { t: "In time she settled in Prismeer, her own Domain of Delight, and ruled it from the Palace of Heart's Desire in the guise of Zybilna.", p: "deeds", s: ["governance", "structure"], src: FR_IGG },
    { t: "Over the years she transformed into a fey being and turned her studies toward that new state of existence rather than toward demonology.", p: "power", s: ["character", "origin"], src: FR_IGG },
    { t: "As an archfey she was immortal and could not die of age.", p: "power", s: ["nature", "legend"], src: FR_IGG },
    { t: "She kept a vast collection of magic items, oddities and personal mementos within the Palace of Heart's Desire.", p: "make", s: ["legacy", "structure"], src: FR_IGG },
    { t: "She was betrayed at last by the three daughters of Baba Yaga — Skabatha, Bavlorna and Endelyn, the hags of the Hourglass Coven — together with their cronies in the League of Malevolence.", p: "intrigue", s: ["allies", "people"], src: FR_IGG },
    { t: "They used the magic of her own personal cauldron to freeze the Witch Queen in time, and many another inhabitant of her palace with her.", p: "intrigue", s: ["power", "structure"], src: FR_IGG },
    { t: "Prismeer was a Domain of Delight in the parallel plane of the Feywild, created and ruled by Zybilna.", p: "origin", s: ["landmark", "governance"], src: FR_PRI },
    { t: "Like the other domains its appearance shifted with the emotions of those dwelling in it, and Zybilna herself could reshape the whole of Prismeer with one dramatic turn of her feelings.", p: "power", s: ["landmark", "character"], src: FR_PRI },
    { t: "Any children who came into Prismeer, by intention or by accident, were protected by enchantments she had laid — and children never seemed to age there, however long they stayed.", p: "power", s: ["people", "governance"], src: FR_PRI },
    { t: "Death played out differently in Prismeer than on the Prime: a body might decay in moments, or else turn to stone.", p: "nature", s: ["threat", "landmark"], src: FR_PRI },
    { t: "Failure to keep Zybilna's three rules led to excommunication from the domain.", p: "governance", s: ["threat", "people"], src: FR_PRI },
    { t: "The domain was confined within great walls of mist, and passage through them was granted only by the express consent of its ruling archfey.", p: "structure", s: ["governance", "landmark"], src: FR_PRI },
    { t: "The Palace of Heart's Desire, also called Lavoglia, stood at the center of her realm, connected to the adjacent lands of Hither, Thither and Yon.", p: "structure", s: ["landmark", "origin"], src: FR_PHD },
    { t: "Though raised as a refuge for lost and wayward souls, its building required the unwitting bondage of several fey creatures, and it housed physical manifestations of her greatest dreams alongside the darkest aspects of her character.", p: "make", s: ["character", "people"], src: FR_PHD },
    { t: "She was also the patron of the Witchlight Carnival.", p: "allies", s: ["people", "governance"], src: FR_ARF },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 26 (30 Jul) — FLOOR SWEEP, 7 of 7 — COMPLETE. `wildspace`; legend and location both at 0.
// Satellite test again: the Rock of Bral carries the asteroid, the city, the prince, and a
// sourcebook page cataloguing dozens of named inhabitants, against the Unhuman Wars' single page.
// With this the floor lifts to 4 across all twelve regions.
// ---------------------------------------------------------------------------------------
const FR_ROB = "forgottenrealms.fandom.com/wiki/Rock_of_Bral";
const FR_BRA = "forgottenrealms.fandom.com/wiki/Bral";
const FR_AND = "forgottenrealms.fandom.com/wiki/Andru";

export const ROCK_OF_BRAL: LibrarySubject = {
  id: "rock_of_bral",
  label: "The Rock of Bral",
  category: "location",
  facts: [
    { t: "The asteroid held only a single city, named Bral, and it was one of the most cosmopolitan cities in any crystal sphere.", p: "landmark", s: ["people"], src: FR_ROB },
    { t: "For all that the Rock was a haven for pirates, it also held the only temple to Tyr, god of justice, in all of Realmspace.", p: "faith", s: ["landmark"], src: FR_ROB },
    { t: "Lake Bral needed refilling every four to seven years: the Bralian Navy would find and lasso an ice asteroid, haul it back, break it up in space into chunks of a ton apiece, and drop them carefully into the lake until it was full — three months' work, all told.", p: "structure", s: ["trade"], src: FR_ROB },
    { t: "The water was treated with animal cultures and waste-eating monsters to keep it pure enough to drink.", p: "structure", s: ["nature"], src: FR_ROB },
    { t: "Oxygen and food both were produced by vegetation growing on the lower side of the asteroid.", p: "structure", s: ["trade"], src: FR_ROB },
    { t: "Most of the work of tending those fields and groves was done by convicted criminals as part of their sentence.", p: "governance", s: ["people"], src: FR_ROB },
    { t: "Also on the underside were massive vanes — enormous sails crafted from the wings of a radiant dragon — which let the Rock be steered a little in its orbit.", p: "make", s: ["structure"], src: FR_ROB },
    { t: "Prince Andru held a contract with a company of wizards known as the Fireball Alliance, who served the Rock as its magical defense force.", p: "power", s: ["governance"], src: FR_ROB },
    { t: "Gamalon Idogyr of Tethyr lived on Bral for several decades in the 14th century DR, met and married his wife Mynda there, and kept a curio shop — and Elminster and Lhaeo travelled out to visit him on occasion.", p: "people", s: ["trade"], src: FR_ROB },
    { t: "A beholder called Large Luigi, who had gathered more knowledge than any non-divine being in the many crystal spheres, lived on the Rock and worked as a bartender at the Laughing Beholder.", p: "people", s: ["legend"], src: FR_ROB },
    { t: "Bral was the sole city on the surface of the Rock and one of the greatest merchant spaceports known to any race of the multiverse.", p: "trade", s: ["landmark"], src: FR_BRA },
    { t: "The city was built upon the upper side, while the underside was reserved for agriculture and for government property.", p: "structure", s: ["governance"], src: FR_BRA },
    { t: "It was divided into the High City, the Middle City, and the Low City.", p: "structure", s: ["landmark"], src: FR_BRA },
    { t: "A great wall and Lake Bral together separated the High City from the rest of Bral.", p: "structure", s: ["landmark"], src: FR_BRA },
    { t: "The nobles of Bral were the thirty-seven persons besides the prince who actually owned land on the small asteroid; all other land belonged to the prince, and every other citizen rented from him or from the nobles.", p: "governance", s: ["people"], src: FR_BRA },
    { t: "The city kept a graveyard, though most of its dead were cremated, composted, or set adrift in wildspace.", p: "people", s: ["nature"], src: FR_BRA },
    { t: "The older and more superstitious citizens held that Bral would one day be destroyed by the asteroid's original inhabitants.", p: "legend", s: ["people"], src: FR_BRA },
    { t: "After Frun died, Prince Calar ruled only six days before he was assassinated by being jettisoned into space, and his brother Andru took the throne.", p: "intrigue", s: ["governance"], src: FR_BRA },
    { t: "Within fifteen years Andru had doubled the size of Bral's army, tripled the size of its navy, and strengthened the law-enforcement of its government.", p: "conflict", s: ["governance"], src: FR_BRA },
    { t: "Recognizing that his small city was no powerful state, Andru set out to make the Rock a neutral ground for diplomacy and negotiation among the spacefaring races, and gained great profit serving as mediator and powerbroker.", p: "governance", s: ["trade"], src: FR_AND },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 27 (30 Jul) — NINE-REGION PROGRAM, round A. Nine regions stand at 4; Frank's plan is to
// bring all nine to 6 before touching underdark at 6. Two rotations, 18 subjects.
// `icewinddale`: legend and location both at 0. Satellite test picks Ten-Towns over the Prophecy
// of the Frostmaiden — ten settlement pages plus the region page against a single prophecy page.
// ---------------------------------------------------------------------------------------
const FR_TT = "forgottenrealms.fandom.com/wiki/Ten_Towns";
const FR_BS = "forgottenrealms.fandom.com/wiki/Bryn_Shander";
const FR_ICE = "forgottenrealms.fandom.com/wiki/Icewind_Dale";

export const TEN_TOWNS: LibrarySubject = {
  id: "ten_towns",
  label: "Ten-Towns",
  category: "location",
  facts: [
    { t: "The Ten Towns were formed around the three lakes of Icewind Dale — Redwaters, Lac Dinneshere, and Maer Dualdon.", p: "landmark", s: ["structure"], src: FR_TT },
    { t: "Northwest of Redwaters, the smallest of the lakes, sat fittingly enough the smallest villages, Dougan's Hole and Good Mead.", p: "landmark", s: ["people"], src: FR_TT },
    { t: "To the north lay Lac Dinneshere, and on its shores stood Easthaven, Caer-Dineval, and Caer-Konig.", p: "landmark", s: ["structure"], src: FR_TT },
    { t: "Some ten miles west was Maer Dualdon, largest and deepest of the three, ringed by Lonelywood with its namesake forest, Bremen, Termalaine, and the walled town of Targos.", p: "landmark", s: ["structure"], src: FR_TT },
    { t: "Between Lac Dinneshere and Maer Dualdon rose the massive solitary peak of Kelvin's Cairn.", p: "landmark", s: [], src: FR_TT },
    { t: "Just south of that mountain lay the Dwarven Valley, a deep chasm that housed a number of dwarf clans.", p: "underground", s: ["people"], src: FR_TT },
    { t: "Southwest of the valley, nestled between all three lakes, sat Bryn Shander, the trading hub and the gateway to the rest of civilization to the south.", p: "trade", s: ["landmark"], src: FR_TT },
    { t: "The council members, called speakers, met in the council building at Bryn Shander — recognized unanimously as the capital of the Ten Towns and of Icewind Dale itself — once a month through the summer and once every three months in winter.", p: "governance", s: ["structure"], src: FR_TT },
    { t: "The Shaengarne river ran west out of the Ten Towns, through the dale's western tundras.", p: "landmark", s: ["nature"], src: FR_TT },
    { t: "The Spine of the World mountains lay along the towns' southern border, and the Reghed Glacier to the east.", p: "landmark", s: ["nature"], src: FR_TT },
    { t: "Bryn Shander was the biggest of the Ten Towns and was known throughout the north as a center of trade.", p: "trade", s: ["people"], src: FR_BS },
    { t: "It was the only one of the Ten Towns not standing on the shore of a lake, sitting instead atop a hill south of Kelvin's Cairn.", p: "structure", s: ["landmark"], src: FR_BS },
    { t: "It was also the last of the ten to be founded: only a single cabin stood on the spot, used as a stopover by those traveling to the other settlements of the dale.", p: "origin", s: ["history"], src: FR_BS },
    { t: "At some point craftsmen began selling scrimshaw outside that cabin, and scrimshanders from the other towns followed their lead.", p: "trade", s: ["origin"], src: FR_BS },
    { t: "The town expanded rapidly, new buildings and trading posts going up in succession — but the traders brought their long-standing rivalries and feuds along from their hometowns, and violence erupted.", p: "conflict", s: ["people"], src: FR_BS },
    { t: "Eventually the folk of Bryn Shander settled their differences, and out of that settlement came the system of representation that held for years afterward.", p: "governance", s: ["legacy"], src: FR_BS },
    { t: "The Eastway connected the town to Easthaven on Lac Dinneshere.", p: "structure", s: ["trade"], src: FR_BS },
    { t: "The Ten Towns were the only permanent settlements in all of Icewind Dale, a confederation of minor places that cooperated with one another, and they drew determined and desperate folk from across the Realms.", p: "people", s: ["governance"], src: FR_ICE },
    { t: "Perhaps the greatest industry of the dale was the fishing of knucklehead trout: many lakeside settlements lived entirely on the trout they caught and the goods they made from its ivory-like bones.", p: "trade", s: ["nature"], src: FR_ICE },
    { t: "The people of Icewind Dale held community, determination and collaborative work to be virtues essential to surviving the frigid north.", p: "character", s: ["people"], src: FR_ICE },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 27 (30 Jul) — NINE-REGION PROGRAM, round A. `barovia`; legend and location both at 0.
// Barovia over the Curse of Strahd on the satellite test — the valley carries the Amber Temple,
// three villages, the Domains of Dread and Strahd himself.
//
// SCOPE, and the same reservation made for Trolls/Trollwars in Batch 11: the CURSE has its own open
// row (legend). The pact is given one fact here because the domain's existence depends on it; the
// love story — Sergei, Tatyana, the murder — is left for that row to carry.
//
// TWO NAME COLLISIONS CAUGHT BEFORE THE BUILD, not by it. `FR_BAR` is already Barbazu, so Barovia
// takes `FR_BRV`. `FR_STR` is already Strahd von Zarovich, so it is REUSED. The widened pre-authoring
// grep from B-50 is what caught both.
// ---------------------------------------------------------------------------------------
const FR_BRV = "forgottenrealms.fandom.com/wiki/Barovia";

export const BAROVIA: LibrarySubject = {
  id: "barovia",
  label: "Barovia",
  category: "location",
  facts: [
    { t: "The valley of Barovia was the oldest and best known of the Domains of Dread.", p: "landmark", s: ["legend", "history"], src: FR_BRV },
    { t: "Originally a place in a forgotten world of the Prime Material plane, the entire valley was carried into the Shadowfell by mists controlled by the entities known as the Dark Powers.", p: "origin", s: ["landmark", "legend"], src: FR_BRV },
    { t: "The realm was a prison for its darklord, the vampire Strahd von Zarovich, and for the whole population of the valley besides.", p: "governance", s: ["threat", "people"], src: FR_BRV },
    { t: "The mists themselves answered to Strahd, who could open or close the boundaries of his domain at will.", p: "power", s: ["governance", "threat"], src: FR_BRV },
    { t: "Almost the whole of the valley was densely forested rough ground, with sheer cliffs and outcroppings; few stretches were easily traveled, and it was always dangerous to leave the road.", p: "landmark", s: ["threat", "nature"], src: FR_BRV },
    { t: "The winters there were long and bitter.", p: "nature", s: ["landmark", "threat"], src: FR_BRV },
    { t: "The sky was permanently overcast with storm clouds, and even at the brightest hour the light was unnaturally muted — dim enough that it did not trouble creatures normally sensitive to it, such as vampires.", p: "nature", s: ["threat", "landmark"], src: FR_BRV },
    { t: "Sometime before the 11th century DR the valley was conquered by Strahd, then still a human general, and his army.", p: "history", s: ["conflict", "origin"], src: FR_BRV },
    { t: "The pact that followed cost Tatyana her life, turned Strahd into a vampire, and shut him inside the realm he had won.", p: "origin", s: ["legend", "history"], src: FR_BRV },
    { t: "It remained the only Domain of Dread for nearly two centuries, until other realms began to join it.", p: "history", s: ["legend", "landmark"], src: FR_BRV },
    { t: "Barovia, Vallaki and Krezk were the three villages standing along the Old Svalich Road.", p: "structure", s: ["people", "landmark"], src: FR_BRV },
    { t: "Oraşnou was a small village at the foot of the mountains, and the mists led there from the Quivering Forest.", p: "structure", s: ["landmark", "people"], src: FR_BRV },
    { t: "The Amber Temple was an ancient temple raised by an order of wizards who were later corrupted by the Dark Powers.", p: "structure", s: ["faith", "history"], src: FR_BRV },
    { t: "It housed vestiges of entities from across the multiverse, and it was there that Strahd forged his original pact with the Dark Powers.", p: "faith", s: ["intrigue", "legend"], src: FR_BRV },
    { t: "Sometime in the late 15th century DR the archmage Mordenkainen became trapped in Barovia; after failing to defeat Strahd or escape the realm he went insane, and lost his spellbook and his staff.", p: "people", s: ["threat", "legend"], src: FR_BRV },
    { t: "In the Year of the Wandering Elfmaid, 1072 DR, the sun elf vampire Jander Sunstar encountered Anna, a fragment of Tatyana's soul who had been trapped in an asylum in Waterdeep for almost a century.", p: "people", s: ["history", "legend"], src: FR_STR },
    { t: "In the Year of the Rose, 1098 DR, Jander was carried to Barovia by the Dark Powers, vowing revenge upon whoever had been responsible for her fate.", p: "legend", s: ["people", "history"], src: FR_STR },
    { t: "There he befriended Strahd, then still an inexperienced vampire, and over more than twenty-five years taught him much of his vampiric skill — including the ability to speak with animals and to command them.", p: "allies", s: ["power", "people"], src: FR_STR },
    { t: "On discovering what Strahd truly was, Jander tried to destroy him and managed only to injure him badly; he then threw himself into the sun to end his misery, and instead of dying was carried to the adjacent domain of Forlorn.", p: "conflict", s: ["legend", "people"], src: FR_STR },
    { t: "In the mid-to-late 14th century DR a pair of Hellriders out of Elturel were taken into Barovia by the Mists while hunting a man who had tried to assassinate their city's ruler, Lord Dhelt.", p: "history", s: ["people", "conflict"], src: FR_STR },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 28 (30 Jul) — NINE-REGION PROGRAM, round A. `chult`; person at 0. Artus Cimber over Ras Nsi
// on the satellite test: he carries the Ring of Winter page, the novel page, and a frost-giant
// storyline that reaches into icewinddale. FR_ROW is REUSED — the Ring of Winter page was already
// declared for that subject back in the inherited corpus.
//
// Interlocks THREE already-sourced subjects: The Ring of Winter (object), Frost Giants (creature),
// and Ten-Towns (Bryn Shander, sourced this session) — the giants raid the wrong town looking for him.
// ---------------------------------------------------------------------------------------
const FR_ART = "forgottenrealms.fandom.com/wiki/Artus_Cimber";
const FR_RWN = "forgottenrealms.fandom.com/wiki/The_Ring_of_Winter_(novel)";

export const ARTUS_CIMBER: LibrarySubject = {
  id: "artus_cimber",
  label: "Artus Cimber",
  category: "person",
  facts: [
    { t: "Artus Cimber was an adventurer and a former Harper who became the keeper of the Ring of Winter.", p: "deeds", s: ["allies", "legend"], src: FR_ART },
    { t: "He was the youngest son of the highwayman known as Shadowhawk.", p: "origin", s: ["people", "legend"], src: FR_ART },
    { t: "Through a long adventuring career he earned many scars across his back and stomach, among them those left by Zhent torturers.", p: "character", s: ["conflict", "people"], src: FR_ART },
    { t: "When he settled in Chult he was gifted a lightweight lush green hooded tunic, well suited to the hot and humid climate of the jungle.", p: "people", s: ["make", "allies"], src: FR_ART },
    { t: "The tunic bore the crest of Theron Silvermace's family — a diving falcon and a silver mace — which clashed badly with the green, and it became his favorite outfit all the same.", p: "make", s: ["allies", "people"], src: FR_ART },
    { t: "Owing to the immortality the Ring of Winter granted him, Artus kept his looks and his charm throughout his life.", p: "power", s: ["legacy", "legend"], src: FR_ART },
    { t: "In 1362 DR he and his trusted companion Pontifax travelled to the Stonelands on an expedition to uncover ancient Mulhorandi treasures in the ruins of a once-grand keep.", p: "deeds", s: ["allies", "legend"], src: FR_ART },
    { t: "There he touched a mysterious statue and found himself bound to a seemingly cursed necklace that he could not take off.", p: "legend", s: ["make", "power"], src: FR_ART },
    { t: "Back home in Suzail, with the help of another old friend named Zintermi, he learned that the amulet held a four-armed guardian phantom called Skuld.", p: "legend", s: ["power", "allies"], src: FR_ART },
    { t: "Pontifax held that this latest misfortune was simply part of the curse that fell upon everyone who sought the Ring of Winter.", p: "legend", s: ["character", "allies"], src: FR_ART },
    { t: "In 1363 DR Artus drew a map detailing his travels through Chult.", p: "deeds", s: ["landmark", "people"], src: FR_ART },
    { t: "He was a member of the Society of Stalwart Adventurers.", p: "allies", s: ["people", "deeds"], src: FR_RWN },
    { t: "He and his ally Hydel Pontifax spent a decade searching for the Ring of Winter before Theron Silvermace, who led the Stalwarts, told them it lay in Chult.", p: "deeds", s: ["allies", "legend"], src: FR_RWN },
    { t: "For centuries adventurers had sought that ring, which was said to make its wearer immortal and to be capable of bringing a second Ice Age down upon the Realms.", p: "legend", s: ["threat", "power"], src: FR_RWN },
    { t: "After the War of the Silver Marches of 1485 DR the frost giant Jarl Storvald sought the ring relentlessly, believing it a way to raise the frost giants in the ordning.", p: "conflict", s: ["threat", "intrigue"], src: FR_ROW },
    { t: "The Zhentarim were hunting it at the same time, and Nilraun Dhaerlost told Storvald that the ring was in Artus Cimber's possession.", p: "intrigue", s: ["conflict", "people"], src: FR_ROW },
    { t: "The giants used a blod stone to find Artus by his blood, but were drawn instead to his son Sirac, in Bryn Shander.", p: "intrigue", s: ["people", "conflict"], src: FR_ROW },
    { t: "Drufi, who led the raiding party, attacked that town with twelve frost giants on the strength of the false lead, and the attack was thwarted by the townsfolk with the help of adventurers.", p: "conflict", s: ["landmark", "people"], src: FR_ROW },
    { t: "After that failure Drufi and her giants went south to the jungles of Chult to look for Artus there, causing considerable confusion among the local rulers.", p: "conflict", s: ["governance", "intrigue"], src: FR_ROW },
    { t: "Around that same time the half-elven sorceress Xandala travelled to Port Nyanzaru, also in search of Cimber.", p: "people", s: ["intrigue", "conflict"], src: FR_ROW },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 29 (30 Jul) — NINE-REGION PROGRAM, round A. `wildspace`; legend at 0, and the Unhuman Wars
// the only open row there — a FORCED pick with no tier-3 decision to make. It turned out deep
// anyway: FR carries a First Unhuman War page, a Second Unhuman War page, and the Scro.
//
// NOTE: `Unhuman_Wars` on the FR wiki is a DISAMBIGUATION page, not an article. It is cited for the
// one framing fact it actually states — that the term covers two wars — and nothing else. A
// disambiguation page is a signpost, and treating it as a source for substance would be the same
// error as B-52 in a different coat.
// ---------------------------------------------------------------------------------------
const FR_UHW = "forgottenrealms.fandom.com/wiki/Unhuman_Wars";
const FR_1UW = "forgottenrealms.fandom.com/wiki/First_Unhuman_War";
const FR_2UW = "forgottenrealms.fandom.com/wiki/Second_Unhuman_War";
const FR_SCR = "forgottenrealms.fandom.com/wiki/Scro";

export const UNHUMAN_WARS: LibrarySubject = {
  id: "unhuman_wars",
  label: "The Unhuman Wars",
  category: "legend",
  facts: [
    { t: "The term Unhuman Wars covers two inter-sphere wars fought between the Elven Imperial Fleet and the goblinoid and other non-human humanoid races.", p: "conflict", s: ["origin"], src: FR_UHW },
    { t: "The First Unhuman War, sometimes called the Great Hunt, spanned multiple crystal spheres between the 10th and 11th centuries DR.", p: "conflict", s: ["history"], src: FR_1UW },
    { t: "It established the elves and their Imperial Fleet as the uncontested dominant power of the known spheres for the next four hundred years.", p: "legacy", s: ["governance"], src: FR_1UW },
    { t: "The fighting was widespread through the Material Plane and reached every known crystal sphere.", p: "conflict", s: ["landmark"], src: FR_1UW },
    { t: "The non-human humanoid races — bugbears, goblins, hobgoblins, kobolds, ogres and orcs, called collectively the unhumans — had a long history of space exploration, flying aboard spelljammers powered by shamans.", p: "people", s: ["nature"], src: FR_1UW },
    { t: "The hadozee became allies of the elves during the war effort, and remained close to them long after it was resolved.", p: "allies", s: ["people"], src: FR_1UW },
    { t: "The first major engagement of the war was the Battle of Kule.", p: "conflict", s: ["history"], src: FR_1UW },
    { t: "Afterward a tribe of exiled orcs reorganized themselves and became the scro, whose hunt for revenge would make them the elves' chief adversaries in the second war.", p: "origin", s: ["legacy"], src: FR_1UW },
    { t: "The few orcs who survived the first war withdrew in their spelljamming vessels to a distant planet, undetected by the elves who had all but annihilated them.", p: "origin", s: ["conflict"], src: FR_SCR },
    { t: "Those survivors were led by an orc named Dukagsh, who became the first Almighty Leader.", p: "people", s: ["governance"], src: FR_SCR },
    { t: "Dukagsh had insight beyond most orcish leaders before him, and understood that defeating the elves would take more than one-dimensional attacks and brute force.", p: "character", s: ["governance"], src: FR_SCR },
    { t: "The scro held all other races to be their enemies, yet did not wish to conquer the groundling races at all — they wanted only to control the whole of wildspace and keep everyone else on their own homeworlds where they belonged.", p: "society", s: ["governance"], src: FR_SCR },
    { t: "They hated every other humanoid race excepting goblinoids and orcs, and the elves they utterly despised.", p: "character", s: ["society"], src: FR_SCR },
    { t: "For all that hatred they would not lower themselves to the level of other races, and showed great control in diplomatic settings with their enemies.", p: "character", s: ["society"], src: FR_SCR },
    { t: "They were not an individualistic people, and put the good of their race above the good of their own persons.", p: "society", s: ["character"], src: FR_SCR },
    { t: "The Second Unhuman War was fought between elves and scro across several crystal spheres in the mid-14th century DR, a direct consequence of the first war four centuries earlier.", p: "conflict", s: ["history"], src: FR_2UW },
    { t: "The primary goal of the scro was to destroy every single elven ship and colony in the Material plane.", p: "threat", s: ["conflict"], src: FR_2UW },
    { t: "Their secondary goal was to supplant the elven fleets as the main military power of wildspace, and grant safe passage to spacefarers only in exchange for taxes.", p: "governance", s: ["trade"], src: FR_2UW },
    { t: "The Elven Imperial Fleet narrowly drove the scro out of every sphere they had invaded after a few years, but at extremely heavy cost — the damage to their ships and communication lines was so extensive that not even the elves knew how much of their own fleet had survived.", p: "conflict", s: ["legacy"], src: FR_2UW },
    { t: "That decimation broke the elves' hegemony over arcane space and opened the way for local forces to control the wildspace of their own spheres, with a period of piracy, raids and smaller wars expected to run for decades before matters settled again.", p: "legacy", s: ["trade"], src: FR_2UW },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 30 (30 Jul) — NINE-REGION PROGRAM, round A. `avernus`; legend at 0 and only one open row —
// a FORCED pick. Third forced row to come in at a full 20. `FR_ZAR` REUSED from the Zariel subject.
//
// The row's ledger descriptor reads "the fall of the angel who became an archdevil", which is what
// the sources actually carry, so the label and the substance agree. Checked before authoring rather
// than assumed — a label that promised something the pages could not support would have been a
// quiet fabrication dressed as a title.
// ---------------------------------------------------------------------------------------
const FR_SOZ = "forgottenrealms.fandom.com/wiki/Sword_of_Zariel";
const FR_YAE = "forgottenrealms.fandom.com/wiki/Yael";
const FR_LUL = "forgottenrealms.fandom.com/wiki/Lulu";

export const DARK_GIFT_OF_ZARIEL: LibrarySubject = {
  id: "dark_gift_of_zariel",
  label: "The Dark Gift of Zariel",
  category: "legend",
  facts: [
    { t: "Zariel, titled Archduchess of Avernus and Lord of the First, was the archdevil ruler of that layer, dedicated to winning the unending Blood War between devils and demons.", p: "governance", s: ["conflict", "power"], src: FR_ZAR },
    { t: "She was originally an angel of the Seven Heavens, before she transformed into an archdevil and fell to the Nine Hells.", p: "origin", s: ["legend", "character"], src: FR_ZAR },
    { t: "She was friends with the hollyphant Lulu before her descent, a friendship that went back centuries.", p: "allies", s: ["character", "people"], src: FR_ZAR },
    { t: "Lulu served as her war mount and travelling companion, and the two inspired sorrow in one another — Lulu for what Zariel had become, and Zariel for the friendship she had lost.", p: "allies", s: ["character", "people"], src: FR_ZAR },
    { t: "Other reminders of her past were more morbid: the mortal knight Haruman, a heartless crusader even before his descent, was transformed into a hell knight of undying loyalty to her.", p: "people", s: ["threat", "character"], src: FR_ZAR },
    { t: "The death knight Olanthius took his own life as a result of Zariel's corruption, and was brought back to serve her while supernaturally bound.", p: "people", s: ["threat", "character"], src: FR_ZAR },
    { t: "Though Olanthius hated her, he partly blamed himself for not seeing the warning signs that led to her fall — and Zariel felt guilt for having left her loyal friend to so horrible a fate.", p: "character", s: ["legacy", "people"], src: FR_ZAR },
    { t: "In the Year of the Bow, 1354 DR, the rogue angel Zariel enlisted the aid of the Hellriders of Elturel to mount an assault on Avernus itself, meaning to end the Blood War.", p: "conflict", s: ["history", "people"], src: FR_YAE },
    { t: "Yael was one of the three Hellrider generals who rode in that assault, alongside Olanthius and Haruman.", p: "people", s: ["conflict", "allies"], src: FR_YAE },
    { t: "When it became clear the Hellriders had lost the day in a most disastrous fashion, Zariel instead swore her fealty to Asmodeus, in exchange for infernal legions with which to prosecute the Blood War.", p: "intrigue", s: ["governance", "conflict"], src: FR_YAE },
    { t: "Witnessing that betrayal, Yael and Lulu stole the Sword of Zariel and fled, hoping that one day it might redeem the fallen angel.", p: "deeds", s: ["allies", "intrigue"], src: FR_YAE },
    { t: "Yael himself became trapped in Avernus after the failed invasion.", p: "legacy", s: ["conflict", "people"], src: FR_YAE },
    { t: "Lulu was a hollyphant who served for centuries as war mount and friend to Zariel while she was still an angel.", p: "allies", s: ["people", "character"], src: FR_LUL },
    { t: "In her normal form she looked like a miniature elephant with golden fur and rapidly beating wings.", p: "nature", s: ["people", "character"], src: FR_LUL },
    { t: "She was extremely gentle and caring and believed in the power of friendship above all things, yet she could not abide seeing an act of evil done in her presence without retaliating.", p: "character", s: ["allies", "people"], src: FR_LUL },
    { t: "When Zariel was injured and facing defeat, she ordered Lulu and Yael to hide her sword so that it would not fall into enemy hands.", p: "deeds", s: ["intrigue", "allies"], src: FR_LUL },
    { t: "Faced with a horde of demons under Yeenoghu, the two of them enshrined the sword in a fortress of pure positive energy known as the Bleeding Citadel.", p: "structure", s: ["power", "conflict"], src: FR_LUL },
    { t: "The effort left Lulu disoriented, and she flew away and roamed Avernus for months; then she met the rakshasa Mahadi, who sprinkled water from the river Styx across her face, costing her her memories and many of her abilities, and handed her to Zariel as a gift.", p: "intrigue", s: ["power", "people"], src: FR_LUL },
    { t: "Zariel, unwilling to harm her former friend, had her sent back to Faerûn unharmed.", p: "character", s: ["allies", "people"], src: FR_LUL },
    { t: "The sword itself had belonged to her when she was still an angel of Celestia, before ever she descended into the Nine Hells.", p: "origin", s: ["make", "history"], src: FR_SOZ },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 31 (30 Jul) — NINE-REGION PROGRAM, round A. `baldursgate`; person at 0. Mizora over Ulder
// Ravengard on the satellite test — she carries the Cambion page, the Wyll Ravengard page and
// Zariel, where Ulder carries mainly himself. `FR_ZAR` REUSED.
//
// Interlocks four sourced subjects: Zariel and Avernus (the mistress and the layer), Devils of the
// Hells (what a cambion is), and the Dead Three (Baldur's Gate as the prize both were playing for).
// ---------------------------------------------------------------------------------------
const FR_MIZ = "forgottenrealms.fandom.com/wiki/Mizora";
const FR_CAM = "forgottenrealms.fandom.com/wiki/Cambion";
const FR_WYL = "forgottenrealms.fandom.com/wiki/Wyll_Ravengard";

export const MIZORA: LibrarySubject = {
  id: "mizora",
  label: "Mizora",
  category: "person",
  facts: [
    { t: "Mizora was a cambion of the Nine Hells who remained active in the Realms through the late 15th century DR.", p: "nature", s: ["origin", "power"], src: FR_MIZ },
    { t: "Like many another half-devil she was a cunning and manipulative creature.", p: "character", s: ["nature", "intrigue"], src: FR_MIZ },
    { t: "Haughty and smug, she seemed to take great pleasure in exerting control over others.", p: "character", s: ["power", "people"], src: FR_MIZ },
    { t: "She was a shrewd negotiator, and especially fond of offering gifts that came with terrible strings attached.", p: "character", s: ["trade", "intrigue"], src: FR_MIZ },
    { t: "In 1485 DR she received a demand from her mistress Zariel: prevent Tiamat's cultists from manifesting the dragon queen upon Baldur's Gate, because Zariel had her own plans for that city.", p: "intrigue", s: ["governance", "allies"], src: FR_MIZ },
    { t: "She approached Wyll Ravengard, son of the Grand Duke Ulder Ravengard, and convinced him that he needed her power to stop the cultists and save the city.", p: "intrigue", s: ["people", "character"], src: FR_MIZ },
    { t: "Wyll agreed to a warlock pact, and the price was his soul.", p: "deeds", s: ["trade", "people"], src: FR_MIZ },
    { t: "He fought the cultists and successfully stopped the ritual of summoning.", p: "conflict", s: ["deeds", "people"], src: FR_MIZ },
    { t: "In the years that followed she regularly commanded Wyll to slaughter other devils who interfered with her schemes.", p: "governance", s: ["threat", "intrigue"], src: FR_MIZ },
    { t: "She would reward him when a demand was fulfilled, and punish him when he did not obey the terms of the contract.", p: "governance", s: ["trade", "character"], src: FR_MIZ },
    { t: "In 1492 DR she learned of Karlach's plan to flee the Hells, and seeing a chance both to gain favor with Zariel and to dispose of a perceived rival, sent Wyll into Avernus to hunt her down.", p: "intrigue", s: ["allies", "governance"], src: FR_MIZ },
    { t: "A cambion was generally reckoned to be any humanoid creature that was half-fiend.", p: "nature", s: ["origin", "people"], src: FR_CAM },
    { t: "Mizora belonged to Zariel's inner circle, was powerful enough to stand as a warlock patron, and specialized in infernal contracts.", p: "power", s: ["allies", "intrigue"], src: FR_CAM },
    { t: "Cambions were loners by nature, and liked to lose themselves in the crowds of large cities — especially in places where people did not ask questions.", p: "behavior", s: ["people", "character"], src: FR_CAM },
    { t: "Zariel had a penchant for spawning cambions to serve as leaders for her followers.", p: "origin", s: ["allies", "governance"], src: FR_ZAR },
    { t: "Her cults were often headed by her own cambions.", p: "governance", s: ["faith", "allies"], src: FR_ZAR },
    { t: "Those drawn to the cults of Zariel were people who wished to fight but lacked the experience, training, skill, talent or bravery to do it — all of which her agents could offer them.", p: "faith", s: ["people", "character"], src: FR_ZAR },
    { t: "Ordinary cultists showed a greater ferocity than they otherwise would have, and cult leaders gained a keen tactical eye.", p: "faith", s: ["conflict", "power"], src: FR_ZAR },
    { t: "When Wyll was seventeen, ten days after his father had left for Elturel, he heard a whisper in his sleep demanding that he go alone to Dusthawk Hill — and there he found the Dragon Cultists at their work.", p: "legend", s: ["people", "intrigue"], src: FR_WYL },
    { t: "In that battle Wyll's right eye was damaged, and Mizora granted him a sending stone in its place; and when Ulder Ravengard returned from Elturel he found no witness and no evidence of any cult, only a smirking devil standing beside his son.", p: "make", s: ["people", "character"], src: FR_WYL },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 32 (30 Jul) — NINE-REGION PROGRAM, round A. `dessarin`; creature at 0 and one open row —
// FORCED, and the fourth forced row to reach a full 20. Dessarin's second 20 in a row, which further
// supports the Batch 24 revision: thinness is a property of SUBJECTS, not regions. A row about four
// primordial princes has four pages behind it; a row about one waystop town has one.
// ---------------------------------------------------------------------------------------
const FR_ARM = "forgottenrealms.fandom.com/wiki/Archomental";
const FR_IMX = "forgottenrealms.fandom.com/wiki/Imix";
const FR_OLH = "forgottenrealms.fandom.com/wiki/Olhydra";
const FR_YCB = "forgottenrealms.fandom.com/wiki/Yan-C-Bin";

export const ELEMENTALS_FOUR_TEMPLES: LibrarySubject = {
  id: "elementals_four_temples",
  label: "Elementals of the Four Temples",
  category: "creature",
  facts: [
    { t: "Archomentals, also called Elemental Princes, were powerful beings of the Elemental Planes and rulers over the elementals.", p: "nature", s: ["governance", "power"], src: FR_ARM },
    { t: "There was usually one good archomental and one evil archomental to each plane.", p: "nature", s: ["origin", "governance"], src: FR_ARM },
    { t: "In the Age Before Ages it was said that many of the Elemental Princes joined the great war between Law and Chaos.", p: "conflict", s: ["legend", "allies"], src: FR_ARM },
    { t: "Chan, Ben-hadar, Sunnis and Bristia Pel decided as one to join the Wind Dukes of Aaqa, who fought for Law and welcomed them eagerly as allies.", p: "allies", s: ["conflict", "legend"], src: FR_ARM },
    { t: "Chan was dismayed to find that Yan-C-Bin also fought on the side of Law, and left the fighting on account of it.", p: "character", s: ["allies", "conflict"], src: FR_ARM },
    { t: "In the 15th century DR several archomental-worshiping cults became active across Faerûn.", p: "faith", s: ["history", "people"], src: FR_ARM },
    { t: "Imix was the evil archomental of fire, a primordial older than the world itself.", p: "nature", s: ["origin", "power"], src: FR_IMX },
    { t: "His many titles included the Prince of Elemental Evil, the All-Consuming Fire, and the Eternal Flame.", p: "legend", s: ["faith", "character"], src: FR_IMX },
    { t: "He was passionate, quick to anger, vain, paranoid and prone to jealousy, with a seemingly endless supply of energy spent on schemes that were always to the detriment of others.", p: "character", s: ["threat", "power"], src: FR_IMX },
    { t: "He was a masterful tactician and very creative, but his overconfidence and haughtiness made him rush into things, and he became frustrated easily when matters did not go to his plan.", p: "character", s: ["conflict", "power"], src: FR_IMX },
    { t: "He destroyed any who refused to acquiesce to him.", p: "threat", s: ["character", "power"], src: FR_IMX },
    { t: "The unique dagger Tinderstrike was imbued with a portion of Imix's own power.", p: "make", s: ["power", "legend"], src: FR_IMX },
    { t: "Olhydra, the Princess of Evil Water, appeared in her natural state as a huge cresting wave with two eyes like great pearls, or else as a shapeless watery mass some twenty feet across.", p: "nature", s: ["landmark", "power"], src: FR_OLH },
    { t: "In the Plane of Water she dwelt in the ruins of a great undersea stronghold of black coral — the former capital of a world-spanning empire that she herself had long ago destroyed.", p: "structure", s: ["history", "landmark"], src: FR_OLH },
    { t: "Of all the Princes of Elemental Evil she was the one most interested in mortals, and counted pirates and seafaring raiders among her agents whether they knew it or not, because they reddened the water with blood and now and then dropped treasure into her clutches.", p: "people", s: ["trade", "character"], src: FR_OLH },
    { t: "She would sometimes spare the very worst of them, knowing that they would deliver others to her in time.", p: "intrigue", s: ["people", "character"], src: FR_OLH },
    { t: "Yan-C-Bin, the Prince of Evil Air, commonly appeared to his followers as a tall, thin, elderly humanoid with long hair flowing in the wind, though his true form was more akin to a tornado.", p: "nature", s: ["people", "faith"], src: FR_YCB },
    { t: "During the Dawn War he learned of the existence of the Elder Elemental Eye, and convinced other primordials — Olhydra and Imix among them — to join forces and serve that power in the hope of conquering the world.", p: "intrigue", s: ["faith", "legend"], src: FR_YCB },
    { t: "After the Dawn War the gods sealed Yan-C-Bin inside a mobile palace made of solidified air.", p: "legend", s: ["power", "conflict"], src: FR_YCB },
    { t: "He and those who served him strongly disliked Ogrémoch and his servants, but his greatest rival was the good Princess of Air, Chan, against whom he waged a secret war of information and sabotage.", p: "conflict", s: ["intrigue", "character"], src: FR_YCB },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 33 (30 Jul) — NINE-REGION PROGRAM, round A. `feywild`; object at 0 with one open row.
//
// THE THINNEST SUBJECT IN THE CORPUS — 13 facts, and honestly so. The FR wiki carries NO article on
// these relics as a group: the witchlight vane and watch appear only as list entries, and the Crown
// of the Witchlight Monarch exists only on non-FR wikis and as published rules text. What IS sourced
// is the carnival's wonders — its rides, games and stalls — which the ledger descriptor explicitly
// covers ("the strange wonders of the traveling fey fair"), so label and substance still agree.
//
// ALL THREE SOURCES REUSED (FR_WC, FR_WBW, FR_IGG); no new constants were needed, which is itself a
// signal — a row whose sources are entirely already-declared is a row with no new ground under it.
// A replacement is PROPOSED to Frank in FINDINGS: Iggwilv's Cauldron is a real object with real lore
// and would make a stronger feywild object row. Not applied — swapping a row is his call.
// ---------------------------------------------------------------------------------------
export const WITCHLIGHT_RELICS: LibrarySubject = {
  id: "witchlight_relics",
  label: "The Witchlight Carnival relics",
  category: "object",
  facts: [
    { t: "Mister Light dubbed the Witchlight Monarchs with his Witchlight vane.", p: "make", s: ["people"], src: FR_WC },
    { t: "Mister Witch kept the carnival's time with his Witchlight watch.", p: "make", s: ["people"], src: FR_WC },
    { t: "The Big Top was the great tent that served as venue for the midnight celebration and for the crowning of the Witchlight Monarch.", p: "structure", s: ["landmark"], src: FR_WC },
    { t: "The Carousel was a carnival ride of eight speaking wooden unicorns.", p: "make", s: ["landmark"], src: FR_WC },
    { t: "Giant dragonflies rested upon giant lily pads and offered rides to those who came.", p: "nature", s: ["landmark"], src: FR_WC },
    { t: "The Mystery Mine was a magic-powered ride in which a mine cart was propelled into the open mouth of a dragon and on into an abandoned mine.", p: "make", s: ["structure"], src: FR_WC },
    { t: "The Pixie Kingdom was a grove of oak trees within which dwelt a community of about a dozen pixies, and their hamster companion.", p: "structure", s: ["people"], src: FR_WC },
    { t: "Silversong Lake was a shimmering water, home to quippers and to the mermaid Palasha.", p: "landmark", s: ["nature"], src: FR_WC },
    { t: "Catch the Dragon by the Tail was a game that involved blindfolding the guests and a red faerie dragon.", p: "people", s: ["legend"], src: FR_WC },
    { t: "Food stalls sold cupcakes, candied apples, cookies, tarts and other confectioneries.", p: "trade", s: ["people"], src: FR_WC },
    { t: "Among the magic that came out of that domain were pixie dust, a talking doll, scissors of shadow snipping, a wand of smiles and a wand of scowls, a bobbing lily pad, a pole of collapsing, an orb of direction, and a cloak of many fashions.", p: "make", s: ["trade"], src: FR_WBW },
    { t: "Iggwilv's Cauldron was among them too.", p: "make", s: ["legend"], src: FR_WBW },
    { t: "It was that cauldron's magic the Hourglass Coven turned against its owner, freezing the Witch Queen in time along with many another inhabitant of her palace.", p: "power", s: ["legend"], src: FR_IGG },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 34 (30 Jul) — NINE-REGION PROGRAM, round A COMPLETE. `swordcoast`; person, creature and
// object all at 0. King Hekaton over Dragons of the North and the Trade Bars on the satellite test —
// he carries Serissa, Nym, Uthor, Iymrith and Maelstrom.
//
// FIRST SUBJECT AUTHORED UNDER B-53. The tag vocabulary is deliberately NARROW: eight tags across
// twenty facts (governance, people, character, allies, conflict, legend, structure, intrigue),
// against the sixteen and seventeen my recent batches had drifted to. Every tag is still true of the
// fact it sits on; the discipline is to reach for a tag a sibling already uses before inventing a
// more precise one. Predicted effect: chain count in the thousands rather than the low hundreds.
// ---------------------------------------------------------------------------------------
const FR_HEK = "forgottenrealms.fandom.com/wiki/Hekaton";
const FR_SER = "forgottenrealms.fandom.com/wiki/Serissa";
const FR_NYM = "forgottenrealms.fandom.com/wiki/Nym_(storm_giant)";
const FR_IYM = "forgottenrealms.fandom.com/wiki/Iymrith";
const FR_MAE = "forgottenrealms.fandom.com/wiki/Maelstrom_(fortress)";

export const KING_HEKATON: LibrarySubject = {
  id: "king_hekaton",
  label: "King Hekaton",
  category: "person",
  facts: [
    { t: "Hekaton, called the Storm King, was ruler of the storm giants and in truth of all giantkind, until sometime after the War of the Silver Marches in the late 15th century DR.", p: "governance", s: ["people"], src: FR_HEK },
    { t: "He ruled the storm giants directly, but asserted his authority over every race of giants.", p: "governance", s: ["character"], src: FR_HEK },
    { t: "Beyond his wife Neri he trusted only his youngest daughter, Princess Serissa, and his younger brother, Imperator Uthor.", p: "allies", s: ["character"], src: FR_HEK },
    { t: "Along with his own daughters he raised the young storm giant Thellan as his ward.", p: "people", s: ["allies"], src: FR_HEK },
    { t: "On Tarsakh 17 in the Year of the Sheltered Viper, 1401 DR, Hekaton and Uthor were sailing home to Maelstrom from a diplomatic meeting when three leviathans attacked their ship.", p: "conflict", s: ["people"], src: FR_HEK },
    { t: "In that battle he channeled the power of the Wyrmskull Throne through his vessel and summoned a spectral blue dragon to turn the gargantuan elementals away.", p: "conflict", s: ["legend"], src: FR_HEK },
    { t: "At some point in the late 15th century DR the gods of the giants stopped answering Hekaton's prayers, and the king came to believe that storm giants no longer deserved their place at the top of the ordning.", p: "legend", s: ["governance"], src: FR_HEK },
    { t: "As his glorious reign came to its end he suffered great indignities: the Storm King was slain, transformed into an undead monstrosity, and tortured in the Nine Hells, before finding peace at last in the afterlife of Stormhold.", p: "legend", s: ["conflict"], src: FR_HEK },
    { t: "Maelstrom was ruled by King Hekaton until his disappearance in the late 1480s or early 1490s DR.", p: "structure", s: ["governance"], src: FR_MAE },
    { t: "After that disappearance his daughter Serissa was left in charge of the fortress.", p: "structure", s: ["governance"], src: FR_MAE },
    { t: "Serissa was his youngest daughter at the time of the shattering of the ordning, and like her mother Neri she liked the small folk.", p: "people", s: ["character"], src: FR_SER },
    { t: "When Neri was found dead, Uthor came to Serissa and asked her to calm her father's rage; for succeeding at it, Hekaton named her his heir.", p: "intrigue", s: ["allies"], src: FR_SER },
    { t: "After her father's disappearance she reluctantly ascended the Wyrmskull Throne as regent, and ruled with the aid of several advisors.", p: "governance", s: ["structure"], src: FR_SER },
    { t: "Above all things she feared a civil war among the giant races, which had the potential to restart the old war against the dragons.", p: "character", s: ["conflict"], src: FR_SER },
    { t: "She knew well the envy of her older sisters, but considered them harmless.", p: "character", s: ["intrigue"], src: FR_SER },
    { t: "Nym, the middle daughter, made alliance with her elder sister Mirran, who shared her hatred of the family, and the two of them plotted against Neri and Hekaton.", p: "intrigue", s: ["people"], src: FR_NYM },
    { t: "They did not act until the blue dragon Iymrith appeared before them disguised as a storm giant, and quickly made herself a mother figure to the two sisters.", p: "intrigue", s: ["legend"], src: FR_NYM },
    { t: "Iymrith aided them in the assassination of Neri and in the kidnapping of Hekaton.", p: "intrigue", s: ["conflict"], src: FR_NYM },
    { t: "She then became advisor to the newly appointed Serissa while still helping Mirran and Nym plot against her, meaning to start a fresh war between giants and small folk by laying the blame for Neri's death upon the Lords' Alliance.", p: "intrigue", s: ["governance"], src: FR_IYM },
    { t: "With her Kraken Society allies, who acted by permission of the ancient patron Slarkrethel, Iymrith orchestrated Hekaton's abduction aboard the Morkorth in the Trackless Sea, to be sure she had a failsafe should her plan be thwarted.", p: "intrigue", s: ["allies"], src: FR_IYM },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 35 (30 Jul) — ROUND B begins. `barovia`; legend at 0 and one open row — FORCED, and it is
// the row deliberately protected back in Batch 27, when Barovia the LOCATION was given only one
// fact about the pact so that this subject would still have a story to tell. That reservation is
// now discharged, and the two divide cleanly: the valley there, the curse here.
//
// 17 facts — the honest count. Tagged to the B-54 standard: 8-tag core, 3 tags per fact.
// `FR_STR` REUSED.
// ---------------------------------------------------------------------------------------
const FR_TAT = "forgottenrealms.fandom.com/wiki/Tatyana";

export const CURSE_OF_STRAHD: LibrarySubject = {
  id: "curse_of_strahd",
  label: "The Curse of Strahd",
  category: "legend",
  facts: [
    { t: "In his youth Strahd was a prince and a conqueror.", p: "origin", s: ["character", "people"], src: FR_STR },
    { t: "After settling in the freshly conquered valley of Barovia, and beginning to feel the weight of middle age, sometime before the 11th century DR he forged a pact with the Dark Powers of the Shadowfell to gain immortality.", p: "origin", s: ["faith", "history"], src: FR_STR },
    { t: "The pact sealed, Strahd chased Tatyana through his gardens in an effort to force her to love him.", p: "character", s: ["threat", "landmark"], src: FR_STR },
    { t: "He drove her at the last to fling herself from a cliff to escape him, and so caused her death.", p: "threat", s: ["landmark", "legend"], src: FR_STR },
    { t: "Strahd tried to end it all himself, and remained alive regardless — undead, and a vampire.", p: "legend", s: ["nature", "character"], src: FR_STR },
    { t: "The entire valley was swept into the Shadowfell and made a prison from which he could never escape.", p: "governance", s: ["structure", "origin"], src: FR_STR },
    { t: "Tatyana was a young Barovian woman, extraordinarily beautiful, with auburn hair.", p: "people", s: ["character", "nature"], src: FR_TAT },
    { t: "She was a peasant woman originally, out of the village of Barovia.", p: "people", s: ["origin", "structure"], src: FR_TAT },
    { t: "She was in love with Sergei, Strahd's brother, and engaged to marry him.", p: "allies", s: ["people", "conflict"], src: FR_TAT },
    { t: "Strahd fell madly in love with her immediately upon seeing her.", p: "character", s: ["intrigue", "legend"], src: FR_TAT },
    { t: "His pride kept him from voicing those feelings at all, until the day of their wedding.", p: "character", s: ["conflict", "intrigue"], src: FR_TAT },
    { t: "On that day he killed his brother and drank his blood, as part of the deal with the Dark Powers that was to make Tatyana his bride.", p: "faith", s: ["conflict", "threat"], src: FR_TAT },
    { t: "Horrified by what Strahd had done, Tatyana threw herself from the cliff overlooking the valley below Castle Ravenloft.", p: "threat", s: ["structure", "people"], src: FR_TAT },
    { t: "As part of that same deal Strahd was not permitted to die, and rose again as a vampire after the castle's own guards shot him down.", p: "legend", s: ["faith", "nature"], src: FR_TAT },
    { t: "Tatyana's soul became trapped in the newly formed Domain of Dread of Barovia, doomed to reincarnate again and again.", p: "legend", s: ["people", "history"], src: FR_TAT },
    { t: "It was his unrequited obsession that drove him to seal the pact at all — turning him into a vampire and plunging the whole valley into the Domains of Dread.", p: "faith", s: ["character", "governance"], src: FR_TAT },
    { t: "In the late 15th century DR Tatyana returned once again, reincarnated as Ireena Kolyana.", p: "legend", s: ["people", "history"], src: FR_TAT },
    { t: "Madam Eva, born Katarina, was a fortune teller half-Vistani and half-von Zarovich — Strahd's own half-sister, and reticent to share the fact — who traded away her youth to the goddess Mother Night in order to destroy the evil Strahd had brought.", p: "people", s: ["faith", "intrigue"], src: FR_BRV },
    { t: "Baba Lysaga had been nursemaid to the infant Strahd, and grew into a powerful magic user who believed herself to be his true mother.", p: "people", s: ["origin", "character"], src: FR_BRV },
    { t: "Strahd kept vampire brides about him — Anastrasya Karelova, Volenta Popofsky and Ludmilla Vilisevic — and among his spawn a consort named Escher.", p: "people", s: ["character", "threat"], src: FR_BRV },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 36 (30 Jul) — ROUND B. `icewinddale`; legend at 0 with one open row — FORCED. The ledger
// descriptor reads "Auril's long night over the Dale", which is the Everlasting Rime, so label and
// substance agree (the Zariel check, Batch 30). `FR_GRM` REUSED from the Codicil of White.
//
// COPYRIGHT NOTE: the Auril page carries a hymn in verse. None of it is reproduced, in whole or in
// part — verse is exactly the thing the Library never copies, and paraphrasing a poem line-by-line
// would be the same act with extra steps. Nothing from it appears below.
//
// Tagged per B-55: 14 distinct tags across 20 facts, 3 tags each, then measured.
// ---------------------------------------------------------------------------------------
const FR_ELR = "forgottenrealms.fandom.com/wiki/Everlasting_Rime";
const FR_AUR = "forgottenrealms.fandom.com/wiki/Auril";
const FR_FDR = "forgottenrealms.fandom.com/wiki/Frost_druid";

export const PROPHECY_FROSTMAIDEN: LibrarySubject = {
  id: "prophecy_frostmaiden",
  label: "The Prophecy of the Frostmaiden",
  category: "legend",
  facts: [
    { t: "The Everlasting Rime was an unceasing winter of dark skies, freezing winds and heavy snows that lay over Icewind Dale for more than two years.", p: "nature", s: ["landmark", "threat"], src: FR_ELR },
    { t: "The sun never rose above the horizon, and the whole region was held in a permanent twilight.", p: "nature", s: ["legend", "landmark"], src: FR_ELR },
    { t: "Blizzards made the Sea of Moving Ice and the passes through the Spine of the World extremely treacherous, though never quite impassable.", p: "threat", s: ["landmark", "structure"], src: FR_ELR },
    { t: "The weather was the work of Auril the Frostmaiden, the goddess of winter.", p: "faith", s: ["power", "nature"], src: FR_ELR },
    { t: "Each midnight Auril travelled across the sky astride her white roc, trailing an aurora behind her, casting the spells that kept the sun at bay and conjuring the storms that wracked the region.", p: "faith", s: ["legend", "power"], src: FR_ELR },
    { t: "The effects were confined to Icewind Dale and the Sea of Moving Ice, and were harshest along their borders, which made passage into or out of either place extremely dangerous.", p: "landmark", s: ["threat", "governance"], src: FR_ELR },
    { t: "It was the folk of Icewind Dale themselves who named her work the Everlasting Rime.", p: "people", s: ["legend", "landmark"], src: FR_ELR },
    { t: "Trapped in that magical weather the dale grew steadily more dangerous, and the folk of Ten-Towns steadily more desperate.", p: "people", s: ["threat", "history"], src: FR_ELR },
    { t: "Auril, called Saukuruk by her few worshipers among the Iulutiuns of the Great Glacier, was the neutral evil goddess of winter and cold in the Faerûnian pantheon.", p: "faith", s: ["origin", "people"], src: FR_AUR },
    { t: "She was the embodiment of winter's cruelty, and of all its deadliest aspects.", p: "character", s: ["faith", "threat"], src: FR_AUR },
    { t: "Lady Frostkiss had a heart of ice to match her lethally cold beauty, eternally preserved beneath a sheet of rime.", p: "character", s: ["nature", "legend"], src: FR_AUR },
    { t: "In the Year of Holy Thunder, 1450 DR, Auril intervened in Calimshan's Second Era of Skyfire, freezing over the Skyfire Wastes and sending her followers to fight both Calim's genies and Memnon's efreeti.", p: "history", s: ["conflict", "power"], src: FR_AUR },
    { t: "In the Year of the Iron Dwarf's Vengeance, 1485 DR, her Chosen Hedrun Arnsfirth began her war in Icewind Dale.", p: "history", s: ["conflict", "people"], src: FR_AUR },
    { t: "In the late 15th century DR Auril encroached upon Umberlee's domain by freezing her chaotic tides.", p: "conflict", s: ["power", "governance"], src: FR_AUR },
    { t: "Casting such great magic night after night, while also granting spells to her devoted followers, left Auril in a weakened state.", p: "power", s: ["faith", "character"], src: FR_AUR },
    { t: "Auril hid herself away within Grimskalle while her form walked Toril during the Everlasting Rime, around the Year of the Warrior Princess, 1489 DR.", p: "structure", s: ["faith", "history"], src: FR_GRM },
    { t: "Were that form on the Prime Material plane destroyed, the fortress was believed to collapse in upon itself.", p: "structure", s: ["power", "legend"], src: FR_GRM },
    { t: "A frost druid named Ravisin tried to set awakened creatures — a white moose and a plesiosaurus among them — against Lonelywood and Bremen, in revenge for the death of her sister Vurnis at the hands of local hunters.", p: "people", s: ["conflict", "nature"], src: FR_FDR },
    { t: "Some months before the Rime ended in 1489 DR, the spirit of a frost druid took over the body of a sailor named Sephek Kaltro.", p: "intrigue", s: ["threat", "people"], src: FR_FDR },
    { t: "That spirit used Kaltro as a vessel to murder anyone in Ten-Towns who tried to escape the lottery of sacrifice to Auril.", p: "intrigue", s: ["threat", "faith"], src: FR_FDR },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 37 (30 Jul) — ROUND B. `avernus`; all five categories level at 1, so tier 2 gave no signal
// and the satellite test decided: Elturel carries the Companion, Thavius Kreeg, Elturgard and the
// Order of the Companion, against Bel (one page) and the Infernal Contracts (rules text).
//
// Reaches FOUR sourced subjects and one still-open row: Zariel and Avernus (her plot, her layer),
// the Dead Three (Duke Vanthampur sheltering the traitor), Infernal War Machines (the infernal iron
// chains that bound the city), and `baldursgate`'s open Shield of the Hidden Lord row.
// ---------------------------------------------------------------------------------------
const FR_ELT = "forgottenrealms.fandom.com/wiki/Elturel";
const FR_CMP = "forgottenrealms.fandom.com/wiki/The_Companion";
const FR_TKR = "forgottenrealms.fandom.com/wiki/Thavius_Kreeg";

export const ELTUREL: LibrarySubject = {
  id: "elturel",
  label: "Elturel",
  category: "location",
  facts: [
    { t: "Elturel was a city-state lying on the River Chionthar in the Western Heartlands.", p: "landmark", s: ["structure", "origin"], src: FR_ELT },
    { t: "In the mid-14th century DR it was a center of agriculture and trade for the region, and renowned for its elite mounted defenders, the Hellriders.", p: "trade", s: ["people", "conflict"], src: FR_ELT },
    { t: "By the late 15th century DR it was the capital of Elturgard, a theocracy of Torm the True, defended by the paladin knighthood called the Order of the Companion.", p: "faith", s: ["governance", "people"], src: FR_ELT },
    { t: "In the Year of Three Ships Sailing, 1492 DR, Thavius Kreeg spent some months coaxing Grand Duke Ulder Ravengard of Baldur's Gate to come to Elturel and settle disputes that had long troubled the two cities.", p: "intrigue", s: ["people", "governance"], src: FR_ELT },
    { t: "Having greeted the Baldurian delegation, Kreeg escaped the city in secret.", p: "intrigue", s: ["people", "threat"], src: FR_ELT },
    { t: "Shortly after, the Companion changed into a black orb that tore the whole of Elturel and its populace out of the Material Plane and carried it away to Avernus, leaving nothing behind but a crater.", p: "legend", s: ["threat", "landmark"], src: FR_ELT },
    { t: "Fifty years earlier, to rid Elturel of vampires, Kreeg had struck a bargain — not with the god Torm, but with the archdevil Zariel.", p: "intrigue", s: ["faith", "history"], src: FR_ELT },
    { t: "She provided the Companion, in truth an infernal device powered by an imprisoned planetar, at the price of the whole city and its oathbound defenders, to be claimed after fifty years.", p: "make", s: ["power", "faith"], src: FR_ELT },
    { t: "Her intent was that they should serve as her army in the waging of the Blood War.", p: "conflict", s: ["power", "governance"], src: FR_ELT },
    { t: "The Companion, also called Amaunator's Gift, was a magical second sun that hung over Elturel through the latter half of the 15th century DR.", p: "make", s: ["landmark", "faith"], src: FR_CMP },
    { t: "It was the symbol of the realm and of its defenders both.", p: "faith", s: ["people", "structure"], src: FR_CMP },
    { t: "It was in fact the Solar Insidiator, a device Zariel had made as part of a plot to trap the city and steal it away to the Nine Hells.", p: "make", s: ["intrigue", "power"], src: FR_CMP },
    { t: "It was named the Companion because it was widely seen as a companion to the true sun, and to the people themselves.", p: "people", s: ["legend", "landmark"], src: FR_CMP },
    { t: "Only the High Observer of Elturgard knew whether it was truly a blessing of Amaunator or of some other power.", p: "faith", s: ["intrigue", "governance"], src: FR_CMP },
    { t: "After the descent the black orb cast a baleful light over the besieged city, and now and again hurled lightning down into the streets.", p: "threat", s: ["landmark", "power"], src: FR_CMP },
    { t: "The corrupted priest Gideon Lightward used the Companion's necromantic energy to raise undead minions of his own.", p: "threat", s: ["power", "people"], src: FR_CMP },
    { t: "In the end the Companion was either destroyed or opened by adventurers who travelled to Avernus, and the planetar within was freed to lift Elturel out of its infernal bindings and carry it home to the Material Plane.", p: "legend", s: ["power", "structure"], src: FR_CMP },
    { t: "Thavius Kreeg was a human priest of Torm and the ruler of Elturel and of Elturgard, holding the title of High Observer and later High Overseer.", p: "governance", s: ["faith", "people"], src: FR_TKR },
    { t: "Once hailed as a hero for saving Elturel, he had in truth betrayed it to his real mistress, the archdevil Zariel.", p: "intrigue", s: ["legend", "faith"], src: FR_TKR },
    { t: "Hidden among the first of the Elturian refugees he made his way to Baldur's Gate, where Duke Thalamra Vanthampur gave him a hideout in her villa's dungeon; there he studied the Shield of the Hidden Lord, in which the devil Gargauth was imprisoned, and the two schemed to release Gargauth so that he might help them take that city and have it suffer Elturel's fate.", p: "intrigue", s: ["conflict", "structure"], src: FR_TKR },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 38 (30 Jul) — ROUND B. `baldursgate`; all five categories at 1, so the satellite test
// decided: the Shield carries Gargauth (a former archdevil with a full page of his own), the
// Knights of the Shield, and Zariel, against Ulder Ravengard and the Outer City.
//
// CLOSES THE THREAD OPENED ONE BATCH AGO. Elturel's final fact left Thavius Kreeg in Vanthampur's
// dungeon studying this artifact. That was interlock arriving unbidden — the row was chosen on
// satellites, not connections — and the two subjects now meet from opposite regions.
// `FR_ZAR` REUSED. `FR_GAR` is Gar Shatterkeel, so Gargauth takes `FR_GAU`.
//
// Mechanics excluded: the shield's published bonuses are rules text. Its powers appear only as
// prose describes them.
// ---------------------------------------------------------------------------------------
const FR_SHL = "forgottenrealms.fandom.com/wiki/Shield_of_the_Hidden_Lord";
const FR_GAU = "forgottenrealms.fandom.com/wiki/Gargauth";
const FR_KOS = "forgottenrealms.fandom.com/wiki/Knights_of_the_Shield";

export const SHIELD_HIDDEN_LORD: LibrarySubject = {
  id: "shield_hidden_lord",
  label: "The Shield of the Hidden Lord",
  category: "object",
  facts: [
    { t: "The Shield of the Hidden Lord was a powerful artifact associated with the demigod Gargauth, and with the Sword Coast nobles known as the Knights of the Shield.", p: "make", s: ["faith", "people"], src: FR_SHL },
    { t: "Somehow Gargauth ended up trapped within the shield, and sought ever after to escape it.", p: "threat", s: ["intrigue", "origin"], src: FR_SHL },
    { t: "It was forged from pure mithral and inlaid with scores of tiny gems.", p: "make", s: ["structure", "trade"], src: FR_SHL },
    { t: "Rubies, emeralds, sapphires and diamonds were arranged across its face to form the visage of a snarling beast.", p: "make", s: ["structure", "legend"], src: FR_SHL },
    { t: "Its bearer was protected from weapons loosed at them from a distance.", p: "power", s: ["make", "threat"], src: FR_SHL },
    { t: "Its bearer could understand any tongue spoken to them.", p: "power", s: ["make", "people"], src: FR_SHL },
    { t: "While the shield was borne, the Hidden Lord could speak through it.", p: "threat", s: ["power", "intrigue"], src: FR_SHL },
    { t: "Gargauth could speak directly to whoever carried it, urging them to cruel and treacherous deeds every day of their lives.", p: "threat", s: ["intrigue", "character"], src: FR_SHL },
    { t: "Gargauth, originally known as Gargoth and sometimes called Astaroth or Gormauth Souldrinker, was a former archdevil and the Faerûnian demigod of betrayal and political corruption.", p: "origin", s: ["faith", "character"], src: FR_GAU },
    { t: "Cast out of Hell for reasons unknown, he wandered the Material Plane, dedicated to infecting the Realms with his own brand of corruption and cruelty.", p: "origin", s: ["threat", "history"], src: FR_GAU },
    { t: "His titles ran to the Tenth Lord of the Nine, the Hidden Lord, the Lost Lord of the Pit, the Lord Who Watches, the Outcast and the Exile — and, formerly, Treasurer of Hell.", p: "legend", s: ["faith", "governance"], src: FR_GAU },
    { t: "His portfolio covered betrayal, decay, cruelty, ill-council, political corruption, political puppetmasters, powerbrokers and self-serving advisers.", p: "faith", s: ["governance", "character"], src: FR_GAU },
    { t: "He had penned a complete chronicle of his journeys as an emissary of the archdevils — a tome older than the pyramids of Mulhorand, its pages yellowing long before the first Cormyrian king was crowned.", p: "legend", s: ["history", "make"], src: FR_GAU },
    { t: "Its cramped magical text alluded to primordial battles between cosmic beings possibly greater even than Ao, and to ancient unspeakable magics and creatures of unimaginable vileness.", p: "legend", s: ["power", "history"], src: FR_GAU },
    { t: "The original lay in Oghma's Outlandian library, and it would be perfectly in character for Gargauth to have cursed some or all of the copies with a myriad of malignant hexes.", p: "make", s: ["legend", "faith"], src: FR_GAU },
    { t: "On the surface the Knights of the Shield were a secret society of merchants and nobles concerned with the mercantile and civic matters of their several lands.", p: "trade", s: ["people", "governance"], src: FR_KOS },
    { t: "Their high leadership were in fact guardians of a secret, serving the archdevil-turned-deity Gargauth — a secret kept from most of their own membership.", p: "intrigue", s: ["faith", "people"], src: FR_KOS },
    { t: "Based chiefly in Baldur's Gate, Amn and Tethyr, their influence reached from Calimshan to Waterdeep, though little of it touched Waterdeep after a failed coup against its Lords.", p: "trade", s: ["governance", "conflict"], src: FR_KOS },
    { t: "Elturel was only one city upon Zariel's list, and she had already struck a deal with her disciple Thalamra Vanthampur by which the rulership of Baldur's Gate would fall and Vanthampur become Grand Duke.", p: "intrigue", s: ["governance", "people"], src: FR_ZAR },
    { t: "The shield had contributed to the moral decay of Baldur's Gate for years, and Thavius and Thalamra meant to use it to doom that city in much the same manner as the last.", p: "intrigue", s: ["conflict", "governance"], src: FR_ZAR },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 39 (30 Jul) — ROUND B. `chult`; all five categories at 1. Ras Nsi wins the satellite test
// over Zombies of Chult and the Tomb relics: he carries the Bara page, Mezro, Omu and the Temple of
// Ubtao. `FR_BRA` is already the Rock of Bral's city page, so the barae take `FR_BAE`.
//
// Interlocks Artus Cimber (sourced last round — Artus is one of those who defeated Nsi at Mezro)
// and Yuan-ti (sourced), the people Nsi joined after his fall.
// ---------------------------------------------------------------------------------------
const FR_RNS = "forgottenrealms.fandom.com/wiki/Ras_Nsi";
const FR_BAE = "forgottenrealms.fandom.com/wiki/Bara";
const FR_MEZ = "forgottenrealms.fandom.com/wiki/Mezro";
const FR_TUB = "forgottenrealms.fandom.com/wiki/Temple_of_Ubtao";

export const RAS_NSI: LibrarySubject = {
  id: "ras_nsi",
  label: "Ras Nsi",
  category: "person",
  facts: [
    { t: "Ras — or Duke — Nsi was one of the seven barae, the Chosen of Ubtao.", p: "faith", s: ["governance", "people"], src: FR_RNS },
    { t: "He was infamous for seeking bloody and violent revenge upon the Eshowe tribe of Chult, and for the creation of the greater part of the undead that roam that land.", p: "threat", s: ["conflict", "legend"], src: FR_RNS },
    { t: "He dressed the part of a Cormyrean noble, in a sky-blue cloak and bearing a rapier.", p: "character", s: ["people", "make"], src: FR_RNS },
    { t: "His features were soft, but his eyes glowed supernaturally bright red whenever he grew irritable or spoke of his zeal for the city of Mezro.", p: "character", s: ["power", "people"], src: FR_RNS },
    { t: "After the Spellplague he resembled a yuan-ti malison, his torso and face wrapped in bandages, and he bore a flaming longsword.", p: "character", s: ["make", "threat"], src: FR_RNS },
    { t: "He carried a sending stone matched to one held by his agent, Salida.", p: "make", s: ["intrigue", "people"], src: FR_RNS },
    { t: "Nsi had been granted a special power that made him the most formidable of all the barae: he could animate the dead at will.", p: "power", s: ["threat", "faith"], src: FR_RNS },
    { t: "When he was stripped of his standing as a bara, he lost every one of those powers.", p: "power", s: ["governance", "legend"], src: FR_RNS },
    { t: "He controlled a fleet of ships off the coast of Chult, among them the stolen Cormyrean galleon Narwhal.", p: "conflict", s: ["structure", "people"], src: FR_RNS },
    { t: "Nsi lived in a palace that literally moved.", p: "structure", s: ["legend", "make"], src: FR_RNS },
    { t: "He believed all along that his army would be used to serve and defend Mezro — the city he still loved, for all that it had banished him.", p: "character", s: ["conflict", "governance"], src: FR_RNS },
    { t: "The barae were the seven Chosen of Ubtao, undying men and women who ruled the holy city of Mezro as priest-kings.", p: "faith", s: ["governance", "legend"], src: FR_BAE },
    { t: "It was said that if Mezro were ever destroyed, the barae would turn to dust.", p: "legend", s: ["faith", "structure"], src: FR_BAE },
    { t: "Of the original seven that Ubtao selected, only Ras Nsi remained alive as of the 1370s DR.", p: "history", s: ["people", "faith"], src: FR_BAE },
    { t: "When a bara was killed another was chosen to replace them: a supplicant entered the barado within the Temple of Ubtao and faced the bara test, which turned upon the dogma that all life is a great maze.", p: "faith", s: ["structure", "origin"], src: FR_BAE },
    { t: "A supplicant who passed was granted new powers, and one who failed was taken to the afterlife — and the exact nature of the test was a sacred secret.", p: "faith", s: ["origin", "threat"], src: FR_BAE },
    { t: "The whole city of Mezro became invisible around 863 DR, by a magical wall that also sowed confusion in anyone who came too near it, and so it remained hidden for nearly five hundred years.", p: "structure", s: ["landmark", "history"], src: FR_MEZ },
    { t: "In 1363 DR its rulers lowered those defenses after a solid victory over the Batiri goblin tribe, and travelers were welcomed into the city once more.", p: "history", s: ["conflict", "people"], src: FR_MEZ },
    { t: "When the Spellplague struck in 1385 DR, to save the city both from destruction and from Ras Nsi's ambitions, the barae made a demiplane and carried Mezro and all its citizens into it.", p: "origin", s: ["structure", "history"], src: FR_MEZ },
    { t: "In the Hall of Champions stood statues of the barae who had died, with empty pedestals left for those still living — and the enchantments laid there carried anyone who spoke a bara's name aloud to within a mile of him.", p: "structure", s: ["legend", "power"], src: FR_TUB },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 40 (30 Jul) — ROUND B. `dessarin`; all five categories at 1. The Sumber Hills win the
// satellite test over the Elder Elemental Eye prophecy and Aerisi Kalinoth: the hills carry
// Tyar-Besil, Besilmer, the Dessarin Valley and the Temple of Howling Hatred. `FR_DV` REUSED.
//
// This row also does orientation work the region badly needed. Dessarin has read so far as
// "Elemental Evil country" — a cult and its four prophets. The hills give it 4,000 years of history
// underneath that: a dwarven kingdom, its fall, five millennia of wilderness, a lost adventuring
// company, and the Haunted Keeps standing over the entrances they died guarding. The cult is the
// most recent thing to happen there, not the first.
// ---------------------------------------------------------------------------------------
const FR_SUH = "forgottenrealms.fandom.com/wiki/Sumber_Hills";
const FR_TYB = "forgottenrealms.fandom.com/wiki/Tyar-Besil";
const FR_BSL = "forgottenrealms.fandom.com/wiki/Besilmer";
const FR_THH = "forgottenrealms.fandom.com/wiki/Temple_of_Howling_Hatred";

export const SUMBER_HILLS: LibrarySubject = {
  id: "sumber_hills",
  label: "The Sumber Hills",
  category: "location",
  facts: [
    { t: "The Sumber Hills were badlands lying on either side of the River Dessarin.", p: "landmark", s: ["structure", "underground"], src: FR_SUH },
    { t: "The Larch Path and the Dessarin Road provided passage through them.", p: "landmark", s: ["trade", "structure"], src: FR_SUH },
    { t: "One of the first settlements in those hills was the underground city of Tyar-Besil, part of the shield dwarf kingdom of Besilmer.", p: "underground", s: ["origin", "structure"], src: FR_SUH },
    { t: "Tyar-Besil was abandoned and fell to ruin in −4190 DR, after the king of Besilmer died in battle.", p: "history", s: ["origin", "conflict"], src: FR_SUH },
    { t: "The hills were left alone thereafter, until the Knights of the Silver Horn began clearing the area of its native inhabitants in the Year of the Raised Sword, 893 DR.", p: "history", s: ["people", "conflict"], src: FR_SUH },
    { t: "The knights tried to raise fortresses in the hills, and were stopped by Uruth Ukrypt.", p: "conflict", s: ["people", "threat"], src: FR_SUH },
    { t: "Those events played their part in the Orcfastings War, and in the First and Second Trollwars both.", p: "conflict", s: ["history", "threat"], src: FR_SUH },
    { t: "Tyar-Besil was the ancient fortress-city of Besilmer, built around −4320 DR beneath the Sumber Hills.", p: "underground", s: ["structure", "origin"], src: FR_TYB },
    { t: "It was eventually overrun by hordes of orcs, trolls and giants.", p: "threat", s: ["conflict", "history"], src: FR_TYB },
    { t: "Torhild Flametongue was killed in single combat against a hill giant at Stone Bridge, and that led to the flight of the dwarves from the area, and in time to the complete abandonment of Tyar-Besil by −4160 DR.", p: "conflict", s: ["people", "legend"], src: FR_TYB },
    { t: "The city was rediscovered in 893 DR by an adventuring company called the Knights of the Silver Horn.", p: "history", s: ["people", "landmark"], src: FR_TYB },
    { t: "Over the six years that followed the company returned again and again, and built strongholds at the hidden entrances to Tyar-Besil in an attempt to protect it.", p: "structure", s: ["people", "governance"], src: FR_TYB },
    { t: "When the orc realm of Uruth Ukrypt rose to power the human population of the Dessarin Valley was almost wiped out and the Knights of the Silver Horn vanished; their former strongholds became known afterward as the Haunted Keeps.", p: "threat", s: ["people", "legend"], src: FR_TYB },
    { t: "Besilmer was a very atypical dwarf kingdom, built above ground with fields and pastures to support it.", p: "origin", s: ["governance", "trade"], src: FR_DV },
    { t: "When the realm was plundered by its enemies its people fled south to join the Fallen Kingdom.", p: "people", s: ["history", "governance"], src: FR_BSL },
    { t: "The Halls of the Hunting Axe were occupied by dwarves out of Delzoun for some forty years, but cold winters, orcs and wolves together proved too much for them.", p: "people", s: ["threat", "structure"], src: FR_BSL },
    { t: "As of 1368 DR the only parts of Besilmer still remaining were the Stone Bridge and the Halls of the Hunting Axe.", p: "structure", s: ["landmark", "history"], src: FR_BSL },
    { t: "Besilmer's sign could still be found on some rocks at Ironford, on the Stone Bridge, and in a few places about the Sumber Hills.", p: "make", s: ["landmark", "legend"], src: FR_BSL },
    { t: "The Temple of Howling Hatred was built within a quarter of Tyar-Besil, in a vast cavern deep beneath the hills, reached by a precarious staircase miles long that descended below Knifepoint Gully.", p: "underground", s: ["faith", "structure"], src: FR_THH },
    { t: "Its southern platform still held remnants of the dwarven city — a stone-wheel mechanism that governed the water level of the moat, a shrine of Moradin the cult had turned into a torture chamber, and a small plaza with a pool that had once been a place of inspiration for dwarven bards.", p: "faith", s: ["make", "character"], src: FR_THH },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 41 (30 Jul) — ROUND B. `feywild`; all five categories at 1. Prismeer wins the satellite
// test over the Laws of Fey Bargains and Redcaps: it carries the Hourglass Coven and all three
// hags, plus the Palace of Heart's Desire. `FR_PHD` REUSED.
//
// SCOPE, deliberately aimed away from Batch 25. Zybilna already carries the archfey herself and the
// nature of her domain; this subject is pointed at the material she does NOT cover — the coven, the
// betrayal as the palace records it, and the three splinter-realms. Cross-subject duplication is not
// gated by anything, so it is avoided by aim rather than by check.
//
// COPYRIGHT: the Hourglass Coven page carries a verse fragment. None of it is reproduced.
// ---------------------------------------------------------------------------------------
const FR_HGC = "forgottenrealms.fandom.com/wiki/Hourglass_Coven";
const FR_BAV = "forgottenrealms.fandom.com/wiki/Bavlorna_Blightstraw";
const FR_END = "forgottenrealms.fandom.com/wiki/Endelyn_Moongrave";
const FR_SKB = "forgottenrealms.fandom.com/wiki/Skabatha_Nightshade";

export const PRISMEER: LibrarySubject = {
  id: "prismeer",
  label: "Prismeer",
  category: "location",
  facts: [
    { t: "The Hourglass Coven was formed by the three daughters of Baba Yaga, the terrible archfey and Mother of All Witches.", p: "origin", s: ["faith", "people"], src: FR_HGC },
    { t: "They were known collectively to embody pure evil, each of them bound to an aspect of time itself — past, present, and future.", p: "power", s: ["legend", "character"], src: FR_HGC },
    { t: "As is so often the way with such covens, Skabatha, Bavlorna and Endelyn each despised the others, and conspired in pairs to plot the downfall of the third.", p: "character", s: ["intrigue", "people"], src: FR_HGC },
    { t: "For all that shared enmity, every one of them gained significant powers whenever all three stood close together.", p: "power", s: ["intrigue", "character"], src: FR_HGC },
    { t: "They grew exceedingly jealous when Iggwilv rose in power and ability and made a Domain of Delight of her own.", p: "character", s: ["intrigue", "origin"], src: FR_HGC },
    { t: "They feigned support and ingratiated themselves with the new archfey, all the while formulating a plot to sabotage her magic cauldron.", p: "intrigue", s: ["character", "make"], src: FR_HGC },
    { t: "They waited for precisely the right moment to strike and take Prismeer for their own.", p: "intrigue", s: ["governance", "threat"], src: FR_HGC },
    { t: "When Iggwilv returned to Prismeer from her travels the trap was sprung, and she was placed in a form of temporal stasis within her Palace of Heart's Desire.", p: "intrigue", s: ["power", "structure"], src: FR_HGC },
    { t: "The three sisters carved out domains for themselves and split Prismeer into three distinct realms: Hither, Thither and Yon.", p: "governance", s: ["landmark", "structure"], src: FR_HGC },
    { t: "They then manipulated the mercenaries of the League of Malevolence into safeguarding Iggwilv's Cauldron — the one thing that might have undone what they had done.", p: "intrigue", s: ["make", "people"], src: FR_HGC },
    { t: "The palace itself had been raised by Zybilna shortly after she created Prismeer, as a refuge for mortals stranded across the planes of existence.", p: "structure", s: ["origin", "people"], src: FR_PHD },
    { t: "The betrayal came when the sisters manipulated two rival adventuring companies, Valor's Call and the League of Malevolence, into battling within the palace's own throne room.", p: "intrigue", s: ["conflict", "structure"], src: FR_PHD },
    { t: "Bavlorna Blightstraw, called Slack-jawed Lorna, had a grotesque toad-like appearance, with bulbous eyes, cracked skin, and a mouth that often hung agape.", p: "nature", s: ["character", "people"], src: FR_BAV },
    { t: "Her jaw could open to eerily unnatural proportions, which allowed her to swallow creatures whole.", p: "threat", s: ["nature", "character"], src: FR_BAV },
    { t: "She almost never left the decrepit cottage she called home, in the bullywug village of Downfall at the center of the swamp called Hither.", p: "landmark", s: ["structure", "people"], src: FR_BAV },
    { t: "Within that hut was a mysterious pool that preserved her physical form, and on the rare occasions she did go out she travelled aboard a giant, bobbing lily pad.", p: "make", s: ["nature", "landmark"], src: FR_BAV },
    { t: "She believed she had a friend in the darkling elder named Charm, who was in fact a thief in the employ of her sister Endelyn.", p: "intrigue", s: ["people", "character"], src: FR_BAV },
    { t: "After the coven took Prismeer, Bavlorna transformed her third of the domain into the fetid swamp of Hither.", p: "landmark", s: ["governance", "nature"], src: FR_BAV },
    { t: "Endelyn Moongrave, also called Creeping Lyn and Bitter End, was the youngest of the three; her decrepit body was hidden behind a macabre dress that doubled as an intricate theatre for mechanically-controlled puppets, and she laired in the alpine theatre Motherhorn in Yon.", p: "character", s: ["make", "landmark"], src: FR_END },
    { t: "Skabatha Nightshade, known as Granny Nightshade, was the eldest — a short gaunt woman in layers of tattered dresses like doll's clothes, wearing heavy painted-on makeup that never quite covered skin resembling cracked wood.", p: "character", s: ["make", "nature"], src: FR_SKB },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 45 (30 Jul) — ROUND B. `swordcoast`; creature and object both at 0. The Trade Bars won the
// satellite test over Dragons of the North, which has no single page — the bars carry Trade bar,
// Currency, Baldur's Gate and the Sword Coast Traders' Bank. `FR_BG` REUSED (the alias check caught
// that the Baldur's Gate page was already declared, so `FR_BGT` was never created).
//
// An unglamorous row that turns out to be among the most USABLE at a table: a player researching
// trade bars learns that Iron Throne bars are refused by other trading houses, that broken bars are
// worthless while defunct houses' bars are still honored, and that every bar is checked by weight.
// That is three plot hooks and a scam, out of a currency article.
//
// Tag caution: a subject about money wants `trade` on every fact, which would drive density to 1.0
// and destroy the drift. Deliberately held to 8 of 20.
// ---------------------------------------------------------------------------------------
const FR_TBR = "forgottenrealms.fandom.com/wiki/Trade_bar";
const FR_CUR = "forgottenrealms.fandom.com/wiki/Currency";
const FR_SCB = "forgottenrealms.fandom.com/wiki/Sword_Coast_Traders'_Bank";

export const TRADE_BARS: LibrarySubject = {
  id: "trade_bars",
  label: "The Sword Coast Trade Bars",
  category: "object",
  facts: [
    { t: "Trade bars were a form of hard currency made of various precious metals, accepted throughout virtually all of Faerûn.", p: "trade", s: ["make", "landmark"], src: FR_TBR },
    { t: "They were typically marked with the seal or symbol of the mercantile group or the nation that had minted them.", p: "make", s: ["governance", "structure"], src: FR_TBR },
    { t: "After the Second Sundering the standard for the minting of trade bars was set by the city of Baldur's Gate.", p: "governance", s: ["history", "origin"], src: FR_TBR },
    { t: "The most common bars of that time were silver ingots of about six inches by two by one, weighing five pounds, and valued at twenty-five gold pieces.", p: "make", s: ["structure", "trade"], src: FR_TBR },
    { t: "Merchants' trade bars were thin bars of silver, marked at one end with their value and at the other with the symbol of the trading institution or coster that made them.", p: "make", s: ["structure", "people"], src: FR_CUR },
    { t: "An increasing number of those bars came to bear the mint mark of Baldur's Gate.", p: "governance", s: ["make", "history"], src: FR_CUR },
    { t: "Trade bars were always checked by weight.", p: "trade", s: ["structure", "governance"], src: FR_CUR },
    { t: "The trade bars of the Iron Throne trading group were not honored by other trading organizations, that group being considered disreputable.", p: "intrigue", s: ["people", "conflict"], src: FR_CUR },
    { t: "A broken trade bar had no value at all.", p: "make", s: ["threat", "structure"], src: FR_CUR },
    { t: "Most merchants would nonetheless go on honoring the bars of institutions that had long since gone defunct.", p: "people", s: ["history", "character"], src: FR_CUR },
    { t: "Silver and electrum bars could be had in denominations of ten, twenty-five and fifty gold pieces, and larger ones valued at five hundred and at a thousand.", p: "make", s: ["trade", "structure"], src: FR_CUR },
    { t: "For years Baldur's Gate minted its own silver trade bars, the most common variety being a one-pound bar worth five gold pieces.", p: "governance", s: ["make", "origin"], src: FR_BG },
    { t: "More importantly, the city also set the value of that form of currency and regulated its use in trade.", p: "governance", s: ["power", "trade"], src: FR_BG },
    { t: "Trade in Baldur's Gate was not tied to any individual's moral alignment, and anyone conducting business in a non-harmful manner was welcome to deal there.", p: "people", s: ["character", "governance"], src: FR_BG },
    { t: "By virtue of that tolerant outlook the city became the greatest center of trade along the whole Sword Coast in the 15th century, out-competing both Waterdeep and Amn.", p: "trade", s: ["history", "conflict"], src: FR_BG },
    { t: "Its Gray Harbor was among the largest, busiest and most popular ports-of-call on the western coast of Faerûn, handling a variety of cargoes that rivaled even the sprawling ports of Calimshan.", p: "landmark", s: ["trade", "structure"], src: FR_BG },
    { t: "The merchants of Baldur's Gate were famous across the Realms for their heroic work ethic, their keen sense of business, and their outright gumption.", p: "people", s: ["character", "legend"], src: FR_BG },
    { t: "The Sword Coast Traders' Bank was a banking business in Daggerford, offering money-lending and secured storage to the merchants and traders who came through the town.", p: "structure", s: ["trade", "people"], src: FR_SCB },
    { t: "Around the Year of the Iron Dwarf's Vengeance, 1485 DR, a person could deposit coin in its secured building and withdraw the same amount in Baldur's Gate or Waterdeep — the amounts and the clientele kept secret, and sent between cities by magically safeguarded means.", p: "intrigue", s: ["structure", "power"], src: FR_SCB },
    { t: "It sought also to lend to Daggerford's own citizens out of that stored wealth, and that side of the business fared less well, the townsfolk preferring to deal with people they already knew.", p: "people", s: ["character", "threat"], src: FR_SCB },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 46 (31 Jul) — ROUND B COMPLETE. `wildspace`; creature and object both at 0. Neogi wins the
// satellite test over Aberrations of the Far Realm (diffuse, no single page) and Spelljamming Helms
// (whose page already backs The Spelljammer, so the row would have been topped up from another
// subject's source — the B-57 warning sign).
//
// Closes a loop from Batch 21: The Spelljammer records that the neogi destroyed one, at the cost of
// a fleet of over fifty ships, and that their presence in wildspace has been the weaker ever since.
// This subject is the other end of that account.
// ---------------------------------------------------------------------------------------
const FR_NEO = "forgottenrealms.fandom.com/wiki/Neogi";
const FR_UMH = "forgottenrealms.fandom.com/wiki/Umber_hulk";
const FR_DSP = "forgottenrealms.fandom.com/wiki/Neogi_deathspider";
const FR_MSP = "forgottenrealms.fandom.com/wiki/Neogi_mindspider";

export const NEOGI: LibrarySubject = {
  id: "neogi",
  label: "Neogi",
  category: "creature",
  facts: [
    { t: "The neogi were a race of spider-like creatures.", p: "nature", s: ["origin", "society"], src: FR_NEO },
    { t: "They were ruthless, xenophobic slavers and plunderers, hated in all known crystal spheres.", p: "threat", s: ["society", "conflict"], src: FR_NEO },
    { t: "They were small eight-legged creatures, the adults no bigger than a small child.", p: "nature", s: ["structure", "people"], src: FR_NEO },
    { t: "Each had a head with reflective eyes, set upon a long eel-like neck.", p: "nature", s: ["character", "people"], src: FR_NEO },
    { t: "With their hairy flattened abdomens they were sometimes described as akin to a cross between a wolf spider and an eel.", p: "nature", s: ["legend", "character"], src: FR_NEO },
    { t: "For all those similarities, the neogi were warm-blooded.", p: "nature", s: ["origin", "power"], src: FR_NEO },
    { t: "They were usually accompanied by umber hulks, which they employed as slaves for their physical labor — the construction of their ships, and combat.", p: "society", s: ["people", "make"], src: FR_NEO },
    { t: "Ordinarily every neogi had at least one umber hulk slave of its own.", p: "society", s: ["governance", "people"], src: FR_NEO },
    { t: "Enslaved creatures of other species were held in far lower standing than the umber hulks, and treated as little more than food.", p: "society", s: ["threat", "trade"], src: FR_NEO },
    { t: "An obscure necromantic ritual allowed the neogi to make undead hulks — undead umber hulks assembled by joining pieces of several different bodies together.", p: "make", s: ["threat", "power"], src: FR_NEO },
    { t: "The neogi held an unusual view of their own deities: they offered no prayers and rarely any sacrifices, but demanded favors and boons of them regularly, seeing the gods as servants of the neogi race.", p: "faith", s: ["character", "governance"], src: FR_NEO },
    { t: "The neogi powers were sexless, just as the neogi themselves were.", p: "faith", s: ["nature", "origin"], src: FR_NEO },
    { t: "Speaking the name of one of those deities incorrectly was reckoned a sacrilege worthy of a slow and painful death.", p: "faith", s: ["threat", "governance"], src: FR_NEO },
    { t: "Given the difficulty of the neogi language for other races, it was thought advisable to refrain from the attempt altogether.", p: "faith", s: ["people", "legend"], src: FR_NEO },
    { t: "Their gods included Ka'jk'zxl, the dead god of creation; Kil'lix, a lesser god of death, murder and poison; and Kr'tx, a lesser god of war, brutality and strength.", p: "faith", s: ["legend", "origin"], src: FR_NEO },
    { t: "The neogi captured umber hulks and enslaved them, the young ones being used as the first servants of newly hatched neogi.", p: "society", s: ["origin", "people"], src: FR_UMH },
    { t: "Deathspiders were the standard spelljamming ships of neogi spacefarers, able to sustain as many as a hundred aboard and requiring a crew of at least thirty to stay operational.", p: "make", s: ["structure", "trade"], src: FR_DSP },
    { t: "Eight neogi, each with an umber hulk slave, typically commanded a deathspider, while the remainder of the crew was slaves working the deeper sections of the ship.", p: "governance", s: ["make", "society"], src: FR_DSP },
    { t: "Command followed the usual slaver logic: the captain owned every other crew member, and their slaves besides — and should a captain be killed, a replacement was elected from among the remaining neogi aboard.", p: "governance", s: ["conflict", "structure"], src: FR_DSP },
    { t: "Mindspiders were sometimes stripped of engines and weapons, loaded with neogi eggs and an undead great old master, and deployed from their deathspider motherships onto planets judged suitable for colonization — though by the mid-14th century DR no such experiment had ever succeeded.", p: "make", s: ["origin", "threat"], src: FR_MSP },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 47 (31 Jul) — `moonsea`, LAST ROW. Frank's observation: three regions had a DMG category
// with zero sourced rows — moonsea and swordcoast had no creature, underdark no legend. The
// within-region gate cannot see this: it checks that a region HAS a row of each category, not that
// the row is sourced. On paper those regions were complete; in practice a bastion there had an
// empty shelf. Worth noting as a real limit of that gate.
//
// 17 facts. `FR_PHL` and `FR_OPH` REUSED. The Pool of Radiance novel page was available and NOT
// used — a plot summary is a weaker source than the location pages, and three good sources beat
// four uneven ones. Overlap with the already-sourced Pool of Radiance subject was the live risk
// here; the B-56 duplicate gate is what makes that checkable rather than hoped-for.
// ---------------------------------------------------------------------------------------
const FR_VJC = "forgottenrealms.fandom.com/wiki/Valjevo_Castle";

export const UNDEAD_OF_PHLAN: LibrarySubject = {
  id: "undead_of_phlan",
  label: "The Undead of Phlan",
  category: "creature",
  facts: [
    { t: "In the Year of the Gauntlet, 1369 DR, the dreaded pool of radiance reemerged underneath Valjevo Castle.", p: "history", s: ["power", "threat"], src: FR_PHL },
    { t: "A thief named Kestrel witnessed its corrupted waters consuming three criminals, and reluctantly decided to inform Elminster Aumar of the returned danger.", p: "people", s: ["intrigue", "threat"], src: FR_PHL },
    { t: "As the pool's power grew it began seeping the life out of the residents of Phlan, and started to spawn undead.", p: "threat", s: ["power", "people"], src: FR_PHL },
    { t: "Elminster assembled a band of adventurers helmed by Athan, and entrusted him with the Gauntlets of Moander to venture into the ruins of Myth Drannor, from whence the corruption had originated.", p: "people", s: ["conflict", "faith"], src: FR_PHL },
    { t: "Athan's band fell in combat, and the pools spread across other cities of the Moonsea.", p: "conflict", s: ["threat", "history"], src: FR_PHL },
    { t: "Phlan was founded atop Valjevo Isle, a small island within the bay.", p: "origin", s: ["landmark", "structure"], src: FR_PHL },
    { t: "In the Year of the Morningstar, 1350 DR, the god Bane schemed to teleport Phlan and several other Moonsea cities away from their places entirely, to serve as soul farms for the Lord of Darkness in Banehold.", p: "faith", s: ["intrigue", "threat"], src: FR_PHL },
    { t: "After three centuries lying in ruin, Milsor the Valjevo had the city rebuilt in the Year of the Lost Lance, 712 DR.", p: "history", s: ["origin", "structure"], src: FR_PHL },
    { t: "Valjevo Castle was the central seat of government in the Moonsea city-state of Phlan.", p: "governance", s: ["structure", "landmark"], src: FR_VJC },
    { t: "The castle stood within the Old City district, and consisted of three major layers of defense.", p: "structure", s: ["governance", "conflict"], src: FR_VJC },
    { t: "At the center of Srossar's lair lay the crescent-shaped pool of glimmering liquid.", p: "landmark", s: ["power", "make"], src: FR_VJC },
    { t: "Beside it stood a stone pedestal known as the Figure of Power, which somehow let Tyranthraxus better control what lay in the water by setting ioun stones into it.", p: "make", s: ["power", "intrigue"], src: FR_VJC },
    { t: "In 1340 DR the Heroes of Phlan worked together to drive Tyranthraxus and his forces out of the castle and reclaim the city.", p: "conflict", s: ["history", "power"], src: FR_VJC },
    { t: "From there the castle was reoccupied by the human residents of Phlan.", p: "people", s: ["structure", "history"], src: FR_VJC },
    { t: "The Lyceum of the Black Lord was an old temple of Bane that served the city's Knights of the Black Fist, before it fell to ruin.", p: "faith", s: ["structure", "governance"], src: FR_OPH },
    { t: "Mantor's Library was the grand library of Phlan, and remained a treasure trove of knowledge even through the city's darkest days.", p: "structure", s: ["legend", "people"], src: FR_OPH },
    { t: "Podol Plaza was Phlan's busy and lively marketplace.", p: "trade", s: ["landmark", "people"], src: FR_OPH },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 48 (31 Jul) — `swordcoast` creature gap closed. Frank offered to swap the row if Dragons of
// the North proved too thin. It is not thin: FR carries Arauthator and Arveiaturace in depth, plus
// two IN-UNIVERSE books about them — Volo's chapbook `Wyrms of the North` and `Dragons Ye Should
// Know` by the sage Myrindas of Port Kir. The row stands as written.
//
// Worth noting against B-16 and Batch 24: I have now twice suspected a row of being thin on the
// strength of its LABEL rather than a measurement, and been wrong both times. "Dragons of the
// North" reads like a vague grouping and is in fact two well-documented wyrms with a bibliography.
// Measure the row, never judge the row's name.
// ---------------------------------------------------------------------------------------
const FR_ARA = "forgottenrealms.fandom.com/wiki/Arauthator";
const FR_ARV = "forgottenrealms.fandom.com/wiki/Arveiaturace";
const FR_DYK = "forgottenrealms.fandom.com/wiki/Dragons_Ye_Should_Know";

export const DRAGONS_OF_THE_NORTH: LibrarySubject = {
  id: "dragons_of_the_north",
  label: "Dragons of the North",
  category: "creature",
  facts: [
    { t: "Dragons Ye Should Know was a book published by the sage Myrindas of Port Kir in the year 1354 DR.", p: "make", s: ["legend", "people"], src: FR_DYK },
    { t: "It detailed a number of the more notable dragons of the Realms, the white dragon Arauthator among them.", p: "make", s: ["legend", "nature"], src: FR_DYK },
    { t: "It was later quoted by Volothamp Geddarm in his own chapbook on the most notable dragon rulers of the Sword Coast North, which he called Wyrms of the North.", p: "legend", s: ["people", "trade"], src: FR_DYK },
    { t: "Arauthator, called Old White Death, was a white dragon who lived in Oyaviggaton in the Sea of Moving Ice.", p: "nature", s: ["landmark", "origin"], src: FR_ARA },
    { t: "He was orphaned as a wyrmling in 940 DR, when the archmage Tulrun slaughtered his entire family in revenge for what his mother Sneighfanglen had done.", p: "origin", s: ["conflict", "people"], src: FR_ARA },
    { t: "He valued very highly the protection and maintenance of his domain against traps, enemies, and overhunting alike.", p: "character", s: ["governance", "landmark"], src: FR_ARA },
    { t: "To that end he destroyed the frost giant community of Bulindiful, and the bugbear hold located within Sardin's Sword.", p: "conflict", s: ["threat", "governance"], src: FR_ARA },
    { t: "He and the white dragon Ingeloakastimizilian came to an uneasy truce rather than fight a mutually destructive battle over rulership of the Reghed Glacier — and even after his rival's death, Arauthator went on avoiding Icewind Dale.", p: "conflict", s: ["governance", "landmark"], src: FR_ARA },
    { t: "He gained fame in 1324 DR for slaying the red dragon Rathalylaug above the city of Neverwinter, and the sorceress Shareera besides, when he smashed her tower in his triumph.", p: "legend", s: ["conflict", "history"], src: FR_ARA },
    { t: "His mate was Arveiaturace, and they had offspring together, among them Aurbangras.", p: "origin", s: ["people", "nature"], src: FR_ARA },
    { t: "Arauthator is said to have killed more than twenty of his own offspring, defending his territory against ambitious dragons.", p: "threat", s: ["character", "governance"], src: FR_ARA },
    { t: "Arveiaturace was an ancient white dragon who made her home upon the Ice Peak in the Sea of Moving Ice.", p: "nature", s: ["landmark", "legend"], src: FR_ARV },
    { t: "She was the former student, consort and companion of the wizard Meltharond.", p: "people", s: ["origin", "power"], src: FR_ARV },
    { t: "Even after Meltharond's death she still carried his skeletal remains, and his rider's palanquin, upon her back.", p: "character", s: ["make", "people"], src: FR_ARV },
    { t: "Magic items and spellbooks belonging to Meltharond were said to be lying in his old rooms yet, largely where he had left them.", p: "make", s: ["power", "structure"], src: FR_ARV },
    { t: "She preyed on ships all along the Sword Coast, sometimes destroying them entirely in the process.", p: "threat", s: ["trade", "conflict"], src: FR_ARV },
    { t: "She seemed committed to eating as many sailors as she could, and to making every seafarer and every other dragon terrified at the prospect of journeying north of Ruathym.", p: "threat", s: ["people", "legend"], src: FR_ARV },
    { t: "She was known to venture far beyond her own territory in pursuit of fleeing adventurers.", p: "threat", s: ["character", "conflict"], src: FR_ARV },
    { t: "She was feared by all the sailors of the Sword Coast, save the foolish few who dismissed her as a legend.", p: "legend", s: ["people", "threat"], src: FR_ARV },
    { t: "Seafarers called her Iceclaws, for her habit of swooping down upon ships to snatch crew members away for a quick snack.", p: "people", s: ["legend", "threat"], src: FR_ARV },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 49 (31 Jul) — `underdark` legend gap closed, the LAST empty region/category in the corpus.
//
// CHOSEN AGAINST THE OTHER CANDIDATE FOR A CONCRETE REASON. `The Descent of the Drow` was the
// alternative, and it is largely REDUNDANT: the already-sourced Drow subject tells that story in
// facts 3-5 — Ilythiir, the Crown Wars, Corellon's curse, and the Descent by name. Authoring it
// would have duplicated a sourced subject, which the B-56 gate would then have caught after the
// work was done. Checking the neighbouring subject BEFORE choosing is cheaper than being told after.
// (That row is one I created in the Batch 27 swap, and it should probably be re-labelled.)
//
// SCOPE, the Trolls/Trollwars reservation again: `Demons of the Abyss` is still an open underdark
// creature row. This subject takes the EVENT — the ritual, the breach, the rampage, the aftermath —
// and leaves the demon lords' own natures for that row to carry.
//
// 18 facts. Two candidate facts stating the same summoning from different pages were cut to one.
// ---------------------------------------------------------------------------------------
const FR_ROD = "forgottenrealms.fandom.com/wiki/Rage_of_Demons";
const FR_GRO = "forgottenrealms.fandom.com/wiki/Gromph_Baenre";
const FR_DEM = "forgottenrealms.fandom.com/wiki/Demogorgon";
const FR_AOM = "forgottenrealms.fandom.com/wiki/Assault_on_Maerimydra";

export const RAGE_OF_DEMONS: LibrarySubject = {
  id: "rage_of_demons",
  label: "The Rage of Demons",
  category: "legend",
  facts: [
    { t: "Demons appeared in Menzoberranzan and elsewhere in the Underdark, summoned in 1485 and 1486 DR by Matron Mother Quenthel Baenre in order to secure her reign over the city.", p: "intrigue", s: ["governance", "faith"], src: FR_ROD },
    { t: "Their presence was according to the plans of Lolth, who arranged for Gromph Baenre to inadvertently summon Demogorgon to the Prime Material Plane.", p: "faith", s: ["intrigue", "power"], src: FR_ROD },
    { t: "Gromph Baenre was a drow, the Archmage of Menzoberranzan, and a very capable diviner.", p: "people", s: ["power", "governance"], src: FR_GRO },
    { t: "He was Master of Sorcere, the arcane school, and the eldest son of Matron Mother Yvonnel Baenre — which together made him the most powerful male in the city.", p: "people", s: ["governance", "structure"], src: FR_GRO },
    { t: "Austere yet handsome, he had amber eyes, like his daughter Liriel.", p: "character", s: ["people", "legend"], src: FR_GRO },
    { t: "Despite an age great even by elven standards, he appeared eternally youthful, by the effects of a magical amulet in his possession.", p: "character", s: ["power", "make"], src: FR_GRO },
    { t: "On Nightal 15 in the Year of the Nether Mountain Scrolls, 1486 DR, Gromph seemingly botched a ritual meant to summon and bind the demon lord Demogorgon.", p: "power", s: ["intrigue", "history"], src: FR_GRO },
    { t: "Instead he caused a number of other demon lords — Graz'zt, Yeenoghu, Baphomet, Juiblex, Zuggtmoy, and even Orcus — along with countless lesser demons, to appear throughout the Underdark as well.", p: "threat", s: ["power", "origin"], src: FR_GRO },
    { t: "The Prince of Demons himself appeared in Menzoberranzan and went on a rampage through the city, causing massive damage and killing thousands.", p: "threat", s: ["conflict", "structure"], src: FR_GRO },
    { t: "Though the whole disaster was ultimately due to Lolth's machinations, Gromph's family nonetheless helped him escape the city, to be certain no other drow learned the truth of it.", p: "intrigue", s: ["people", "faith"], src: FR_GRO },
    { t: "He left behind the tome he had used — Zhaun'ol'leal, the Book of the Eight — in his inner sanctum, and it was never found in the initial effort to blot out the evidence.", p: "make", s: ["intrigue", "legend"], src: FR_GRO },
    { t: "Gromph went into hiding in Luskan.", p: "people", s: ["intrigue", "history"], src: FR_GRO },
    { t: "What he had actually done was weaken the barriers of faerzress, allowing Demogorgon to pass out of the Abyss and onto the Prime Material Plane.", p: "power", s: ["origin", "history"], src: FR_DEM },
    { t: "The demon lord arrived at the tower of Sorcere, and cut a swath of destruction as he made his way out of the cavern.", p: "threat", s: ["structure", "conflict"], src: FR_DEM },
    { t: "Gromph had been able to weaken the faerzress at all because of his study of psionics, and the psychic conveyance of a plan devised by the goddess Lolth herself.", p: "power", s: ["faith", "character"], src: FR_DEM },
    { t: "In 1487 DR Drizzt Do'Urden defeated Demogorgon in Menzoberranzan, acting as a conduit for a barrage of magical energy released upon him and held by the kinetic barrier of an illithid hive-mind.", p: "conflict", s: ["legend", "people"], src: FR_DEM },
    { t: "In the late 15th century DR, after a vision of the demon lord appeared in the Darklake, a faction of the kuo-toa of Sloobludop started a cult of Demogorgon.", p: "faith", s: ["legend", "threat"], src: FR_DEM },
    { t: "The occupation reached as far as Maerimydra, where the demonic occupiers served under a fiendish fire giant ruler and the city became a cesspit of corruption and madness.", p: "conflict", s: ["governance", "threat"], src: FR_AOM },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 50 (31 Jul) — `swordcoast` COMPLETE at 8 of 8. Third region closed, after waterdeep and
// moonsea.
//
// DISAMBIGUATION CHECKED FIRST. "The Sundering" names two different events in the Realms — the
// elven High Magic ritual of about −17600 DR that made Evermeet, and the Second Sundering of the
// 1480s. The ledger descriptor reads "the world-remaking upheaval of the late 1400s DR", which
// settles it as the second. Same check as the Wild Hunt / High Hunt collision in Batch 14: when a
// row's title is ambiguous, the descriptor is the authority, and it costs one grep to be sure.
// ---------------------------------------------------------------------------------------
const FR_2SU = "forgottenrealms.fandom.com/wiki/Second_Sundering";
const FR_AO = "forgottenrealms.fandom.com/wiki/Ao";
const FR_EOU = "forgottenrealms.fandom.com/wiki/Era_of_Upheaval";
const FR_TOR = "forgottenrealms.fandom.com/wiki/Toril";

export const THE_SUNDERING: LibrarySubject = {
  id: "the_sundering",
  label: "The Sundering",
  category: "legend",
  facts: [
    { t: "The Second Sundering, also called the Sundering of Toril and Abeir, was a great catastrophic event in the history of both worlds, and it took place across the decade of the 1480s DR.", p: "history", s: ["legend", "landmark"], src: FR_2SU },
    { t: "When Ao the Overgod destroyed the Tablets of Fate at the conclusion of the Time of Troubles, he instigated the Era of Upheaval.", p: "faith", s: ["governance", "origin"], src: FR_2SU },
    { t: "The Tablets had defined the laws of Realmspace, and kept it relatively stable.", p: "make", s: ["governance", "structure"], src: FR_2SU },
    { t: "Without them chaos ensued, and the worlds of Abeir and Toril — sundered many thousands of years before — slowly began to overlap once again.", p: "origin", s: ["landmark", "history"], src: FR_2SU },
    { t: "The Spellplague drastically sped that process along.", p: "threat", s: ["power", "history"], src: FR_2SU },
    { t: "The Second Sundering started with Ao's decision to recreate the Tablets of Fate, and to separate the two worlds once more.", p: "faith", s: ["governance", "power"], src: FR_2SU },
    { t: "On Nightal, some places of Abeir that had been part of Toril across the last century, and the reverse, were restored to the worlds they had come from.", p: "landmark", s: ["structure", "origin"], src: FR_2SU },
    { t: "Unther was returned to Toril by that process.", p: "landmark", s: ["people", "history"], src: FR_2SU },
    { t: "While it lay in Abeir, Unther had succumbed to domination by the creatures native to that world, until a reincarnated Gilgeam led his people against their oppressors.", p: "conflict", s: ["people", "threat"], src: FR_2SU },
    { t: "Once returned, Gilgeam immediately went against the dragonborn of Tymanther, to take back all of Unther's ancestral land.", p: "conflict", s: ["governance", "people"], src: FR_2SU },
    { t: "As 1487 DR came to a close the Second Sundering ended, with the full return of Mystra and the Weave, and the separation of Abeir and Toril.", p: "faith", s: ["power", "history"], src: FR_2SU },
    { t: "After the Sundering, all the wars that had begun in its wake came to an end.", p: "history", s: ["conflict", "governance"], src: FR_2SU },
    { t: "Most of the primordials then living on Toril, Akadi among them, departed for their original world of Abeir.", p: "origin", s: ["faith", "landmark"], src: FR_2SU },
    { t: "The orcs of Many-Arrows were defeated, while Myth Drannor came to the aid of the Dalelands in their conflict against Netherese-controlled Sembia.", p: "conflict", s: ["people", "landmark"], src: FR_2SU },
    { t: "The Arcane Brotherhood and the Hosttower of the Arcane returned to power in Luskan.", p: "governance", s: ["power", "structure"], src: FR_2SU },
    { t: "In 1482 DR Ao began the Second Sundering, as a way to restore the worlds of Toril and Abeir after the ravages of the Spellplague.", p: "faith", s: ["origin", "power"], src: FR_AO },
    { t: "During it Ao recreated and rewrote the Tablets of Fate, inscribing upon them the names and the purposes of the gods and primordials he chose to serve in a new and more inclusive divine reality.", p: "make", s: ["faith", "governance"], src: FR_AO },
    { t: "The old rules had proved more problematic than they were worth, encouraging the gods to battle among themselves for supremacy; so during the Sundering Ao discarded them, reassigned portfolios, and made more flexible ones.", p: "governance", s: ["faith", "character"], src: FR_AO },
    { t: "When the Second Sundering ended, in 1489 DR, Lord Ao decreed the end of the Era of Upheaval.", p: "history", s: ["governance", "legend"], src: FR_EOU },
    { t: "Maztica, which had been sent away to Abeir following the Spellplague, returned to Toril during the Second Sundering.", p: "landmark", s: ["origin", "structure"], src: FR_TOR },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 51 (31 Jul) — `icewinddale`. The three-way Auril split from B-60, put into practice:
// Codicil of White holds her CHURCH, Prophecy of the Frostmaiden holds the EVENT, and this row
// takes the GODDESS — avatars, divine realm, temperament, and her quarrels among the Gods of Fury.
// Not one of these twenty facts appears in either of the other two subjects. `FR_AUR` REUSED.
//
// COPYRIGHT: her page carries TWO quoted blocks — the charge to her clergy, and a poem titled
// The Rime of the Frostmaiden. Neither is reproduced. The dogma appears only as a single condensed
// statement of what she commands, in the Exchange's own words; the poem is untouched entirely.
// ---------------------------------------------------------------------------------------
const FR_TAL = "forgottenrealms.fandom.com/wiki/Talos";
const FR_GOF = "forgottenrealms.fandom.com/wiki/Gods_of_Fury";

export const AURIL: LibrarySubject = {
  id: "auril",
  label: "Auril the Frostmaiden",
  category: "person",
  facts: [
    { t: "As Talos, leader of the Gods of Fury, eroded her power over snow storms, the Cold Goddess made her season more frigid still, to remind the folk of the north who it was that controlled the cold.", p: "faith", s: ["power", "conflict"], src: FR_AUR },
    { t: "The Frost Sprite Queen was held to be synonymous with the Queen of Air and Darkness by some communities of fey, such as those of the Shiverpine Forest in the Deep Wilds.", p: "legend", s: ["faith", "people"], src: FR_AUR },
    { t: "After the Sundering it was seen that the Queen of Air and Darkness had only been impersonating Auril, in order to keep followers on Toril.", p: "legend", s: ["people", "power"], src: FR_AUR },
    { t: "She charged her clergy to cover every land in ice, to quench fire wherever they found it, to let in the wind and the cold, and to make all Faerûn fear her.", p: "faith", s: ["governance", "threat"], src: FR_AUR },
    { t: "Her most frequently seen avatar was the Frostmaiden: a lithe woman with blue skin and a body made of ice and snow, her long hair white and free-flowing, in a thickly furred gown with frost swirling about her.", p: "nature", s: ["make", "legend"], src: FR_AUR },
    { t: "Her other classic form was the Icedawn, an impassive apparition of icy hauteur that glided silently through the air, wearing an ornate crown and hooked, spurred armor of opaque pale-blue ice.", p: "nature", s: ["make", "character"], src: FR_AUR },
    { t: "In the late 15th century she took three new shapes; the first was the Cold Crone, seven feet tall and hunched, with a snowy owl's head topped by curled ram's horns, cloven hooves, black talons, and grayish-white wolf fur from the neck down.", p: "nature", s: ["threat", "make"], src: FR_AUR },
    { t: "The second was the Brittle Maiden, or Lady Icekiss, ten feet tall in a thin cloak of mist, her eyes burning with cold blue light and her body of ice crackling as she moved, icy blades growing from her at odd angles and snapping off when they grew too long.", p: "nature", s: ["make", "threat"], src: FR_AUR },
    { t: "The third was Winter's Womb, called the Queen of Frozen Tears by her most devoted: a faceted diamond of ice three feet across, hovering in the air, holding her divine spark and radiating intense cold in every direction, her voice seeming to come from its very heart.", p: "nature", s: ["power", "make"], src: FR_AUR },
    { t: "Arrogant and vain, she was incapable of love or honor or any other noble feeling — and yet she adored her ice, and every form of beauty.", p: "character", s: ["faith", "people"], src: FR_AUR },
    { t: "From natural wonders to art objects to the artists themselves, the Frostmaiden froze them all in magical ice, preserving them from the ravages of time and hoarding them away for her own viewing pleasure alone.", p: "character", s: ["make", "power"], src: FR_AUR },
    { t: "Her ultimate goal was to cover the Realms, and all other lands besides, beneath her ice and snow.", p: "character", s: ["threat", "governance"], src: FR_AUR },
    { t: "She trapped those who offended her in blizzards and drove them insane with visions of warmth and the comforts of home, before killing them at last with the sheer bitter cold.", p: "threat", s: ["character", "people"], src: FR_AUR },
    { t: "Her divine realm was called Winter's Hall, in Pandesmos, the topmost layer of Pandemonium.", p: "structure", s: ["faith", "landmark"], src: FR_AUR },
    { t: "During the Spellplague that realm lay within the Astral Dominion of the Deep Wilds, and went by the name of the Land Under Eternal Ice.", p: "structure", s: ["origin", "landmark"], src: FR_AUR },
    { t: "Her relationship with Talos was said to be close and cordial, which proved no obstacle to his attempting to usurp her following; she preferred not to rely upon him, given his habit of answering a call and then directing all the glory to himself.", p: "allies", s: ["conflict", "character"], src: FR_AUR },
    { t: "At one stage she was in a relationship with Thrym, god of the frost giants, and by him became mother to the empyrean daughter Nalkara.", p: "origin", s: ["allies", "people"], src: FR_AUR },
    { t: "She used frost giants and winter wolves to carry commands to her cults, while frostwind viragos and winter hags served her as handmaidens.", p: "governance", s: ["allies", "threat"], src: FR_AUR },
    { t: "Talos was restored to the pantheon following the Second Sundering, and afterward interceded in the quarrel between Auril and Umberlee by siding with the latter, which forced Auril to retreat to Icewind Dale in the late 1480s DR.", p: "conflict", s: ["allies", "governance"], src: FR_TAL },
    { t: "Among the northern islands of the Trackless Sea — Gundarlun, the Purple Rocks, Ruathym and Tuern — the constant, bitterly cold northwest winds were called Auril's Breath.", p: "landmark", s: ["people", "legend"], src: FR_AUR },
    { t: "Umberlee had grown resentful of Auril — or perhaps of her domain of ice, and its chilling effect upon water and the sea — and in the wake of that fracturing of the old alliance the Frostmaiden fled to Icewind Dale.", p: "conflict", s: ["landmark", "allies"], src: FR_GOF },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 52 (31 Jul) — `icewinddale`. Remorhaz, 19 facts. The satellite that made this row work is
// the Glacier of the White Worm: a whole glacier named for an albino strain of them, with a
// giant-sized king worm at its center and a sinister power the sages of the 14th century warned
// might threaten Faerûn itself. A bestiary entry with a mystery attached.
//
// Mechanics excluded as always: hit dice, damage and the published stat block are rules text.
// ---------------------------------------------------------------------------------------
const FR_REM = "forgottenrealms.fandom.com/wiki/Remorhaz";
const FR_GWW = "forgottenrealms.fandom.com/wiki/Glacier_of_the_White_Worm";

export const REMORHAZ: LibrarySubject = {
  id: "remorhaz",
  label: "Remorhaz",
  category: "creature",
  facts: [
    { t: "A remorhaz, known also as a polar worm or an ice worm, was a monstrous beast resembling something between a worm and a centipede.", p: "nature", s: ["origin", "habitat"], src: FR_REM },
    { t: "It thrived in cold environments, and in arctic regions above all.", p: "habitat", s: ["nature", "threat"], src: FR_REM },
    { t: "It had leathery, tough wings that it could not use to fly, an insect-like head, and a scaly body some forty feet in length.", p: "nature", s: ["make", "habitat"], src: FR_REM },
    { t: "It was ice-blue in color and ran upon dozens of legs.", p: "nature", s: ["landmark", "habitat"], src: FR_REM },
    { t: "Its back glowed red with an inner fire that could melt all but the strongest of metals.", p: "power", s: ["nature", "threat"], src: FR_REM },
    { t: "It bore horns along the length of its body, and dagger-like teeth.", p: "nature", s: ["threat", "make"], src: FR_REM },
    { t: "It naturally possessed a very high resistance to magic.", p: "power", s: ["nature", "make"], src: FR_REM },
    { t: "A remorhaz produced an incredible amount of heat, which let it take full advantage of the vulnerability that so many creatures of its native environment possessed.", p: "threat", s: ["power", "habitat"], src: FR_REM },
    { t: "That same heat allowed it to melt nonmagical weapons that struck its red-hot protrusions.", p: "threat", s: ["make", "power"], src: FR_REM },
    { t: "A remorhaz liked to lie in wait and ambush whatever prey came by.", p: "behavior", s: ["threat", "habitat"], src: FR_REM },
    { t: "The Glacier of the White Worm lingered on separately from the Great Glacier, and reached much farther south than its altitude warranted.", p: "landmark", s: ["habitat", "origin"], src: FR_GWW },
    { t: "Local legends held that the glacier was maintained by fell magic, and the hunters of Maskyr's Eye warned of an unnatural cold beyond Mount Aergurl.", p: "legend", s: ["landmark", "people"], src: FR_GWW },
    { t: "Sages of the mid-to-late 14th century DR theorized that potent cold-based magic, or some other force, might be the cause of it.", p: "legend", s: ["history", "people"], src: FR_GWW },
    { t: "They warned further of a sinister power at work upon or beneath the ice, and held that the very safety of Faerûn might depend on discovering the identity and the motive of that agency.", p: "legend", s: ["threat", "people"], src: FR_GWW },
    { t: "The glacier was home to a variety of pale, albino remorhaz found nowhere else, and it was these white worms that gave the place its name.", p: "habitat", s: ["nature", "landmark"], src: FR_GWW },
    { t: "Herds numbering a dozen or more could be seen roaming that ice.", p: "habitat", s: ["behavior", "landmark"], src: FR_GWW },
    { t: "The remorhazes there were said to be led by a giant-sized king worm that laired in the very center of the glacier.", p: "legend", s: ["behavior", "structure"], src: FR_GWW },
    { t: "Adventurers also reported seeing — usually in retreat — unusual remorhazes whose heads were frilled with long, grasping tentacles.", p: "nature", s: ["behavior", "threat"], src: FR_GWW },
    { t: "Thanks to its former connection to the Great Glacier the place held a great many polar beasts besides, among them enormous and dangerous snow spiders.", p: "habitat", s: ["threat", "landmark"], src: FR_GWW },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 52 (31 Jul) — `icewinddale` COMPLETE at 9 of 9. Fourth region closed.
//
// 13 FACTS, THE SECOND-THINNEST ROW IN THE CORPUS, and honestly so. This is the fourth subject to
// draw on the Auril cluster, after the Codicil (her church, Grimskalle's halls), the Prophecy (the
// Rime), and Auril herself (the goddess). By the time it came round, Grimskalle's skull-and-crown,
// its ice gardens, its four wind-tablets and the collapse-if-she-dies rumour were all spoken for.
// What was left is genuinely Iskra's, plus the corners of the fortress nobody else needed.
//
// That is the cost of splitting one source cluster four ways, and it is the right cost to pay: four
// honest subjects at 21/19/13/20 beat three padded ones. `FR_GRM` and `FR_AUR` REUSED.
// ---------------------------------------------------------------------------------------
const FR_ISK = "forgottenrealms.fandom.com/wiki/Iskra";

export const FROSTMAIDEN_RELICS: LibrarySubject = {
  id: "frostmaiden_relics",
  label: "Auril's Roc / the Frostmaiden's relics",
  category: "object",
  facts: [
    { t: "Iskra was Auril's roc mount through the years of the Everlasting Rime.", p: "make", s: ["people", "power"], src: FR_ISK },
    { t: "The great bird was white.", p: "nature", s: ["make", "people"], src: FR_ISK },
    { t: "Stashed about the roc's nest were a silver dragon egg, an exotic wooden harp decorated with ivory and zircon, and an electrum chain hung with a pendant of bloodstone.", p: "make", s: ["legend", "power"], src: FR_ISK },
    { t: "The nest held besides a chest of gold pieces, a golden ring set with a black pearl, and a spell scroll of mass cure wounds.", p: "make", s: ["power", "legend"], src: FR_ISK },
    { t: "To maintain the Everlasting Rime at all, Auril had to cast her nightly spell from Iskra's back.", p: "power", s: ["faith", "make"], src: FR_ISK },
    { t: "Iskra had a number of hostile encounters with the whale Angajuk, which left the latter scarred.", p: "nature", s: ["people", "threat"], src: FR_ISK },
    { t: "The roc nested atop the roof of Grimskalle itself.", p: "structure", s: ["landmark", "people"], src: FR_GRM },
    { t: "A number of ice mephits sat along the walls of that fortress like gargoyles.", p: "structure", s: ["nature", "landmark"], src: FR_GRM },
    { t: "A particularly intelligent giant walrus called Ukuma dwelled within its dungeon.", p: "people", s: ["nature", "structure"], src: FR_GRM },
    { t: "By the time Auril took up residence there, only one elderly frost giant named Ertgard remained in the place, and he dedicated himself to the Aurilian faith.", p: "faith", s: ["people", "structure"], src: FR_GRM },
    { t: "Sustaining so powerful a curse took a heavy toll upon the goddess, reducing her to a mortal form vulnerable to mighty adventurers.", p: "power", s: ["faith", "threat"], src: FR_AUR },
    { t: "Yet because she was ontologically a true goddess, she could not be permanently destroyed.", p: "faith", s: ["power", "legend"], src: FR_AUR },
    { t: "So long as she retained her earthly worshippers she could be reborn upon the next winter solstice, reclaiming her full divine power.", p: "faith", s: ["legend", "people"], src: FR_AUR },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 53 (31 Jul) — `avernus`, first of two. Bel, 18 facts. `FR_ZAR` and `FR_AVE` REUSED.
//
// The best villain material left in the corpus, and it is a betrayal story told from the OTHER
// side of the Dark Gift of Zariel (Batch 30). That row records her fall; this one records what the
// man she trusted did with it. The two subjects now bracket the same throne from either end.
// ---------------------------------------------------------------------------------------
const FR_BEL = "forgottenrealms.fandom.com/wiki/Bel";

export const BEL: LibrarySubject = {
  id: "bel",
  label: "Bel",
  category: "person",
  facts: [
    { t: "Bel was an archdevil of the Nine Hells who acted as Archduke of Avernus until he was supplanted by Zariel.", p: "governance", s: ["conflict", "origin"], src: FR_BEL },
    { t: "He was a military genius who specialized in misdirection and led with careful tactics, in contrast to his successor's berserker rage.", p: "character", s: ["conflict", "power"], src: FR_BEL },
    { t: "Unlike many another archdevil, Bel retained a resemblance to a pit fiend.", p: "nature", s: ["origin", "character"], src: FR_BEL },
    { t: "He appeared as a twelve-foot crimson-scaled colossus with massive bat-like wings, clawed extremities, and fangs that dripped a green, smoking venom.", p: "nature", s: ["threat", "make"], src: FR_BEL },
    { t: "Before he became Archduke of Avernus, Bel inhabited a fortress likely larger than any on the Prime Material Plane.", p: "structure", s: ["power", "origin"], src: FR_BEL },
    { t: "He actively — if subtly and deviously — attempted to sabotage Zariel's plans regarding Elturel and the Companion.", p: "intrigue", s: ["conflict", "people"], src: FR_BEL },
    { t: "One of the Tale Teeth of Dahlver-Nar, a magical collection of teeth each associated with a different legend, was called the Daughters of Bel.", p: "make", s: ["legend", "people"], src: FR_BEL },
    { t: "It was a green steel pit fiend fang that allowed its wielder to summon a pit fiend — or, implanted in the wielder's own mouth, to cast dominate monster once a day, at the cost of constantly reeking of sulfur.", p: "make", s: ["power", "threat"], src: FR_BEL },
    { t: "At some point Bel managed to defeat Zariel and take her place as Archduke of Avernus.", p: "conflict", s: ["governance", "intrigue"], src: FR_ZAR },
    { t: "Through his tactical genius he had become her faithful right hand — and Zariel had made one crucial mistake: she came to trust him.", p: "intrigue", s: ["character", "allies"], src: FR_ZAR },
    { t: "By some unknown method, possibly learnt from the tanar'ri, he imprisoned the forlorn lord within his Bronze Citadel, siphoning her power away to increase his own infernal abilities.", p: "power", s: ["intrigue", "structure"], src: FR_ZAR },
    { t: "She was tortured constantly by abishai servants of Bel, who carved off pieces of her flesh to feed to their master, and did so for several centuries.", p: "threat", s: ["power", "people"], src: FR_ZAR },
    { t: "Asmodeus had allowed Bel to rule so long as he kept fighting the Blood War — and did so partly in the knowledge that the war would keep him too busy to scheme against his peers.", p: "governance", s: ["intrigue", "conflict"], src: FR_ZAR },
    { t: "It was possible that Asmodeus had been the one truly behind Zariel's defeat, and that rather than publicly demote her he simply put the Dark Eight in charge.", p: "intrigue", s: ["governance", "legend"], src: FR_ZAR },
    { t: "The ruler of Avernus was titled the Lord of the First.", p: "governance", s: ["structure", "origin"], src: FR_AVE },
    { t: "Bel himself was a pit fiend general out of Dis, the second layer.", p: "origin", s: ["people", "conflict"], src: FR_AVE },
    { t: "While he ruled, Bel dwelled in his own fortress at the center of the Bronze Citadel.", p: "structure", s: ["governance", "people"], src: FR_AVE },
    { t: "Demoted by Asmodeus in the end, he was made advisor to the very lord he had deposed, while Zariel took up residence in a soaring basalt citadel of her own.", p: "governance", s: ["allies", "structure"], src: FR_AVE },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 53 (31 Jul) — `avernus` COMPLETE at 8 of 8. Fifth region closed.
//
// This row was flagged in B-60 as likely rules text and thin. Measured, it is neither: FR carries
// the mechanism on `Infernal contract`, an IN-UNIVERSE guidebook on `Infernal Contracts and
// Bargains`, and the baatezu's soul-bargaining rights on `Afterlife`. **Fourth time this session a
// row was suspected thin on its name and proved otherwise.**
//
// The guidebook's warning anecdote is restated in the Exchange's own words, never quoted.
// ---------------------------------------------------------------------------------------
const FR_INC = "forgottenrealms.fandom.com/wiki/Infernal_contract";
const FR_ICB = "forgottenrealms.fandom.com/wiki/Infernal_Contracts_and_Bargains";
const FR_AFT = "forgottenrealms.fandom.com/wiki/Afterlife";

export const INFERNAL_CONTRACTS: LibrarySubject = {
  id: "infernal_contracts",
  label: "The Infernal Contracts of Avernus",
  category: "object",
  facts: [
    { t: "An infernal contract was a binding agreement between one individual and a devil of the Nine Hells.", p: "make", s: ["governance", "trade"], src: FR_INC },
    { t: "It typically involved the devil granting a significant boon or gift, and the contractee owing a specific debt to the fiend in return.", p: "trade", s: ["governance", "power"], src: FR_INC },
    { t: "Contracts varied a great deal in their form and appearance.", p: "make", s: ["structure", "legend"], src: FR_INC },
    { t: "One devil might require the bound party only to sign upon a parchment, while another might dictate that some act of depravity be performed.", p: "make", s: ["threat", "people"], src: FR_INC },
    { t: "In some instances the contractors required witness by designated infernal contract notaries.", p: "governance", s: ["people", "structure"], src: FR_INC },
    { t: "Once devil and agreeing party had each entered into it willingly, the boon was bestowed and its beneficiary indebted to pay a pre-specified price.", p: "trade", s: ["power", "governance"], src: FR_INC },
    { t: "If the contractee proved unwilling, or became otherwise unable to fulfill their end of the bargain, they suffered one or more penalties as the contract itself laid out.", p: "threat", s: ["governance", "trade"], src: FR_INC },
    { t: "Customary penalties included the forfeiture of all owned material wealth, the unwilling adoption of one or more fiendish physical characteristics, or the transference of one's mortal soul to the offended party.", p: "threat", s: ["power", "people"], src: FR_INC },
    { t: "An infernal contract could be voided, so long as both parties agreed to it.", p: "governance", s: ["trade", "intrigue"], src: FR_INC },
    { t: "Under those circumstances the devil and the contractee each continued on with their existences as though the contract had never existed at all.", p: "governance", s: ["intrigue", "power"], src: FR_INC },
    { t: "Devils often requested significant compensation before agreeing to nullify one.", p: "trade", s: ["intrigue", "character"], src: FR_INC },
    { t: "Such compensation often ran to the endowment of great personal wealth, one or more soul coins, or extremely powerful artifacts.", p: "trade", s: ["make", "power"], src: FR_INC },
    { t: "Contracts that were not fully ratified could be broken by other supernatural means, though the exact specifications of this were unclear.", p: "intrigue", s: ["power", "structure"], src: FR_INC },
    { t: "Infernal Contracts and Bargains was a guide dedicated to which contracts and which devils were most compatible with one another, penned and published sometime before the late 15th century DR.", p: "make", s: ["legend", "people"], src: FR_ICB },
    { t: "The book warned its readers of the dangerous nature of such agreements, and advised the utmost vigilance in dealing with the creatures of the lower planes, since they were prone to twisting and misinterpreting the wishes of mortals.", p: "legend", s: ["threat", "character"], src: FR_ICB },
    { t: "Its author told of a man who asked a devil of Dispater for ultimate protection against his enemies, and was duly transported into an impregnable iron fortress deep underground — one built without any doors.", p: "legend", s: ["threat", "structure"], src: FR_ICB },
    { t: "The same author recommended dealing with the devils of Minauros for contracts concerning money, and those of Phlegethos for contracts concerning pain and pleasure.", p: "trade", s: ["legend", "people"], src: FR_ICB },
    { t: "The baatezu held an agreement that allowed them one final chance to bargain with souls.", p: "faith", s: ["governance", "origin"], src: FR_AFT },
    { t: "They were forbidden to injure or deceive the waiting souls in any way, but were permitted to offer them bargains — to reject the patron they had worshiped in life, in exchange for special benefits within the Nine Hells.", p: "faith", s: ["intrigue", "people"], src: FR_AFT },
    { t: "What the baatezu really wanted was more souls with which to make lemures, the form of devil from which all the more powerful kinds develop, and so to build the strength of their infernal armies.", p: "faith", s: ["origin", "nature"], src: FR_AFT },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 54 (31 Jul) — `baldursgate`, first of two. The Outer City, 20 facts. `FR_BG` REUSED, and
// `FR_RIV` is already the River Dessarin, so Rivington takes `FR_RVG`.
// ---------------------------------------------------------------------------------------
const FR_OC = "forgottenrealms.fandom.com/wiki/Baldur's_Gate/Outer_City";
const FR_RVG = "forgottenrealms.fandom.com/wiki/Baldur's_Gate/Rivington";
const FR_WYC = "forgottenrealms.fandom.com/wiki/Wyrm's_Crossing";
const FR_TW = "forgottenrealms.fandom.com/wiki/Trade_Way";

export const OUTER_CITY: LibrarySubject = {
  id: "outer_city",
  label: "The Outer City",
  category: "location",
  facts: [
    { t: "The Outer City of Baldur's Gate was the near-lawless, impoverished expanse lying outside the city walls.", p: "landmark", s: ["people", "governance"], src: FR_OC },
    { t: "It was an unorganized collection of objectionable but necessary business-owners, livestock handlers, refugees and other undesirables, relegated to muddy streets and ramshackle structures beyond the districts of the Upper and Lower City.", p: "people", s: ["trade", "structure"], src: FR_OC },
    { t: "Its streets were scattered across the three entrances into the city — the Cliffgate, and the Black Dragon and Basilisk gates.", p: "structure", s: ["landmark", "trade"], src: FR_OC },
    { t: "The great many huts, lean-tos, animal paddocks and other makeshift structures continued down a portion of the Coast Way, across the bridge of Wyrm's Crossing and the River Chionthar, to the region's southernmost district.", p: "structure", s: ["landmark", "people"], src: FR_OC },
    { t: "Overland travellers nearing Baldur's Gate have been known to smell the city before ever they clap eyes upon it.", p: "people", s: ["legend", "trade"], src: FR_OC },
    { t: "Day and night blended together throughout the lean-tos, stockyards and other shacks that lined the Outer City's muddy streets.", p: "people", s: ["structure", "character"], src: FR_BG },
    { t: "The animal-handlers, merchant-hawkers and other outsiders were taxed and technically ruled over by the Grand Dukes, yet city officials did little to truly govern the place.", p: "governance", s: ["trade", "intrigue"], src: FR_BG },
    { t: "It held nine districts, most of them encircling Dusthawk Hill: Blackgate, Stonyeyes, Norchapel, Little Calimshan, Whitkeep, Sow's Foot, Twin Songs, Tumbledown and Rivington.", p: "structure", s: ["landmark", "governance"], src: FR_BG },
    { t: "Stonyeyes was the first neighborhood extending out from the Trade Way just beyond the Basilisk Gate, and was noteworthy for its large half-orc population.", p: "people", s: ["landmark", "origin"], src: FR_OC },
    { t: "The insular, walled neighborhood of Little Calimshan was completely enveloped by the stretch of Outer City running from the Basilisk Gate to Wyrm's Crossing.", p: "structure", s: ["people", "landmark"], src: FR_OC },
    { t: "Tumbledown lay just beyond the Cliffgate, which along with the outer wall separated it from the Lower City district of Brampton.", p: "landmark", s: ["structure", "conflict"], src: FR_OC },
    { t: "It held one of the city's celebrated statues, Balduran Looks Out to Sea, and the Szarr Family Crypts besides.", p: "make", s: ["legend", "landmark"], src: FR_OC },
    { t: "Rivington was the southernmost district of Baldur's Gate, and the only part of the Outer City standing on the southern shore of the River Chionthar, beyond Wyrm's Crossing.", p: "landmark", s: ["structure", "origin"], src: FR_RVG },
    { t: "From Rivington the Trade Way led south toward the Lands of Intrigue and Calimshan.", p: "trade", s: ["landmark", "origin"], src: FR_RVG },
    { t: "A local guild called the Rivington Rats plagued that neighborhood through the late 15th century DR.", p: "intrigue", s: ["people", "threat"], src: FR_RVG },
    { t: "Smugglers frequented the district too, running goods upriver to Brampton by water.", p: "intrigue", s: ["trade", "threat"], src: FR_RVG },
    { t: "Wyrm's Crossing was a double-bridge structure spanning the River Chionthar along the Trade Way, and unlike most bridges in the Realms it housed a number of buildings — enough that it was once counted a district of the Outer City in its own right.", p: "structure", s: ["landmark", "trade"], src: FR_WYC },
    { t: "The two great stone arches were joined by Wyrm's Rock, the massive Flaming Fist fortress that rose out of the islet at the center of the river.", p: "structure", s: ["conflict", "governance"], src: FR_WYC },
    { t: "Wooden drawbridges extended from either side of that fortress, and could be raised or lowered to halt foot-and-cart traffic, or to let tall ships pass beneath.", p: "governance", s: ["structure", "trade"], src: FR_WYC },
    { t: "From the north the Trade Way passed through the Blackgate district, which serviced those travelling to and from Waterdeep, and there traders were forced to stable their pack animals while their goods were transferred to another conveyance for the journey through the city.", p: "trade", s: ["governance", "people"], src: FR_TW },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 54 (31 Jul) — `baldursgate` COMPLETE at 8 of 8. Sixth region closed.
//
// SCOPE: Mizora (Batch 31) already carries the Wyll story — the pact, the eye, the devil standing
// beside Ulder's son. This row is aimed instead at the man's career, the Flaming Fist, and how
// Baldur's Gate is actually governed. Aimed rather than checked afterward, per B-56.
// ---------------------------------------------------------------------------------------
const FR_ULD = "forgottenrealms.fandom.com/wiki/Ulder_Ravengard";
const FR_FF = "forgottenrealms.fandom.com/wiki/Flaming_Fist";

export const ULDER_RAVENGARD: LibrarySubject = {
  id: "ulder_ravengard",
  label: "Ulder Ravengard",
  category: "person",
  facts: [
    { t: "Grand Duke Ulder Ravengard was a lifelong soldier of the Flaming Fist who ascended to the rank of Marshal, and served on the Council of Four of Baldur's Gate in the late 15th century DR.", p: "governance", s: ["people", "origin"], src: FR_ULD },
    { t: "As a commander he was a true warrior at heart, and always took quick and relentless action in battle.", p: "character", s: ["conflict", "people"], src: FR_ULD },
    { t: "He was highly disciplined and precise in all his actions, and possessed great martial acuity.", p: "character", s: ["conflict", "make"], src: FR_ULD },
    { t: "His preferred weapon of choice was a bastard sword.", p: "make", s: ["conflict", "character"], src: FR_ULD },
    { t: "The Flaming Fist was a mercenary company based in Baldur's Gate, whose members served as the guards of the city.", p: "governance", s: ["people", "trade"], src: FR_FF },
    { t: "The company operated under a strict military hierarchy.", p: "structure", s: ["governance", "conflict"], src: FR_FF },
    { t: "As of the Year of the Serpent, 1358 DR, the Flaming Fist stood some two thousand soldiers strong.", p: "conflict", s: ["structure", "history"], src: FR_FF },
    { t: "Through the mid-15th century DR Grand Duke Abdel Adrian served as Marshal of the Flaming Fist, until his death in the Year of the Narthex Murders, 1482 DR.", p: "history", s: ["governance", "people"], src: FR_FF },
    { t: "Two of the city's Grand Dukes were slain in gruesome fashion, at large public gatherings, within the span of a single decade.", p: "threat", s: ["governance", "history"], src: FR_FF },
    { t: "In 1482 DR the city's beloved Grand Duke and Marshal was thrown into a horrific battle with the only other remaining Bhaalspawn, each of them a remnant of the century-long Avatar Crisis.", p: "conflict", s: ["threat", "legacy"], src: FR_FF },
    { t: "The Grand Duke was slain in public in the Wide, and a terrible monster was let loose upon the onlooking crowd of Baldurians.", p: "threat", s: ["people", "legacy"], src: FR_FF },
    { t: "Ravengard succeeded him as Marshal, and ascended to the office of Grand Duke of Baldur's Gate within the decade.", p: "governance", s: ["origin", "history"], src: FR_FF },
    { t: "After his promotion he served as the representative of Baldur's Gate and of the Flaming Fist at the Council of Waterdeep, to deal with the emerging threat of the Cult of the Dragon and the possible appearance of Tiamat in the Realms.", p: "governance", s: ["intrigue", "conflict"], src: FR_FF },
    { t: "The criminal organization known as the Guild ran its operations throughout the Lower and Outer Cities unchecked, infiltrating the Fist with its own operatives, and even clashing with the local vigilante groups.", p: "intrigue", s: ["threat", "people"], src: FR_FF },
    { t: "The Flaming Fist suffered a great loss when it became apparent that Marshal Ravengard had been in Elturel on a diplomatic mission at the moment of its descent.", p: "conflict", s: ["intrigue", "history"], src: FR_FF },
    { t: "He survived that horrific ordeal — and then he and some members of his retinue were abducted by cultists of the Absolute on the road back to Baldur's Gate.", p: "threat", s: ["intrigue", "people"], src: FR_FF },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 55 (31 Jul) — `barovia`. FIRST SUBJECT SOURCED OUTSIDE forgottenrealms.fandom.com.
//
// Frank's ruling (B-62/B-63): adopt **Mistipedia** (fraternityofshadows.com/wiki), the Fraternity of
// Shadows' Ravenloft wiki, scoped to `barovia`. The FR wiki has NO Madam Eva article — she is a
// Ravenloft native who never enters Faerûn, so the Realms wiki covers her only in passing. Mistipedia
// carries her in depth and marks the section as canon from officially published sources.
//
// CONSTANT PREFIX `MP_` rather than `FR_`, so a non-Realms source is visible at a glance in the file.
// The ledger's well-formed-path rule already accepts `host/wiki/Page`, so no harness change was needed.
//
// CONTINUITY: Mistipedia carries a separate `Madame Eva (Expedition to Castle Ravenloft)` page where
// she is an annis hag. Nothing from it is used — one continuity per subject, and the corpus follows
// the line that AL play uses.
//
// DATING: this subject reckons in BC, the Barovian calendar, throughout. That is deliberate and
// self-consistent: a Barovian source dates in BC as a Faerûnian source dates in DR, and mixing the
// two inside one paragraph would read as broken. No fact here carries a DR date.
// ---------------------------------------------------------------------------------------
const MP_EVA = "fraternityofshadows.com/wiki/Madame_Eva";

export const MADAM_EVA: LibrarySubject = {
  id: "madam_eva",
  label: "Madam Eva",
  category: "person",
  facts: [
    { t: "Madame Eva is the legendary raunie of the Zarovan Tribe.", p: "people", s: ["governance", "legend"], src: MP_EVA },
    { t: "She was the first raunie in the Land of Mists, having brought her people there at the stroke of midnight leading into the New Year of 470 BC.", p: "origin", s: ["legend", "people"], src: MP_EVA },
    { t: "There in Barovia she formed an alliance with Count Strahd, which has linked the Vistani to that land and to him ever since.", p: "allies", s: ["governance", "origin"], src: MP_EVA },
    { t: "Since that time she has seldom taken direct action to alter the flow of history, serving instead as advisor, as seer, and — to Strahd — as informant.", p: "governance", s: ["intrigue", "character"], src: MP_EVA },
    { t: "She gave her people's service to Strahd as spies and informants, in return for protected travel through Barovia and the knowledge of making potions that serve as antidotes to Strahd's Choking Fog.", p: "intrigue", s: ["allies", "make"], src: MP_EVA },
    { t: "Madame Eva is an enigma: as one of the Zarovan, she exists in non-linear time.", p: "legend", s: ["power", "character"], src: MP_EVA },
    { t: "She has always appeared as an old crone — at least since her entrance into the Demiplane of Dread.", p: "character", s: ["legend", "people"], src: MP_EVA },
    { t: "Her exact age remains a mystery even to her own blood relatives.", p: "character", s: ["people", "legend"], src: MP_EVA },
    { t: "That separation from time allows her to be met anywhere in Ravenloft's timeline, despite her death in 496 BC.", p: "power", s: ["legend", "history"], src: MP_EVA },
    { t: "In 496 BC a vain young thief named Jacqueline Montarri came to Madame Eva's camp, demanding the secret of staying forever young and beautiful.", p: "people", s: ["threat", "intrigue"], src: MP_EVA },
    { t: "Eva surrendered an answer only at knife-point: that what Montarri sought was to be found in Castle Ravenloft.", p: "intrigue", s: ["threat", "structure"], src: MP_EVA },
    { t: "Satisfied with the answer, Montarri cut Eva's throat and left her to bleed out.", p: "threat", s: ["people", "conflict"], src: MP_EVA },
    { t: "Eva had her revenge when Montarri was caught and beheaded.", p: "conflict", s: ["threat", "history"], src: MP_EVA },
    { t: "The Vistani took the thief's corpse and cursed it, leaving Montarri resurrected into a cursed immortality with the wrinkled head of Madame Eva bound to her neck in place of her own.", p: "make", s: ["threat", "power"], src: MP_EVA },
    { t: "Lacking her own head, Montarri has ever since been obliged to continually swap out new ones to keep her vibrant beauty.", p: "threat", s: ["make", "character"], src: MP_EVA },
    { t: "In the years leading up to the Grand Conjunction of 740 BC, Eva called upon the Tribe of Hyskosa to slay the first dukkar — Hyskosa himself — in order to prevent that catastrophe.", p: "governance", s: ["conflict", "faith"], src: MP_EVA },
    { t: "For their failure, or their unwillingness, she cursed the entire family and exiled them from the grace the rest of the Vistani hold, and from their bond to the Land of Mists.", p: "power", s: ["governance", "conflict"], src: MP_EVA },
    { t: "A second dukkar, a half-fiend named Malocchio Aderre, emerged in the autumn of 747 BC, his unique parentage letting him violate the borders of any domain — even Ravenloft itself — by teleportation.", p: "origin", s: ["threat", "power"], src: MP_EVA },
    { t: "Madame Eva called her people together to create an artifact called the Sphere of Binding, which laid a curse upon Malocchio and bound him within Invidia.", p: "make", s: ["faith", "governance"], src: MP_EVA },
    { t: "In 475 BC her grandson Petya brought Jander Sunstar to the Tser Camp; detecting his vampire nature, Eva forbade him ever to return and marked him a foe of her people should they meet again.", p: "allies", s: ["people", "threat"], src: MP_EVA },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 55 (31 Jul) — `barovia` COMPLETE at 8 of 8. Seventh region closed.
//
// THE ROW THAT ALMOST DID NOT HAPPEN, and the line that made it possible. The Tarokka's *substance*
// is the contents of a published product — 54 cards, the High Deck's names, what each one means, the
// spread diagrams. None of that appears here, and no wiki would have made it acceptable. What DOES
// appear is the TRADITION around the cards and the histories of particular decks: how a reading is
// built, that the old authorities disagree about it, whose deck was whose, and what was done with
// them. That is lore, and it is fair game.
//
// **Not one card is named except the two missing from Rozaleen's deck** — a fact about a damaged
// artifact, not an index of the product.
//
// Mixed sourcing: FR carries the tarokka only as passing mentions (Ezmerelda's belongings, the Gypsy
// page, Minsc's reading), and those mentions are genuinely good facts. Mistipedia carries the rest.
// ---------------------------------------------------------------------------------------
const MP_TAR = "fraternityofshadows.com/wiki/Category:Tarokka_Deck_(Item)";
const MP_ROZ = "fraternityofshadows.com/wiki/Rozaleen's_Tarokka_Deck";
const MP_MAE = "fraternityofshadows.com/wiki/Maekon";
const MP_TDE = "fraternityofshadows.com/wiki/The_Tarokka_Deck_of_Madame_Eva";
const MP_SYB = "fraternityofshadows.com/wiki/Sybil_Raisa";
const MP_VIT = "fraternityofshadows.com/wiki/Vito_Romenza";
const FR_EZM = "forgottenrealms.fandom.com/wiki/Ezmerelda_d'Avenir";
const FR_GYP = "forgottenrealms.fandom.com/wiki/Gypsy";
const FR_VIS = "forgottenrealms.fandom.com/wiki/Vistani";

export const TAROKKA_DECK: LibrarySubject = {
  id: "tarokka_deck",
  label: "The Tarokka Deck",
  category: "object",
  facts: [
    { t: "A tarokka deck is the traditional deck of fortune-telling cards used by the Vistani.", p: "make", s: ["people", "legend"], src: MP_TAR },
    { t: "A reading begins by choosing a focus card to stand for the subject of the reading.", p: "make", s: ["power", "structure"], src: MP_TAR },
    { t: "The other cards are then laid out around that focus in one of several patterns.", p: "structure", s: ["make", "power"], src: MP_TAR },
    { t: "Each position within a pattern carries its own meaning with respect to the focus card, and every card bears several symbolic connotations at once.", p: "structure", s: ["legend", "power"], src: MP_TAR },
    { t: "The reader must analyse that symbolism and build a reading out of it; the cards do not speak plainly for themselves.", p: "people", s: ["character", "power"], src: MP_TAR },
    { t: "The old authorities disagree about what the positions in the basic cross even mean, which suggests each Vistana may simply have a style of their own.", p: "legend", s: ["people", "history"], src: MP_TAR },
    { t: "Ezmerelda d'Avenir kept her own deck in a small wooden box, wrapped in silk.", p: "make", s: ["people", "structure"], src: FR_EZM },
    { t: "Gypsies and Vistani alike were known for fortune-telling and soothsaying, often charging a price for the service, and often working from decks of cards — a tarokka deck among them.", p: "people", s: ["make", "legend"], src: FR_GYP },
    { t: "On their first day in Barovia a company of heroes stumbled upon the caravan of Madame Eva, and she told Minsc his fortune with the tarokka, foretelling failure to rid that realm of its evil.", p: "legend", s: ["people", "threat"], src: FR_VIS },
    { t: "The reading sent the barbarian into a rage: he smashed Madame Eva's table and stormed out of her tent, leaving his ally Shandie Freefoot to pay for the damages.", p: "character", s: ["people", "conflict"], src: FR_VIS },
    { t: "Rozaleen's deck, though it was missing two of its cards, had the power to grant divination even to those who were not of Vistani blood.", p: "power", s: ["make", "people"], src: MP_ROZ },
    { t: "In the hands of a full-blooded Vistani that same deck could be used not merely to foretell a person's future, but to play a hand in shaping it.", p: "power", s: ["intrigue", "legend"], src: MP_ROZ },
    { t: "Rozaleen was a captive Vistani girl brought to the manor of the Ashington family, where Lord Ashington insisted she perform a fortune telling for the evening's entertainment.", p: "people", s: ["threat", "conflict"], src: MP_MAE },
    { t: "She could produce no reading at all from the deck that night.", p: "threat", s: ["power", "character"], src: MP_MAE },
    { t: "Lord Ashington murdered her for it — and before she died she bound the manor and her tormentors with the Ashington Curse, made all the more powerful by her magical tarokka deck.", p: "threat", s: ["conflict", "make"], src: MP_MAE },
    { t: "Madame Eva's own deck passed down to Isabella Aderre, and came at last to Gabrielle Aderre, who took it from her mother's belongings after leaving her to die.", p: "origin", s: ["people", "intrigue"], src: MP_TDE },
    { t: "Sybil Raisa was a fortune teller of the Gur, a people of Faerûn who resemble the Vistani, and she possessed a version of the Sight.", p: "people", s: ["origin", "power"], src: MP_SYB },
    { t: "She could not only read the tarokka but hold a ritual that created a visionary experience shared among several people at once.", p: "power", s: ["faith", "people"], src: MP_SYB },
    { t: "Vito Romenza was skilled at reading the tarokka to predict the future, and had besides a rarer gift — tracking the direction of an object's owner by spinning that object about on a string.", p: "people", s: ["power", "make"], src: MP_VIT },
    { t: "A male Vistani with the power of foresight would be one of the dukkar, and such are normally put to death, since prophecy holds that a dukkar dooms the Vistani people.", p: "governance", s: ["threat", "faith"], src: MP_VIT },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 56 (31 Jul) — `chult`, first of two. The Tomb of the Nine Gods relics, 20 facts.
// Interlocks Ras Nsi (Batch 39) — Acererak recruited his yuan-ti to guard the Tomb's entrance —
// and Yuan-ti, both already sourced.
//
// The Acererak page carries a quoted taunt in his own voice. Not reproduced.
// ---------------------------------------------------------------------------------------
const FR_TNG = "forgottenrealms.fandom.com/wiki/Tomb_of_the_Nine_Gods";
const FR_SLM = "forgottenrealms.fandom.com/wiki/Soulmonger";
const FR_DCU = "forgottenrealms.fandom.com/wiki/Death_curse";
const FR_OMU = "forgottenrealms.fandom.com/wiki/Omu";
const FR_ACE = "forgottenrealms.fandom.com/wiki/Acererak";

export const TOMB_NINE_GODS: LibrarySubject = {
  id: "tomb_nine_gods",
  label: "The Tomb of the Nine Gods relics",
  category: "object",
  facts: [
    { t: "The Tomb of the Nine Gods was a sprawling dungeon complex beneath the ruined city of Omu in Chult, housing the remains of that city's nine trickster gods.", p: "structure", s: ["landmark", "origin"], src: FR_TNG },
    { t: "It was built by the lich Acererak with the specific purpose of killing any intruder who dared venture within.", p: "structure", s: ["threat", "make"], src: FR_TNG },
    { t: "The souls of those unfortunate dead were used to power the Soulmonger — a horrifying machine that spawned the death curse upon Toril, and was meant to give birth to a new god of death.", p: "make", s: ["power", "faith"], src: FR_TNG },
    { t: "The Tomb's lowest level was called the Cradle of the Death God.", p: "structure", s: ["faith", "threat"], src: FR_TNG },
    { t: "Its first chamber housed the lair of the Sewn Sisters, the coven of night hags who aided Acererak in his plot to birth a new god of death.", p: "people", s: ["faith", "threat"], src: FR_TNG },
    { t: "Five smaller chambers linked to the hags' den, each holding one of a series of sick games and trials.", p: "structure", s: ["threat", "intrigue"], src: FR_TNG },
    { t: "The completion of every trial was required to reveal the secrets of the massive Skeleton Gate, which sealed the nursery of the atropal.", p: "structure", s: ["power", "intrigue"], src: FR_TNG },
    { t: "Five humanoid-sized skeleton keys, each bearing geometric figures formed from their own skulls, were scattered through the first five levels of the Tomb, and were used to unlock the barriers of that gate.", p: "make", s: ["structure", "intrigue"], src: FR_TNG },
    { t: "The Soulmonger itself was an immensely powerful magical artifact, constructed by the demilich Acererak.", p: "make", s: ["power", "origin"], src: FR_SLM },
    { t: "To protect both the atropal and the Soulmonger, the two were placed together on the lowest level of the Tomb.", p: "structure", s: ["power", "threat"], src: FR_SLM },
    { t: "Once it was activated and inflicting the death curse across the world, it was watched over by the Sewn Sisters while Acererak kept his eye upon it from afar.", p: "people", s: ["intrigue", "power"], src: FR_SLM },
    { t: "It was destroyed at last and shattered into pieces, when a company of adventurers made their way through the tomb and defeated Acererak.", p: "conflict", s: ["make", "legend"], src: FR_SLM },
    { t: "The death curse prevented the raising of the dead even by resurrection magic, and caused creatures that had previously been raised from death to wither and die.", p: "threat", s: ["power", "faith"], src: FR_DCU },
    { t: "Its main effect was that the soul of any creature who died on Toril instantly disappeared, and after some time was destroyed altogether.", p: "threat", s: ["faith", "people"], src: FR_DCU },
    { t: "Acererak had built the tomb a century beforehand for the purpose of luring, traumatizing, and absorbing the souls of adventurers, to feed his own phylactery.", p: "origin", s: ["threat", "history"], src: FR_DCU },
    { t: "Intrigued by the promise of a nearly endless supply of souls, the Sewn Sisters agreed to help nurture the atropal to godhood, and assisted in the crafting of the Soulmonger.", p: "people", s: ["faith", "intrigue"], src: FR_DCU },
    { t: "As he departed, Acererak recruited the yuan-ti of Omu, led by Ras Nsi, to guard the entrance to the Tomb — promising in exchange to aid them in releasing their god Dendar from her prison beneath Chult.", p: "governance", s: ["conflict", "faith"], src: FR_DCU },
    { t: "Omu had been built atop rich veins of minerals and gems, and in its early days prospered by mining and commerce, its jewelry valued far and wide.", p: "trade", s: ["origin", "landmark"], src: FR_OMU },
    { t: "The lich forced the Omuans to construct that murderous dungeon beneath their own city, then slaughtered those who remained and sealed their fates alongside those of their gods.", p: "history", s: ["conflict", "people"], src: FR_OMU },
    { t: "Acererak was a powerful lich, or demilich, known and feared by many throughout the multiverse, and he came to Toril in the late 1480s DR for the sole purpose of placing the Soulmonger.", p: "origin", s: ["legend", "power"], src: FR_ACE },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 56 (31 Jul) — `chult` COMPLETE at 8 of 8. Eighth region closed.
//
// The most CONNECTED row in the corpus. A subject about walking corpses reaches Menzoberranzan
// (drow shock troops, House Do'Urden raising its own dead), Skullport (a shop selling zombies
// controllable by a dead hand scepter), Undermountain (Wormbarrow's avolakias), and three sourced
// factions at once — the Emerald Enclave, the Order of the Gauntlet and the Flaming Fist, all
// failing together to contain the plague. Interlock arriving unbidden, again.
// ---------------------------------------------------------------------------------------
const FR_ZOM = "forgottenrealms.fandom.com/wiki/Zombie";
const FR_TZM = "forgottenrealms.fandom.com/wiki/Tyrannosaurus_zombie";
const FR_CHU = "forgottenrealms.fandom.com/wiki/Chult";

export const ZOMBIES_OF_CHULT: LibrarySubject = {
  id: "zombies_of_chult",
  label: "Zombies of Chult",
  category: "creature",
  facts: [
    { t: "A zombie was, at bottom, the corpse of a creature animated by someone able to manipulate negative energy — a cleric, for instance.", p: "nature", s: ["origin", "power"], src: FR_ZOM },
    { t: "Such a one could turn negative energy upon a corpse and make it move its body, its arms, its legs.", p: "power", s: ["nature", "make"], src: FR_ZOM },
    { t: "Zombies could also rise spontaneously, wherever an area was saturated with necromantic magic.", p: "origin", s: ["power", "habitat"], src: FR_ZOM },
    { t: "Some were raised after their bodies had been preserved, and appeared significantly less grotesque than the rest.", p: "nature", s: ["make", "origin"], src: FR_ZOM },
    { t: "In the 15th century DR the Jungles of Chult became home to hordes of zombies, created by Ras Nsi in his attempt to conquer the city of Mezro.", p: "history", s: ["conflict", "habitat"], src: FR_ZOM },
    { t: "With Mezro departing the Prime Material plane, those zombies simply remained — a plague upon the jungle.", p: "threat", s: ["habitat", "history"], src: FR_ZOM },
    { t: "Zombies were common shock troops among the drow of Menzoberranzan, House Do'Urden among them, which used fellow drow as its undead servants.", p: "society", s: ["conflict", "people"], src: FR_ZOM },
    { t: "They were a profitable business besides: Shradin's Excellent Zombies in Skullport offered zombies for purchase, controllable by means of a dead hand scepter.", p: "trade", s: ["people", "make"], src: FR_ZOM },
    { t: "Ten thousand zombies inhabited the so-called City of Zombies upon the 333rd layer of the Abyss, ruled over by the Zombie King.", p: "society", s: ["habitat", "governance"], src: FR_ZOM },
    { t: "Those rotting wrecks were victims of Orcus, and sought a true death that would end their torturous existence.", p: "faith", s: ["threat", "society"], src: FR_ZOM },
    { t: "The monstrous hamlet of Wormbarrow lay deep within Undermountain, inhabited by Ghaunadaur-worshiping avolakias and numerous undead, zombies among them.", p: "habitat", s: ["faith", "threat"], src: FR_ZOM },
    { t: "A tyrannosaurus zombie was a powerful zombie made from the corpse of a dead tyrannosaurus.", p: "nature", s: ["origin", "threat"], src: FR_TZM },
    { t: "Like all zombies they moved in an uneven way, and smelled of decay.", p: "nature", s: ["threat", "people"], src: FR_TZM },
    { t: "They often had their gullets filled with other zombies.", p: "nature", s: ["threat", "habitat"], src: FR_TZM },
    { t: "Like their living counterparts they attacked with a powerful bite and a devastating tail.", p: "threat", s: ["nature", "conflict"], src: FR_TZM },
    { t: "They could also regurgitate a few of the smaller zombies carried in those gullets.", p: "threat", s: ["nature", "make"], src: FR_TZM },
    { t: "In the late 15th century DR many forms of undead, zombies and tyrannosaurus zombies among them, were spreading through Chult like a plague — despite the efforts of the Emerald Enclave, the Order of the Gauntlet and the Flaming Fist to contain them.", p: "conflict", s: ["habitat", "governance"], src: FR_TZM },
    { t: "All of them were part of Ras Nsi's army of the undead, and were folded into it by Acererak.", p: "conflict", s: ["origin", "governance"], src: FR_TZM },
    { t: "Chult had always been remote and isolated, owing to its tall mountains and dense jungles full of savage beasts, massive dinosaurs, and debilitating disease.", p: "habitat", s: ["landmark", "threat"], src: FR_CHU },
    { t: "The plants there were intelligent predators, and the predators themselves were massive, and armed with huge teeth and claws.", p: "habitat", s: ["nature", "landmark"], src: FR_CHU },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 57 (31 Jul) — `dessarin`, first of two. 18 facts.
//
// The row's descriptor reads "the doom the four cults preached in the Sumber Hills", and the
// substance behind it turns out to be far older than the Dessarin cults: the Elder Elemental Eye is
// **Tharizdun**, an interloper god out of Oerth who made the Abyss and was imprisoned for it. The
// cults in the Sumber Hills are the most recent link in a chain that predates the Realms' own gods.
// The Elemental Weapons and Elementals rows hold the Dessarin end; this row holds the god.
// ---------------------------------------------------------------------------------------
const FR_THZ = "forgottenrealms.fandom.com/wiki/Tharizdun";
const FR_CEE = "forgottenrealms.fandom.com/wiki/Cult_of_the_Elder_Elemental_Eye";

export const ELDER_ELEMENTAL_EYE: LibrarySubject = {
  id: "elder_elemental_eye",
  label: "The Prophecy of the Elder Elemental Eye",
  category: "legend",
  facts: [
    { t: "Tharizdun, known also as the Chained God and as the Elder Elemental Eye, was a long-forgotten interloper god originating from Oerth, who sought to destroy all that is.", p: "faith", s: ["origin", "legend"], src: FR_THZ },
    { t: "During the Dawn War he created the Abyss, and for that act he was imprisoned by the gods.", p: "origin", s: ["power", "conflict"], src: FR_THZ },
    { t: "His followers have hoped ever since to set him free.", p: "faith", s: ["people", "power"], src: FR_THZ },
    { t: "He appeared as an amorphous, roiling pitch-blackness.", p: "nature", s: ["legend", "faith"], src: FR_THZ },
    { t: "He was not simply neutral evil: his evil transcended law and chaos altogether.", p: "nature", s: ["threat", "legend"], src: FR_THZ },
    { t: "The obyriths demanded that Tharizdun plant the seed of evil within the Astral Sea, promising him total dominion of that realm in exchange for his fealty.", p: "intrigue", s: ["origin", "power"], src: FR_THZ },
    { t: "Even within his madness he recognized that his fellow gods would turn upon him before he could seize the power the obyriths promised.", p: "intrigue", s: ["threat", "power"], src: FR_THZ },
    { t: "So instead the mad god travelled to the farthest reaches of the cosmos and planted that seed in a primordial expanse of the churning Elemental Chaos, which he hoped to take for his own.", p: "origin", s: ["power", "structure"], src: FR_THZ },
    { t: "The seed grew in time into the Abyss — and though the act gained him great power, the other gods of the multiverse set aside their differences long enough to imprison him for it.", p: "conflict", s: ["origin", "power"], src: FR_THZ },
    { t: "His true commands are unknown, but his cults teach that his power must be channeled to help him break his bonds, that his lost relics and shrines are to be sought out, and that the end of the world should be pursued in anticipation of him.", p: "faith", s: ["threat", "governance"], src: FR_THZ },
    { t: "In 1340 DR a cult of Tharizdun formed in western Chessenta.", p: "history", s: ["faith", "people"], src: FR_THZ },
    { t: "Something of him possessed Leheren, a member of the Firestorm Cabal, and created a secret order within that order, devoted to freeing Tharizdun and loosing him upon the continent of Faerûn.", p: "intrigue", s: ["governance", "faith"], src: FR_THZ },
    { t: "The Cult of the Elder Elemental Eye was dedicated to bringing that imprisoned god into Faerûn.", p: "faith", s: ["governance", "threat"], src: FR_CEE },
    { t: "The cult was related to the Church of All Tomorrows, an Oghman heresy which held that its followers ought to be able to foresee the future.", p: "faith", s: ["people", "legend"], src: FR_CEE },
    { t: "It first appeared in 1340 DR in Akanûl, when that country was still part of Chessenta, and was destroyed shortly afterward — possibly with the help of Mystra herself.", p: "history", s: ["conflict", "people"], src: FR_CEE },
    { t: "In 1479 DR the cult re-emerged and infiltrated the Firestorm Cabal in Airspur, when the demon and cult leader Murmur possessed the body of a high-ranking officer of that cabal.", p: "intrigue", s: ["people", "history"], src: FR_CEE },
    { t: "It used the vaults beneath the cabal's headquarters to practise its rituals, which included human sacrifice.", p: "threat", s: ["faith", "structure"], src: FR_CEE },
    { t: "The deva Demascus was assigned by Oghma to disrupt the cult's activities, and with several rogue allies he killed Murmur, and later Kalkan.", p: "conflict", s: ["people", "intrigue"], src: FR_CEE },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 57 (31 Jul) — `dessarin` COMPLETE at 8 of 8. Ninth region closed.
//
// Aerisi is the best-drawn villain in the whole Elemental Evil material, and the reason is that her
// apocalypse is a TANTRUM. A sheltered child who was denied nothing, brought at last into elven
// society, discovering that the world would not simply hand itself to her — and who answered that by
// finding a god's spear in a cave and deciding to be a queen. She does not think herself evil; she
// simply cannot empathize, so those who please her are good and those who defy her must be punished.
// ---------------------------------------------------------------------------------------
const FR_AER = "forgottenrealms.fandom.com/wiki/Aerisi_Kalinoth";
const FR_FGK = "forgottenrealms.fandom.com/wiki/Feathergale_Knights";
const FR_THU = "forgottenrealms.fandom.com/wiki/Thurl_Merosska";

export const AERISI_KALINOTH: LibrarySubject = {
  id: "aerisi_kalinoth",
  label: "Aerisi Kalinoth",
  category: "person",
  facts: [
    { t: "Aerisi Kalinoth was the Prophet of Air and the leader of the Cult of the Howling Hatred.", p: "governance", s: ["faith", "people"], src: FR_AER },
    { t: "Obsessed with the legends of the avariel, she used constant illusion magic and flying spells to appear as one of them.", p: "character", s: ["power", "legend"], src: FR_AER },
    { t: "Born Dara Algwynenn Kalinoth, she grew up in a remote castle in the Feywild, where she became enamored of tales of winged elves and often played at being one.", p: "origin", s: ["character", "legend"], src: FR_AER },
    { t: "Her parents sheltered her from the conflicts of the world and denied her nothing, catering to her every whim.", p: "origin", s: ["people", "character"], src: FR_AER },
    { t: "Only when they decided it was time for her to join the greater elven society, and brought her to Evereska, did they discover that years of pampering had made her a spoiled child who erupted into fits of rage whenever she could not have what she wanted.", p: "character", s: ["people", "conflict"], src: FR_AER },
    { t: "Skilled enchantress though she was, she was dismayed to find the other moon elves resistant to her charms.", p: "power", s: ["character", "people"], src: FR_AER },
    { t: "She began once more to envision herself as a winged elf — able to command the wind, to go wherever she pleased, and to dole out punishment upon any who offended her.", p: "character", s: ["power", "legend"], src: FR_AER },
    { t: "When her parents tried to discipline her, she unleashed her new powers against them and left Evereska behind.", p: "conflict", s: ["character", "people"], src: FR_AER },
    { t: "Her visions led her at length to a cavern deep beneath the Sumber Hills, where she found a magical spear called Windvane, imbued with the power of the primordial Yan-C-Bin, Prince of Evil Air.", p: "make", s: ["power", "faith"], src: FR_AER },
    { t: "Realizing that he was the figure who had been appearing in her dreams, she gave herself over to his worship.", p: "faith", s: ["legend", "power"], src: FR_AER },
    { t: "Changing her name to Aerisi, she used illusion magic to pass herself off as an avariel.", p: "character", s: ["make", "power"], src: FR_AER },
    { t: "Styling herself a queen, she went looking for subjects to rule over, and found them in the Cult of the Howling Hatred.", p: "governance", s: ["character", "people"], src: FR_AER },
    { t: "She used her talents for enchantment to sway mortals to her side, and filled the cult's ranks with zealots fiercely devoted to her.", p: "power", s: ["governance", "people"], src: FR_AER },
    { t: "The Feathergale Knights held themselves above the Howling Hatred cultists, whom they regarded as lunatic perverts.", p: "people", s: ["conflict", "faith"], src: FR_FGK },
    { t: "In truth they were deeply corrupted by Yan-C-Bin's influence, and each of them had committed so many crimes that they had earned the dislike of the very people they believed they were protecting.", p: "threat", s: ["people", "faith"], src: FR_FGK },
    { t: "The order was founded in Waterdeep by Thurl Merosska, who gathered about himself people of like mind from among that city's wealthy, and selected his knights one by one.", p: "origin", s: ["people", "governance"], src: FR_FGK },
    { t: "It was with reluctance that they pledged their loyalty to Aerisi Kalinoth.", p: "allies", s: ["governance", "conflict"], src: FR_FGK },
    { t: "In 1491 DR they established themselves at the Feathergale Spire in the Dessarin Valley, waiting for the right moment to summon Yan-C-Bin to Toril — until adventurers defeated them within that very spire.", p: "history", s: ["structure", "faith"], src: FR_FGK },
    { t: "Thurl had once been a griffon rider in Waterdeep, until a great storm very nearly killed him; after that he began to worship Yan-C-Bin.", p: "origin", s: ["faith", "history"], src: FR_THU },
    { t: "He gave Aerisi his loyalty only reluctantly, believing that one day he would use her and her minions to conquer Waterdeep itself.", p: "intrigue", s: ["allies", "governance"], src: FR_THU },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 58 (31 Jul) — `feywild`, creature row. Redcaps & Fey, 20 facts.
//
// The spine of this subject is the Fey page's classification by ORIGIN rather than by shape: some
// fey are bound to a place — dryads, naiads, oreads — and others are born from EMOTIONS felt in the
// Feywild, which is the group redcaps belong to. A creature that grows out of the ground where
// somebody committed a murder is a better monster than any stat block.
//
// Interlocks avernus: the Knucklebones Gang under Mad Maggie counted thirty madcaps.
// ---------------------------------------------------------------------------------------
const FR_RDC = "forgottenrealms.fandom.com/wiki/Redcap";
const FR_MDC = "forgottenrealms.fandom.com/wiki/Madcap";
const FR_FEY = "forgottenrealms.fandom.com/wiki/Fey";

export const REDCAPS_AND_FEY: LibrarySubject = {
  id: "redcaps_and_fey",
  label: "Redcaps & Fey",
  category: "creature",
  facts: [
    { t: "Redcaps wore heavy iron boots, leather pants, and the bright-red leather pointed caps for which they were named — caps always soaked in fresh blood.", p: "make", s: ["nature", "threat"], src: FR_RDC },
    { t: "In the late 15th century DR it was claimed that redcaps arose from the very earth, and were born out of bloodlust itself.", p: "origin", s: ["nature", "legend"], src: FR_RDC },
    { t: "At a place in the Feywild, or where that plane touched the Material at a fey crossing, if a sentient creature acted upon a powerful need for bloodshed and killed another, redcaps would appear where the blood had watered the soil.", p: "origin", s: ["habitat", "threat"], src: FR_RDC },
    { t: "The newborn resembled a small blood-stained mushroom with a red cap, just beginning to push out of the dirt.", p: "nature", s: ["origin", "habitat"], src: FR_RDC },
    { t: "When bathed in moonlight it leapt from the ground fully formed — armed, dressed, wearing its bloody cap, and already blood-crazed.", p: "nature", s: ["origin", "threat"], src: FR_RDC },
    { t: "Redcaps might be found all across Faerûn, but they were a particular threat in the halfling realm of Luiren through the 14th century DR.", p: "habitat", s: ["threat", "people"], src: FR_RDC },
    { t: "They kept a set of superstitions intricately interwoven with one another.", p: "society", s: ["character", "legend"], src: FR_RDC },
    { t: "In particular they held even numbers to be unlucky, and so would carry only odd numbers of coins, and form groups with an odd number of members.", p: "society", s: ["character", "make"], src: FR_RDC },
    { t: "A madcap was a redcap that had soaked its hat in demon ichor rather than the customary blood.", p: "nature", s: ["make", "origin"], src: FR_MDC },
    { t: "Such fey exhibited a more extreme version of their common counterparts' temperament.", p: "character", s: ["nature", "threat"], src: FR_MDC },
    { t: "Rather than falling unconscious, a madcap damaged past the point of fighting died in a burst of fire that rendered all but its boots and its weapon into ash.", p: "threat", s: ["nature", "make"], src: FR_MDC },
    { t: "The Knucklebones Gang, an Avernian gang led by Mad Maggie, counted thirty madcaps among its members.", p: "people", s: ["threat", "society"], src: FR_MDC },
    { t: "Fey were creatures out of the Feywild, a plane parallel to the Prime, which was also called the Plane of Faerie.", p: "habitat", s: ["nature", "origin"], src: FR_FEY },
    { t: "Many were typified by supernatural abilities and by a connection to nature, or else to some other force or place.", p: "nature", s: ["power", "habitat"], src: FR_FEY },
    { t: "The language of the fey was called Sylvan.", p: "people", s: ["society", "nature"], src: FR_FEY },
    { t: "There were a great many species of them, and connections between those species could be hard to identify beyond their all being natives of that plane.", p: "nature", s: ["habitat", "people"], src: FR_FEY },
    { t: "Some fey were strongly bound to particular natural places — water bodies, landmarks, other features of the land — among them dryads, hamadryads, nymphs, naiads, nereids, oreads and fossergrim.", p: "habitat", s: ["nature", "landmark"], src: FR_FEY },
    { t: "Others were reported to be born from emotions felt while in the Feywild, manifested by that plane's strange energy — redcaps, meenlocks, boggles and mites among them.", p: "origin", s: ["nature", "character"], src: FR_FEY },
    { t: "The gremlins were a diverse group of minuscule fey, descended from goblins transformed by fomorian rituals.", p: "origin", s: ["nature", "people"], src: FR_FEY },
    { t: "Stories of the fey went back eons, to the Days of Thunder — and some claimed that the leShay were one of the creator races, who had made or progenerated the many kinds of fey, perhaps including the elves themselves.", p: "legend", s: ["origin", "history"], src: FR_FEY },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 58 (31 Jul) — `feywild` COMPLETE at 8 of 8. Tenth region closed.
//
// B-64 IS WITHDRAWN. I declared this row unsourceable after fetching the `Fey` page — a taxonomy —
// and never checked `Feywild`, `Fey crossing` or `Cold iron`, all of which are substantial FR
// articles carrying exactly this material. Frank pushed back on the conclusion and was right.
//
// TWO SEPARATE ERRORS, worth distinguishing because only one of them was about copyright:
//  1. I said the 4e sourcebook material was "unusable". WRONG — facts are not copyrightable, only
//     expression is, and restating a fact in one's own words is what every wiki lawfully does and
//     what this corpus has done 1,865 times. The real constraint was never the facts; it was that
//     the `src` URL is recorded permanently, and citing a pirated scan in a codebase bound for
//     Wizards of the Coast is unacceptable regardless of the facts' status.
//  2. I concluded "no source exists" from ONE page. That is the fifth time this session I formed a
//     verdict before finishing the query.
//
// SCOPE NOTE: the row's descriptor is "why a promise binds harder here than anywhere". The subject
// answers it through the plane's own rules rather than through contract law — conditional crossings
// that open only at certain hours, distances that differ on the return trip, time that runs at its
// own rate, and cold iron whose boundaries fey cannot cross. In the Feywild the binding is
// geographic before it is moral.
// ---------------------------------------------------------------------------------------
const FR_FYW = "forgottenrealms.fandom.com/wiki/Feywild";
const FR_FXC = "forgottenrealms.fandom.com/wiki/Fey_crossing";
const FR_CIR = "forgottenrealms.fandom.com/wiki/Cold_iron";

export const FEY_BARGAINS: LibrarySubject = {
  id: "fey_bargains",
  label: "The Laws of Fey Bargains",
  category: "legend",
  facts: [
    { t: "The Feywild, called also the Plane of Faerie, was an echo of the Prime Material Plane, suffused with potent magic and with unrestrained emotion.", p: "habitat", s: ["origin", "power"], src: FR_FYW },
    { t: "It was the place from which the fey originated, and from which the first elves came to Faerûn.", p: "origin", s: ["habitat", "people"], src: FR_FYW },
    { t: "The plane was always bathed in the twilight of a setting — or perhaps a rising — sun.", p: "habitat", s: ["landmark", "nature"], src: FR_FYW },
    { t: "Navigating it was complicated by the fact that distances did not always make sense.", p: "structure", s: ["habitat", "power"], src: FR_FYW },
    { t: "Two landmarks might lie the same distance apart as they would on the Prime when travelled in one direction, and be inexplicably further or nearer on the return trip.", p: "structure", s: ["landmark", "power"], src: FR_FYW },
    { t: "Time did not flow in the Feywild as it flowed upon the Prime.", p: "power", s: ["habitat", "structure"], src: FR_FYW },
    { t: "Creatures could sometimes pass between the two planes at matching geographical locations, without needing to traverse the Astral Plane at all.", p: "structure", s: ["power", "landmark"], src: FR_FYW },
    { t: "Travel through a fey crossing was simple enough in itself: the traveler perceived themselves as arriving seamlessly from the one plane to the other.", p: "structure", s: ["people", "power"], src: FR_FXC },
    { t: "To anyone watching, the traveler simply appeared to vanish as they passed through.", p: "people", s: ["structure", "legend"], src: FR_FXC },
    { t: "The only fey crossings that stood always open were those in the deepest or most remote places in nature.", p: "landmark", s: ["habitat", "structure"], src: FR_FXC },
    { t: "Most opened only infrequently — whether at random, or under certain particular circumstances.", p: "structure", s: ["power", "threat"], src: FR_FXC },
    { t: "Some might activate according to the position of the sun or the moon, or else only at a certain hour of the day, or month, or year.", p: "power", s: ["structure", "legend"], src: FR_FXC },
    { t: "To open one deliberately usually required a ritual involving the casting of a handful of powerful spells.", p: "make", s: ["power", "people"], src: FR_FXC },
    { t: "It was known besides that baelnorns were capable of opening passages into the Feywild.", p: "people", s: ["power", "make"], src: FR_FXC },
    { t: "Within the woods of Prismeer were seven fairy rings, which could serve as crossings to many locations across the Prime Material plane.", p: "landmark", s: ["structure", "legend"], src: FR_FXC },
    { t: "The Singing Springs, within the volcanic wastes of the Land of Ash and Smoke in Chult, were another such crossing.", p: "landmark", s: ["habitat", "threat"], src: FR_FXC },
    { t: "Cold iron was a kind of iron mined deep underground.", p: "make", s: ["origin", "nature"], src: FR_CIR },
    { t: "It was forged by a special process at lower temperatures than ordinary iron or steel, in order to preserve its delicate properties.", p: "make", s: ["nature", "power"], src: FR_CIR },
    { t: "It was famed for its efficacy against the fey, and was effective against eladrin and demons besides.", p: "threat", s: ["make", "people"], src: FR_CIR },
    { t: "Cold iron weapons normally cost twice as much as their standard counterparts.", p: "trade", s: ["make", "threat"], src: FR_CIR },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 59 (31 Jul) — `underdark`, first of two. The Descent of the Drow, 20 facts.
//
// B-60 flagged this row as possibly redundant with the sourced Drow subject. Measured then: Drow
// spends 3 of 20 facts on the Descent, as SUMMARY. This row takes the detail those three sentences
// compress — the Vyshaan claim, Miyeritar, Wendonai, the Dark Disaster — and no fact here restates
// any of them. The duplicate gate confirms it rather than my judgement doing so.
// ---------------------------------------------------------------------------------------
const FR_CRW = "forgottenrealms.fandom.com/wiki/Crown_Wars";
const FR_CWT = "forgottenrealms.fandom.com/wiki/Crown_Wars_timeline";
const FR_MIY = "forgottenrealms.fandom.com/wiki/Miyeritar";
const FR_ILY = "forgottenrealms.fandom.com/wiki/Ilythiir";

export const DESCENT_OF_THE_DROW: LibrarySubject = {
  id: "descent_of_the_drow",
  label: "The Descent of the Drow",
  category: "legend",
  facts: [
    { t: "Around −14,700 DR the Vyshaan, ruling clan of the sun elf kingdom of Aryvandaar, discovered an alleged link between their family and the Olrythii, the ruling family of the dark and wood elves of Miyeritar.", p: "origin", s: ["people", "governance"], src: FR_CRW },
    { t: "On the strength of it, Coronal Ivósaar Vyshaan chose to make a claim toward the rulership of that kingdom.", p: "governance", s: ["origin", "intrigue"], src: FR_CRW },
    { t: "When peaceful overtures were rebuffed the Aryvandaarans began raiding Miyeritar's borders, until war broke out in earnest in −12,000 DR.", p: "conflict", s: ["governance", "history"], src: FR_CRW },
    { t: "By −11,800 DR Aryvandaar fully occupied Miyeritar, though the country did not come completely under its control for another five hundred years.", p: "conflict", s: ["history", "landmark"], src: FR_CRW },
    { t: "The remaining elven kingdoms were both shocked and spurred by that aggressive war, and the Second Crown War broke out while the first was still being waged.", p: "conflict", s: ["people", "history"], src: FR_CRW },
    { t: "Ostensibly in support of their Miyeritari allies, the dark elf country of Ilythiir attacked the moon elf kingdom of Orishaar, then escalated the conflict to encompass Thearnytaar, Eiellûr and Syòrpiir, utterly destroying them.", p: "conflict", s: ["threat", "people"], src: FR_CRW },
    { t: "The brutality of those attacks led to the coining of the epithet dhaerow — traitor — for the dark elves of Ilythiir.", p: "legend", s: ["people", "threat"], src: FR_CRW },
    { t: "The Ilythiiri conflicts began around −11,700 DR and spanned more than twelve hundred years.", p: "history", s: ["conflict", "threat"], src: FR_CRW },
    { t: "In the course of that savage war the demon goddess Lolth took the opportunity to seduce the ruling families and powers of the kingdom further toward evil, assisted by a fiendish balor named Wendonai.", p: "faith", s: ["intrigue", "power"], src: FR_CRW },
    { t: "In about −10,900 DR Aryvandaar — by then the Vyshaantar Empire — was aided by a fallen solar named Malkizid in invading the sun and moon elf kingdom of Shantel Othreier.", p: "conflict", s: ["power", "faith"], src: FR_CRW },
    { t: "That war waged nearly three hundred years, until Shantel Othreier surrendered after the death of their coronal.", p: "conflict", s: ["history", "governance"], src: FR_CRW },
    { t: "For all its troubles with powerful neighbors, by −13,900 DR Miyeritar had grown into a hub of the arts, of elven magic, and of High Magic.", p: "people", s: ["power", "legacy"], src: FR_MIY },
    { t: "A number of Miyeritari clans and strongholds held out against the occupation, helped by the elves of Illefarn — who, though officially neutral, secretly provided sanctuaries to Miyeritari refugees.", p: "people", s: ["conflict", "structure"], src: FR_MIY },
    { t: "After the conquest of Shantel Othreier in −10,600 DR, a guerrilla uprising and a mage rebellion broke out across parts of Miyeritar and the newly conquered lands.", p: "conflict", s: ["people", "power"], src: FR_MIY },
    { t: "That drove the Aryvandaarans to use High Magic to raise a tremendous killing storm — the event remembered as the Dark Disaster.", p: "power", s: ["threat", "history"], src: FR_MIY },
    { t: "The storms reduced that entire forest and realm to a barren wasteland in the space of three months.", p: "threat", s: ["landmark", "power"], src: FR_CWT },
    { t: "Because of it, the larger part of the followers of Eilistraee — a major patroness of Miyeritar — died in the cataclysm, a blow from which the goddess and her church would not recover for millennia.", p: "faith", s: ["threat", "legacy"], src: FR_CWT },
    { t: "Shock over the Dark Disaster established an uneasy four decades of peace, as nearly every elf of Faerûn shrank back in awe and horror from what havoc the Crown Wars had wrought.", p: "history", s: ["legacy", "people"], src: FR_CWT },
    { t: "Ilythiir had begun the Second Crown War not out of any strong bond with Miyeritar — that relationship was thin — but because Miyeritar was the only other nation holding a meaningful proportion of dark elves.", p: "intrigue", s: ["people", "conflict"], src: FR_ILY },
    { t: "Ilythiir blamed Aryvandaar for the Dark Disaster regardless, and launched the Fourth Crown War around −10,450 DR.", p: "history", s: ["conflict", "intrigue"], src: FR_ILY },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 59 (31 Jul) — `underdark` COMPLETE at 9 of 9. Eleventh region closed.
//
// The reservation made in Batch 49 is now discharged. Rage of Demons took the EVENT — Gromph's
// ritual, the breach, the rampage. This row takes the LORDS: what they are, what they rule, and how
// they treat each other. Same discipline as Trolls/Trollwars in Batch 11, held across ten batches.
// ---------------------------------------------------------------------------------------
const FR_DML = "forgottenrealms.fandom.com/wiki/Demon_lord";
const FR_GRZ = "forgottenrealms.fandom.com/wiki/Graz'zt";
const FR_ORC = "forgottenrealms.fandom.com/wiki/Orcus";
const FR_ABY = "forgottenrealms.fandom.com/wiki/Abyss";

export const DEMONS_OF_THE_ABYSS: LibrarySubject = {
  id: "demons_of_the_abyss",
  label: "Demons of the Abyss",
  category: "creature",
  facts: [
    { t: "Demon lords, known also as Abyssal lords, were archfiends who had gained great power and established a position of preeminence among demonkind.", p: "governance", s: ["power", "origin"], src: FR_DML },
    { t: "Over millennia these demons amassed tremendous power and authority over their own domains.", p: "power", s: ["governance", "legend"], src: FR_DML },
    { t: "As creatures of chaos incarnate, demons had no unified culture whatever.", p: "nature", s: ["character", "people"], src: FR_DML },
    { t: "The only modicum of order that existed for a demon was the one imposed upon it by a more powerful demon — and the moment one rose high enough to assert authority over others was the very moment its rivals began to subvert it.", p: "governance", s: ["conflict", "character"], src: FR_DML },
    { t: "Baphomet, the Prince of Beasts, resembled a gigantic minotaur with coarse black fur covering his body, and was widely worshiped among minotaurs.", p: "nature", s: ["faith", "people"], src: FR_DML },
    { t: "Yeenoghu, called the Lord of Savagery, was similar in appearance to the gnolls who worshiped him, and maintained a long feud with Baphomet.", p: "nature", s: ["faith", "conflict"], src: FR_DML },
    { t: "Juiblex, the Faceless Lord, was a monstrous multi-colored ooze covered over in red eyes, and was mainly concerned with causing destruction.", p: "nature", s: ["threat", "habitat"], src: FR_DML },
    { t: "Kostchtchie corrupted frost giants into worshiping him, and styled himself the Prince of Wrath.", p: "faith", s: ["people", "threat"], src: FR_DML },
    { t: "Malcanthet was the Queen of the Succubi, and one of the subtler demon princes.", p: "people", s: ["character", "power"], src: FR_DML },
    { t: "Zuggtmoy was a demon princess whose powers and concerns lay primarily with fungi.", p: "nature", s: ["power", "habitat"], src: FR_DML },
    { t: "Graz'zt was the demon prince of pleasure, decadence and unlimited self-indulgence, and the patron of corrupt authorities and of tyrants who would rule by force.", p: "governance", s: ["character", "faith"], src: FR_GRZ },
    { t: "He ruled the 45th, 46th and 47th layers of the Abyss, known together as Azzagrat, or the Triple Realm.", p: "structure", s: ["governance", "habitat"], src: FR_GRZ },
    { t: "Standing nine feet tall, he appeared as a lithe yet muscular humanoid whose skin shone like polished obsidian and whose eyes glittered with a malevolent green light.", p: "nature", s: ["character", "legend"], src: FR_GRZ },
    { t: "He had yellowed fangs, pointed ears, and six slender fingers upon each hand.", p: "nature", s: ["make", "character"], src: FR_GRZ },
    { t: "The appearance of the Dark Prince belied the true depths of his wickedness: his existence was a warning that not all which is beautiful is also good.", p: "character", s: ["legend", "threat"], src: FR_GRZ },
    { t: "Much of Orcus's existence was spent in ongoing war with his rival demon lords, Graz'zt and Demogorgon.", p: "conflict", s: ["governance", "power"], src: FR_ORC },
    { t: "The mutual hatred between Orcus and Demogorgon was legendary, and the two battled one another for millennia — a conflict said to predate the Days of Thunder.", p: "conflict", s: ["legend", "origin"], src: FR_ORC },
    { t: "Through those millennia Orcus was believed responsible for creating the rituals and curses used to make the first of several kinds of undead, ghouls and death knights among them.", p: "make", s: ["power", "threat"], src: FR_ORC },
    { t: "Grown indolent at last, his realm became a hushed desolation of idle undeath — and his sloth left him vulnerable within his own Abyssal palace, where the drow demi-goddess Kiaransalee slew him, took Thanatos for herself, and decreed that his name be erased from all recorded existence.", p: "threat", s: ["governance", "legend"], src: FR_ORC },
    { t: "Juiblex dwelt in a layer full of fungus and rot, where slimes and molds fed upon the decaying matter of the plane, and upon each other.", p: "habitat", s: ["nature", "threat"], src: FR_ABY },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 60 (31 Jul) — `wildspace`, first capstone. Aberrations of the Far Realm, 20 facts.
// ---------------------------------------------------------------------------------------
const FR_FAR = "forgottenrealms.fandom.com/wiki/Far_Realm";
const FR_ABR = "forgottenrealms.fandom.com/wiki/Aberration";
const FR_ALN = "forgottenrealms.fandom.com/wiki/Alienist";

export const ABERRATIONS_FAR_REALM: LibrarySubject = {
  id: "aberrations_far_realm",
  label: "Aberrations of the Far Realm",
  category: "creature",
  facts: [
    { t: "The Far Realm was a plane of madness, situated very far indeed from the planes of the standard cosmology.", p: "habitat", s: ["threat", "legend"], src: FR_FAR },
    { t: "That maddening realm was feared for its power to twist unfortunate visitors into gruesome monsters, and it was from there that aberrations came.", p: "threat", s: ["origin", "habitat"], src: FR_FAR },
    { t: "It comprised an infinite number of layers.", p: "structure", s: ["habitat", "nature"], src: FR_FAR },
    { t: "Unlike the layers of many Outer Planes, these were very thin — ranging from an inch to a mile in thickness, each separated from the next by some ten feet.", p: "structure", s: ["nature", "habitat"], src: FR_FAR },
    { t: "The layers were transparent, and a traveler could glimpse through twenty or so of them, each appearing more blurred than the last.", p: "structure", s: ["power", "legend"], src: FR_FAR },
    { t: "They were highly morphic besides: on the whim of the alien entities drifting through them, the layers continually evaporated, divided, spawned and breathed.", p: "structure", s: ["power", "nature"], src: FR_FAR },
    { t: "The simplest natives of that place were the pseudonatural creatures that roamed its layers, occupied with unguessable errands.", p: "nature", s: ["habitat", "people"], src: FR_FAR },
    { t: "They dwelled beyond time itself, and beyond the regular planes of existence, living forever in a state of seeming insanity.", p: "nature", s: ["power", "legend"], src: FR_FAR },
    { t: "Summoned to the Material Plane, they often emulated and took the shape of familiar creatures — always more gruesome than their material counterparts.", p: "nature", s: ["threat", "make"], src: FR_FAR },
    { t: "Sometimes instead they appeared in a form more closely related to their origins, usually a mass of writhing tentacles, though more terrible forms were always possible.", p: "nature", s: ["threat", "legend"], src: FR_FAR },
    { t: "Aberrations were creatures that were unnatural, and had no place in the natural order of the Material plane — nor, in fact, of most other known planes.", p: "nature", s: ["origin", "threat"], src: FR_ABR },
    { t: "Though some believed that aberrations all originated in the Far Realm, this was not true of every one of them.", p: "origin", s: ["habitat", "nature"], src: FR_ABR },
    { t: "Driders, for instance, were unnatural crosses between drow and spiders, made when the twisted goddess Lolth had drow bodies aberrantly transformed.", p: "origin", s: ["faith", "people"], src: FR_ABR },
    { t: "Some known kinds, such as cloakers and psurlons, were said to hail from the Far Realm, where infinite different aberrations were said to dwell.", p: "origin", s: ["habitat", "threat"], src: FR_ABR },
    { t: "Others were the unnatural creations of dark, alien deities — beholders and destrachan among them — or of powerful but only questionably moral spellcasters, such as the chuuls and the umber hulks.", p: "origin", s: ["make", "people"], src: FR_ABR },
    { t: "The overarching characteristic that all aberrations shared was that they did not fit into the natural order of things.", p: "nature", s: ["character", "origin"], src: FR_ABR },
    { t: "Bones taken from an aberration could be used to make certain dyes, or potions of defense; the hides of some could be cured into a workable leather; and the blood of some made potions of accuracy and of critical strike, along with a variety of dyes favored by warlocks.", p: "trade", s: ["make", "people"], src: FR_ABR },
    { t: "Alienists were spellcasters whose study of the planes carried them to the very boundaries of reality, and to the Far Realm — consorting with the unfathomable entities there to ascend beyond their own limitations, at the cost of their sanity.", p: "people", s: ["power", "threat"], src: FR_ALN },
    { t: "Interaction with those entities was ultimately corrosive to an alienist's mind, leaving them increasingly detached from reality until their confidence twisted at last into a chilling mania.", p: "character", s: ["threat", "power"], src: FR_ALN },
    { t: "Often their minds were assaulted with whispers from unknown entities far beyond.", p: "character", s: ["legend", "threat"], src: FR_ALN },
  ],
};

// ---------------------------------------------------------------------------------------
// BATCH 60 (31 Jul) — `wildspace` COMPLETE at 8 of 8. TWELFTH AND FINAL REGION CLOSED.
//
// **THE HUNDREDTH SUBJECT.** The roster is finished: 100 of 100 rows sourced, every region complete,
// every DMG category filled in every region.
//
// B-60 flagged this row as possibly overlapping The Spelljammer (Batch 21). Measured, the real
// overlap was two facts, and the `Spelljamming_helm` page itself was entirely untouched — the
// apparent conflict was a substring-match error in my own grep. That row and this one now sit at
// either end of `wildspace`: the ship that is one of a kind, and the chair that moves all the rest.
// `FR_SJ` REUSED, the same page that opened the region.
// ---------------------------------------------------------------------------------------
const FR_SJH = "forgottenrealms.fandom.com/wiki/Spelljamming_helm";
const FR_CSH = "forgottenrealms.fandom.com/wiki/Create_spelljamming_helm";
const FR_CMH = "forgottenrealms.fandom.com/wiki/Create_minor_helm";

export const SPELLJAMMING_HELMS: LibrarySubject = {
  id: "spelljamming_helms",
  label: "Spelljamming Helms",
  category: "object",
  facts: [
    { t: "A spelljamming helm was a magical device that powered a vessel by converting magical energy into motion.", p: "make", s: ["power", "structure"], src: FR_SJH },
    { t: "Helms were not the only means of moving a ship through space, but they were the easiest to come by and by far the most common.", p: "make", s: ["trade", "people"], src: FR_SJH },
    { t: "A helm might look like any sort of chair at all — from the plainest bench to something as ornate as a throne.", p: "make", s: ["character", "structure"], src: FR_SJH },
    { t: "Examined with a detect magic spell, a helm gave off an intense magical aura.", p: "power", s: ["make", "legend"], src: FR_SJH },
    { t: "When a spellcaster sat down in one, it felt like being submerged in a warm bath.", p: "character", s: ["power", "people"], src: FR_SJH },
    { t: "At that moment the senses expanded: the caster remained aware of their own body, but felt also as though the ship itself, and the bubble of air about it, were part of them.", p: "character", s: ["power", "nature"], src: FR_SJH },
    { t: "Helms worked best when the helmsman was well-rested and had worked no magic that day.", p: "people", s: ["power", "character"], src: FR_SJH },
    { t: "Fresh or not, a spellcaster lost all casting ability the instant they sat down, and could use no other magic until they had rested again.", p: "power", s: ["people", "threat"], src: FR_SJH },
    { t: "The helm attuned itself to the brain waves of the helmsman and began siphoning away magical power — which it could do from any distance whatever.", p: "power", s: ["make", "nature"], src: FR_SJH },
    { t: "That link held for a full day and could stretch across any distance, and yet the helmsman could only make use of it, and pilot the ship, while actually seated in the chair.", p: "structure", s: ["power", "people"], src: FR_SJH },
    { t: "The more magically powerful the creature sitting in the helm, the faster the vessel could travel at tactical speeds.", p: "power", s: ["people", "structure"], src: FR_SJH },
    { t: "One new to piloting might accidentally send a spelljammer into orbit straight from the surface.", p: "threat", s: ["people", "habitat"], src: FR_SJH },
    { t: "For tactical control the helmsman could will the ship to move, but only very slowly.", p: "structure", s: ["people", "power"], src: FR_SJH },
    { t: "It was left to the rest of the crew to work the vessel's sails for tight turns and other maneuvers.", p: "people", s: ["conflict", "structure"], src: FR_SJH },
    { t: "The spell create spelljamming helm made one outright: during the casting the caster touched a regular unoccupied chair, and if it succeeded that chair was transformed.", p: "make", s: ["power", "origin"], src: FR_CSH },
    { t: "Besides its verbal and somatic components the spell required a rod of crystal worth at least five thousand gold pieces, consumed in the casting.", p: "make", s: ["trade", "origin"], src: FR_CSH },
    { t: "A lesser spell, create minor helm, likewise turned an ordinary chair into a helm — but the effect was temporary, and it was often reserved for emergencies.", p: "make", s: ["origin", "threat"], src: FR_CMH },
    { t: "It was cast infrequently for a plain enough reason: it aged the caster by a whole year.", p: "threat", s: ["origin", "people"], src: FR_CMH },
    { t: "The size of the spelljammer such a helm could power came to twice the caster's own level of skill.", p: "structure", s: ["make", "power"], src: FR_CMH },
    { t: "Whenever it approached an object of at least ten spatial tons, a spelljammer immediately decelerated to much slower speeds — determined by the ship's size, the quality of its helm, and the magical capabilities of its pilot.", p: "habitat", s: ["structure", "threat"], src: FR_SJ },
  ],
};

export const LIBRARY_SUBJECTS: Record<string, LibrarySubject> = {
  waterdeep: WATERDEEP,
  baldursgate: BALDURS_GATE,
  menzoberranzan: MENZOBERRANZAN,
  beholders: BEHOLDERS,
  elminster: ELMINSTER,
  neverwinter: NEVERWINTER,
  candlekeep: CANDLEKEEP,
  drizzt: DRIZZT,
  mindflayers: MINDFLAYERS,
  ringofwinter: RING_OF_WINTER,
  strahd: STRAHD,
  harpers: HARPERS,
  drow: DROW,
  undermountain: UNDERMOUNTAIN,
  zhentarim: ZHENTARIM,
  wandoforcus: WAND_OF_ORCUS,
  sunsword: SUNSWORD,
  myth_drannor: FALL_OF_MYTH_DRANNOR,
  cult_of_the_dragon: CULT_OF_THE_DRAGON,
  order_of_the_gauntlet: ORDER_OF_THE_GAUNTLET,
  emerald_enclave: EMERALD_ENCLAVE,
  lords_alliance: LORDS_ALLIANCE,
  halaster: HALASTER,
  frost_giants: FROST_GIANTS,
  crown_of_horns: CROWN_OF_HORNS,
  holy_symbol_of_ravenkind: HOLY_SYMBOL_OF_RAVENKIND,
  pool_of_radiance: POOL_OF_RADIANCE,
  staff_of_the_magi: STAFF_OF_THE_MAGI,
  zariel: ZARIEL,
  manshoon: MANSHOON,
  yuan_ti: YUAN_TI,
  hags: HAGS,
  githyanki: GITHYANKI,
  phlan: PHLAN,
  laeral_silverhand: LAERAL_SILVERHAND,
  skullport: SKULLPORT,
  weeping_war: WEEPING_WAR,
  trolls: TROLLS,
  jarlaxle: JARLAXLE,
  ythryn_mythallar: YTHRYN_MYTHALLAR,
  trollwars: TROLLWARS,
  yawning_portal: YAWNING_PORTAL,
  codicil_of_white: CODICIL_OF_WHITE,
  avernus: AVERNUS,
  wild_hunt: WILD_HUNT,
  vlaakith: VLAAKITH,
  red_larch: RED_LARCH,
  devils_of_the_hells: DEVILS_OF_THE_HELLS,
  dead_three: DEAD_THREE,
  gar_shatterkeel: GAR_SHATTERKEEL,
  witchlight_carnival: WITCHLIGHT_CARNIVAL,
  the_spelljammer: THE_SPELLJAMMER,
  vampires: VAMPIRES,
  port_nyanzaru: PORT_NYANZARU,
  infernal_war_machines: INFERNAL_WAR_MACHINES,
  doppelgangers: DOPPELGANGERS,
  elemental_weapons: ELEMENTAL_WEAPONS,
  zybilna: ZYBILNA,
  rock_of_bral: ROCK_OF_BRAL,
  ten_towns: TEN_TOWNS,
  barovia: BAROVIA,
  artus_cimber: ARTUS_CIMBER,
  unhuman_wars: UNHUMAN_WARS,
  dark_gift_of_zariel: DARK_GIFT_OF_ZARIEL,
  mizora: MIZORA,
  elementals_four_temples: ELEMENTALS_FOUR_TEMPLES,
  witchlight_relics: WITCHLIGHT_RELICS,
  king_hekaton: KING_HEKATON,
  curse_of_strahd: CURSE_OF_STRAHD,
  prophecy_frostmaiden: PROPHECY_FROSTMAIDEN,
  elturel: ELTUREL,
  shield_hidden_lord: SHIELD_HIDDEN_LORD,
  ras_nsi: RAS_NSI,
  sumber_hills: SUMBER_HILLS,
  prismeer: PRISMEER,
  trade_bars: TRADE_BARS,
  neogi: NEOGI,
  undead_of_phlan: UNDEAD_OF_PHLAN,
  dragons_of_the_north: DRAGONS_OF_THE_NORTH,
  rage_of_demons: RAGE_OF_DEMONS,
  the_sundering: THE_SUNDERING,
  auril: AURIL,
  remorhaz: REMORHAZ,
  frostmaiden_relics: FROSTMAIDEN_RELICS,
  bel: BEL,
  infernal_contracts: INFERNAL_CONTRACTS,
  outer_city: OUTER_CITY,
  ulder_ravengard: ULDER_RAVENGARD,
  madam_eva: MADAM_EVA,
  tarokka_deck: TAROKKA_DECK,
  tomb_nine_gods: TOMB_NINE_GODS,
  zombies_of_chult: ZOMBIES_OF_CHULT,
  elder_elemental_eye: ELDER_ELEMENTAL_EYE,
  aerisi_kalinoth: AERISI_KALINOTH,
  redcaps_and_fey: REDCAPS_AND_FEY,
  fey_bargains: FEY_BARGAINS,
  descent_of_the_drow: DESCENT_OF_THE_DROW,
  demons_of_the_abyss: DEMONS_OF_THE_ABYSS,
  aberrations_far_realm: ABERRATIONS_FAR_REALM,
  spelljamming_helms: SPELLJAMMING_HELMS,
};

// ============================================================================
// LIBRARY TITLES + GENRE CONNECTIVES.
//
// The Archive's title generator sounds right (Frank), so the Library copies its SYSTEM but swaps the
// segments to a general-collection register — less "muster-rolls and siege-ledgers," more the varied
// spines of a well-rounded library. The GENRE fragment a title lands on (Chronicle / Journal /
// Account / Treatise / Gazetteer) also selects the CONNECTIVE sentence pool, so a book that calls
// itself a Chronicle gets a chronicle-voiced connective, a Journal a first-person one — the framing
// agrees with the title's claimed genre.
// ============================================================================

// The genre frames — each carries a KEY into LIBRARY_CONNECTIVES so the stitched paragraph's voice
// matches the title's promise. Library-themed (a reader's shelf), not research-themed (a scholar's
// stacks).
export const LIBRARY_TITLE_FRAMES: readonly { text: string; genre: string }[] = [
  { text: "A Chronicle of", genre: "chronicle" },
  { text: "The Book of", genre: "account" },
  { text: "A Traveler's Account of", genre: "journal" },
  { text: "The Journal of a Season in", genre: "journal" },
  { text: "A Reader's Companion to", genre: "companion" },
  { text: "Curiosities of", genre: "curiosities" },
  { text: "A Gentle History of", genre: "chronicle" },
  { text: "Tales and Truths of", genre: "curiosities" },
  { text: "The Little Gazetteer of", genre: "companion" },
  { text: "Leaves from", genre: "journal" },
  { text: "An Evening's Reading upon", genre: "account" },
  { text: "The Collected Wonders of", genre: "curiosities" },
];

// The connective/genre sentence — carries NO facts, only voice. Woven as the paragraph's closing
// turn, tied to the title's genre. Pure fiction (no sourcing needed — it states nothing factual). A
// d12 per genre (Frank, 29 Jul): four repeated too fast, and the closing line is the most visible
// part of the framing, so it wants the same variety the facts have.
export const LIBRARY_CONNECTIVES: Record<string, readonly string[]> = {
  chronicle:  [
    "So the chronicle keeps it, that those who come after might know.",
    "Such are the matters the chronicle sets down, and sets down plainly.",
    "The chronicle says no more of it than this, and says it true.",
    "So it is written, and so the years have borne it out.",
    "The chronicle holds these things against forgetting, as a chronicle must.",
    "Thus the record stands, for whoever should have need of it.",
    "So much the annals affirm; the rest is lost or was never written.",
    "These the chronicle judged worth the keeping, and kept them.",
    "Let it be remembered so, since remembering is the chronicle's whole office.",
    "So the older hands set it down, and no later hand has faulted them.",
    "The chronicle is content to have carried this much across the years.",
    "And there the record leaves it, plain and unadorned.",
  ],
  account:  [
    "All this the book gathers together, that a reader might hold it in one hand.",
    "The book asks only that you take it as it is given.",
    "So the account has it, entire in these few lines.",
    "Here the book closes the matter, content with what it has told.",
    "The book claims no more than it has shown, and no less.",
    "So the several reports agree, and the book sets them side by side.",
    "This much the book can vouch for; beyond it, the book is silent.",
    "So it is gathered and so it is bound, for the reading of it.",
    "The book lays the matter down here, whole enough for one sitting.",
    "Take the account for what it is: a fair gathering, honestly kept.",
    "So the book has assembled it, and so it rests between these covers.",
    "The book has said its piece, and lets the reader make of it what they will.",
  ],
  journal:  [
    "I set it down as I found it, and leave the rest to a wiser hand.",
    "So it seemed to me, walking there; another might read it otherwise.",
    "I write only what I saw and was told, and let it stand.",
    "These were the things worth the ink, and I have spent it here.",
    "I make no more of it than I understood, which was little enough.",
    "So my notes have it, scrawled by a poor lamp and copied out fair.",
    "I record it while it is fresh, before the road takes the memory from me.",
    "What I could not verify I have marked; the rest I stand behind.",
    "So the day gave it to me, and so I give it on.",
    "I have told it as plainly as I am able, and there I must leave it.",
    "Others will have seen more; I have only my own two eyes to answer for.",
    "So it goes into the journal, and the journal goes with me.",
  ],
  companion:  [
    "The companion offers this much to the curious, and points the way to more.",
    "A reader wanting more will find it, for the trail is not hard to follow.",
    "So much the companion gives gladly; the rest is yours to seek.",
    "Enough, the companion judges, to send a curious mind on its way.",
    "The companion is a small book and knows it; take it as a first step.",
    "For the rest, the companion trusts the reader to go and see.",
    "So the companion opens the door; the reader must walk through it.",
    "A traveler could do worse than begin here, the companion ventures.",
    "The companion has pointed; where the finger leads is the reader's affair.",
    "So much for the outline; the living detail waits for those who go.",
    "The companion keeps itself short on purpose, that the curious not be delayed.",
    "Here the companion sets you on the road and wishes you well of it.",
  ],
  curiosities: [
    "Stranger things are told of it still, but these are the ones worth the telling.",
    "The world holds odder corners, but few so worth an idle hour.",
    "Such are its curiosities, and they are not the half of them.",
    "There is always one more strange thing; there always is.",
    "The oddest tales the book has left out, being unable to swear to them.",
    "So the curious will find, if they go looking, and some do.",
    "These wonders the book vouches for; the wilder ones it merely repeats.",
    "Strangeness enough for one small volume, and strangeness to spare.",
    "The book collects such things the way a magpie collects bright ones.",
    "And that is not the strangest of it, though it is strange enough.",
    "For every wonder set down here, the book swears there are ten it missed.",
    "So the marvels stand, each odder than a sensible book would allow.",
  ],
};
