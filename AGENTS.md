<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Game rules/state live in `src/game/` (pure data + `useGame` hook); UI in `src/components/game/` — keeps logic testable and UI swappable.
- The Dungeon Master is behind the `DungeonMaster` interface (`src/game/dm`); swap the mock in `getDungeonMaster()` for a real AI provider via a server function — keeps keys server-side and UI unchanged.
- Random rolls are computed outside React state updaters, then applied — avoids StrictMode double-invocation inconsistencies.
