"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_KEY_STORAGE_KEY } from "@/lib/constants";

function getStoredKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
}

export function ApiKeyInput({
  onKeyChange,
}: {
  onKeyChange: (key: string) => void;
}) {
  const [key, setKey] = useState(getStoredKey);
  const [isVisible, setIsVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(() => getStoredKey() !== "");
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!notifiedRef.current && key) {
      notifiedRef.current = true;
      onKeyChange(key);
    }
  }, [key, onKeyChange]);

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
    <div className="flex items-center gap-2">
      <div className="relative">
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
          className="w-56 pr-16 font-mono text-xs"
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
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
