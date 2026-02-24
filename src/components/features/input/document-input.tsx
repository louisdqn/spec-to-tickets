"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileDropzone } from "./file-dropzone";
import { MAX_DOCUMENT_LENGTH } from "@/lib/constants";

interface DocumentInputProps {
  onSubmit: (text: string) => void;
}

export function DocumentInput({ onSubmit }: DocumentInputProps) {
  const [text, setText] = useState("");

  const handleFileRead = useCallback((content: string) => {
    setText(content);
  }, []);

  const handleSubmit = useCallback(() => {
    if (text.trim()) onSubmit(text.trim());
  }, [text, onSubmit]);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_DOCUMENT_LENGTH;
  const isEmpty = text.trim().length === 0;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <FileDropzone onFileRead={handleFileRead} />

        <div className="relative">
          <Textarea
            placeholder="Or paste your PRD here (Markdown format)..."
            className="min-h-[300px] font-mono text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey && !isEmpty && !isOverLimit) {
                handleSubmit();
              }
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs ${isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"}`}
            >
              {charCount.toLocaleString()} / {MAX_DOCUMENT_LENGTH.toLocaleString()} chars
            </span>
            <span className="text-xs text-muted-foreground">Cmd+Enter to submit</span>
          </div>
          <Button onClick={handleSubmit} disabled={isEmpty || isOverLimit}>
            Parse Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
