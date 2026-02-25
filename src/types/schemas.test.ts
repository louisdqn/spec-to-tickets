import { describe, it, expect } from "vitest";
import {
  AcceptanceCriterionSchema,
  TaskSchema,
  StorySchema,
  EpicSchema,
  AmbiguitySchema,
  DecompositionResultSchema,
  DependencySchema,
  DependencyResultSchema,
} from "./schemas";

describe("AcceptanceCriterionSchema", () => {
  it("accepts valid given/when/then", () => {
    const result = AcceptanceCriterionSchema.safeParse({
      given: "a user is logged in",
      when: "they click logout",
      then: "they are redirected to the login page",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty strings", () => {
    const result = AcceptanceCriterionSchema.safeParse({
      given: "",
      when: "action",
      then: "result",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = AcceptanceCriterionSchema.safeParse({
      given: "context",
      when: "action",
    });
    expect(result.success).toBe(false);
  });
});

describe("TaskSchema", () => {
  const validTask = {
    id: "TASK-001",
    title: "Implement login form",
    description: "Build the login form with email and password fields",
    estimate: "S",
    labels: ["frontend"],
  };

  it("accepts valid task", () => {
    const result = TaskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
  });

  it("rejects invalid ID format", () => {
    const result = TaskSchema.safeParse({ ...validTask, id: "TASK-1" });
    expect(result.success).toBe(false);
  });

  it("rejects XL estimate for tasks", () => {
    const result = TaskSchema.safeParse({ ...validTask, estimate: "XL" });
    expect(result.success).toBe(false);
  });

  it("rejects title shorter than 5 chars", () => {
    const result = TaskSchema.safeParse({ ...validTask, title: "Do" });
    expect(result.success).toBe(false);
  });

  it("defaults labels to empty array when absent", () => {
    const result = TaskSchema.safeParse({
      id: validTask.id,
      title: validTask.title,
      description: validTask.description,
      estimate: validTask.estimate,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.labels).toEqual([]);
    }
  });

  it("accepts valid labels", () => {
    const result = TaskSchema.safeParse({ ...validTask, labels: ["frontend", "api"] });
    expect(result.success).toBe(true);
  });

  it("rejects invalid label value", () => {
    const result = TaskSchema.safeParse({ ...validTask, labels: ["documentation"] });
    expect(result.success).toBe(false);
  });
});

describe("StorySchema", () => {
  const validStory = {
    id: "STORY-001",
    title: "User can log in with email and password",
    acceptance_criteria: [
      { given: "a valid account", when: "entering correct credentials", then: "user is logged in" },
      { given: "an invalid password", when: "submitting the form", then: "error is shown" },
    ],
    estimate: "M",
    labels: ["frontend", "backend"],
    tasks: [
      {
        id: "TASK-001",
        title: "Build login form component",
        description: "React component with email and password inputs",
        estimate: "S",
      },
    ],
  };

  it("accepts valid story", () => {
    const result = StorySchema.safeParse(validStory);
    expect(result.success).toBe(true);
  });

  it("rejects fewer than 2 acceptance criteria", () => {
    const result = StorySchema.safeParse({
      ...validStory,
      acceptance_criteria: [validStory.acceptance_criteria[0]],
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 5 acceptance criteria", () => {
    const ac = validStory.acceptance_criteria[0];
    const result = StorySchema.safeParse({
      ...validStory,
      acceptance_criteria: [ac, ac, ac, ac, ac, ac],
    });
    expect(result.success).toBe(false);
  });

  it("accepts XL estimate for stories", () => {
    const result = StorySchema.safeParse({ ...validStory, estimate: "XL" });
    expect(result.success).toBe(true);
  });
});

describe("EpicSchema", () => {
  const validEpic = {
    id: "EPIC-001",
    title: "Authentication System",
    description: "User authentication with email/password",
    stories: [
      {
        id: "STORY-001",
        title: "User can log in with email and password",
        acceptance_criteria: [
          { given: "valid account", when: "correct login", then: "user logged in" },
          { given: "wrong password", when: "submit", then: "error shown" },
        ],
        estimate: "M",
        labels: ["frontend"],
        tasks: [
          {
            id: "TASK-001",
            title: "Build login form",
            description: "Login form component",
            estimate: "S",
            labels: ["frontend"],
          },
        ],
      },
    ],
  };

  it("accepts valid epic", () => {
    const result = EpicSchema.safeParse(validEpic);
    expect(result.success).toBe(true);
  });

  it("rejects invalid epic ID format", () => {
    const result = EpicSchema.safeParse({ ...validEpic, id: "EP-001" });
    expect(result.success).toBe(false);
  });
});

describe("AmbiguitySchema", () => {
  const validAmbiguity = {
    source: "The system should handle authentication",
    issue: "Authentication method not specified",
    question: "Should the system use OAuth, JWT, or session-based auth?",
    affected_ticket_ids: ["STORY-001", "TASK-002"],
    severity: "blocking" as const,
  };

  it("accepts valid blocking ambiguity", () => {
    const result = AmbiguitySchema.safeParse(validAmbiguity);
    expect(result.success).toBe(true);
  });

  it("accepts valid minor ambiguity", () => {
    const result = AmbiguitySchema.safeParse({ ...validAmbiguity, severity: "minor" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid severity", () => {
    const result = AmbiguitySchema.safeParse({ ...validAmbiguity, severity: "critical" });
    expect(result.success).toBe(false);
  });

  it("rejects empty source", () => {
    const result = AmbiguitySchema.safeParse({ ...validAmbiguity, source: "" });
    expect(result.success).toBe(false);
  });

  it("accepts empty affected_ticket_ids array", () => {
    const result = AmbiguitySchema.safeParse({ ...validAmbiguity, affected_ticket_ids: [] });
    expect(result.success).toBe(true);
  });
});

describe("DecompositionResultSchema", () => {
  it("accepts valid decomposition with nested structure", () => {
    const result = DecompositionResultSchema.safeParse({
      epics: [
        {
          id: "EPIC-001",
          title: "Authentication System",
          description: "Handle user auth",
          stories: [
            {
              id: "STORY-001",
              title: "Login with email and password",
              acceptance_criteria: [
                { given: "valid user", when: "login", then: "success" },
                { given: "invalid user", when: "login", then: "error" },
              ],
              estimate: "M",
              labels: ["frontend"],
              tasks: [
                { id: "TASK-001", title: "Build login form", description: "Form component", estimate: "S", labels: ["frontend"] },
              ],
            },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty epics array", () => {
    const result = DecompositionResultSchema.safeParse({ epics: [] });
    expect(result.success).toBe(false);
  });

  it("defaults ambiguities to empty array when absent", () => {
    const result = DecompositionResultSchema.safeParse({
      epics: [
        {
          id: "EPIC-001",
          title: "Authentication System",
          description: "Handle user auth",
          stories: [
            {
              id: "STORY-001",
              title: "Login with email and password",
              acceptance_criteria: [
                { given: "valid user", when: "login", then: "success" },
                { given: "invalid user", when: "login", then: "error" },
              ],
              estimate: "M",
              labels: ["frontend"],
              tasks: [
                { id: "TASK-001", title: "Build login form", description: "Form component", estimate: "S", labels: ["frontend"] },
              ],
            },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ambiguities).toEqual([]);
    }
  });

  it("accepts decomposition with ambiguities", () => {
    const result = DecompositionResultSchema.safeParse({
      epics: [
        {
          id: "EPIC-001",
          title: "Authentication System",
          description: "Handle user auth",
          stories: [
            {
              id: "STORY-001",
              title: "Login with email and password",
              acceptance_criteria: [
                { given: "valid user", when: "login", then: "success" },
                { given: "invalid user", when: "login", then: "error" },
              ],
              estimate: "M",
              labels: ["frontend"],
              tasks: [
                { id: "TASK-001", title: "Build login form", description: "Form component", estimate: "S", labels: ["frontend"] },
              ],
            },
          ],
        },
      ],
      ambiguities: [
        {
          source: "The system should handle auth",
          issue: "Auth method not specified",
          question: "OAuth or JWT?",
          affected_ticket_ids: ["STORY-001"],
          severity: "blocking",
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ambiguities).toHaveLength(1);
      expect(result.data.ambiguities[0].severity).toBe("blocking");
    }
  });
});

describe("DependencySchema", () => {
  it("accepts blocks type", () => {
    const result = DependencySchema.safeParse({
      from_id: "STORY-001",
      to_id: "STORY-002",
      type: "blocks",
    });
    expect(result.success).toBe(true);
  });

  it("accepts related type", () => {
    const result = DependencySchema.safeParse({
      from_id: "EPIC-001",
      to_id: "EPIC-002",
      type: "related",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid dependency type", () => {
    const result = DependencySchema.safeParse({
      from_id: "STORY-001",
      to_id: "STORY-002",
      type: "requires",
    });
    expect(result.success).toBe(false);
  });
});

describe("DependencyResultSchema", () => {
  it("accepts valid result with phases", () => {
    const result = DependencyResultSchema.safeParse({
      dependencies: [{ from_id: "STORY-001", to_id: "STORY-002", type: "blocks" }],
      phases: [
        { phase_number: 1, name: "Foundation", ticket_ids: ["STORY-001"] },
        { phase_number: 2, name: "Core", ticket_ids: ["STORY-002"] },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty dependencies with phases", () => {
    const result = DependencyResultSchema.safeParse({
      dependencies: [],
      phases: [{ phase_number: 1, name: "All", ticket_ids: ["STORY-001"] }],
    });
    expect(result.success).toBe(true);
  });
});
