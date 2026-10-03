import type { Character, Item, LoreCategory, NarrativeEntry, Quest, Scenario, SceneId, SkillCheck } from "../types";

/** Everything a Dungeon Master needs to know about the world. */
export interface DMContext {
  scenario: Scenario;
  character: Character;
  scene: SceneId;
  quests: Quest[];
  recent: NarrativeEntry[];
  knownLore: string[]; // ids of discovered lore
}

export type DMInput =
  | { kind: "start" }
  | { kind: "action"; text: string }
  | { kind: "check"; check: SkillCheck; total: number; natural: number; success: boolean }
  | { kind: "combat-end"; victory: boolean };

/** Structured response returned by the DM. */
export interface DMResponse {
  narration: string;
  npc?: { name: string; line: string } | undefined;
  check?: SkillCheck | undefined;
  startCombat?: string[] | undefined; // keys of scenario.enemies
  completeObjective?: { questId: string; index: number }[] | undefined;
  scene?: SceneId | undefined;
  damage?: string | undefined;
  heal?: string | undefined;
  loot?: Item[] | undefined;
  choices?: string[] | undefined;
  victory?: boolean | undefined;
  revealLore?: string[] | undefined;
  newLore?: { category: LoreCategory; title: string; text: string }[] | undefined;
}

export interface DungeonMaster {
  name: string;
  respond(ctx: DMContext, input: DMInput): Promise<DMResponse>;
}
