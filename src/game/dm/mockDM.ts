import { SKILL_ABILITY } from "../data";
import type { SceneId, Skill } from "../types";
import type { DMContext, DMInput, DMResponse, DungeonMaster } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

const SKILL_KEYWORDS: [RegExp, Skill][] = [
  [/insight|motive|trust|read (his|her|their|the guard)|lying/i, "Insight"],
  [/lie|deceiv|bluff|trick|disguise|pretend/i, "Deception"],
  [/threat|intimidat|scare|menac|glare/i, "Intimidation"],
  [/persuad|convinc|reason|plead|negotiat|talk|ask|charm|bribe|greet/i, "Persuasion"],
  [/sneak|hide|stealth|creep|slip|shadow/i, "Stealth"],
  [/arcane|rune|magic|spell|glyph|sigil|ward/i, "Arcana"],
  [/inspect|search|examin|investigat|study|look|check|door|altar/i, "Investigation"],
  [/listen|watch|spot|perceiv|sense|smell|scan/i, "Perception"],
  [/climb|force|push|break|lift|bash|kick|pry/i, "Athletics"],
  [/jump|dodge|tumble|balance|vault|leap/i, "Acrobatics"],
];
const ATTACK = /attack|fight|strike|charge|kill|stab|slash|draw (my )?(sword|blade|weapon)|cast .*at/i;
const REST = /rest|bandage|catch my breath|pray/i;

interface SceneDef {
  enemies: string[];
  dcs: Partial<Record<Skill, number>>;
  advance: Skill[];
  choices: string[];
  ambient: string[];
  onAdvance: (skill: Skill, ctx: DMContext) => DMResponse;
  onFail: (skill: Skill, ctx: DMContext) => DMResponse;
  onMinor: (skill: Skill, ctx: DMContext) => DMResponse;
}

const CHAPEL_CHOICES = ["I search the altar for hidden catches", "I study the faded runes on the floor", "I listen for sounds below"];
const CRYPT_CHOICES = ["I steady my weapon and step into the ossuary", "I try to sneak past the alcoves", "I raise my torch high"];
const SANCTUM_CHOICES = ["I challenge the Bone Warden", "I try to reason with the dead knight", "I look for a weakness in its armor"];

