---
name: llm-prompt
description: Create or modify an LLM prompt for the decomposition pipeline
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# LLM Prompt Development

When creating or modifying an LLM prompt:

1. Read existing prompts in `src/server/prompts/` for the current pattern.
2. Prompt file exports a string constant (the system prompt) and a tool schema.
3. The tool schema must have a corresponding Zod schema in `src/types/schemas.ts`.
4. Always include in the system prompt:
   - Clear role definition
   - Explicit output constraints (counts, sizes, formats)
   - Examples of good output if the schema is complex
5. Test the prompt by writing a test that:
   - Passes a known input document
   - Validates the output against the Zod schema
   - Checks structural constraints (e.g., 2-5 AC per story)
6. Log token usage in the service that calls this prompt.
7. Temperature = 0, include seed parameter.

$ARGUMENTS
