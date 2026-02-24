import type { Epic, Ambiguity, Dependency, Phase, ApiMetadata } from "@/types";
import type { FullExport } from "@/types";

interface ExportParams {
  documentTitle: string;
  epics: Epic[];
  ambiguities?: Ambiguity[];
  dependencies: Dependency[];
  phases: Phase[];
  decomposeMetadata: ApiMetadata;
  dependenciesMetadata: ApiMetadata;
}

/**
 * Build a Linear-compatible JSON export from decomposition results.
 * Adds parent references (epic_id on stories, story_id on tasks) for
 * flat import and aggregates metadata from both LLM calls.
 *
 * @param params - Decomposition results and metadata from both calls
 * @returns Full export object ready for JSON serialization
 */
export function buildExport(params: ExportParams): FullExport {
  const { documentTitle, epics, ambiguities = [], dependencies, phases, decomposeMetadata, dependenciesMetadata } =
    params;

  // Add parent references to the export (modifying copies, not originals)
  const epicsWithRefs = epics.map((epic) => ({
    ...epic,
    stories: epic.stories.map((story) => ({
      ...story,
      epic_id: epic.id,
      tasks: story.tasks.map((task) => ({
        ...task,
        story_id: story.id,
      })),
    })),
  }));

  const totalStories = epics.reduce((sum, e) => sum + e.stories.length, 0);
  const totalTasks = epics.reduce(
    (sum, e) => sum + e.stories.reduce((s, st) => s + st.tasks.length, 0),
    0,
  );

  const totalUsage = {
    input: decomposeMetadata.token_usage.input + dependenciesMetadata.token_usage.input,
    output: decomposeMetadata.token_usage.output + dependenciesMetadata.token_usage.output,
  };

  return {
    version: "1.0",
    source: "spec-to-tickets",
    generated_at: new Date().toISOString(),
    document_title: documentTitle,
    epics: epicsWithRefs,
    ambiguities,
    dependencies,
    phases,
    metadata: {
      total_epics: epics.length,
      total_stories: totalStories,
      total_tasks: totalTasks,
      token_usage: totalUsage,
      estimated_cost_usd:
        Math.round(
          (decomposeMetadata.estimated_cost_usd + dependenciesMetadata.estimated_cost_usd) * 1000,
        ) / 1000,
    },
  };
}

/**
 * Trigger a JSON file download in the browser.
 *
 * @param data - Object to serialize as JSON
 * @param filename - Download filename
 */
export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
