# Reyes Rebollar Properties LLC
## MVP Developer Backlog — Strict Scope
### Version 1.0 — April 2026

---

## SCOPE STATEMENT

This backlog covers exactly the following 14 end-to-end workflows. Nothing else.

1. Manager creates property and units
2. Manager creates tenant (individual or company)
3. Manager assigns tenant to unit through a lease
4. Manager uploads document and controls whether tenant can see it
5. Tenant logs in and sees lease/documents
6. Manager creates invoice
7. Tenant sees invoice and balance
8. Manager records manual payment
9. Tenant sees payment history and receipt
10. Tenant submits maintenance request
11. Manager updates maintenance status
12. Tenant sees maintenance status
13. Manager creates basic notice
14. Tenant sees notice

---

## REMOVED FROM MVP — DEFERRED TO LATER

The following items from the audit are explicitly out of scope for this MVP:

| Removed Feature | Reason | Deferred To |
|----------------|---------|-------------|
| Manager ↔ Tenant messaging/chat | Not in 14 workflows | Post-MVP |
| Rental applications | Not in 14 workflows | Post-MVP |
| Email notifications | Infrastructure complexity | Post-MVP |
| Online rent payment (Stripe) | Needs architecture change | Post-MVP |
| Recurring invoice generation | Needs background jobs | Post-MVP |
| Reports (rent roll, ledger) | Not blocking MVP | Post-MVP |
| Company tenant authorized portal users | Complexity, rare case | Post-MVP |
| Advanced settings panel | Not blocking | Post-MVP |
| Vendor management | Out of scope entirely | Never (MVP) |
| Maintenance photo uploads | Nice to have | Post-MVP |
| Tenant profile editing | Not in 14 workflows | Post-MVP |
| Inspection reports | Not in 14 workflows | Post-MVP |
| In-app notifications | Not in 14 workflows | Post-MVP |
| Lease renewal workflow | Covered by editing lease | Post-MVP |

---

## IMPLEMENTATION ORDER

Build strictly in this sequence. Each phase unblocks the next.

```
Phase 1  →  Properties & Units (database + CRUD)
Phase 2  →  Tenant Expansion (fields + company type + invite flow)
Phase 3  →  Leases & Documents (create lease + Storage + visibility)
Phase 4  →  Invoices & Payments (create invoice + record payment + receipt)
Phase 5  →  Notices (create + tenant view)
Phase 6  →  Maintenance Polish (ensure status updates visible on tenant side)
Phase 7  →  Dashboard Update (connect all real data to manager dashboard)
```

---

## DATABASE SETUP — RUN FIRST

Run this complete schema in Supabase SQL Editor before building any UI.

