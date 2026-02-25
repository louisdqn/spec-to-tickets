"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_KEY_STORAGE_KEY } from "@/lib/constants";

export function ApiKeyInput({
  onKeyChange,
}: {
  onKeyChange: (key: string) => void;
}) {
  const [key, setKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
    if (stored) {
      setKey(stored);
      setIsSaved(true);
      onKeyChange(stored);
    }
    setHydrated(true);
  }, [onKeyChange]);

  const handleSave = useCallback(() => {
    if (!key.trim()) return;
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    setIsSaved(true);
    onKeyChange(key.trim());
  }, [key, onKeyChange]);

  const handleClear = useCallback(() => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setKey("");
    setIsSaved(false);
    onKeyChange("");
  }, [onKeyChange]);

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <div className="relative min-w-0 flex-1 sm:flex-initial">
        <Input
          type={isVisible ? "text" : "password"}
          placeholder="sk-ant-..."
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setIsSaved(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          className="w-full pr-16 font-mono text-xs sm:w-56"
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
      {!isSaved ? (
        <Button size="sm" variant="secondary" onClick={handleSave} disabled={!key.trim()}>
          Save
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={handleClear}>
          Clear
        </Button>
      )}
    </div>
  );
}
