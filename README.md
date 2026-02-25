# spec-to-tickets

Transform product requirements into structured, dependency-mapped engineering tickets in under 30 seconds.

- **PRD in, tickets out** — paste a Markdown or PDF spec, get a full Epic > Story > Task hierarchy with acceptance criteria
- **Dependency graph** — AI maps cross-ticket blocking relationships and suggests parallel execution phases
- **Edit before export** — inline editing of titles, estimates, labels, and acceptance criteria
- **JSON & CSV export** — Linear-compatible output, ready for your project tracker

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black.svg)](https://spec-to-tickets.vercel.app)
![Next.js 15](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)
![Claude API](https://img.shields.io/badge/Claude-Sonnet%204-D97706)

## Demo

![Demo](docs/demo.gif)

[Live demo](https://spec-to-tickets.vercel.app) — bring your own Anthropic API key.

## Features

| | |
|---|---|
| **Markdown & PDF input** | Paste or drag-and-drop. Section preview lets you confirm structure before processing. |
| **3-level decomposition** | Epics, Stories (with Given/When/Then acceptance criteria), and Tasks — each with T-shirt size estimates. |
| **Dependency mapping** | A second AI call maps blocking relationships and groups tickets into parallel execution phases. |
| **Mermaid.js visualization** | Interactive DAG of ticket dependencies, rendered client-side. |
| **Ambiguity detection** | Flags vague or contradictory requirements with clarifying questions and severity levels. |
| **Auto-labeling** | Tickets are labeled (`frontend`, `backend`, `api`, `database`, `infra`, `design`, `auth`, `testing`) with color-coded badges and a multi-select filter. |
| **Inline editing** | Edit any ticket field directly in the results view — titles, estimates, labels, acceptance criteria. |
| **JSON & CSV export** | Nested JSON with metadata, or flattened CSV with one row per ticket. Both include dependency data. |
| **BYOK** | Your Anthropic API key stays in localStorage. Never sent anywhere except `api.anthropic.com`. |

## How It Works

The pipeline uses two sequential Claude API calls with `tool_use` for structured output, each validated with Zod schemas and retried up to 2x on validation failure.

```
1. Upload PRD          Paste Markdown or drop a .md / .pdf file
       ↓
2. Preview sections    Confirm the parsed document structure
       ↓
3. Decompose           LLM Call 1 → Epic/Story/Task hierarchy + estimates + labels
       ↓
4. Map dependencies    LLM Call 2 → blocking relationships + execution phases
       ↓
5. Review & export     Edit inline, filter by label, export JSON or CSV
```

Typical cost: ~$0.12 per 3-page PRD. Processing time: < 30 seconds.

## Getting Started

```bash
git clone https://github.com/louisdqn/spec-to-tickets.git
cd spec-to-tickets
npm install
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local  # optional — or enter in the UI
npm run dev
```

Requires Node.js 18+ and an [Anthropic API key](https://console.anthropic.com/).

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| LLM | Claude API — Sonnet 4 via `tool_use` |
| Validation | Zod (LLM output + all external input) |
| Graph | Mermaid.js (client-side DAG rendering) |
| UI | Tailwind CSS + shadcn/ui |
| Markdown | unified + remark |
| Deployment | Vercel |

## Architecture

```
Ingest               Decompose              Graph                Render
─────────────        ──────────────         ──────────────       ──────────────
Markdown/PDF    →    LLM Call 1        →    LLM Call 2      →   Ticket tree
  ↓ remark            ↓ tool_use             ↓ tool_use          Mermaid DAG
Section tree          Zod validation         Topo sort           Phase timeline
                      Label inference        Cycle detection     Export (JSON/CSV)
```

- **Two-call design**: decomposition and dependency mapping are separate LLM calls. This reduces per-call complexity, improves output reliability, and keeps each call within cost/latency bounds.
- **Zod as source of truth**: schemas define the LLM tool interface, validate output at runtime, and infer TypeScript types. No manual type duplication.
- **Ephemeral processing**: no database, no server-side storage. Everything happens in memory and client state.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design document — data model, prompt engineering, retry strategy, API design, and risk analysis.

## Why I Built This

Every PM-to-engineering handoff involves the same grind: decompose a spec into tickets, estimate them, map dependencies, format for the tracker. It takes hours and the output quality varies wildly. Existing tools either require rigid templates or produce unstructured dumps that still need manual cleanup.

This project demonstrates end-to-end product thinking — document parsing, structured LLM output with validation and retry, graph algorithms, and a polished UI — in a tool that solves a real workflow bottleneck.

## License

[MIT](LICENSE)
