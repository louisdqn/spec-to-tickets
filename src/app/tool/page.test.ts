import { describe, it, expect } from "vitest";
import { appReducer } from "./page";
import type { Epic, Ambiguity, Dependency, Phase, ApiMetadata } from "@/types";

// -- Test fixtures --

const mockMetadata: ApiMetadata = {
  token_usage: { input: 100, output: 50 },
  estimated_cost_usd: 0.001,
  retries: 0,
};

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
          { id: "TASK-001", title: "Create login form component", description: "Build the form", estimate: "S", labels: ["frontend"] },
          { id: "TASK-002", title: "Add form validation logic", description: "Validate inputs", estimate: "XS", labels: ["frontend"] },
        ],
      },
      {
        id: "STORY-002",
        title: "Registration page setup",
        acceptance_criteria: [
          { given: "a visitor", when: "they fill the form", then: "account is created" },
          { given: "a visitor", when: "email exists", then: "they see a warning" },
        ],
        estimate: "L",
        labels: ["frontend"],
        tasks: [],
      },
    ],
  },
  {
    id: "EPIC-002",
    title: "Dashboard Module",
    description: "Main dashboard",
    stories: [],
  },
];

const mockAmbiguities: Ambiguity[] = [
  {
    source: "The system should handle authentication",
    issue: "Authentication method not specified",
    question: "Should the system use OAuth, JWT, or session-based auth?",
    affected_ticket_ids: ["STORY-001"],
    severity: "blocking",
  },
];

const mockDependencies: Dependency[] = [
  { from_id: "STORY-002", to_id: "STORY-001", type: "blocks" },
];

const mockPhases: Phase[] = [
  { phase_number: 1, name: "Foundation", ticket_ids: ["EPIC-001"] },
];

function completeState() {
  return {
    step: "complete" as const,
    epics: structuredClone(mockEpics),
    ambiguities: mockAmbiguities,
    dependencies: mockDependencies,
    phases: mockPhases,
    hasCycles: false,
    cycleDetails: null,
    decomposeMetadata: mockMetadata,
    dependenciesMetadata: mockMetadata,
  };
}

// -- Tests --

describe("appReducer — UPDATE_EPIC", () => {
  it("updates epic title", () => {
    const state = completeState();
    const next = appReducer(state, {
      type: "UPDATE_EPIC",
      epicId: "EPIC-001",
      updates: { title: "Updated Auth System" },
    });
    expect(next.step).toBe("complete");
    if (next.step !== "complete") throw new Error("wrong step");
    expect(next.epics[0].title).toBe("Updated Auth System");
    expect(next.epics[0].description).toBe("User auth module"); // unchanged
    expect(next.epics[1].title).toBe("Dashboard Module"); // other epic unchanged
  });

  it("updates epic description", () => {
    const state = completeState();
    const next = appReducer(state, {
      type: "UPDATE_EPIC",
      epicId: "EPIC-002",
      updates: { description: "New dashboard description" },
    });
    if (next.step !== "complete") throw new Error("wrong step");
    expect(next.epics[1].description).toBe("New dashboard description");
    expect(next.epics[1].title).toBe("Dashboard Module"); // unchanged
  });

  it("ignores update when not in complete step", () => {
    const state = { step: "idle" as const };
    const next = appReducer(state, {
      type: "UPDATE_EPIC",
      epicId: "EPIC-001",
      updates: { title: "Should not apply" },
    });
    expect(next).toBe(state);
  });

  it("does not mutate when epicId is not found", () => {
    const state = completeState();
    const next = appReducer(state, {
      type: "UPDATE_EPIC",
      epicId: "EPIC-999",
      updates: { title: "Ghost" },
    });
    if (next.step !== "complete") throw new Error("wrong step");
    expect(next.epics[0].title).toBe("Authentication System");
    expect(next.epics[1].title).toBe("Dashboard Module");
  });
});

