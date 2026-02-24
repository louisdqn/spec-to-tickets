import type { Section } from "@/types";

/**
 * Parse plain text (extracted from a PDF) into a flat array of sections.
 * Uses heuristics to identify headings:
 *  1. Numbered sections: "1.", "1.1", "2.3.1" etc.
 *  2. ALL CAPS short lines (< 80 chars)
 *  3. Short lines followed by a blank line that don't end with sentence punctuation
 *
 * @param text - Plain text extracted from a PDF
 * @returns Array of sections with heading, level, and content
 */
export function parsePdfText(text: string): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let currentHeading: string | null = null;
  let currentLevel = 1;
  let contentParts: string[] = [];

  const flushSection = () => {
    if (currentHeading) {
      sections.push({
        heading: currentHeading,
        level: currentLevel,
        content: contentParts.join("\n").trim(),
      });
    }
    contentParts = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentHeading) contentParts.push("");
      continue;
    }

    const heading = detectHeading(trimmed, lines[i + 1]);
    if (heading) {
      flushSection();
      currentHeading = heading.text;
      currentLevel = heading.level;
      continue;
    }

    if (currentHeading) {
      contentParts.push(trimmed);
    } else {
      // Content before any heading — accumulate and flush as preamble if a heading comes
      contentParts.push(trimmed);
    }
  }

  // Flush remaining
  if (currentHeading) {
    flushSection();
  }

  // If no headings found, return the entire document as a single section
  if (sections.length === 0 && text.trim().length > 0) {
    sections.push({
      heading: "Document",
      level: 1,
      content: text.trim().slice(0, 500),
    });
  }

  return sections;
}

// -- Heading detection heuristics --

const NUMBERED_HEADING_RE = /^(\d+(?:\.\d+)*)\.?\s+(.+)$/;
const ALL_CAPS_RE = /^[A-Z][A-Z\s\d:,\-&/()]+$/;

interface DetectedHeading {
  text: string;
  level: number;
}

function detectHeading(
  line: string,
  nextLine: string | undefined,
): DetectedHeading | null {
  // 1. Numbered sections: "1. Introduction", "2.3 Details", "1.1.1 Sub-item"
  const numbered = NUMBERED_HEADING_RE.exec(line);
  if (numbered) {
    const numberPart = numbered[1];
    const textPart = numbered[2].trim();
    // Only treat as heading if the text part is reasonably short
    if (textPart.length > 0 && textPart.length < 120) {
      const level = Math.min(numberPart.split(".").length, 6);
      return { text: `${numberPart}. ${textPart}`, level };
    }
  }

  // 2. ALL CAPS lines (short)
  if (line.length >= 3 && line.length < 80 && ALL_CAPS_RE.test(line)) {
    return { text: line, level: 1 };
  }

  // 3. Short lines followed by blank line, not ending with sentence punctuation
  if (
    nextLine !== undefined &&
    nextLine.trim() === "" &&
    line.length >= 3 &&
    line.length < 80 &&
    !/[.;,!?)]$/.test(line)
  ) {
    return { text: line, level: 2 };
  }

  return null;
}
