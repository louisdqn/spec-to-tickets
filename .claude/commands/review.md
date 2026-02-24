Review the current git diff for issues. Be concise — only report actual problems.

Check for:
1. Security: exposed secrets, missing input validation, API key leakage.
2. Logic: off-by-one, null handling, race conditions, missing error handling.
3. Types: any `any` types? Missing Zod validation on LLM output or API inputs?
4. LLM pipeline: are prompts well-structured? Is output validated before use?

For each issue: file, line, problem, fix. Nothing else.
Do not comment on style (Prettier handles that).
