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

const FR_UM = "forgottenrealms.fandom.com/wiki/Undermountain";

export const UNDERMOUNTAIN: LibrarySubject = {
  id: "undermountain",
  label: "Undermountain",
  category: "location",
  facts: [
    { t: "Undermountain is the largest and most infamous dungeon in all Faerûn, sprawling for miles beneath the city of Waterdeep.", p: "underground", s: ["structure", "legend"], src: FR_UM },
    { t: "It is a warren of buried kingdoms, forgotten ruins, arcane laboratories, and impossible corridors shaped by centuries of madness.", p: "structure", s: ["underground"], src: FR_UM },
    { t: "Its deepest levels were first delved by the Melairkyn dwarves, who found mithral ore beneath Mount Waterdeep and carved out their Underhalls.", p: "origin", s: ["underground"], src: FR_UM },
    { t: "In time the drow dug their own tunnels up from below, and the dwarven kingdom of the Melairkyn collapsed under the pressure.", p: "origin", s: ["conflict", "underground"], src: FR_UM },
    { t: "The mad archwizard Halaster Blackcloak claimed the ousted dwarves' halls for himself and made them his personal playground and laboratory.", p: "origin", s: ["legend"], src: FR_UM },
    { t: "Over centuries Halaster expanded the dungeon far beyond the dwarven halls, digging ever deeper as he descended into madness.", p: "legend", s: ["structure"], src: FR_UM },
    { t: "He riddled the dungeon with traps, monsters, and cursed magic gathered from across the multiverse, penning overpowered creatures in its levels.", p: "threat", s: ["legend"], src: FR_UM },
    { t: "Halaster's apprentices, some as broken of mind as their master, added levels of their own to the growing labyrinth.", p: "legend", s: ["structure"], src: FR_UM },
    { t: "The dungeon is honeycombed with portals Halaster set, linking it to distant parts of the Realms and to other worlds entirely.", p: "structure", s: ["legend"], src: FR_UM },
    { t: "Its most famous entrance is the well in the taproom of the Yawning Portal inn, built over the site of Halaster's own vanished tower.", p: "landmark", s: ["structure"], src: FR_UM },
    { t: "Durnan, who first descended by that well, raised the inn above it and to this day charges the brave or foolish a gold piece to climb down.", p: "landmark", s: ["origin"], src: FR_UM },
    { t: "Waterdeep's sewers hold several hidden connections to the dungeon, so the city's underside and Halaster's halls are quietly joined.", p: "underground", s: ["structure"], src: FR_UM },
    { t: "On its third level lies Skullport, the Port of Shadows, a city-sized cavern of crime midway between the dungeon and the Underdark.", p: "underground", s: ["intrigue", "landmark"], src: FR_UM },
    { t: "Near Skullport stands the Promenade of Eilistraee, a temple of the good drow who follow the Dark Dancer against the worship of Lolth.", p: "faith", s: ["underground"], src: FR_UM },
    { t: "The ruins of an ancient drow city that worshipped Ghaunadaur lie in the dungeon, its people driven out single-handed by Halaster in his delving.", p: "underground", s: ["legend", "conflict"], src: FR_UM },
    { t: "The dungeon's very geography shifts, resets, and reacts to intrusion, so that no two descents ever map quite the same halls.", p: "structure", s: ["legend"], src: FR_UM },
    { t: "Some who know it best say the dungeon seems to remember those who enter — and to enjoy their failures.", p: "legend", s: ["threat"], src: FR_UM },
    { t: "Its shifting staircases, false paths, and warped caverns where gravity inverts have claimed countless adventurers over the ages.", p: "threat", s: ["structure"], src: FR_UM },
    { t: "No accurate count of its levels has ever been made; some who have mapped it call it perhaps the deepest dungeon in any world.", p: "structure", s: ["legend"], src: FR_UM },
    { t: "For all its dangers, its allure is a siren song, and the promise of what Halaster left buried still draws the bold down the well.", p: "legend", s: ["threat"], src: FR_UM },
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
    { t: "The Enclave was founded long ago in the Vilhon Reach, on the island of Ilighôn, over a thousand years past.", p: "origin", s: [], src: FR_EE },
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