const SCENES: Record<Exclude<SceneId, "end">, SceneDef> = {
  gate: {
    enemies: ["zealot", "zealot"],
    dcs: { Persuasion: 13, Deception: 12, Intimidation: 14, Stealth: 13, Athletics: 14, Acrobatics: 13, Insight: 11, Investigation: 11, Perception: 11 },
    advance: ["Persuasion", "Deception", "Intimidation", "Stealth", "Athletics", "Acrobatics"],
    choices: ["I try to persuade the captain to let me pass", "I look for another way over the wall", "I study the zealots for weakness"],
    ambient: [
      "Ash drifts down like grey snow. Beyond the gate, the chapel bell tolls once, though no one rings it.",
      "The zealots mutter a dirge. Torches hiss in the drizzle.",
    ],
    onAdvance: (skill) => ({
      narration:
        skill === "Stealth" || skill === "Acrobatics" || skill === "Athletics"
          ? "You find a gap where the palisade has rotted and slip through into the muddy lanes of Ashenford. Nobody raises the alarm. Ahead, Saint Varra's chapel leans against the dark, its door hanging open."
          : "Captain Brenn's jaw works. At last he spits and waves the zealots aside. The gate groans open onto muddy lanes. Ahead, Saint Varra's chapel leans against the dark, its door hanging open.",
      npc: skill === "Persuasion" || skill === "Deception" || skill === "Intimidation" ? { name: "Captain Hal Brenn", line: "Go, then. Feed yourself to the crypt. Saves us the trouble." } : undefined,
      scene: "chapel",
      completeObjective: [{ questId: "q-crypt", index: 0 }],
      choices: CHAPEL_CHOICES,
    }),
    onFail: (skill) =>
      skill === "Stealth" || skill === "Intimidation"
        ? {
            narration: skill === "Stealth" ? "A loose stone skitters underfoot. A zealot's torch swings toward you. \"Intruder!\"" : "Your threat lands badly. Brenn's eyes go flat. \"Cut them down.\"",
            startCombat: ["zealot", "zealot"],
          }
        : skill === "Athletics" || skill === "Acrobatics"
          ? { narration: "The wet timbers give way and you crash down hard into the ditch.", damage: "1d4", choices: ["I try the wall again", "I try talking my way through instead"] }
          : {
              narration: "Brenn isn't moved. The zealots close ranks, hands on their hooked knives.",
              npc: { name: "Captain Hal Brenn", line: "The Ashen Brotherhood holds this gate. Turn around while you still can, stranger." },
              choices: ["I try a different argument", "I draw my weapon", "I look for another way over the wall"],
            },
    onMinor: (skill) => ({
      narration:
        skill === "Insight"
          ? "Brenn's hand trembles on his sword. He's afraid, not of you, but of what is under the chapel. Fear can be leveraged."
          : "You spot a stretch of rotten palisade to the east, half-hidden by brambles. The zealots never look that way.",
      choices: ["I try to persuade the captain to let me pass", "I sneak toward the rotten palisade"],
    }),
  },
  chapel: {
    enemies: [],
    dcs: { Investigation: 12, Perception: 13, Arcana: 12, Athletics: 14 },
    advance: ["Investigation", "Perception", "Arcana", "Athletics"],
    choices: CHAPEL_CHOICES,
    ambient: [
      "Pews lie overturned. Candles that should have died years ago still burn with a thin blue flame.",
      "Cold air breathes up between the flagstones, smelling of earth and iron.",
    ],
    onAdvance: (skill) => ({
      narration:
        skill === "Arcana"
          ? "The runes are a binding ward, half-broken. You speak the missing word and the altar slides aside with a sigh of stone. Stairs spiral down into darkness. Tucked in a niche you find an old healer's flask."
          : "Your fingers find a worn sun-sigil under the altar cloth. You press it and the altar grinds aside, revealing stairs that spiral into the dark. Tucked in a niche you find an old healer's flask.",
      scene: "crypt",
      completeObjective: [{ questId: "q-crypt", index: 1 }],
      loot: [{ id: "potion-healing", name: "Healing Draught", kind: "potion", description: "Bitter red tonic. Restores 2d4+2 HP.", qty: 1, heal: "2d4+2" }],
      choices: CRYPT_CHOICES,
    }),
    onFail: (skill) => ({
      narration:
        skill === "Investigation" || skill === "Athletics"
          ? "Click. A rusted needle jabs from the altar's edge into your palm. It burns like nettle-fire."
          : "Whatever is below, it stays hidden. A cold draft snuffs a candle beside you, as if something exhaled.",
      damage: skill === "Investigation" || skill === "Athletics" ? "1d4" : undefined,
      choices: CHAPEL_CHOICES,
    }),
    onMinor: () => ({ narration: "You learn little more, but the draft from the floor is stronger near the altar.", choices: CHAPEL_CHOICES }),
  },
  crypt: {
    enemies: ["skeleton", "skeleton"],
    dcs: {},
    advance: [],
    choices: CRYPT_CHOICES,
    ambient: ["Skulls watch from every alcove."],
    onAdvance: () => ({ narration: "" }),
    onFail: () => ({ narration: "" }),
    onMinor: () => ({ narration: "" }),
  },
  sanctum: {
    enemies: ["warden"],
    dcs: {},
    advance: [],
    choices: SANCTUM_CHOICES,
    ambient: ["Cold fire burns in the Warden's crown."],
    onAdvance: () => ({ narration: "" }),
    onFail: () => ({ narration: "" }),
    onMinor: () => ({ narration: "" }),
  },
};

