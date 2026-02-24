"use client";

import { EpicCard } from "./epic-card";
import type { Epic, Story, Task } from "@/types";

interface TicketTreeProps {
  epics: Epic[];
  onUpdateEpic?: (
    epicId: string,
    updates: Partial<Pick<Epic, "title" | "description">>,
  ) => void;
  onUpdateStory?: (
    epicId: string,
    storyId: string,
    updates: Partial<Pick<Story, "title" | "estimate" | "labels" | "acceptance_criteria">>,
  ) => void;
  onUpdateTask?: (
    epicId: string,
    storyId: string,
    taskId: string,
    updates: Partial<Pick<Task, "title" | "estimate">>,
  ) => void;
}

export function TicketTree({ epics, onUpdateEpic, onUpdateStory, onUpdateTask }: TicketTreeProps) {
  if (epics.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No tickets generated.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {epics.map((epic) => (
        <EpicCard
          key={epic.id}
          epic={epic}
          onUpdateEpic={onUpdateEpic}
          onUpdateStory={onUpdateStory}
          onUpdateTask={onUpdateTask}
        />
      ))}
    </div>
  );
}