```sql
-- ─────────────────────────────────────────────
-- PROPERTIES
-- ─────────────────────────────────────────────
create table if not exists properties (
  id            uuid default gen_random_uuid() primary key,
  name          text not null,
  address       text not null,
  city          text not null default 'El Cajon',
  state         text not null default 'CA',
  zip_code      text not null,
  type          text not null default 'residential'
                  check (type in ('residential','commercial','mixed')),
  status        text not null default 'active'
                  check (status in ('active','inactive')),
  notes         text,
  created_at    timestamptz default now()
);

alter table properties enable row level security;
create policy "managers_all_properties" on properties
  for all using (
    exists (select 1 from auth.users where id = auth.uid()
    and email like '%@reyesrebollar.com')
  );

-- ─────────────────────────────────────────────
-- UNITS
-- ─────────────────────────────────────────────
create table if not exists units (
  id              uuid default gen_random_uuid() primary key,
  property_id     uuid references properties(id) on delete cascade not null,
  unit_number     text not null,
  rent_amount     numeric(10,2) not null default 0,
  deposit_amount  numeric(10,2) not null default 0,
  status          text not null default 'vacant'
                    check (status in ('vacant','occupied','pending_move_in',
                                      'pending_move_out','maintenance')),
  sqft            integer,
  bedrooms        numeric(3,1),
  bathrooms       numeric(3,1),
  notes           text,
  created_at      timestamptz default now()
);

alter table units enable row level security;
create policy "managers_all_units" on units
  for all using (
    exists (select 1 from auth.users where id = auth.uid()
    and email like '%@reyesrebollar.com')
  );

-- ─────────────────────────────────────────────
-- TENANTS (expanded)
-- ─────────────────────────────────────────────
-- Drop and recreate if schema changed significantly
alter table tenants add column if not exists tenant_type text not null default 'individual'
  check (tenant_type in ('individual', 'company'));
alter table tenants add column if not exists company_name text;
alter table tenants add column if not exists billing_email text;
alter table tenants add column if not exists emergency_contact_name text;
alter table tenants add column if not exists emergency_contact_phone text;
alter table tenants add column if not exists mailing_address text;
alter table tenants add column if not exists notes text;
alter table tenants add column if not exists portal_invited_at timestamptz;
alter table tenants add column if not exists status text not null default 'active'
  check (status in ('active','inactive'));

-- ─────────────────────────────────────────────
-- LEASES
-- ─────────────────────────────────────────────
create table if not exists leases (
  id              uuid default gen_random_uuid() primary key,
  unit_id         uuid references units(id) on delete restrict not null,
  tenant_id       uuid references tenants(id) on delete restrict not null,
  start_date      date not null,
  end_date        date not null,
  rent_amount     numeric(10,2) not null,
  deposit_amount  numeric(10,2) not null default 0,
  status          text not null default 'active'
                    check (status in ('draft','active','expiring_soon',
                                      'expired','renewed','terminated')),
  notes           text,
  created_at      timestamptz default now(),
  constraint end_after_start check (end_date > start_date)
);

alter table leases enable row level security;
create policy "managers_all_leases" on leases
  for all using (
    exists (select 1 from auth.users where id = auth.uid()
    and email like '%@reyesrebollar.com')
  );
create policy "tenants_own_leases" on leases
  for select using (
    exists (select 1 from tenants
      where tenants.id = leases.tenant_id
      and tenants.email = (select email from auth.users where id = auth.uid()))
  );

-- ─────────────────────────────────────────────
-- DOCUMENTS
-- ─────────────────────────────────────────────
create table if not exists documents (
  id            uuid default gen_random_uuid() primary key,
  entity_type   text not null
                  check (entity_type in ('tenant','lease','unit',
                                         'property','invoice','maintenance','general')),
  entity_id     uuid not null,
  name          text not null,
  document_type text not null default 'other'
                  check (document_type in ('lease','contract','id','receipt',
                                           'invoice','inspection','notice',
                                           'photo','other')),
  file_url      text not null,
  file_path     text not null,
  is_shared     boolean not null default false,
  uploaded_by   uuid references auth.users(id),
  created_at    timestamptz default now()
);

alter table documents enable row level security;

create policy "managers_all_documents" on documents
  for all using (
    exists (select 1 from auth.users where id = auth.uid()
    and email like '%@reyesrebollar.com')
  );

-- Tenants see only shared documents linked to their tenant ID or their lease ID
create policy "tenants_shared_documents" on documents
  for select using (
    is_shared = true
    and (
      (entity_type = 'tenant' and entity_id = (
        select id from tenants
        where email = (select email from auth.users where id = auth.uid())
      ))
      or
      (entity_type = 'lease' and entity_id in (
        select leases.id from leases
        join tenants on tenants.id = leases.tenant_id
        where tenants.email = (select email from auth.users where id = auth.uid())
      ))
    )
  );

-- ─────────────────────────────────────────────
-- INVOICES
-- ─────────────────────────────────────────────
create table if not exists invoices (
  id            uuid default gen_random_uuid() primary key,
  tenant_id     uuid references tenants(id) on delete restrict not null,
  lease_id      uuid references leases(id) on delete restrict,
  unit_id       uuid references units(id) on delete restrict,
  amount        numeric(10,2) not null check (amount > 0),
  due_date      date not null,
  category      text not null default 'rent'
                  check (category in ('rent','deposit','late_fee',
                                      'utility','repair','other')),
  status        text not null default 'due'
                  check (status in ('draft','due','overdue','paid',
                                    'partially_paid','canceled')),
  description   text,
  created_at    timestamptz default now()
);

alter table invoices enable row level security;
create policy "managers_all_invoices" on invoices
  for all using (
    exists (select 1 from auth.users where id = auth.uid()
    and email like '%@reyesrebollar.com')
  );
create policy "tenants_own_invoices" on invoices
  for select using (
    exists (select 1 from tenants
      where tenants.id = invoices.tenant_id
      and tenants.email = (select email from auth.users where id = auth.uid()))
  );

-- ─────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────
create table if not exists payments (
  id            uuid default gen_random_uuid() primary key,
  invoice_id    uuid references invoices(id) on delete restrict not null,
  amount_paid   numeric(10,2) not null check (amount_paid > 0),
  paid_at       date not null,
  method        text not null default 'other'
                  check (method in ('check','cash','zelle','venmo',
                                    'bank_transfer','money_order','other')),
  notes         text,
  receipt_url   text,
  receipt_path  text,
  recorded_by   uuid references auth.users(id),
  created_at    timestamptz default now()
);

alter table payments enable row level security;
create policy "managers_all_payments" on payments
  for all using (
    exists (select 1 from auth.users where id = auth.uid()
    and email like '%@reyesrebollar.com')
  );
create policy "tenants_own_payments" on payments
  for select using (
    exists (
      select 1 from invoices
      join tenants on tenants.id = invoices.tenant_id
      where invoices.id = payments.invoice_id
      and tenants.email = (select email from auth.users where id = auth.uid())
    )
  );

-- ─────────────────────────────────────────────
-- NOTICES
-- ─────────────────────────────────────────────
create table if not exists notices (
  id              uuid default gen_random_uuid() primary key,
  type            text not null default 'general'
                    check (type in ('rent_reminder','late_rent','lease_renewal',
                                    'entry_notice','maintenance','general')),
  subject         text not null,
  body            text not null,
  sent_to_type    text not null
                    check (sent_to_type in ('tenant','property','all')),
  property_id     uuid references properties(id),
  tenant_id       uuid references tenants(id),
  sent_at         timestamptz default now()
);

alter table notices enable row level security;
create policy "managers_all_notices" on notices
  for all using (
    exists (select 1 from auth.users where id = auth.uid()
    and email like '%@reyesrebollar.com')
  );

-- Tenants see notices sent directly to them, to their property, or to all
create policy "tenants_own_notices" on notices
  for select using (
    sent_to_type = 'all'
    or (
      sent_to_type = 'tenant'
      and tenant_id = (
        select id from tenants
        where email = (select email from auth.users where id = auth.uid())
      )
    )
    or (
      sent_to_type = 'property'
      and property_id in (
        select units.property_id from units
        join leases on leases.unit_id = units.id
        join tenants on tenants.id = leases.tenant_id
        where tenants.email = (select email from auth.users where id = auth.uid())
        and leases.status = 'active'
      )
    )
  );

-- ─────────────────────────────────────────────
-- STORAGE BUCKETS (run in Supabase dashboard)
-- ─────────────────────────────────────────────
-- Create bucket: "documents" — private, 50MB limit
-- Create bucket: "receipts"  — private, 10MB limit
-- All files accessed via signed URLs only (never public)
```

---

## SUPABASE STORAGE SETUP

In **Supabase → Storage → New bucket**, create these two buckets:

| Bucket | Public | Max file size | Allowed types |
|--------|--------|---------------|---------------|
| `documents` | No (private) | 50 MB | pdf, jpg, jpeg, png |
| `receipts` | No (private) | 10 MB | pdf, jpg, jpeg, png |

All file access must use **signed URLs** that expire after 60 minutes. Never expose raw storage paths to the client.

---

## SEED DATA — MIGRATE EXISTING PROPERTIES

After running the schema, insert the 4 existing properties:

```sql
insert into properties (name, address, city, state, zip_code, type) values
  ('1321 Oro Street', '1321 Oro Street', 'El Cajon', 'CA', '92021', 'residential'),
  ('1227 N 1st Street', '1227 N 1st Street', 'El Cajon', 'CA', '92021', 'residential'),
  ('1237 N 1st Street', '1237 N 1st Street', 'El Cajon', 'CA', '92021', 'residential'),
  ('1107 Greenfield Drive', '1107 Greenfield Dr', 'El Cajon', 'CA', '92021', 'commercial');
```

Then manually add units for each property through the new UI.

---

## PHASE 1 — PROPERTIES & UNITS

---

### EPIC 1 — Property Management

---

#### Story 1.1 — Manager Views Property List

**User Story:** As a manager, I want to see all my properties so I can navigate to any property and its units.

**Frontend:**
- Page: `/manager/properties`
- Component: `PropertyList` — table/list of all properties
- Columns: Name, Address, Type, Status, Unit Count, Actions
- Link to property detail page

**Supabase Action:**
```ts
supabase.from('properties').select('*, units(count)').order('created_at')
```

**Empty State:** "No properties yet. Add your first property to get started."

**Error State:** "Unable to load properties. Please refresh."

