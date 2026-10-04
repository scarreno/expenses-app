# AGENTS.md

## Project Overview

This repository contains **Guarda tu Boleta**, a web application for capturing, organizing, reviewing, and analyzing household receipts and expenses.

The application was originally developed under the working name **Expenses / Expenses MVP**.

The public product name is now:

**Guarda tu Boleta**

Production domain:

**https://guardatuboleta.app**

The repository and existing technical architecture retain their current technical naming unless an explicit task requests otherwise.

---

## Core Product Concept

Guarda tu Boleta is centered around receipts as the primary source of household expense information.

The core workflow is:

1. The user uploads or captures a receipt.
2. The application extracts receipt information using OCR/AI.
3. The user reviews and edits the extracted information.
4. The receipt and its items are stored.
5. Purchases are categorized.
6. Historical receipt and expense information can be reviewed and analyzed.

Receipts are the central domain entity of the current product.

Future functionality may expand into broader household expense management, but agents must not implement speculative functionality unless explicitly requested.

---

## Technology Stack

The application currently uses:

- Next.js with App Router
- TypeScript
- React
- Prisma ORM
- Neon PostgreSQL
- Clerk Authentication
- Tailwind CSS
- shadcn/ui
- tweakcn-based theme
- OpenAI APIs for receipt extraction/OCR-related processing
- Internationalization with English and Spanish dictionaries

Before introducing a new library, framework, architectural pattern, or dependency, first verify whether the repository already contains an established solution for the same problem.

Prefer existing project patterns over introducing new abstractions.

---

## Product Branding vs Technical Naming

The public product name is:

**Guarda tu Boleta**

This is a product branding decision, not a repository-wide technical rename.

### User-facing branding

User-facing product references should use:

**Guarda tu Boleta**

The brand name itself must not be translated.

Correct:

- Spanish: `Guarda tu Boleta`
- English: `Guarda tu Boleta`

Surrounding copy may be localized normally.

### Technical naming

Do NOT rename technical resources solely to match the new product brand.

This includes, but is not limited to:

- GitHub repository: `expenses-app`
- package names
- Prisma models
- database tables
- database names
- existing migrations
- environment variable names
- API routes
- internal identifiers
- internal directory names
- Git branches
- deployment project names
- infrastructure resources
- existing domain terminology

Terms such as the following remain valid technical/domain concepts:

- `Receipt`
- `ReceiptItem`
- `Expense`
- `Category`
- `BusinessType`

Do not replace `receipt` with `boleta` in code merely because the product is named Guarda tu Boleta.

Any technical rename requires an explicit task.

---

## Environment Architecture

The application has separate development/QA and production environments.

### Local Development

Local development uses:

- Local Next.js application
- Clerk Development
- Neon Development database

Local development must never connect to production data unless explicitly required for a controlled administrative task.

### QA

QA is hosted on Vercel.

QA uses:

- Vercel
- Clerk Development
- Neon Development database

Local development and Vercel QA intentionally share the development authentication/database environment.

QA data is considered non-production/test data.

### Production

Production is hosted on Netlify.

Production uses:

- Netlify
- Clerk Production
- Neon Production database
- `https://guardatuboleta.app`

Production data must remain isolated from development and QA.

### Environment Safety

Never:

- point QA to the production database
- point local development to the production database
- use Clerk Production credentials in QA/local
- use Clerk Development credentials in production
- copy production secrets into source code
- hardcode credentials or environment-specific secrets

If an environment-related change is required, verify the target environment before making assumptions.

---

## Git and Deployment Model

The intended deployment model is:

- Development and feature work is validated locally.
- QA is deployed through Vercel.
- Production is deployed through Netlify.
- Production corresponds to the production-ready branch/workflow defined by the repository.

Do not modify deployment branch configuration unless explicitly requested.

Do not assume that a hosting provider's environment named `Production` corresponds to the product's actual production environment.

For this project:

- Vercel is QA.
- Netlify is production.

---

## Authentication Architecture

Authentication is provided by **Clerk**.

Supported authentication methods may include:

- Email/password
- Google OAuth
- Other providers explicitly configured later

Clerk is responsible for:

