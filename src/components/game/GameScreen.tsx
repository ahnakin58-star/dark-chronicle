import { Link } from "@tanstack/react-router";
import { ChevronLeft, Cloud, CloudOff, Loader2, Skull, Trophy } from "lucide-react";
import type { GameApi } from "@/game/useGame";
import { CharacterSheet } from "./CharacterSheet";
import { CombatPanel } from "./CombatPanel";
import { DiceTray } from "./DiceTray";
import { Inventory } from "./Inventory";
import { LoreCodex } from "./LoreCodex";
import { NarrativePanel } from "./NarrativePanel";
import { ActivityLog, QuestTracker } from "./SidePanels";

export type SaveStatus = "saved" | "saving" | "error";

export function GameScreen({ game, saveStatus }: { game: GameApi; saveStatus: SaveStatus }) {
  const { state, scenario } = game;
  const c = state.character!;
  const canDrink = state.status === "playing" && (!state.combat || (state.combat.turn === "player" && !state.rolling));
  const sceneName = scenario.scenes.find((s) => s.id === state.scene)?.name ?? "";

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-3 md:px-5">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link to="/adventures" aria-label="Back to adventures" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl text-foreground md:text-2xl">{scenario.title}</h1>
            <p className="rune-title truncate text-[11px] text-gold">{sceneName}</p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
          {saveStatus === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saveStatus === "error" ? <CloudOff className="h-3.5 w-3.5 text-crimson" /> : <Cloud className="h-3.5 w-3.5 text-verdant" />}
          {saveStatus === "saving" ? "Saving…" : saveStatus === "error" ? "Not saved" : "Saved"}
        </span>
      </header>

      <div className="grid gap-3 lg:grid-cols-[290px_minmax(0,1fr)_310px]">
        <aside className="order-2 space-y-3 lg:order-1 lg:h-[calc(100vh-7.5rem)] lg:overflow-y-auto scroll-thin">
          <CharacterSheet c={c} />
          <Inventory c={c} canUse={canDrink} onUse={game.drinkItem} onEquip={game.equip} />
        </aside>

        <main className="order-1 flex flex-col gap-3 lg:order-2">
          {state.combat && (
            <CombatPanel c={c} combat={state.combat} enemies={state.enemies} busy={!!state.rolling} onAttack={game.attack} onDefend={game.defend} onDrink={game.drinkItem} onTarget={game.setTarget} />
          )}
          <NarrativePanel state={state} dmName={game.dmName} onSubmit={game.submitAction} onRollCheck={game.resolveCheck} onDecline={game.declineCheck} onRetry={game.retryDM} />
        </main>

        <aside className="order-3 space-y-3 lg:h-[calc(100vh-7.5rem)] lg:overflow-y-auto scroll-thin">
          <DiceTray rolling={state.rolling} lastRoll={state.lastRoll} onRoll={game.rollFree} />
          <QuestTracker quests={state.quests} />
          <LoreCodex discovered={state.lore} total={scenario.lore.length} />
          <ActivityLog log={state.log} />
        </aside>
      </div>

      {state.status !== "playing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="parchment animate-fade-up max-w-md p-8 text-center">
            {state.status === "victory" ? <Trophy className="mx-auto h-12 w-12 text-gold drop-shadow" /> : <Skull className="mx-auto h-12 w-12 text-crimson" />}
            <h2 className="mt-3 font-display text-3xl text-ink">{state.status === "victory" ? "Victory" : "You Have Fallen"}</h2>
            <p className="mt-2 text-lg italic text-ink-muted">
              {state.status === "victory" ? `${c.name} has ended the threat. The Reach will sing of "${scenario.title}".` : `${c.name}'s tale ends in the dark. Others will come.`}
            </p>
            <Link to="/new" className="rune-title mt-6 inline-block rounded-md bg-ink px-5 py-3 text-sm text-parchment transition hover:bg-crimson">
              Begin a new tale
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
