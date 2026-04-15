# Northants Challenge

Northants Challenge is a production-style weekly quiz app built with Next.js, TypeScript, Tailwind, Framer Motion, Cloud SQL Postgres, and Firebase Auth. It includes a polished public quiz flow, leaderboard pages, share/referral basics, a protected admin CMS, SQL migrations, seed data, and tests for the core scoring and leaderboard rules.

## Stack summary

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- shadcn-style component primitives
- Framer Motion
- Cloud SQL Postgres for quiz/player data
- Firebase Auth for admin login
- Firebase client/admin SDKs for session handling
- Zod + React Hook Form
- Vitest + Testing Library
- Vercel-ready structure

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

If database or Firebase variables are missing, or Cloud SQL is temporarily unreachable, the app falls back to local seeded preview data so you can still review the UI and basic flow.

## Google setup

1. Create a Google Cloud project and link Firebase.
2. Create a Cloud SQL Postgres instance and database.
3. Enable Firebase Auth email/password sign-in.
4. Add these values to `.env.local`:
   - `DATABASE_URL`
   - `ADMIN_EMAIL`
   - `GCP_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
5. Run the SQL migrations in order:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_seed.sql`
6. In Firebase Storage, create a bucket for quiz images if you want image rounds.

## How to create the first admin

1. In Firebase Auth, create a user with the email `steveallan2018@gmail.com` or your preferred admin email.
2. Insert the same email into the `admins` table if you are not using the seeded email.
3. Sign in at `/admin/login`.

## Seeding

- The SQL seed migration creates the first live quiz:
  - `How Well Do You Know Northamptonshire?`
  - slug: `northants-challenge-week-1`
  - published and active
- The seed also inserts `steveallan2018@gmail.com` into `admins`.
- The TypeScript fallback seed in `src/lib/seed.ts` mirrors the same quiz for local preview mode.

## Running tests

```bash
npm test
```

The test suite covers:
- scoring logic
- badge logic
- tie-break sorting
- one-scored-attempt rule
- quiz completion summary flow
- leaderboard ranking
- admin quiz payload validation

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Add the same environment variables from `.env.local` into the Vercel project settings.
4. Run the SQL migrations in your Cloud SQL Postgres database before going live.
5. Set `NEXT_PUBLIC_SITE_URL` to the production domain, or let preview deployments fall back to `VERCEL_URL`.
6. Make sure your Cloud SQL instance accepts runtime traffic from the deployment environment. If Cloud SQL is exposed over public IP, the instance must allow connections from the network your Vercel deployment is using.

### Vercel testing notes

- Preview deployments can fully exercise the Firebase admin login and server routes once the required environment variables are configured in Vercel.
- The app already falls back gracefully if the database is unreachable during build or preview generation, but the full quiz persistence flow still needs live database connectivity at runtime.
- Keep `.env.local` out of source control. This repo now ignores it by default.
- Use `/api/health` on a Vercel preview deployment to check whether Firebase admin config is loaded and whether Cloud SQL is actually reachable at runtime.

## Remaining manual steps

- Add your final legal/privacy copy.
- Configure Firebase Storage rules if you want image uploads from the admin UI.
- Create the real business CTA destination for the `Work With Us` buttons.
- Optionally add Open Graph image generation for richer share cards.
