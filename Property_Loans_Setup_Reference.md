# Property Loans — Setup Reference
*Created: April 29, 2026*

---

## Google Drive Folder Structure (Live)

All folders created in your Google Drive under **My Drive → property_loans**

```
property_loans/
├── 1107_Greenfield/
│   ├── 3J_PML/                          ← $475K loan, 1st pmt March 2026
│   └── Loan_2_TBD/                      ← rename when lender confirmed
├── 1227_N_1st_St/
│   └── Citadel/
├── 1321_Oro_St/
│   └── Roger_Berger_Private/            ← ~3% owner carry – confirm rate
├── 12345_Moreno_Ave_Lakeside/
│   └── Shellpoint/
├── 1103_Persimmon_Ave/
│   ├── KOI_Private/
│   └── Bank_Loan/                       ← confirm bank name
├── 1237_N_1st_St/
│   └── Refi_securing_1107_Greenfield/   ← refi proceeds used for 1107 acquisition
└── Property Loans Tracker  [Google Sheet]
```

---

## Google Sheet: "Property Loans Tracker"

Link: https://docs.google.com/spreadsheets/d/13ETkAtgC6QAQqA1jXRj4YZd02MhvysVioLrqT63_mg4/edit

### Recommended Tab Structure

| Tab Name | Purpose |
|---|---|
| **📊 Overview** | Master loan summary — all 8 loans at a glance |
| **💳 Payment Log** | Running log of every payment made across all loans |
| **1107 Greenfield** | Payment schedule + detail for both loans |
| **1227 N 1st St** | Payment schedule — Citadel |
| **1321 Oro St** | Payment schedule — Roger Berger |
| **12345 Moreno Ave** | Payment schedule — Shellpoint |
| **1103 Persimmon Ave** | Payment schedule — KOI + Bank |
| **1237 N 1st St** | Refi tracking |

---

## Overview Tab — Column Template

Set up Row 1 as headers:

| Col | Header | Notes |
|---|---|---|
| A | Property Address | |
| B | Lender | |
| C | Loan Type | e.g. Private, Institutional, Owner Carry, Refi |
| D | Original Loan Amount | |
| E | Interest Rate | |
| F | Monthly Payment | |
| G | Loan Start Date | |
| H | Maturity Date | |
| I | Current Balance | |
| J | Next Payment Due | |
| K | Payment Status | Active / Late / Paid Off |
| L | Notes | |
| M | Drive Folder Link | Paste folder URL |

### Pre-filled Data (copy into Overview tab)

| Property | Lender | Type | Amount | Rate | Pmt | Start | Maturity | Balance | Next Due | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1107 Greenfield | 3J PML | Hard Money / Private | $475,000 | TBD | TBD | TBD | TBD | $475,000 | April/May 2026 | Active | 1st pmt March 2026 — Zelle info in doc |
| 1107 Greenfield | TBD (Loan 2) | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | Active | Second loan — fill in lender |
| 1227 N 1st St | Citadel | Institutional | TBD | TBD | TBD | TBD | TBD | TBD | TBD | Active | |
| 1321 Oro St | Roger Berger | Private / Owner Carry | TBD | ~3% | TBD | TBD | TBD | TBD | TBD | Active | Confirm exact rate with Roger |
| 12345 Moreno Ave, Lakeside CA | Shellpoint | Institutional | $700,000 | 8.125% | $5,852.98/mo | Feb 2024 | ~Jan 2054 | $687,030.31 | May 2026 | Active | P&I: $5,197.48 · Tax/Ins/PMI: $655.50 |
| 1103 Persimmon Ave | KOI | Private | TBD | TBD | TBD | TBD | TBD | TBD | TBD | Active | |
| 1103 Persimmon Ave | TBD (Bank) | Institutional | TBD | TBD | TBD | TBD | TBD | TBD | TBD | Active | Confirm bank name |
| 1237 N 1st St | Refi → 1107 Greenfield | Refinance | TBD | TBD | TBD | TBD | TBD | TBD | TBD | Active | Proceeds used to acquire 1107 Greenfield |

---

## Payment Log Tab — Column Template

