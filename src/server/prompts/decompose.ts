import type { ToolDefinition } from "@/server/pipeline/llm-call";

/**
 * System prompt for LLM Call 1: PRD decomposition.
 * Instructs the model to act as a Senior Technical PM and produce
 * a structured Epic > Story > Task hierarchy.
 */
export const DECOMPOSE_SYSTEM_PROMPT = `You are a Senior Technical Product Manager with 15 years of experience decomposing product requirements into engineering work.

Your task: Given a Product Requirements Document (PRD), decompose it into an Epic > Story > Task hierarchy using the output_tickets tool.

## Hierarchy rules

- **Epic**: A major feature area or capability. Include a concise description (1-2 sentences).
- **Story**: A user-facing deliverable that represents a vertical slice of functionality. Each story should be independently testable and deployable.
- **Task**: A concrete implementation step within a story. Each task must take less than 1 day of developer effort.

## ID format

Use global sequential numbering (not per-epic):
- Epics: EPIC-001, EPIC-002, ...
- Stories: STORY-001, STORY-002, ... (continuous across all epics)
- Tasks: TASK-001, TASK-002, ... (continuous across all stories)

## Acceptance criteria

Every story MUST have 2-5 acceptance criteria in structured Given/When/Then format:
- "given": the precondition or context
- "when": the action or trigger
- "then": the expected outcome

Be specific and testable. Avoid vague criteria.

## Estimates (T-shirt sizing)

- XS: < 2 hours (trivial change, config update)
- S: 2-4 hours (simple feature, single component)
- M: 4-8 hours (moderate feature, multiple touchpoints)
- L: 1-2 days (significant feature, cross-cutting)
- XL: 2-5 days (large feature, architectural work) — Stories only, NOT tasks

Tasks may only use XS, S, M, or L. If a task would be XL, split it into multiple tasks.

## Labels

Assign 1-3 labels per story from this taxonomy:
frontend, backend, api, database, infrastructure, design, testing, documentation

## Ambiguity detection

While decomposing, identify any vague, ambiguous, or incomplete requirements. For each, output:
- "source": quote or reference the unclear text from the PRD
- "issue": explain what is unclear or missing
- "question": a specific clarifying question the PM should answer
- "affected_ticket_ids": array of ticket IDs (EPIC/STORY/TASK) whose scope depends on the answer
- "severity": "blocking" if the answer could change ticket structure/scope, "minor" if it only affects details

Still decompose the full PRD using your best assumptions — ambiguities are informational, not blockers.

## Important

- Every story must have at least one task
- Be thorough — cover all requirements mentioned in the PRD
- If the PRD is vague on implementation details, make reasonable technical assumptions and flag the ambiguity
- Group related functionality into the same epic
- Order epics and stories logically (foundational work first)`;

/**
 * Tool definition for the decomposition call.
 * JSON Schema matches DecompositionResultSchema from src/types/schemas.ts.
 */
export const DECOMPOSE_TOOL: ToolDefinition = {
  name: "output_tickets",
  description:
    "Output the decomposed PRD as a structured hierarchy of Epics, Stories, and Tasks.",
  input_schema: {
    type: "object" as const,
    properties: {
      epics: {
        type: "array",
        description: "Array of epics decomposed from the PRD",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Epic ID in format EPIC-NNN",
              pattern: "^EPIC-\\d{3}$",
            },
            title: {
              type: "string",
              description: "Concise epic title (5-120 chars)",
              minLength: 5,
              maxLength: 120,
            },
            description: {
              type: "string",
              description: "Brief description of the epic scope (max 500 chars)",
              maxLength: 500,
            },
            stories: {
              type: "array",
              description: "Stories within this epic",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "Story ID in format STORY-NNN",
                    pattern: "^STORY-\\d{3}$",
                  },
                  title: {
                    type: "string",
                    description: "Concise story title (5-120 chars)",
                    minLength: 5,
                    maxLength: 120,
                  },
                  acceptance_criteria: {
                    type: "array",
                    description: "2-5 acceptance criteria in Given/When/Then format",
                    items: {
                      type: "object",
                      properties: {
                        given: {
                          type: "string",
                          description: "The precondition or context",
                          minLength: 1,
                        },
                        when: {
                          type: "string",
                          description: "The action or trigger",
                          minLength: 1,
                        },
                        then: {
                          type: "string",
                          description: "The expected outcome",
                          minLength: 1,
                        },
                      },
                      required: ["given", "when", "then"],
                    },
                    minItems: 2,
                    maxItems: 5,
                  },
                  estimate: {
                    type: "string",
                    description: "T-shirt size estimate",
                    enum: ["XS", "S", "M", "L", "XL"],
                  },
                  labels: {
                    type: "array",
                    description: "1-3 technical domain labels",
                    items: {
                      type: "string",
                      enum: [
                        "frontend",
                        "backend",
                        "api",
                        "database",
                        "infrastructure",
                        "design",
                        "testing",
                        "documentation",
                      ],
                    },
                  },
                  tasks: {
                    type: "array",
                    description: "Implementation tasks for this story",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          description: "Task ID in format TASK-NNN",
                          pattern: "^TASK-\\d{3}$",
                        },
                        title: {
                          type: "string",
                          description: "Concise task title (5-120 chars)",
                          minLength: 5,
                          maxLength: 120,
                        },
                        description: {
                          type: "string",
                          description: "Implementation details (max 500 chars)",
                          maxLength: 500,
                        },
                        estimate: {
                          type: "string",
                          description: "T-shirt size (XS/S/M/L only, no XL)",
                          enum: ["XS", "S", "M", "L"],
                        },
                      },
                      required: ["id", "title", "description", "estimate"],
                    },
                    minItems: 1,
                  },
                },
                required: [
                  "id",
                  "title",
                  "acceptance_criteria",
                  "estimate",
                  "labels",
                  "tasks",
                ],
              },
              minItems: 1,
            },
          },
          required: ["id", "title", "description", "stories"],
        },
        minItems: 1,
      },
      ambiguities: {
        type: "array",
        description:
          "Ambiguities, vague or incomplete requirements found in the PRD",
        items: {
          type: "object",
          properties: {
            source: {
              type: "string",
              description: "Quote or reference to the unclear text from the PRD",
              minLength: 1,
            },
            issue: {
              type: "string",
              description: "What is unclear or missing",
              minLength: 1,
            },
            question: {
              type: "string",
              description: "A specific clarifying question the PM should answer",
              minLength: 1,
            },
            affected_ticket_ids: {
              type: "array",
              description:
                "Ticket IDs (EPIC/STORY/TASK) whose scope depends on the answer",
              items: { type: "string" },
            },
            severity: {
              type: "string",
              description:
                "blocking = could change ticket structure/scope, minor = only affects details",
              enum: ["blocking", "minor"],
            },
          },
          required: [
            "source",
            "issue",
            "question",
            "affected_ticket_ids",
            "severity",
          ],
        },
      },
    },
    required: ["epics"],
  },
};

/**
 * Build the user message for the decomposition call.
 * @param document - Full Markdown text of the PRD
 * @param sectionOutline - Pre-parsed section headings for structural context
 * @returns Formatted user message string
 */
export function buildDecomposeUserMessage(
  document: string,
  sectionOutline: string,
): string {
  return `## Document structure

${sectionOutline}

## Full PRD content

${document}

Decompose this PRD into Epics, Stories, and Tasks using the output_tickets tool. Be thorough and cover all requirements.`;
}
