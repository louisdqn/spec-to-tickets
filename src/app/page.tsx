"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { ProcessingStatus } from "@/components/layout/processing-status";
import { DocumentInput } from "@/components/features/input/document-input";
import { SectionPreview } from "@/components/features/input/section-preview";
import { TicketTree } from "@/components/features/tickets/ticket-tree";
import { DependencyGraph } from "@/components/features/graph/dependency-graph";
import { PhaseTimeline } from "@/components/features/graph/phase-timeline";
import { ExportButton } from "@/components/features/export/export-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseMarkdown } from "@/lib/markdown";
import { API_KEY_HEADER } from "@/lib/constants";
import type { Epic, Dependency, Phase, Section, ApiMetadata } from "@/types";

// -- State machine --

type AppState =
  | { step: "idle" }
  | { step: "previewing"; document: string; sections: Section[] }
  | { step: "decomposing"; document: string; sections: Section[] }
  | {
      step: "mapping";
      document: string;
      epics: Epic[];
      decomposeMetadata: ApiMetadata;
    }
  | {
      step: "complete";
      epics: Epic[];
      dependencies: Dependency[];
      phases: Phase[];
      hasCycles: boolean;
      cycleDetails: string[] | null;
      decomposeMetadata: ApiMetadata;
      dependenciesMetadata: ApiMetadata;
    }
  | { step: "error"; previousStep: AppState["step"]; errorMessage: string };

type AppAction =
  | { type: "PREVIEW"; document: string; sections: Section[] }
  | { type: "START_DECOMPOSE" }
  | { type: "DECOMPOSE_SUCCESS"; epics: Epic[]; metadata: ApiMetadata }
  | {
      type: "MAPPING_SUCCESS";
      dependencies: Dependency[];
      phases: Phase[];
      metadata: ApiMetadata;
      hasCycles: boolean;
      cycleDetails: string[] | null;
    }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

function appReducer(state: AppState, action: AppAction): AppState {
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
        decomposeMetadata: action.metadata,
      };
    case "MAPPING_SUCCESS":
      if (state.step !== "mapping") return state;
      return {
        step: "complete",
        epics: state.epics,
        dependencies: action.dependencies,
        phases: action.phases,
        hasCycles: action.hasCycles,
        cycleDetails: action.cycleDetails,
        decomposeMetadata: state.decomposeMetadata,
        dependenciesMetadata: action.metadata,
      };
    case "ERROR":
      return {
        step: "error",
        previousStep: state.step,
        errorMessage: action.message,
      };
    case "RESET":
      return { step: "idle" };
    default:
      return state;
  }
}

// -- API helpers --

