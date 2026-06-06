# propframe — Template Blueprint v4.0
**Multi-Tenant Real Estate Platform**
*Last updated: 2026-04-28*

---

## Overview

propframe is a config-driven real estate website and property management platform built under `drkm.io`. It is designed to serve multiple real estate clients (companies) from a single shared codebase and Supabase database, with per-client frontend deployments that are fully branded and customized.

**Architecture at a glance:**
- One shared Supabase project → all company data in one DB, isolated by `company_id` + RLS
- Separate Cloudflare Pages deployment per client → each has its own `site.config.ts`, `public/brand/`, and `.env.local`
- Config-driven homepage sections → clients control which sections appear and in what order

---

## Domain Structure

| Deployment | Internal URL | Client Domain |
|---|---|---|
| Reyes Rebollar | `reyesrebollar.propframe.drkm.io` | `reyesrebollar.com` |
| Norma Martinez | `norma.propframe.drkm.io` | `propertiesbynorma.com` |

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Radix UI Themes
- **Database:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Deployment:** Cloudflare Pages (one deployment per client)
- **Email:** Resend via Supabase Edge Functions

---

## Multi-Tenant Architecture

### Core principle

Every company-owned table has a `company_id` column (UUID, FK to `companies`). Row Level Security (RLS) policies enforce that users only see rows belonging to companies they are members of. The frontend reads its company identity from the `NEXT_PUBLIC_COMPANY_ID` environment variable, which is set in each Cloudflare Pages deployment.

### Database tables

**Platform tables (new in v4.0):**

```
companies         — one row per real estate client
  id, name, slug, status, created_at, updated_at

company_members   — staff/managers for each company
  id, user_id (→ auth.users), company_id (→ companies),
  role (owner|admin|manager|viewer),
  status (active|invited|suspended),
  created_at, updated_at
```

**Company-scoped tables (all now have company_id):**

```
properties, units, tenants, leases,
invoices, payments, maintenance_requests,
notices, documents
```

### RLS helper functions

```sql
user_company_ids()       -- returns UUIDs of all companies the user belongs to (active)
user_has_company_role()  -- checks role + status for a specific company
user_tenant_ids()        -- stub for Phase 2 tenant portal auth
```

### Migration file

`supabase/migrations/20260428000000_multitenant_foundation.sql`

10-step migration covering:
1. Create `companies` table
2. Insert Reyes Rebollar seed row
3. Create `company_members` table
4. Add nullable `company_id` to all 9 domain tables
5. Backfill `company_id` for all existing rows
6. Set `company_id` NOT NULL on all 9 tables
7. Add indexes
8. Create RLS helper functions
9. Enable RLS + full CRUD policies on all 9 tables
10. Manual step to link existing manager account to `company_members`

---

## Client Configuration

Each deployment has its own `site.config.ts`. This is the single source of truth for all identity, copy, theme, and section configuration. Do not hardcode any client-specific values anywhere else.

### Key exports

```ts
export const siteConfig = {
  // Identity
  companyName, companyShort, subtitle,
  logoPath, heroImagePath, heroImageAlt,

  // URLs
  siteUrl,               // used for email redirect links

  // Contact
  email,

  // Location & copy
  city, locationTagline, pillars,
  heroDescription, openingStatement,
  originSectionLabel, originHeading, originParagraphs,
  closingQuote,

  // Structured data
  values,        // Array<{ title, body }>
  team,          // Array<{ name, role, bio, photo }> — empty = TeamSection hidden
  testimonials,  // Array<{ quote, author, role }> — empty = TestimonialsSection hidden
  contactCTA,    // { heading, subheading, buttonText }

  // Section composition
  sections,      // string[] — controls which sections appear and in what order

  // SEO
  metaTitle, metaDescription,

  // Theme (OKLCH colors + Radix color names)
  theme: { background, foreground, card, primary, primaryFg, secondary,
           muted, mutedFg, accent, accentFg, border, ring,
           terracotta, radius, radixAccent, radixGray },
} as const;

// Company identity — driven by env var (set per Cloudflare Pages deployment)
export const COMPANY_ID: string = process.env.NEXT_PUBLIC_COMPANY_ID ?? "";
```

### Available section keys

| Key | Component | Notes |
|---|---|---|
| `"hero"` | `HeroSection` | Full hero with image, animated pillars, CTA |
| `"opening-statement"` | `OpeningStatementSection` | Large pull-quote paragraph |
| `"origin-story"` | `OriginStorySection` | Brand narrative + values grid |
| `"holdings"` | `HoldingsSection` | Live property listings from Supabase |
| `"team"` | `TeamSection` | Team cards — auto-hides if `siteConfig.team` is empty |
| `"testimonials"` | `TestimonialsSection` | Client quotes — auto-hides if `siteConfig.testimonials` is empty |
| `"contact-cta"` | `ContactCTASection` | Contact call-to-action banner |
| `"closing-quote"` | `ClosingQuoteSection` | Full-width closing quote |

---

## Manager Auth Flow (v4.0)

The old email-domain check (`endsWith("@reyesrebollar.com")`) has been replaced by a `company_members` table lookup. This is company-agnostic and enforced at both the application layer and the Supabase RLS layer.

**Sign-in flow:**
1. User signs in with Supabase Auth (email + password)
2. App queries `company_members` where `user_id = session.user.id AND company_id = COMPANY_ID`
3. If no active record → sign out + show error
4. If active → redirect to `/manager/dashboard`

**Account setup flow:**
1. User creates auth credentials via the "Set up account" form
2. Auth user is created in Supabase
3. An administrator must INSERT the new user into `company_members` (see Step 10 in migration file)
4. User can then sign in normally

