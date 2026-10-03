import { MockDungeonMaster } from "./mockDM";
import type { DungeonMaster } from "./types";

export type { DungeonMaster, DMContext, DMInput, DMResponse } from "./types";

/**
 * Swap point for a real AI provider. Implement `DungeonMaster` with a class that
 * calls a server function (keeping API keys server-side) and return it here.
 */
export function getDungeonMaster(): DungeonMaster {
  return new MockDungeonMaster();
}
