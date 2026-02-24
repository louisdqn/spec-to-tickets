---
name: api-route
description: Create a new API route following project conventions
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Create API Route

When creating a new API route:

1. Read an existing route in `src/app/api/` for the current pattern.
2. Create the route file at `src/app/api/[resource]/route.ts`.
3. Follow this structure:
   - Import Zod schema for request validation from src/types/schemas.ts
   - Validate all input with Zod at the top of each handler
   - Call the appropriate service from src/server/services/ (never call Anthropic SDK directly)
   - Return `{ data: T }` on success, `{ error, code }` on failure
   - Wrap in try/catch using AppError pattern from src/lib/errors.ts
   - Include rate limiting check
4. Create or update the Zod schema in `src/types/schemas.ts`.
5. Write a test file next to the route.
6. Run typecheck.

$ARGUMENTS
