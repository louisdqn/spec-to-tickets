import type Anthropic from "@anthropic-ai/sdk";
import { DependencyResultSchema } from "@/types/schemas";
import type { Dependency, Phase, ApiMetadata } from "@/types";
import { callWithRetry } from "@/server/pipeline/llm-call";
import {
  DEPENDENCIES_SYSTEM_PROMPT,
  DEPENDENCIES_TOOL,
  buildDependenciesUserMessage,
} from "@/server/prompts/dependencies";
import { LLM_MAX_TOKENS_DEPENDENCIES, buildApiMetadata } from "@/lib/constants";
import { detectCycles } from "@/lib/graph";
import { logger } from "@/lib/logger";

interface TicketSummary {
  id: string;
  title: string;
  description: string;
}

interface DependenciesServiceResult {
  dependencies: Dependency[];
  phases: Phase[];
  has_cycles: boolean;
  cycle_details: string[] | null;
  metadata: ApiMetadata;
}

/**
 * Map dependencies between tickets and suggest execution phases.
 *
 * Sends the ticket list to Claude via tool_use, validates the output,
 * then runs topological sort to detect circular dependencies.
 *
 * @param client - Anthropic SDK client (instantiated with user's API key)
 * @param tickets - Flat list of ticket summaries (Epics + Stories)
 * @returns Dependencies, phases, cycle detection results, and metadata
 */
export async function mapDependencies(
  client: Anthropic,
  tickets: TicketSummary[],
): Promise<DependenciesServiceResult> {
  const userMessage = buildDependenciesUserMessage(tickets);

  const result = await callWithRetry(
    {
      client,
      systemPrompt: DEPENDENCIES_SYSTEM_PROMPT,
      userMessage,
      tool: DEPENDENCIES_TOOL,
      maxTokens: LLM_MAX_TOKENS_DEPENDENCIES,
    },
    DependencyResultSchema,
  );

  // Run cycle detection on blocking dependencies
  const allNodeIds = new Set(tickets.map((t) => t.id));
  const cycleResult = detectCycles(result.data.dependencies, allNodeIds);

  if (cycleResult.hasCycles) {
    logger.warn("Circular dependencies detected", {
      cycles: cycleResult.cycleDetails,
    });
  }

  return {
    dependencies: result.data.dependencies,
    phases: result.data.phases,
    has_cycles: cycleResult.hasCycles,
    cycle_details: cycleResult.hasCycles ? cycleResult.cycleDetails : null,
    metadata: buildApiMetadata(result.usage, result.retries),
  };
}