describe("appReducer — UPDATE_STORY", () => {
  it("updates story title", () => {
    const state = completeState();
    const next = appReducer(state, {
      type: "UPDATE_STORY",
      epicId: "EPIC-001",
      storyId: "STORY-001",
      updates: { title: "Improved login page" },
    });
    if (next.step !== "complete") throw new Error("wrong step");
    expect(next.epics[0].stories[0].title).toBe("Improved login page");
    expect(next.epics[0].stories[1].title).toBe("Registration page setup"); // other story unchanged
  });

  it("updates story estimate", () => {
    const state = completeState();
    const next = appReducer(state, {
      type: "UPDATE_STORY",
      epicId: "EPIC-001",
      storyId: "STORY-001",
      updates: { estimate: "XL" },
    });
    if (next.step !== "complete") throw new Error("wrong step");
    expect(next.epics[0].stories[0].estimate).toBe("XL");
  });

  it("updates story labels", () => {
    const state = completeState();
    const next = appReducer(state, {
      type: "UPDATE_STORY",
      epicId: "EPIC-001",
      storyId: "STORY-001",
      updates: { labels: ["api", "database"] },
    });
    if (next.step !== "complete") throw new Error("wrong step");
    expect(next.epics[0].stories[0].labels).toEqual(["api", "database"]);
  });

  it("updates story acceptance_criteria", () => {
    const state = completeState();
    const newAC = [
      { given: "new given", when: "new when", then: "new then" },
      { given: "another given", when: "another when", then: "another then" },
    ];
    const next = appReducer(state, {
      type: "UPDATE_STORY",
      epicId: "EPIC-001",
      storyId: "STORY-001",
      updates: { acceptance_criteria: newAC },
    });
    if (next.step !== "complete") throw new Error("wrong step");
    expect(next.epics[0].stories[0].acceptance_criteria).toEqual(newAC);
  });

  it("ignores update when not in complete step", () => {
    const state = { step: "idle" as const };
    const next = appReducer(state, {
      type: "UPDATE_STORY",
      epicId: "EPIC-001",
      storyId: "STORY-001",
      updates: { title: "Should not apply" },
    });
    expect(next).toBe(state);
  });
});

describe("appReducer — UPDATE_TASK", () => {
  it("updates task title", () => {
    const state = completeState();
    const next = appReducer(state, {
      type: "UPDATE_TASK",
      epicId: "EPIC-001",
      storyId: "STORY-001",
      taskId: "TASK-001",
      updates: { title: "Redesigned login form" },
    });
    if (next.step !== "complete") throw new Error("wrong step");
    expect(next.epics[0].stories[0].tasks[0].title).toBe("Redesigned login form");
    expect(next.epics[0].stories[0].tasks[1].title).toBe("Add form validation logic"); // other task unchanged
  });

  it("updates task estimate", () => {
    const state = completeState();
    const next = appReducer(state, {
      type: "UPDATE_TASK",
      epicId: "EPIC-001",
      storyId: "STORY-001",
      taskId: "TASK-002",
      updates: { estimate: "L" },
    });
    if (next.step !== "complete") throw new Error("wrong step");
    expect(next.epics[0].stories[0].tasks[1].estimate).toBe("L");
  });

  it("updates both title and estimate at once", () => {
    const state = completeState();
    const next = appReducer(state, {
      type: "UPDATE_TASK",
      epicId: "EPIC-001",
      storyId: "STORY-001",
      taskId: "TASK-001",
      updates: { title: "New task title here", estimate: "M" },
    });
    if (next.step !== "complete") throw new Error("wrong step");
    expect(next.epics[0].stories[0].tasks[0].title).toBe("New task title here");
    expect(next.epics[0].stories[0].tasks[0].estimate).toBe("M");
  });

  it("ignores update when not in complete step", () => {
    const state = { step: "idle" as const };
    const next = appReducer(state, {
      type: "UPDATE_TASK",
      epicId: "EPIC-001",
      storyId: "STORY-001",
      taskId: "TASK-001",
      updates: { title: "Should not apply" },
    });
    expect(next).toBe(state);
  });

  it("preserves other nested structures on task update", () => {
    const state = completeState();
    const next = appReducer(state, {
      type: "UPDATE_TASK",
      epicId: "EPIC-001",
      storyId: "STORY-001",
      taskId: "TASK-001",
      updates: { title: "Changed task title" },
    });
    if (next.step !== "complete") throw new Error("wrong step");
    // Epic level unchanged
    expect(next.epics[0].title).toBe("Authentication System");
    // Story level unchanged
    expect(next.epics[0].stories[0].title).toBe("Login page implementation");
    expect(next.epics[0].stories[0].estimate).toBe("M");
    // Other task unchanged
    expect(next.epics[0].stories[0].tasks[1].title).toBe("Add form validation logic");
    // Dependencies and phases preserved
    expect(next.dependencies).toBe(state.dependencies);
    expect(next.phases).toBe(state.phases);
  });
});