async function callDecompose(
  apiKey: string,
  document: string,
  sections: Section[],
): Promise<{ epics: Epic[]; metadata: ApiMetadata }> {
  const res = await fetch("/api/decompose", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [API_KEY_HEADER]: apiKey,
    },
    body: JSON.stringify({ document, sections }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Decomposition failed (${res.status})`);
  return json.data;
}

async function callDependencies(
  apiKey: string,
  epics: Epic[],
): Promise<{
  dependencies: Dependency[];
  phases: Phase[];
  has_cycles: boolean;
  cycle_details: string[] | null;
  metadata: ApiMetadata;
}> {
  // Build flat ticket list (epics + stories, not tasks)
  const tickets = [
    ...epics.map((e) => ({ id: e.id, title: e.title, description: e.description })),
    ...epics.flatMap((e) =>
      e.stories.map((s) => ({ id: s.id, title: s.title, description: s.title })),
    ),
  ];

  const res = await fetch("/api/dependencies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [API_KEY_HEADER]: apiKey,
    },
    body: JSON.stringify({ tickets }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `Dependency mapping failed (${res.status})`);
  return json.data;
}

// -- Page component --

export default function Home() {
  const [state, dispatch] = useReducer(appReducer, { step: "idle" });
  const apiKeyRef = useRef("");

  const handleApiKeyChange = useCallback((key: string) => {
    apiKeyRef.current = key;
  }, []);

  const handleDocumentSubmit = useCallback((text: string) => {
    const sections = parseMarkdown(text);
    dispatch({ type: "PREVIEW", document: text, sections });
  }, []);

  const handleConfirm = useCallback(() => {
    if (!apiKeyRef.current) {
      dispatch({ type: "ERROR", message: "Please enter your Anthropic API key first." });
      return;
    }
    dispatch({ type: "START_DECOMPOSE" });
  }, []);

  // Auto-trigger decomposition when state enters "decomposing"
  useEffect(() => {
    if (state.step !== "decomposing") return;

    let cancelled = false;
    callDecompose(apiKeyRef.current, state.document, state.sections)
      .then((result) => {
        if (!cancelled) {
          dispatch({
            type: "DECOMPOSE_SUCCESS",
            epics: result.epics,
            metadata: result.metadata,
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          dispatch({
            type: "ERROR",
            message: err instanceof Error ? err.message : "Decomposition failed",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state.step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-trigger dependency mapping when state enters "mapping"
  useEffect(() => {
    if (state.step !== "mapping") return;

    let cancelled = false;
    callDependencies(apiKeyRef.current, state.epics)
      .then((result) => {
        if (!cancelled) {
          dispatch({
            type: "MAPPING_SUCCESS",
            dependencies: result.dependencies,
            phases: result.phases,
            metadata: result.metadata,
            hasCycles: result.has_cycles,
            cycleDetails: result.cycle_details,
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          dispatch({
            type: "ERROR",
            message: err instanceof Error ? err.message : "Dependency mapping failed",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state.step]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen flex-col">
      <Header onApiKeyChange={handleApiKeyChange} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {state.step === "idle" && <IdleView onSubmit={handleDocumentSubmit} />}

        {state.step === "previewing" && (
          <div className="mx-auto max-w-2xl">
            <SectionPreview
              sections={state.sections}
              onConfirm={handleConfirm}
              onBack={() => dispatch({ type: "RESET" })}
            />
          </div>
        )}

        {state.step === "decomposing" && <ProcessingStatus currentStep="decomposing" />}
        {state.step === "mapping" && <ProcessingStatus currentStep="mapping" />}

        {state.step === "complete" && (
          <CompleteView
            epics={state.epics}
            dependencies={state.dependencies}
            phases={state.phases}
            hasCycles={state.hasCycles}
            cycleDetails={state.cycleDetails}
            decomposeMetadata={state.decomposeMetadata}
            dependenciesMetadata={state.dependenciesMetadata}
            onReset={() => dispatch({ type: "RESET" })}
          />
        )}

        {state.step === "error" && (
          <ErrorView message={state.errorMessage} onReset={() => dispatch({ type: "RESET" })} />
        )}
      </main>
    </div>
  );
}

// -- View components --

function IdleView({ onSubmit }: { onSubmit: (text: string) => void }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Transform your PRD into engineering tickets
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Paste your Product Requirements Document below or drag and drop a Markdown file.
        </p>
      </div>
      <DocumentInput onSubmit={onSubmit} />
    </div>
  );
}

function CompleteView({
  epics,
  dependencies,
  phases,
  hasCycles,
  cycleDetails,
  decomposeMetadata,
  dependenciesMetadata,
  onReset,
}: {
  epics: Epic[];
  dependencies: Dependency[];
  phases: Phase[];
  hasCycles: boolean;
  cycleDetails: string[] | null;
  decomposeMetadata: ApiMetadata;
  dependenciesMetadata: ApiMetadata;
  onReset: () => void;
}) {
  const totalStories = epics.reduce((sum, e) => sum + e.stories.length, 0);
  const totalTasks = epics.reduce(
    (sum, e) => sum + e.stories.reduce((s, st) => s + st.tasks.length, 0),
    0,
  );
  const totalCost = decomposeMetadata.estimated_cost_usd + dependenciesMetadata.estimated_cost_usd;

  // Extract document title from first epic or fallback
  const documentTitle = epics[0]?.title ?? "Untitled PRD";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Results</h2>
          <p className="text-sm text-muted-foreground">
            {epics.length} epics, {totalStories} stories, {totalTasks} tasks,{" "}
            {dependencies.filter((d) => d.type === "blocks").length} dependencies, {phases.length}{" "}
            phases &middot; ${totalCost.toFixed(3)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onReset}>
            New Document
          </Button>
          <ExportButton
            epics={epics}
            dependencies={dependencies}
            phases={phases}
            decomposeMetadata={decomposeMetadata}
            dependenciesMetadata={dependenciesMetadata}
            documentTitle={documentTitle}
          />
        </div>
      </div>

      {hasCycles && cycleDetails && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/5 p-3">
          <p className="text-sm font-medium text-destructive">Circular dependencies detected</p>
          {cycleDetails.map((detail, i) => (
            <p key={i} className="mt-1 text-xs text-destructive/80">
              {detail}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Ticket Hierarchy</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <TicketTree epics={epics} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Dependency Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <DependencyGraph epics={epics} dependencies={dependencies} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <PhaseTimeline phases={phases} />
      </div>
    </div>
  );
}

function ErrorView({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <span className="text-lg text-destructive">!</span>
      </div>
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Button className="mt-6" onClick={onReset}>
        Start Over
      </Button>
    </div>
  );
}