- authentication
- sessions
- password management
- email verification
- OAuth identity
- authentication-related user identity

Prisma is not the authentication provider.

---

## User Domain Model

The Prisma `User` represents the application's business-domain user.

The Clerk user ID is used as the Prisma User ID.

Conceptually:

Clerk User ID → Prisma User → Receipts / Categories / Settings / other owned entities

Do not reintroduce authentication-specific database models previously managed by Auth.js/NextAuth unless explicitly required.

The previous Auth.js models such as:

- Account
- Session
- VerificationToken

are no longer part of the intended authentication architecture.

---

## User Provisioning

User provisioning is intentionally separated from authentication.

Expected flow:

1. Clerk authenticates the user.
2. The application determines whether the corresponding Prisma User exists.
3. If the business user does not exist, the user is routed through onboarding/provisioning.
4. Onboarding creates the required application-domain records.
5. The user enters the application.

Do not add hidden database creation side effects to helpers whose responsibility is only retrieving the authenticated user.

In particular, authentication lookup helpers should not silently create business users unless the architecture is explicitly changed.

---

## Data Ownership

User-owned data must always be scoped to the authenticated application user.

This includes entities such as:

- receipts
- receipt items through their receipt
- categories
- settings
- future user-owned entities

Never weaken or remove ownership validation for convenience.

Any endpoint, server action, query, or mutation that operates on user-owned data must ensure that the authenticated user owns the requested resource.

Do not rely exclusively on IDs received from the client for authorization.

---

## Database Changes

Prisma is the source of truth for the application's database model.

When changing the schema:

1. Understand the existing relationships.
2. Consider ownership implications.
3. Consider development and production migration impact.
4. Avoid destructive migrations unless explicitly required.
5. Do not modify production data manually as part of normal feature implementation.

Do not introduce a database migration for purely visual, branding, copy, or frontend changes.

Never delete or rewrite production data unless explicitly instructed.

---

## Receipt Domain

Receipts are currently the central domain entity.

Existing receipt behavior includes concepts such as:

- receipt upload
- image/file storage
- OCR/AI extraction
- receipt editing
- receipt history
- receipt items
- categories
- business types
- ownership validation

When modifying receipt behavior, preserve existing flows unless the issue explicitly changes them.

Avoid mixing unrelated receipt-processing changes into UI or branding work.

---

## Business Types

Business Types are maintained through reusable localized catalogs/dictionaries rather than duplicated hardcoded lists.

The same source should be reused by features such as:

- receipt upload
- receipt editing
- history filtering
- future business-type selectors

Do not create independent hardcoded Business Type lists in individual components.

---

## Internationalization

The application supports:

- English
- Spanish

User-facing application copy should use the existing internationalization architecture.

Do not introduce hardcoded user-facing strings when the surrounding feature already uses dictionaries.

When adding new copy:

1. Add the appropriate English entry.
2. Add the appropriate Spanish entry.
3. Use the established dictionary structure.
4. Keep keys semantic and consistent with existing conventions.

The product brand **Guarda tu Boleta** must remain unchanged across languages.

---

## UI and Design System

The application uses:

- Tailwind CSS
- shadcn/ui
- a tweakcn-based theme

Prefer existing components and design tokens.

Before creating a new UI abstraction:

1. Check whether an existing shared component already solves the problem.
2. Check whether shadcn/ui provides an appropriate primitive.
3. Follow established layout and styling patterns.

Avoid unnecessary custom CSS when Tailwind or existing components are sufficient.

Do not redesign unrelated screens while implementing a focused issue.

---

## Responsive Design

The application is intended to work well on:

- desktop
- tablet
- mobile browsers

Receipt upload is particularly important on mobile because users may capture receipt photos directly from their phones.

Changes must preserve responsive behavior.

Do not consider a UI task complete if it only works at desktop widths.

---

## Mobile Direction

The current product is a responsive web application.

The application may later be packaged or evolved into a mobile application, but this is not part of normal feature work unless explicitly requested.

Do not introduce React Native, Capacitor, PWA-specific architecture, or other mobile packaging changes without an explicit issue.

---

## Public Website Direction

A public product/marketing website is planned.

Expected future public content includes areas such as:

