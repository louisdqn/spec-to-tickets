import { describe, it, expect } from "vitest";
import { parsePdfText } from "./pdf-parser";

describe("parsePdfText", () => {
  it("returns a single 'Document' section for plain text without headings", () => {
    const text = "This is a plain paragraph of text without any headings at all.";
    const sections = parsePdfText(text);
    expect(sections).toHaveLength(1);
    expect(sections[0].heading).toBe("Document");
    expect(sections[0].level).toBe(1);
  });

  it("returns empty array for empty input", () => {
    expect(parsePdfText("")).toEqual([]);
    expect(parsePdfText("   ")).toEqual([]);
  });

  it("detects numbered sections as headings", () => {
    const text = `1. Introduction
This is the intro paragraph.

2. Requirements
These are the requirements.

2.1 Functional Requirements
Login must work.

2.2 Non-Functional Requirements
Must be fast.`;

    const sections = parsePdfText(text);
    expect(sections).toHaveLength(4);

    expect(sections[0].heading).toBe("1. Introduction");
    expect(sections[0].level).toBe(1);
    expect(sections[0].content).toContain("intro paragraph");

    expect(sections[1].heading).toBe("2. Requirements");
    expect(sections[1].level).toBe(1);
    expect(sections[1].content).toContain("requirements");

    expect(sections[2].heading).toBe("2.1. Functional Requirements");
    expect(sections[2].level).toBe(2);
    expect(sections[2].content).toContain("Login");

    expect(sections[3].heading).toBe("2.2. Non-Functional Requirements");
    expect(sections[3].level).toBe(2);
    expect(sections[3].content).toContain("fast");
  });

  it("detects ALL CAPS lines as headings", () => {
    const text = `EXECUTIVE SUMMARY
This document outlines the project plan.

TECHNICAL REQUIREMENTS
The system must use React.`;

    const sections = parsePdfText(text);
    expect(sections).toHaveLength(2);

    expect(sections[0].heading).toBe("EXECUTIVE SUMMARY");
    expect(sections[0].level).toBe(1);
    expect(sections[0].content).toContain("project plan");

    expect(sections[1].heading).toBe("TECHNICAL REQUIREMENTS");
    expect(sections[1].level).toBe(1);
    expect(sections[1].content).toContain("React");
  });

  it("detects short lines followed by blank lines as headings", () => {
    const text = `Project Overview

This is the overview of the project. It covers many topics
and spans multiple lines.

User Stories

As a user I want to log in.`;

    const sections = parsePdfText(text);
    expect(sections).toHaveLength(2);

    expect(sections[0].heading).toBe("Project Overview");
    expect(sections[0].level).toBe(2);
    expect(sections[0].content).toContain("overview of the project");

    expect(sections[1].heading).toBe("User Stories");
    expect(sections[1].level).toBe(2);
    expect(sections[1].content).toContain("log in");
  });

  it("does not treat lines ending with punctuation as headings", () => {
    const text = `Introduction

This is a sentence that ends with a period.

And this follows.`;

    const sections = parsePdfText(text);
    // "Introduction" is a heading, but the sentence ending with period is not
    expect(sections).toHaveLength(1);
    expect(sections[0].heading).toBe("Introduction");
    expect(sections[0].content).toContain("sentence that ends");
    expect(sections[0].content).toContain("And this follows");
  });

  it("handles deeply nested numbered sections", () => {
    const text = `1.1.1 Sub-sub-section
Deep content here.

1.1.2 Another sub-sub-section
More deep content.`;

    const sections = parsePdfText(text);
    expect(sections).toHaveLength(2);
    expect(sections[0].level).toBe(3);
    expect(sections[1].level).toBe(3);
  });

  it("handles mixed heading types", () => {
    const text = `OVERVIEW
High level summary.

1. Features
Feature list.

1.1 Core Features
The main features.

API DESIGN
REST endpoints.`;

    const sections = parsePdfText(text);
    expect(sections).toHaveLength(4);

    expect(sections[0].heading).toBe("OVERVIEW");
    expect(sections[0].level).toBe(1);

    expect(sections[1].heading).toBe("1. Features");
    expect(sections[1].level).toBe(1);

    expect(sections[2].heading).toBe("1.1. Core Features");
    expect(sections[2].level).toBe(2);

    expect(sections[3].heading).toBe("API DESIGN");
    expect(sections[3].level).toBe(1);
  });

  it("caps heading level at 6", () => {
    const text = `1.1.1.1.1.1.1 Very Deep
Content at the bottom.`;

    const sections = parsePdfText(text);
    expect(sections).toHaveLength(1);
    expect(sections[0].level).toBe(6);
  });

  it("preserves content between headings", () => {
    const text = `1. Setup
Install dependencies.
Run the build.
Configure the environment.

2. Deploy
Push to production.`;

    const sections = parsePdfText(text);
    expect(sections).toHaveLength(2);
    expect(sections[0].content).toBe(
      "Install dependencies.\nRun the build.\nConfigure the environment.",
    );
    expect(sections[1].content).toBe("Push to production.");
  });
});
