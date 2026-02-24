"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TaskCard } from "./task-card";
import type { Story } from "@/types";

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border bg-card">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {story.id}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isOpen ? "\u25BC" : "\u25B6"}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium">{story.title}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {story.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="text-[10px]">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
            <Badge variant="outline" className="shrink-0">
              {story.estimate}
            </Badge>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border px-4 pb-4 pt-3">
            {/* Acceptance Criteria */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Acceptance Criteria
              </p>
              <div className="space-y-2">
                {story.acceptance_criteria.map((ac, i) => (
                  <div key={i} className="rounded bg-muted/50 p-2.5 text-xs">
                    <p>
                      <span className="font-medium text-muted-foreground">Given </span>
                      {ac.given}
                    </p>
                    <p>
                      <span className="font-medium text-muted-foreground">When </span>
                      {ac.when}
                    </p>
                    <p>
                      <span className="font-medium text-muted-foreground">Then </span>
                      {ac.then}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            {story.tasks.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tasks ({story.tasks.length})
                </p>
                <div className="space-y-1.5">
                  {story.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
