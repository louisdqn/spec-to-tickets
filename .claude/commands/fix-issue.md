Fix GitHub issue: $ARGUMENTS

Steps:
1. Use `gh issue view $ARGUMENTS` to get issue details.
2. Understand the problem. Explore relevant code.
3. Plan the fix.
4. Implement and test.
5. Run typecheck and lint.
6. Commit with: `fix: [description] (closes #$ARGUMENTS)`
7. Push and create a PR with `gh pr create`.
