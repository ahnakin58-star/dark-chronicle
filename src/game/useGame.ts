import { useMemo, useRef, useState } from "react";
import { checkBonus, ENEMIES, FISTS, initialQuests, xpForNextLevel } from "./data";
import { abilityMod, fmtMod, rollDie, rollExpr, type RollResult } from "./dice";
import { getDungeonMaster, type DMInput, type DMResponse } from "./dm";
import type { Character, GameState, Item, NarrativeEntry, Tone } from "./types";

let counter = 0;
const uid = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ROLL_MS = 700;

export const createInitialState = (): GameState => ({
  character: null,
  scene: "gate",
  enemies: [],
  combat: null,
  narrative: [],
  log: [],
  quests: initialQuests(),
  pendingCheck: null,
  choices: [],
  status: "playing",
  thinking: false,
  rolling: null,
  lastRoll: null,
  dmError: null,
});

function log(n: GameState, title: string, tone: Tone, detail?: string) {
  n.log.unshift({ id: uid(), time: Date.now(), title, detail, tone });
  n.log = n.log.slice(0, 50);
}
function say(n: GameState, speaker: NarrativeEntry["speaker"], text: string, name?: string) {
  n.narrative.push({ id: uid(), speaker, text, name });
}
function addItem(c: Character, item: Item) {
  const existing = c.inventory.find((i) => i.id === item.id);
  if (existing) existing.qty += item.qty;
  else c.inventory.push({ ...item });
}
const fmtRolls = (r: RollResult) => `[${r.rolls.join(", ")}]${r.bonus ? fmtMod(r.bonus) : ""}`;

function applyResponse(n: GameState, res: DMResponse, rolls: { damage?: RollResult; heal?: RollResult }) {
  const c = n.character!;
  if (res.narration) say(n, "dm", res.narration);
  if (res.npc) say(n, "npc", res.npc.line, res.npc.name);
  if (rolls.damage) {
    c.hp = Math.max(0, c.hp - rolls.damage.total);
    log(n, `You take ${rolls.damage.total} damage`, "damage", `${res.damage} → ${fmtRolls(rolls.damage)}`);
  }
  if (rolls.heal) {
    c.hp = Math.min(c.maxHp, c.hp + rolls.heal.total);
    log(n, `You recover ${rolls.heal.total} HP`, "heal", `${res.heal} → ${fmtRolls(rolls.heal)}`);
  }
  res.loot?.forEach((item) => {
    addItem(c, item);
    log(n, `Found: ${item.name}`, "success");
  });
  res.completeObjective?.forEach(({ questId, index }) => {
    const obj = n.quests.find((q) => q.id === questId)?.objectives[index];
    if (obj && !obj.done) {
      obj.done = true;
      log(n, "Objective complete", "success", obj.text);
    }
  });
  if (res.scene) n.scene = res.scene;
  n.pendingCheck = res.check ?? null;
  n.choices = res.choices ?? [];
  if (res.startCombat?.length) {
    n.enemies = res.startCombat.map((key, i) => {
      const t = ENEMIES[key];
      const dup = res.startCombat!.filter((k) => k === key).length > 1;
      return { ...t, id: `${key}-${i}-${uid()}`, hp: t.maxHp, name: dup ? `${t.name} ${String.fromCharCode(65 + i)}` : t.name };
    });
    n.combat = { round: 1, defending: false, targetId: n.enemies[0].id, turn: "player" };
    n.pendingCheck = null;
    n.choices = [];
    log(n, "Combat begins!", "failure", n.enemies.map((e) => e.name).join(", "));
  }
  if (res.victory) n.status = "victory";
  if (c.hp <= 0) n.status = "defeat";
}

