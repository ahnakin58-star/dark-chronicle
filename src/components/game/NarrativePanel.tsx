import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Feather, Send } from "lucide-react";
import { checkBonus } from "@/game/data";
import { fmtMod } from "@/game/dice";
import type { GameState } from "@/game/types";
import { cn } from "@/lib/utils";
import { DieShape } from "./Die";

interface Props {
  state: GameState;
  dmName: string;
  onSubmit: (text: string) => void;
  onRollCheck: () => void;
  onDecline: () => void;
  onRetry: () => void;
}

export function NarrativePanel({ state, dmName, onSubmit, onRollCheck, onDecline, onRetry }: Props) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const c = state.character!;
  const inputDisabled = state.thinking || !!state.combat || state.status !== "playing";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [state.narrative.length, state.thinking, state.pendingCheck]);

  useEffect(() => {
    if (!inputDisabled) inputRef.current?.focus();
  }, [inputDisabled]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || inputDisabled) return;
    onSubmit(text);
    setText("");
  };

  return (
    <section className="parchment flex min-h-[520px] flex-col lg:h-[calc(100vh-7.5rem)]">
      <header className="flex items-center justify-between border-b border-ink/20 px-5 py-3">
        <h2 className="rune-title flex items-center gap-2 text-sm text-ink">
          <Feather className="h-4 w-4" /> The Tale
        </h2>
        <span className="text-xs italic text-ink-muted">Dungeon Master: {dmName}</span>
      </header>

      <div ref={scrollRef} className="scroll-thin flex-1 space-y-4 overflow-y-auto px-5 py-4 md:px-8">
        {state.narrative.map((n, i) => {
          if (n.speaker === "player")
            return (
              <p key={n.id} className="animate-fade-up ml-auto max-w-[85%] rounded-lg border border-crimson/40 bg-crimson/10 px-3 py-2 text-right italic text-ink">
                “{n.text}”
              </p>
            );
          if (n.speaker === "npc")
            return (
              <div key={n.id} className="animate-fade-up border-l-2 border-arcane pl-3">
                <div className="rune-title text-[11px] text-arcane">{n.name}</div>
                <p className="text-lg italic text-ink">“{n.text}”</p>
              </div>
            );
          if (n.speaker === "system")
            return (
              <p key={n.id} className="animate-fade-up text-center text-sm text-ink-muted">
                ✦ {n.text} ✦
              </p>
            );
          return (
            <p key={n.id} className={cn("animate-fade-up text-lg leading-relaxed text-ink", i === 0 && "first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:leading-none first-letter:text-crimson")}>
              {n.text}
            </p>
          );
        })}

        {state.thinking && (
          <p className="flex items-center gap-2 italic text-ink-muted">
            <span className="animate-ember">✦</span> The Dungeon Master considers your fate…
          </p>
        )}

        {state.dmError && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-crimson/50 bg-crimson/10 px-3 py-2 text-sm text-ink">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-crimson" /> {state.dmError}
            </span>
            <button onClick={onRetry} className="rune-title text-xs text-crimson underline">
              Retry
            </button>
          </div>
        )}

        {state.pendingCheck && !state.thinking && (
          <div className="animate-fade-up flex flex-wrap items-center gap-4 rounded-lg border border-ink/30 bg-ink/5 p-4">
            <DieShape sides={20} size={52} rolling={state.rolling === 20} />
            <div className="min-w-0 flex-1">
              <div className="font-display text-ink">
                {state.pendingCheck.skill} check · DC {state.pendingCheck.dc}
              </div>
              <div className="text-sm text-ink-muted">
                d20 {fmtMod(checkBonus(c, state.pendingCheck))} ({state.pendingCheck.ability.toUpperCase()}
                {c.skills.includes(state.pendingCheck.skill) ? ", proficient" : ""})
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={onDecline} className="rounded-md border border-ink/30 px-3 py-2 text-sm text-ink hover:bg-ink/10">
                Reconsider
              </button>
              <button onClick={onRollCheck} disabled={!!state.rolling} className="rune-title rounded-md bg-ink px-4 py-2 text-xs text-parchment transition hover:bg-crimson disabled:opacity-50">
                Roll d20
              </button>
            </div>
          </div>
        )}

        {state.choices.length > 0 && !state.thinking && !state.pendingCheck && (
          <div className="flex flex-wrap gap-2">
            {state.choices.map((ch) => (
              <button key={ch} onClick={() => onSubmit(ch)} className="animate-fade-up rounded-full border border-ink/30 bg-parchment/50 px-3 py-1.5 text-sm text-ink transition hover:border-crimson hover:bg-crimson/10">
                {ch}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="flex gap-2 border-t border-ink/20 p-3">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={inputDisabled}
          placeholder={state.combat ? "Steel is drawn. Choose a combat action below." : "What do you do? e.g. “I inspect the old door”"}
          className="min-w-0 flex-1 rounded-md border border-ink/30 bg-parchment/60 px-3 py-2 text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-crimson/40 disabled:opacity-60"
        />
        <button type="submit" disabled={inputDisabled || !text.trim()} aria-label="Send action" className="rounded-md bg-ink px-4 text-parchment transition hover:bg-crimson disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
