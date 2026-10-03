import { dmRespond } from "@/lib/adventure.functions";
import type { DMContext, DMInput, DMResponse, DungeonMaster } from "./types";

export class AiDungeonMaster implements DungeonMaster {
  name = "The Chronicler";
  async respond(ctx: DMContext, input: DMInput): Promise<DMResponse> {
    const res = await dmRespond({ data: { ctx, input } });
    if (!res.ok) throw new Error(res.error);
    return res.response;
  }
}
