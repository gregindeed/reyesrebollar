# Reyes Rebollar Properties LLC
## Property Management System — Full Product Audit
### Version 1.0 — April 2026

---

## EXECUTIVE SUMMARY

Reyes Rebollar Properties LLC has built a solid foundation: a branded marketing website, a manager portal with login and basic dashboard, and a tenant-facing portal with maintenance request submission. The design is professional, the technology stack (Next.js, Supabase, Cloudflare Pages) is appropriate, and the authentication architecture is sound.

However, the system is not yet functional as a day-to-day property management tool. The current state is best described as a **working shell** — the structure exists but the core operational workflows (invoicing, rent tracking, document management, messaging, and tenant records) are either missing or not connected end-to-end.

The path forward is clear and achievable. This audit defines exactly what needs to be built, in what order, and to what standard, to reach a practical MVP that a small property management company can actually use.

**Current portfolio:** 4 properties, 10 residential/commercial units, El Cajon, California.

**Recommended MVP completion time:** 4–6 focused weeks of development.

---

## SECTION 1 — MANAGER-SIDE AUDIT

### What Currently Exists

| Area | Status |
|------|--------|
| Manager login (email + password) | ✅ Built |
| Manager dashboard (shell) | ✅ Built — stats are 0, no real data |
| Tenant list page | ✅ Built — add tenant form exists |
| Maintenance request queue | ✅ Built — status updates work |
| Property data (hardcoded) | ⚠️ Exists in code only, not in database |
| Invoicing | ❌ Missing |
| Rent tracking | ❌ Missing |
| Lease management | ❌ Missing |
| Document upload/management | ❌ Missing |
| Messaging / notices | ❌ Missing |
| Unit management | ❌ Missing |
| Reports | ❌ Missing |
| Settings | ❌ Missing |

### What Is Incomplete

**Dashboard** — The dashboard shows 4 stat cards (Total Tenants, Open Requests, In Progress, Urgent) with real data from Supabase but is missing the most critical operational metrics: outstanding rent balances, overdue invoices, expiring leases, and upcoming move-outs. A manager cannot answer "what do I need to do today?" from the current dashboard.

**Tenant Management** — The add-tenant form captures basic fields but does not support company tenants, does not link to units or leases, and does not trigger a tenant portal invitation.

**Properties** — Properties exist as hardcoded data in a TypeScript file. They are not in the database. This means no real CRUD operations, no unit-level tracking, and no connection between properties and tenants.

**Maintenance** — The most complete workflow. Requests come in, statuses can be updated, and the queue is visible. Missing: tenant messaging per request, photo attachments in manager view, vendor assignment.

### Critical Manager-Side Gaps

1. No way to create or view invoices
2. No way to record or track rent payments
3. No lease records in the database
4. Properties are not in the database — everything is hardcoded
5. Units do not exist as database entities
6. No document upload or management
7. No messaging or notice system
8. No tenant invitation/onboarding workflow
9. No way to see which units are vacant or occupied
10. No financial summary of any kind

---

## SECTION 2 — TENANT-SIDE AUDIT

### What Currently Exists

| Area | Status |
|------|--------|
| Tenant login (magic link) | ✅ Built |
| Tenant dashboard (shell) | ✅ Built — shows lease if data exists |
| Maintenance request submission | ✅ Built |
| Lease view | ⚠️ Shows if manager manually adds a lease record |
| Documents | ❌ Missing |
| Invoice/balance view | ❌ Missing |
| Payment history | ❌ Missing |
| Receipts | ❌ Missing |
| Messaging | ❌ Missing |
| Notices | ❌ Missing |
| Profile/contact update | ❌ Missing |
| Portal invitation flow | ❌ Missing |

### What Is Incomplete

**Tenant Dashboard** — Shows lease info and maintenance requests if they exist in the database. However, the most important section for a tenant — "what do I owe and when is it due?" — is completely missing.

**Maintenance Flow** — Tenant can submit a request. However, they cannot upload photos, cannot see status updates as notifications, and cannot add follow-up comments.

**Onboarding** — There is no flow for a manager to invite a tenant to the portal. Tenants must know to go to /portal/login themselves. The account is not linked to their tenant profile automatically.

### Critical Tenant-Side Gaps

1. No balance or invoice visibility
2. No payment instructions
3. No receipt access
4. No document access
5. No messaging with manager
6. No notification when maintenance status changes
7. No profile editing
8. Portal invitation not connected to tenant creation
9. No payment history

---

## SECTION 3 — FEATURE GAP ANALYSIS

