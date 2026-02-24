import { describe, it, expect } from "vitest";
import { parseMarkdown } from "./markdown";

describe("parseMarkdown", () => {
  it("extracts headings with levels", () => {
    const md = `# Title

Some intro text.

## Section One

Content of section one.

## Section Two

Content of section two.

### Subsection

More content.`;

    const sections = parseMarkdown(md);
    expect(sections).toHaveLength(4);
    expect(sections[0]).toEqual({
      heading: "Title",
      level: 1,
      content: "Some intro text.",
    });
    expect(sections[1]).toEqual({
      heading: "Section One",
      level: 2,
      content: "Content of section one.",
    });
    expect(sections[2]).toEqual({
      heading: "Section Two",
      level: 2,
      content: "Content of section two.",
    });
    expect(sections[3]).toEqual({
      heading: "Subsection",
      level: 3,
      content: "More content.",
    });
  });

  it("handles document with no headings", () => {
    const md = "Just some plain text without any headings.";
    const sections = parseMarkdown(md);
    expect(sections).toHaveLength(1);
    expect(sections[0].heading).toBe("Document");
    expect(sections[0].level).toBe(1);
  });

  it("handles empty document", () => {
    const sections = parseMarkdown("");
    expect(sections).toHaveLength(0);
  });

  it("handles whitespace-only document", () => {
    const sections = parseMarkdown("   \n\n  ");
    expect(sections).toHaveLength(0);
  });

  it("captures content between headings of same level", () => {
    const md = `## First

Paragraph one.

Paragraph two.

## Second

Other content.`;

    const sections = parseMarkdown(md);
    expect(sections).toHaveLength(2);
    expect(sections[0].content).toContain("Paragraph one.");
    expect(sections[0].content).toContain("Paragraph two.");
    expect(sections[1].content).toBe("Other content.");
  });

  it("handles deeply nested headings", () => {
    const md = `# H1

## H2

### H3

#### H4

Content here.`;

    const sections = parseMarkdown(md);
    expect(sections).toHaveLength(4);
    expect(sections[3].level).toBe(4);
    expect(sections[3].heading).toBe("H4");
  });

  it("handles headings with inline formatting", () => {
    const md = `## **Bold** heading

Content.`;

    const sections = parseMarkdown(md);
    expect(sections).toHaveLength(1);
    expect(sections[0].heading).toBe("Bold heading");
  });

  it("handles lists under headings", () => {
    const md = `## Features

- Feature one
- Feature two
- Feature three`;

    const sections = parseMarkdown(md);
    expect(sections).toHaveLength(1);
    expect(sections[0].content).toContain("Feature one");
    expect(sections[0].content).toContain("Feature two");
  });

  it("handles a realistic PRD structure", () => {
    const md = `# Product Requirements: Auth System

## Overview

Build a user authentication system with OAuth support.

## User Stories

### US-1: Login

Users can log in with email and password.

### US-2: Registration

New users can create an account.

## Technical Requirements

- Must support OAuth 2.0
- Session management with JWT
- Rate limiting on login attempts

## Timeline

MVP by Q1 2026.`;

    const sections = parseMarkdown(md);
    expect(sections.length).toBeGreaterThanOrEqual(5);
    expect(sections[0].heading).toBe("Product Requirements: Auth System");
    expect(sections[0].level).toBe(1);

    const h2Sections = sections.filter((s) => s.level === 2);
    expect(h2Sections.length).toBe(4);

    const h3Sections = sections.filter((s) => s.level === 3);
    expect(h3Sections.length).toBe(2);
  });
});
