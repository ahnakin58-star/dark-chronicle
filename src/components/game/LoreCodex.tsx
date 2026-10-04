import { useState } from "react";
import { BookOpen } from "lucide-react";
import type { LoreCategory, LoreEntry } from "@/game/types";
import { WORLD_LORE } from "@/game/world";
import { cn } from "@/lib/utils";
import { Panel } from "./Panel";

const LABEL: Record<LoreCategory, string> = { place: "Places", faction: "Factions", person: "People", creature: "Creatures", history: "History", deity: "Gods" };

export function LoreCodex({ discovered, total }: { discovered: LoreEntry[]; total: number }) {
  const [tab, setTab] = useState<"tale" | "world">("tale");
  const [open, setOpen] = useState<string | null>(null);
  const entries = tab === "tale" ? discovered : WORLD_LORE;
  const groups = (Object.keys(LABEL) as LoreCategory[]).map((c) => [c, entries.filter((e) => e.category === c)] as const).filter(([, e]) => e.length);

  return (
    <Panel
      title="Codex"
      icon={<BookOpen className="h-3.5 w-3.5" />}
      action={
        <div className="flex rounded-md border border-border text-[11px]">
          {(["tale", "world"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-2 py-0.5 transition", tab === t ? "bg-accent text-gold" : "text-muted-foreground hover:text-foreground")}>
              {t === "tale" ? `This tale ${discovered.length}/${total}` : "World"}
            </button>
          ))}
        </div>
      }
    >
      {entries.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">Nothing recorded yet. Explore, ask questions, and the codex will fill.</p>
      ) : (
        <div className="scroll-thin max-h-80 space-y-3 overflow-y-auto pr-1">
          {groups.map(([cat, list]) => (
            <div key={cat}>
              <div className="rune-title mb-1 text-[10px] text-muted-foreground">{LABEL[cat]}</div>
              <ul className="space-y-1">
                {list.map((e) => (
                  <li key={e.id} className="animate-fade-up">
                    <button onClick={() => setOpen(open === e.id ? null : e.id)} className="w-full text-left font-display text-sm text-foreground hover:text-gold">
                      {e.title}
                    </button>
                    {open === e.id && <p className="mt-0.5 text-sm italic leading-snug text-muted-foreground">{e.text}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
