"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Payment = {
  id: string;
  invoice_id: string;
  amount_paid: number;
  paid_at: string;
  method: string;
  notes: string | null;
  receipt_path: string | null;
  created_at: string;
};

type Invoice = {
  id: string;
  tenant_id: string;
  lease_id: string | null;
  unit_id: string | null;
  amount: number;
  due_date: string;
  category: string;
  status: string;
  description: string | null;
  created_at: string;
  tenants: { full_name: string | null; company_name: string | null; tenant_type: string; email: string } | null;
  units: { unit_number: string; properties: { name: string } | null } | null;
  payments: Payment[];
};

type TenantOpt = { id: string; full_name: string | null; company_name: string | null; tenant_type: string; email: string };
type LeaseOpt  = { id: string; tenant_id: string; unit_id: string; rent_amount: number; units: { unit_number: string } | null };

const STATUS_STYLE: Record<string, string> = {
  draft:          "text-gray-600 bg-gray-50 border-gray-200",
  due:            "text-blue-700 bg-blue-50 border-blue-200",
  overdue:        "text-red-700 bg-red-50 border-red-200",
  paid:           "text-green-700 bg-green-50 border-green-200",
  partially_paid: "text-amber-700 bg-amber-50 border-amber-200",
  canceled:       "text-gray-500 bg-gray-50 border-gray-200",
};
const STATUS_LABEL: Record<string, string> = {
  draft: "Draft", due: "Due", overdue: "Overdue",
  paid: "Paid", partially_paid: "Partial", canceled: "Canceled",
};
const CATEGORY_LABEL: Record<string, string> = {
  rent: "Rent", deposit: "Deposit", late_fee: "Late Fee",
  utility: "Utility", repair: "Repair", other: "Other",
};

