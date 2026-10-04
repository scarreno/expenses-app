# AGENTS.md

## Project context

This is the Expenses app repository.

The agent must inspect the existing codebase before making changes. Do not assume outdated documentation is correct.

## General rules

- Do not invent features.
- Do not delete files without asking first.
- Do not modify production configuration or secrets.
- Do not create commits, branches, PRs, or pushes unless explicitly requested.
- Prefer small, focused changes.
- Explain what files were changed and why.

## Tech rules

- Use TypeScript.
- Do not use `any` unless there is no reasonable alternative.
- Follow the existing project structure.
- Follow the existing naming conventions.
- Prefer existing libraries already used in the project.
- Validate inputs when applicable.
- Keep authentication aligned with the current implementation.

## Before finishing

When code changes are made, run or suggest:

```bash
npm run lint
npm run build
npm test