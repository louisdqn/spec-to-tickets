"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import type { Epic, Dependency } from "@/types";
import { generateMermaidDiagram } from "@/lib/mermaid";

// Singleton: import + initialize mermaid once across all renders
let mermaidReady: Promise<typeof import("mermaid")["default"]> | null = null;

function getMermaid() {
  if (!mermaidReady) {
    mermaidReady = import("mermaid").then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: "neutral",
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: "basis",
        },
      });
      return m.default;
    });
  }
  return mermaidReady;
}

interface DependencyGraphProps {
  epics: Epic[];
  dependencies: Dependency[];
}

export const DependencyGraph = memo(function DependencyGraph({
  epics,
  dependencies,
}: DependencyGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const instanceId = useId();
  const renderCount = useRef(0);

  const blockingCount = useMemo(
    () => dependencies.filter((d) => d.type === "blocks").length,
    [dependencies],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const diagram = generateMermaidDiagram(epics, dependencies);
    const renderId = `dep-graph-${instanceId.replace(/:/g, "")}-${++renderCount.current}`;

    let cancelled = false;

    async function renderDiagram() {
      try {
        const mermaid = await getMermaid();

        if (cancelled) return;

        const { svg } = await mermaid.render(renderId, diagram);
        if (!cancelled && container) {
          container.innerHTML = svg;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render graph");
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [epics, dependencies, instanceId]);

  if (blockingCount === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          No blocking dependencies — all tickets can run in parallel.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-destructive">Graph render error: {error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-auto [&_svg]:max-w-full"
    />
  );
});
