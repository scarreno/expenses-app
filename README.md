This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

# Database setup - Neon + Prisma

## 1. Initialize database using the existing schema

Create a `.env` file in the project root:

```env
DATABASE_URL="your_neon_connection_string"
OPENAI_API_KEY="your_openai_api_key"
```

Install dependencies:

```bash
pnpm install
```

Generate Prisma Client:

```bash
pnpm prisma generate
```

Apply existing migrations to Neon:

```bash
pnpm prisma migrate deploy
```

Optional: open Prisma Studio:

```bash
pnpm prisma studio
```

---

## 2. Update database after modifying `schema.prisma`

After changing:

```text
prisma/schema.prisma
```

create and apply a new migration:

```bash
pnpm prisma migrate dev --name describe_your_change
```

Then regenerate Prisma Client:

```bash
pnpm prisma generate
```

Example:

```bash
pnpm prisma migrate dev --name add_receipt_status
pnpm prisma generate
```

---

## 3. Development reset only

Use this only in local/dev environments if the database gets out of sync:

```bash
pnpm prisma migrate reset
```

If migrations are broken and this is still a disposable dev database:

```bash
pnpm prisma db push
```

Do not use these commands in production.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
