import type {
  Epic,
  Story,
  Task,
  Dependency,
  Phase,
  Section,
  Ambiguity,
  ApiMetadata,
} from "@/types";

// -- State machine --

type WorkingState =
  | { step: "idle" }
  | { step: "previewing"; document: string; sections: Section[] }
  | { step: "decomposing"; document: string; sections: Section[] }
  | {
      step: "mapping";
      document: string;
      epics: Epic[];
      ambiguities: Ambiguity[];
      decomposeMetadata: ApiMetadata;
    }
  | {
      step: "complete";
      epics: Epic[];
      ambiguities: Ambiguity[];
      dependencies: Dependency[];
      phases: Phase[];
      hasCycles: boolean;
      cycleDetails: string[] | null;
      decomposeMetadata: ApiMetadata;
      dependenciesMetadata: ApiMetadata;
    };

export type AppState =
  | WorkingState
  | { step: "error"; previousState: WorkingState; errorMessage: string };

export type AppAction =
  | { type: "PREVIEW"; document: string; sections: Section[] }
  | { type: "START_DECOMPOSE" }
  | { type: "DECOMPOSE_SUCCESS"; epics: Epic[]; ambiguities: Ambiguity[]; metadata: ApiMetadata }
  | {
      type: "MAPPING_SUCCESS";
      dependencies: Dependency[];
      phases: Phase[];
      metadata: ApiMetadata;
      hasCycles: boolean;
      cycleDetails: string[] | null;
    }
  | { type: "ERROR"; message: string }
  | { type: "RESET" }
  | { type: "RETRY" }
  | { type: "UPDATE_EPIC"; epicId: string; updates: Partial<Pick<Epic, "title" | "description">> }
  | {
      type: "UPDATE_STORY";
      epicId: string;
      storyId: string;
      updates: Partial<Pick<Story, "title" | "estimate" | "labels" | "acceptance_criteria">>;
    }
  | {
      type: "UPDATE_TASK";
      epicId: string;
      storyId: string;
      taskId: string;
      updates: Partial<Pick<Task, "title" | "estimate" | "labels">>;
    };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "PREVIEW":
      return {
        step: "previewing",
        document: action.document,
        sections: action.sections,
      };
    case "START_DECOMPOSE":
      if (state.step !== "previewing") return state;
      return {
        step: "decomposing",
        document: state.document,
        sections: state.sections,
      };
    case "DECOMPOSE_SUCCESS":
      if (state.step !== "decomposing") return state;
      return {
        step: "mapping",
        document: state.document,
        epics: action.epics,
        ambiguities: action.ambiguities,
        decomposeMetadata: action.metadata,
      };
    case "MAPPING_SUCCESS":
      if (state.step !== "mapping") return state;
      return {
        step: "complete",
        epics: state.epics,
        ambiguities: state.ambiguities,
        dependencies: action.dependencies,
        phases: action.phases,
        hasCycles: action.hasCycles,
        cycleDetails: action.cycleDetails,
        decomposeMetadata: state.decomposeMetadata,
        dependenciesMetadata: action.metadata,
      };
    case "ERROR": {
      const previousState = state.step === "error" ? state.previousState : state;
      return {
        step: "error",
        previousState,
        errorMessage: action.message,
      };
    }
    case "RESET":
      return { step: "idle" };
    case "RETRY":
      if (state.step !== "error") return state;
      return state.previousState;
    case "UPDATE_EPIC":
      if (state.step !== "complete") return state;
      return {
        ...state,
        epics: state.epics.map((e) => (e.id === action.epicId ? { ...e, ...action.updates } : e)),
      };
    case "UPDATE_STORY":
      if (state.step !== "complete") return state;
      return {
        ...state,
        epics: state.epics.map((e) =>
          e.id === action.epicId
            ? {
                ...e,
                stories: e.stories.map((s) =>
                  s.id === action.storyId ? { ...s, ...action.updates } : s,
                ),
              }
            : e,
        ),
      };
    case "UPDATE_TASK":
      if (state.step !== "complete") return state;
      return {
        ...state,
        epics: state.epics.map((e) =>
          e.id === action.epicId
            ? {
                ...e,
                stories: e.stories.map((s) =>
                  s.id === action.storyId
                    ? {
                        ...s,
                        tasks: s.tasks.map((t) =>
                          t.id === action.taskId ? { ...t, ...action.updates } : t,
                        ),
                      }
                    : s,
                ),
              }
            : e,
        ),
      };
    default:
      return state;
  }
}
