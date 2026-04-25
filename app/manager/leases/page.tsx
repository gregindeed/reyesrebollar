"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type LeaseStatus = "draft" | "active" | "expiring_soon" | "expired" | "renewed" | "terminated";

type Lease = {
  id: string;
  unit_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  tenants: { full_name: string | null; company_name: string | null; tenant_type: string; email: string } | null;
  units: { unit_number: string; properties: { name: string } | null } | null;
};

type Doc = {
  id: string;
  name: string;
  document_type: string;
  file_path: string;
  is_shared: boolean;
  created_at: string;
};

const STATUS_STYLE: Record<string, string> = {
  draft:          "text-gray-600 bg-gray-50 border-gray-200",
  active:         "text-green-700 bg-green-50 border-green-200",
  expiring_soon:  "text-amber-700 bg-amber-50 border-amber-200",
  expired:        "text-red-700 bg-red-50 border-red-200",
  renewed:        "text-blue-700 bg-blue-50 border-blue-200",
  terminated:     "text-gray-600 bg-gray-50 border-gray-200",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft", active: "Active", expiring_soon: "Expiring Soon",
  expired: "Expired", renewed: "Renewed", terminated: "Terminated",
};

function getDisplayStatus(lease: Lease): LeaseStatus {
  if (lease.status !== "active") return lease.status as LeaseStatus;
  const days = Math.ceil((new Date(lease.end_date).getTime() - Date.now()) / 86400000);
  if (days <= 0) return "expired";
  if (days <= 60) return "expiring_soon";
  return "active";
}

const EMPTY_LEASE_FORM = {
  property_id: "", unit_id: "", tenant_id: "",
  start_date: "", end_date: "",
  rent_amount: "", deposit_amount: "0",
  status: "active", notes: "",
};

