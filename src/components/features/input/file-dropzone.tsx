"use client";

import { useState, useCallback, useRef } from "react";

interface FileDropzoneProps {
  onFileRead: (content: string) => void;
  onPdfFile?: (file: File) => void;
}

const TEXT_EXTENSIONS = [".md", ".markdown", ".txt"];
const PDF_EXTENSION = ".pdf";

function isTextFile(name: string): boolean {
  return TEXT_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));
}

function isPdfFile(name: string): boolean {
  return name.toLowerCase().endsWith(PDF_EXTENSION);
}

export function FileDropzone({ onFileRead, onPdfFile }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const readFile = useCallback(
    (file: File) => {
      if (isPdfFile(file.name)) {
        if (onPdfFile) {
          setFileName(file.name);
          onPdfFile(file);
        }
        return;
      }

      if (!isTextFile(file.name)) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          setFileName(file.name);
          onFileRead(content);
        }
      };
      reader.readAsText(file);
    },
    [onFileRead, onPdfFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    },
    [readFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) readFile(file);
    },
    [readFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".md,.markdown,.txt,.pdf"
        className="hidden"
        onChange={handleChange}
      />
      {fileName ? (
        <p className="text-sm">
          <span className="font-medium">{fileName}</span>
          <span className="text-muted-foreground"> loaded</span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Drop a .md or .pdf file here or click to browse
        </p>
      )}
    </div>
  );
}
