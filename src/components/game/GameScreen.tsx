import { RotateCcw, Skull, Trophy } from "lucide-react";
import type { GameApi } from "@/game/useGame";
import { CharacterSheet } from "./CharacterSheet";
import { CombatPanel } from "./CombatPanel";
import { DiceTray } from "./DiceTray";
import { Inventory } from "./Inventory";
import { NarrativePanel } from "./NarrativePanel";
import { ActivityLog, QuestTracker } from "./SidePanels";

const SCENE_NAMES = { gate: "The North Gate", chapel: "Chapel of Saint Varra", crypt: "The Ossuary", sanctum: "The Warden's Sanctum", end: "Dawn over Ashenford" };

export function GameScreen({ game }: { game: GameApi }) {
  const { state } = game;
  const c = state.character!;
  const canDrink = state.status === "playing" && (!state.combat || (state.combat.turn === "player" && !state.rolling));

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-3 md:px-5">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl text-foreground md:text-2xl">The Hollow Crypt</h1>
          <p className="rune-title text-[11px] text-gold">{SCENE_NAMES[state.scene]}</p>
        </div>
        <button onClick={game.restart} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground">
          <RotateCcw className="h-3.5 w-3.5" /> New hero
        </button>
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
          <ActivityLog log={state.log} />
        </aside>
      </div>

      {state.status !== "playing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="parchment animate-fade-up max-w-md p-8 text-center">
            {state.status === "victory" ? <Trophy className="mx-auto h-12 w-12 text-gold drop-shadow" /> : <Skull className="mx-auto h-12 w-12 text-crimson" />}
            <h2 className="mt-3 font-display text-3xl text-ink">{state.status === "victory" ? "Victory" : "You Have Fallen"}</h2>
            <p className="mt-2 text-lg italic text-ink-muted">
              {state.status === "victory" ? `${c.name} has laid the Bone Warden to rest. Ashenford will sing of this.` : `${c.name}'s tale ends in the dark. Others will come.`}
            </p>
            <button onClick={game.restart} className="rune-title mt-6 rounded-md bg-ink px-5 py-3 text-sm text-parchment transition hover:bg-crimson">
              Forge a new hero
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
