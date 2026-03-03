# Project: spec-to-tickets

Open-source AI tool that transforms PRDs into structured, dependency-mapped engineering tickets (Epic > Story > Task).

## Tech Stack
- Next.js 15 (App Router), TypeScript strict mode
- Tailwind CSS + shadcn/ui
- Claude API (Anthropic SDK, Sonnet 4) — two-call architecture with tool_use
- Zod for LLM output validation + all external input
- Mermaid.js for dependency graph rendering
- unified/remark for Markdown parsing
- Deployed on Railway (Docker). No database. No auth.

## Commands
- `npm run dev` — Start dev server (port 3000)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript compiler check
- `npm test` — Run Vitest
- `npm run test:e2e` — Playwright e2e tests

## Architecture
- `src/app/` — Next.js App Router (pages, layouts, API routes)
- `src/components/` — React components (ui/ for shadcn, features/ for domain)
- `src/lib/` — Shared utilities, clients, helpers
- `src/server/` — Server-only code (services, AI pipeline, prompts)
- `src/types/` — Zod schemas and TypeScript types
- See `docs/ARCHITECTURE.md` for full design decisions and data model.

## Key Architecture Decisions
- Two-call LLM pipeline: Call 1 = decomposition, Call 2 = dependency mapping. Never combine into one call.
- All LLM output MUST be Zod-validated before rendering. Retry up to 2x on validation failure.
- Processing is ephemeral. No server-side document storage. No database.
- API key is provided by user (BYOK) and stored in localStorage only.

## Conventions
- Named exports only. No default exports except Next.js pages.
- Zod for ALL external input validation (API routes, LLM output, file uploads).
- Server Components by default. 'use client' only when needed.
- All API routes return: `{ data: T }` or `{ error: string, code: string }`.
- Error handling: throw `AppError` (see src/lib/errors.ts) — never return raw errors to client.
- Commits: conventional commits (feat:, fix:, chore:, docs:).

## LLM Pipeline Rules
- System prompts live in `src/server/prompts/`. One file per prompt.
- Tool schemas (for tool_use) live in `src/types/schemas.ts` alongside their Zod definitions.
- Temperature = 0 for consistency.
- Always log token usage (input + output) for cost tracking.
- Never send user's API key to any endpoint other than api.anthropic.com.

## Testing
- Write tests for: LLM output parsing, Zod schema validation, document parsing, dependency graph logic.
- Test file location: colocated, `*.test.ts` next to source file.
- Run single test: `npx vitest run src/path/to/file.test.ts`
- Do NOT test UI rendering unless it contains complex state logic.

## Important Warnings
- NEVER store or log user API keys server-side.
- NEVER persist uploaded documents. Process in memory only.
- NEVER commit .env or .env.local files.
- Always validate LLM output with Zod before passing to UI.
- The API route at /api/decompose MUST validate the API key is present and rate-limit by IP.

## Workflow
1. Before modifying code, read relevant files to understand current implementation.
2. For changes touching 3+ files, outline the plan first.
3. Implement changes.
4. Run `npm run typecheck && npm run lint` after changes.
5. Run relevant tests.
6. Commit with conventional commit message.
