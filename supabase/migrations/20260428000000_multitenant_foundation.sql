-- ============================================================================
-- Propframe — Multi-Tenant Foundation Migration
-- Version: 1.0 | Date: 2026-04-28
-- ============================================================================
-- This migration converts the single-client Reyes Rebollar database into a
-- shared multi-tenant backend. All real estate client companies share one
-- Supabase project, isolated by company_id.
--
-- Naming conventions:
--   companies      = real estate clients (Reyes Rebollar, Norma Martinez, etc.)
--   company_id     = data ownership boundary on every company-owned table
--   tenants        = renters / occupants (unchanged — this is real estate software)
--   company_members = managers, owners, admins, staff linked to a company
--
-- IMPORTANT: Run this migration in order. Do NOT enable RLS (Step 9) until
-- all existing rows have been backfilled (Step 5).
-- ============================================================================


-- ============================================================================
-- STEP 1 — Create the companies table
-- ============================================================================

create table if not exists companies (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  slug        text        not null unique,   -- used as human-readable identifier
  status      text        not null default 'active'
                          check (status in ('active', 'inactive', 'suspended')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table  companies            is 'Real estate client companies using the propframe platform.';
comment on column companies.slug       is 'URL-safe identifier, e.g. reyes-rebollar. Must be unique.';
comment on column companies.status     is 'active | inactive | suspended';


-- ============================================================================
-- STEP 2 — Seed Reyes Rebollar as the first company
-- ============================================================================
-- After this insert, capture the UUID from: SELECT id FROM companies WHERE slug = 'reyes-rebollar';
-- You will need this UUID for the backfill in Step 5.

insert into companies (name, slug)
values ('Reyes Rebollar Properties LLC', 'reyes-rebollar')
on conflict (slug) do nothing;


-- ============================================================================
-- STEP 3 — Create the company_members table
-- ============================================================================
-- Replaces the email-domain-based manager access check (@reyesrebollar.com).
-- Every Supabase auth user who needs manager access must have a row here.

create table if not exists company_members (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  company_id  uuid        not null references companies(id) on delete cascade,
  role        text        not null default 'manager'
                          check (role in ('owner', 'admin', 'manager', 'staff', 'viewer')),
  status      text        not null default 'active'
                          check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now(),
  unique (user_id, company_id)
);

comment on table  company_members         is 'Links Supabase auth users to a company with a role. Replaces email-domain access checks.';
comment on column company_members.role    is 'owner | admin | manager | staff | viewer';
comment on column company_members.status  is 'active | inactive';

-- Index for fast lookup by user (used in RLS helper)
create index if not exists company_members_user_id_idx
  on company_members(user_id)
  where status = 'active';

-- Index for fast lookup by company (used in admin queries)
create index if not exists company_members_company_id_idx
  on company_members(company_id);


-- ============================================================================
-- STEP 4 — Add company_id to every company-owned table (nullable first)
-- ============================================================================
-- All columns are nullable to allow safe backfill before enforcing NOT NULL.

alter table properties          add column if not exists company_id uuid references companies(id);
alter table units               add column if not exists company_id uuid references companies(id);
alter table tenants             add column if not exists company_id uuid references companies(id);
alter table leases              add column if not exists company_id uuid references companies(id);
alter table invoices            add column if not exists company_id uuid references companies(id);
alter table payments            add column if not exists company_id uuid references companies(id);
alter table maintenance_requests add column if not exists company_id uuid references companies(id);
alter table notices             add column if not exists company_id uuid references companies(id);
alter table documents           add column if not exists company_id uuid references companies(id);


-- ============================================================================
-- STEP 5 — Backfill all existing rows with Reyes Rebollar's company_id
-- ============================================================================
-- Replace the subquery below with the literal UUID if preferred, e.g.:
--   SET company_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

do $$
declare
  reyes_id uuid;
begin
  select id into reyes_id from companies where slug = 'reyes-rebollar';

  if reyes_id is null then
    raise exception 'Reyes Rebollar company not found. Run Step 2 first.';
  end if;

  update properties           set company_id = reyes_id where company_id is null;
  update units                set company_id = reyes_id where company_id is null;
  update tenants              set company_id = reyes_id where company_id is null;
  update leases               set company_id = reyes_id where company_id is null;
  update invoices             set company_id = reyes_id where company_id is null;
  update payments             set company_id = reyes_id where company_id is null;
  update maintenance_requests set company_id = reyes_id where company_id is null;
  update notices              set company_id = reyes_id where company_id is null;
  update documents            set company_id = reyes_id where company_id is null;

  raise notice 'Backfill complete. company_id = % on all existing rows.', reyes_id;
end $$;


-- ============================================================================
-- STEP 6 — Make company_id NOT NULL on all tables
-- ============================================================================
-- Safe to run only after Step 5 backfill is verified.

alter table properties           alter column company_id set not null;
alter table units                alter column company_id set not null;
alter table tenants              alter column company_id set not null;
alter table leases               alter column company_id set not null;
alter table invoices             alter column company_id set not null;
alter table payments             alter column company_id set not null;
alter table maintenance_requests alter column company_id set not null;
alter table notices              alter column company_id set not null;
alter table documents            alter column company_id set not null;


-- ============================================================================
-- STEP 7 — Add indexes on company_id for query performance
-- ============================================================================

create index if not exists properties_company_id_idx            on properties(company_id);
create index if not exists units_company_id_idx                 on units(company_id);
create index if not exists tenants_company_id_idx               on tenants(company_id);
create index if not exists leases_company_id_idx                on leases(company_id);
create index if not exists invoices_company_id_idx              on invoices(company_id);
create index if not exists payments_company_id_idx              on payments(company_id);
create index if not exists maintenance_requests_company_id_idx  on maintenance_requests(company_id);
create index if not exists notices_company_id_idx               on notices(company_id);
create index if not exists documents_company_id_idx             on documents(company_id);


-- ============================================================================
-- STEP 8 — RLS helper functions
-- ============================================================================
-- These functions are called inside policy USING clauses.
-- security definer means they run with the permissions of the creator,
-- allowing them to safely read company_members without exposing it publicly.

-- Returns all company UUIDs the current user is an active member of.
-- Used in manager-facing RLS policies.
create or replace function user_company_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select company_id
  from   company_members
  where  user_id = auth.uid()
    and  status  = 'active'
$$;

-- Returns true if the current user is an active member of a specific company
-- with one of the given roles. Used for write-permission policies.
create or replace function user_has_company_role(
  target_company_id uuid,
  allowed_roles     text[]
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from   company_members
    where  company_id = target_company_id
      and  user_id    = auth.uid()
      and  status     = 'active'
      and  role       = any(allowed_roles)
  )
$$;

-- Returns all tenant UUIDs linked to the current portal user.
-- Used in tenant-facing (renter portal) RLS policies.
-- NOTE: Requires the tenant_users table (see Phase 2 below).
-- This function is a stub — safe to create now, activates when tenant_users exists.
create or replace function user_tenant_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select tenant_id
  from   tenant_users
  where  user_id = auth.uid()
    and  status  = 'active'
$$;


-- ============================================================================
-- STEP 9 — Enable RLS and create policies
-- ============================================================================
-- IMPORTANT: Only run this step after verifying the Step 5 backfill is complete.
-- Test with: SELECT COUNT(*) FROM properties WHERE company_id IS NULL;
-- Expected: 0

-- ── properties ──────────────────────────────────────────────────────────────

alter table properties enable row level security;

create policy "company members can select properties"
  on properties for select
  using (company_id in (select user_company_ids()));

create policy "company members can insert properties"
  on properties for insert
  with check (company_id in (select user_company_ids()));

create policy "company members can update properties"
  on properties for update
  using  (company_id in (select user_company_ids()))
  with check (company_id in (select user_company_ids()));

create policy "company members can delete properties"
  on properties for delete
  using (company_id in (select user_company_ids()));


-- ── units ────────────────────────────────────────────────────────────────────

alter table units enable row level security;

create policy "company members can select units"
  on units for select
  using (company_id in (select user_company_ids()));

create policy "company members can insert units"
  on units for insert
  with check (company_id in (select user_company_ids()));

create policy "company members can update units"
  on units for update
  using  (company_id in (select user_company_ids()))
  with check (company_id in (select user_company_ids()));

create policy "company members can delete units"
  on units for delete
  using (company_id in (select user_company_ids()));


-- ── tenants (renters) ────────────────────────────────────────────────────────
-- Note: portal users (renters) will get their own RLS scope via tenant_users
-- in Phase 2. For now, managers can access their company's tenants.

alter table tenants enable row level security;

create policy "company members can select tenants"
  on tenants for select
  using (company_id in (select user_company_ids()));

create policy "company members can insert tenants"
  on tenants for insert
  with check (company_id in (select user_company_ids()));

create policy "company members can update tenants"
  on tenants for update
  using  (company_id in (select user_company_ids()))
  with check (company_id in (select user_company_ids()));

create policy "company members can delete tenants"
  on tenants for delete
  using (company_id in (select user_company_ids()));


-- ── leases ───────────────────────────────────────────────────────────────────

alter table leases enable row level security;

create policy "company members can select leases"
  on leases for select
  using (company_id in (select user_company_ids()));

create policy "company members can insert leases"
  on leases for insert
  with check (company_id in (select user_company_ids()));

create policy "company members can update leases"
  on leases for update
  using  (company_id in (select user_company_ids()))
  with check (company_id in (select user_company_ids()));

create policy "company members can delete leases"
  on leases for delete
  using (company_id in (select user_company_ids()));


-- ── invoices ─────────────────────────────────────────────────────────────────

alter table invoices enable row level security;

create policy "company members can select invoices"
  on invoices for select
  using (company_id in (select user_company_ids()));

create policy "company members can insert invoices"
  on invoices for insert
  with check (company_id in (select user_company_ids()));

create policy "company members can update invoices"
  on invoices for update
  using  (company_id in (select user_company_ids()))
  with check (company_id in (select user_company_ids()));

create policy "company members can delete invoices"
  on invoices for delete
  using (company_id in (select user_company_ids()));


-- ── payments ─────────────────────────────────────────────────────────────────

alter table payments enable row level security;

create policy "company members can select payments"
  on payments for select
  using (company_id in (select user_company_ids()));

create policy "company members can insert payments"
  on payments for insert
  with check (company_id in (select user_company_ids()));

create policy "company members can update payments"
  on payments for update
  using  (company_id in (select user_company_ids()))
  with check (company_id in (select user_company_ids()));

create policy "company members can delete payments"
  on payments for delete
  using (company_id in (select user_company_ids()));


-- ── maintenance_requests ─────────────────────────────────────────────────────

alter table maintenance_requests enable row level security;

create policy "company members can select maintenance_requests"
  on maintenance_requests for select
  using (company_id in (select user_company_ids()));

create policy "company members can insert maintenance_requests"
  on maintenance_requests for insert
  with check (company_id in (select user_company_ids()));

create policy "company members can update maintenance_requests"
  on maintenance_requests for update
  using  (company_id in (select user_company_ids()))
  with check (company_id in (select user_company_ids()));

create policy "company members can delete maintenance_requests"
  on maintenance_requests for delete
  using (company_id in (select user_company_ids()));


-- ── notices ──────────────────────────────────────────────────────────────────

alter table notices enable row level security;

create policy "company members can select notices"
  on notices for select
  using (company_id in (select user_company_ids()));

create policy "company members can insert notices"
  on notices for insert
  with check (company_id in (select user_company_ids()));

create policy "company members can update notices"
  on notices for update
  using  (company_id in (select user_company_ids()))
  with check (company_id in (select user_company_ids()));

create policy "company members can delete notices"
  on notices for delete
  using (company_id in (select user_company_ids()));


-- ── documents ────────────────────────────────────────────────────────────────

alter table documents enable row level security;

create policy "company members can select documents"
  on documents for select
  using (company_id in (select user_company_ids()));

create policy "company members can insert documents"
  on documents for insert
  with check (company_id in (select user_company_ids()));

create policy "company members can update documents"
  on documents for update
  using  (company_id in (select user_company_ids()))
  with check (company_id in (select user_company_ids()));

create policy "company members can delete documents"
  on documents for delete
  using (company_id in (select user_company_ids()));


-- ============================================================================
-- STEP 10 — Link existing Reyes Rebollar manager to company_members
-- ============================================================================
-- Run this AFTER RLS is enabled.
-- Replace 'manager@reyesrebollar.com' with the actual manager email address(es).
-- You can find the user UUID in: Supabase Dashboard → Auth → Users

-- Example (run manually after confirming the user UUID):
--
-- insert into company_members (user_id, company_id, role)
-- select
--   u.id,
--   c.id,
--   'owner'
-- from auth.users u
-- cross join companies c
-- where u.email  = 'manager@reyesrebollar.com'
--   and c.slug   = 'reyes-rebollar'
-- on conflict (user_id, company_id) do nothing;
--
-- Repeat for each additional manager:
-- insert into company_members (user_id, company_id, role)
-- values ('user-uuid-here', 'company-uuid-here', 'manager')
-- on conflict (user_id, company_id) do nothing;


-- ============================================================================
-- PHASE 2 STUB — tenant_users table (renter portal isolation)
-- ============================================================================
-- Not active yet. Create this table when renter portal auth is tightened.
-- For now, the portal uses magic links scoped by tenant_id lookups in the app.

create table if not exists tenant_users (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  tenant_id   uuid        not null references tenants(id)   on delete cascade,
  company_id  uuid        not null references companies(id) on delete cascade,
  status      text        not null default 'active'
                          check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now(),
  unique (user_id, tenant_id)
);

comment on table tenant_users is 'Links portal (renter) auth users to their tenant record. Enables per-renter RLS on portal data.';

-- NOTE: tenant_users RLS policies are NOT added here yet.
-- The user_tenant_ids() helper function above will activate once this table
-- has rows and RLS is enabled on it. Add policies when ready:
--
-- alter table tenant_users enable row level security;
-- (policies to be defined based on portal auth flow requirements)


-- ============================================================================
-- EDGE FUNCTION NOTES — ACTION REQUIRED
-- ============================================================================
-- The following Edge Functions contain hardcoded Reyes Rebollar branding
-- AND a critical multi-tenant isolation bug. They must be updated before
-- deploying a second client.
--
-- supabase/functions/send-notice-email/index.ts
--   BUG: When sent_to_type = 'all', queries ALL tenants with no company filter.
--        In multi-tenant, this would send Reyes notices to Norma's tenants.
--   FIX: Add .eq('company_id', company_id) to all tenant/property queries.
--        Pass company_id in the function payload from the calling app.
--
-- supabase/functions/send-portal-invite/index.ts
--   ISSUE: Hardcoded redirect URL to reyesrebollar.com/portal/dashboard
--   ISSUE: Hardcoded from email (reyes@reyesrebollar.com)
--   ISSUE: Hardcoded branding colors and company name in email HTML
--   FIX: Accept company_id in payload. Look up company branding from companies
--        table or pass siteUrl/companyName/email from calling app.
--
-- supabase/functions/enrich-property/index.ts
--   Review for any hardcoded company references.
--
-- All Edge Functions should accept and pass company_id to maintain isolation.


-- ============================================================================
-- STORAGE PATH CONVENTION
-- ============================================================================
-- Whether using Supabase Storage or Google Cloud Storage, all file paths
-- must include company_id to enforce isolation:
--
--   companies/{company_id}/documents/{document_id}/{filename}
--   companies/{company_id}/branding/logo.png
--   companies/{company_id}/branding/hero.jpg
--   companies/{company_id}/receipts/{payment_id}/{filename}
--
-- The documents table already has file_path and file_url columns.
-- Ensure all new uploads use the companies/{company_id}/... prefix.


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these after the migration to confirm correctness before going live.

-- 1. Confirm all rows are backfilled (all should return 0):
-- select 'properties'           as tbl, count(*) from properties           where company_id is null
-- union all
-- select 'units',                         count(*) from units               where company_id is null
-- union all
-- select 'tenants',                        count(*) from tenants             where company_id is null
-- union all
-- select 'leases',                         count(*) from leases              where company_id is null
-- union all
-- select 'invoices',                       count(*) from invoices            where company_id is null
-- union all
-- select 'payments',                       count(*) from payments            where company_id is null
-- union all
-- select 'maintenance_requests',           count(*) from maintenance_requests where company_id is null
-- union all
-- select 'notices',                        count(*) from notices             where company_id is null
-- union all
-- select 'documents',                      count(*) from documents           where company_id is null;

-- 2. Confirm companies exist:
-- select id, name, slug, status from companies order by created_at;

-- 3. Confirm manager is linked:
-- select cm.role, cm.status, u.email, c.name
-- from company_members cm
-- join auth.users u on u.id = cm.user_id
-- join companies  c on c.id = cm.company_id;

-- 4. Test isolation (run as the Reyes manager user — should return 0 for Norma):
-- select count(*) from properties where company_id != (select id from companies where slug = 'reyes-rebollar');
