import { Backpack, FlaskConical, Gem, Shield, Sword } from "lucide-react";
import type { Character, Item } from "@/game/types";
import { cn } from "@/lib/utils";
import { Panel } from "./Panel";

const ICON: Record<Item["kind"], typeof Sword> = { weapon: Sword, armor: Shield, potion: FlaskConical, misc: Gem };

export function Inventory({ c, canUse, onUse, onEquip }: { c: Character; canUse: boolean; onUse: (id: string) => void; onEquip: (id: string) => void }) {
  return (
    <Panel title="Inventory" icon={<Backpack className="h-3.5 w-3.5" />}>
      {c.inventory.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">Your pack is empty.</p>
      ) : (
        <ul className="space-y-2">
          {c.inventory.map((item) => {
            const Icon = ICON[item.kind];
            const equipped = item.id === c.equippedWeaponId;
            return (
              <li key={item.id} className={cn("flex items-start gap-2.5 rounded-md border p-2", equipped ? "border-gold/50 bg-accent/40" : "border-border bg-muted/40")}>
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", item.kind === "potion" ? "text-crimson" : "text-gold")} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm text-foreground">
                      {item.name}
                      {item.qty > 1 && <span className="text-muted-foreground"> ×{item.qty}</span>}
                    </span>
                    {item.damage && <span className="shrink-0 text-xs text-muted-foreground">{item.damage}</span>}
                  </div>
                  <p className="text-xs leading-snug text-muted-foreground">{item.description}</p>
                </div>
                {item.heal && (
                  <button disabled={!canUse} onClick={() => onUse(item.id)} className="rune-title shrink-0 rounded border border-crimson/60 px-2 py-1 text-[10px] text-foreground transition hover:bg-crimson/30 disabled:opacity-40">
                    Drink
                  </button>
                )}
                {item.kind === "weapon" && !equipped && (
                  <button onClick={() => onEquip(item.id)} className="rune-title shrink-0 rounded border border-border px-2 py-1 text-[10px] text-foreground hover:bg-accent">
                    Equip
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