### Gap Summary by Priority

| Feature | Priority | Gap Type |
|---------|----------|----------|
| Properties in database | P0 | Missing entirely |
| Units in database | P0 | Missing entirely |
| Lease records in database | P0 | Missing entirely |
| Invoice creation | P0 | Missing entirely |
| Rent tracking / payment recording | P0 | Missing entirely |
| Tenant-to-unit assignment | P0 | Missing entirely |
| Tenant portal invitation | P0 | Incomplete |
| Document upload | P0 | Missing entirely |
| Tenant dashboard — balance view | P0 | Missing entirely |
| Manager dashboard — daily snapshot | P0 | Incomplete |
| Company tenant type | P1 | Missing entirely |
| Messaging | P1 | Missing entirely |
| Notices | P1 | Missing entirely |
| Receipt generation/upload | P1 | Missing entirely |
| Maintenance photo upload | P1 | Incomplete |
| Lease document upload | P1 | Missing entirely |
| Occupancy/vacancy report | P1 | Missing entirely |
| Tenant profile editing (tenant side) | P1 | Missing entirely |
| Applications | P2 | Missing entirely |
| Online payment processing | P2 | Not planned for MVP |
| Advanced reports | P2 | Missing |
| Notifications (email) | P2 | Missing |
| Vendor management | P2 | Out of scope |

---

## SECTION 4 — MVP FEATURE LIST

The following features constitute a complete, usable MVP for Reyes Rebollar Properties LLC.

### Core Data (Must Exist First)

1. **Properties table** — address, type, notes, status
2. **Units table** — unit number, property, rent amount, deposit, occupancy status
3. **Tenants table** (expanded) — individual and company type, all contact fields
4. **Leases table** — unit, tenant, dates, rent, deposit, status, document URL
5. **Invoices table** — tenant, lease, unit, amount, due date, category, status
6. **Payments table** — invoice, amount paid, date, method, notes
7. **Documents table** — linked entity, file URL, type, visibility (private/shared)
8. **Messages table** — sender, recipient, content, timestamp, read status
9. **Notices table** — type, content, sent to, sent at

### Manager Workflows (Must Work End-to-End)

1. Add property → add units → set rent amounts
2. Add tenant → assign to unit → create lease → upload lease document
3. Create invoice → mark as paid → upload receipt
4. View all outstanding balances in one place
5. Receive and update maintenance requests
6. Upload documents and set visibility (private or shared with tenant)
7. Send a notice to one tenant, one property, or all tenants
8. View which units are vacant, occupied, or expiring soon

### Tenant Workflows (Must Work End-to-End)

1. Receive portal invitation → activate account → log in
2. See current balance and next due date
3. See open invoices and payment instructions
4. View and download lease documents
5. View shared documents
6. Submit maintenance request
7. Track maintenance request status
8. View payment history and download receipts
9. Contact manager (basic message)

---

## SECTION 5 — P0 / P1 / P2 ROADMAP

---

### P0 — Required Before the System Is Usable

#### P0.1 — Move Properties to Database
**Why it matters:** Everything else depends on this. Units, leases, tenants, invoices all reference properties.
**Implementation:** Create `properties` and `units` tables in Supabase. Build manager CRUD screens. Migrate the 4 existing properties from hardcoded data.
**Acceptance criteria:** Manager can add, view, and edit properties and units. Property list shows occupancy status per unit.

#### P0.2 — Expand Tenant Model
**Why it matters:** Current tenant table is too simple to be operational.
**Implementation:** Add fields: phone, emergency_contact, mailing_address, tenant_type (individual/company), company_name, portal_invited_at, notes. Create tenant detail page for manager.
**Acceptance criteria:** Manager can view full tenant profile, see linked lease and unit, and invite tenant to portal from the tenant record.

#### P0.3 — Lease Management
**Why it matters:** Leases are the legal and financial backbone of property management.
**Implementation:** `leases` table with fields: unit_id, tenant_id, start_date, end_date, rent_amount, deposit_amount, status (Draft/Active/Expiring/Expired/Terminated), document_url, notes. Manager can create, edit, and upload lease documents.
**Acceptance criteria:** Manager can create a lease, assign it to a unit and tenant, upload a PDF, and see expiration warnings. Tenant can view and download their lease.

