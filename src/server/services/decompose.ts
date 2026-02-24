import type Anthropic from "@anthropic-ai/sdk";
import { DecompositionResultSchema } from "@/types/schemas";
import type { DecompositionResult, Section, ApiMetadata, TicketLabel } from "@/types";
import { callWithRetry } from "@/server/pipeline/llm-call";
import {
  DECOMPOSE_SYSTEM_PROMPT,
  DECOMPOSE_TOOL,
  buildDecomposeUserMessage,
} from "@/server/prompts/decompose";
import { LLM_MAX_TOKENS_DECOMPOSE, COST_PER_INPUT_TOKEN, COST_PER_OUTPUT_TOKEN } from "@/lib/constants";

interface DecomposeServiceResult {
  epics: DecompositionResult["epics"];
  ambiguities: DecompositionResult["ambiguities"];
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

  const epics = result.data.epics.map((epic) => ({
    ...epic,
    stories: epic.stories.map((story) => ({
      ...story,
      labels: story.labels.length > 0 ? story.labels : inferLabels(story.title),
      tasks: story.tasks.map((task) => ({
        ...task,
        labels: task.labels.length > 0 ? task.labels : inferLabels(`${task.title} ${task.description}`),
      })),
    })),
  }));

  return {
    epics,
    ambiguities: result.data.ambiguities,
    metadata: {
      token_usage: result.usage,
      estimated_cost_usd: Math.round(cost * 1000) / 1000,
      retries: result.retries,
    },
  };
}

/**
 * Keyword-based heuristic to infer labels when the LLM returns an empty array.
 */
const LABEL_KEYWORDS: Record<TicketLabel, string[]> = {
  frontend: ["ui", "component", "page", "css", "style", "layout", "responsive", "form", "button", "modal", "render"],
  backend: ["server", "service", "handler", "middleware", "logic", "cron", "worker", "queue"],
  infra: ["deploy", "ci", "cd", "docker", "kubernetes", "pipeline", "monitoring", "logging", "cloud", "infra"],
  design: ["design", "mockup", "wireframe", "figma", "prototype", "ux"],
  api: ["api", "endpoint", "rest", "graphql", "route", "request", "response", "webhook"],
  database: ["database", "db", "schema", "migration", "query", "table", "index", "sql", "model"],
  auth: ["auth", "login", "signup", "password", "token", "session", "permission", "role", "oauth", "jwt"],
  testing: ["test", "spec", "e2e", "unit test", "integration test", "coverage", "assert"],
};

function inferLabels(text: string): TicketLabel[] {
  const lower = text.toLowerCase();
  const matched: TicketLabel[] = [];
  for (const [label, keywords] of Object.entries(LABEL_KEYWORDS) as [TicketLabel, string[]][]) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(label);
    }
  }
  return matched.length > 0 ? matched.slice(0, 3) : ["backend"];
}
