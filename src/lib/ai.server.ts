import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, streamText } from "ai";

const RUN_ID = "X-Lovable-AIG-Run-ID";

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(RUN_ID)) headers.set(RUN_ID, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
    return res;
  };
}

export class AiError extends Error {}

/** Streams a Responses call and returns parsed JSON from the final text. */
export async function generateJson(system: string, prompt: string, effort: "low" | "medium" = "low"): Promise<unknown> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiError("The AI storyteller isn't configured.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch(),
  });
  try {
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system,
      prompt,
      providerOptions: {
        openai: { forceReasoning: true, reasoningEffort: effort, reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
      },
    });
    const text = await result.text;
    return extractJson(text);
  } catch (e) {
    if (e instanceof AiError) throw e;
    const status = APICallError.isInstance(e) ? e.statusCode : undefined;
    console.error("AI gateway error", status, e);
    if (status === 429) throw new AiError("The storyteller is overwhelmed. Wait a moment and try again.");
    if (status === 402) throw new AiError("AI credits have run out. Add credits in workspace settings to keep playing.");
    if (status === 403) throw new AiError("AI access is blocked for this workspace.");
    throw new AiError("The storyteller lost their train of thought. Try again.");
  }
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new AiError("The storyteller's reply was garbled. Try again.");
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new AiError("The storyteller's reply was garbled. Try again.");
  }
}
