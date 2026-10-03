import type { LoreEntry } from "./types";

/**
 * World canon for "The Sundered Reach". Every generated adventure is anchored to
 * these regions, factions, gods and history so tales share one universe.
 */
export const WORLD_NAME = "The Sundered Reach";

export interface Region { id: string; name: string; summary: string; dangers: string[] }
export interface Faction { id: string; name: string; summary: string; goal: string }

export const REGIONS: Region[] = [
  { id: "ashenford", name: "Ashenford Vale", summary: "Grey farmland where ash still falls from the Shattering. Old chapels, older crypts.", dangers: ["restless dead", "zealots", "blight"] },
  { id: "saltmarch", name: "The Saltmarch", summary: "Fog-drowned coast of stilt villages, smugglers and drowned bells.", dangers: ["drowned things", "smugglers", "sea hags"] },
  { id: "ironroot", name: "Ironroot Holds", summary: "Dwarven mountain cities, half of them abandoned when the deep forges went cold.", dangers: ["deep crawlers", "rival clans", "constructs"] },
  { id: "glimmerwood", name: "The Glimmerwood", summary: "A forest where the fey courts still keep their bargains, and their grudges.", dangers: ["fey tricksters", "wild beasts", "thorn-witches"] },
  { id: "dustcrown", name: "The Dustcrown Wastes", summary: "Sun-scoured desert hiding the buried cities of the old empire.", dangers: ["tomb guardians", "raiders", "sand wyrms"] },
  { id: "hollowspire", name: "Hollowspire", summary: "A great walled city of guilds, spires and very polite assassins.", dangers: ["cutthroats", "corrupt watch", "cultists"] },
];

export const FACTIONS: Faction[] = [
  { id: "ashen-brotherhood", name: "The Ashen Brotherhood", summary: "Grey-robed zealots who believe the ash is Aurel's penance.", goal: "Seal away anything that disturbs the fallen god's rest." },
  { id: "lantern-wardens", name: "The Lantern Wardens", summary: "An order of monster-hunters sworn by the Lantern Accord.", goal: "Keep the Long Night from returning." },
  { id: "gilded-compact", name: "The Gilded Compact", summary: "A merchant league that owns half the roads and all the debts.", goal: "Profit from every crisis, quietly." },
  { id: "circle-of-thorns", name: "The Circle of Thorns", summary: "Druids who want the cities torn down and the wild restored.", goal: "Return the land to what it was before the empire." },
  { id: "pale-court", name: "The Pale Court", summary: "Undying nobles of the old empire, patient and courteous.", goal: "Reclaim their thrones, one generation at a time." },
  { id: "iron-covenant", name: "The Iron Covenant", summary: "Dwarven engineers and their awakened constructs.", goal: "Relight the deep forges at any cost." },
];

export const TONES = ["Grim", "Heroic", "Mysterious", "Eerie"] as const;

export const THREATS = [
  "an undead uprising",
  "a cult preparing a forbidden ritual",
  "a monster that has claimed a lair nearby",
  "a political conspiracy among the powerful",
  "a fey bargain gone wrong",
  "an ancient construct awakening",
  "a spreading curse or plague",
  "a stolen relic that must be recovered",
];

export const TWISTS = [
  "a trusted ally is secretly working for the enemy",
  "the villain's cause is sympathetic, even just",
  "the prize itself is cursed",
  "two factions are both lying about what happened",
  "the dead were wronged and want justice, not blood",
  "the threat was summoned to stop something worse",
];

/** Core lore every hero knows. Always visible in the codex. */
export const WORLD_LORE: LoreEntry[] = [
  { id: "w-shattering", category: "history", title: "The Shattering", text: "Three hundred years ago the sun-god Aurel fell from the sky and broke across the land. The old empire died in a night. Ash still falls in places where his fragments lie." },
  { id: "w-long-night", category: "history", title: "The Long Night", text: "The decade after the Shattering, when the dead walked and the sun did not rise. It ended only when the first Lantern was lit." },
  { id: "w-accord", category: "history", title: "The Lantern Accord", text: "The oath that founded the Lantern Wardens and bound the surviving kingdoms to hunt the things of the Long Night." },
  { id: "w-aurel", category: "deity", title: "Aurel, the Fallen Sun", text: "Once the brightest of the gods. Some say he is dead, some say he dreams, and some say he is waiting." },
  { id: "w-varra", category: "deity", title: "Varra the Keeper", text: "Saint of graves and thresholds. Her chapels guard the doors between the living and the dead." },
  { id: "w-morh", category: "deity", title: "Mórh the Drowned", text: "God of the deep and of things lost. Sailors pay him in coins; smugglers in secrets." },
  ...REGIONS.map((r) => ({ id: `w-region-${r.id}`, category: "place" as const, title: r.name, text: r.summary })),
  ...FACTIONS.map((f) => ({ id: `w-faction-${f.id}`, category: "faction" as const, title: f.name, text: `${f.summary} Their aim: ${f.goal.toLowerCase()}` })),
];

export const regionById = (id: string) => REGIONS.find((r) => r.id === id) ?? REGIONS[0]!;
export const factionById = (id: string) => FACTIONS.find((f) => f.id === id) ?? FACTIONS[0]!;

/** Compact canon text for AI prompts. */
export function worldCanonText() {
  return [
    `World: ${WORLD_NAME}. 300 years after the Shattering, when the sun-god Aurel fell and the old empire died. The Long Night followed; the Lantern Accord ended it.`,
    `Gods: Aurel the Fallen Sun, Varra the Keeper (graves, thresholds), Mórh the Drowned (deep, lost things).`,
    `Regions: ${REGIONS.map((r) => `${r.name} (${r.summary})`).join(" ")}`,
    `Factions: ${FACTIONS.map((f) => `${f.name}: ${f.summary}`).join(" ")}`,
  ].join("\n");
}