**Acceptance Criteria:**
- [ ] All properties display in a list
- [ ] Each row shows name, address, type, unit count
- [ ] Clicking a property navigates to its detail page
- [ ] Add Property button is visible

**QA Test:**
- Precondition: Seed data inserted
- Steps: Log in as manager → navigate to /manager/properties
- Expected: 4 properties listed with correct details
- Pass: All 4 properties visible

---

#### Story 1.2 — Manager Creates Property

**User Story:** As a manager, I want to add a new property so I can track it in the system.

**Frontend:**
- Page: `/manager/properties/new` or modal on list page
- Form fields:
  - Name (text, required)
  - Address (text, required)
  - City (text, required, default: El Cajon)
  - State (text, required, default: CA)
  - Zip Code (text, required)
  - Type (select: residential | commercial | mixed, required)
  - Notes (textarea, optional)

**Validation Rules:**
- Name: required, max 100 chars
- Address: required, max 200 chars
- City: required
- State: required, 2 chars
- Zip: required, 5 digits
- Type: required, must be valid enum value

**Supabase Action:**
```ts
supabase.from('properties').insert({ name, address, city, state, zip_code, type, notes })
```

**Error States:**
- Duplicate address: "A property at this address already exists."
- Network error: "Failed to save property. Please try again."

**Acceptance Criteria:**
- [ ] Form validates all required fields before submit
- [ ] Successful save redirects to property detail page
- [ ] New property appears in property list
- [ ] Error shown if save fails

**QA Test:**
- Steps: Manager → Properties → Add Property → fill form → save
- Expected: Property created, redirected to detail page
- Pass: Property visible in list with correct data

---

#### Story 1.3 — Manager Views Property Detail

**User Story:** As a manager, I want to see a property's details and all its units so I can manage them.

**Frontend:**
- Page: `/manager/properties/[id]`
- Sections:
  - Property info (name, address, type)
  - Edit button
  - Units section: list of all units for this property
  - Add Unit button

**Supabase Action:**
```ts
supabase.from('properties').select('*, units(*)').eq('id', id).single()
```

**Empty State (units):** "No units added yet. Add the first unit for this property."

**Acceptance Criteria:**
- [ ] Property details displayed correctly
- [ ] All units for this property listed
- [ ] Each unit shows: unit number, rent amount, status
- [ ] Add Unit button opens unit form

**QA Test:**
- Steps: Navigate to property detail for 1321 Oro Street
- Expected: Property info shown, units listed
- Pass: Data correct, units show occupancy status

---

#### Story 1.4 — Manager Creates Unit

**User Story:** As a manager, I want to add units to a property so I can assign tenants and track rent.

**Frontend:**
- Form (inline or modal on property detail page)
- Fields:
  - Unit Number/Name (text, required) — e.g., "Unit A", "Unit 1", "Suite 100"
  - Rent Amount (number, required, min: 1)
  - Deposit Amount (number, optional, min: 0)
  - Square Footage (number, optional)
  - Bedrooms (number, optional)
  - Bathrooms (number, optional)
  - Notes (textarea, optional)
  - Status: defaults to "vacant" on creation, not editable here (changes via lease)

**Validation Rules:**
- Unit Number: required, max 50 chars, unique within property
- Rent Amount: required, must be positive number
- Deposit: optional, must be 0 or positive

**Supabase Action:**
```ts
supabase.from('units').insert({ property_id, unit_number, rent_amount, deposit_amount, ... })
```

**Error States:**
- Duplicate unit number in same property: "A unit with this number already exists at this property."
- Save failure: "Failed to add unit. Please try again."

**Acceptance Criteria:**
- [ ] Unit created with status = "vacant" by default
- [ ] Unit appears in property detail unit list immediately
- [ ] Duplicate unit number within same property is prevented
- [ ] Rent amount is required and must be positive

**QA Test:**
- Steps: Property detail → Add Unit → Unit Number: "Unit A", Rent: $1,800 → save
- Expected: Unit appears in list with status Vacant
- Pass: Unit visible, status = Vacant, rent correct

---

#### Story 1.5 — Manager Edits Property or Unit

**User Story:** As a manager, I want to edit property and unit details so I can keep information accurate.

**Frontend:**
- Edit button on property detail → pre-filled form
- Edit button on unit row → pre-filled unit form

**Validation:** Same as create forms.

**Supabase Action:**
```ts
supabase.from('properties').update({...}).eq('id', id)
supabase.from('units').update({...}).eq('id', id)
```

**Acceptance Criteria:**
- [ ] Edit form pre-fills with existing values
- [ ] Saving updates the record
- [ ] Cancel returns without changes

---

## PHASE 2 — TENANT MANAGEMENT

---

### EPIC 2 — Tenant Records

---

#### Story 2.1 — Manager Views Tenant List

**User Story:** As a manager, I want to see all tenants so I can find and access any tenant record.

**Frontend:**
- Page: `/manager/tenants` (update existing page)
- Columns: Name (or Company Name), Email, Type, Unit (if assigned), Status
- Search by name or email
- Filter by tenant type (Individual / Company)
- Add Tenant button

**Supabase Action:**
```ts
supabase.from('tenants')
  .select('*, leases(*, units(unit_number, property_id, properties(name)))')
  .order('created_at', { ascending: false })
```

**Empty State:** "No tenants yet. Add your first tenant to get started."

**Acceptance Criteria:**
- [ ] All tenants listed with name, email, type, and current unit
- [ ] Company tenants show company name
- [ ] Clicking tenant navigates to tenant detail page

**QA Test:**
- Steps: Log in → /manager/tenants
- Expected: Tenant list loads. Individual tenants show full name. Company tenants show company name.

---

#### Story 2.2 — Manager Creates Individual Tenant

**User Story:** As a manager, I want to create an individual tenant record so I can assign them to a unit and lease.

**Frontend:**
- Page: `/manager/tenants/new` or modal
- Tenant Type toggle: **Individual** | Company (defaults to Individual)
- Fields for Individual:
  - First Name (text, required)
  - Last Name (text, required)
  - Email (email, required, unique)
  - Phone (text, optional)
  - Mailing Address (text, optional)
  - Emergency Contact Name (text, optional)
  - Emergency Contact Phone (text, optional)
  - Notes (textarea, optional)
- Invite to Portal checkbox: checked by default
  - If checked: sends magic link email after save

**Validation Rules:**
- First Name: required
- Last Name: required
- Email: required, valid email format, must be unique in tenants table
- Phone: optional, format validation if provided

**Supabase Action:**
```ts
// Create tenant
supabase.from('tenants').insert({
  tenant_type: 'individual',
  email, full_name: `${first} ${last}`, phone,
  mailing_address, emergency_contact_name, emergency_contact_phone, notes
})

// If invite checked:
supabase.auth.admin.inviteUserByEmail(email)
// OR: supabase.auth.signInWithOtp({ email }) — from manager context
```

