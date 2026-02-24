import type { Dependency } from "@/types";

interface CycleCheckResult {
  hasCycles: boolean;
  cycleDetails: string[];
}

/**
 * Detect circular dependencies using Kahn's algorithm (topological sort).
 * Only considers "blocks" dependencies — "related" edges are informational
 * and excluded from cycle detection.
 *
 * @param dependencies - Array of dependency edges
 * @param allNodeIds - Set of all valid ticket IDs (for validation)
 * @returns Whether cycles exist and human-readable descriptions of them
 */
export function detectCycles(
  dependencies: Dependency[],
  allNodeIds: Set<string>,
): CycleCheckResult {
  // Filter to only blocking dependencies
  const blockingDeps = dependencies.filter((d) => d.type === "blocks");

  // Build adjacency list and in-degree count
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const id of allNodeIds) {
    adjacency.set(id, []);
    inDegree.set(id, 0);
  }

  for (const dep of blockingDeps) {
    // Skip edges referencing unknown nodes
    if (!allNodeIds.has(dep.from_id) || !allNodeIds.has(dep.to_id)) continue;

    adjacency.get(dep.from_id)!.push(dep.to_id);
    inDegree.set(dep.to_id, (inDegree.get(dep.to_id) ?? 0) + 1);
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);

    for (const neighbor of adjacency.get(node) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  // If sorted doesn't contain all nodes, there are cycles
  if (sorted.length === allNodeIds.size) {
    return { hasCycles: false, cycleDetails: [] };
  }

  // Find nodes involved in cycles (those not in sorted output)
  const sortedSet = new Set(sorted);
  const cycleNodes = [...allNodeIds].filter((id) => !sortedSet.has(id));

  const cycleDetails = [
    `Circular dependency detected involving ${cycleNodes.length} tickets: ${cycleNodes.join(", ")}`,
  ];

  return { hasCycles: true, cycleDetails };
}
