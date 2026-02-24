"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StoryCard } from "./story-card";
import type { Epic } from "@/types";

interface EpicCardProps {
  epic: Epic;
}

export function EpicCard({ epic }: EpicCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const storyCount = epic.stories.length;
  const taskCount = epic.stories.reduce((sum, s) => sum + s.tasks.length, 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-mono text-xs text-primary">{epic.id}</span>
                <span className="text-xs text-muted-foreground">
                  {isOpen ? "\u25BC" : "\u25B6"}
                </span>
              </div>
              <p className="mt-1 text-base font-semibold">{epic.title}</p>
              {epic.description && (
                <p className="mt-1 text-sm text-muted-foreground">{epic.description}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <Badge variant="secondary">{storyCount} stories</Badge>
              <Badge variant="outline">{taskCount} tasks</Badge>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-3 border-t border-border p-4">
            {epic.stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
