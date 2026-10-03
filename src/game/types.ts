export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type Stats = Record<Ability, number>;

export type Skill =
  | "Athletics"
  | "Acrobatics"
  | "Stealth"
  | "Investigation"
  | "Arcana"
  | "Perception"
  | "Insight"
  | "Persuasion"
  | "Deception"
  | "Intimidation";

export interface Item {
  id: string;
  name: string;
  kind: "weapon" | "armor" | "potion" | "misc";
  description: string;
  qty: number;
  damage?: string;
  ability?: Ability;
  heal?: string;
}

export interface Character {
  name: string;
  race: string;
  cls: string;
  level: number;
  hp: number;
  maxHp: number;
  ac: number;
  proficiency: number;
  stats: Stats;
  skills: Skill[];
  inventory: Item[];
  equippedWeaponId: string;
  gold: number;
  xp: number;
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  attackBonus: number;
  damage: string;
  xp: number;
  description: string;
}

export type Tone = "crit" | "fumble" | "success" | "failure" | "neutral" | "damage" | "heal";

export interface LogEntry {
  id: string;
  time: number;
  title: string;
  detail?: string;
  tone: Tone;
}

export interface NarrativeEntry {
  id: string;
  speaker: "dm" | "player" | "npc" | "system";
  text: string;
  name?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: { text: string; done: boolean }[];
}

export interface SkillCheck {
  skill: Skill;
  ability: Ability;
  dc: number;
  reason: string;
}

export type SceneId = "gate" | "chapel" | "crypt" | "sanctum" | "end";

export interface CombatState {
  round: number;
  defending: boolean;
  targetId: string | null;
  turn: "player" | "enemy";
}

export interface LastRoll {
  id: string;
  sides: number;
  value: number;
  label: string;
  total?: number;
  crit?: boolean;
  fumble?: boolean;
}

export interface GameState {
  character: Character | null;
  scene: SceneId;
  enemies: Enemy[];
  combat: CombatState | null;
  narrative: NarrativeEntry[];
  log: LogEntry[];
  quests: Quest[];
  pendingCheck: SkillCheck | null;
  choices: string[];
  status: "playing" | "victory" | "defeat";
  thinking: boolean;
  rolling: number | null;
  lastRoll: LastRoll | null;
  dmError: string | null;
}
