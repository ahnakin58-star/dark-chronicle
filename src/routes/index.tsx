import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Sundered Reach — AI Dungeon Master Fantasy Adventures" },
      { name: "description", content: "A dark fantasy tabletop RPG in your browser: forge a hero, roll real dice, and play endless AI-generated adventures in one shared world." },
      { property: "og:title", content: "The Sundered Reach — AI Dungeon Master Fantasy Adventures" },
      { property: "og:description", content: "Forge a hero, roll the dice, and let an AI Dungeon Master tell your tale." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="rune-title text-xs text-gold">Three hundred years after the Shattering</p>
      <h1 className="mt-3 font-display text-5xl text-foreground md:text-7xl">The Sundered Reach</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg italic text-muted-foreground">
        Forge a hero, roll the dice, and let the Chronicler — an AI Dungeon Master — weave a new tale every time. Your adventures are saved as you play.
      </p>
      <Link to="/adventures" className="rune-title mt-8 rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground transition hover:opacity-90">
        Enter the Reach
      </Link>
    </main>
  );
}
