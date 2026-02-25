import { describe, it, expect } from "vitest";
import { buildExport } from "./export";
import { FullExportSchema } from "@/types/schemas";
import type { Epic, ApiMetadata, Phase, Dependency } from "@/types";

const mockEpics: Epic[] = [
  {
    id: "EPIC-001",
    title: "Authentication System",
    description: "User auth module",
    stories: [
      {
        id: "STORY-001",
        title: "Login page implementation",
        acceptance_criteria: [
          { given: "a user", when: "they enter credentials", then: "they are logged in" },
          { given: "a user", when: "they enter wrong password", then: "they see an error" },
        ],
        estimate: "M",
        labels: ["frontend", "backend"],
        tasks: [
          { id: "TASK-001", title: "Create login form", description: "Build the form", estimate: "S", labels: ["frontend"] },
          { id: "TASK-002", title: "Add validation", description: "Validate inputs", estimate: "XS", labels: ["frontend"] },
        ],
      },
    ],
  },
];

const decomposeMetadata: ApiMetadata = {
  token_usage: { input: 1000, output: 500 },
  estimated_cost_usd: 0.015,
  retries: 0,
};

const dependenciesMetadata: ApiMetadata = {
  token_usage: { input: 200, output: 100 },
  estimated_cost_usd: 0.002,
  retries: 1,
};

const mockDeps: Dependency[] = [
  { from_id: "STORY-001", to_id: "TASK-002", type: "blocks" },
];

const mockPhases: Phase[] = [
  { phase_number: 1, name: "Foundation", ticket_ids: ["EPIC-001"] },
];

describe("buildExport", () => {
  it("injects parent references (epic_id on stories, story_id on tasks)", () => {
    const result = buildExport({
      documentTitle: "Test PRD",
      epics: mockEpics,
      dependencies: mockDeps,
      phases: mockPhases,
      decomposeMetadata,
      dependenciesMetadata,
    });

    const story = result.epics[0].stories[0] as Record<string, unknown>;
    expect(story.epic_id).toBe("EPIC-001");

    const task = (result.epics[0].stories[0].tasks[0]) as Record<string, unknown>;
    expect(task.story_id).toBe("STORY-001");
  });

  it("aggregates metadata totals correctly", () => {
    const result = buildExport({
      documentTitle: "Test PRD",
      epics: mockEpics,
      dependencies: mockDeps,
      phases: mockPhases,
      decomposeMetadata,
      dependenciesMetadata,
    });

    expect(result.metadata.total_epics).toBe(1);
    expect(result.metadata.total_stories).toBe(1);
    expect(result.metadata.total_tasks).toBe(2);
    expect(result.metadata.token_usage).toEqual({ input: 1200, output: 600 });
  });

  it("rounds cost to 3 decimal places", () => {
    const result = buildExport({
      documentTitle: "Test PRD",
      epics: mockEpics,
      dependencies: mockDeps,
      phases: mockPhases,
      decomposeMetadata,
      dependenciesMetadata,
    });

    // 0.015 + 0.002 = 0.017
    expect(result.metadata.estimated_cost_usd).toBe(0.017);
  });

  it("defaults ambiguities to empty array when omitted", () => {
    const result = buildExport({
      documentTitle: "Test PRD",
      epics: mockEpics,
      dependencies: mockDeps,
      phases: mockPhases,
      decomposeMetadata,
      dependenciesMetadata,
    });

    expect(result.ambiguities).toEqual([]);
  });

  it("passes FullExportSchema validation", () => {
    const result = buildExport({
      documentTitle: "Test PRD",
      epics: mockEpics,
      dependencies: mockDeps,
      phases: mockPhases,
      decomposeMetadata,
      dependenciesMetadata,
    });

    const parsed = FullExportSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });
});
