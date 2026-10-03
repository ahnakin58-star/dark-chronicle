import { useState } from "react";
import { Dices } from "lucide-react";
import { ABILITIES, CLASSES, RACES, applyRace, createCharacter, type ClassName } from "@/game/data";
import { abilityMod, fmtMod, roll4d6DropLowest } from "@/game/dice";
import type { Character, Stats } from "@/game/types";
import { cn } from "@/lib/utils";

export function CharacterCreation({ onStart }: { onStart: (c: Character) => void }) {
  const [name, setName] = useState("Kael Ashborn");
  const [race, setRace] = useState("Human");
  const [cls, setCls] = useState<ClassName>("Fighter");
  const [base, setBase] = useState<Stats>(CLASSES.Fighter.stats);
  const preview = createCharacter(name, race, cls, base);
  const final = applyRace(base, race);

  const pickClass = (c: ClassName) => {
    setCls(c);
    setBase(CLASSES[c].stats);
  };
  const rollStats = () => setBase({ str: roll4d6DropLowest(), dex: roll4d6DropLowest(), con: roll4d6DropLowest(), int: roll4d6DropLowest(), wis: roll4d6DropLowest(), cha: roll4d6DropLowest() });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      <div className="mb-10 text-center">
        <p className="rune-title mb-3 text-xs text-gold">A tale of ash and bone</p>
        <h1 className="font-display text-4xl text-foreground md:text-6xl">The Hollow Crypt</h1>
        <p className="mx-auto mt-3 max-w-lg text-lg italic text-muted-foreground">Forge your hero. The dead of Ashenford will not wait long.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="panel space-y-6 p-6">
          <label className="block">
            <span className="rune-title text-xs text-gold">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={32} className="mt-2 w-full rounded-md border border-input bg-background/60 px-3 py-2 font-display text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>

          <div>
            <span className="rune-title text-xs text-gold">Ancestry</span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(RACES).map(([r, d]) => (
                <Choice key={r} active={race === r} onClick={() => setRace(r)} title={r} sub={d.blurb} />
              ))}
            </div>
          </div>

          <div>
            <span className="rune-title text-xs text-gold">Class</span>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(CLASSES) as ClassName[]).map((c) => (
                <Choice key={c} active={cls === c} onClick={() => pickClass(c)} title={c} sub={CLASSES[c].blurb} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="rune-title text-xs text-gold">Ability Scores</span>
              <div className="flex gap-2">
                <button onClick={() => setBase(CLASSES[cls].stats)} className="rounded-md border border-border px-3 py-1 text-sm text-muted-foreground hover:bg-accent">
                  Recommended
                </button>
                <button onClick={rollStats} className="flex items-center gap-1.5 rounded-md border border-gold/50 px-3 py-1 text-sm text-gold hover:bg-accent">
                  <Dices className="h-4 w-4" /> Roll 4d6
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {ABILITIES.map((a) => (
                <div key={a.key} className="rounded-md border border-border bg-muted/60 py-2 text-center">
                  <div className="rune-title text-[10px] text-muted-foreground">{a.label}</div>
                  <div className="font-display text-2xl text-foreground">{final[a.key]}</div>
                  <div className="text-xs text-gold">{fmtMod(abilityMod(final[a.key]))}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="parchment flex flex-col p-6">
          <div className="rune-title text-xs text-ink-muted">Your hero</div>
          <div className="mt-1 font-display text-2xl text-ink">{preview.name}</div>
          <div className="italic text-ink-muted">
            Level {preview.level} {race} {cls}
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-ink">
            <div>
              <dt className="rune-title text-[10px] text-ink-muted">Hit Points</dt>
              <dd className="font-display text-2xl">{preview.maxHp}</dd>
            </div>
            <div>
              <dt className="rune-title text-[10px] text-ink-muted">Armor Class</dt>
              <dd className="font-display text-2xl">{preview.ac}</dd>
            </div>
          </dl>
          <div className="rune-title mt-5 text-[10px] text-ink-muted">Starting gear</div>
          <ul className="mt-1 space-y-0.5 text-ink">
            {preview.inventory.map((i) => (
              <li key={i.id}>
                · {i.name}
                {i.qty > 1 ? ` ×${i.qty}` : ""}
              </li>
            ))}
          </ul>
          <button onClick={() => onStart(preview)} className="rune-title mt-auto w-full rounded-md bg-ink px-4 py-3 text-sm text-parchment transition hover:bg-crimson max-lg:mt-6">
            Begin the Adventure
          </button>
        </aside>
      </div>
    </main>
  );
}

function Choice({ active, onClick, title, sub }: { active: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button onClick={onClick} className={cn("rounded-md border p-3 text-left transition", active ? "border-gold bg-accent/60 glow-gold" : "border-border bg-muted/40 hover:border-gold/50")}>
      <div className="font-display text-foreground">{title}</div>
      <div className="text-xs leading-snug text-muted-foreground">{sub}</div>
    </button>
  );
}