**Note:** Portal invitation requires manager to trigger a magic link. For static export, this can be done via Supabase dashboard invite OR by adding a dedicated invite Supabase Edge Function. For MVP, document this as a manual step: manager goes to Supabase → Auth → Users → Invite.

**Error States:**
- Duplicate email: "A tenant with this email already exists."
- Invalid email: "Please enter a valid email address."
- Invite failed: "Tenant created. Portal invite failed — send manually from Supabase."

**Acceptance Criteria:**
- [ ] Individual tenant created with all fields
- [ ] Email is unique — duplicate prevented with clear error
- [ ] Tenant appears in tenant list immediately
- [ ] Portal invitation note shown if invite was attempted

**QA Test:**
- Steps: Tenants → Add Tenant → Individual → fill fields → save
- Expected: Tenant created, appears in list
- Pass: All fields saved correctly, email is unique

---

#### Story 2.3 — Manager Creates Company Tenant

**User Story:** As a manager, I want to create a company tenant so I can manage commercial leases.

**Frontend:**
- Same form as 2.2, but with **Company** type selected
- Company-specific fields (replace First/Last Name):
  - Company Name (text, required)
  - Primary Contact Name (text, required)
  - Primary Contact Email (email, required, used as login email)
  - Primary Contact Phone (text, optional)
  - Billing Email (email, optional — defaults to contact email)
  - Notes (textarea, optional)

**Validation:**
- Company Name: required, max 200 chars
- Primary Contact Name: required
- Primary Contact Email: required, valid email, unique

**Supabase Action:**
```ts
supabase.from('tenants').insert({
  tenant_type: 'company',
  full_name: primary_contact_name,
  email: primary_contact_email,
  company_name, billing_email, notes
})
```

**Acceptance Criteria:**
- [ ] Company tenant created with company name
- [ ] Tenant list shows company name (not contact name) in name column
- [ ] Company label/badge visible in list

**QA Test:**
- Steps: Add Tenant → Company → Company: "Santos Vent Solutions" → contact info → save
- Expected: Company tenant created, shows company name in list

---

#### Story 2.4 — Manager Views Tenant Detail

**User Story:** As a manager, I want to see a tenant's full profile including their lease, invoices, and payments.

**Frontend:**
- Page: `/manager/tenants/[id]`
- Sections:
  1. Tenant info (all fields, edit button)
  2. Active Lease (unit, dates, rent) — link to lease detail
  3. Recent Invoices (last 5) — link to all invoices
  4. Documents (uploaded for this tenant)
  5. Maintenance Requests (recent 3) — link to all
  6. Notes

**Supabase Action:**
```ts
supabase.from('tenants').select(`
  *,
  leases(*, units(unit_number, properties(name))),
  invoices(*, payments(*)),
  documents(*),
  maintenance_requests(id, title, status, created_at)
`).eq('id', id).single()
```

**Acceptance Criteria:**
- [ ] All tenant fields displayed
- [ ] Active lease shown with property, unit, dates, and rent
- [ ] Recent invoices listed with status
- [ ] Documents section shows upload button and list

---

## PHASE 3 — LEASES & DOCUMENTS

---

### EPIC 3 — Lease Management

---

#### Story 3.1 — Manager Creates Lease

**User Story:** As a manager, I want to create a lease that assigns a tenant to a unit so I can track their occupancy and rent obligation.

**Frontend:**
- Page: `/manager/leases/new` or button on tenant detail / unit detail
- Fields:
  - Property (select, required) — filtered to manager's properties
  - Unit (select, required) — filtered to selected property, only vacant units
  - Tenant (select, required) — all active tenants
  - Start Date (date, required)
  - End Date (date, required, must be after start date)
  - Monthly Rent (number, pre-filled from unit, editable)
  - Deposit Amount (number, pre-filled from unit, editable)
  - Status (select, default: Active)
  - Notes (textarea, optional)

**Validation Rules:**
- Property: required
- Unit: required, must have status = 'vacant'
- Tenant: required
- Start Date: required
- End Date: required, must be after Start Date
- Monthly Rent: required, must be positive
- Deposit: required, must be 0 or positive

**Supabase Action (transaction):**
```ts
// 1. Create lease
const { data: lease } = await supabase.from('leases').insert({
  unit_id, tenant_id, start_date, end_date,
  rent_amount, deposit_amount, status: 'active', notes
}).select().single()

// 2. Update unit status to occupied
await supabase.from('units').update({ status: 'occupied' }).eq('id', unit_id)
```

**Error States:**
- Unit already occupied: "This unit is not available. Select a vacant unit."
- Date validation: "End date must be after start date."
- Save failure: "Failed to create lease. Please try again."

**Acceptance Criteria:**
- [ ] Lease created and linked to unit and tenant
- [ ] Unit status changes from Vacant → Occupied
- [ ] Lease appears in tenant detail under Active Lease
- [ ] Only vacant units selectable in unit dropdown
- [ ] Date validation enforced

**QA Test:**
- Steps: Create Lease → 1321 Oro St → Unit A → tenant → dates → rent → save
- Expected: Lease created. Unit A shows Occupied. Tenant detail shows lease.
- Pass: All three confirmed

---

#### Story 3.2 — Manager Views and Edits Lease

**User Story:** As a manager, I want to view and update lease details so I can keep records accurate.

**Frontend:**
- Page: `/manager/leases/[id]`
- Display: all lease fields, unit, tenant, status
- Edit button → pre-filled form
- Status can be changed manually: Draft, Active, Expired, Terminated
- Documents section (linked to this lease entity_id)

**Supabase Action:**
```ts
supabase.from('leases').update({ status, end_date, notes, ... }).eq('id', id)
// If status → expired or terminated: update unit status → vacant
```

**Acceptance Criteria:**
- [ ] All lease fields editable
- [ ] When status set to Expired or Terminated, unit status reverts to Vacant
- [ ] Documents attached to lease visible

---

#### Story 3.3 — Manager Uploads Document to Lease

**User Story:** As a manager, I want to upload a lease agreement PDF and choose whether the tenant can see it.

**Frontend:**
- Document upload section on lease detail page
- Fields:
  - File picker (pdf, jpg, png — max 50MB)
  - Document Name (text, required, pre-filled with filename)
  - Document Type (select: lease | contract | addendum | other)
  - Visible to Tenant toggle (is_shared: true/false, default: false)