#### P0.4 — Invoice and Payment Tracking
**Why it matters:** Knowing who owes what is the most critical operational need.
**Implementation:** `invoices` table (tenant_id, lease_id, unit_id, amount, due_date, category, status). `payments` table (invoice_id, amount_paid, paid_at, method, notes, receipt_url). Manager creates invoices, records payments manually, uploads receipts. No online payment processor required for MVP.
**Acceptance criteria:** Manager creates a rent invoice for a tenant. Tenant logs in and sees the invoice with amount and due date. Manager records payment and uploads receipt. Tenant sees receipt. Dashboard shows outstanding total.

#### P0.5 — Tenant Portal Invitation Flow
**Why it matters:** Tenants cannot use the portal if they don't know about it or cannot activate it.
**Implementation:** When manager adds a tenant, include an "Invite to Portal" action that sends the tenant a magic link email. On first login, the system links their auth user to their tenant profile by email.
**Acceptance criteria:** Manager clicks invite. Tenant receives email. Tenant clicks link, lands on portal dashboard, and sees their data.

#### P0.6 — Manager Dashboard — Daily Snapshot
**Why it matters:** A manager needs to know what needs attention today, not dig through multiple pages.
**Implementation:** Replace the current 4-card layout with: Outstanding Rent Balance, Overdue Invoices, Open Maintenance Requests, Expiring Leases (within 60 days), Vacant Units. Add a quick-action panel: Add Tenant, Create Invoice, Add Maintenance Request.
**Acceptance criteria:** Manager logs in and immediately sees: total balance owed, number of overdue invoices, open requests, and expiring leases. Can click any card to drill down.

#### P0.7 — Tenant Dashboard — Balance View
**Why it matters:** Tenants must be able to see what they owe.
**Implementation:** Replace the current empty lease view with: Current Balance Due, Next Invoice Due Date, Payment Instructions (text from settings), Open Invoices list, Recent Payments/Receipts.
**Acceptance criteria:** Tenant logs in and immediately sees their balance, due date, and how to pay.

#### P0.8 — Basic Document Management
**Why it matters:** Lease PDFs, receipts, and IDs need to be stored and accessible.
**Implementation:** Use Supabase Storage. `documents` table with: entity_type (tenant/lease/property/invoice), entity_id, name, file_url, document_type, is_shared (boolean), uploaded_at. Manager uploads. Tenant sees only shared=true documents.
**Acceptance criteria:** Manager uploads a lease PDF and marks it shared. Tenant logs in and sees the document and can download it. Manager uploads an internal note document marked private. Tenant cannot see it.

---

### P1 — Important Soon After Launch

#### P1.1 — Company Tenant Support
**Why it matters:** Commercial tenants (like 1107 Greenfield Dr) may be businesses.
**Implementation:** Add `tenant_type` toggle (Individual/Company) to tenant form. Show/hide fields accordingly. Company fields: company_name, ein, billing_email, primary_contact.
**Acceptance criteria:** Manager can create a company tenant and assign it to a commercial unit.

#### P1.2 — Messaging (Manager ↔ Tenant)
**Why it matters:** Managers need to communicate with tenants without switching to email.
**Implementation:** `messages` table (sender_id, recipient_id, body, sent_at, read_at). Simple threaded conversation per tenant. Manager sees all conversations. Tenant sees only their own.
**Acceptance criteria:** Manager sends a message to a tenant. Tenant logs in and sees the message. Tenant replies. Manager sees the reply.

#### P1.3 — Notices
**Why it matters:** Formal notices (rent reminder, entry notice, lease renewal) are a legal requirement.
**Implementation:** `notices` table (type, subject, body, sent_to_type, property_id/tenant_id, sent_at, document_url). Pre-built notice templates. Manager sends to individual or all tenants in a property.
**Acceptance criteria:** Manager sends a "Rent Reminder" notice to all tenants at 1321 Oro Street. Each tenant logs in and sees the notice on their dashboard.

#### P1.4 — Maintenance Photo Uploads
**Why it matters:** Tenants need to show the issue. Managers need visual documentation.
**Implementation:** Add Supabase Storage upload to maintenance request form. Support up to 3 photos per request. Display in manager maintenance view.
**Acceptance criteria:** Tenant uploads photo with request. Manager sees photo in the request detail.

#### P1.5 — Occupancy and Lease Expiration Report
**Why it matters:** Managers need to know vacancy and upcoming expirations at a glance.
**Implementation:** Simple table report: unit, tenant, lease start/end, status, rent amount. Filter by property. Highlight units expiring within 60 days.
**Acceptance criteria:** Manager can see a full rent roll with occupancy status across all properties.