**Shared auth logic:** `lib/useCompanyAuth.ts` — a React hook that centralizes the session check + company_members query. Use in any new manager pages.

---

## Key Files

```
site.config.ts                          — client identity + theme + sections
NEXT_PUBLIC_COMPANY_ID (env var)        — which company this deployment serves

lib/supabase.ts                         — Supabase client + all TypeScript types
lib/useCompanyAuth.ts                   — shared manager auth hook (v4.0)

components/ThemeInjector.tsx            — injects CSS variables from siteConfig.theme
components/sections/index.ts           — section registry (key → component)
components/sections/HeroSection.tsx
components/sections/OpeningStatementSection.tsx
components/sections/OriginStorySection.tsx
components/sections/HoldingsSection.tsx
components/sections/TeamSection.tsx
components/sections/TestimonialsSection.tsx
components/sections/ContactCTASection.tsx
components/sections/ClosingQuoteSection.tsx

app/page.tsx                            — dynamic section renderer
app/layout.tsx                          — ThemeInjector, metadata, Radix theme
app/globals.css                         — structural CSS only (no hardcoded colors)

app/manager/login/page.tsx              — multi-tenant auth (company_members lookup)
app/manager/dashboard/page.tsx          — uses COMPANY_ID for auth guard
app/manager/[tenants|properties|leases|invoices|notices|requests]/page.tsx

supabase/migrations/
  20260428000000_multitenant_foundation.sql

supabase/functions/
  send-portal-invite/     — TODO: make company-aware (remove hardcoded branding)
  send-notice-email/      — CRITICAL BUG: must add company_id filter on "all" query
  enrich-property/        — property enrichment

public/brand/             — per-deployment assets (logo.png, hero.jpg, favicon.ico)
  ASSETS.md               — copy commands to install brand assets
```

---

## Supabase Edge Functions — Pending Updates

### `send-notice-email` — CRITICAL BUG

When `sent_to_type === "all"`, the function queries all tenants with no company filter. In a multi-tenant database this will send emails to tenants across all companies.

**Fix required:** Add `.eq("company_id", company_id)` to the "all tenants" query. The `company_id` should come from the function's request body, set by the calling client using `COMPANY_ID` from `site.config.ts`.

### `send-portal-invite` — Pending update

Hardcodes `reyesrebollar.com` in the redirect URL and uses hardcoded branding colors. Should receive redirect URL and branding config from the calling client.

---

## Cloudflare Pages Deployment — Per Client

### Environment variables (set in Cloudflare dashboard per deployment)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_COMPANY_ID=<UUID from companies table>
```

### Build settings

```
Build command:   npm run build
Output dir:      .next
Node version:    20
```

### Custom domains

Set in Cloudflare Pages → Custom Domains:
- `reyesrebollar.propframe.drkm.io` (internal)
- `reyesrebollar.com` (client domain, via CNAME)

---

## Onboarding a New Client (e.g., Norma Martinez)

1. **Fork the repo** — duplicate the Reyes Rebollar repo or branch from main

2. **Edit `site.config.ts`** — fill in all identity, copy, theme, and section fields for the new client

3. **Swap brand assets** — copy into `public/brand/`:
   ```bash
   cp ~/Downloads/norma-logo.png public/brand/logo.png
   cp ~/Downloads/norma-hero.jpg public/brand/hero.jpg
   cp ~/Downloads/norma-favicon.ico public/brand/favicon.ico
   ```

4. **Create the company row in Supabase:**
   ```sql
   INSERT INTO companies (name, slug, status)
   VALUES ('Properties by Norma', 'norma-martinez', 'active')
   RETURNING id;
   ```

5. **Copy the returned UUID** → set as `NEXT_PUBLIC_COMPANY_ID` in the new Cloudflare Pages deployment env vars

6. **Add Norma's manager account to `company_members`:**
   ```sql
   -- After Norma creates her auth account via the login page:
   INSERT INTO company_members (user_id, company_id, role, status)
   VALUES ('<norma-auth-uuid>', '<norma-company-uuid>', 'owner', 'active');
   ```

7. **Deploy to Cloudflare Pages** with the three env vars above

8. **Set custom domains** in Cloudflare Pages → `norma.propframe.drkm.io` + `propertiesbynorma.com`

---

## Validation Checklist

Before deploying any client:

```bash
# No hardcoded client names in source
grep -r "Reyes Rebollar" app/ components/ lib/ --include="*.tsx" --include="*.ts" \
  | grep -v "site.config.ts" | grep -v "node_modules"

# No hardcoded email domains
grep -r "@reyesrebollar.com" app/ components/ lib/ --include="*.tsx" --include="*.ts"

# COMPANY_ID is set in env
echo $NEXT_PUBLIC_COMPANY_ID

# Build passes
npm run build
```

---

## TypeScript Types (`lib/supabase.ts`)

All domain types now include `company_id: string`.

New platform types added in v4.0:
- `Company` — `{ id, name, slug, status, created_at, updated_at }`
- `CompanyMember` — `{ id, user_id, company_id, role, status, created_at, updated_at }`

---

## What This Becomes (Phase 2)

propframe is being built as a platform, not just a template. The current architecture (shared DB + per-client deployments) is the foundation. Phase 2 targets:

- `tenant_users` table — link portal tenants to `auth.users` for magic-link auth
- Admin dashboard at `propframe.drkm.io` — manage all companies from one place
- Full SaaS routing — `[slug].propframe.drkm.io` → one shared Next.js app with dynamic config loaded per subdomain
- Stripe billing per company
- Edge Function updates — make `send-notice-email` and `send-portal-invite` fully company-aware
- Norma Martinez deployment — first production client after Reyes Rebollar
