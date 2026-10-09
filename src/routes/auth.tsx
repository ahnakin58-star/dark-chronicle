import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — The Sundered Reach" },
      { name: "description", content: "Sign in to save your heroes and continue your adventures on any device." },
      { property: "og:title", content: "Sign in — The Sundered Reach" },
      { property: "og:description", content: "Save your heroes and continue your adventures anywhere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => data.session && nav({ to: "/adventures" }));
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_IN" && s) nav({ to: "/adventures" });
    });
    return () => data.subscription.unsubscribe();
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const { data, error } =
        mode === "in"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/auth" } });
      if (error) return setMsg(error.message);
      if (data.session) {
        // Confirm the session is readable before entering the protected area.
        const { data: u } = await supabase.auth.getUser();
        if (u.user) return nav({ to: "/adventures", replace: true });
        return setMsg("Signed in, but the session could not be stored. Please allow site storage and try again.");
      }
      if (mode === "up") setMsg("Check your email to confirm your account, then sign in.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) setMsg(r.error.message);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="panel w-full max-w-sm p-6">
        <p className="rune-title text-center text-xs text-gold">The Sundered Reach</p>
        <h1 className="mt-2 text-center font-display text-3xl text-foreground">{mode === "in" ? "Return, traveller" : "Join the chronicle"}</h1>
        <button onClick={google} className="mt-6 w-full rounded-md border border-border px-4 py-2.5 text-sm text-foreground hover:bg-accent">Continue with Google</button>
        <div className="my-4 text-center text-xs text-muted-foreground">or</div>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-input bg-background/60 px-3 py-2 text-foreground" />
          <input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-input bg-background/60 px-3 py-2 text-foreground" />
          <button disabled={busy} className="rune-title w-full rounded-md bg-primary px-4 py-2.5 text-sm text-primary-foreground disabled:opacity-60">{busy ? "…" : mode === "in" ? "Sign in" : "Create account"}</button>
        </form>
        {msg && <p className="mt-3 text-center text-sm text-muted-foreground">{msg}</p>}
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-center text-sm text-gold hover:underline">
          {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