#### P1.6 — Payment Instructions in Settings
**Why it matters:** Until online payments exist, tenants need clear instructions.
**Implementation:** Manager settings panel with a "Payment Instructions" text field. This text appears on the tenant dashboard where "how to pay" is displayed.
**Acceptance criteria:** Manager updates payment instructions. Tenant immediately sees the new instructions on their dashboard.

#### P1.7 — Tenant Profile Edit (Tenant Side)
**Why it matters:** Tenants move, change phone numbers, and need to update their own info.
**Implementation:** Add a profile settings page to the tenant portal with editable fields: phone, mailing address, emergency contact.
**Acceptance criteria:** Tenant updates phone number. Manager sees updated phone in tenant record.

---

### P2 — Nice to Have Later

#### P2.1 — Online Rent Payment
**Why it matters:** Removes the manual payment recording process.
**Implementation:** Stripe integration. Payment link per invoice. Webhook updates invoice status automatically.
**Notes:** Requires Stripe setup, PCI compliance awareness, and server-side API routes (needs architecture change from static export).

#### P2.2 — Rental Applications
**Why it matters:** Handles prospective tenants before lease is signed.
**Implementation:** Public application form. `applications` table with status workflow. Manager reviews and converts to tenant.
**Notes:** Can be a simple form on a public page or a Typeform/JotForm embed as a quick win.

#### P2.3 — Email Notifications
**Why it matters:** Tenants shouldn't have to log in to find out something changed.
**Implementation:** Supabase Edge Functions + Resend API. Triggered on: new invoice, maintenance status change, new notice, document shared.
**Notes:** Configure custom SMTP (Titan) in Supabase first.

#### P2.4 — Advanced Reports
- Tenant ledger (full payment history per tenant)
- Income by property
- Maintenance cost tracking
- YTD income summary

#### P2.5 — Inspection Reports
**Implementation:** Upload-only for MVP. Manager uploads inspection PDFs to property/unit documents.

#### P2.6 — Recurring Invoice Generation
**Why it matters:** Automates monthly rent invoice creation.
**Implementation:** Supabase Edge Function that runs on the 1st of each month, creates rent invoices for all active leases.

---

## SECTION 6 — RECOMMENDED MANAGER DASHBOARD LAYOUT

```
┌─────────────────────────────────────────────────────────────────┐
│ REYES REBOLLAR — MANAGER DASHBOARD                              │
├──────────────┬───────────────────────────────────────────────────┤
│ SIDEBAR      │  Today, [Date]                                    │
│ Dashboard    │                                                   │
│ Properties   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐│
│ Tenants      │  │$X,XXX    │ │  X       │ │  X       │ │  X   ││
│ Leases       │  │Outstanding│ │Overdue   │ │Open Maint│ │Vacant││
│ Invoices     │  │Balance   │ │Invoices  │ │Requests  │ │Units ││
│ Maintenance  │  └──────────┘ └──────────┘ └──────────┘ └──────┘│
│ Documents    │                                                   │
│ Notices      │  ┌─────────────────────────────────────────────┐ │
│ Settings     │  │ RECENT ACTIVITY                             │ │
│              │  │ • Invoice created — Unit A, $1,800 due 5/1  │ │
│              │  │ • Maintenance request — 1321 Oro, Kitchen   │ │
│              │  │ • Lease expiring — 1227 N 1st, in 45 days   │ │
│              │  └─────────────────────────────────────────────┘ │
│              │                                                   │
│              │  ┌────────────────┐  ┌─────────────────────────┐ │
│              │  │ OPEN REQUESTS  │  │ EXPIRING LEASES         │ │
│              │  │ [List w/status]│  │ [List w/days remaining] │ │
│              │  └────────────────┘  └─────────────────────────┘ │
│              │                                                   │
│              │  Quick Actions: [+ Tenant] [+ Invoice] [+ Notice]│
└──────────────┴───────────────────────────────────────────────────┘
```

---

## SECTION 7 — RECOMMENDED TENANT DASHBOARD LAYOUT

