import type { Epic, Dependency } from "@/types";

/**
 * Generate a Mermaid flowchart definition from epics and dependencies.
 * Renders Story-level nodes grouped by Epic. Only "blocks" dependencies
 * are rendered as edges — "related" is informational and excluded.
 *
 * @param epics - Array of epics with nested stories
 * @param dependencies - Array of dependency edges
 * @returns Mermaid diagram definition string
 */
export function generateMermaidDiagram(
  epics: Epic[],
  dependencies: Dependency[],
): string {
  const lines: string[] = ["graph TD"];

  // Subgraphs for each epic
  for (const epic of epics) {
    lines.push(`  subgraph ${epic.id}["${escapeMermaid(epic.title)}"]`);
    for (const story of epic.stories) {
      lines.push(`    ${story.id}["${escapeMermaid(story.title)}"]`);
    }
    lines.push("  end");
  }

  // Edges for blocking dependencies only
  const blockingDeps = dependencies.filter((d) => d.type === "blocks");
  for (const dep of blockingDeps) {
    lines.push(`  ${dep.from_id} --> ${dep.to_id}`);
  }

  // Style epic subgraphs
  for (const epic of epics) {
    lines.push(`  style ${epic.id} fill:#f8fafc,stroke:#e2e8f0,stroke-width:1px`);
  }

  return lines.join("\n");
}

/**
 * Escape special Mermaid characters in label text.
 */
function escapeMermaid(text: string): string {
  return text.replace(/"/g, "&quot;").replace(/[[\](){}]/g, "");
}
