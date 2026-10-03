import { createFileRoute } from "@tanstack/react-router";
import { CharacterCreation } from "@/components/game/CharacterCreation";
import { GameScreen } from "@/components/game/GameScreen";
import { useGame } from "@/game/useGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Hollow Crypt — AI Dungeon Master Fantasy Adventure" },
      { name: "description", content: "A dark fantasy tabletop RPG in your browser: forge a hero, roll real dice, fight the undead, and let an AI Dungeon Master tell your tale." },
      { property: "og:title", content: "The Hollow Crypt — AI Dungeon Master Fantasy Adventure" },
      { property: "og:description", content: "Forge a hero, roll the dice, and descend beneath Ashenford with an AI Dungeon Master." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const game = useGame();
  if (!game.state.character) return <CharacterCreation onStart={game.start} />;
  return <GameScreen game={game} />;
}
