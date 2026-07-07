# Expenses v2.0.1

AI-powered household expense tracking application built with Next.js, Prisma, PostgreSQL, and OpenAI.

Expenses helps automate receipt processing by extracting purchase information from images and PDF receipts, allowing users to review, edit, and categorize purchases before saving them.

The application also provides spending insights through dashboards and category-based analytics.

---

## Why I Built This

This project started as a personal tool to simplify household expense tracking while exploring AI-assisted document processing using OpenAI.

The goal was to build a complete end-to-end application covering:

* Authentication and user ownership
* File storage and management
* AI-powered receipt extraction
* Data validation and correction workflows
* Analytics and reporting
* Modern full-stack architecture using Next.js

---

## Screenshots

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Upload Receipt

![Upload](docs/screenshots/upload.png)

### Receipt Preview

![Preview](docs/screenshots/preview.png)

### Receipt History

![Receipts](docs/screenshots/receipts.png)

### Receipt Detail

![Receipt Detail](docs/screenshots/receipt-detail.png)

### Categories

![Categories](docs/screenshots/categories.png)

### Settings

![Settings](docs/screenshots/settings.png)

---

## Features

### Authentication

* Authentication with [Clerk](https://clerk.com/)
* Route protection via Next.js proxy (`proxy.ts`)
* Onboarding flow that provisions the user in the database
* User ownership and data isolation

### Receipt Processing

* Upload receipt images (JPEG, PNG, WebP) and PDF files
* AI-powered extraction using the OpenAI Responses API (`gpt-4.1-mini`)
* Receipt types: supermarket, market, and gas
* Editable extraction preview before saving
* Automatic receipt item categorization using the user's active default categories
* Local and Vercel Blob storage support

### Receipt Management

* Receipt history with pagination
* Filters by month, year, and business type
* Receipt detail view
* Receipt editing
* Receipt deletion (including associated file cleanup)

### Categories

* Default categories seeded per user on first use
* Custom user categories
* Category activation and deactivation
* Manual category reassignment on receipts

### Dashboard

* Total spending summary
* Monthly expenses chart
* Spending by category (with optional month filter)
* User-specific analytics

### User Preferences

* Language selection (English and Spanish)
* Locale configuration
* Currency formatting (CLP, USD, EUR)
* Date formatting

### Profile

* View signed-in user information from Clerk

---

## Technology Stack

### Frontend

* Next.js 16 (App Router)
* React 19
* TypeScript
* Tailwind CSS 4
* shadcn/ui

### Backend

* Next.js Route Handlers and Server Actions
* Prisma ORM 7 with `@prisma/adapter-pg`
* PostgreSQL

### AI

* OpenAI Responses API
* GPT-4.1 Mini

### Authentication

* Clerk

### Storage

* Local file storage (`public/uploads/`, development)
* Vercel Blob Storage (production)

### Testing

* Vitest

---

## Architecture

Receipt processing flow:

```text
Upload File
    ↓
Storage (local or Vercel Blob)
    ↓
OpenAI Extraction
    ↓
Review & Edit
    ↓
Save Receipt
    ↓
Dashboard & Analytics
```

Application structure:

```text
app/
├── api/           Route handlers (receipts, settings, dashboard)
├── components/    Feature UI components
├── lib/           Domain logic (auth, receipts, storage, i18n, settings)
├── services/      Receipt processing orchestration
├── prompts/       OpenAI prompt templates by receipt type
├── schemas/       Zod validation schemas
└── [routes]/      App Router pages
```

Route protection is handled in `proxy.ts` using Clerk middleware. Most pages are Server Components that query Prisma directly; interactive flows (upload, charts, navigation) use Client Components.

---

## Running Locally

### Prerequisites

* Node.js 22+
* PostgreSQL database (for example, [Neon](https://neon.tech/))
* OpenAI API key
* Clerk application (publishable and secret keys)

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd expenses-app
```

Install dependencies:

```bash
pnpm install
```

---

### Environment Variables

Create a `.env` file in the project root. See `.env.example` for the full list:

```env
DATABASE_URL=

OPENAI_API_KEY=

STORAGE_DRIVER=local
NEXT_PUBLIC_STORAGE_DRIVER=local

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/receipts
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/receipts
```

For Vercel Blob storage, also set:

```env
STORAGE_DRIVER=vercel-blob
NEXT_PUBLIC_STORAGE_DRIVER=vercel-blob
BLOB_READ_WRITE_TOKEN=
BLOB_STORE_ID=
BLOB_WEBHOOK_PUBLIC_KEY=
```

---

### Database Setup

Generate Prisma Client:

```bash
pnpm prisma generate
```

Apply existing migrations:

```bash
pnpm prisma migrate deploy
```

Optional:

```bash
pnpm prisma studio
```

---

### Creating New Migrations

After modifying:

```text
prisma/schema.prisma
```

Create and apply a migration:

```bash
pnpm prisma migrate dev --name describe_your_change
```

Regenerate Prisma Client:

```bash
pnpm prisma generate
```

Example:

```bash
pnpm prisma migrate dev --name add_receipt_status
pnpm prisma generate
```

---

### Development Reset

Only for local development:

```bash
pnpm prisma migrate reset
```

If working with a disposable database:

```bash
pnpm prisma db push
```

Do not use these commands in production environments.

---

### Start Development Server

```bash
pnpm dev
```

`pnpm dev` runs the test suite first (`predev` hook), then starts the Next.js dev server.

Open:

```text
http://localhost:3000
```

---

### Scripts

```bash
pnpm dev              # Run tests, then start dev server
pnpm build            # Generate Prisma client and build
pnpm start            # Start production server
pnpm lint             # ESLint
pnpm test             # Vitest (single run)
pnpm test:watch       # Vitest watch mode
pnpm test:coverage    # Vitest with coverage
pnpm format           # Prettier
```

---

## Project Status

Current version:

```text
v2.0.1
```

This release includes:

* Clerk authentication
* Multi-user support with per-user data isolation
* AI receipt extraction and review workflow
* Receipt editing and deletion
* Categories management
* Dashboard analytics
* User settings (language, locale, currency, date format)
* Local and Vercel Blob storage support
* English and Spanish UI
* Responsive UI

---

## Roadmap

Planned future improvements:

* Budget management
* Budget alerts
* Spending projections
* Household consumption analytics
* Product inflation tracking
* Purchase recommendations
* Advanced dashboard insights

---

## License

MIT
