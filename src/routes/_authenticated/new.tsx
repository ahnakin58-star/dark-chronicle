import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkle } from "lucide-react";
import { CharacterCreation } from "@/components/game/CharacterCreation";
import { supabase } from "@/integrations/supabase/client";
import { generateScenario } from "@/lib/adventure.functions";
import { HOLLOW_CRYPT, initialGameState } from "@/game/scenarios";
import type { Character, Json, Scenario } from "@/game/types";
import { REGIONS, TONES } from "@/game/world";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/new")({
  head: () => ({
    meta: [
      { title: "New Tale — The Sundered Reach" },
      { name: "description", content: "Forge a hero and generate a fresh adventure in the Sundered Reach." },
      { property: "og:title", content: "New Tale — The Sundered Reach" },
      { property: "og:description", content: "Forge a hero and generate a fresh adventure." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewTale,
});

const STAGES = ["Rolling the seed from the world tables…", "The Chronicler writes the tale…", "Checking it against the rules…"];

function NewTale() {
  const nav = useNavigate();
  const forge = useServerFn(generateScenario);
  const [hero, setHero] = useState<Character | null>(null);
  const [mode, setMode] = useState<"forge" | "classic">("forge");
  const [region, setRegion] = useState("");
  const [tone, setTone] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!hero) return <CharacterCreation onStart={setHero} submitLabel="Choose your tale" />;

  async function begin() {
    if (!hero) return;
    setBusy(true);
    setError(null);
    setStage(0);
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 6000);
    try {
      let scenario: Scenario = HOLLOW_CRYPT;
      if (mode === "forge") {
        const res = await forge({ data: { regionId: region || undefined, tone: tone || undefined, heroSummary: `${hero.name}, ${hero.race} ${hero.cls}` } });
        if (!res.ok) throw new Error(res.error);
        scenario = res.scenario;
      }
      const state = initialGameState(scenario, hero);
      const { data, error } = await supabase
        .from("adventures")
        .insert({ title: scenario.title, hero_name: hero.name, scenario: scenario as unknown as Json, state: state as unknown as Json })
        .select("id")
        .single();
      if (error) throw new Error("Couldn't save your new adventure.");
      nav({ to: "/play/$id", params: { id: data.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    } finally {
      clearInterval(timer);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="rune-title text-center text-xs text-gold">Step 2 of 2</p>
      <h1 className="mt-2 text-center font-display text-4xl text-foreground">Choose {hero.name}'s Tale</h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Choice active={mode === "forge"} onClick={() => setMode("forge")} title="Forge a new tale" text="The Chronicler builds a fresh adventure from the world's regions, factions, threats and twists." />
        <Choice active={mode === "classic"} onClick={() => setMode("classic")} title="The Hollow Crypt" text="The classic tale: the dead of Ashenford will not stay buried." />
      </div>
      {mode === "forge" && (
        <div className="panel mt-4 grid gap-4 p-5 sm:grid-cols-2">
          <label className="block">
            <span className="rune-title text-xs text-gold">Region</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground">
              <option value="">Let fate decide</option>
              {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="rune-title text-xs text-gold">Tone</span>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-foreground">
              <option value="">Let fate decide</option>
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <p className="text-sm italic text-muted-foreground sm:col-span-2">{REGIONS.find((r) => r.id === region)?.summary ?? "A random region, faction, threat and twist will be drawn."}</p>
        </div>
      )}
      {error && <p className="mt-4 text-center text-crimson">{error}</p>}
      <div className="mt-6 flex flex-col items-center gap-3">
        <button disabled={busy} onClick={begin} className="rune-title flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-70">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkle className="h-4 w-4" />}
          {busy ? "Forging…" : "Begin the adventure"}
        </button>
        {busy && mode === "forge" && <p className="text-sm italic text-muted-foreground">{STAGES[stage]} (this can take up to a minute)</p>}
        <button disabled={busy} onClick={() => setHero(null)} className="text-sm text-muted-foreground hover:text-foreground">Back to hero</button>
      </div>
    </main>
  );
}

function Choice({ active, onClick, title, text }: { active: boolean; onClick: () => void; title: string; text: string }) {
  return (
    <button onClick={onClick} className={cn("panel p-5 text-left transition", active ? "border-gold glow-gold" : "hover:border-gold/50")}>
      <div className="font-display text-xl text-foreground">{title}</div>
      <p className="mt-1 text-sm italic text-muted-foreground">{text}</p>
    </button>
  );
}
