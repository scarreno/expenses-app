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


## Authenticated Functional Validation

Some application features require a real authenticated Clerk session.

Agents must not attempt to bypass, modify, mock, or work around authentication solely to perform manual or browser-based validation.

When a feature requires authentication that is not available to the agent:

- Do not attempt to log in using user credentials.
- Do not create temporary or test users unless explicitly requested.
- Do not modify Clerk configuration.
- Do not disable or bypass authentication.
- Do not add temporary authentication code for testing.
- Do not spend time repeatedly attempting browser-based access to authenticated pages.

Instead, validate the implementation through:

1. Existing automated tests relevant to the change.
2. Lint.
3. TypeScript/type checking when available.
4. Production build.
5. Static review against the issue acceptance criteria.
6. Additional automated tests when appropriate and consistent with the existing test architecture.

The user will perform authenticated functional and UI validation when a real authenticated session is required.

In the completion report, clearly distinguish between:

- automated/static validation performed by the agent;
- authenticated functional/UI validation that remains for the user to perform manually.

Lack of access to an authenticated browser session is not a reason to modify the authentication architecture.