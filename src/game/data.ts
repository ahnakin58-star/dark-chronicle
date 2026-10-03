import { abilityMod } from "./dice";
import type { Ability, Character, Enemy, Item, Quest, Skill, SkillCheck, Stats } from "./types";

export const ABILITIES: { key: Ability; label: string }[] = [
  { key: "str", label: "STR" },
  { key: "dex", label: "DEX" },
  { key: "con", label: "CON" },
  { key: "int", label: "INT" },
  { key: "wis", label: "WIS" },
  { key: "cha", label: "CHA" },
];

export const SKILL_ABILITY: Record<Skill, Ability> = {
  Athletics: "str",
  Acrobatics: "dex",
  Stealth: "dex",
  Investigation: "int",
  Arcana: "int",
  Perception: "wis",
  Insight: "wis",
  Persuasion: "cha",
  Deception: "cha",
  Intimidation: "cha",
};

export const RACES: Record<string, { bonus: Partial<Stats>; blurb: string }> = {
  Human: { bonus: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, blurb: "Adaptable and stubborn." },
  Elf: { bonus: { dex: 2, int: 1 }, blurb: "Keen-eyed, long-memoried." },
  Dwarf: { bonus: { con: 2, str: 1 }, blurb: "Hard as mountain stone." },
  Halfling: { bonus: { dex: 2, cha: 1 }, blurb: "Small, lucky, quick." },
};

const potion = (qty: number): Item => ({
  id: "potion-healing",
  name: "Healing Draught",
  kind: "potion",
  description: "Bitter red tonic. Restores 2d4+2 HP.",
  qty,
  heal: "2d4+2",
});

export type ClassName = "Fighter" | "Rogue" | "Wizard" | "Cleric";

export const CLASSES: Record<
  ClassName,
  { hitDie: number; baseAc: number; addDex: boolean; skills: Skill[]; blurb: string; stats: Stats; kit: () => Item[] }
> = {
  Fighter: {
    hitDie: 10,
    baseAc: 16,
    addDex: false,
    skills: ["Athletics", "Intimidation", "Perception"],
    blurb: "Steel, grit, and a shield arm.",
    stats: { str: 15, dex: 13, con: 14, int: 8, wis: 12, cha: 10 },
    kit: () => [
      { id: "w-longsword", name: "Longsword", kind: "weapon", description: "Notched but true.", qty: 1, damage: "1d8", ability: "str" },
      { id: "a-chain", name: "Chain Mail", kind: "armor", description: "AC 16. Heavy and loud.", qty: 1 },
      potion(2),
      { id: "m-torch", name: "Torch", kind: "misc", description: "Pitch-soaked rag on a stick.", qty: 3 },
    ],
  },
  Rogue: {
    hitDie: 8,
    baseAc: 12,
    addDex: true,
    skills: ["Stealth", "Acrobatics", "Deception", "Investigation"],
    blurb: "Quiet feet, quicker blade.",
    stats: { str: 8, dex: 15, con: 13, int: 12, wis: 10, cha: 14 },
    kit: () => [
      { id: "w-rapier", name: "Rapier", kind: "weapon", description: "Thin, cruel, elegant.", qty: 1, damage: "1d8", ability: "dex" },
      { id: "a-leather", name: "Studded Leather", kind: "armor", description: "AC 12 + DEX.", qty: 1 },
      potion(2),
      { id: "m-tools", name: "Thieves' Tools", kind: "misc", description: "Picks, wires, a tiny mirror.", qty: 1 },
    ],
  },
  Wizard: {
    hitDie: 6,
    baseAc: 10,
    addDex: true,
    skills: ["Arcana", "Investigation", "Insight"],
    blurb: "Words that bend the world.",
    stats: { str: 8, dex: 13, con: 14, int: 15, wis: 12, cha: 10 },
    kit: () => [
      { id: "w-bolt", name: "Arcane Bolt", kind: "weapon", description: "A lance of violet fire from your staff.", qty: 1, damage: "1d10", ability: "int" },
      { id: "m-spellbook", name: "Spellbook", kind: "misc", description: "Ink that shifts when unwatched.", qty: 1 },
      potion(2),
      { id: "m-scroll", name: "Scroll of Light", kind: "misc", description: "Unread. For dark places.", qty: 1 },
    ],
  },
  Cleric: {
    hitDie: 8,
    baseAc: 16,
    addDex: false,
    skills: ["Insight", "Persuasion", "Perception"],
    blurb: "A lantern against the long night.",
    stats: { str: 13, dex: 10, con: 14, int: 8, wis: 15, cha: 12 },
    kit: () => [
      { id: "w-mace", name: "Blessed Mace", kind: "weapon", description: "Strikes with the weight of faith.", qty: 1, damage: "1d8", ability: "wis" },
      { id: "a-scale", name: "Scale Mail & Shield", kind: "armor", description: "AC 16.", qty: 1 },
      potion(3),
      { id: "m-symbol", name: "Holy Symbol", kind: "misc", description: "Silver sun, worn smooth.", qty: 1 },
    ],
  },
};

