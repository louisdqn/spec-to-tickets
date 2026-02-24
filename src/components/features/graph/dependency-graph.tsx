"use client";

import { useEffect, useRef, useState } from "react";
import type { Epic, Dependency } from "@/types";
import { generateMermaidDiagram } from "@/lib/mermaid";

interface DependencyGraphProps {
  epics: Epic[];
  dependencies: Dependency[];
}

export function DependencyGraph({ epics, dependencies }: DependencyGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const diagram = generateMermaidDiagram(epics, dependencies);

    let cancelled = false;

    async function renderDiagram() {
      try {
        // Dynamic import to avoid SSR issues
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: "basis",
          },
        });

        if (cancelled) return;

        const { svg } = await mermaid.render("dep-graph", diagram);
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
  }, [epics, dependencies]);

  const blockingCount = dependencies.filter((d) => d.type === "blocks").length;

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
}
