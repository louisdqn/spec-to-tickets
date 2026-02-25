import type { Epic, Ambiguity, Dependency, Phase, ApiMetadata, AcceptanceCriterion } from "@/types";
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

// -- CSV export --

interface CsvExportParams {
  epics: Epic[];
  dependencies: Dependency[];
}

interface CsvRow {
  type: "epic" | "story" | "task";
  id: string;
  title: string;
  parent_id: string;
  description: string;
  acceptance_criteria: string;
  estimate: string;
  labels: string;
  dependencies: string;
}

const CSV_HEADERS: (keyof CsvRow)[] = [
  "type",
  "id",
  "title",
  "parent_id",
  "description",
  "acceptance_criteria",
  "estimate",
  "labels",
  "dependencies",
];

function formatAC(ac: AcceptanceCriterion): string {
  return `Given ${ac.given}, When ${ac.when}, Then ${ac.then}`;
}

export function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Build a flat CSV string from the epic hierarchy.
 * Rows are ordered: epic, then its stories, then each story's tasks.
 */
export function buildCsvExport({ epics, dependencies }: CsvExportParams): string {
  const depsById = new Map<string, string[]>();
  for (const dep of dependencies) {
    if (dep.type === "blocks") {
      const existing = depsById.get(dep.to_id) ?? [];
      existing.push(dep.from_id);
      depsById.set(dep.to_id, existing);
    }
  }

  const rows: CsvRow[] = [];

  for (const epic of epics) {
    rows.push({
      type: "epic",
      id: epic.id,
      title: epic.title,
      parent_id: "",
      description: epic.description,
      acceptance_criteria: "",
      estimate: "",
      labels: "",
      dependencies: (depsById.get(epic.id) ?? []).join(","),
    });

    for (const story of epic.stories) {
      rows.push({
        type: "story",
        id: story.id,
        title: story.title,
        parent_id: epic.id,
        description: "",
        acceptance_criteria: story.acceptance_criteria.map(formatAC).join(" | "),
        estimate: story.estimate,
        labels: story.labels.join(","),
        dependencies: (depsById.get(story.id) ?? []).join(","),
      });

      for (const task of story.tasks) {
        rows.push({
          type: "task",
          id: task.id,
          title: task.title,
          parent_id: story.id,
          description: "",
          acceptance_criteria: "",
          estimate: task.estimate,
          labels: task.labels.join(","),
          dependencies: (depsById.get(task.id) ?? []).join(","),
        });
      }
    }
  }

  const header = CSV_HEADERS.join(",");
  const body = rows
    .map((row) => CSV_HEADERS.map((col) => escapeCsvField(row[col])).join(","))
    .join("\n");

  return `${header}\n${body}`;
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
