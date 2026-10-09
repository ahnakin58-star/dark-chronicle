import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GameScreen, type SaveStatus } from "@/components/game/GameScreen";
import { supabase } from "@/integrations/supabase/client";
import { useGame } from "@/game/useGame";
import type { GameState, Json, Scenario } from "@/game/types";

export const Route = createFileRoute("/_authenticated/play/$id")({
  head: () => ({
    meta: [
      { title: "Adventure — The Sundered Reach" },
      { name: "description", content: "Your adventure in the Sundered Reach, guided by an AI Dungeon Master." },
      { property: "og:title", content: "Adventure — The Sundered Reach" },
      { property: "og:description", content: "An adventure guided by an AI Dungeon Master." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Play,
});

function Play() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["adventure", id],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase.from("adventures").select("scenario,state").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  if (isLoading) return <p className="p-10 text-center italic text-muted-foreground">Opening the chronicle…</p>;
  if (error || !data)
    return (
      <div className="p-10 text-center">
        <p className="text-muted-foreground">This adventure couldn't be found.</p>
        <Link to="/adventures" className="mt-3 inline-block text-gold">Back to your chronicles</Link>
      </div>
    );
  return <PlayInner key={id} id={id} scenario={data.scenario as unknown as Scenario} initial={data.state as unknown as GameState} />;
}

function PlayInner({ id, scenario, initial }: { id: string; scenario: Scenario; initial: GameState }) {
  const game = useGame({ ...initial, lore: initial.lore ?? [] }, scenario);
  const [save, setSave] = useState<SaveStatus>("saved");
  const first = useRef(true);
  const { state } = game;

  useEffect(() => {
    game.begin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (state.thinking || state.rolling) return;
    setSave("saving");
    const t = setTimeout(async () => {
      const snapshot: GameState = { ...state, thinking: false, rolling: null };
      const { error } = await supabase
        .from("adventures")
        .update({ state: snapshot as unknown as Json, status: state.status })
        .eq("id", id);
      setSave(error ? "error" : "saved");
    }, 800);
    return () => clearTimeout(t);
  }, [state, id]);

  return <GameScreen game={game} saveStatus={save} />;
}
