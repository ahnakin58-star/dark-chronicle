import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DMContext, DMInput, DMResponse } from "@/game/dm/types";
import type { Scenario } from "@/game/types";

type Result<T> = { ok: true } & T | { ok: false; error: string };

export const generateScenario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { regionId?: string | undefined; tone?: string | undefined; heroSummary: string }) => ({
    regionId: typeof d?.regionId === "string" ? d.regionId : undefined,
    tone: typeof d?.tone === "string" ? d.tone : undefined,
    heroSummary: String(d?.heroSummary ?? "").slice(0, 300),
  }))
  .handler(async ({ data }): Promise<Result<{ scenario: Scenario }>> => {
    const { forgeScenario } = await import("./adventure.server");
    const { generateJson, AiError } = await import("./ai.server");
    try {
      const scenario = await forgeScenario(data, (s, p) => generateJson(s, p, "medium"));
      return { ok: true, scenario };
    } catch (e) {
      return { ok: false, error: e instanceof AiError ? e.message : "The forge went cold. Try again." };
    }
  });

export const dmRespond = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ctx: DMContext; input: DMInput }) => {
    if (!d?.ctx?.scenario || !d.ctx.character || !d.input?.kind) throw new Error("Invalid request");
    return d;
  })
  .handler(async ({ data }): Promise<Result<{ response: DMResponse }>> => {
    const { runDM } = await import("./adventure.server");
    const { generateJson, AiError } = await import("./ai.server");
    try {
      const response = await runDM(data.ctx, data.input, (s, p) => generateJson(s, p, "low"));
      return { ok: true, response };
    } catch (e) {
      console.error(e);
      return { ok: false, error: e instanceof AiError ? e.message : "The Dungeon Master fell silent. Try again." };
    }
  });
