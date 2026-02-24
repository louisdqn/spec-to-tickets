# spec-to-tickets — Architecture Document

> AI-powered tool that transforms Product Requirements Documents into structured,
> dependency-mapped engineering tickets.

**Last updated:** 2026-02-24
**Status:** Pre-implementation planning

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack Decisions](#2-tech-stack-decisions)
3. [Data Model](#3-data-model)
4. [LLM Architecture](#4-llm-architecture)
5. [API Design](#5-api-design)
6. [Folder Structure](#6-folder-structure)
7. [Client-Side Architecture](#7-client-side-architecture)
8. [Milestones & Task Breakdown](#8-milestones--task-breakdown)
9. [Technical Risks & Mitigations](#9-technical-risks--mitigations)

---

## 1. Overview

### What it does

Accepts a PRD (Markdown input), uses Claude to decompose it into an
Epic → Story → Task hierarchy with acceptance criteria, complexity estimates,
and dependency graphs. Exports as Linear-compatible JSON.

### Target users

Product Managers and Tech Leads who want to go from spec to actionable
tickets in under 30 seconds.

### Design principles

- **Ephemeral processing** — no server-side storage, no database, no auth
- **BYOK** — user provides their own Anthropic API key, stored in localStorage only
- **Zero-config** — clone, add API key, run
- **Single-page flow** — input → preview → process → results, all on one page

---

## 2. Tech Stack Decisions

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript (strict mode) | Type safety critical for LLM output validation; strict mode catches schema mismatches at build time |
| Framework | Next.js 15 (App Router) | API routes for proxying Claude calls; App Router for React Server Components; native Vercel deployment |
| UI | Tailwind CSS + shadcn/ui | Rapid development with copy-paste primitives; consistent design language without custom CSS |
| LLM | Claude API via `@anthropic-ai/sdk` (Sonnet 4) | tool_use for structured JSON output; best cost/quality ratio for decomposition tasks |
| Validation | Zod | Runtime validation of LLM output; type inference for TypeScript; composable schemas |
| Markdown parsing | unified + remark | Client-side parsing; extensible plugin ecosystem; handles real-world Markdown edge cases |
| Graph rendering | Mermaid.js | Browser-side DAG rendering; no server dependency; wide format support |
| Deployment | Vercel (Hobby tier) | Free, zero-config Next.js deployment; 60s function timeout sufficient for LLM calls |

### Deferred choices (Weekend 2)

| Layer | Choice | Note |
|---|---|---|
| PDF parsing | `pdfjs-dist` | **Not** pdf-parse (unmaintained since 2021, known CVE). Use Mozilla's PDF.js instead. |

### What we're NOT using (and why)

- **No database** — ephemeral processing only; no user data to persist
- **No auth** — single-user tool; BYOK model means no shared resources to protect
- **No state management library** — React useState/useReducer sufficient for single-page flow
- **No ORM** — no database
- **No testing framework in M0** — tests added in M1 as part of end-to-end validation

---

## 3. Data Model

### Zod Schemas

```typescript
// -- Enums --

const TShirtSize = z.enum(["XS", "S", "M", "L", "XL"]);
const TaskSize = z.enum(["XS", "S", "M", "L"]); // Tasks are always < 1 day
const DependencyType = z.enum(["blocks", "related"]);

// -- Core entities --

const AcceptanceCriterion = z.object({
  given: z.string(),
  when: z.string(),
  then: z.string(),
});

const Task = z.object({
  id: z.string().regex(/^TASK-\d{3}$/),
  title: z.string().min(5).max(120),
  description: z.string().max(500),
  estimate: TaskSize,
});

const Story = z.object({
  id: z.string().regex(/^STORY-\d{3}$/),
  title: z.string().min(5).max(120),
  acceptance_criteria: z.array(AcceptanceCriterion).min(2).max(5),
  estimate: TShirtSize,
  labels: z.array(z.string()),
  tasks: z.array(Task),
});

const Epic = z.object({
  id: z.string().regex(/^EPIC-\d{3}$/),
  title: z.string().min(5).max(120),
  description: z.string().max(500),
  stories: z.array(Story),
});

// -- Dependency graph --

const Dependency = z.object({
  from_id: z.string(), // blocker
  to_id: z.string(),   // blocked
  type: DependencyType,
});

const Phase = z.object({
  phase_number: z.number().int().positive(),
  name: z.string(),
  ticket_ids: z.array(z.string()),
});

// -- Top-level output --

const DecompositionResult = z.object({
  epics: z.array(Epic),
});

const DependencyResult = z.object({
  dependencies: z.array(Dependency),
  phases: z.array(Phase),
});
```

### Design decisions

1. **Structured acceptance criteria** — `{ given, when, then }` instead of freeform
   strings. Forces the LLM to follow BDD format and enables structured rendering.

2. **Task has a `description` field** — title alone doesn't carry enough context
   for engineers picking up tickets.

3. **Tasks capped at L estimate** — anything larger should be a Story. The schema
   enforces this with `TaskSize` (no XL).

4. **`related` dependency type preserved but excluded from graph algorithms** —
   informational only. Only `blocks` type participates in topological sort and
   Mermaid rendering.

### Export format (Linear-compatible)

The JSON export includes both nested (for readability) and flat (for import)
representations:

```json
{
  "version": "1.0",
  "source": "spec-to-tickets",
  "generated_at": "2026-02-24T12:00:00Z",
  "document_title": "PRD: Feature X",
  "epics": [
    {
      "id": "EPIC-001",
      "title": "...",
      "description": "...",
      "stories": [
        {
          "id": "STORY-001",
          "title": "...",
          "epic_id": "EPIC-001",
          "acceptance_criteria": [
            { "given": "...", "when": "...", "then": "..." }
          ],
          "estimate": "M",
          "labels": ["frontend"],
          "tasks": [
            {
              "id": "TASK-001",
              "title": "...",
              "description": "...",
              "story_id": "STORY-001",
              "estimate": "S"
            }
          ]
        }
      ]
    }
  ],
  "dependencies": [
    { "from_id": "STORY-001", "to_id": "STORY-003", "type": "blocks" }
  ],
  "phases": [
    { "phase_number": 1, "name": "Foundation", "ticket_ids": ["STORY-001", "STORY-002"] }
  ],
  "metadata": {
    "total_epics": 3,
    "total_stories": 12,
    "total_tasks": 34,
    "token_usage": { "input": 4200, "output": 5800 },
    "estimated_cost_usd": 0.11
  }
}
```

Note: `epic_id` and `story_id` are added during export flattening. They are
not part of the LLM output schema (which uses nesting).

---

## 4. LLM Architecture

### Two-call design

Separating decomposition from dependency mapping reduces per-call complexity,
improves output reliability, and keeps each call within cost/latency bounds.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Flow                              │
│                                                                 │
│  Markdown ──► Parse (client) ──► Preview ──► Confirm            │
│                                                 │               │
│                                    ┌────────────▼─────────────┐ │
│                                    │  POST /api/decompose     │ │
│                                    │  (LLM Call 1)            │ │
│                                    │  → Epic/Story/Task tree  │ │
│                                    └────────────┬─────────────┘ │
│                                                 │               │
│                                    ┌────────────▼─────────────┐ │
│                                    │  POST /api/dependencies  │ │
│                                    │  (LLM Call 2)            │ │
│                                    │  → Deps + Phases         │ │
│                                    └────────────┬─────────────┘ │
│                                                 │               │
│                                    Results UI ◄─┘               │
└─────────────────────────────────────────────────────────────────┘
```

### Call 1: Decomposition

| Parameter | Value |
|---|---|
| Model | claude-sonnet-4-6 |
| Temperature | 0 |
| Max tokens | 8192 |
| Method | tool_use (structured output) |

**System prompt — key elements:**

```
You are a Senior Technical Product Manager with 15 years of experience
decomposing product requirements into engineering work.

Given a parsed PRD, decompose it into an Epic > Story > Task hierarchy.

Rules:
- Each Epic represents a major feature area or capability
- Each Story is a user-facing deliverable (vertical slice)
- Each Task is an implementation step that takes < 1 day
- Every Story must have 2-5 acceptance criteria in Given/When/Then format
- Estimates use T-shirt sizing:
    XS (< 2 hours), S (2-4 hours), M (4-8 hours), L (1-2 days), XL (2-5 days)
- Tasks may only use XS, S, M, L (no XL — split if larger)
- IDs follow the format: EPIC-001, STORY-001, TASK-001
  (global sequential numbering, not per-epic)
- Labels should reflect technical domain: frontend, backend, api, database,
  infrastructure, design, testing, documentation
```

**Tool schema:** Matches the `DecompositionResult` Zod schema exactly.

**Input:** The full parsed document text, preceded by an extracted section
outline (headers + first sentence of each section) for structural context.

### Call 2: Dependency Mapping

| Parameter | Value |
|---|---|
| Model | claude-sonnet-4-6 |
| Temperature | 0 |
| Max tokens | 4096 |
| Method | tool_use (structured output) |

**System prompt — key elements:**

```
You are a Principal Software Engineer planning execution order for a project.

Given a list of engineering tickets (ID, title, description), identify:
1. Blocking dependencies (A must complete before B can start)
2. Suggested execution phases (groups of tickets that can be worked in parallel)

Rules:
- Only create "blocks" dependencies where there is a genuine technical dependency
- Do not over-link — most tickets are independent
- Phases should represent logical execution order
- Phase 1 = tickets with no blockers (foundations)
- Every ticket must appear in exactly one phase
- Prefer fewer, stronger dependencies over many weak ones
```

**Tool schema:** Matches the `DependencyResult` Zod schema exactly.

**Input:** Flat array of `{ id, title, description }` for all Stories and Epics.
Tasks are excluded (too granular for cross-cutting dependency analysis).

**Important:** The original spec called for only IDs + titles as input. This is
insufficient — the LLM needs descriptions to determine semantic dependencies
(e.g., "Implement OAuth" blocks "Build user profile" isn't obvious from titles
in all cases). The token increase is ~500-800 tokens, well within budget.

### Post-processing (Call 2)

After receiving the dependency adjacency list:

1. **Topological sort** (Kahn's algorithm) to validate the DAG
2. If cycles are detected, report them to the user with the involved ticket IDs
   (do not silently drop edges)
3. Generate Mermaid diagram definition from the validated DAG
4. Cross-reference phases with topological order for consistency

### Retry strategy

```
attempt 1: standard call
  → Zod validation
  → if valid: return
  → if invalid: extract Zod error messages

attempt 2: include validation errors in user message
  "Your previous output had these validation errors: {errors}.
   Please fix and regenerate."
  → Zod validation
  → if valid: return
  → if invalid: retry once more

attempt 3: same as attempt 2 with accumulated errors
  → if valid: return
  → if invalid: return error to user with partial results if available
```

Target: >90% first-attempt pass rate, >99% within 2 retries.

### Cost estimate

For a typical 3-page PRD (~2000 words ≈ 2500 tokens):

| | Input tokens | Output tokens | Cost |
|---|---|---|---|
| Call 1 | ~3,500 (doc + system prompt) | ~5,000 (full hierarchy) | ~$0.086 |
| Call 2 | ~2,000 (ticket list + system prompt) | ~1,500 (deps + phases) | ~$0.029 |
| **Total** | **~5,500** | **~6,500** | **~$0.115** |

Pricing based on Sonnet 4: $3/M input, $15/M output. Under the $0.15 target.

---

## 5. API Design

### Routes

All routes are Next.js App Router API routes (`src/app/api/`).

#### `POST /api/decompose`

Decomposes a PRD into Epic/Story/Task hierarchy.

**Request:**
```typescript
// Headers
{ "x-api-key": string } // Anthropic API key (from client localStorage)

// Body
{
  document: string,        // Full Markdown text
  sections: {              // Extracted section structure (from client-side parse)
    heading: string,
    level: number,
    summary: string
  }[]
}
```

**Response (200):**
```typescript
{
  epics: Epic[],
  metadata: {
    token_usage: { input: number, output: number },
    estimated_cost_usd: number,
    retries: number
  }
}
```

**Errors:**
- `400` — Invalid request body (Zod validation of input)
- `401` — Missing or invalid API key
- `422` — LLM output failed validation after all retries
- `429` — Rate limit exceeded
- `500` — Unexpected error

#### `POST /api/dependencies`

Maps dependencies between tickets and suggests execution phases.

**Request:**
```typescript
// Headers
{ "x-api-key": string }

// Body
{
  tickets: {
    id: string,
    title: string,
    description: string
  }[]
}
```

**Response (200):**
```typescript
{
  dependencies: Dependency[],
  phases: Phase[],
  has_cycles: boolean,
  cycle_details: string[] | null, // Human-readable cycle descriptions
  metadata: {
    token_usage: { input: number, output: number },
    estimated_cost_usd: number,
    retries: number
  }
}
```

**Errors:** Same as `/api/decompose`.

### Middleware

#### Rate limiting

Best-effort in-memory rate limiting (resets on cold start):

- **Limit:** 5 requests per IP per 24 hours (across both endpoints combined)
- **Implementation:** `Map<string, { count: number, resetAt: number }>` in module scope
- **Known limitation:** Serverless function isolation means multiple instances
  maintain separate counters. Acceptable for MVP. Use Vercel KV or Upstash
  Redis if a shared demo key is added later.
- **Header:** Returns `X-RateLimit-Remaining` in responses

#### API key forwarding

- Key received via `x-api-key` header
- Forwarded to Anthropic SDK client constructor
- Never logged, never stored, never included in error responses
- Instantiate a new Anthropic client per request (do not cache clients with keys)

---

## 6. Folder Structure

```
spec-to-tickets/
├── public/
│   └── favicon.ico
├── docs/
│   └── ARCHITECTURE.md          ← you are here
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout: fonts, metadata, Tailwind
│   │   ├── page.tsx              # Single-page app: input → results flow
│   │   ├── globals.css           # Tailwind directives + CSS variables
│   │   └── api/
│   │       ├── decompose/
│   │       │   └── route.ts      # LLM Call 1 endpoint
│   │       └── dependencies/
│   │           └── route.ts      # LLM Call 2 endpoint
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── input.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   │
│   │   ├── features/
│   │   │   ├── input/
│   │   │   │   ├── document-input.tsx    # Textarea + file upload container
│   │   │   │   ├── file-dropzone.tsx     # Drag-and-drop .md upload
│   │   │   │   └── section-preview.tsx   # Parsed sections for confirmation
│   │   │   │
│   │   │   ├── tickets/
│   │   │   │   ├── ticket-tree.tsx       # Collapsible Epic > Story > Task list
│   │   │   │   ├── epic-card.tsx         # Epic detail (title, desc, story count)
│   │   │   │   ├── story-card.tsx        # Story detail (AC, estimate, labels)
│   │   │   │   └── task-card.tsx         # Task detail (title, desc, estimate)
│   │   │   │
│   │   │   ├── graph/
│   │   │   │   └── dependency-graph.tsx  # Mermaid.js wrapper + rendering
│   │   │   │
│   │   │   └── export/
│   │   │       └── export-button.tsx     # JSON download trigger
│   │   │
│   │   └── layout/
│   │       ├── header.tsx                # App header + branding
│   │       ├── api-key-input.tsx         # BYOK key input + localStorage
│   │       └── processing-status.tsx     # Step indicator during LLM calls
│   │
│   ├── lib/
│   │   ├── markdown.ts            # unified/remark: parse MD → section tree
│   │   ├── mermaid.ts             # Generate Mermaid diagram definition string
│   │   ├── graph.ts               # Topological sort (Kahn's), cycle detection
│   │   ├── export.ts              # Build Linear-compatible JSON with flattening
│   │   ├── rate-limit.ts          # In-memory IP-based rate limiter
│   │   └── constants.ts           # App-wide constants (limits, defaults)
│   │
│   ├── server/
│   │   ├── anthropic.ts           # Anthropic client factory (per-request)
│   │   ├── prompts/
│   │   │   ├── decompose.ts       # System prompt + tool schema for Call 1
│   │   │   └── dependencies.ts    # System prompt + tool schema for Call 2
│   │   └── services/
│   │       ├── decompose.ts       # Call 1 orchestration: call → validate → retry
│   │       └── dependencies.ts    # Call 2 orchestration: call → validate → topo sort
│   │
│   └── types/
│       ├── schemas.ts             # All Zod schemas (source of truth)
│       ├── api.ts                 # Request/response types (inferred from Zod)
│       └── index.ts               # Re-exports
│
├── .eslintrc.json
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── components.json                # shadcn/ui configuration
└── README.md
```

### Conventions

- **`src/server/`** — code that only runs on the server (API routes import from here)
- **`src/lib/`** — isomorphic utilities (safe to import anywhere)
- **`src/components/features/`** — domain-specific components grouped by feature area
- **`src/components/ui/`** — shadcn/ui primitives only (do not put custom components here)
- **`src/types/schemas.ts`** — single source of truth for all data shapes; TypeScript
  types are inferred via `z.infer<>`, never manually duplicated

---

## 7. Client-Side Architecture

### State machine

The app is a single page (`src/app/page.tsx`) with a linear state machine:

```
idle → previewing → decomposing → mapping → complete
  ↑                                           │
  └───────────────── (reset) ─────────────────┘

Any state → error → (retry returns to previous state)
```

| State | UI | Active action |
|---|---|---|
| `idle` | Document input (textarea + dropzone) | None |
| `previewing` | Section preview with confirm/edit | None |
| `decomposing` | Loading state with progress indicator | POST /api/decompose |
| `mapping` | Loading state (step 2 indicator) | POST /api/dependencies |
| `complete` | Split view: ticket tree (left) + graph (right) | None |
| `error` | Error message with retry button | None |

### State management

Simple `useReducer` with discriminated union:

```typescript
type AppState =
  | { step: "idle" }
  | { step: "previewing"; document: string; sections: Section[] }
  | { step: "decomposing"; document: string; sections: Section[] }
  | { step: "mapping"; epics: Epic[] }
  | { step: "complete"; epics: Epic[]; dependencies: Dependency[]; phases: Phase[] }
  | { step: "error"; previousStep: string; error: string };
```

No external state library needed. API key lives in a separate `useState`
synchronized with localStorage.

### Results layout

```
┌──────────────────────────────────────────────────────┐
│  Header  │  API Key [••••••]  │  Export JSON  │      │
├──────────────────────┬───────────────────────────────┤
│                      │                               │
│  Ticket Hierarchy    │   Dependency Graph             │
│                      │   (Mermaid.js)                │
│  ▼ EPIC-001: Auth    │                               │
│    ▼ STORY-001: ...  │   ┌───────┐    ┌───────┐     │
│      Given/When/Then │   │ S-001 │───▶│ S-003 │     │
│      Est: M          │   └───────┘    └───────┘     │
│      Labels: [be]    │       │                       │
│      ▶ TASK-001      │       ▼                       │
│      ▶ TASK-002      │   ┌───────┐                   │
│    ▶ STORY-002: ...  │   │ S-002 │                   │
│  ▶ EPIC-002: ...     │   └───────┘                   │
│                      │                               │
├──────────────────────┴───────────────────────────────┤
│  Phase 1: S-001, S-002  │  Phase 2: S-003, S-004    │
└──────────────────────────────────────────────────────┘
```

Left panel: Collapsible tree using shadcn `Collapsible`. Click to expand
epic → stories → tasks. Each level shows relevant detail.

Right panel: Mermaid.js rendered DAG. Nodes are clickable (scroll to
corresponding ticket in left panel).

Bottom bar: Phase timeline showing execution order.

---

## 8. Milestones & Task Breakdown

### M0: Project Scaffold

**Goal:** Repo is set up, folder structure exists, base components render,
dev server runs.

| # | Task | Size | Depends on |
|---|---|---|---|
| 0.1 | Initialize Next.js 15 project with TypeScript strict mode | S | — |
| 0.2 | Configure Tailwind CSS + shadcn/ui (install, `components.json`, CSS variables) | S | 0.1 |
| 0.3 | Set up ESLint (strict TS rules) + Prettier + `.gitignore` | S | 0.1 |
| 0.4 | Create folder structure (`components/`, `lib/`, `server/`, `types/`) | S | 0.1 |
| 0.5 | Define all Zod schemas in `types/schemas.ts` + export inferred TS types | M | 0.4 |
| 0.6 | Install shadcn/ui primitives: Button, Card, Collapsible, Badge, Textarea, Input, Tabs | S | 0.2 |
| 0.7 | Build root layout (`layout.tsx`): fonts, metadata, global structure | S | 0.6 |
| 0.8 | Build Header component with app title + API key input (localStorage read/write) | M | 0.7 |
| 0.9 | Create `page.tsx` shell with state machine skeleton (all states, placeholder UI) | M | 0.8 |
| 0.10 | Verify: `npm run dev` serves the app, `npm run build` succeeds, `npm run lint` passes | S | 0.9 |

**Estimated effort:** ~4-5 hours
**Definition of done:** App runs locally, displays header with API key input,
shows empty input form. All types compile. Lint passes. Build succeeds.

---

### M1: Core MVP (Weekend 1)

**Goal:** End-to-end pipeline works. Paste a PRD, get tickets + dependency graph,
export JSON.

#### Phase 1: Input Processing

| # | Task | Size | Depends on |
|---|---|---|---|
| 1.1 | Implement Markdown parser (`lib/markdown.ts`): extract heading tree + section summaries using unified/remark | M | 0.5 |
| 1.2 | Build DocumentInput component: textarea with paste support + character count | M | 0.9 |
| 1.3 | Build FileDropzone component: drag-and-drop `.md` file upload, read as text | M | 0.9 |
| 1.4 | Build SectionPreview component: display extracted heading tree, confirm button | S | 1.1 |
| 1.5 | Wire input flow: idle → paste/upload → parse → previewing state transition | M | 1.2, 1.3, 1.4 |

#### Phase 2: LLM Integration

| # | Task | Size | Depends on |
|---|---|---|---|
| 1.6 | Create Anthropic client factory (`server/anthropic.ts`): per-request instantiation from API key header | S | 0.5 |
| 1.7 | Write decomposition system prompt + tool schema (`server/prompts/decompose.ts`) | L | 0.5 |
| 1.8 | Build decomposition service (`server/services/decompose.ts`): call → Zod validate → retry loop | L | 1.6, 1.7 |
| 1.9 | Build `/api/decompose` route: input validation, rate limit check, call service, return response | M | 1.8 |
| 1.10 | Write dependency system prompt + tool schema (`server/prompts/dependencies.ts`) | M | 0.5 |
| 1.11 | Implement topological sort + cycle detection (`lib/graph.ts`) | M | 0.5 |
| 1.12 | Build dependency service (`server/services/dependencies.ts`): call → validate → topo sort | M | 1.6, 1.10, 1.11 |
| 1.13 | Build `/api/dependencies` route: input validation, rate limit check, call service, return response | M | 1.12 |
| 1.14 | Implement rate limiter (`lib/rate-limit.ts`): in-memory, per-IP, 5/day | S | — |

#### Phase 3: Results UI

| # | Task | Size | Depends on |
|---|---|---|---|
| 1.15 | Build TicketTree component: collapsible hierarchy (Epic → Story → Task) | L | 0.6 |
| 1.16 | Build EpicCard, StoryCard, TaskCard components with full detail rendering | M | 0.6 |
| 1.17 | Build Mermaid diagram generator (`lib/mermaid.ts`): tickets + deps → Mermaid definition string | M | — |
| 1.18 | Build DependencyGraph component: render Mermaid in browser, handle resize | M | 1.17 |
| 1.19 | Build phase timeline bar at bottom of results view | S | — |
| 1.20 | Build ProcessingStatus component: step indicator with current operation label | S | — |

#### Phase 4: Export + Integration

| # | Task | Size | Depends on |
|---|---|---|---|
| 1.21 | Build export utility (`lib/export.ts`): flatten hierarchy, add parent refs, build JSON | M | 0.5 |
| 1.22 | Build ExportButton component: trigger download of JSON file | S | 1.21 |
| 1.23 | Wire full pipeline: input → decompose → dependencies → results (state machine transitions, loading states, error handling) | L | 1.5, 1.9, 1.13, 1.15, 1.18, 1.22 |
| 1.24 | Test with 3 sample PRDs of varying complexity (small/medium/large). Verify: output validates, graph renders, export works, cost < $0.15, time < 30s | L | 1.23 |
| 1.25 | Error handling polish: API key missing/invalid, LLM timeout, validation failure, network error — all show clear user-facing messages | M | 1.23 |

**Estimated effort:** ~20-24 hours (full weekend)
**Definition of done:** User can paste a Markdown PRD, see section preview,
confirm, wait for processing, view ticket hierarchy + dependency graph,
and export as JSON. End-to-end time < 30s for a 3-page PRD. Cost < $0.15.

**Critical path:** 0.5 → 1.7 → 1.8 → 1.9 → 1.23 → 1.24

---

### M2: Weekend 2 — Polish + Extend

| Feature | Notes |
|---|---|
| PDF upload | Use `pdfjs-dist`. Add to FileDropzone, parse to text, feed into existing pipeline. |
| Inline ticket editing | Edit title, AC, estimate, labels directly in the ticket tree. Local state only. |
| CSV export | Flat export: one row per Story with columns matching Linear CSV import. |
| Ambiguity detection | Add a pre-processing LLM call that identifies vague/ambiguous sections and generates clarifying questions. |
| Auto-labeling | Extend Call 1 prompt to assign labels from a fixed taxonomy: frontend, backend, api, database, infrastructure, design, testing, docs. |
| Responsive mobile layout | Stack panels vertically on mobile. Collapse graph to accordion. |
| README | Architecture diagram (Mermaid), demo GIF, setup instructions, contributing guide. |

---

### M3: Post-MVP Backlog (ideas, unscoped)

- Linear API direct push (OAuth + API integration)
- GitHub Issues / GitLab Issues export
- Jira export format (JQL-compatible)
- Multiple LLM provider support (OpenAI, Gemini, Llama)
- Batch processing (upload multiple PRDs)
- Prompt customization UI (tweak decomposition rules)
- Cost tracking dashboard (cumulative token usage)
- Shareable links (store results in URL hash or short-lived KV)
- Side-by-side comparison (re-run and diff outputs)
- Webhook notifications (POST results to a URL)
- VS Code extension
- CLI version (`npx spec-to-tickets --input prd.md --output tickets.json`)
- Template library (pre-built PRD templates with expected output examples)

---

## 9. Technical Risks & Mitigations

### High severity

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **LLM output fails Zod validation** | Pipeline breaks, no tickets generated | Medium | tool_use constrains output format. Retry with error feedback (up to 2x). Target >90% first-attempt, >99% with retries. Include explicit format examples in prompt. |
| **Vercel function timeout (60s)** | Request fails mid-processing | Low | Separate API routes (don't chain calls). Each call budgeted for 25s max. Client orchestrates sequentially. Monitor with `metadata.token_usage`. |
| **API key leaked in logs/errors** | User's Anthropic key exposed | Low | Never log the key. Never include in error responses. Instantiate new client per request. Add `x-api-key` to the server's log-scrub list. |

### Medium severity

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **Cost exceeds $0.15 for large PRDs** | Unexpected charges for user | Medium | Count input tokens before sending. Warn user if document exceeds 5000 tokens (~4 pages). Show estimated cost before confirmation. Include actual cost in response metadata. |
| **Mermaid.js slow on large graphs** | UI freezes on 50+ node graphs | Medium | Limit graph to Story-level nodes (exclude Tasks). For >30 nodes, offer a simplified view (phase-grouped clusters). Render in a Web Worker if needed (M2). |
| **Real-world Markdown is messy** | Parser fails on non-standard formatting | High | Preview step lets user confirm parsed structure. If parsing produces poor results, fall back to sending raw text (the LLM handles unstructured text well). Don't block on parsing failures. |
| **Rate limiter resets on cold starts** | Ineffective protection for shared demo key | High | Acceptable for MVP (BYOK model means each user pays their own costs). Upgrade to Vercel KV / Upstash Redis before adding a shared demo key. |

### Low severity

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **Circular dependencies in LLM output** | Graph rendering fails | Low | Kahn's algorithm detects cycles. Report to user with involved ticket IDs. Remove cycle edges and show warning rather than failing entirely. |
| **Claude API rate limits / outages** | Processing fails | Low | Surface clear error messages. No retry on 429 (user's key, user's limits). Link to Anthropic status page in error message. |
| **Token estimation inaccuracy** | Cost display misleading | Low | Use Anthropic SDK's `usage` field from the response (exact, not estimated). Only the pre-call estimate is approximate. |
