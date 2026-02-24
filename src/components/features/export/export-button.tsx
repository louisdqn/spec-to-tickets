"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { buildExport, downloadJson } from "@/lib/export";
import type { Epic, Dependency, Phase, ApiMetadata } from "@/types";

interface ExportButtonProps {
  epics: Epic[];
  dependencies: Dependency[];
  phases: Phase[];
  decomposeMetadata: ApiMetadata;
  dependenciesMetadata: ApiMetadata;
  documentTitle?: string;
}

export function ExportButton({
  epics,
  dependencies,
  phases,
  decomposeMetadata,
  dependenciesMetadata,
  documentTitle = "Untitled PRD",
}: ExportButtonProps) {
  const handleExport = useCallback(() => {
    const data = buildExport({
      documentTitle,
      epics,
      dependencies,
      phases,
      decomposeMetadata,
      dependenciesMetadata,
    });

    const filename = `tickets-${documentTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.json`;
    downloadJson(data, filename);
  }, [epics, dependencies, phases, decomposeMetadata, dependenciesMetadata, documentTitle]);

  return (
    <Button variant="outline" onClick={handleExport}>
      Export JSON
    </Button>
  );
}