describe("appReducer — PREVIEW", () => {
  it("transitions from idle to previewing", () => {
    const state = { step: "idle" as const };
    const sections = [{ heading: "Intro", level: 1, content: "Content" }];
    const next = appReducer(state, { type: "PREVIEW", document: "# PRD", sections });
    expect(next.step).toBe("previewing");
    if (next.step !== "previewing") throw new Error("wrong step");
    expect(next.document).toBe("# PRD");
    expect(next.sections).toEqual(sections);
  });
});

describe("appReducer — START_DECOMPOSE", () => {
  it("transitions from previewing to decomposing", () => {
    const state = {
      step: "previewing" as const,
      document: "# PRD",
      sections: [{ heading: "Intro", level: 1, content: "Content" }],
    };
    const next = appReducer(state, { type: "START_DECOMPOSE" });
    expect(next.step).toBe("decomposing");
    if (next.step !== "decomposing") throw new Error("wrong step");
    expect(next.document).toBe("# PRD");
    expect(next.sections).toEqual(state.sections);
  });

  it("is no-op when not in previewing step", () => {
    const state = { step: "idle" as const };
    const next = appReducer(state, { type: "START_DECOMPOSE" });
    expect(next).toBe(state);
  });
});

describe("appReducer — DECOMPOSE_SUCCESS", () => {
  it("transitions from decomposing to mapping with epics", () => {
    const state = {
      step: "decomposing" as const,
      document: "# PRD",
      sections: [{ heading: "Intro", level: 1, content: "Content" }],
    };
    const next = appReducer(state, {
      type: "DECOMPOSE_SUCCESS",
      epics: mockEpics,
      ambiguities: mockAmbiguities,
      metadata: mockMetadata,
    });
    expect(next.step).toBe("mapping");
    if (next.step !== "mapping") throw new Error("wrong step");
    expect(next.epics).toEqual(mockEpics);
    expect(next.ambiguities).toEqual(mockAmbiguities);
    expect(next.document).toBe("# PRD");
  });

  it("is no-op when not in decomposing step", () => {
    const state = { step: "idle" as const };
    const next = appReducer(state, {
      type: "DECOMPOSE_SUCCESS",
      epics: mockEpics,
      ambiguities: mockAmbiguities,
      metadata: mockMetadata,
    });
    expect(next).toBe(state);
  });
});

describe("appReducer — MAPPING_SUCCESS", () => {
  it("transitions from mapping to complete", () => {
    const state = {
      step: "mapping" as const,
      document: "# PRD",
      epics: structuredClone(mockEpics),
      ambiguities: mockAmbiguities,
      decomposeMetadata: mockMetadata,
    };
    const next = appReducer(state, {
      type: "MAPPING_SUCCESS",
      dependencies: mockDependencies,
      phases: mockPhases,
      metadata: mockMetadata,
      hasCycles: false,
      cycleDetails: null,
    });
    expect(next.step).toBe("complete");
    if (next.step !== "complete") throw new Error("wrong step");
    expect(next.epics).toEqual(mockEpics);
    expect(next.dependencies).toEqual(mockDependencies);
    expect(next.phases).toEqual(mockPhases);
    expect(next.decomposeMetadata).toEqual(mockMetadata);
    expect(next.dependenciesMetadata).toEqual(mockMetadata);
  });

  it("is no-op when not in mapping step", () => {
    const state = { step: "idle" as const };
    const next = appReducer(state, {
      type: "MAPPING_SUCCESS",
      dependencies: mockDependencies,
      phases: mockPhases,
      metadata: mockMetadata,
      hasCycles: false,
      cycleDetails: null,
    });
    expect(next).toBe(state);
  });
});

