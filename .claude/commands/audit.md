Review this codebase thoroughly before making any code changes.

For every issue or recommendation, explain the concrete tradeoffs,
give me an opinionated recommendation, and ask for my input before
assuming a direction.

Use my engineering preferences from CLAUDE.md to guide your recommendations.

## Review Sections

### 1. Architecture Review
Evaluate: system design, component boundaries, data flow, LLM pipeline design, error propagation.

### 2. Code Quality Review
Evaluate: code organization, DRY violations, error handling gaps, edge cases, over/under-engineering.

### 3. Test Review
Evaluate: coverage gaps, assertion quality, missing edge cases, untested LLM failure modes.

### 4. Performance Review
Evaluate: LLM call efficiency, token usage, unnecessary re-renders, bundle size.

## For Each Issue Found
- Describe the problem with file and line references.
- Present 2-3 options including "do nothing".
- Give your recommended option and why.
- Pause and ask for my input before proceeding.

## Workflow
After each section, STOP and ask for my feedback before moving on.

## Scope: $ARGUMENTS
