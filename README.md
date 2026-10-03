# Dark Chronicle

Build a polished AI-powered D&D-style fantasy adventure game as a playable web app. The game should feel like a dark fantasy tabletop RPG brought to life, with a clean but atmospheric UI.

Core gameplay:
- Create a character with name, race, class, level, HP, armor class, stats, and inventory.
- Include the standard tabletop dice: d4, d6, d8, d10, d12, d20, and d100. Make them visually distinct and clickable, with animated rolling and clear results.
- Add a main adventure/game screen with a narrative panel, character sheet sidebar, inventory, combat/status area, and dice tray.
- The player should be able to choose actions during encounters, make skill checks, attack, defend, use items, and roll the appropriate dice.
- Build a simple turn-based combat system with enemies, HP, attack rolls, damage rolls, critical success/failure handling, and victory/defeat states.
- Include an AI Dungeon Master experience: an AI DM panel should generate/adapt fantasy narration, encounters, NPC dialogue, quests, and consequences based on the player's actions. For the first version, make this work with a local/mock AI-style response system if no API key is available, but structure it cleanly so a real AI provider can be connected later.
- Let the player type free-form actions such as 'I inspect the old door' or 'I try to persuade the guard', and have the DM respond with an appropriate narrative and suggested dice check.
- Include a dice-history/activity log showing recent rolls and outcomes.
- Include a small quest/objective tracker.

Visual direction:
- Dark medieval fantasy / D&D-inspired atmosphere without copying any copyrighted game's exact UI.
- Deep charcoal/black background, parchment-like panels, subtle gold accents, muted crimson/indigo highlights, glowing dice effects.
- Responsive desktop-first layout that also works on mobile.
- Strong typography hierarchy, tasteful shadows, borders, subtle animations, and polished empty/loading/error states.
- Make it immediately playable with sensible starter character and adventure data.

Important: Do not make this just a landing page. Build the actual interactive game experience with working state, dice rolling, combat, character stats, inventory, narrative choices, and AI-DM-style interaction. Use TypeScript, Tailwind, and reusable components. Keep the architecture clean so future real AI/backend integration is straightforward.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3bb9e722-df1c-41f6-a890-4a0f0de28e14).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
