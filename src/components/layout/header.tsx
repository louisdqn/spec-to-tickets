"use client";

import { ApiKeyInput } from "./api-key-input";

export function Header({ onApiKeyChange }: { onApiKeyChange: (key: string) => void }) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">spec-to-tickets</h1>
          <span className="text-xs text-muted-foreground">PRD → Engineering Tickets</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">API Key</span>
          <ApiKeyInput onKeyChange={onApiKeyChange} />
        </div>
      </div>
    </header>
  );
}