**Supabase Storage Action:**
```ts
// 1. Upload to Storage
const { data } = await supabase.storage
  .from('documents')
  .upload(`leases/${leaseId}/${filename}`, file)

// 2. Get signed URL for display
const { data: url } = await supabase.storage
  .from('documents')
  .createSignedUrl(data.path, 3600)

// 3. Save document record
await supabase.from('documents').insert({
  entity_type: 'lease',
  entity_id: leaseId,
  name: documentName,
  document_type: selectedType,
  file_url: url.signedUrl,
  file_path: data.path,
  is_shared: isShared,
  uploaded_by: currentUser.id
})
```

**Validation Rules:**
- File: required, max 50MB, allowed types: pdf, jpg, jpeg, png
- Name: required, max 200 chars
- Document Type: required

**Error States:**
- File too large: "File size must be under 50MB."
- Wrong file type: "Only PDF, JPG, and PNG files are allowed."
- Upload failure: "Upload failed. Please check your connection and try again."

**Acceptance Criteria:**
- [ ] File uploads to Supabase Storage
- [ ] Document record created in `documents` table
- [ ] is_shared toggle works correctly
- [ ] Uploaded document appears in lease document list
- [ ] Manager can change is_shared after upload

**QA Test:**
- Steps: Open lease → upload lease PDF → name: "Lease Agreement 2025" → type: lease → Visible to Tenant: ON → save
- Expected: Document appears in lease doc list. Tenant can see it.
- Pass: Confirmed on tenant portal

---

#### Story 3.4 — Manager Uploads Document to Tenant

**User Story:** As a manager, I want to upload documents directly to a tenant's record (not tied to a lease) so I can store IDs, notices, or other files.

**Frontend:**
- Document section on tenant detail page `/manager/tenants/[id]`
- Same upload form as Story 3.3 but entity_type = 'tenant', entity_id = tenantId

**Acceptance Criteria:**
- [ ] Document uploaded with entity_type = 'tenant'
- [ ] is_shared controls tenant visibility
- [ ] Appears in tenant documents section

---

#### Story 3.5 — Tenant Views Documents

**User Story:** As a tenant, I want to view and download all documents shared with me so I can access my lease and important files.

**Frontend:**
- Section on `/portal/dashboard` — Documents
- Separate page: `/portal/documents`
- List: document name, type, date uploaded, download button
- Download generates a signed URL and opens/downloads the file

**Supabase Action:**
```ts
// Get tenant ID by email
const { data: tenant } = await supabase.from('tenants')
  .select('id, leases(id)')
  .eq('email', user.email)
  .single()

// Get shared documents for this tenant and their leases
const entityIds = [tenant.id, ...tenant.leases.map(l => l.id)]
const { data: docs } = await supabase.from('documents')
  .select('*')
  .eq('is_shared', true)
  .in('entity_id', entityIds)
  .order('created_at', { ascending: false })

// For download: generate fresh signed URL
const { data: url } = await supabase.storage
  .from('documents')
  .createSignedUrl(doc.file_path, 3600)
```

**Empty State:** "No documents have been shared with you yet."

**Acceptance Criteria:**
- [ ] Only documents with is_shared = true are visible
- [ ] Documents from tenant entity AND lease entity both appear
- [ ] Private documents (is_shared = false) are completely hidden
- [ ] Download generates signed URL and works
- [ ] Signed URL expires — download link is fresh each time

**QA Test — Positive:**
- Steps: Manager uploads shared lease PDF → Tenant logs in → Documents
- Expected: Document visible and downloadable

**QA Test — Security:**
- Steps: Manager uploads private document → Tenant logs in → Documents
- Expected: Document is NOT visible to tenant
- Pass: Private document absent from tenant document list

---

## PHASE 4 — INVOICES & PAYMENTS

---

### EPIC 4 — Financial Workflow

---

#### Story 4.1 — Manager Creates Invoice

**User Story:** As a manager, I want to create an invoice for a tenant so I can track what they owe.

**Frontend:**
- Page: `/manager/invoices/new` or Quick Action on dashboard
- Fields:
  - Tenant (select, required) — shows name + unit
  - Lease (select, auto-filtered by tenant)
  - Unit (auto-filled from lease)
  - Category (select: Rent | Deposit | Late Fee | Utility | Repair | Other)
  - Amount (number, required, min: 0.01)
    - If category = Rent: pre-fills from lease rent_amount
  - Due Date (date, required)
  - Description (textarea, optional — shown to tenant)
  - Status (auto-set to "due")

**Validation Rules:**
- Tenant: required
- Category: required
- Amount: required, must be > 0
- Due Date: required

**Supabase Action:**
```ts
supabase.from('invoices').insert({
  tenant_id, lease_id, unit_id,
  amount, due_date, category, description,
  status: 'due'
})
```

**Error States:**
- Missing tenant: "Please select a tenant."
- Invalid amount: "Amount must be greater than zero."
- Save failure: "Failed to create invoice. Please try again."

**Acceptance Criteria:**
- [ ] Invoice created and linked to tenant and lease
- [ ] Rent invoices pre-fill amount from lease
- [ ] Invoice immediately visible in tenant portal
- [ ] Invoice appears in manager invoice list

**QA Test:**
- Steps: Create Invoice → select tenant (1321 Oro, Unit A) → category: Rent → amount: $1,800 → due: May 1 → save
- Expected: Invoice created with status "Due"
- Pass: Visible in manager list and tenant portal

---

#### Story 4.2 — Manager Views Invoice List

**User Story:** As a manager, I want to see all invoices across all tenants so I can track what is owed.

**Frontend:**
- Page: `/manager/invoices`
- Table columns: Tenant, Property/Unit, Category, Amount, Due Date, Status, Actions
- Filters: Status (Due | Overdue | Paid | All), Property
- Sort: Due Date (default descending)
- Outstanding balance total at top

**Supabase Action:**
```ts
supabase.from('invoices')
  .select('*, tenants(full_name, company_name, tenant_type), units(unit_number, properties(name)), payments(*)')
  .order('due_date')

// Auto-mark overdue: if due_date < today and status = 'due' → display as overdue
// (Update status on fetch or via scheduled function — for MVP: calculate client-side)
```

**Empty State:** "No invoices yet. Create the first invoice from a tenant's record."

**Acceptance Criteria:**
- [ ] All invoices listed with tenant, unit, amount, due date, status
- [ ] Overdue invoices clearly highlighted
- [ ] Outstanding balance total shown at top of page
- [ ] Filter by status works

---

#### Story 4.3 — Tenant Views Balance and Invoices

**User Story:** As a tenant, I want to see my current balance and all open invoices so I know exactly what I owe and when.

