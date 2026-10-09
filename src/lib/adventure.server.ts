import { SKILL_ABILITY } from "@/game/data";
import type { DMContext, DMInput, DMResponse } from "@/game/dm/types";
import type { EnemyTemplate, Item, LoreCategory, LoreEntry, Quest, Scenario, ScenarioScene, Skill } from "@/game/types";
import { FACTIONS, REGIONS, THREATS, TONES, TWISTS, factionById, regionById, worldCanonText } from "@/game/world";

const SKILLS = Object.keys(SKILL_ABILITY) as Skill[];
const LORE_CATS: LoreCategory[] = ["place", "faction", "person", "creature", "history", "deity"];
const DICE = /^\d{1,2}d(4|6|8|10|12|20)([+-]\d{1,2})?$/;
const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)]!;
const str = (v: unknown, max = 600, fb = "") => (typeof v === "string" ? v.trim().slice(0, max) : fb);
const num = (v: unknown, lo: number, hi: number, fb: number) => (typeof v === "number" && isFinite(v) ? Math.round(Math.min(hi, Math.max(lo, v))) : fb);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = { [k: string]: any };
const obj = (v: unknown): Loose => (v && typeof v === "object" && !Array.isArray(v) ? (v as Loose) : {});
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "x";

/* ---------------- Scenario forge ---------------- */

export interface ForgeOptions { regionId?: string | undefined; tone?: string | undefined; heroSummary: string }

/** Stage 1: deterministic seed from world tables — guarantees variety within canon. */
export function seedScenario(opts: ForgeOptions) {
  const region = REGIONS.find((r) => r["id"] === opts.regionId) ?? pick(REGIONS);
  return {
    region,
    faction: pick(FACTIONS),
    threat: pick(THREATS),
    twist: pick(TWISTS),
    tone: (TONES as readonly string[]).includes(opts.tone ?? "") ? opts.tone! : pick(TONES),
  };
}

const FORGE_SYSTEM = `You are the scenario architect for a dark-fantasy tabletop RPG set in a shared world. You receive world canon and a fixed seed (region, faction, threat, twist, tone). Build ONE short adventure for a level-3 hero that fits the canon exactly. Do not invent new gods or regions; you may invent local places, NPCs and creatures.

Return ONLY a JSON object with this shape:
{
 "title": string, "tagline": string (one sentence),
 "secrets": string (DM-only truth behind the adventure, including the twist, 3-5 sentences),
 "openingNarration": string (2-4 vivid sentences, second person, ends with a situation to act on),
 "openingNpc": {"name": string, "line": string} | null,
 "startChoices": [3 short first-person actions],
 "scenes": [4 objects {"id": kebab-case, "name", "description", "goal", "enemies": [enemy keys]}] — scene 1 is the hook (social/exploration, may hold weak foes), scene 2 exploration/puzzle (no enemies), scene 3 a fight, scene 4 the finale with exactly one boss,
 "enemies": {"key": {"name","description","maxHp","ac","attackBonus","damage" (dice like "1d6+2"),"xp"}} — 2-4 types, minions maxHp 8-16, boss maxHp 24-34,
 "quests": [{"id": "q-main", "title","description","objectives":[3 strings, one per scene 1, 2 and 4]}, {"id": "q-side","title","description","objectives":[1 string]}],
 "lore": [5-7 {"id": "l-...", "category": one of place|faction|person|creature|history|deity, "title", "text" (1-2 sentences)}] — include the boss, a key NPC, a local place, and one entry hinting at the twist.
}`;

export async function forgeScenario(opts: ForgeOptions, generate: (s: string, p: string) => Promise<unknown>): Promise<Scenario> {
  const seed = seedScenario(opts);
  const prompt = `${worldCanonText()}

SEED
Region: ${seed.region.name} — ${seed.region.summary} Typical dangers: ${seed.region.dangers.join(", ")}.
Faction involved: ${seed.faction.name} — ${seed.faction.summary} Goal: ${seed.faction.goal}
Threat: ${seed.threat}
Twist: ${seed.twist}
Tone: ${seed.tone}
Hero: ${opts.heroSummary}`;
  const raw = await generate(FORGE_SYSTEM, prompt);
  return normalizeScenario(raw, seed);
}

