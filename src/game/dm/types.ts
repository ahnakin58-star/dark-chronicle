import type { Character, Item, NarrativeEntry, Quest, SceneId, SkillCheck } from "../types";

/** Everything a Dungeon Master (mock or real AI) needs to know about the world. */
export interface DMContext {
  character: Character;
  scene: SceneId;
  quests: Quest[];
  recent: NarrativeEntry[];
}

export type DMInput =
  | { kind: "start" }
  | { kind: "action"; text: string }
  | { kind: "check"; check: SkillCheck; total: number; natural: number; success: boolean }
  | { kind: "combat-end"; victory: boolean };

/** Structured response. A real AI provider should return this shape (e.g. via structured output). */
export interface DMResponse {
  narration: string;
  npc?: { name: string; line: string } | undefined;
  check?: SkillCheck | undefined;
  startCombat?: string[] | undefined; // keys of ENEMIES
  completeObjective?: { questId: string; index: number }[] | undefined;
  scene?: SceneId | undefined;
  damage?: string | undefined; // dice expression applied to the player
  heal?: string | undefined;
  loot?: Item[] | undefined;
  choices?: string[] | undefined;
  victory?: boolean | undefined;
}

export interface DungeonMaster {
  name: string;
  respond(ctx: DMContext, input: DMInput): Promise<DMResponse>;
}