Each row = one payment made

| Col | Header |
|---|---|
| A | Date Paid |
| B | Property |
| C | Lender |
| D | Amount Paid |
| E | Principal Portion |
| F | Interest Portion |
| G | Remaining Balance |
| H | Payment Method (Check / Zelle / ACH) |
| I | Confirmation # |
| J | Notes |

---

## Outstanding Items (To Confirm)

- [ ] 1107 Greenfield — Loan 2 lender name + all terms
- [ ] 1107 Greenfield — 3J PML interest rate and full payment schedule
- [ ] 1227 N 1st St (Citadel) — loan amount, rate, payment, maturity
- [ ] 1321 Oro St (Roger Berger) — confirm exact interest rate (quoted ~3%)
- [x] 12345 Moreno Ave (Shellpoint) — ✅ CONFIRMED: $700K @ 8.125%, $5,852.98/mo, started Feb 2024, balance $687,030.31 as of April 2026
- [ ] 12345 Moreno Ave (Shellpoint) — upload amortization CSV to Google Drive → 12345_Moreno_Ave_Lakeside → Shellpoint
- [ ] 1103 Persimmon Ave (KOI) — all terms
- [ ] 1103 Persimmon Ave — confirm bank lender name + terms
- [ ] 1237 N 1st St — refi terms and how it ties to 1107 Greenfield
- [ ] Upload 1st payment doc to: Google Drive → property_loans → 1107_Greenfield → 3J_PML

---

## 12345 Moreno Ave — Shellpoint Loan Detail (Confirmed)

| Field | Value |
|---|---|
| Lender | Shellpoint |
| Original Balance | $700,000 |
| Interest Rate | 8.125% |
| Monthly Total | $5,852.98 |
| → P&I | $5,197.48 |
| → Tax / Ins / PMI | $655.50 |
| First Payment | February 2024 |
| Est. Payoff | ~January 2054 (30-yr) |
| Balance — Feb 2024 | $700,000.00 |
| Balance — Apr 2026 | $687,030.31 |
| Balance — May 2026 | $686,484.59 |
| Balance — Dec 2026 | $682,559.74 |

**Upcoming payments (2026):**

| Month | Principal | Interest | Tax/Ins/PMI | Total | Ending Balance |
|---|---|---|---|---|---|
| May 2026 | $549.41 | $4,648.07 | $655.50 | $5,852.98 | $686,484.59 |
| Jun 2026 | $553.13 | $4,644.35 | $655.50 | $5,852.98 | $685,935.19 |
| Jul 2026 | $556.87 | $4,640.61 | $655.50 | $5,852.98 | $685,382.06 |
| Aug 2026 | $560.64 | $4,636.84 | $655.50 | $5,852.98 | $684,825.19 |
| Sep 2026 | $564.44 | $4,633.04 | $655.50 | $5,852.98 | $684,264.55 |
| Oct 2026 | $568.26 | $4,629.22 | $655.50 | $5,852.98 | $683,700.11 |
| Nov 2026 | $572.11 | $4,625.37 | $655.50 | $5,852.98 | $683,131.85 |
| Dec 2026 | $575.98 | $4,621.50 | $655.50 | $5,852.98 | $682,559.74 |

Full amortization file: `Pagos - creditos 2024 - 12345Moreno.csv` → upload to Google Drive: Shellpoint folder

---

## Notes

- The uploaded file "1st pymt-Reyes-Rebollar-3J-PML-w-Zelle info $475K 3-2026.doc" contains 
  Zelle payment instructions for the 3J PML loan. Upload it manually to the 3J_PML folder.
- The local `/Documents/property_loans/` folder can be created by running this in Terminal:
  ```bash
  mkdir -p ~/Documents/property_loans/{1107_Greenfield/{3J_PML,Loan_2_TBD},1227_N_1st_St/Citadel,1321_Oro_St/Roger_Berger_Private,12345_Moreno_Ave_Lakeside/Shellpoint,1103_Persimmon_Ave/{KOI_Private,Bank_Loan},1237_N_1st_St/Refi_securing_1107_Greenfield}
  ```
