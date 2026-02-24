import type { ToolDefinition } from "@/server/pipeline/llm-call";

/**
 * System prompt for LLM Call 2: Dependency mapping.
 * Instructs the model to identify blocking relationships and
 * suggest execution phases for the ticket set.
 */
export const DEPENDENCIES_SYSTEM_PROMPT = `You are a Principal Software Engineer planning execution order for a project.

Your task: Given a list of engineering tickets (Epics and Stories with IDs, titles, and descriptions), identify blocking dependencies and suggest execution phases.

## Dependency rules

- Only create "blocks" dependencies where there is a genuine technical dependency (A must be implemented before B can start).
- Use "related" sparingly — only for tickets that share significant context but don't strictly block each other.
- Do NOT over-link. Most tickets are independent. A typical project of 10-20 stories should have 3-8 blocking dependencies, not 15-20.
- Dependencies are between Stories and/or Epics (not individual Tasks).
- from_id is the blocker, to_id is the blocked ticket.

## Phase rules

- Group tickets into sequential execution phases.
- Phase 1 = foundation tickets with no blockers.
- Each subsequent phase contains tickets whose blockers are all in earlier phases.
- Every ticket (Epic and Story) must appear in exactly one phase.
- Give each phase a descriptive name (e.g., "Foundation", "Core Features", "Integration", "Polish").
- Number phases sequentially starting at 1.

## Important

- Think about technical dependencies: data models before API endpoints, API endpoints before frontend, shared libraries before consumers.
- Be conservative — when in doubt, leave tickets independent rather than adding a weak dependency.
- Ensure your phases are consistent with your dependencies (no ticket should be in a phase before its blockers).`;

/**
 * Tool definition for the dependency mapping call.
 * JSON Schema matches DependencyResultSchema from src/types/schemas.ts.
 */
export const DEPENDENCIES_TOOL: ToolDefinition = {
  name: "output_dependencies",
  description:
    "Output dependency relationships and execution phases for the ticket set.",
  input_schema: {
    type: "object" as const,
    properties: {
      dependencies: {
        type: "array",
        description: "Blocking and related dependencies between tickets",
        items: {
          type: "object",
          properties: {
            from_id: {
              type: "string",
              description: "ID of the blocker ticket (e.g., STORY-001 or EPIC-001)",
            },
            to_id: {
              type: "string",
              description: "ID of the blocked ticket",
            },
            type: {
              type: "string",
              description: "Dependency type",
              enum: ["blocks", "related"],
            },
          },
          required: ["from_id", "to_id", "type"],
        },
      },
      phases: {
        type: "array",
        description: "Suggested execution phases in order",
        items: {
          type: "object",
          properties: {
            phase_number: {
              type: "integer",
              description: "Phase number starting at 1",
              minimum: 1,
            },
            name: {
              type: "string",
              description: "Descriptive phase name (e.g., 'Foundation')",
            },
            ticket_ids: {
              type: "array",
              description: "IDs of tickets in this phase",
              items: { type: "string" },
              minItems: 1,
            },
          },
          required: ["phase_number", "name", "ticket_ids"],
        },
        minItems: 1,
      },
    },
    required: ["dependencies", "phases"],
  },
};

/**
 * Build the user message for the dependency mapping call.
 * @param tickets - Flat list of ticket summaries (ID, title, description)
 * @returns Formatted user message string
 */
export function buildDependenciesUserMessage(
  tickets: { id: string; title: string; description: string }[],
): string {
  const ticketList = tickets
    .map((t) => `- **${t.id}**: ${t.title}\n  ${t.description}`)
    .join("\n");

  return `## Tickets to analyze

${ticketList}

Identify blocking dependencies and suggest execution phases using the output_dependencies tool.`;
}
