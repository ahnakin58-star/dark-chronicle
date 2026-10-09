import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/adventures")({
  head: () => ({
    meta: [
      { title: "Your Adventures — The Sundered Reach" },
      { name: "description", content: "Continue a saved adventure or begin a new tale." },
      { property: "og:title", content: "Your Adventures — The Sundered Reach" },
      { property: "og:description", content: "Continue a saved adventure or begin a new tale." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Adventures,
});

function Adventures() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["adventures"],
    queryFn: async () => {
      const { data, error } = await supabase.from("adventures").select("id,title,hero_name,status,updated_at").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function remove(id: string) {
    if (!confirm("Delete this adventure forever?")) return;
    await supabase.from("adventures").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["adventures"] });
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <p className="rune-title text-xs text-gold">The Sundered Reach</p>
          <h1 className="font-display text-3xl text-foreground md:text-4xl">Your Chronicles</h1>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); qc.clear(); nav({ to: "/" }); }} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
      <Link to="/new" className="panel mb-4 flex items-center justify-center gap-2 p-5 font-display text-lg text-gold transition hover:glow-gold">
        <Plus className="h-5 w-5" /> Begin a new tale
      </Link>
      {isLoading && <p className="text-center italic text-muted-foreground">Unrolling the scrolls…</p>}
      {error && <p className="text-center text-crimson">Couldn't load your adventures.</p>}
      {data?.length === 0 && <p className="text-center italic text-muted-foreground">No tales yet. Every legend starts somewhere.</p>}
      <ul className="space-y-2">
        {data?.map((a) => (
          <li key={a.id} className="panel flex items-center gap-3 p-4">
            <Link to="/play/$id" params={{ id: a.id }} className="min-w-0 flex-1">
              <div className="truncate font-display text-lg text-foreground">{a.title}</div>
              <div className="text-sm text-muted-foreground">
                {a.hero_name} · {a.status === "victory" ? "Victorious" : a.status === "defeat" ? "Fallen" : "In progress"} · {new Date(a.updated_at).toLocaleDateString()}
              </div>
            </Link>
            <button onClick={() => remove(a.id)} aria-label="Delete adventure" className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-crimson">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
