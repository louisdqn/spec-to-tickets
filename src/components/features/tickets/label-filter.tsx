"use client";

import { Badge } from "@/components/ui/badge";
import { LABEL_COLORS } from "./label-badge";
import { ALL_LABELS } from "@/lib/constants";
import type { TicketLabel } from "@/types";

interface LabelFilterProps {
  selected: TicketLabel[];
  onChange: (labels: TicketLabel[]) => void;
}

export function LabelFilter({ selected, onChange }: LabelFilterProps) {
  const toggle = (label: TicketLabel) => {
    onChange(
      selected.includes(label)
        ? selected.filter((l) => l !== label)
        : [...selected, label],
    );
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap">
      <span className="mr-1 shrink-0 text-xs text-muted-foreground">Filter:</span>
      {ALL_LABELS.map((label) => {
        const isActive = selected.includes(label);
        return (
          <button
            key={label}
            type="button"
            onClick={() => toggle(label)}
            className="min-h-[44px] shrink-0 cursor-pointer px-0.5"
          >
            <Badge
              variant="outline"
              className={`text-[10px] transition-opacity ${isActive ? `border-transparent ${LABEL_COLORS[label]}` : "opacity-40 hover:opacity-70"}`}
            >
              {label}
            </Badge>
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="ml-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  );
}
