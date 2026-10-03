import { FlaskConical, Shield, Skull, Swords } from "lucide-react";
import { FISTS } from "@/game/data";
import { abilityMod, fmtMod } from "@/game/dice";
import type { Character, CombatState, Enemy } from "@/game/types";
import { cn } from "@/lib/utils";
import { Bar } from "./Panel";

interface Props {
  c: Character;
  combat: CombatState;
  enemies: Enemy[];
  busy: boolean;
  onAttack: () => void;
  onDefend: () => void;
  onDrink: (id: string) => void;
  onTarget: (id: string) => void;
}

export function CombatPanel({ c, combat, enemies, busy, onAttack, onDefend, onDrink, onTarget }: Props) {
  const weapon = c.inventory.find((i) => i.id === c.equippedWeaponId) ?? FISTS;
  const mod = abilityMod(c.stats[weapon.ability ?? "str"]);
  const potion = c.inventory.find((i) => i.heal && i.qty > 0);
  const myTurn = combat.turn === "player" && !busy;

  return (
    <section className="panel animate-fade-up border-crimson/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="rune-title flex items-center gap-2 text-sm text-crimson">
          <Swords className="h-4 w-4" /> Combat · Round {combat.round}
        </h2>
        <span className={cn("rune-title text-xs", myTurn ? "text-gold" : "animate-ember text-muted-foreground")}>{myTurn ? "Your turn" : "Enemy turn…"}</span>
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        {enemies.map((e) => {
          const dead = e.hp <= 0;
          const targeted = combat.targetId === e.id && !dead;
          return (
            <button
              key={e.id}
              disabled={dead}
              onClick={() => onTarget(e.id)}
              className={cn("rounded-md border p-3 text-left transition", targeted ? "border-crimson bg-crimson/10" : "border-border bg-muted/40 hover:border-crimson/50", dead && "opacity-40")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-display text-sm text-foreground">
                  {dead && <Skull className="h-3.5 w-3.5" />}
                  {e.name}
                </span>
                <span className="text-xs text-muted-foreground">AC {e.ac}</span>
              </div>
              <p className="mb-2 text-xs italic text-muted-foreground">{e.description}</p>
              <Bar value={e.hp} max={e.maxHp} />
              <div className="mt-1 text-right text-xs text-muted-foreground">
                {e.hp} / {e.maxHp} HP {targeted && <span className="text-crimson">· targeted</span>}
              </div>
            </button>
          );
        })}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <ActionButton disabled={!myTurn} onClick={onAttack} tone="crimson" icon={<Swords className="h-4 w-4" />} label={`Attack · ${weapon.name}`} sub={`d20${fmtMod(mod + c.proficiency)} to hit · ${weapon.damage}${fmtMod(mod)}`} />
        <ActionButton disabled={!myTurn} onClick={onDefend} tone="arcane" icon={<Shield className="h-4 w-4" />} label="Defend" sub="+2 AC until your next turn" />
        <ActionButton disabled={!myTurn || !potion} onClick={() => potion && onDrink(potion.id)} tone="verdant" icon={<FlaskConical className="h-4 w-4" />} label="Use Potion" sub={potion ? `${potion.name} ×${potion.qty}` : "None left"} />
      </div>
    </section>
  );
}

function ActionButton({ label, sub, icon, onClick, disabled, tone }: { label: string; sub: string; icon: React.ReactNode; onClick: () => void; disabled: boolean; tone: "crimson" | "arcane" | "verdant" }) {
  const toneCls = { crimson: "border-crimson/60 hover:bg-crimson/20", arcane: "border-arcane/60 hover:bg-arcane/20", verdant: "border-verdant/60 hover:bg-verdant/20" }[tone];
  return (
    <button onClick={onClick} disabled={disabled} className={cn("rounded-md border bg-muted/40 px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40", toneCls)}>
      <div className="flex items-center gap-2 font-display text-sm text-foreground">
        {icon}
        {label}
      </div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </button>
  );
}
