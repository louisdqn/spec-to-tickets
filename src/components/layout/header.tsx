"use client";

import { ApiKeyInput } from "./api-key-input";

export function Header({ onApiKeyChange }: { onApiKeyChange: (key: string) => void }) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex min-h-14 max-w-7xl flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">spec-to-tickets</h1>
          <span className="hidden text-xs text-muted-foreground sm:inline">PRD → Engineering Tickets</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">API Key</span>
          <ApiKeyInput onKeyChange={onApiKeyChange} />
        </div>
      </div>
    </header>
  );
}
