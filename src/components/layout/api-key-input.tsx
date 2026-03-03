"use client";

import { useState, useCallback, useEffect, useSyncExternalStore } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_KEY_STORAGE_KEY } from "@/lib/constants";

const emptyString = () => "";

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredKey() {
  return localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
}

export function ApiKeyInput({ onKeyChange }: { onKeyChange: (key: string) => void }) {
  const savedKey = useSyncExternalStore(subscribeStorage, getStoredKey, emptyString);
  const [editValue, setEditValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isSaved = !!savedKey && !isEditing;
  const displayValue = isEditing ? editValue : savedKey;

  useEffect(() => {
    onKeyChange(savedKey);
  }, [savedKey, onKeyChange]);

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    localStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
    window.dispatchEvent(new StorageEvent("storage"));
    setIsEditing(false);
    setEditValue("");
  }, [editValue]);

  const handleClear = useCallback(() => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    window.dispatchEvent(new StorageEvent("storage"));
    setIsEditing(false);
    setEditValue("");
  }, []);

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <div className="relative min-w-0 flex-1 sm:flex-initial">
        <Input
          type={isVisible ? "text" : "password"}
          placeholder="sk-ant-..."
          value={displayValue}
          onChange={(e) => {
            setEditValue(e.target.value);
            setIsEditing(true);
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
        <Button size="sm" variant="secondary" onClick={handleSave} disabled={!displayValue.trim()}>
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