/** Stage 3: rules validation — clamps stats and repairs references so the game engine can trust it. */
function normalizeScenario(raw: unknown, seed: ReturnType<typeof seedScenario>): Scenario {
  const r = obj(raw);
  const enemies: Record<string, EnemyTemplate> = {};
  Object.entries(obj(r["enemies"])).slice(0, 5).forEach(([k, v]) => {
    const e = obj(v);
    const key = slug(k);
    const maxHp = num(e["maxHp"], 6, 40, 12);
    const boss = maxHp >= 22;
    enemies[key] = {
      name: str(e["name"], 60, key),
      description: str(e["description"], 200),
      maxHp,
      ac: num(e["ac"], 10, boss ? 15 : 14, 12),
      attackBonus: num(e["attackBonus"], 2, boss ? 5 : 4, 3),
      damage: DICE.test(str(e["damage"])) ? str(e["damage"]) : boss ? "1d8+2" : "1d6+1",
      xp: num(e["xp"], 10, 250, boss ? 200 : 40),
    };
  });
  if (!Object.keys(enemies).length) enemies["foe"] = { name: "Shadow Thing", description: "Hungry dark.", maxHp: 12, ac: 12, attackBonus: 3, damage: "1d6+1", xp: 40 };
  const keys = Object.keys(enemies);
  const bossKey = keys.reduce((a, b) => (enemies[b]!.maxHp > enemies[a]!.maxHp ? b : a));

  const usedIds = new Set<string>();
  let scenes: ScenarioScene[] = arr(r["scenes"]).slice(0, 5).map((v, i) => {
    const s = obj(v);
    let id = slug(str(s["id"], 40) || str(s["name"], 40) || `scene-${i + 1}`);
    while (usedIds.has(id)) id += "-b";
    usedIds.add(id);
    return { id, name: str(s["name"], 60, `Scene ${i + 1}`), description: str(s["description"], 400), goal: str(s["goal"], 200), enemies: arr(s["enemies"]).map((x) => slug(String(x))).filter((x) => keys.includes(x)).slice(0, 3) };
  });
  if (scenes.length < 2) scenes = [{ id: "start", name: "The Beginning", description: "", goal: "Find the threat.", enemies: [] }, { id: "finale", name: "The Finale", description: "", goal: "Defeat the boss.", enemies: [bossKey] }];
  const last = scenes[scenes.length - 1]!;
  if (!last.enemies.includes(bossKey)) last.enemies = [bossKey];

  const quests: Quest[] = arr(r["quests"]).slice(0, 3).map((v, i) => {
    const q = obj(v);
    return {
      id: i === 0 ? "q-main" : slug(str(q["id"], 30) || `q-side-${i}`),
      title: str(q["title"], 80, i === 0 ? "The Main Quest" : "A Side Errand"),
      description: str(q["description"], 240),
      objectives: arr(q["objectives"]).slice(0, 5).map((o) => ({ text: str(o, 140), done: false })).filter((o) => o["text"]),
    };
  }).filter((q) => q["objectives"].length);
  if (!quests.length) quests.push({ id: "q-main", title: "The Main Quest", description: "", objectives: [{ text: "End the threat", done: false }] });

  const lore: LoreEntry[] = arr(r["lore"]).slice(0, 10).map((v, i) => {
    const l = obj(v);
    const cat = str(l["category"]) as LoreCategory;
    return { id: `l-${slug(str(l["id"], 30) || String(i))}-${i}`, category: LORE_CATS.includes(cat) ? cat : "history", title: str(l["title"], 80), text: str(l["text"], 400) };
  }).filter((l) => l["title"] && l["text"]);

  const npc = obj(r["openingNpc"]);
  return {
    id: `gen-${Date.now().toString(36)}`,
    title: str(r["title"], 80, "An Untold Tale"),
    tagline: str(r["tagline"], 200),
    regionId: seed.region.id,
    factionId: seed.faction.id,
    threat: seed.threat,
    twist: seed.twist,
    tone: seed.tone,
    secrets: str(r["secrets"], 1200),
    openingNarration: str(r["openingNarration"], 900, "Your tale begins."),
    openingNpc: str(npc["name"]) && str(npc["line"]) ? { name: str(npc["name"], 60), line: str(npc["line"], 300) } : undefined,
    startChoices: arr(r["startChoices"]).map((c) => str(c, 120)).filter(Boolean).slice(0, 4),
    scenes,
    enemies,
    quests,
    lore,
  };
}