```
┌─────────────────────────────────────────────────────────────────┐
│ REYES REBOLLAR — TENANT PORTAL                                  │
│ Welcome back, [Name]                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────┐                       │
│  │ BALANCE DUE         $1,800.00        │                       │
│  │ Due Date:           May 1, 2026      │                       │
│  │ [View Payment Instructions]          │                       │
│  └──────────────────────────────────────┘                       │
│                                                                 │
│  ┌────────────────────┐  ┌────────────────────┐                 │
│  │ YOUR LEASE         │  │ DOCUMENTS          │                 │
│  │ 1321 Oro St, Unt A │  │ Lease Agreement    │                 │
│  │ May 2025–Apr 2026  │  │ Move-in Checklist  │                 │
│  │ [Download Lease]   │  │ [View All]         │                 │
│  └────────────────────┘  └────────────────────┘                 │
│                                                                 │
│  ┌────────────────────────────────────────────┐                 │
│  │ MAINTENANCE REQUESTS                       │                 │
│  │ Kitchen faucet leak — In Progress          │                 │
│  │ [+ Submit New Request]                     │                 │
│  └────────────────────────────────────────────┘                 │
│                                                                 │
│  ┌────────────────────────────────────────────┐                 │
│  │ PAYMENT HISTORY                            │                 │
│  │ Apr 1 — $1,800 — Paid ✓ [Receipt]         │                 │
│  │ Mar 1 — $1,800 — Paid ✓ [Receipt]         │                 │
│  └────────────────────────────────────────────┘                 │
│                                                                 │
│  Quick Actions: [Pay Rent] [Request Maintenance] [Contact Us]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## SECTION 8 — SIMPLE DATA MODEL

### Properties
```
id              uuid, primary key
name            text
address         text
city            text
state           text
zip_code        text
type            enum: residential | commercial | mixed
status          enum: active | inactive
notes           text
created_at      timestamp
```

### Units
```
id              uuid, primary key
property_id     uuid → properties
unit_number     text (e.g., "A", "Unit 1", "Suite 200")
rent_amount     numeric
deposit_amount  numeric
status          enum: vacant | occupied | pending_move_in | pending_move_out | maintenance
bedrooms        integer (optional)
bathrooms       numeric (optional)
sqft            integer (optional)
notes           text
```

### Tenants
```
id              uuid, primary key
user_id         uuid → auth.users (nullable until portal activated)
tenant_type     enum: individual | company
email           text (unique)
full_name       text
phone           text
emergency_contact_name    text
emergency_contact_phone   text
mailing_address text
company_name    text (company only)
ein             text (company only, optional)
billing_email   text (company only)
portal_invited_at  timestamp
notes           text
created_at      timestamp
```

### Leases
```
id              uuid, primary key
unit_id         uuid → units
tenant_id       uuid → tenants
start_date      date
end_date        date
rent_amount     numeric
deposit_amount  numeric
status          enum: draft | active | expiring_soon | expired | renewed | terminated
document_url    text (Supabase Storage)
notes           text
created_at      timestamp
```

### Invoices
```
id              uuid, primary key
tenant_id       uuid → tenants
lease_id        uuid → leases
unit_id         uuid → units
amount          numeric
due_date        date
category        enum: rent | deposit | late_fee | utility | repair | other
status          enum: draft | sent | due | overdue | paid | partially_paid | canceled
description     text
created_at      timestamp
```

### Payments
```
id              uuid, primary key
invoice_id      uuid → invoices
amount_paid     numeric
paid_at         timestamp
method          enum: check | cash | zelle | venmo | bank_transfer | other
notes           text
receipt_url     text (Supabase Storage)
recorded_by     uuid → auth.users
```

### Documents
```
id              uuid, primary key
entity_type     enum: tenant | lease | unit | property | invoice | maintenance | general
entity_id       uuid
name            text
document_type   enum: lease | contract | id | receipt | invoice | inspection | notice | photo | other
file_url        text (Supabase Storage)
is_shared       boolean (default false)
uploaded_by     uuid → auth.users
created_at      timestamp
```

### Maintenance Requests
```
id              uuid, primary key
tenant_id       uuid → tenants
unit_id         uuid → units
title           text
description     text
category        enum: plumbing | electrical | hvac | appliance | structural | pest | other
priority        enum: low | normal | high | emergency
status          enum: new | in_review | scheduled | waiting_tenant | waiting_vendor | completed | canceled
internal_notes  text
photos          text[] (array of Storage URLs)
created_at      timestamp
updated_at      timestamp
```

### Messages
```
id              uuid, primary key
sender_id       uuid → auth.users
recipient_id    uuid → auth.users
tenant_id       uuid → tenants (for threading)
body            text
sent_at         timestamp
read_at         timestamp (nullable)
```

### Notices
```
id              uuid, primary key
type            enum: rent_reminder | late_rent | lease_renewal | entry_notice | maintenance | general
subject         text
body            text
sent_to_type    enum: tenant | property | all
tenant_id       uuid (nullable)
property_id     uuid (nullable)
document_url    text (optional)
sent_at         timestamp
```

---

## SECTION 9 — END-TO-END WORKFLOW MAP

### Workflow 1: Tenant Onboarding
```
Manager creates property
  → Manager creates unit (rent amount, status: vacant)
  → Manager creates tenant record (name, email, type)
  → Manager creates lease (unit + tenant, dates, rent)
  → Manager uploads lease PDF → marks as shared
  → Manager clicks "Invite to Portal"
  → Tenant receives email → clicks link → account activated
  → Tenant lands on dashboard → sees lease and balance
