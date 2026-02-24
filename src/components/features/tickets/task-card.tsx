"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TASK_SIZES } from "@/lib/constants";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  epicId?: string;
  storyId?: string;
  onUpdateTask?: (
    epicId: string,
    storyId: string,
    taskId: string,
    updates: Partial<Pick<Task, "title" | "estimate">>,
  ) => void;
}

export function TaskCard({ task, epicId, storyId, onUpdateTask }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftEstimate, setDraftEstimate] = useState(task.estimate);

  const canEdit = !!onUpdateTask && !!epicId && !!storyId;
  const isValid = draftTitle.trim().length >= 5;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftTitle(task.title);
    setDraftEstimate(task.estimate);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!isValid || !onUpdateTask || !epicId || !storyId) return;
    onUpdateTask(epicId, storyId, task.id, {
      title: draftTitle.trim(),
      estimate: draftEstimate,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="rounded border border-border bg-background p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
              {task.id}
            </span>
            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 text-sm"
              autoFocus
            />
          </div>
          <div className="flex items-center justify-between">
            <select
              value={draftEstimate}
              onChange={(e) => setDraftEstimate(e.target.value as Task["estimate"])}
              className="h-7 rounded border border-border bg-background px-2 text-xs"
            >
              {TASK_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              <Button variant="ghost" size="xs" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="xs" onClick={handleSave} disabled={!isValid}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex shrink-0 items-center gap-1">
          <Badge variant="outline" className="text-[10px]">
            {task.estimate}
          </Badge>
          {canEdit && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleEdit}
              className="h-5 px-1 text-[10px]"
            >
              Edit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