function invoiceDisplayStatus(inv: Invoice): string {
  if (inv.status === "due" && new Date(inv.due_date) < new Date()) return "overdue";
  return inv.status;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const today = () => new Date().toISOString().split("T")[0];

const EMPTY_INV = { tenant_id: "", lease_id: "", category: "rent", amount: "", due_date: today(), description: "" };
const EMPTY_PAY = { amount_paid: "", paid_at: today(), method: "zelle", notes: "" };

export default function InvoicesPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tenants, setTenants] = useState<TenantOpt[]>([]);
  const [leases, setLeases] = useState<LeaseOpt[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [showInvForm, setShowInvForm] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [invForm, setInvForm] = useState(EMPTY_INV);
  const [payForm, setPayForm] = useState(EMPTY_PAY);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || !session.user.email?.endsWith("@reyesrebollar.com")) {
        router.replace("/manager/login"); return;
      }
      loadAll();
    });
  }, [router]);

  const loadAll = async () => {
    const [{ data: invs }, { data: ts }, { data: ls }] = await Promise.all([
      supabase.from("invoices")
        .select("*, tenants(full_name, company_name, tenant_type, email), units(unit_number, properties(name)), payments(*)")
        .order("due_date", { ascending: false }),
      supabase.from("tenants").select("id, full_name, company_name, tenant_type, email").eq("status", "active").order("full_name"),
      supabase.from("leases").select("id, tenant_id, unit_id, rent_amount, units(unit_number)").eq("status", "active"),
    ]);
    setInvoices((invs as Invoice[]) ?? []);
    setTenants(ts ?? []);
    setLeases((ls as unknown as LeaseOpt[]) ?? []);
    setLoading(false);
  };

  const tenantName = (t: TenantOpt) => t.tenant_type === "company" ? (t.company_name ?? t.email) : (t.full_name ?? t.email);

  const invf = (k: keyof typeof invForm, v: string) =>
    setInvForm((p) => {
      const next = { ...p, [k]: v };
      if (k === "tenant_id") next.lease_id = "";
      if (k === "lease_id" && next.category === "rent") {
        const l = leases.find((l) => l.id === v);
        if (l) next.amount = l.rent_amount.toString();
      }
      if (k === "category" && v === "rent") {
        const l = leases.find((l) => l.id === p.lease_id);
        if (l) next.amount = l.rent_amount.toString();
      }
      return next;
    });

  const tenantLeases = leases.filter((l) => l.tenant_id === invForm.tenant_id);
  const selectedLease = leases.find((l) => l.id === invForm.lease_id);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    const { error } = await supabase.from("invoices").insert({
      tenant_id: invForm.tenant_id,
      lease_id: invForm.lease_id || null,
      unit_id: selectedLease?.unit_id || null,
      amount: parseFloat(invForm.amount),
      due_date: invForm.due_date,
      category: invForm.category,
      description: invForm.description || null,
      status: "due",
    });
    if (error) { setError(error.message); }
    else { setShowInvForm(false); setInvForm(EMPTY_INV); await loadAll(); }
    setSaving(false);
  };

  const selected = invoices.find((i) => i.id === selectedId);
  const totalPaid = selected?.payments.reduce((s, p) => s + p.amount_paid, 0) ?? 0;
  const remaining = selected ? selected.amount - totalPaid : 0;

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setPaying(true); setPayError(null);

    const paidAmt = parseFloat(payForm.amount_paid);
    if (paidAmt > remaining) {
      setPayError(`Amount cannot exceed remaining balance of ${fmt(remaining)}.`);
      setPaying(false); return;
    }

    let receipt_path: string | null = null;
    if (receiptFile) {
      const path = `receipts/${selected.id}/${Date.now()}-${receiptFile.name.replace(/\s/g, "_")}`;
      const { data: up } = await supabase.storage.from("documents").upload(path, receiptFile);
      if (up) receipt_path = up.path;
    }

    const { error } = await supabase.from("payments").insert({
      invoice_id: selected.id,
      amount_paid: paidAmt,
      paid_at: payForm.paid_at,
      method: payForm.method,
      notes: payForm.notes || null,
      receipt_path,
    });

    if (error) { setPayError(error.message); setPaying(false); return; }

    const newTotal = totalPaid + paidAmt;
    const newStatus = newTotal >= selected.amount ? "paid" : "partially_paid";
    await supabase.from("invoices").update({ status: newStatus }).eq("id", selected.id);

    setShowPayForm(false);
    setPayForm(EMPTY_PAY);
    setReceiptFile(null);
    if (fileRef.current) fileRef.current.value = "";
    await loadAll();
    setPaying(false);
  };

  const handleDownloadReceipt = async (path: string) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const outstanding = invoices
    .filter((i) => i.status !== "paid" && i.status !== "canceled" && i.status !== "draft")
    .reduce((s, i) => s + i.amount - (i.payments?.reduce((ps, p) => ps + p.amount_paid, 0) ?? 0), 0);

  const overdueCount = invoices.filter((i) => invoiceDisplayStatus(i) === "overdue").length;

  const filtered = invoices.filter((i) => {
    if (filter === "all") return true;
    if (filter === "overdue") return invoiceDisplayStatus(i) === "overdue";
    return invoiceDisplayStatus(i) === filter;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-12 max-w-5xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[0.62rem] tracking-[0.2em] uppercase text-terracotta mb-2">Financials</p>
            <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>Invoices</h1>
          </div>
          <button onClick={() => { setShowInvForm(!showInvForm); setError(null); }}
            className="text-xs tracking-[0.12em] uppercase bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            {showInvForm ? "Cancel" : "+ Create Invoice"}
          </button>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <p className="text-[0.58rem] uppercase tracking-wide text-muted-foreground mb-1">Outstanding</p>
            <p className="text-xl font-bold text-foreground">{fmt(outstanding)}</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <p className="text-[0.58rem] uppercase tracking-wide text-muted-foreground mb-1">Overdue</p>
            <p className={`text-xl font-bold ${overdueCount > 0 ? "text-red-600" : "text-foreground"}`}>{overdueCount}</p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-4">
            <p className="text-[0.58rem] uppercase tracking-wide text-muted-foreground mb-1">Total Invoices</p>
            <p className="text-xl font-bold text-foreground">{invoices.length}</p>
          </div>
        </div>

        {/* Create Invoice Form */}
        {showInvForm && (
          <form onSubmit={handleCreateInvoice} className="bg-card border border-border/50 rounded-xl p-6 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">New Invoice</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Tenant *</label>
                <select value={invForm.tenant_id} required onChange={(e) => invf("tenant_id", e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
                  <option value="">Select tenant…</option>
                  {tenants.map((t) => <option key={t.id} value={t.id}>{tenantName(t)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Lease / Unit</label>
                <select value={invForm.lease_id} onChange={(e) => invf("lease_id", e.target.value)}
                  disabled={!invForm.tenant_id}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 disabled:opacity-50">
                  <option value="">No lease (or select)</option>
                  {tenantLeases.map((l) => <option key={l.id} value={l.id}>{l.units?.unit_number} — {fmt(l.rent_amount)}/mo</option>)}
                </select>
              </div>
              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Category *</label>
                <select value={invForm.category} required onChange={(e) => invf("category", e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
                  {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <SField label="Amount *" type="number" value={invForm.amount} onChange={(v) => invf("amount", v)} placeholder="1800" required />
              <SField label="Due Date *" type="date" value={invForm.due_date} onChange={(v) => invf("due_date", v)} required />
              <SField label="Description" value={invForm.description} onChange={(v) => invf("description", v)} placeholder="Optional note shown to tenant" />
            </div>
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={saving}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-xs tracking-[0.1em] uppercase hover:opacity-90 transition-opacity disabled:opacity-40">
                {saving ? "Creating…" : "Create Invoice"}
              </button>
            </div>
          </form>
        )}

        {/* Filter tabs */}
        <div className="flex gap-5 mb-4 border-b border-border/40 pb-4">
          {[["all", "All"], ["due", "Due"], ["overdue", "Overdue"], ["paid", "Paid"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`text-[0.62rem] tracking-[0.14em] uppercase pb-0.5 transition-colors ${filter === val ? "text-foreground border-b border-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {label}
              <span className="ml-1.5 opacity-50">
                ({val === "all" ? invoices.length : invoices.filter(i => invoiceDisplayStatus(i) === val).length})
              </span>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-6">

          {/* Invoice List */}
          <div className="md:col-span-2">
            {filtered.length === 0 ? (
              <div className="bg-card border border-border/50 rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">No invoices found.</p>
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40 overflow-hidden">
                {filtered.map((inv) => {
                  const ds = invoiceDisplayStatus(inv);
                  const tName = inv.tenants?.tenant_type === "company" ? inv.tenants.company_name : inv.tenants?.full_name;
                  return (
                    <button key={inv.id} onClick={() => { setSelectedId(inv.id); setShowPayForm(false); }}
                      className={`w-full text-left px-4 py-4 transition-colors hover:bg-muted/50 ${selectedId === inv.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground truncate">{tName ?? inv.tenants?.email}</p>
                        <span className={`text-[0.55rem] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_STYLE[ds]}`}>
                          {STATUS_LABEL[ds]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[inv.category]} · {fmt(inv.amount)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Due {fmtDate(inv.due_date)}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Invoice Detail */}
          <div className="md:col-span-3">
            {!selected ? (
              <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
                <p className="text-sm text-muted-foreground">Select an invoice to view details and record payments.</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Invoice Info */}
                <div className="bg-card border border-border/50 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        {selected.tenants?.tenant_type === "company" ? selected.tenants.company_name : selected.tenants?.full_name ?? selected.tenants?.email}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selected.units?.properties?.name && `${selected.units.properties.name} · `}
                        {selected.units?.unit_number && `${selected.units.unit_number} · `}
                        {CATEGORY_LABEL[selected.category]}
                      </p>
                    </div>
                    <span className={`text-[0.58rem] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full border ${STATUS_STYLE[invoiceDisplayStatus(selected)]}`}>
                      {STATUS_LABEL[invoiceDisplayStatus(selected)]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[0.58rem] uppercase tracking-wide text-muted-foreground mb-0.5">Invoice Amount</p><p className="text-lg font-bold text-foreground">{fmt(selected.amount)}</p></div>
                    <div><p className="text-[0.58rem] uppercase tracking-wide text-muted-foreground mb-0.5">Remaining</p><p className={`text-lg font-bold ${remaining > 0 ? "text-red-600" : "text-green-700"}`}>{fmt(remaining)}</p></div>
                    <div><p className="text-[0.58rem] uppercase tracking-wide text-muted-foreground mb-0.5">Due Date</p><p className="text-sm font-medium text-foreground">{fmtDate(selected.due_date)}</p></div>
                    <div><p className="text-[0.58rem] uppercase tracking-wide text-muted-foreground mb-0.5">Total Paid</p><p className="text-sm font-medium text-green-700">{fmt(totalPaid)}</p></div>
                  </div>
                  {selected.description && <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/40">{selected.description}</p>}
                </div>

                {/* Payment History */}
                <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payments</p>
                    {remaining > 0 && (
                      <button onClick={() => { setShowPayForm(!showPayForm); setPayError(null); setPayForm({ ...EMPTY_PAY, amount_paid: remaining.toString() }); }}
                        className="text-[0.62rem] tracking-[0.1em] uppercase text-primary hover:opacity-70 transition-opacity">
                        {showPayForm ? "Cancel" : "+ Record Payment"}
                      </button>
                    )}
                  </div>

                  {showPayForm && (
                    <form onSubmit={handleRecordPayment} className="p-5 border-b border-border/40 bg-muted/20 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <SField label="Amount Paid *" type="number" value={payForm.amount_paid} onChange={(v) => setPayForm(p => ({ ...p, amount_paid: v }))} placeholder={remaining.toString()} required />
                        <SField label="Date *" type="date" value={payForm.paid_at} onChange={(v) => setPayForm(p => ({ ...p, paid_at: v }))} required />
                      </div>
                      <div>
                        <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Method *</label>
                        <select value={payForm.method} onChange={(e) => setPayForm(p => ({ ...p, method: e.target.value }))}
                          className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
                          {[["zelle","Zelle"],["venmo","Venmo"],["check","Check"],["cash","Cash"],["bank_transfer","Bank Transfer"],["money_order","Money Order"],["other","Other"]].map(([v,l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      </div>
                      <SField label="Notes" value={payForm.notes} onChange={(v) => setPayForm(p => ({ ...p, notes: v }))} placeholder="Optional notes" />
                      <div>
                        <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Receipt (optional)</label>
                        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                          className="w-full text-sm text-foreground file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                      </div>
                      {payError && <p className="text-xs text-red-600">{payError}</p>}
                      <div className="flex justify-end">
                        <button type="submit" disabled={paying}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs tracking-[0.1em] uppercase hover:opacity-90 transition-opacity disabled:opacity-40">
                          {paying ? "Recording…" : "Record Payment"}
                        </button>
                      </div>
                    </form>
                  )}

                  {selected.payments.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {selected.payments.map((p) => (
                        <div key={p.id} className="px-5 py-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-green-700">{fmt(p.amount_paid)}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {fmtDate(p.paid_at)} · {p.method.replace("_", " ")}
                              {p.notes && ` · ${p.notes}`}
                            </p>
                          </div>
                          {p.receipt_path && (
                            <button onClick={() => handleDownloadReceipt(p.receipt_path!)}
                              className="text-[0.6rem] tracking-[0.1em] uppercase text-primary border border-primary/30 px-2.5 py-1 rounded-lg hover:bg-primary/5 transition-colors flex-shrink-0">
                              Receipt
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SField({ label, value, onChange, placeholder, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors" />
    </div>
  );
}
