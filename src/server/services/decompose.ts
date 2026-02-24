import type Anthropic from "@anthropic-ai/sdk";
import { DecompositionResultSchema } from "@/types/schemas";
import type { DecompositionResult, Section, ApiMetadata } from "@/types";
import { callWithRetry } from "@/server/pipeline/llm-call";
import {
  DECOMPOSE_SYSTEM_PROMPT,
  DECOMPOSE_TOOL,
  buildDecomposeUserMessage,
} from "@/server/prompts/decompose";
import { LLM_MAX_TOKENS_DECOMPOSE, COST_PER_INPUT_TOKEN, COST_PER_OUTPUT_TOKEN } from "@/lib/constants";

interface DecomposeServiceResult {
  epics: DecompositionResult["epics"];
  metadata: ApiMetadata;
}

/**
 * Decompose a PRD document into an Epic > Story > Task hierarchy.
 *
 * Sends the document to Claude via tool_use, validates the output
 * against DecompositionResultSchema, and retries on validation failure.
 *
 * @param client - Anthropic SDK client (instantiated with user's API key)
 * @param document - Full Markdown text of the PRD
 * @param sections - Pre-parsed document sections for structural context
 * @returns Validated epic hierarchy with token usage metadata
 */
export async function decompose(
  client: Anthropic,
  document: string,
  sections: Section[],
): Promise<DecomposeServiceResult> {
  const sectionOutline = sections
    .map((s) => `${"#".repeat(s.level)} ${s.heading}`)
    .join("\n");

  const userMessage = buildDecomposeUserMessage(document, sectionOutline);

  const result = await callWithRetry(
    {
      client,
      systemPrompt: DECOMPOSE_SYSTEM_PROMPT,
      userMessage,
      tool: DECOMPOSE_TOOL,
      maxTokens: LLM_MAX_TOKENS_DECOMPOSE,
    },
    DecompositionResultSchema,
  );

  const cost =
    result.usage.input * COST_PER_INPUT_TOKEN +
    result.usage.output * COST_PER_OUTPUT_TOKEN;

  return {
    epics: result.data.epics,
    metadata: {
      token_usage: result.usage,
      estimated_cost_usd: Math.round(cost * 1000) / 1000,
      retries: result.retries,
    },
  };
}
