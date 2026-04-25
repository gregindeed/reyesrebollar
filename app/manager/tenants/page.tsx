"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Heading, Text } from "@radix-ui/themes";
import type { User } from "@supabase/supabase-js";

type Tenant = {
  id: string; email: string; full_name: string | null; phone: string | null;
  unit: string | null; property_id: string | null; created_at: string;
  leases: { property_address: string; rent_amount: number; start_date: string; end_date: string }[];
};

const PROPERTIES = [
  { id: "1", label: "1321 Oro Street" },
  { id: "2", label: "1227 N 1st Street" },
  { id: "3", label: "1237 N 1st Street" },
  { id: "4", label: "1107 Greenfield Dr" },
];

export default function ManagerTenantsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", unit: "", property_id: "",
    property_address: "", start_date: "", end_date: "", rent_amount: "",
  });

  const fetchTenants = async () => {
    const { data } = await supabase.from("tenants").select("*, leases(property_address, rent_amount, start_date, end_date)").order("created_at", { ascending: false });
    setTenants((data as unknown as Tenant[]) ?? []);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/manager/login"); return; }
      if (!session.user.email?.endsWith("@reyesrebollar.com")) {
        router.replace("/manager/login"); return;
      }
      setUser(session.user);
      await fetchTenants();
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: tenant, error: tErr } = await supabase.from("tenants").insert({
      email: form.email, full_name: form.full_name || null,
      phone: form.phone || null, unit: form.unit || null, property_id: form.property_id || null,
    }).select().single();

    if (!tErr && tenant && form.property_address) {
      await supabase.from("leases").insert({
        tenant_id: tenant.id, property_address: form.property_address,
        unit: form.unit || null, start_date: form.start_date || null,
        end_date: form.end_date || null, rent_amount: form.rent_amount ? parseFloat(form.rent_amount) : null,
      });
    }

    await fetchTenants();
    setShowForm(false);
    setForm({ full_name: "", email: "", phone: "", unit: "", property_id: "", property_address: "", start_date: "", end_date: "", rent_amount: "" });
    setSaving(false);
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const fmtCurrency = (n: number) => n ? `$${n.toLocaleString()}` : "—";

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex items-end justify-between mb-10">
          <div>
            <Text size="1" className="tracking-[0.2em] uppercase text-terracotta block mb-2">Management</Text>
            <Heading size="8" weight="light" trim="start">Tenants</Heading>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="text-xs tracking-[0.12em] uppercase bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            {showForm ? "Cancel" : "+ Add Tenant"}
          </button>
        </div>

        {/* Add tenant form */}
        {showForm && (
          <form onSubmit={handleSave} className="bg-card border border-border/50 rounded-xl p-6 mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">New Tenant</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {[
                { label: "Full Name", key: "full_name", type: "text", placeholder: "Jane Doe" },
                { label: "Email *", key: "email", type: "email", placeholder: "tenant@email.com", required: true },
                { label: "Phone", key: "phone", type: "tel", placeholder: "(619) 555-0100" },
                { label: "Unit", key: "unit", type: "text", placeholder: "Unit A" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} required={f.required}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors" />
                </div>
              ))}
              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Property</label>
                <select value={form.property_id} onChange={(e) => {
                  const prop = PROPERTIES.find(p => p.id === e.target.value);
                  setForm({ ...form, property_id: e.target.value, property_address: prop?.label ?? "" });
                }} className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors">
                  <option value="">Select property</option>
                  {PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
            </div>

            <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-3 mt-2">Lease Details</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Start Date</label>
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors" />
              </div>
              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">End Date</label>
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors" />
              </div>
              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Monthly Rent ($)</label>
                <input type="number" placeholder="1800" value={form.rent_amount} onChange={(e) => setForm({ ...form, rent_amount: e.target.value })}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">After saving, invite the tenant via Supabase → Auth → Invite user</p>
              <button type="submit" disabled={saving || !form.email}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-xs tracking-[0.1em] uppercase hover:opacity-90 transition-opacity disabled:opacity-40">
                {saving ? "Saving..." : "Save Tenant"}
              </button>
            </div>
          </form>
        )}

        {/* Tenant list */}
        {tenants.length > 0 ? (
          <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40">
            {tenants.map((t) => {
              const lease = t.leases?.[0];
              return (
                <div key={t.id} className="px-5 py-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{t.email}</p>
                    </div>
                    {t.phone && <p className="text-xs text-muted-foreground">{t.phone}</p>}
                  </div>
                  {lease && (
                    <div className="flex flex-wrap gap-4 mt-3">
                      <p className="text-[0.62rem] tracking-wide text-muted-foreground">{lease.property_address}{t.unit ? ` · ${t.unit}` : ""}</p>
                      <p className="text-[0.62rem] tracking-wide text-muted-foreground">{fmtCurrency(lease.rent_amount)}/mo</p>
                      <p className="text-[0.62rem] tracking-wide text-muted-foreground">{fmtDate(lease.start_date)} – {fmtDate(lease.end_date)}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">No tenants yet.</p>
            <p className="text-xs text-muted-foreground">Click "Add Tenant" to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}
