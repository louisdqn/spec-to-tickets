"use client";

import { EpicCard } from "./epic-card";
import type { Epic } from "@/types";

interface TicketTreeProps {
  epics: Epic[];
}

export function TicketTree({ epics }: TicketTreeProps) {
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
        <EpicCard key={epic.id} epic={epic} />
      ))}
    </div>
  );
}