**Frontend:**
- Update `/portal/dashboard`
- Balance section (prominent, top of page):
  - Total Balance Due: sum of all unpaid invoice amounts
  - Next Due Date: earliest upcoming due date
  - Payment Instructions: text from system settings (hardcoded for MVP)
- Invoices section:
  - List of all invoices: category, amount, due date, status
  - Paid invoices shown with green status

**Supabase Action:**
```ts
// Get tenant by email
const { data: tenant } = await supabase.from('tenants')
  .select('id').eq('email', user.email).single()

// Get all invoices
const { data: invoices } = await supabase.from('invoices')
  .select('*, payments(*)')
  .eq('tenant_id', tenant.id)
  .order('due_date')

// Calculate balance client-side:
const balance = invoices
  .filter(i => i.status !== 'paid' && i.status !== 'canceled')
  .reduce((sum, i) => sum + i.amount, 0)
```

**Empty State:** "No invoices on file. Contact your property manager with any billing questions."

**Acceptance Criteria:**
- [ ] Balance shows sum of all unpaid invoices
- [ ] Balance is $0 when all invoices are paid
- [ ] Each invoice shows amount, due date, and status
- [ ] Overdue invoices clearly marked
- [ ] Payment instructions displayed

**QA Test:**
- Precondition: Invoice for $1,800 due May 1 created for tenant
- Steps: Tenant logs in to portal
- Expected: Balance shows $1,800. Invoice listed with due date. Payment instructions shown.
- Pass: All three confirmed

---

#### Story 4.4 — Manager Records Payment

**User Story:** As a manager, I want to record a payment against an invoice so the balance updates for both manager and tenant.

**Frontend:**
- On invoice detail page `/manager/invoices/[id]`
- "Record Payment" button → modal/form
- Fields:
  - Amount Paid (number, required, max: invoice remaining balance)
  - Payment Date (date, required, defaults to today)
  - Payment Method (select: Check | Cash | Zelle | Venmo | Bank Transfer | Money Order | Other)
  - Notes (text, optional)
  - Upload Receipt (file picker, optional — pdf/jpg/png, max 10MB)

**Supabase Action (transaction):**
```ts
// 1. Upload receipt if provided
let receipt_url = null, receipt_path = null
if (receiptFile) {
  const { data } = await supabase.storage.from('receipts')
    .upload(`${invoiceId}/${filename}`, receiptFile)
  const { data: url } = await supabase.storage.from('receipts')
    .createSignedUrl(data.path, 3600)
  receipt_url = url.signedUrl
  receipt_path = data.path
}

// 2. Record payment
await supabase.from('payments').insert({
  invoice_id, amount_paid, paid_at, method, notes,
  receipt_url, receipt_path,
  recorded_by: currentUser.id
})

// 3. Update invoice status
const totalPaid = existingPayments + amount_paid
if (totalPaid >= invoice.amount) {
  await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoice_id)
} else {
  await supabase.from('invoices').update({ status: 'partially_paid' }).eq('id', invoice_id)
}
```

**Validation Rules:**
- Amount: required, must be > 0, cannot exceed remaining balance
- Date: required
- Method: required
- Receipt: optional, max 10MB, pdf/jpg/png only

**Error States:**
- Amount exceeds balance: "Payment amount cannot exceed the remaining balance of $X."
- Upload failure: "Receipt upload failed. Payment was recorded without receipt."

**Acceptance Criteria:**
- [ ] Payment recorded and linked to invoice
- [ ] Invoice status updates to "paid" when fully paid or "partially_paid" if partial
- [ ] Receipt stored in Supabase Storage if uploaded
- [ ] Tenant immediately sees payment in their payment history
- [ ] Dashboard outstanding balance decreases

**QA Test:**
- Precondition: Invoice for $1,800 exists with status "due"
- Steps: Invoice detail → Record Payment → $1,800 → Zelle → today → save
- Expected: Invoice status → Paid. Tenant balance → $0.
- Pass: Confirmed in both manager and tenant views

---

#### Story 4.5 — Tenant Views Payment History and Receipts

**User Story:** As a tenant, I want to see my payment history and download my receipts so I have records of everything I've paid.

**Frontend:**
- Section on `/portal/dashboard` — Payment History
- Table: Date, Invoice Category, Amount Paid, Method, Receipt (download link if exists)
- Sorted: most recent first

**Supabase Action:**
```ts
const { data: payments } = await supabase.from('payments')
  .select('*, invoices(category, amount, due_date)')
  .eq('invoices.tenant_id', tenant.id) // via join
  .order('paid_at', { ascending: false })

// For receipt download: generate fresh signed URL from receipt_path
```

**Empty State:** "No payments recorded yet."

**Acceptance Criteria:**
- [ ] All payments listed with date, amount, and method
- [ ] Receipt download link appears when receipt was uploaded
- [ ] Receipt download generates fresh signed URL
- [ ] Payments sorted most recent first

**QA Test:**
- Precondition: Payment recorded with receipt uploaded
- Steps: Tenant logs in → scroll to Payment History
- Expected: Payment visible. Receipt download link works. File opens correctly.
- Pass: Confirmed

---

## PHASE 5 — NOTICES

---

### EPIC 5 — Notices

---

#### Story 5.1 — Manager Creates and Sends Notice

**User Story:** As a manager, I want to send a notice to a specific tenant, all tenants at a property, or all tenants so I can communicate important information.

**Frontend:**
- Page: `/manager/notices/new`
- Fields:
  - Notice Type (select: General | Rent Reminder | Late Rent | Lease Renewal | Entry Notice | Maintenance)
  - Subject (text, required, max 200 chars)
  - Body (textarea, required, max 5000 chars)
  - Send To (radio: Individual Tenant | Property | All Tenants)
    - If Individual: show tenant select
    - If Property: show property select
    - If All: no additional selection needed

**Validation Rules:**
- Type: required
- Subject: required
- Body: required, min 10 chars
- Send To: required, and corresponding selection required

**Supabase Action:**
```ts
await supabase.from('notices').insert({
  type, subject, body,
  sent_to_type: 'tenant' | 'property' | 'all',
  tenant_id: selectedTenantId || null,
  property_id: selectedPropertyId || null,
  sent_at: new Date().toISOString()
})
```

**Error States:**
- Missing recipient: "Please select who to send this notice to."
- Body too short: "Notice body must be at least 10 characters."
- Save failure: "Failed to send notice. Please try again."

**Acceptance Criteria:**
- [ ] Notice created with correct sent_to_type
- [ ] Individual notice visible only to selected tenant
- [ ] Property notice visible to all tenants with active lease at that property
- [ ] "All" notice visible to every tenant
- [ ] Manager can view history of sent notices

