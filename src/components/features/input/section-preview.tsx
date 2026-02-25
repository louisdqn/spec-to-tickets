"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Section } from "@/types";

interface SectionPreviewProps {
  sections: Section[];
  onConfirm: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function SectionPreview({ sections, onConfirm, onBack, isLoading }: SectionPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Document Structure</span>
          <span className="text-sm font-normal text-muted-foreground">
            {sections.length} section{sections.length !== 1 ? "s" : ""} detected
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[50vh] space-y-1.5 overflow-y-auto sm:max-h-[400px]">
          {sections.map((section, i) => (
            <div
              key={i}
              className="rounded border border-border px-2.5 py-2 sm:px-3"
              style={{ marginLeft: `${(section.level - 1) * 8}px` }}
            >
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  H{section.level}
                </span>
                <p className="text-sm font-medium">{section.heading}</p>
              </div>
              {section.content && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {section.content}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={onBack} disabled={isLoading}>
            Back
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : "Decompose into Tickets"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
