# propframe.drkm.io — Setup Guide

## 1. Initialize the project

```bash
npx create-next-app@latest propframe \
  --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd propframe
npm install @supabase/supabase-js
```

## 2. Copy source files

Replace the generated app/ and lib/ folders with the files from this propframe-starter/ folder:

```
propframe-starter/
  site.config.ts        → propframe/site.config.ts
  lib/supabase.ts       → propframe/lib/supabase.ts
  app/globals.css       → propframe/app/globals.css
  app/layout.tsx        → propframe/app/layout.tsx
  app/page.tsx          → propframe/app/page.tsx
  app/signup/           → propframe/app/signup/
  app/signin/           → propframe/app/signin/
  app/admin/            → propframe/app/admin/
```

## 3. Create .env.local

```
NEXT_PUBLIC_SUPABASE_URL=https://phxzrhdzsxqaamwbbddr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
```

Same Supabase project as Reyes Rebollar — no new project needed.
Do NOT set NEXT_PUBLIC_COMPANY_ID here — this is the platform, not a client.

## 4. Test locally

```bash
npm run dev
```

Visit:
- http://localhost:3000        — marketing landing
- http://localhost:3000/signup — self-onboarding flow
- http://localhost:3000/admin  — admin dashboard (requires rovelo.ga@gmail.com)

## 5. Deploy to Cloudflare Pages

- Build command:  npm run build
- Output dir:     .next
- Node version:   20

Environment variables in Cloudflare dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=https://phxzrhdzsxqaamwbbddr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

## 6. Set custom domain

In Cloudflare Pages → Custom Domains → add:
- propframe.drkm.io

## Pages

| Route           | Purpose                                  |
|-----------------|------------------------------------------|
| /               | Marketing landing page                   |
| /signup         | Self-serve agent onboarding (2 steps)    |
| /signup/success | Post-signup confirmation + next steps    |
| /signin         | Platform sign in                         |
| /admin          | Admin dashboard (Greg only)              |
