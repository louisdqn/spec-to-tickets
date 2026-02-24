# spec-to-tickets — Development Plan

## M0: Project Scaffold
- [ ] Initialize Next.js 15 project with TypeScript strict mode
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up ESLint + Prettier
- [ ] Set up Vitest
- [ ] Create folder structure (src/app, components, lib, server, types)
- [ ] Create AppError class (src/lib/errors.ts)
- [ ] Create logger utility (src/lib/logger.ts)
- [ ] Create Zod schemas for data model (src/types/schemas.ts)
- [ ] Create .env.example with required vars
- [ ] Commit: "chore: initial project scaffold"

## M1: Core MVP (Weekend 1)
- [ ] **Input: Markdown paste UI** — Textarea with paste/type input, "Upload .md" button (S)
- [ ] **Input: Markdown parser** — Parse .md into structured document tree using unified/remark (M)
- [ ] **Input: Section preview** — Display extracted sections for user confirmation (S)
- [ ] **BYOK: API key input** — Input field, store in localStorage, pass via header to API routes (S)
- [ ] **LLM Call 1: Decomposition prompt** — System prompt + tool schema for Epic>Story>Task output (M)
- [ ] **LLM Call 1: Decomposition service** — Anthropic SDK call, Zod validation, retry logic (M)
- [ ] **LLM Call 2: Dependency prompt** — System prompt + tool schema for adjacency list output (M)
- [ ] **LLM Call 2: Dependency service** — Anthropic SDK call, circular dep detection (topological sort) (M)
- [ ] **Pipeline orchestration** — Wire Call 1 → Call 2, handle errors, track token usage (S)
- [ ] **API route: /api/decompose** — Accepts markdown + API key, runs pipeline, returns results (M)
- [ ] **Results UI: Ticket hierarchy** — Collapsible Epic > Story > Task list with detail expansion (M)
- [ ] **Results UI: Dependency graph** — Mermaid.js rendered graph from adjacency list (M)
- [ ] **Export: JSON download** — Download button, Linear-compatible schema (S)
- [ ] **Rate limiting** — IP-based, 5 decompositions/day (S)
- [ ] **Loading states** — Progress indicator showing pipeline stages (S)
- [ ] **Error handling** — User-facing error messages for all failure modes (S)
- [ ] Deploy to Vercel, test end-to-end
- [ ] Commit + tag: "feat: core MVP" / M1-complete

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
Status: Not started
Next: M0 — Initialize project scaffold