**QA Test:**
- Steps: Notices → New Notice → Type: General → Subject: "Pool Maintenance" → Body: "Pool will be closed Saturday" → Send To: Property → 1321 Oro St → send
- Expected: Notice created. All tenants at 1321 Oro St see it on portal.
- Pass: Confirmed on tenant portal

---

#### Story 5.2 — Manager Views Notice History

**User Story:** As a manager, I want to see all notices I've sent so I have a record of communications.

**Frontend:**
- Page: `/manager/notices`
- Table: Type, Subject, Sent To, Date Sent
- Sorted: most recent first

**Supabase Action:**
```ts
supabase.from('notices').select('*, properties(name), tenants(full_name)')
  .order('sent_at', { ascending: false })
```

**Empty State:** "No notices sent yet."

**Acceptance Criteria:**
- [ ] All notices listed
- [ ] Shows who notice was sent to
- [ ] Clicking notice shows full content

---

#### Story 5.3 — Tenant Views Notices

**User Story:** As a tenant, I want to see all notices sent to me so I stay informed.

**Frontend:**
- Section on `/portal/dashboard` — Notices (recent 3)
- Page: `/portal/notices` — all notices
- List: type badge, subject, date, expand to read body

**Supabase Action:**
Uses the RLS policy defined in the schema — Supabase automatically filters to only notices the tenant should see.

```ts
const { data: notices } = await supabase.from('notices')
  .select('*')
  .order('sent_at', { ascending: false })
```

**Empty State:** "No notices from your property manager yet."

**Acceptance Criteria:**
- [ ] Tenant sees notices sent to them, their property, or all tenants
- [ ] Tenant does NOT see notices sent to other tenants
- [ ] Notice displays subject, type, date, and full body
- [ ] Most recent notice appears at top of dashboard

**QA Test — Positive:**
- Steps: Manager sends "All" notice → Tenant logs in
- Expected: Notice visible on dashboard
- Pass: Confirmed

**QA Test — Isolation:**
- Steps: Manager sends notice to Tenant A only → Tenant B logs in
- Expected: Tenant B does NOT see the notice
- Pass: Notice absent from Tenant B's portal

---

## PHASE 6 — MAINTENANCE POLISH

---

### EPIC 6 — Maintenance (End-to-End Verification)

The maintenance request workflow already exists. This phase ensures it works completely end-to-end with the new tenant-linking approach.

---

#### Story 6.1 — Tenant Submits Maintenance Request (Connected to Tenant Record)

**Current State:** Maintenance requests exist but are linked by user_id. After Phase 2, they should link to tenant_id via email match.

**Required Fix:**
- When tenant submits request, look up their tenant record by email
- Save tenant_id on the request (not user_id)
- If no tenant record found: show error "Your account is not yet set up. Contact your property manager."

**Frontend:** `/portal/maintenance` — update to use tenant lookup

**Supabase Action (updated):**
```ts
// 1. Get tenant record
const { data: tenant } = await supabase.from('tenants')
  .select('id, leases(unit_id)').eq('email', user.email).single()

if (!tenant) throw new Error('Tenant record not found')

// 2. Create request
await supabase.from('maintenance_requests').insert({
  tenant_id: tenant.id,
  unit_id: tenant.leases?.[0]?.unit_id || null,
  title, description, priority,
  status: 'new'
})
```

**Acceptance Criteria:**
- [ ] Request linked to tenant_id
- [ ] Unit auto-populated from active lease
- [ ] Error shown if no tenant record exists for this email

---

#### Story 6.2 — Tenant Views Maintenance Status

**User Story:** As a tenant, I want to see the current status of all my maintenance requests so I know what's being done.

**Frontend:** `/portal/dashboard` — maintenance section shows:
- Request title
- Date submitted
- Current status with color coding:
  - New → gray
  - In Review → yellow
  - Scheduled → blue
  - Completed → green
  - Canceled → red

**Supabase Action:**
```ts
supabase.from('maintenance_requests')
  .select('id, title, status, priority, created_at')
  .eq('tenant_id', tenant.id)
  .order('created_at', { ascending: false })
```

**Acceptance Criteria:**
- [ ] All tenant's requests listed with current status
- [ ] Status color coding applied
- [ ] Sorted most recent first

---

#### Story 6.3 — Manager Updates Maintenance Status

**Current State:** Status update exists. Verify it reflects immediately on tenant dashboard.

**Required Verification:**
- Manager changes status
- Tenant refreshes portal → sees new status
- No additional implementation needed if RLS is correct

**QA Test:**
- Steps: Manager opens request → change status to "Scheduled" → save → Tenant refreshes portal
- Expected: Tenant sees "Scheduled" status
- Pass: Confirmed

---

## PHASE 7 — MANAGER DASHBOARD UPDATE

---

### EPIC 7 — Connected Dashboard

---

#### Story 7.1 — Manager Dashboard Shows Real Data

**User Story:** As a manager, I want my dashboard to show real operational data so I can see what needs my attention today.

**Current State:** Dashboard shows hardcoded zeros. After all phases complete, connect to real data.

**Frontend updates to `/manager/dashboard`:**
- Card 1: **Total Outstanding Balance** — sum of all unpaid/overdue invoice amounts
- Card 2: **Overdue Invoices** — count of invoices where due_date < today and status ≠ paid/canceled
- Card 3: **Open Maintenance Requests** — count where status ∈ (new, in_review, scheduled)
- Card 4: **Vacant Units** — count where status = vacant

**Additional sections:**
- **Expiring Leases** — leases where end_date is within 60 days and status = active
- **Recent Activity** — last 5 actions (new requests, payments recorded, leases created)

**Supabase Action:**
```ts
const [
  { data: invoices },
  { data: requests },
  { data: vacancies },
  { data: leases }
] = await Promise.all([
  supabase.from('invoices').select('amount, status, due_date').neq('status', 'paid').neq('status', 'canceled'),
  supabase.from('maintenance_requests').select('status').in('status', ['new', 'in_review', 'scheduled']),
  supabase.from('units').select('id').eq('status', 'vacant'),
  supabase.from('leases').select('*, tenants(full_name), units(unit_number, properties(name))')
    .eq('status', 'active')
    .lte('end_date', new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0])
])

const totalBalance = invoices.reduce((sum, i) => sum + i.amount, 0)
const overdueCount = invoices.filter(i => i.due_date < today).length
```

**Acceptance Criteria:**
- [ ] Outstanding balance shows real sum of unpaid invoices
- [ ] Overdue count reflects actual overdue invoices
- [ ] Vacant units count is accurate
- [ ] Expiring leases section shows leases expiring within 60 days
- [ ] All stats update immediately after any relevant change