export function useGame() {
  const [state, setState] = useState<GameState>(createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastInput = useRef<{ input: DMInput; text?: string } | null>(null);
  const dm = useMemo(() => getDungeonMaster(), []);

  const mutate = (fn: (n: GameState) => void) =>
    setState((prev) => {
      const n = structuredClone(prev);
      fn(n);
      stateRef.current = n;
      return n;
    });

  async function askDM(input: DMInput, playerText?: string, character?: Character) {
    const s = stateRef.current;
    const ch = character ?? s.character;
    if (!ch) return;
    lastInput.current = { input, text: playerText };
    mutate((n) => {
      n.thinking = true;
      n.dmError = null;
      n.choices = [];
      if (playerText) say(n, "player", playerText);
    });
    try {
      const cur = stateRef.current;
      const res = await dm.respond({ character: ch, scene: cur.scene, quests: cur.quests, recent: cur.narrative.slice(-8) }, input);
      const damage = res.damage ? rollExpr(res.damage) : undefined;
      const heal = res.heal ? rollExpr(res.heal) : undefined;
      mutate((n) => {
        n.thinking = false;
        applyResponse(n, res, { damage, heal });
      });
    } catch (e) {
      mutate((n) => {
        n.thinking = false;
        n.dmError = e instanceof Error ? e.message : "The Dungeon Master fell silent.";
      });
    }
  }

  function retryDM() {
    const l = lastInput.current;
    if (l) void askDM(l.input);
  }

  function start(character: Character) {
    const fresh = { ...createInitialState(), character };
    stateRef.current = fresh;
    setState(fresh);
    void askDM({ kind: "start" }, undefined, character);
  }

  function restart() {
    const fresh = createInitialState();
    stateRef.current = fresh;
    setState(fresh);
  }

  async function rollFree(sides: number) {
    if (stateRef.current.rolling) return;
    mutate((n) => void (n.rolling = sides));
    await sleep(ROLL_MS);
    const value = rollDie(sides);
    mutate((n) => {
      n.rolling = null;
      n.lastRoll = { id: uid(), sides, value, label: `d${sides}`, crit: sides === 20 && value === 20, fumble: sides === 20 && value === 1 };
      log(n, `Rolled d${sides}: ${value}`, value === sides ? "crit" : value === 1 ? "fumble" : "neutral");
    });
  }

  async function resolveCheck() {
    const s = stateRef.current;
    const check = s.pendingCheck;
    if (!check || !s.character || s.rolling) return;
    mutate((n) => void (n.rolling = 20));
    await sleep(ROLL_MS);
    const natural = rollDie(20);
    const bonus = checkBonus(s.character, check);
    const total = natural + bonus;
    const success = natural === 20 || (natural !== 1 && total >= check.dc);
    mutate((n) => {
      n.rolling = null;
      n.pendingCheck = null;
      n.lastRoll = { id: uid(), sides: 20, value: natural, total, label: `${check.skill} check`, crit: natural === 20, fumble: natural === 1 };
      log(n, `${check.skill} ${success ? "succeeded" : "failed"} (${total} vs DC ${check.dc})`, natural === 20 ? "crit" : natural === 1 ? "fumble" : success ? "success" : "failure", `d20 ${natural} ${fmtMod(bonus)}`);
      say(n, "system", `${check.skill} check: rolled ${natural} ${fmtMod(bonus)} = ${total} vs DC ${check.dc}, ${success ? "success" : "failure"}.`);
    });
    await askDM({ kind: "check", check, total, natural, success });
  }

  function declineCheck() {
    mutate((n) => {
      n.pendingCheck = null;
      say(n, "system", "You hold back and reconsider.");
    });
  }

  async function submitAction(text: string) {
    const t = text.trim();
    const s = stateRef.current;
    if (!t || s.thinking || s.combat || s.status !== "playing") return;
    await askDM({ kind: "action", text: t }, t);
  }

  async function endCombat() {
    const s = stateRef.current;
    const xp = s.enemies.reduce((a, e) => a + e.xp, 0);
    mutate((n) => {
      const c = n.character!;
      n.combat = null;
      n.enemies = [];
      c.xp += xp;
      log(n, `Victory! +${xp} XP`, "success");
      while (c.xp >= xpForNextLevel(c.level)) {
        c.level += 1;
        c.maxHp += 6;
        c.hp = c.maxHp;
        if (c.level >= 5) c.proficiency = 3;
        log(n, `Level up! You are now level ${c.level}`, "crit", "+6 max HP, fully healed");
      }
    });
    await askDM({ kind: "combat-end", victory: true });
  }

  async function enemyTurn() {
    await sleep(650);
    const s = stateRef.current;
    if (!s.character || !s.combat) return;
    const ac = s.character.ac + (s.combat.defending ? 2 : 0);
    const attacks = s.enemies
      .filter((e) => e.hp > 0)
      .map((e) => {
        const nat = rollDie(20);
        const total = nat + e.attackBonus;
        const crit = nat === 20;
        const hit = crit || (nat !== 1 && total >= ac);
        const dmg = hit ? rollExpr(e.damage, crit).total : 0;
        return { e, nat, total, crit, hit, dmg };
      });
    const totalDmg = attacks.reduce((a, x) => a + x.dmg, 0);
    const newHp = Math.max(0, s.character.hp - totalDmg);
    mutate((n) => {
      attacks.forEach((a) => {
        if (a.hit) {
          log(n, `${a.e.name} ${a.crit ? "CRITS" : "hits"} you for ${a.dmg}`, a.crit ? "fumble" : "damage", `d20 ${a.nat} → ${a.total} vs AC ${ac}`);
          say(n, "system", `${a.e.name} ${a.crit ? "lands a brutal critical" : "strikes you"} for ${a.dmg} damage.`);
        } else {
          log(n, `${a.e.name} misses`, "neutral", `d20 ${a.nat} → ${a.total} vs AC ${ac}`);
          say(n, "system", `${a.e.name} ${a.nat === 1 ? "stumbles badly and" : ""} misses you.`);
        }
      });
      n.character!.hp = newHp;
      if (newHp <= 0) {
        n.status = "defeat";
        n.combat = null;
        say(n, "dm", "Your vision narrows to a point of cold light. The crypt claims another soul.");
      } else {
        n.combat!.round += 1;
        n.combat!.defending = false;
        n.combat!.turn = "player";
      }
    });
  }

  async function attack() {
    const s = stateRef.current;
    if (!s.character || !s.combat || s.combat.turn !== "player" || s.rolling) return;
    const c = s.character;
    const weapon = c.inventory.find((i) => i.id === c.equippedWeaponId) ?? FISTS;
    const target = s.enemies.find((e) => e.id === s.combat!.targetId && e.hp > 0) ?? s.enemies.find((e) => e.hp > 0);
    if (!target) return;
    mutate((n) => {
      n.rolling = 20;
      n.combat!.turn = "enemy";
    });
    await sleep(ROLL_MS);
    const nat = rollDie(20);
    const mod = abilityMod(c.stats[weapon.ability ?? "str"]);
    const total = nat + mod + c.proficiency;
    const crit = nat === 20;
    const fumble = nat === 1;
    const hit = crit || (!fumble && total >= target.ac);
    const dmg = hit ? rollExpr(weapon.damage ?? "1d4", crit) : null;
    const dmgTotal = dmg ? Math.max(1, dmg.total + mod) : 0;
    const allDead = s.enemies.every((e) => (e.id === target.id ? e.hp - dmgTotal <= 0 : e.hp <= 0));
    mutate((n) => {
      n.rolling = null;
      n.lastRoll = { id: uid(), sides: 20, value: nat, total, label: `Attack: ${target.name}`, crit, fumble };
      const t = n.enemies.find((e) => e.id === target.id)!;
      t.hp = Math.max(0, t.hp - dmgTotal);
      if (hit) {
        log(n, `${crit ? "CRITICAL! " : ""}${weapon.name} hits ${t.name} for ${dmgTotal}`, crit ? "crit" : "success", `d20 ${nat} → ${total} vs AC ${t.ac} · dmg ${fmtRolls(dmg!)}${fmtMod(mod)}`);
        say(n, "system", `${crit ? "Critical hit! " : ""}Your ${weapon.name} strikes ${t.name} for ${dmgTotal} damage.${t.hp <= 0 ? ` ${t.name} falls.` : ""}`);
      } else {
        log(n, fumble ? "Critical fumble!" : `You miss ${t.name}`, fumble ? "fumble" : "failure", `d20 ${nat} → ${total} vs AC ${t.ac}`);
        say(n, "system", fumble ? "Your footing slips and your swing goes wide. A critical fumble." : `Your attack glances off ${t.name}.`);
      }
      if (t.hp <= 0) n.combat!.targetId = n.enemies.find((e) => e.hp > 0)?.id ?? null;
    });
    if (allDead) await endCombat();
    else await enemyTurn();
  }

  async function defend() {
    const s = stateRef.current;
    if (!s.combat || s.combat.turn !== "player") return;
    mutate((n) => {
      n.combat!.defending = true;
      n.combat!.turn = "enemy";
      log(n, "You take a defensive stance (+2 AC)", "neutral");
      say(n, "system", "You brace yourself, guard raised.");
    });
    await enemyTurn();
  }

  async function useItem(id: string) {
    const s = stateRef.current;
    const item = s.character?.inventory.find((i) => i.id === id);
    if (!item?.heal || item.qty <= 0 || s.status !== "playing") return;
    if (s.combat && s.combat.turn !== "player") return;
    const r = rollExpr(item.heal);
    mutate((n) => {
      const c = n.character!;
      const it = c.inventory.find((i) => i.id === id)!;
      it.qty -= 1;
      if (it.qty <= 0) c.inventory = c.inventory.filter((i) => i.id !== id);
      c.hp = Math.min(c.maxHp, c.hp + r.total);
      log(n, `${item.name}: +${r.total} HP`, "heal", `${item.heal} → ${fmtRolls(r)}`);
      say(n, "system", `You drink the ${item.name} and recover ${r.total} HP.`);
      if (n.combat) n.combat.turn = "enemy";
    });
    if (s.combat) await enemyTurn();
  }

  function equip(id: string) {
    mutate((n) => {
      const c = n.character!;
      if (c.inventory.some((i) => i.id === id && i.kind === "weapon")) c.equippedWeaponId = id;
    });
  }

  function setTarget(id: string) {
    mutate((n) => {
      if (n.combat) n.combat.targetId = id;
    });
  }

  return { state, dmName: dm.name, start, restart, rollFree, resolveCheck, declineCheck, submitAction, attack, defend, useItem, equip, setTarget, retryDM };
}

export type GameApi = ReturnType<typeof useGame>;
