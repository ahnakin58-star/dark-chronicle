import { Heart, Shield, User } from "lucide-react";
import { ABILITIES, SKILL_ABILITY, checkBonus, xpForNextLevel } from "@/game/data";
import { abilityMod, fmtMod } from "@/game/dice";
import type { Character, Skill } from "@/game/types";
import { Bar, Panel } from "./Panel";

export function CharacterSheet({ c }: { c: Character }) {
  const hpTone = c.hp / c.maxHp > 0.5 ? "verdant" : "crimson";
  return (
    <Panel title="Character" icon={<User className="h-3.5 w-3.5" />}>
      <div className="mb-3">
        <div className="font-display text-xl text-foreground">{c.name}</div>
        <div className="text-sm text-muted-foreground">
          Level {c.level} {c.race} {c.cls}
        </div>
      </div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Heart className="h-3.5 w-3.5 text-crimson" /> Hit Points
        </span>
        <span className="font-display text-foreground">
          {c.hp} / {c.maxHp}
        </span>
      </div>
      <Bar value={c.hp} max={c.maxHp} tone={hpTone} />
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="AC" value={c.ac} icon={<Shield className="mx-auto h-3.5 w-3.5 text-gold" />} />
        <Stat label="Prof" value={fmtMod(c.proficiency)} />
        <Stat label="Gold" value={c.gold} />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        XP {c.xp} / {xpForNextLevel(c.level)}
      </div>
      <div className="mt-1">
        <Bar value={c.xp} max={xpForNextLevel(c.level)} tone="gold" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {ABILITIES.map((a) => (
          <div key={a.key} className="rounded-md border border-border bg-muted/60 py-1.5 text-center">
            <div className="rune-title text-[10px] text-muted-foreground">{a.label}</div>
            <div className="font-display text-lg leading-tight text-foreground">{fmtMod(abilityMod(c.stats[a.key]))}</div>
            <div className="text-xs text-muted-foreground">{c.stats[a.key]}</div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="rune-title mb-1.5 text-[10px] text-muted-foreground">Skills</div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-sm">
          {(Object.keys(SKILL_ABILITY) as Skill[]).map((s) => (
            <li key={s} className="flex justify-between">
              <span className={c.skills.includes(s) ? "text-gold" : "text-muted-foreground"}>
                {c.skills.includes(s) ? "◆ " : ""}
                {s}
              </span>
              <span className="text-foreground">{fmtMod(checkBonus(c, { skill: s, ability: SKILL_ABILITY[s] }))}</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-muted/60 py-1.5">
      {icon}
      <div className="font-display text-lg leading-tight text-foreground">{value}</div>
      <div className="rune-title text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
