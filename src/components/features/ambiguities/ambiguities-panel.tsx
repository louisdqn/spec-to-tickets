"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import type { Ambiguity } from "@/types";

interface AmbiguitiesPanelProps {
  ambiguities: Ambiguity[];
}

export function AmbiguitiesPanel({ ambiguities }: AmbiguitiesPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const blockingCount = ambiguities.filter((a) => a.severity === "blocking").length;
  const minorCount = ambiguities.filter((a) => a.severity === "minor").length;

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`h-4 w-4 shrink-0 text-amber-600 transition-transform ${isOpen ? "rotate-90" : ""}`}
                />
                <CardTitle className="text-base text-amber-900">
                  Ambiguities & Clarifying Questions
                </CardTitle>
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  {ambiguities.length}
                </Badge>
              </div>
              <div className="flex gap-1.5">
                {blockingCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {blockingCount} blocking
                  </Badge>
                )}
                {minorCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {minorCount} minor
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            {ambiguities.map((ambiguity, i) => (
              <div
                key={i}
                className="rounded-lg border border-amber-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">
                    {ambiguity.question}
                  </p>
                  <Badge
                    variant={ambiguity.severity === "blocking" ? "destructive" : "secondary"}
                    className="shrink-0 text-xs"
                  >
                    {ambiguity.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  <span className="font-medium">Issue:</span> {ambiguity.issue}
                </p>
                <p className="mt-1 text-xs italic text-slate-500">
                  &ldquo;{ambiguity.source}&rdquo;
                </p>
                {ambiguity.affected_ticket_ids.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ambiguity.affected_ticket_ids.map((id) => (
                      <Badge key={id} variant="outline" className="text-xs">
                        {id}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
