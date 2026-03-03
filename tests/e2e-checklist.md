# E2E Test Checklist — spec-to-tickets

Manual test cases for verifying the deployed application.
Run against the production Railway deployment.

## Prerequisites

- A valid Anthropic API key (sk-ant-...)
- The 3 test PRDs from `tests/fixtures/`
- A modern browser (Chrome/Firefox/Safari)

---

## Happy Path

- [ ] **Load the app** — page renders, no console errors, landing page shows hero + "Get Started" CTA
- [ ] **Navigate to /tool** — tool page renders with document input area and API key field
- [ ] **Enter a valid Anthropic API key** — key saved to localStorage, displayed as masked (password field), "Clear" button appears
- [ ] **Paste `small-prd.md`** (~200 words) — section preview renders with extracted headings and summaries
- [ ] **Confirm sections** — pipeline starts, loading states show for each stage (Decomposing... → Mapping dependencies...)
- [ ] **Results render: ticket hierarchy** — Epics are collapsible, each Epic contains Stories, each Story contains Tasks, all fields present (title, description, AC in Given/When/Then, estimates, labels)
- [ ] **Results render: dependency graph** — Mermaid graph renders with visible nodes and edges, no rendering errors in console
- [ ] **Phase timeline** — phase bar shows at bottom of results with ticket IDs grouped by phase
- [ ] **Export JSON** — click Export, file downloads, open it: valid JSON, contains `epics`, `dependencies`, `phases`, `metadata` keys
- [ ] **Token usage displayed** — response metadata shows input/output token counts
- [ ] **Total time < 30s** — from confirm to results render (for small PRD)
- [ ] **Cost shown** — estimated cost in USD displayed in results metadata

## Error Cases

- [ ] **No API key → submit** — clear error message ("API key required" or similar), submit button disabled or blocked
- [ ] **Invalid API key** — enter "sk-ant-invalid", attempt pipeline → clear error message (not a raw 401 or stack trace)
- [ ] **Empty input → submit** — validation prevents submission, textarea shows required state or button disabled
- [ ] **Malformed markdown** — paste text with no headings or broken formatting → falls back gracefully (raw text passthrough to LLM or warning in preview)
- [ ] **Rate limit hit** — after 5 decompositions (may need to test over time or verify header): clear message with remaining count or reset info via `X-RateLimit-Remaining` header

## Edge Cases

- [ ] **Very short PRD** — paste `small-prd.md` (1 paragraph / ~200 words) → still produces valid Epic/Story/Task output, no empty arrays
- [ ] **Medium PRD** — paste `medium-prd.md` (~500 words) → completes successfully, multiple epics generated
- [ ] **Large PRD** — paste `large-prd.md` (~1000 words) → completes within timeout (Railway has no 60s limit), results render correctly
- [ ] **PRD with no headings** — paste plain text paragraph with no `#` headers → parser handles it (falls back to raw text or single-section preview)
- [ ] **Refresh mid-processing** — start pipeline, refresh browser mid-call → clean state reset (idle state, no stale loading indicators)
- [ ] **Mobile viewport** — resize to 375px width → layout stacks vertically, no horizontal overflow, all content accessible
- [ ] **Tablet viewport** — resize to 768px width → layout adapts, graph and tickets readable
- [ ] **API key persistence** — save key, close tab, reopen → key loaded from localStorage, shown as saved
- [ ] **Clear API key** — click Clear → key removed from localStorage, input empty, save button returns

## Deployment-Specific

- [ ] **HTTPS** — app served over HTTPS (Railway provides this)
- [ ] **No server errors on cold start** — first request after deploy completes without 500
- [ ] **Environment variables** — no secrets leaked in client bundle (check page source for "sk-ant" or API keys)
- [ ] **Static assets load** — CSS, JS, fonts all load (no 404s in network tab)
- [ ] **API routes respond** — POST to `/api/decompose` with invalid body returns structured error (not 404 or HTML)