describe("appReducer — RESET", () => {
  it("resets to idle from complete", () => {
    const state = completeState();
    const next = appReducer(state, { type: "RESET" });
    expect(next).toEqual({ step: "idle" });
  });

  it("resets to idle from error", () => {
    const errorState = {
      step: "error" as const,
      previousState: { step: "decomposing" as const, document: "# PRD", sections: [] },
      errorMessage: "Failed",
    };
    const next = appReducer(errorState, { type: "RESET" });
    expect(next).toEqual({ step: "idle" });
  });
});

describe("appReducer — ERROR & RETRY", () => {
  it("stores previous state on error", () => {
    const state = {
      step: "decomposing" as const,
      document: "# PRD",
      sections: [{ heading: "Intro", level: 1, content: "Content" }],
    };
    const next = appReducer(state, { type: "ERROR", message: "Network error" });
    expect(next.step).toBe("error");
    if (next.step !== "error") throw new Error("wrong step");
    expect(next.errorMessage).toBe("Network error");
    expect(next.previousState).toEqual(state);
  });

  it("preserves mapping state with epics on error", () => {
    const state = {
      step: "mapping" as const,
      document: "# PRD",
      epics: structuredClone(mockEpics),
      ambiguities: mockAmbiguities,
      decomposeMetadata: mockMetadata,
    };
    const next = appReducer(state, { type: "ERROR", message: "Timeout" });
    if (next.step !== "error") throw new Error("wrong step");
    expect(next.previousState.step).toBe("mapping");
    if (next.previousState.step === "mapping") {
      expect(next.previousState.epics).toEqual(mockEpics);
    }
  });

  it("RETRY restores previous state", () => {
    const decomposingState = {
      step: "decomposing" as const,
      document: "# PRD",
      sections: [{ heading: "Intro", level: 1, content: "Content" }],
    };
    const errorState = appReducer(decomposingState, { type: "ERROR", message: "Failed" });
    const retried = appReducer(errorState, { type: "RETRY" });
    expect(retried).toEqual(decomposingState);
  });

  it("RETRY from mapping error restores epics", () => {
    const mappingState = {
      step: "mapping" as const,
      document: "# PRD",
      epics: structuredClone(mockEpics),
      ambiguities: mockAmbiguities,
      decomposeMetadata: mockMetadata,
    };
    const errorState = appReducer(mappingState, { type: "ERROR", message: "Timeout" });
    const retried = appReducer(errorState, { type: "RETRY" });
    expect(retried.step).toBe("mapping");
    if (retried.step === "mapping") {
      expect(retried.epics).toEqual(mockEpics);
    }
  });

  it("RETRY is no-op when not in error state", () => {
    const state = completeState();
    const next = appReducer(state, { type: "RETRY" });
    expect(next).toBe(state);
  });

  it("nested errors preserve original working state", () => {
    const decomposingState = {
      step: "decomposing" as const,
      document: "# PRD",
      sections: [{ heading: "Intro", level: 1, content: "Content" }],
    };
    const error1 = appReducer(decomposingState, { type: "ERROR", message: "First" });
    const error2 = appReducer(error1, { type: "ERROR", message: "Second" });
    if (error2.step !== "error") throw new Error("wrong step");
    expect(error2.errorMessage).toBe("Second");
    expect(error2.previousState).toEqual(decomposingState);
  });
});
