export const DICE = [4, 6, 8, 10, 12, 20, 100] as const;
export type DieSides = (typeof DICE)[number];

export const rollDie = (sides: number) => Math.floor(Math.random() * sides) + 1;
export const abilityMod = (score: number) => Math.floor((score - 10) / 2);
export const fmtMod = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

export interface RollResult {
  rolls: number[];
  bonus: number;
  total: number;
  sides: number;
}

/** Roll an expression like "2d6+3". Critical hits double the dice. */
export function rollExpr(expr: string, critical = false): RollResult {
  const m = expr.replace(/\s/g, "").match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!m) return { rolls: [], bonus: 0, total: 0, sides: 0 };
  const count = Number(m[1]) * (critical ? 2 : 1);
  const sides = Number(m[2]);
  const bonus = m[3] ? Number(m[3]) : 0;
  const rolls = Array.from({ length: count }, () => rollDie(sides));
  const total = Math.max(1, rolls.reduce((a, b) => a + b, 0) + bonus);
  return { rolls, bonus, total, sides };
}

export function roll4d6DropLowest() {
  const r = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)].sort((a, b) => a - b);
  return r[1] + r[2] + r[3];
}