/* ---------------- Dungeon Master ---------------- */

const DM_SYSTEM = `You are "The Chronicler", the Dungeon Master of a dark-fantasy tabletop RPG. Narrate in second person, vivid but concise (2-5 sentences). Stay consistent with the world canon, scenario secrets and discovered lore. Let the player attempt anything; consequences should be fair and interesting. Reveal the secrets gradually, never all at once.

Rules:
- When an action is uncertain, ask for a skill check instead of resolving it: set "check". Do not ask for a check after a check result; resolve it.
- Skills: ${SKILLS.join(", ")}. DC 10 easy, 13 moderate, 15 hard, 18 very hard.
- Start combat only with enemy keys listed for the CURRENT scene (or the scenario's enemies if it clearly makes sense). The game engine runs combat; after "combat-end" narrate the aftermath and usually advance the scene.
- Advance "scene" to the next scene id when the current scene's goal is achieved. Never skip to the finale early.
- Mark quest objectives done with completeObjective (questId, zero-based index) when earned.
- "damage"/"heal" are dice expressions like "1d4" or "2d4+2"; use sparingly.
- Use "revealLore" with ids of lore entries the hero has just learned. Use "newLore" (rarely) for important new facts you invent.
- Set "victory": true only when the finale's boss is defeated and the main quest resolved.
- Always offer 2-4 short first-person "choices" unless starting combat or asking for a check.

Return ONLY JSON: {"narration": string, "npc": {"name","line"} | null, "check": {"skill","dc","reason"} | null, "startCombat": [keys] | null, "scene": id | null, "completeObjective": [{"questId","index"}] | null, "damage": string | null, "heal": string | null, "loot": [{"name","kind": "potion"|"misc"|"weapon","description","heal"?: dice,"damage"?: dice}] | null, "revealLore": [ids] | null, "newLore": [{"category","title","text"}] | null, "choices": [strings] | null, "victory": boolean}`;

function describeInput(input: DMInput) {
  switch (input.kind) {
    case "start": return "The adventure begins. Set the scene.";
    case "action": return `Player action: "${input.text}"`;
    case "check": return `Skill check result: ${input.check.skill} (reason: ${input.check.reason}) rolled natural ${input.natural}, total ${input.total} vs DC ${input.check.dc} — ${input.success ? "SUCCESS" : "FAILURE"}${input.natural === 20 ? " (critical!)" : input.natural === 1 ? " (disaster!)" : ""}. Narrate the outcome.`;
    case "combat-end": return input.victory ? "Combat ended: the hero WON. Narrate the aftermath and move the story forward." : "The hero was defeated.";
  }
}

export async function runDM(ctx: DMContext, input: DMInput, generate: (s: string, p: string) => Promise<unknown>): Promise<DMResponse> {
  const s = ctx.scenario;
  const c = ctx.character;
  const sceneIdx = s["scenes"].findIndex((x) => x.id === ctx.scene);
  const scene = s["scenes"][sceneIdx];
  const prompt = `${worldCanonText()}

SCENARIO "${s["title"]}" — ${s["tagline"]}
Region: ${regionById(s["regionId"]).name}. Faction: ${factionById(s["factionId"]).name}. Threat: ${s["threat"]}. Tone: ${s["tone"]}.
DM-only secrets: ${s["secrets"]} Twist: ${s["twist"]}
Scenes (in order): ${s["scenes"].map((x, i) => `[${i + 1}] id="${x.id}" ${x.name}: ${x.description} Goal: ${x.goal} Enemies: ${x.enemies.join(", ") || "none"}`).join(" | ")}
Enemy keys: ${Object.entries(s["enemies"]).map(([k, e]) => `${k} (${e["name"]})`).join(", ")}
Quests: ${ctx.quests.map((q) => `${q["id"]} "${q["title"]}": ${q["objectives"].map((o, i) => `[${i}${o["done"] ? " done" : ""}] ${o["text"]}`).join("; ")}`).join(" | ")}
Lore ids (★ = already known): ${s["lore"].map((l) => `${l["id"]}${ctx.knownLore.includes(l["id"]) ? "★" : ""} ${l["title"]}`).join("; ")}

CURRENT SCENE: ${scene ? `"${scene.id}" ${scene.name}${sceneIdx === s["scenes"].length - 1 ? " (FINALE)" : ""}` : ctx.scene}
HERO: ${c.name}, level ${c.level} ${c.race} ${c.cls}, HP ${c.hp}/${c.maxHp}, AC ${c.ac}. Trained skills: ${c.skills.join(", ")}. Carrying: ${c.inventory.map((i) => i.name).join(", ")}.

RECENT STORY:
${ctx.recent.map((n) => `${n.speaker === "npc" ? n.name : n.speaker}: ${n.text}`).join("\n").slice(-3500)}

NOW: ${describeInput(input)}`;
  const raw = await generate(DM_SYSTEM, prompt);
  return normalizeDM(raw, ctx);
}