- landing page
- product explanation
- features
- FAQ
- Privacy Policy
- Terms of Service
- other legal/compliance content

Do not implement the public website opportunistically while working on authenticated application issues.

Marketing-site work must be handled through dedicated issues.

---

## Legal and Compliance

Privacy Policy, Terms of Service, and related compliance work are separate product concerns.

When implementing legal pages:

- do not invent legal guarantees
- do not claim certifications that do not exist
- accurately describe actual application behavior
- accurately describe third-party providers used by the application

Legal content should reflect the real architecture and data flows.

---

## Code Quality

Prefer:

- small focused changes
- existing patterns
- explicit types
- readable code
- clear responsibilities
- reusable components when reuse is real
- server-side ownership validation
- minimal unnecessary abstraction

Avoid:

- speculative abstractions
- unrelated refactors
- large rewrites for small issues
- duplicated business logic
- duplicated localized catalogs
- weakening TypeScript types
- `any` unless clearly justified
- suppressing errors instead of fixing them

---

## Scope Discipline

Every task should remain within the requested issue scope.

Do not opportunistically:

- redesign unrelated pages
- rename unrelated code
- upgrade dependencies
- refactor architecture
- modify database models
- change authentication flows
- change deployment configuration

unless required to complete the requested task.

If you discover a worthwhile improvement outside the current scope, report it as a recommendation for a separate issue instead of implementing it automatically.

---

## Working Procedure

Before implementing a non-trivial issue:

1. Read the issue completely.
2. Inspect the relevant existing implementation.
3. Identify established project patterns.
4. Identify affected files.
5. Check whether the requested change affects authentication, ownership, database schema, i18n, or deployment behavior.
6. Provide a concise implementation plan before editing when requested.

Do not assume architecture based only on the issue description when the repository can provide the answer.

---

## Validation

Before considering implementation complete, run the relevant project validation commands.

At minimum, when applicable:

- lint
- TypeScript validation
- production build

Also perform focused validation of the feature being changed.

For UI work, verify:

- desktop behavior
- mobile behavior
- English
- Spanish

For authentication work, verify relevant authenticated/unauthenticated flows.

For data changes, verify ownership behavior.

Do not claim validation passed unless the command or behavior was actually tested.

---

## Git Safety

Do not commit changes unless explicitly requested.

Do not push changes unless explicitly requested.

Do not merge pull requests unless explicitly requested.

Do not create releases or tags unless explicitly requested.

Do not force-push.

Do not rewrite Git history.

When asked to prepare a commit, first summarize the changes and validation status.

---

## Secrets and Security

Never expose or commit:

- Clerk secret keys
- OpenAI API keys
- Neon database credentials
- storage tokens
- OAuth client secrets
- other private environment variables

Public environment variables such as `NEXT_PUBLIC_*` should still only be exposed when intentionally designed for client use.

Do not move server secrets into `NEXT_PUBLIC_*` variables.

Never print secrets in logs or documentation.

---

## External Services

The project currently relies on external services including:

- Clerk
- Neon
- OpenAI
- Vercel
- Netlify
- Cloudflare
- storage services configured by the application
- Google OAuth where configured

Do not replace or introduce external providers without explicit approval.

Changes involving external providers should preserve environment separation between development/QA and production.

---

## Production Safety

Production is:

**https://guardatuboleta.app**

Production uses dedicated:

- Clerk Production
- Neon Production
- Netlify deployment

Treat production changes conservatively.

Never use production as a testing environment when QA/local can reproduce the behavior.

Any manual production database operation should be explicit, targeted, and verified before execution.

---

## Agent Completion Report

After completing an implementation task, report:

1. What was changed.
2. Files changed.
3. Important implementation decisions.
4. Validation performed.
5. Validation results.
6. Any remaining concerns.
7. Any recommended follow-up work that was intentionally kept outside scope.

Do not hide failed validations.

Do not describe unexecuted tests as successful.

---

## Guiding Principle

**Preserve working architecture, make the smallest correct change, and keep product concerns separate from technical naming.**

The product is **Guarda tu Boleta**.

The repository remains **expenses-app**.

A product rebrand does not imply a technical rewrite.