```

### Workflow 2: Monthly Rent Cycle
```
Manager creates invoice (tenant, unit, $1,800, due May 1)
  → Tenant logs in → sees invoice on dashboard
  → Tenant pays via Zelle (offline)
  → Manager records payment (method: Zelle, date, amount)
  → Manager uploads receipt
  → Invoice status → Paid
  → Tenant dashboard → balance clears → receipt appears in history
  → Manager dashboard → outstanding balance decreases
```

### Workflow 3: Maintenance Request
```
Tenant submits request (title, description, priority, optional photo)
  → Manager sees new request on dashboard
  → Manager opens request → adds internal note → changes status to In Review
  → Manager schedules repair → changes status to Scheduled
  → Repair complete → Manager marks Completed
  → Tenant logs in → sees Completed status
```

### Workflow 4: Lease Expiration
```
System (or manager) identifies lease expiring in 60 days
  → Dashboard shows warning
  → Manager sends Lease Renewal Notice
  → Tenant receives notice on portal dashboard
  → Manager and tenant agree to renew
  → Manager updates lease end date and uploads new agreement
  → Lease status → Renewed
```

---

## SECTION 10 — END-TO-END QA TEST PLAN

### Test 1: Manager Creates Property and Unit
- **Precondition:** Manager is logged in
- **Steps:** Navigate to Properties → Add Property → fill fields → save → Add Unit → fill fields → save
- **Expected:** Property and unit appear in list. Unit status = Vacant.
- **Pass criteria:** Property visible in list, unit shows correct rent and status.

### Test 2: Manager Creates Individual Tenant
- **Precondition:** Property and unit exist
- **Steps:** Navigate to Tenants → Add Tenant → select Individual → fill all fields → save
- **Expected:** Tenant record created. Visible in tenant list with all fields correct.

### Test 3: Manager Creates Company Tenant
- **Steps:** Add Tenant → select Company → fill company fields (name, contact, billing email) → save
- **Expected:** Company tenant created. Company-specific fields visible in record.

### Test 4: Manager Assigns Tenant to Unit via Lease
- **Steps:** Navigate to Leases → Create Lease → select unit → select tenant → set dates and rent → save
- **Expected:** Lease created with Active status. Unit status updates to Occupied. Tenant record shows active lease.

### Test 5: Manager Uploads Lease Document
- **Steps:** Open lease → upload PDF → mark as shared
- **Expected:** Document stored in Supabase Storage. Visible in tenant's document list.

### Test 6: Tenant Logs In and Downloads Lease
- **Precondition:** Tenant invited and account activated. Lease document shared.
- **Steps:** Tenant opens portal → navigates to Documents
- **Expected:** Lease PDF visible. Download link works. Private documents do not appear.

### Test 7: Manager Creates Rent Invoice
- **Steps:** Invoices → Create Invoice → select tenant → category: Rent → amount: $1,800 → due date → save
- **Expected:** Invoice created with status: Due. Visible in tenant dashboard.

### Test 8: Tenant Sees Invoice
- **Precondition:** Invoice created and sent
- **Steps:** Tenant logs into portal
- **Expected:** Balance section shows $1,800 due. Invoice listed with due date. Payment instructions displayed.

### Test 9: Manager Records Payment
- **Steps:** Open invoice → Record Payment → amount: $1,800 → method: Zelle → date → upload receipt → save
- **Expected:** Invoice status → Paid. Receipt stored. Payment appears in payment history.

### Test 10: Tenant Views Receipt
- **Steps:** Tenant logs in → Payment History
- **Expected:** April payment shows as Paid with downloadable receipt. Balance: $0.

### Test 11: Dashboard Outstanding Balance Updates
- **Steps:** After Test 9 completes, manager views dashboard
- **Expected:** Outstanding balance card shows $0 (or decreases by $1,800 if other balances exist).

### Test 12: Tenant Submits Maintenance Request with Photo
- **Steps:** Tenant → Submit Request → fills title, description, urgency → uploads photo → submit
- **Expected:** Request saved. Photo uploaded to Storage. Manager sees request in queue with photo.

### Test 13: Manager Updates Maintenance Status
- **Steps:** Manager opens request → changes status to In Review → adds internal note → saves
- **Expected:** Status updated. Internal note saved. Tenant sees updated status on their dashboard.

### Test 14: Manager Sends Notice
- **Steps:** Notices → Send Notice → type: General → select property → write body → send
- **Expected:** Notice created. All tenants in that property see notice on their portal dashboard.

### Test 15: Tenant Sees Notice
- **Steps:** Tenant logs in after notice sent
- **Expected:** Notice visible on dashboard with subject, body, and timestamp.

### Test 16: Manager Uploads Private Document
- **Steps:** Documents → Upload → select tenant → mark as Private (is_shared: false)
- **Expected:** Document stored. Does NOT appear in tenant's document list.

### Test 17: Tenant Cannot See Private Document
- **Steps:** Tenant logs in → Documents section
- **Expected:** Only documents with is_shared: true are visible. Private document absent.

### Test 18: Manager Uploads Shared Document
- **Steps:** Documents → Upload → select tenant → mark as Shared (is_shared: true)
- **Expected:** Document appears in tenant's portal under Documents.

### Test 19: Manager Marks Lease as Expired
- **Steps:** Leases → open lease → change status to Expired
- **Expected:** Lease status updated. Unit status updates to Vacant. Dashboard shows this unit as vacant.

### Test 20: Expiring Lease Warning on Dashboard
- **Precondition:** Lease with end date within 60 days exists
- **Steps:** Manager views dashboard
- **Expected:** Expiring leases section shows lease with property, unit, tenant name, and days remaining.

---

## SECTION 11 — SECURITY AND PERMISSIONS CHECKLIST

### Authentication
- [ ] Manager login requires valid @reyesrebollar.com email
- [ ] Tenant login via magic link tied to their email only
- [ ] Sessions expire appropriately (Supabase default: 1 hour access token, 7 days refresh)
- [ ] Sign out properly clears session
- [ ] Password reset flow works without looping

### Row Level Security (RLS)
- [ ] Tenants can only read their own tenant record
- [ ] Tenants can only see invoices assigned to their tenant_id
- [ ] Tenants can only see payments on their own invoices
- [ ] Tenants can only see documents where is_shared = true AND entity matches their tenant_id
- [ ] Tenants can only see their own maintenance requests
- [ ] Tenants can only see messages where they are sender or recipient
- [ ] Tenants cannot read other tenants' data (critical)
- [ ] Managers can read and write all records
- [ ] Admin check enforced on all manager routes (email domain check)

### Supabase Storage
- [ ] Document files in private bucket (not publicly accessible by URL)
- [ ] Signed URLs used for document downloads (expire after short period)
- [ ] Tenants can only generate signed URLs for their own shared documents
- [ ] Managers can access all documents

### Data Validation
- [ ] All form inputs validated server-side (Supabase constraints)
- [ ] Invoice amounts must be positive
- [ ] Lease end date must be after start date
- [ ] Email format validated on tenant creation
- [ ] Required fields enforced at database level

### API Keys
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY only used client-side
- [ ] SUPABASE_SERVICE_ROLE_KEY never exposed to browser or committed to git
- [ ] .env.local in .gitignore
- [ ] Environment variables set in Cloudflare Pages settings

---

## SECTION 12 — SUGGESTED IMPLEMENTATION ORDER

### Week 1 — Data Foundation
1. Create `properties` table and CRUD screens in manager panel
2. Create `units` table with property relationship and CRUD screens
3. Migrate existing 4 properties and their units from hardcoded data to database
4. Update manager dashboard to pull property and unit data from database

### Week 2 — Tenant and Lease Core
5. Expand `tenants` table with all fields
6. Build full tenant detail page in manager panel
7. Add company tenant type support
8. Create `leases` table and lease management screen
9. Connect lease to unit (unit status updates on lease creation)
10. Build tenant portal invitation flow

### Week 3 — Financial Workflow
11. Create `invoices` table and invoice creation screen
12. Create `payments` table and payment recording screen
13. Build Supabase Storage integration for receipts and documents
14. Create `documents` table with visibility controls
15. Build tenant dashboard balance and invoice view
16. Connect outstanding balance to manager dashboard stats

### Week 4 — Communication and Documents
17. Build notice system (create, send to property or tenant, display on portal)
18. Build basic messaging (manager ↔ tenant thread)
19. Add maintenance photo upload (Supabase Storage)
20. Build document management screen for manager
21. Build document list for tenant portal (shared documents only)

### Week 5 — Reports and Polish
22. Build occupancy/vacancy report (property → units → status)
23. Build rent roll report
24. Add expiring lease warnings to dashboard
25. Add overdue invoice detection and display
26. Payment history on tenant dashboard
27. End-to-end testing of all workflows

### Week 6 — QA and Hardening
28. Run full QA test plan (Section 10)
29. Fix all security gaps (Section 11)
30. Test on mobile (tenant portal especially)
31. Verify all RLS policies
32. Verify document permissions
33. Final pass on error states and edge cases

---

## SECTION 13 — RISKS AND THINGS TO AVOID

### Architecture Risk: Static Export Limitation
The current site uses `output: 'export'` for Cloudflare Pages. This means **no server-side API routes**. All Supabase calls are client-side, which is fine for most operations but means:
- Cannot use service role key safely
- Cannot process webhooks (online payments)
- Cannot run background jobs (recurring invoices)

**Mitigation:** For MVP, all required operations work client-side with RLS. For P2 features like recurring invoices and Stripe webhooks, consider Cloudflare Workers or migrating to a server runtime.

### Security Risk: Tenant Data Isolation
If RLS policies are not correct, a tenant could see another tenant's data. This is the single most critical security requirement.
**Mitigation:** Test every RLS policy explicitly. Write test scripts that authenticate as a tenant and attempt to access another tenant's records. All must return empty or error.

### Scope Creep Risk
This audit covers a lot. The temptation is to build everything at once.
**Mitigation:** Build strictly in the order defined in Section 12. Do not start Week 3 until Week 2 tests pass. Each phase should be deployable and testable independently.

### Email Reliability Risk
Supabase's free tier email is rate-limited. Tenant magic links will fail under normal usage.
**Mitigation:** Configure Titan SMTP in Supabase (reyes@reyesrebollar.com) before inviting any real tenants.

### Things to Explicitly Avoid
- Do not build online payment processing until the rest of the system is stable (P2)
- Do not build a vendor management system (not needed for this portfolio size)
- Do not build complex accounting (stick to invoices, payments, receipts)
- Do not build a public rental listing page (out of scope for MVP)
- Do not add role-based permissions beyond manager/tenant for MVP (unnecessary complexity)
- Do not build a native mobile app (responsive web is sufficient)
- Do not integrate with external accounting software for MVP (Quickbooks integration is P2+)

---

## SECTION 14 — DEFINITION OF DONE (MVP)

The MVP is complete when all of the following are true:

### Manager can:
- [ ] Log in securely with email and password
- [ ] See a dashboard that shows outstanding balances, overdue invoices, open maintenance requests, vacant units, and expiring leases
- [ ] Add, edit, and view properties and units
- [ ] Add individual and company tenants with all required fields
- [ ] Create leases assigning tenants to units with correct dates and amounts
- [ ] Upload lease documents and mark them as shared or private
- [ ] Invite a tenant to the portal and confirm the invitation was sent
- [ ] Create invoices for rent, deposits, late fees, and other charges
- [ ] Record payments against invoices with payment method and date
- [ ] Upload receipts and attach them to payments
- [ ] View a tenant's full payment history
- [ ] Upload, categorize, and manage documents per tenant/lease/property
- [ ] View and update all maintenance requests with status and internal notes
- [ ] Send notices to individual tenants or all tenants at a property
- [ ] Message a tenant and receive replies
- [ ] See which units are vacant, occupied, or expiring soon

### Tenant can:
- [ ] Receive a portal invitation email and activate their account
- [ ] Log in to their portal with their email
- [ ] See their current balance, next due date, and payment instructions
- [ ] View all open invoices with amounts and due dates
- [ ] View payment history and download receipts
- [ ] Download their lease agreement and other shared documents
- [ ] Submit maintenance requests with description, urgency, and optional photo
- [ ] Track the status of their maintenance requests
- [ ] View notices from the manager
- [ ] Send a message to the manager and receive replies
- [ ] Update their own contact information

### System:
- [ ] RLS enforced — tenants cannot see each other's data
- [ ] Documents properly gated by visibility setting
- [ ] No sensitive keys exposed client-side
- [ ] Works on mobile browsers
- [ ] No critical errors in production console
- [ ] All test cases in Section 10 pass

---

*Document prepared for Reyes Rebollar Properties LLC — April 2026*
*Internal use only*