function normalizeDM(raw: unknown, ctx: DMContext): DMResponse {
  const r = obj(raw);
  const s = ctx.scenario;
  const out: DMResponse = { narration: str(r["narration"], 1500, "The Chronicler pauses, then gestures for you to continue.") };
  const npc = obj(r["npc"]);
  if (str(npc["name"]) && str(npc["line"])) out.npc = { name: str(npc["name"], 60), line: str(npc["line"], 400) };
  const check = obj(r["check"]);
  const skill = SKILLS.find((k) => k.toLowerCase() === str(check["skill"]).toLowerCase());
  if (skill) out.check = { skill, ability: SKILL_ABILITY[skill], dc: num(check["dc"], 5, 25, 13), reason: str(check["reason"], 160, skill) };
  const combat = arr(r["startCombat"]).map((x) => String(x)).filter((k) => k in s["enemies"]).slice(0, 4);
  if (combat.length) out.startCombat = combat;
  const scene = str(r["scene"]);
  if (scene && s["scenes"].some((x) => x.id === scene)) out.scene = scene;
  const objs = arr(r["completeObjective"]).map(obj).map((o) => ({ questId: str(o["questId"]), index: num(o["index"], 0, 9, -1) })).filter((o) => o["index"] >= 0 && ctx.quests.some((q) => q["id"] === o["questId"]));
  if (objs.length) out.completeObjective = objs;
  if (DICE.test(str(r["damage"]))) out.damage = str(r["damage"]);
  if (DICE.test(str(r["heal"]))) out.heal = str(r["heal"]);
  const loot: Item[] = arr(r["loot"]).map(obj).slice(0, 3).map((l) => {
    const name = str(l["name"], 60);
    const kind = (["potion", "misc", "weapon"].includes(str(l["kind"])) ? str(l["kind"]) : "misc") as Item["kind"];
    const heal = DICE.test(str(l["heal"])) ? str(l["heal"]) : kind === "potion" ? "2d4+2" : undefined;
    const damage = kind === "weapon" ? (DICE.test(str(l["damage"])) ? str(l["damage"]) : "1d8") : undefined;
    return { id: kind === "potion" && heal === "2d4+2" ? "potion-healing" : `i-${slug(name)}`, name, kind, description: str(l["description"], 200), qty: 1, heal, damage, ability: kind === "weapon" ? ("str" as const) : undefined };
  }).filter((i) => i.name);
  if (loot.length) out.loot = loot;
  const reveal = arr(r["revealLore"]).map(String).filter((id) => s["lore"].some((l) => l["id"] === id));
  if (reveal.length) out.revealLore = reveal;
  const newLore = arr(r["newLore"]).map(obj).slice(0, 2).map((l) => ({ category: (LORE_CATS.includes(str(l["category"]) as LoreCategory) ? str(l["category"]) : "history") as LoreCategory, title: str(l["title"], 80), text: str(l["text"], 400) })).filter((l) => l["title"] && l["text"]);
  if (newLore.length) out.newLore = newLore;
  const choices = arr(r["choices"]).map((c) => str(c, 120)).filter(Boolean).slice(0, 4);
  if (choices.length) out.choices = choices;
  const finale = s["scenes"][s["scenes"].length - 1]?.id;
  if (r["victory"] === true && (ctx.scene === finale || out.scene === finale)) out.victory = true;
  return out;
}