**QA Test:**
- Steps: Create invoice, record payment, create maintenance request → view dashboard
- Expected: Stats reflect real data
- Pass: All 4 cards show correct numbers

---

## SIDEBAR NAVIGATION — FINAL STRUCTURE

Update `/manager/layout.tsx` sidebar links to include all new sections:

```
Dashboard         /manager/dashboard
Properties        /manager/properties
Tenants           /manager/tenants
Leases            /manager/leases
Invoices          /manager/invoices
Maintenance       /manager/requests
Notices           /manager/notices
Documents         /manager/documents  (optional: redirect to tenant/lease view)
───────────────
← Main site       /
```

---

## TENANT PORTAL — FINAL STRUCTURE

Update tenant portal navigation:

```
Dashboard         /portal/dashboard      (balance, lease, quick actions)
My Invoices       /portal/invoices       (all invoices + payment history)
Documents         /portal/documents      (shared documents)
Maintenance       /portal/maintenance    (submit + status view)
Notices           /portal/notices        (all notices)
```

---

## GLOBAL ERROR AND EMPTY STATE STANDARDS

Apply these consistently across all pages:

### Loading State
All data-fetching pages must show a spinner while loading. Never show partial empty states before data arrives.

### Empty States
Each page must have a helpful empty state message with a call to action where applicable.

| Page | Empty State Message | CTA |
|------|---------------------|-----|
| Properties | "No properties yet." | Add Property |
| Units | "No units for this property." | Add Unit |
| Tenants | "No tenants yet." | Add Tenant |
| Leases | "No leases yet." | Create Lease |
| Invoices | "No invoices yet." | Create Invoice |
| Payments | "No payments recorded yet." | — |
| Documents | "No documents uploaded yet." | Upload Document |
| Maintenance (manager) | "No maintenance requests." | — |
| Maintenance (tenant) | "No requests submitted." | Submit Request |
| Notices | "No notices sent yet." | Send Notice |
| Portal — balance | "No outstanding balance." | — |
| Portal — documents | "No documents shared with you yet." | — |
| Portal — notices | "No notices from your manager." | — |

### Error States
All Supabase operations must handle errors explicitly:
- Network error: "Connection failed. Please check your connection and try again."
- Not found: "This record could not be found."
- Permission error: "You don't have permission to view this."
- Validation error: Show field-level error messages inline

---

## FORM VALIDATION STANDARDS

Apply consistently to all forms:

- Required fields: marked with `*` in label
- Validate on submit AND on blur (for better UX)
- Error messages: shown below each field in red
- Disable submit button while saving
- Show loading indicator on submit button during save
- After successful save: show success toast/message and redirect or clear form

---

## SUPABASE STORAGE — SIGNED URL PATTERN

All document and receipt access must use this pattern:

```ts
// NEVER expose raw storage paths in the UI
// ALWAYS generate a fresh signed URL for each access

async function getSignedUrl(bucket: string, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600) // 1 hour expiry
  if (error) throw new Error('Could not generate download link')
  return data.signedUrl
}
```

Store `file_path` (the storage path) in the database. Never store the signed URL — it expires. Generate fresh signed URLs on demand.

---

## SECURITY CHECKLIST

Before considering MVP complete, verify each item:

### RLS Verification Tests
Run these queries in Supabase while authenticated as a tenant (use Supabase test/impersonate):

- [ ] `select * from tenants` — returns only own tenant record
- [ ] `select * from invoices` — returns only own invoices
- [ ] `select * from payments` — returns only own payments
- [ ] `select * from leases` — returns only own leases
- [ ] `select * from documents where is_shared = false` — returns empty
- [ ] `select * from documents where is_shared = true` — returns only own shared docs
- [ ] `select * from notices` — returns only applicable notices (own, property, or all)
- [ ] `select * from maintenance_requests` — returns only own requests

### Auth Checks
- [ ] Manager routes (`/manager/*`) check email domain before rendering
- [ ] Tenant routes (`/portal/*`) check for valid session
- [ ] Session expiry handled gracefully — redirect to login
- [ ] Sign out clears session completely

### Storage Checks
- [ ] Documents bucket is private (not public)
- [ ] Receipts bucket is private
- [ ] Signed URLs expire correctly (test after 1+ hour)
- [ ] Tenants cannot generate signed URLs for other tenants' documents

---

## QA MASTER CHECKLIST

Complete all 14 end-to-end tests before marking MVP done:

| # | Workflow | Tested | Pass |
|---|----------|--------|------|
| 1 | Manager creates property and adds 2 units | ☐ | ☐ |
| 2 | Manager creates individual tenant with all fields | ☐ | ☐ |
| 3 | Manager creates company tenant | ☐ | ☐ |
| 4 | Manager creates lease assigning tenant to unit | ☐ | ☐ |
| 5 | Unit status changes to Occupied after lease creation | ☐ | ☐ |
| 6 | Manager uploads lease PDF, marks as shared | ☐ | ☐ |
| 7 | Tenant logs in and sees lease document, downloads it | ☐ | ☐ |
| 8 | Manager uploads private doc — tenant cannot see it | ☐ | ☐ |
| 9 | Manager creates rent invoice — tenant sees balance | ☐ | ☐ |
| 10 | Manager records payment — invoice status → Paid | ☐ | ☐ |
| 11 | Tenant sees payment in history, downloads receipt | ☐ | ☐ |
| 12 | Manager dashboard balance decreases after payment | ☐ | ☐ |
| 13 | Tenant submits maintenance request | ☐ | ☐ |
| 14 | Manager updates request status — tenant sees update | ☐ | ☐ |
| 15 | Manager sends notice to all — all tenants see it | ☐ | ☐ |
| 16 | Manager sends notice to Tenant A — Tenant B cannot see it | ☐ | ☐ |
| 17 | Tenant with no shared docs sees empty document state | ☐ | ☐ |
| 18 | Tenant with no invoices sees $0 balance | ☐ | ☐ |
| 19 | All RLS tests in security checklist pass | ☐ | ☐ |
| 20 | All pages work on mobile (375px viewport) | ☐ | ☐ |

---

## DEFINITION OF DONE

The MVP is complete when all 20 QA items above are checked and passing, and:

1. A real tenant has been invited, logged in, and seen their own data
2. A real invoice has been created and paid with a receipt
3. A real maintenance request has gone from submitted → resolved
4. A real notice has been sent and viewed by a tenant
5. No console errors in production
6. All pages load on mobile without layout issues

---

*Reyes Rebollar Properties LLC — MVP Developer Backlog*
*Implementation starts with Phase 1: Properties & Units*
