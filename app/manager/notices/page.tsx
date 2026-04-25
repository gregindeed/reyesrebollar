"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Notice = {
  id: string;
  type: string;
  subject: string;
  body: string;
  sent_to_type: string;
  property_id: string | null;
  tenant_id: string | null;
  sent_at: string;
  properties?: { name: string } | null;
  tenants?: { full_name: string | null; company_name: string | null; tenant_type: string; email: string } | null;
};

const TYPE_LABEL: Record<string, string> = {
  general: "General", rent_reminder: "Rent Reminder", late_rent: "Late Rent",
  lease_renewal: "Lease Renewal", entry_notice: "Entry Notice", maintenance: "Maintenance",
};

const TYPE_STYLE: Record<string, string> = {
  general:       "text-gray-600 bg-gray-50 border-gray-200",
  rent_reminder: "text-blue-700 bg-blue-50 border-blue-200",
  late_rent:     "text-red-700 bg-red-50 border-red-200",
  lease_renewal: "text-amber-700 bg-amber-50 border-amber-200",
  entry_notice:  "text-purple-700 bg-purple-50 border-purple-200",
  maintenance:   "text-orange-700 bg-orange-50 border-orange-200",
};

const SENT_TO_LABEL: Record<string, string> = {
  all: "All Tenants", property: "Property", tenant: "Individual Tenant",
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const EMPTY_FORM = {
  type: "general", subject: "", body: "",
  sent_to_type: "all", tenant_id: "", property_id: "",
};

export default function NoticesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [tenants, setTenants] = useState<{ id: string; full_name: string | null; company_name: string | null; tenant_type: string; email: string }[]>([]);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || !session.user.email?.endsWith("@reyesrebollar.com")) {
        router.replace("/manager/login"); return;
      }
      loadAll();
    });
  }, [router]);

  const loadAll = async () => {
    const [{ data: ns }, { data: ts }, { data: ps }] = await Promise.all([
      supabase.from("notices")
        .select("*, properties(name), tenants(full_name, company_name, tenant_type, email)")
        .order("sent_at", { ascending: false }),
      supabase.from("tenants").select("id, full_name, company_name, tenant_type, email").eq("status", "active").order("full_name"),
      supabase.from("properties").select("id, name").order("name"),
    ]);
    setNotices((ns as Notice[]) ?? []);
    setTenants(ts ?? []);
    setProperties(ps ?? []);
    setLoading(false);
  };

  const tenantName = (t: typeof tenants[0]) =>
    t.tenant_type === "company" ? (t.company_name ?? t.email) : (t.full_name ?? t.email);

  const f = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);

    if (form.sent_to_type === "tenant" && !form.tenant_id) {
      setError("Please select a tenant."); setSaving(false); return;
    }
    if (form.sent_to_type === "property" && !form.property_id) {
      setError("Please select a property."); setSaving(false); return;
    }

    const { error } = await supabase.from("notices").insert({
      type: form.type,
      subject: form.subject,
      body: form.body,
      sent_to_type: form.sent_to_type,
      tenant_id: form.sent_to_type === "tenant" ? form.tenant_id : null,
      property_id: form.sent_to_type === "property" ? form.property_id : null,
    });

    if (error) { setError(error.message); }
    else { setShowForm(false); setForm(EMPTY_FORM); await loadAll(); }
    setSaving(false);
  };

  const getSentToLabel = (n: Notice): string => {
    if (n.sent_to_type === "all") return "All Tenants";
    if (n.sent_to_type === "property" && n.properties) return `Property: ${n.properties.name}`;
    if (n.sent_to_type === "tenant" && n.tenants) {
      const t = n.tenants;
      return t.tenant_type === "company" ? (t.company_name ?? t.email) : (t.full_name ?? t.email);
    }
    return SENT_TO_LABEL[n.sent_to_type];
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-12 max-w-3xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[0.62rem] tracking-[0.2em] uppercase text-terracotta mb-2">Communication</p>
            <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>Notices</h1>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError(null); }}
            className="text-xs tracking-[0.12em] uppercase bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            {showForm ? "Cancel" : "+ Send Notice"}
          </button>
        </div>

        {/* Create Notice Form */}
        {showForm && (
          <form onSubmit={handleSend} className="bg-card border border-border/50 rounded-xl p-6 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">New Notice</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Type */}
              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Notice Type *</label>
                <select value={form.type} onChange={(e) => f("type", e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
                  {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {/* Send To */}
              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Send To *</label>
                <select value={form.sent_to_type} onChange={(e) => f("sent_to_type", e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
                  <option value="all">All Tenants</option>
                  <option value="property">All Tenants at a Property</option>
                  <option value="tenant">Individual Tenant</option>
                </select>
              </div>

              {/* Conditional: Tenant select */}
              {form.sent_to_type === "tenant" && (
                <div className="md:col-span-2">
                  <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Tenant *</label>
                  <select value={form.tenant_id} required onChange={(e) => f("tenant_id", e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
                    <option value="">Select tenant…</option>
                    {tenants.map((t) => <option key={t.id} value={t.id}>{tenantName(t)}</option>)}
                  </select>
                </div>
              )}

              {/* Conditional: Property select */}
              {form.sent_to_type === "property" && (
                <div className="md:col-span-2">
                  <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Property *</label>
                  <select value={form.property_id} required onChange={(e) => f("property_id", e.target.value)}
                    className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
                    <option value="">Select property…</option>
                    {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              {/* Subject */}
              <div className="md:col-span-2">
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Subject *</label>
                <input type="text" value={form.subject} required onChange={(e) => f("subject", e.target.value)}
                  placeholder="e.g. Pool closed for maintenance this Saturday"
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60" />
              </div>

              {/* Body */}
              <div className="md:col-span-2">
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Message *</label>
                <textarea value={form.body} required rows={5} onChange={(e) => f("body", e.target.value)}
                  placeholder="Write your notice here…"
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 resize-none" />
              </div>
            </div>

            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {form.sent_to_type === "all" && "This will be visible to all tenants."}
                {form.sent_to_type === "property" && "Visible to all tenants with an active lease at the selected property."}
                {form.sent_to_type === "tenant" && "Visible only to the selected tenant."}
              </p>
              <button type="submit" disabled={saving}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-xs tracking-[0.1em] uppercase hover:opacity-90 transition-opacity disabled:opacity-40">
                {saving ? "Sending…" : "Send Notice"}
              </button>
            </div>
          </form>
        )}

        {/* Notice History */}
        {notices.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No notices sent yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Click "+ Send Notice" to send your first one.</p>
          </div>
        ) : (
          <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40 overflow-hidden">
            {notices.map((n) => (
              <div key={n.id}>
                <button className="w-full text-left px-5 py-4 hover:bg-muted/30 transition-colors"
                  onClick={() => setExpanded(expanded === n.id ? null : n.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[0.55rem] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full border flex-shrink-0 ${TYPE_STYLE[n.type]}`}>
                          {TYPE_LABEL[n.type]}
                        </span>
                        <span className="text-[0.58rem] tracking-[0.08em] uppercase text-muted-foreground">
                          → {getSentToLabel(n)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{n.subject}</p>
                    </div>
                    <p className="text-xs text-muted-foreground flex-shrink-0">{fmtDate(n.sent_at)}</p>
                  </div>
                </button>
                {expanded === n.id && (
                  <div className="px-5 pb-5 pt-1 border-t border-border/30 bg-muted/10">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{n.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
