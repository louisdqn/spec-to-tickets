import { describe, it, expect } from "vitest";
import { detectCycles } from "./graph";
import type { Dependency } from "@/types";

describe("detectCycles", () => {
  it("returns no cycles for a valid DAG", () => {
    const deps: Dependency[] = [
      { from_id: "S-001", to_id: "S-002", type: "blocks" },
      { from_id: "S-002", to_id: "S-003", type: "blocks" },
    ];
    const nodes = new Set(["S-001", "S-002", "S-003"]);

    const result = detectCycles(deps, nodes);
    expect(result.hasCycles).toBe(false);
    expect(result.cycleDetails).toEqual([]);
  });

  it("detects a simple cycle (A -> B -> A)", () => {
    const deps: Dependency[] = [
      { from_id: "S-001", to_id: "S-002", type: "blocks" },
      { from_id: "S-002", to_id: "S-001", type: "blocks" },
    ];
    const nodes = new Set(["S-001", "S-002"]);

    const result = detectCycles(deps, nodes);
    expect(result.hasCycles).toBe(true);
    expect(result.cycleDetails.length).toBeGreaterThan(0);
  });

  it("detects a 3-node cycle (A -> B -> C -> A)", () => {
    const deps: Dependency[] = [
      { from_id: "S-001", to_id: "S-002", type: "blocks" },
      { from_id: "S-002", to_id: "S-003", type: "blocks" },
      { from_id: "S-003", to_id: "S-001", type: "blocks" },
    ];
    const nodes = new Set(["S-001", "S-002", "S-003"]);

    const result = detectCycles(deps, nodes);
    expect(result.hasCycles).toBe(true);
  });

  it("ignores 'related' dependencies for cycle detection", () => {
    const deps: Dependency[] = [
      { from_id: "S-001", to_id: "S-002", type: "related" },
      { from_id: "S-002", to_id: "S-001", type: "related" },
    ];
    const nodes = new Set(["S-001", "S-002"]);

    const result = detectCycles(deps, nodes);
    expect(result.hasCycles).toBe(false);
  });

  it("handles nodes with no dependencies", () => {
    const deps: Dependency[] = [];
    const nodes = new Set(["S-001", "S-002", "S-003"]);

    const result = detectCycles(deps, nodes);
    expect(result.hasCycles).toBe(false);
  });

  it("handles single node", () => {
    const deps: Dependency[] = [];
    const nodes = new Set(["S-001"]);

    const result = detectCycles(deps, nodes);
    expect(result.hasCycles).toBe(false);
  });

  it("skips dependencies referencing unknown nodes", () => {
    const deps: Dependency[] = [
      { from_id: "S-001", to_id: "S-999", type: "blocks" },
    ];
    const nodes = new Set(["S-001", "S-002"]);

    const result = detectCycles(deps, nodes);
    expect(result.hasCycles).toBe(false);
  });

  it("detects partial cycle in mixed graph", () => {
    // S-001 -> S-002 -> S-003 (linear)
    // S-004 -> S-005 -> S-004 (cycle)
    const deps: Dependency[] = [
      { from_id: "S-001", to_id: "S-002", type: "blocks" },
      { from_id: "S-002", to_id: "S-003", type: "blocks" },
      { from_id: "S-004", to_id: "S-005", type: "blocks" },
      { from_id: "S-005", to_id: "S-004", type: "blocks" },
    ];
    const nodes = new Set(["S-001", "S-002", "S-003", "S-004", "S-005"]);

    const result = detectCycles(deps, nodes);
    expect(result.hasCycles).toBe(true);
    // The cycle detail should mention S-004 and S-005
    expect(result.cycleDetails[0]).toContain("S-004");
    expect(result.cycleDetails[0]).toContain("S-005");
  });
});
