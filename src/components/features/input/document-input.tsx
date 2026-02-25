"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileDropzone } from "./file-dropzone";
import { MAX_DOCUMENT_LENGTH, API_KEY_HEADER, API_KEY_STORAGE_KEY } from "@/lib/constants";
import type { Section } from "@/types";

interface DocumentInputProps {
  onSubmit: (text: string, sections?: Section[]) => void;
}

export function DocumentInput({ onSubmit }: DocumentInputProps) {
  const [text, setText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleFileRead = useCallback((content: string) => {
    setText(content);
    setPdfError(null);
  }, []);

  const handlePdfFile = useCallback(
    async (file: File) => {
      setIsParsing(true);
      setPdfError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
        const res = await fetch("/api/parse-pdf", {
          method: "POST",
          headers: { [API_KEY_HEADER]: apiKey },
          body: formData,
        });

        const json = await res.json();
        if (!res.ok) {
          setPdfError(json.error ?? "Failed to parse PDF");
          setIsParsing(false);
          return;
        }

        const { text: extractedText, sections } = json.data as {
          text: string;
          sections: Section[];
        };

        setText(extractedText);
        onSubmit(extractedText, sections);
      } catch {
        setPdfError("Failed to upload PDF. Please try again.");
      } finally {
        setIsParsing(false);
      }
    },
    [onSubmit],
  );

  const handleSubmit = useCallback(() => {
    if (text.trim()) onSubmit(text.trim());
  }, [text, onSubmit]);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_DOCUMENT_LENGTH;
  const isEmpty = text.trim().length === 0;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <FileDropzone onFileRead={handleFileRead} onPdfFile={handlePdfFile} />

        {isParsing && (
          <p className="text-center text-sm text-muted-foreground">
            Extracting text from PDF...
          </p>
        )}

        {pdfError && (
          <p className="text-center text-sm text-destructive">{pdfError}</p>
        )}

        <div className="relative">
          <Textarea
            placeholder="Or paste your PRD here (Markdown format)..."
            className="min-h-[200px] font-mono text-sm sm:min-h-[300px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey && !isEmpty && !isOverLimit) {
                handleSubmit();
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs ${isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"}`}
            >
              {charCount.toLocaleString()} / {MAX_DOCUMENT_LENGTH.toLocaleString()} chars
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">Cmd+Enter to submit</span>
          </div>
          <Button className="w-full sm:w-auto" onClick={handleSubmit} disabled={isEmpty || isOverLimit || isParsing}>
            Parse Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
