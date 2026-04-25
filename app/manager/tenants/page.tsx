"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TenantType = "individual" | "company";

type Tenant = {
  id: string;
  tenant_type: TenantType;
  full_name: string | null;
  company_name: string | null;
  email: string;
  phone: string | null;
  mailing_address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  billing_email: string | null;
  notes: string | null;
  status: string;
  portal_invited_at: string | null;
  created_at: string;
};

const EMPTY_FORM = {
  type: "individual" as TenantType,
  first_name: "", last_name: "",
  company_name: "", contact_name: "",
  email: "", phone: "",
  mailing_address: "",
  emergency_contact_name: "", emergency_contact_phone: "",
  billing_email: "", notes: "",
};

const TYPE_BADGE: Record<string, string> = {
  individual: "text-blue-700 bg-blue-50 border-blue-200",
  company:    "text-purple-700 bg-purple-50 border-purple-200",
};

export default function TenantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || !session.user.email?.endsWith("@reyesrebollar.com")) {
        router.replace("/manager/login"); return;
      }
      fetchTenants();
    });
  }, [router]);

  const fetchTenants = async () => {
    const { data } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });
    setTenants((data as Tenant[]) ?? []);
    setLoading(false);
  };

  const f = (key: keyof typeof form, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const displayName = (t: Tenant) =>
    t.tenant_type === "company" ? (t.company_name ?? t.email) : (t.full_name ?? t.email);

  const selected = tenants.find((t) => t.id === selectedId);

  const filtered = tenants.filter((t) => {
    const q = search.toLowerCase();
    return (
      displayName(t).toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);

    const payload =
      form.type === "individual"
        ? {
            tenant_type: "individual",
            full_name: `${form.first_name.trim()} ${form.last_name.trim()}`.trim(),
            email: form.email.trim(),
            phone: form.phone || null,
            mailing_address: form.mailing_address || null,
            emergency_contact_name: form.emergency_contact_name || null,
            emergency_contact_phone: form.emergency_contact_phone || null,
            billing_email: null,
            company_name: null,
            notes: form.notes || null,
            status: "active",
          }
        : {
            tenant_type: "company",
            full_name: form.contact_name.trim(),
            company_name: form.company_name.trim(),
            email: form.email.trim(),
            phone: form.phone || null,
            billing_email: form.billing_email || form.email,
            mailing_address: form.mailing_address || null,
            emergency_contact_name: null,
            emergency_contact_phone: null,
            notes: form.notes || null,
            status: "active",
          };

    const { error } = await supabase.from("tenants").insert(payload);
    if (error) {
      setError(error.message.includes("unique") ? "A tenant with this email already exists." : error.message);
    } else {
      setShowForm(false);
      setForm(EMPTY_FORM);
      setSuccess("Tenant added successfully.");
      await fetchTenants();
    }
    setSaving(false);
  };

  const handleInvite = async (tenant: Tenant) => {
    setInviting(true); setError(null); setSuccess(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: tenant.email,
      options: { emailRedirectTo: "https://reyesrebollar.com/portal/dashboard" },
    });
    if (error) {
      setError(`Invite failed: ${error.message}`);
    } else {
      await supabase.from("tenants")
        .update({ portal_invited_at: new Date().toISOString() })
        .eq("id", tenant.id);
      await fetchTenants();
      setSuccess(`Portal invite sent to ${tenant.email}`);
    }
    setInviting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-12 max-w-5xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[0.62rem] tracking-[0.2em] uppercase text-terracotta mb-2">Management</p>
            <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
              Tenants
            </h1>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null); }}
            className="text-xs tracking-[0.12em] uppercase bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            {showForm ? "Cancel" : "+ Add Tenant"}
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-4 py-3 rounded-lg mb-5">
            {success}
          </div>
        )}

        {/* Add Tenant Form */}
        {showForm && (
          <form onSubmit={handleSave} className="bg-card border border-border/50 rounded-xl p-6 mb-6">
            {/* Type toggle */}
            <div className="flex gap-2 mb-6">
              {(["individual", "company"] as TenantType[]).map((t) => (
                <button key={t} type="button"
                  onClick={() => f("type", t)}
                  className={`px-4 py-2 rounded-lg text-xs tracking-[0.1em] uppercase font-medium border transition-colors ${
                    form.type === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border/60 text-muted-foreground hover:text-foreground"
                  }`}>
                  {t === "individual" ? "Individual" : "Company"}
                </button>
              ))}
            </div>

            {form.type === "individual" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First Name *" value={form.first_name} onChange={(v) => f("first_name", v)} placeholder="Jane" required />
                <Field label="Last Name *" value={form.last_name} onChange={(v) => f("last_name", v)} placeholder="Doe" required />
                <Field label="Email *" type="email" value={form.email} onChange={(v) => f("email", v)} placeholder="jane@example.com" required />
                <Field label="Phone" value={form.phone} onChange={(v) => f("phone", v)} placeholder="(619) 555-0100" />
                <Field label="Mailing Address" value={form.mailing_address} onChange={(v) => f("mailing_address", v)} placeholder="123 Main St, El Cajon CA" />
                <Field label="Emergency Contact Name" value={form.emergency_contact_name} onChange={(v) => f("emergency_contact_name", v)} placeholder="John Doe" />
                <Field label="Emergency Contact Phone" value={form.emergency_contact_phone} onChange={(v) => f("emergency_contact_phone", v)} placeholder="(619) 555-0199" />
                <Field label="Notes" value={form.notes} onChange={(v) => f("notes", v)} placeholder="Internal notes (not visible to tenant)" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Company Name *" value={form.company_name} onChange={(v) => f("company_name", v)} placeholder="Acme Corp LLC" required />
                <Field label="Primary Contact Name *" value={form.contact_name} onChange={(v) => f("contact_name", v)} placeholder="Jane Doe" required />
                <Field label="Contact Email *" type="email" value={form.email} onChange={(v) => f("email", v)} placeholder="jane@company.com" required />
                <Field label="Contact Phone" value={form.phone} onChange={(v) => f("phone", v)} placeholder="(619) 555-0100" />
                <Field label="Billing Email" type="email" value={form.billing_email} onChange={(v) => f("billing_email", v)} placeholder="billing@company.com" />
                <Field label="Mailing / Billing Address" value={form.mailing_address} onChange={(v) => f("mailing_address", v)} placeholder="123 Main St, El Cajon CA" />
                <Field label="Notes" value={form.notes} onChange={(v) => f("notes", v)} placeholder="Internal notes" />
              </div>
            )}

            {error && <p className="text-xs text-red-600 mt-4">{error}</p>}
            <div className="flex justify-end mt-5">
              <button type="submit" disabled={saving}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-xs tracking-[0.1em] uppercase hover:opacity-90 transition-opacity disabled:opacity-40">
                {saving ? "Saving…" : "Add Tenant"}
              </button>
            </div>
          </form>
        )}

        <div className="grid md:grid-cols-5 gap-6">

          {/* Tenant List */}
          <div className="md:col-span-2">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tenants…"
              className="w-full bg-card border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 mb-3 transition-colors"
            />

            {filtered.length === 0 ? (
              <div className="bg-card border border-border/50 rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {tenants.length === 0 ? "No tenants yet." : "No results found."}
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40 overflow-hidden">
                {filtered.map((t) => (
                  <button key={t.id}
                    onClick={() => { setSelectedId(t.id); setSuccess(null); setError(null); }}
                    className={`w-full text-left px-4 py-4 transition-colors hover:bg-muted/50 ${selectedId === t.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{displayName(t)}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{t.email}</p>
                      </div>
                      <span className={`text-[0.55rem] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full border flex-shrink-0 ${TYPE_BADGE[t.tenant_type]}`}>
                        {t.tenant_type}
                      </span>
                    </div>
                    {!t.portal_invited_at && (
                      <p className="text-[0.6rem] text-amber-600 mt-1.5">Portal not invited</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tenant Detail */}
          <div className="md:col-span-3">
            {!selected ? (
              <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
                <p className="text-sm text-muted-foreground">Select a tenant to view their profile.</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Profile */}
                <div className="bg-card border border-border/50 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-base font-semibold text-foreground">{displayName(selected)}</h2>
                        <span className={`text-[0.55rem] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full border ${TYPE_BADGE[selected.tenant_type]}`}>
                          {selected.tenant_type}
                        </span>
                      </div>
                      {selected.tenant_type === "company" && selected.full_name && (
                        <p className="text-xs text-muted-foreground">Contact: {selected.full_name}</p>
                      )}
                    </div>
                    <span className={`text-[0.58rem] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full border ${selected.status === "active" ? "text-green-700 bg-green-50 border-green-200" : "text-gray-600 bg-gray-50 border-gray-200"}`}>
                      {selected.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <InfoRow label="Email" value={selected.email} />
                    {selected.phone && <InfoRow label="Phone" value={selected.phone} />}
                    {selected.mailing_address && <InfoRow label="Address" value={selected.mailing_address} />}
                    {selected.billing_email && selected.billing_email !== selected.email && (
                      <InfoRow label="Billing Email" value={selected.billing_email} />
                    )}
                    {selected.emergency_contact_name && (
                      <InfoRow label="Emergency Contact"
                        value={`${selected.emergency_contact_name}${selected.emergency_contact_phone ? ` · ${selected.emergency_contact_phone}` : ""}`} />
                    )}
                  </div>

                  {selected.notes && (
                    <div className="mt-4 pt-4 border-t border-border/40">
                      <p className="text-[0.6rem] uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
                      <p className="text-xs text-muted-foreground">{selected.notes}</p>
                    </div>
                  )}
                </div>

                {/* Portal Access */}
                <div className="bg-card border border-border/50 rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Tenant Portal
                  </p>
                  {selected.portal_invited_at ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-700 font-medium">Invite sent</p>
                        <p className="text-[0.65rem] text-muted-foreground mt-0.5">
                          {new Date(selected.portal_invited_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleInvite(selected)}
                        disabled={inviting}
                        className="text-[0.62rem] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-border/50 pb-0.5 disabled:opacity-40">
                        {inviting ? "Sending…" : "Resend invite"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Tenant has not been invited yet.</p>
                      <button
                        onClick={() => handleInvite(selected)}
                        disabled={inviting}
                        className="text-xs tracking-[0.1em] uppercase bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40">
                        {inviting ? "Sending…" : "Send Portal Invite"}
                      </button>
                    </div>
                  )}
                  {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                  {success && <p className="text-xs text-green-700 mt-2">{success}</p>}
                </div>

                {/* Upcoming sections */}
                <div className="bg-card border border-border/50 rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Lease</p>
                  <p className="text-xs text-muted-foreground">Lease management available in Phase 3.</p>
                </div>

                <div className="bg-card border border-border/50 rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Invoices & Payments</p>
                  <p className="text-xs text-muted-foreground">Invoices available in Phase 4.</p>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required = false }: {
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-2 border-b border-border/30 last:border-0">
      <span className="text-[0.6rem] uppercase tracking-wide text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-xs text-foreground text-right">{value}</span>
    </div>
  );
}
