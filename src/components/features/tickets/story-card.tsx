"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TaskCard } from "./task-card";
import { ALL_LABELS, T_SHIRT_SIZES } from "@/lib/constants";
import type { Story, Task, AcceptanceCriterion } from "@/types";

interface StoryCardProps {
  story: Story;
  epicId?: string;
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

export function StoryCard({ story, epicId, onUpdateStory, onUpdateTask }: StoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(story.title);
  const [draftEstimate, setDraftEstimate] = useState(story.estimate);
  const [draftLabels, setDraftLabels] = useState<string[]>([...story.labels]);
  const [draftAC, setDraftAC] = useState<AcceptanceCriterion[]>(
    story.acceptance_criteria.map((ac) => ({ ...ac })),
  );

  const canEdit = !!onUpdateStory && !!epicId;
  const isValid =
    draftTitle.trim().length >= 5 &&
    draftAC.every((ac) => ac.given.trim() && ac.when.trim() && ac.then.trim());

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftTitle(story.title);
    setDraftEstimate(story.estimate);
    setDraftLabels([...story.labels]);
    setDraftAC(story.acceptance_criteria.map((ac) => ({ ...ac })));
    setIsOpen(true);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!isValid || !onUpdateStory || !epicId) return;
    onUpdateStory(epicId, story.id, {
      title: draftTitle.trim(),
      estimate: draftEstimate,
      labels: draftLabels as Story["labels"],
      acceptance_criteria: draftAC,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const toggleLabel = (label: string) => {
    setDraftLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const updateAC = (index: number, field: keyof AcceptanceCriterion, value: string) => {
    setDraftAC((prev) =>
      prev.map((ac, i) => (i === index ? { ...ac, [field]: value } : ac)),
    );
  };

  const removeAC = (index: number) => {
    setDraftAC((prev) => prev.filter((_, i) => i !== index));
  };

  const addAC = () => {
    setDraftAC((prev) => [...prev, { given: "", when: "", then: "" }]);
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="p-4">
          <div className="space-y-3">
            {/* Header with ID and Save/Cancel */}
            <div className="flex items-center justify-between">
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {story.id}
              </span>
              <div className="flex gap-1">
                <Button variant="ghost" size="xs" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="xs" onClick={handleSave} disabled={!isValid}>
                  Save
                </Button>
              </div>
            </div>

            {/* Title */}
            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") handleCancel();
              }}
              className="text-sm font-medium"
              placeholder="Story title"
              autoFocus
            />

            {/* Estimate */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Estimate:</span>
              <select
                value={draftEstimate}
                onChange={(e) => setDraftEstimate(e.target.value as Story["estimate"])}
                className="h-7 rounded border border-border bg-background px-2 text-xs"
              >
                {T_SHIRT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Labels */}
            <div>
              <span className="text-xs text-muted-foreground">Labels:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {ALL_LABELS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleLabel(label)}
                    className="cursor-pointer"
                  >
                    <Badge
                      variant={draftLabels.includes(label) ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      {label}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Acceptance Criteria */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Acceptance Criteria
                </span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={addAC}
                  disabled={draftAC.length >= 5}
                >
                  + Add
                </Button>
              </div>
              <div className="space-y-2">
                {draftAC.map((ac, i) => (
                  <div key={i} className="rounded bg-muted/50 p-2.5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-12 shrink-0 text-[10px] font-medium text-muted-foreground">
                          Given
                        </span>
                        <Input
                          value={ac.given}
                          onChange={(e) => updateAC(i, "given", e.target.value)}
                          className="h-6 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-12 shrink-0 text-[10px] font-medium text-muted-foreground">
                          When
                        </span>
                        <Input
                          value={ac.when}
                          onChange={(e) => updateAC(i, "when", e.target.value)}
                          className="h-6 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-12 shrink-0 text-[10px] font-medium text-muted-foreground">
                          Then
                        </span>
                        <Input
                          value={ac.then}
                          onChange={(e) => updateAC(i, "then", e.target.value)}
                          className="h-6 text-xs"
                        />
                      </div>
                    </div>
                    <div className="mt-1.5 flex justify-end">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => removeAC(i)}
                        disabled={draftAC.length <= 2}
                        className="h-5 text-[10px] text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks (read-only section, still shown while editing story) */}
        {story.tasks.length > 0 && (
          <div className="border-t border-border px-4 pb-4 pt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tasks ({story.tasks.length})
            </p>
            <div className="space-y-1.5">
              {story.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  epicId={epicId}
                  storyId={story.id}
                  onUpdateTask={onUpdateTask}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

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
            <div className="flex shrink-0 items-center gap-1">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleEdit}
                  className="text-xs"
                >
                  Edit
                </Button>
              )}
              <Badge variant="outline" className="shrink-0">
                {story.estimate}
              </Badge>
            </div>
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
                    <TaskCard
                      key={task.id}
                      task={task}
                      epicId={epicId}
                      storyId={story.id}
                      onUpdateTask={onUpdateTask}
                    />
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
