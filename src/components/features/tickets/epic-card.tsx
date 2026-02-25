"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StoryCard } from "./story-card";
import type { Epic, Story, Task } from "@/types";

interface EpicCardProps {
  epic: Epic;
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
    updates: Partial<Pick<Task, "title" | "estimate" | "labels">>,
  ) => void;
}

export function EpicCard({ epic, onUpdateEpic, onUpdateStory, onUpdateTask }: EpicCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(epic.title);
  const [draftDescription, setDraftDescription] = useState(epic.description);

  const storyCount = epic.stories.length;
  const taskCount = epic.stories.reduce((sum, s) => sum + s.tasks.length, 0);
  const isValid = draftTitle.trim().length >= 5;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftTitle(epic.title);
    setDraftDescription(epic.description);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!isValid || !onUpdateEpic) return;
    onUpdateEpic(epic.id, {
      title: draftTitle.trim(),
      description: draftDescription.trim(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-border">
        <div className="p-3 sm:p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <span className="shrink-0 font-mono text-xs text-primary">{epic.id}</span>
                <Badge variant="secondary">{storyCount} stories</Badge>
                <Badge variant="outline">{taskCount} tasks</Badge>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={!isValid}>
                  Save
                </Button>
              </div>
            </div>
            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-base font-semibold"
              placeholder="Epic title"
              autoFocus
            />
            <Textarea
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm"
              placeholder="Epic description"
              rows={3}
            />
          </div>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <div className="space-y-3 border-t border-border p-3 sm:p-4">
              {epic.stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  epicId={epic.id}
                  onUpdateStory={onUpdateStory}
                  onUpdateTask={onUpdateTask}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-start justify-between gap-2 p-3 text-left hover:bg-muted/50 sm:gap-3 sm:p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-mono text-xs text-primary">{epic.id}</span>
                <span className="text-xs text-muted-foreground">
                  {isOpen ? "\u25BC" : "\u25B6"}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold sm:text-base">{epic.title}</p>
              {epic.description && (
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{epic.description}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-2">
              {onUpdateEpic && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleEdit}
                  className="min-h-[44px] min-w-[44px] text-xs"
                >
                  Edit
                </Button>
              )}
              <Badge variant="secondary">{storyCount} stories</Badge>
              <Badge variant="outline">{taskCount} tasks</Badge>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-3 border-t border-border p-3 sm:p-4">
            {epic.stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                epicId={epic.id}
                onUpdateStory={onUpdateStory}
                onUpdateTask={onUpdateTask}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