const EMPTY_DOC_FORM = {
  name: "", document_type: "lease", is_shared: true,
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function LeasesPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [allUnits, setAllUnits] = useState<{ id: string; property_id: string; unit_number: string; rent_amount: number; deposit_amount: number; status: string }[]>([]);
  const [allTenants, setAllTenants] = useState<{ id: string; full_name: string | null; company_name: string | null; tenant_type: string; email: string }[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLeaseForm, setShowLeaseForm] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  const [leaseForm, setLeaseForm] = useState(EMPTY_LEASE_FORM);
  const [docForm, setDocForm] = useState(EMPTY_DOC_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || !session.user.email?.endsWith("@reyesrebollar.com")) {
        router.replace("/manager/login"); return;
      }
      loadAll();
    });
  }, [router]);

  const loadAll = async () => {
    const [{ data: ls }, { data: ps }, { data: us }, { data: ts }] = await Promise.all([
      supabase.from("leases").select("*, tenants(full_name, company_name, tenant_type, email), units(unit_number, properties(name))").order("created_at", { ascending: false }),
      supabase.from("properties").select("id, name").order("name"),
      supabase.from("units").select("id, property_id, unit_number, rent_amount, deposit_amount, status"),
      supabase.from("tenants").select("id, full_name, company_name, tenant_type, email").eq("status", "active").order("full_name"),
    ]);
    setLeases((ls as Lease[]) ?? []);
    setProperties(ps ?? []);
    setAllUnits(us ?? []);
    setAllTenants(ts ?? []);
    setLoading(false);
  };

  const fetchDocs = async (leaseId: string) => {
    const { data } = await supabase.from("documents")
      .select("*")
      .eq("entity_type", "lease")
      .eq("entity_id", leaseId)
      .order("created_at", { ascending: false });
    setDocs((data as Doc[]) ?? []);
  };

  const selectLease = (id: string) => {
    setSelectedId(id);
    setShowDocForm(false);
    setFile(null);
    setDocError(null);
    fetchDocs(id);
  };

  const lf = (k: keyof typeof leaseForm, v: string) => {
    setLeaseForm((p) => {
      const next = { ...p, [k]: v };
      if (k === "unit_id") {
        const unit = allUnits.find((u) => u.id === v);
        if (unit) {
          next.rent_amount = unit.rent_amount.toString();
          next.deposit_amount = unit.deposit_amount.toString();
        }
      }
      return next;
    });
  };

  const vacantUnits = allUnits.filter(
    (u) => u.property_id === leaseForm.property_id && u.status === "vacant"
  );

  const tenantName = (t: typeof allTenants[0]) =>
    t.tenant_type === "company" ? (t.company_name ?? t.email) : (t.full_name ?? t.email);

  const handleCreateLease = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    const { error: le } = await supabase.from("leases").insert({
      unit_id: leaseForm.unit_id,
      tenant_id: leaseForm.tenant_id,
      start_date: leaseForm.start_date,
      end_date: leaseForm.end_date,
      rent_amount: parseFloat(leaseForm.rent_amount),
      deposit_amount: parseFloat(leaseForm.deposit_amount) || 0,
      status: leaseForm.status,
      notes: leaseForm.notes || null,
    });
    if (le) { setError(le.message); setSaving(false); return; }
    await supabase.from("units").update({ status: "occupied" }).eq("id", leaseForm.unit_id);
    setShowLeaseForm(false);
    setLeaseForm(EMPTY_LEASE_FORM);
    await loadAll();
    setSaving(false);
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedId) return;
    setUploading(true); setDocError(null);

    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowed = ["pdf", "jpg", "jpeg", "png"];
    if (!ext || !allowed.includes(ext)) {
      setDocError("Only PDF, JPG, and PNG files are allowed.");
      setUploading(false); return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setDocError("File must be under 50MB."); setUploading(false); return;
    }

    const path = `leases/${selectedId}/${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    const { data: up, error: ue } = await supabase.storage.from("documents").upload(path, file);
    if (ue) { setDocError(ue.message); setUploading(false); return; }

    const { error: de } = await supabase.from("documents").insert({
      entity_type: "lease",
      entity_id: selectedId,
      name: docForm.name || file.name,
      document_type: docForm.document_type,
      file_url: "",
      file_path: up.path,
      is_shared: docForm.is_shared,
    });

    if (de) { setDocError(de.message); setUploading(false); return; }

    setShowDocForm(false);
    setFile(null);
    setDocForm(EMPTY_DOC_FORM);
    if (fileRef.current) fileRef.current.value = "";
    await fetchDocs(selectedId);
    setUploading(false);
  };

  const handleDownload = async (doc: Doc) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(doc.file_path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const toggleShared = async (doc: Doc) => {
    await supabase.from("documents").update({ is_shared: !doc.is_shared }).eq("id", doc.id);
    if (selectedId) fetchDocs(selectedId);
  };

  const selected = leases.find((l) => l.id === selectedId);
  const displayStatus = selected ? getDisplayStatus(selected) : "active";
  const daysLeft = selected
    ? Math.ceil((new Date(selected.end_date).getTime() - Date.now()) / 86400000)
    : null;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-12 max-w-5xl">

        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[0.62rem] tracking-[0.2em] uppercase text-terracotta mb-2">Contracts</p>
            <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>Leases</h1>
          </div>
          <button onClick={() => { setShowLeaseForm(!showLeaseForm); setError(null); }}
            className="text-xs tracking-[0.12em] uppercase bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            {showLeaseForm ? "Cancel" : "+ New Lease"}
          </button>
        </div>

        {/* Create Lease Form */}
        {showLeaseForm && (
          <form onSubmit={handleCreateLease} className="bg-card border border-border/50 rounded-xl p-6 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">New Lease</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Property *</label>
                <select value={leaseForm.property_id} required
                  onChange={(e) => { lf("property_id", e.target.value); lf("unit_id", ""); }}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
                  <option value="">Select property…</option>
                  {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Unit *</label>
                <select value={leaseForm.unit_id} required
                  onChange={(e) => lf("unit_id", e.target.value)}
                  disabled={!leaseForm.property_id}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 disabled:opacity-50">
                  <option value="">{leaseForm.property_id ? (vacantUnits.length ? "Select unit…" : "No vacant units") : "Select property first"}</option>
                  {vacantUnits.map((u) => <option key={u.id} value={u.id}>{u.unit_number} — {fmt(u.rent_amount)}/mo</option>)}
                </select>
              </div>

              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Tenant *</label>
                <select value={leaseForm.tenant_id} required
                  onChange={(e) => lf("tenant_id", e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
                  <option value="">Select tenant…</option>
                  {allTenants.map((t) => <option key={t.id} value={t.id}>{tenantName(t)}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Status</label>
                <select value={leaseForm.status} onChange={(e) => lf("status", e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <SField label="Start Date *" type="date" value={leaseForm.start_date} onChange={(v) => lf("start_date", v)} required />
              <SField label="End Date *" type="date" value={leaseForm.end_date} onChange={(v) => lf("end_date", v)} required />
              <SField label="Monthly Rent *" type="number" value={leaseForm.rent_amount} onChange={(v) => lf("rent_amount", v)} placeholder="1800" required />
              <SField label="Deposit" type="number" value={leaseForm.deposit_amount} onChange={(v) => lf("deposit_amount", v)} placeholder="1800" />
            </div>
            <SField label="Notes" value={leaseForm.notes} onChange={(v) => lf("notes", v)} placeholder="Optional notes" />
            {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
            <div className="flex justify-end mt-4">
              <button type="submit" disabled={saving}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-xs tracking-[0.1em] uppercase hover:opacity-90 transition-opacity disabled:opacity-40">
                {saving ? "Creating…" : "Create Lease"}
              </button>
            </div>
          </form>
        )}

        <div className="grid md:grid-cols-5 gap-6">

          {/* Lease List */}
          <div className="md:col-span-2">
            {leases.length === 0 ? (
              <div className="bg-card border border-border/50 rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground">No leases yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Click "+ New Lease" to create the first one.</p>
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40 overflow-hidden">
                {leases.map((l) => {
                  const ds = getDisplayStatus(l);
                  const tName = l.tenants?.tenant_type === "company"
                    ? l.tenants.company_name : l.tenants?.full_name;
                  return (
                    <button key={l.id} onClick={() => selectLease(l.id)}
                      className={`w-full text-left px-4 py-4 transition-colors hover:bg-muted/50 ${selectedId === l.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground truncate">{tName ?? l.tenants?.email}</p>
                        <span className={`text-[0.55rem] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_STYLE[ds]}`}>
                          {STATUS_LABEL[ds]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {l.units?.properties?.name} · {l.units?.unit_number}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fmtDate(l.start_date)} – {fmtDate(l.end_date)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lease Detail */}
          <div className="md:col-span-3">
            {!selected ? (
              <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
                <p className="text-sm text-muted-foreground">Select a lease to view details and manage documents.</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Lease Info */}
                <div className="bg-card border border-border/50 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        {selected.tenants?.tenant_type === "company"
                          ? selected.tenants.company_name
                          : selected.tenants?.full_name ?? selected.tenants?.email}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selected.units?.properties?.name} · {selected.units?.unit_number}
                      </p>
                    </div>
                    <span className={`text-[0.58rem] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full border ${STATUS_STYLE[displayStatus]}`}>
                      {STATUS_LABEL[displayStatus]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <InfoRow label="Start Date" value={fmtDate(selected.start_date)} />
                    <InfoRow label="End Date" value={fmtDate(selected.end_date)} />
                    <InfoRow label="Monthly Rent" value={fmt(selected.rent_amount)} />
                    <InfoRow label="Deposit" value={fmt(selected.deposit_amount)} />
                    {daysLeft !== null && daysLeft > 0 && (
                      <InfoRow label="Days Remaining"
                        value={`${daysLeft} days`}
                        highlight={daysLeft <= 60} />
                    )}
                    {selected.notes && <div className="col-span-2"><InfoRow label="Notes" value={selected.notes} /></div>}
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documents</p>
                    <button onClick={() => { setShowDocForm(!showDocForm); setDocError(null); }}
                      className="text-[0.62rem] tracking-[0.1em] uppercase text-primary hover:opacity-70 transition-opacity">
                      {showDocForm ? "Cancel" : "+ Upload"}
                    </button>
                  </div>

                  {showDocForm && (
                    <form onSubmit={handleUploadDoc} className="p-5 border-b border-border/40 bg-muted/20 space-y-3">
                      <div>
                        <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">File *</label>
                        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" required
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            setFile(f);
                            if (f && !docForm.name) setDocForm((p) => ({ ...p, name: f.name.replace(/\.[^.]+$/, "") }));
                          }}
                          className="w-full text-sm text-foreground file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                      </div>
                      <SField label="Document Name" value={docForm.name}
                        onChange={(v) => setDocForm((p) => ({ ...p, name: v }))}
                        placeholder="e.g. Lease Agreement 2025" />
                      <div>
                        <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Type</label>
                        <select value={docForm.document_type}
                          onChange={(e) => setDocForm((p) => ({ ...p, document_type: e.target.value }))}
                          className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
                          {["lease","contract","addendum","inspection","notice","other"].map((t) => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={docForm.is_shared}
                          onChange={(e) => setDocForm((p) => ({ ...p, is_shared: e.target.checked }))}
                          className="w-4 h-4 accent-primary rounded" />
                        <span className="text-xs text-foreground">Visible to tenant</span>
                      </label>
                      {docError && <p className="text-xs text-red-600">{docError}</p>}
                      <div className="flex justify-end">
                        <button type="submit" disabled={uploading || !file}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs tracking-[0.1em] uppercase hover:opacity-90 transition-opacity disabled:opacity-40">
                          {uploading ? "Uploading…" : "Upload Document"}
                        </button>
                      </div>
                    </form>
                  )}

                  {docs.length === 0 && !showDocForm ? (
                    <div className="px-5 py-8 text-center">
                      <p className="text-sm text-muted-foreground">No documents yet.</p>
                      <p className="text-xs text-muted-foreground mt-1">Upload lease agreements, addendums, or other files.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {docs.map((doc) => (
                        <div key={doc.id} className="px-5 py-4 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{doc.document_type} · {new Date(doc.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <button onClick={() => toggleShared(doc)}
                              className={`text-[0.58rem] tracking-[0.1em] uppercase px-2 py-1 rounded-full border transition-colors ${doc.is_shared ? "text-green-700 bg-green-50 border-green-200" : "text-gray-500 bg-gray-50 border-gray-200"}`}>
                              {doc.is_shared ? "Shared" : "Private"}
                            </button>
                            <button onClick={() => handleDownload(doc)}
                              className="text-[0.6rem] tracking-[0.1em] uppercase text-primary hover:opacity-70 transition-opacity">
                              Download
                            </button>
                          </div>
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

function InfoRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="pb-2 border-b border-border/30 last:border-0">
      <p className="text-[0.58rem] uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${highlight ? "text-amber-700" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
