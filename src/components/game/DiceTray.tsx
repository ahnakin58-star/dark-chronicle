import { useEffect, useState } from "react";
import { Dices } from "lucide-react";
import { DICE } from "@/game/dice";
import type { LastRoll } from "@/game/types";
import { cn } from "@/lib/utils";
import { DieShape } from "./Die";
import { Panel } from "./Panel";

export function DiceTray({ rolling, lastRoll, onRoll }: { rolling: number | null; lastRoll: LastRoll | null; onRoll: (sides: number) => void }) {
  const [flicker, setFlicker] = useState(1);
  useEffect(() => {
    if (!rolling) return;
    const t = setInterval(() => setFlicker(Math.floor(Math.random() * rolling) + 1), 60);
    return () => clearInterval(t);
  }, [rolling]);

  const shownSides = rolling ?? lastRoll?.sides ?? 20;
  return (
    <Panel title="Dice Tray" icon={<Dices className="h-3.5 w-3.5" />}>
      <div className="mb-4 flex min-h-[132px] flex-col items-center justify-center rounded-md border border-border bg-background/60">
        {rolling || lastRoll ? (
          <>
            <div key={rolling ? "rolling" : lastRoll?.id} className={cn(!rolling && "animate-die-land", lastRoll?.crit && !rolling && "rounded-full glow-gold")}>
              <DieShape sides={shownSides} value={rolling ? flicker : lastRoll!.value} rolling={!!rolling} size={84} />
            </div>
            <div className="mt-2 text-center text-sm">
              {rolling ? (
                <span className="animate-ember text-muted-foreground">Rolling…</span>
              ) : (
                <>
                  <span className="text-muted-foreground">{lastRoll!.label}</span>
                  {lastRoll!.total !== undefined && lastRoll!.total !== lastRoll!.value && <span className="ml-2 font-display text-foreground">Total {lastRoll!.total}</span>}
                  {lastRoll!.crit && <span className="rune-title ml-2 text-xs text-gold">Critical!</span>}
                  {lastRoll!.fumble && <span className="rune-title ml-2 text-xs text-crimson">Fumble</span>}
                </>
              )}
            </div>
          </>
        ) : (
          <p className="px-4 text-center text-sm italic text-muted-foreground">Click a die to roll it. Checks and attacks roll here too.</p>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {DICE.map((d) => (
          <button
            key={d}
            onClick={() => onRoll(d)}
            disabled={!!rolling}
            aria-label={`Roll d${d}`}
            className="flex flex-col items-center rounded-md border border-transparent p-1 transition hover:-translate-y-0.5 hover:border-border hover:bg-accent/40 disabled:opacity-50"
          >
            <DieShape sides={d} size={44} />
          </button>
        ))}
      </div>
    </Panel>
  );
}
