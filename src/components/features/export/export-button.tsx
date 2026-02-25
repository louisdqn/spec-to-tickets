"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { buildExport, downloadJson, buildCsvExport, downloadCsv } from "@/lib/export";
import type { Epic, Ambiguity, Dependency, Phase, ApiMetadata } from "@/types";

interface ExportButtonProps {
  epics: Epic[];
  ambiguities?: Ambiguity[];
  dependencies: Dependency[];
  phases: Phase[];
  decomposeMetadata: ApiMetadata;
  dependenciesMetadata: ApiMetadata;
  documentTitle?: string;
}

export function ExportButton({
  epics,
  ambiguities,
  dependencies,
  phases,
  decomposeMetadata,
  dependenciesMetadata,
  documentTitle = "Untitled PRD",
}: ExportButtonProps) {
  const handleExportJson = useCallback(() => {
    const data = buildExport({
      documentTitle,
      epics,
      ambiguities,
      dependencies,
      phases,
      decomposeMetadata,
      dependenciesMetadata,
    });

    const filename = `tickets-${documentTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.json`;
    downloadJson(data, filename);
  }, [epics, ambiguities, dependencies, phases, decomposeMetadata, dependenciesMetadata, documentTitle]);

  const handleExportCsv = useCallback(() => {
    const csv = buildCsvExport({ epics, dependencies });
    downloadCsv(csv, "spec-to-tickets-export.csv");
  }, [epics, dependencies]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button variant="outline" size="sm" onClick={handleExportJson}>
        Export JSON
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportCsv}>
        Export CSV
      </Button>
    </div>
  );
}
