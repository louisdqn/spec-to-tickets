"use client";

import { Badge } from "@/components/ui/badge";
import type { Phase } from "@/types";

interface PhaseTimelineProps {
  phases: Phase[];
}

export function PhaseTimeline({ phases }: PhaseTimelineProps) {
  if (phases.length === 0) return null;

  return (
    <div className="rounded-lg border border-border p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Execution Phases
      </p>
      <div className="flex gap-2 overflow-x-auto">
        {phases.map((phase, i) => (
          <div key={phase.phase_number} className="flex items-center gap-2">
            <div className="shrink-0 rounded-lg border border-border bg-card p-3">
              <p className="mb-1 text-xs font-medium">
                Phase {phase.phase_number}: {phase.name}
              </p>
              <div className="flex flex-wrap gap-1">
                {phase.ticket_ids.map((id) => (
                  <Badge key={id} variant="secondary" className="text-[10px]">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>
            {i < phases.length - 1 && (
              <span className="shrink-0 text-muted-foreground">&rarr;</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
