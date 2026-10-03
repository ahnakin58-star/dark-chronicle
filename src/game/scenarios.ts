import { ENEMIES, initialQuests } from "./data";
import type { Character, GameState, Scenario } from "./types";

/** The original hand-written adventure, kept as a classic option. */
export const HOLLOW_CRYPT: Scenario = {
  id: "hollow-crypt",
  title: "The Hollow Crypt",
  tagline: "Something beneath Ashenford is waking the dead.",
  regionId: "ashenford",
  factionId: "ashen-brotherhood",
  threat: "an undead uprising",
  twist: "the Bone Warden was once a Lantern Warden who swore to guard the crypt forever",
  tone: "Grim",
  secrets:
    "The Bone Warden is Ser Odric, a Lantern Warden bound by his own oath to guard a fragment of Aurel in the crypt. The fragment's warmth is waking the dead. Captain Brenn knows the crypt is cursed and is afraid. Old Mira the innkeeper's family relic was buried with Odric.",
  openingNarration:
    "Rain and ash fall together on the road to Ashenford. You came because the dead in this village no longer stay buried. The north gate is barred. Grey-robed zealots of the Ashen Brotherhood stand before it, led by a scarred man in rusted mail.",
  openingNpc: { name: "Captain Hal Brenn", line: "No one enters Ashenford. The crypt has been sealed by holy decree. Go home, wanderer." },
  startChoices: ["I try to persuade the captain to let me pass", "I look for another way over the wall", "I study the zealots for weakness"],
  scenes: [
    { id: "gate", name: "The North Gate", description: "A barred palisade gate guarded by Ashen zealots under Captain Hal Brenn.", goal: "Get into the village: talk, sneak, climb or fight.", enemies: ["zealot", "zealot"] },
    { id: "chapel", name: "Chapel of Saint Varra", description: "An abandoned chapel with blue-burning candles and a broken binding ward. A hidden stair lies under the altar.", goal: "Find the hidden way down (investigate the altar, read the runes).", enemies: [] },
    { id: "crypt", name: "The Ossuary", description: "Bone-lined tunnels where skeletons rise from the alcoves.", goal: "Survive the restless dead.", enemies: ["skeleton", "skeleton"] },
    { id: "sanctum", name: "The Warden's Sanctum", description: "The Bone Warden sits on a throne of bones, crowned in cold fire.", goal: "Defeat or lay to rest the Bone Warden.", enemies: ["warden"] },
  ],
  enemies: ENEMIES,
  quests: initialQuests(),
  lore: [
    { id: "l-brenn", category: "person", title: "Captain Hal Brenn", text: "Scarred captain of the Ashen Brotherhood's gate watch. More afraid of the crypt than of any stranger." },
    { id: "l-chapel", category: "place", title: "Chapel of Saint Varra", text: "Ashenford's oldest chapel. Its candles burn blue and never go out." },
    { id: "l-warden", category: "creature", title: "The Bone Warden", text: "A knight's corpse crowned in cold fire, keeping watch beneath Ashenford." },
    { id: "l-odric", category: "history", title: "The Oath of Ser Odric", text: "A Lantern Warden who swore to guard a shard of the Fallen Sun until the end of days, and kept that oath past death." },
    { id: "l-mira", category: "person", title: "Old Mira", text: "Ashenford's innkeeper. Her family's silver reliquary was buried in the crypt generations ago." },
  ],
};

export function initialGameState(scenario: Scenario, character: Character): GameState {
  return {
    character,
    scene: scenario.scenes[0]?.id ?? "start",
    enemies: [],
    combat: null,
    narrative: [],
    log: [],
    quests: structuredClone(scenario.quests),
    lore: [],
    pendingCheck: null,
    choices: [],
    status: "playing",
    thinking: false,
    rolling: null,
    lastRoll: null,
    dmError: null,
  };
}
