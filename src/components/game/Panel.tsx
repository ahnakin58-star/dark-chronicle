import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ title, icon, action, children, className }: { title: string; icon?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("panel flex flex-col", className)}>
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <h2 className="rune-title flex items-center gap-2 text-xs text-gold">
          {icon}
          {title}
        </h2>
        {action}
      </header>
      <div className="flex-1 p-4">{children}</div>
    </section>
  );
}

export function Bar({ value, max, tone = "crimson" }: { value: number; max: number; tone?: "crimson" | "verdant" | "gold" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = tone === "crimson" ? "bg-crimson" : tone === "verdant" ? "bg-verdant" : "bg-gold";
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full border border-border bg-muted">
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}
