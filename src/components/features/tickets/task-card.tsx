"use client";

import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="rounded border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
              {task.id}
            </span>
            <p className="truncate text-sm">{task.title}</p>
          </div>
          {task.description && (
            <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
          )}
        </div>
        <Badge variant="outline" className="shrink-0 text-[10px]">
          {task.estimate}
        </Badge>
      </div>
    </div>
  );
}