function resolve(ctx: DMContext, input: DMInput): DMResponse {
  const { scene, character } = ctx;

  if (input.kind === "start") {
    return {
      narration: `Rain and ash fall together on the road to Ashenford. You are ${character.name}, a ${character.race.toLowerCase()} ${character.cls.toLowerCase()}, and you came because the dead in this village no longer stay buried. The north gate is barred. Grey-robed zealots of the Ashen Brotherhood stand before it, led by a scarred man in rusted mail.`,
      npc: { name: "Captain Hal Brenn", line: "No one enters Ashenford. The crypt has been sealed by holy decree. Go home, wanderer." },
      choices: SCENES.gate.choices,
    };
  }

  if (input.kind === "combat-end") {
    if (!input.victory) return { narration: "Darkness takes you." };
    if (scene === "gate")
      return {
        narration: "The last zealot falls into the mud. Captain Brenn flees into the night. The gate stands open. Ahead, Saint Varra's chapel leans against the dark.",
        scene: "chapel",
        completeObjective: [{ questId: "q-crypt", index: 0 }],
        choices: CHAPEL_CHOICES,
      };
    if (scene === "crypt")
      return {
        narration: "The skeletons collapse into clattering heaps. Beyond the ossuary, a great door of black iron stands ajar. Inside, a figure in ancient plate sits on a throne of bones, and slowly lifts its head.",
        npc: { name: "The Bone Warden", line: "Another thief come for my treasures. Kneel, and join my watch forever." },
        scene: "sanctum",
        choices: SANCTUM_CHOICES,
      };
    if (scene === "sanctum")
      return {
        narration: "The Warden's crown gutters out. Its armor folds in on itself and the cold leaves the air. Among the bones you find a small silver reliquary, warm to the touch. Above, the chapel bell rings once, then falls silent for good.",
        scene: "end",
        completeObjective: [
          { questId: "q-crypt", index: 2 },
          { questId: "q-relic", index: 0 },
        ],
        loot: [{ id: "m-reliquary", name: "Silver Reliquary", kind: "misc", description: "Old Mira's family relic.", qty: 1 }],
        victory: true,
      };
    return { narration: "Silence settles over the battlefield." };
  }

  if (scene === "end") return { narration: "Your tale here is told. Ashenford sleeps quietly at last." };
  const def = SCENES[scene];

  if (input.kind === "check") {
    const { check, success, natural } = input;
    const crit = natural === 20 ? "A perfect roll! " : natural === 1 ? "A disastrous roll. " : "";
    const base = success ? (def.advance.includes(check.skill) ? def.onAdvance(check.skill, ctx) : def.onMinor(check.skill, ctx)) : def.onFail(check.skill, ctx);
    return { ...base, narration: crit + base.narration };
  }

  // Free-form action
  const text = input.text;
  if (scene === "crypt") {
    return {
      narration: `${pick(["As you move,", "Before you can act,", "Your torchlight wavers, and"])} bones rattle in the alcoves. Two skeletons pull themselves free, rusted blades in hand, and lurch toward you.`,
      startCombat: def.enemies,
    };
  }
  if (scene === "sanctum") {
    const talk = /reason|talk|persuad|plead/i.test(text);
    return {
      narration: talk ? "For a moment the cold fire dims, as if the knight remembers who it was. Then it rises, sword grinding against stone." : "The Bone Warden stands, and the throne of bones shudders. Its sword is as long as you are tall.",
      npc: talk ? { name: "The Bone Warden", line: "Oaths... outlast... mercy." } : undefined,
      startCombat: def.enemies,
    };
  }
  if (ATTACK.test(text)) {
    if (def.enemies.length) return { narration: "Steel rings free. The zealots howl and rush you.", startCombat: def.enemies };
    return { narration: "You swing at shadows. Nothing here fights back, yet.", choices: def.choices };
  }
  if (REST.test(text)) {
    return { narration: "You take a few ragged breaths and bind your wounds as best you can.", heal: "1d4", choices: def.choices };
  }
  const match = SKILL_KEYWORDS.find(([re]) => re.test(text));
  if (match) {
    const skill = match[1];
    return {
      narration: `${pick(def.ambient)} You commit to it. This will take some skill.`,
      check: { skill, ability: SKILL_ABILITY[skill], dc: def.dcs[skill] ?? 12, reason: text },
    };
  }
  return {
    narration: `${pick(def.ambient)} Nothing comes of it, but the night is long. What do you do?`,
    choices: def.choices,
  };
}

/** Offline, rules-driven Dungeon Master. Mimics an AI provider's latency and structured output. */
export class MockDungeonMaster implements DungeonMaster {
  name = "The Chronicler";
  async respond(ctx: DMContext, input: DMInput): Promise<DMResponse> {
    await sleep(550 + Math.random() * 500);
    return resolve(ctx, input);
  }
}
