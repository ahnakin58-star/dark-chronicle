import { AiDungeonMaster } from "./aiDM";
import type { DungeonMaster } from "./types";

export type { DungeonMaster, DMContext, DMInput, DMResponse } from "./types";

/** The DM is an AI running behind a server function; keys never reach the browser. */
export function getDungeonMaster(): DungeonMaster {
  return new AiDungeonMaster();
}