export function applyRace(base: Stats, race: string): Stats {
  const bonus = RACES[race]?.bonus ?? {};
  const out = { ...base };
  (Object.keys(bonus) as Ability[]).forEach((k) => (out[k] += bonus[k] ?? 0));
  return out;
}

export function createCharacter(name: string, race: string, cls: ClassName, base: Stats): Character {
  const c = CLASSES[cls];
  const stats = applyRace(base, race);
  const con = abilityMod(stats.con);
  const level = 3;
  const maxHp = c.hitDie + 2 * (c.hitDie / 2 + 1) + level * con;
  const kit = c.kit();
  return {
    name: name.trim() || "Nameless Wanderer",
    race,
    cls,
    level,
    hp: maxHp,
    maxHp,
    ac: c.baseAc + (c.addDex ? abilityMod(stats.dex) : 0),
    proficiency: 2,
    stats,
    skills: c.skills,
    inventory: kit,
    equippedWeaponId: kit.find((i) => i.kind === "weapon")!.id,
    gold: 15,
    xp: 0,
  };
}

export const xpForNextLevel = (level: number) => (level - 2) * 150;

export function checkBonus(c: Character, check: Pick<SkillCheck, "skill" | "ability">) {
  return abilityMod(c.stats[check.ability]) + (c.skills.includes(check.skill) ? c.proficiency : 0);
}

export const ENEMIES: Record<string, Omit<Enemy, "id" | "hp">> = {
  zealot: { name: "Ashen Zealot", maxHp: 11, ac: 12, attackBonus: 3, damage: "1d6+1", xp: 25, description: "Grey-robed, ash-smeared, fanatical." },
  skeleton: { name: "Restless Skeleton", maxHp: 13, ac: 13, attackBonus: 4, damage: "1d6+2", xp: 50, description: "Bones bound by old hate." },
  warden: { name: "The Bone Warden", maxHp: 26, ac: 14, attackBonus: 4, damage: "1d8+2", xp: 200, description: "A knight's corpse crowned in cold fire." },
};

export const initialQuests = (): Quest[] => [
  {
    id: "q-crypt",
    title: "The Hollow Crypt",
    description: "Something beneath Ashenford is waking the dead. End it.",
    objectives: [
      { text: "Get past the zealots at the north gate", done: false },
      { text: "Find the hidden way beneath Saint Varra's chapel", done: false },
      { text: "Put the Bone Warden to rest", done: false },
    ],
  },
  {
    id: "q-relic",
    title: "Old Mira's Reliquary",
    description: "The innkeeper's family relic was buried with the Warden.",
    objectives: [{ text: "Recover the silver reliquary", done: false }],
  },
];

export const FISTS: Item = { id: "fists", name: "Bare Fists", kind: "weapon", description: "", qty: 1, damage: "1d4", ability: "str" };
