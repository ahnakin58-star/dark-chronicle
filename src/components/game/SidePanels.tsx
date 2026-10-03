import { Check, Circle, ScrollText, History } from "lucide-react";
import type { LogEntry, Quest, Tone } from "@/game/types";
import { cn } from "@/lib/utils";
import { Panel } from "./Panel";

export function QuestTracker({ quests }: { quests: Quest[] }) {
  return (
    <Panel title="Quests" icon={<ScrollText className="h-3.5 w-3.5" />}>
      <div className="space-y-4">
        {quests.map((q) => {
          const done = q.objectives.every((o) => o.done);
          return (
            <div key={q.id}>
              <div className={cn("font-display text-sm", done ? "text-verdant" : "text-foreground")}>{q.title}</div>
              <p className="mb-1.5 text-xs italic text-muted-foreground">{q.description}</p>
              <ul className="space-y-1">
                {q.objectives.map((o) => (
                  <li key={o.text} className={cn("flex items-start gap-2 text-sm", o.done ? "text-muted-foreground line-through" : "text-foreground")}>
                    {o.done ? <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-verdant" /> : <Circle className="mt-1 h-2.5 w-2.5 shrink-0 text-gold" />}
                    {o.text}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

const TONE: Record<Tone, string> = {
  crit: "border-l-gold text-gold",
  fumble: "border-l-crimson text-crimson",
  success: "border-l-verdant text-foreground",
  failure: "border-l-crimson/60 text-foreground",
  neutral: "border-l-border text-foreground",
  damage: "border-l-crimson text-foreground",
  heal: "border-l-verdant text-verdant",
};

export function ActivityLog({ log }: { log: LogEntry[] }) {
  return (
    <Panel title="Activity Log" icon={<History className="h-3.5 w-3.5" />}>
      {log.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">No rolls yet. Fate is waiting.</p>
      ) : (
        <ul className="scroll-thin max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {log.map((l) => (
            <li key={l.id} className={cn("animate-fade-up border-l-2 pl-2.5", TONE[l.tone])}>
              <div className="text-sm leading-tight">{l.title}</div>
              {l.detail && <div className="text-xs text-muted-foreground">{l.detail}</div>}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
