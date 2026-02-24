# spec-to-tickets — Development Plan

## M0: Project Scaffold
- [x] Initialize Next.js 15 project with TypeScript strict mode
- [x] Configure Tailwind CSS + shadcn/ui
- [x] Set up ESLint + Prettier
- [x] Set up Vitest
- [x] Create folder structure (src/app, components, lib, server, types)
- [x] Create AppError class (src/lib/errors.ts)
- [x] Create logger utility (src/lib/logger.ts)
- [x] Create Zod schemas for data model (src/types/schemas.ts)
- [x] Create .env.example with required vars
- [x] Commit: "chore: initial project scaffold"

## M1: Core MVP (Weekend 1)
- [x] **Input: Markdown paste UI** — Textarea with paste/type input, "Upload .md" button (S)
- [x] **Input: Markdown parser** — Parse .md into structured document tree using unified/remark (M)
- [x] **Input: Section preview** — Display extracted sections for user confirmation (S)
- [x] **BYOK: API key input** — Input field, store in localStorage, pass via header to API routes (S)
- [x] **LLM Call 1: Decomposition prompt** — System prompt + tool schema for Epic>Story>Task output (M)
- [x] **LLM Call 1: Decomposition service** — Anthropic SDK call, Zod validation, retry logic (M)
- [x] **LLM Call 2: Dependency prompt** — System prompt + tool schema for adjacency list output (M)
- [x] **LLM Call 2: Dependency service** — Anthropic SDK call, circular dep detection (topological sort) (M)
- [x] **Pipeline orchestration** — Wire Call 1 → Call 2, handle errors, track token usage (S)
- [x] **API route: /api/decompose** — Accepts markdown + API key, runs pipeline, returns results (M)
- [x] **Results UI: Ticket hierarchy** — Collapsible Epic > Story > Task list with detail expansion (M)
- [x] **Results UI: Dependency graph** — Mermaid.js rendered graph from adjacency list (M)
- [x] **Export: JSON download** — Download button, Linear-compatible schema (S)
- [x] **Rate limiting** — IP-based, 5 decompositions/day (S)
- [x] **Loading states** — Progress indicator showing pipeline stages (S)
- [x] **Error handling** — User-facing error messages for all failure modes (S)
- [ ] Deploy to Vercel, test end-to-end
- [x] Commit + tag: "feat: core MVP" / M1-complete

## M2: Polish & Extend (Weekend 2)
- [ ] PDF upload support (pdf-parse)
- [ ] Inline ticket editing (title, AC, estimate, labels)
- [ ] CSV export
- [ ] Ambiguity detection + clarifying questions
- [ ] Auto-labeling (frontend/backend/infra/design)
- [ ] Responsive mobile layout
- [ ] README with architecture diagram, demo GIF

## M3: Post-MVP (Backlog)
- Linear API direct integration
- Jira API integration
- Notion import support
- Iteration history (SQLite)
- Team config (custom scales, label taxonomies)
- Multi-document input

## Current Task
Status: M0 complete, M1 complete (code only)
Next: Deploy to Vercel, test end-to-end → then M2
