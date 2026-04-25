"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Property, Unit } from "@/lib/supabase";

const UNIT_STATUS_STYLE: Record<string, string> = {
  vacant:          "text-green-700 bg-green-50 border-green-200",
  occupied:        "text-blue-700 bg-blue-50 border-blue-200",
  pending_move_in: "text-amber-700 bg-amber-50 border-amber-200",
  pending_move_out:"text-orange-700 bg-orange-50 border-orange-200",
  maintenance:     "text-red-700 bg-red-50 border-red-200",
};

const UNIT_STATUS_LABEL: Record<string, string> = {
  vacant: "Vacant", occupied: "Occupied",
  pending_move_in: "Move-in", pending_move_out: "Move-out", maintenance: "Maintenance",
};

const EMPTY_PROPERTY_FORM = {
  name: "", address: "", city: "El Cajon", state: "CA",
  zip_code: "92021", type: "residential", notes: "",
};

const EMPTY_UNIT_FORM = {
  unit_number: "", rent_amount: "", deposit_amount: "0",
  sqft: "", bedrooms: "", bathrooms: "", notes: "",
};

export default function PropertiesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [propertyForm, setPropertyForm] = useState(EMPTY_PROPERTY_FORM);
  const [unitForm, setUnitForm] = useState(EMPTY_UNIT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || !session.user.email?.endsWith("@reyesrebollar.com")) {
        router.replace("/manager/login"); return;
      }
      fetchProperties();
    });
  }, [router]);

  const fetchProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select("*, units(*)")
      .order("created_at");
    setProperties((data as Property[]) ?? []);
    setLoading(false);
  };

  const selected = properties.find((p) => p.id === selectedId);

  const pField = (key: keyof typeof propertyForm, val: string) =>
    setPropertyForm((f) => ({ ...f, [key]: val }));
  const uField = (key: keyof typeof unitForm, val: string) =>
    setUnitForm((f) => ({ ...f, [key]: val }));

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    const { error } = await supabase.from("properties").insert(propertyForm);
    if (error) { setError(error.message); }
    else {
      setShowAddProperty(false);
      setPropertyForm(EMPTY_PROPERTY_FORM);
      await fetchProperties();
    }
    setSaving(false);
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setSaving(true); setError(null);
    const payload = {
      property_id: selectedId,
      unit_number: unitForm.unit_number,
      rent_amount: parseFloat(unitForm.rent_amount) || 0,
      deposit_amount: parseFloat(unitForm.deposit_amount) || 0,
      sqft: unitForm.sqft ? parseInt(unitForm.sqft) : null,
      bedrooms: unitForm.bedrooms ? parseFloat(unitForm.bedrooms) : null,
      bathrooms: unitForm.bathrooms ? parseFloat(unitForm.bathrooms) : null,
      notes: unitForm.notes || null,
    };
    const { error } = editingUnit
      ? await supabase.from("units").update(payload).eq("id", editingUnit.id)
      : await supabase.from("units").insert(payload);
    if (error) { setError(error.message); }
    else {
      setShowAddUnit(false); setEditingUnit(null);
      setUnitForm(EMPTY_UNIT_FORM);
      await fetchProperties();
    }
    setSaving(false);
  };

  const startEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setUnitForm({
      unit_number: unit.unit_number,
      rent_amount: unit.rent_amount.toString(),
      deposit_amount: unit.deposit_amount.toString(),
      sqft: unit.sqft?.toString() ?? "",
      bedrooms: unit.bedrooms?.toString() ?? "",
      bathrooms: unit.bathrooms?.toString() ?? "",
      notes: unit.notes ?? "",
    });
    setShowAddUnit(true);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

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
            <p className="text-[0.62rem] tracking-[0.2em] uppercase text-terracotta mb-2">Portfolio</p>
            <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
              Properties
            </h1>
          </div>
          <button
            onClick={() => { setShowAddProperty(!showAddProperty); setError(null); }}
            className="text-xs tracking-[0.12em] uppercase bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            {showAddProperty ? "Cancel" : "+ Add Property"}
          </button>
        </div>

        {/* Add Property Form */}
        {showAddProperty && (
          <form onSubmit={handleAddProperty} className="bg-card border border-border/50 rounded-xl p-6 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">New Property</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Field label="Property Name *" value={propertyForm.name} onChange={(v) => pField("name", v)} placeholder="e.g. 1321 Oro Street" required />
              <Field label="Street Address *" value={propertyForm.address} onChange={(v) => pField("address", v)} placeholder="e.g. 1321 Oro Street" required />
              <Field label="City *" value={propertyForm.city} onChange={(v) => pField("city", v)} placeholder="El Cajon" required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="State *" value={propertyForm.state} onChange={(v) => pField("state", v)} placeholder="CA" required />
                <Field label="Zip *" value={propertyForm.zip_code} onChange={(v) => pField("zip_code", v)} placeholder="92021" required />
              </div>
              <div>
                <label className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">Type *</label>
                <select value={propertyForm.type} onChange={(e) => pField("type", e.target.value)} required
                  className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60">
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed">Mixed Use</option>
                </select>
              </div>
              <Field label="Notes" value={propertyForm.notes} onChange={(v) => pField("notes", v)} placeholder="Optional notes" />
            </div>
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={saving}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-xs tracking-[0.1em] uppercase hover:opacity-90 transition-opacity disabled:opacity-40">
                {saving ? "Saving…" : "Add Property"}
              </button>
            </div>
          </form>
        )}

        <div className="grid md:grid-cols-5 gap-6">

          {/* Property List */}
          <div className="md:col-span-2">
            {properties.length === 0 ? (
              <div className="bg-card border border-border/50 rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">No properties yet.</p>
                <p className="text-xs text-muted-foreground">Click "Add Property" to get started.</p>
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40 overflow-hidden">
                {properties.map((p) => {
                  const units = (p.units ?? []) as Unit[];
                  const vacant = units.filter((u) => u.status === "vacant").length;
                  return (
                    <button key={p.id} onClick={() => { setSelectedId(p.id); setShowAddUnit(false); setEditingUnit(null); }}
                      className={`w-full text-left px-4 py-4 transition-colors hover:bg-muted/50 ${selectedId === p.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                      <p className="text-sm font-medium text-foreground mb-0.5">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.city}, {p.state} · {p.type}</p>
                      <div className="flex gap-3 mt-1.5">
                        <span className="text-[0.6rem] tracking-wide text-muted-foreground uppercase">{units.length} units</span>
                        {vacant > 0 && <span className="text-[0.6rem] tracking-wide text-green-700 uppercase">{vacant} vacant</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Property Detail + Units */}
          <div className="md:col-span-3">
            {!selected ? (
              <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
                <p className="text-sm text-muted-foreground">Select a property to view details and manage units.</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Property Info */}
                <div className="bg-card border border-border/50 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">{selected.name}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">{selected.address}, {selected.city}, {selected.state} {selected.zip_code}</p>
                    </div>
                    <span className={`text-[0.6rem] tracking-[0.1em] uppercase px-2 py-1 rounded-full border ${selected.type === "commercial" ? "text-purple-700 bg-purple-50 border-purple-200" : "text-blue-700 bg-blue-50 border-blue-200"}`}>
                      {selected.type}
                    </span>
                  </div>
                  {selected.notes && <p className="text-xs text-muted-foreground">{selected.notes}</p>}
                  <div className="flex gap-4 mt-3 pt-3 border-t border-border/40">
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-wide text-muted-foreground">Units</p>
                      <p className="text-sm font-semibold text-foreground">{(selected.units ?? []).length}</p>
                    </div>
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-wide text-muted-foreground">Vacant</p>
                      <p className="text-sm font-semibold text-green-700">
                        {(selected.units ?? []).filter((u: Unit) => u.status === "vacant").length}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-wide text-muted-foreground">Monthly Rent</p>
                      <p className="text-sm font-semibold text-foreground">
                        {fmt((selected.units ?? []).reduce((s: number, u: Unit) => s + u.rent_amount, 0))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Units */}
                <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Units</p>
                    <button
                      onClick={() => { setShowAddUnit(!showAddUnit); setEditingUnit(null); setUnitForm(EMPTY_UNIT_FORM); setError(null); }}
                      className="text-[0.62rem] tracking-[0.1em] uppercase text-primary hover:opacity-70 transition-opacity"
                    >
                      {showAddUnit && !editingUnit ? "Cancel" : "+ Add Unit"}
                    </button>
                  </div>

                  {/* Add / Edit Unit Form */}
                  {showAddUnit && (
                    <form onSubmit={handleAddUnit} className="p-5 border-b border-border/40 bg-muted/20">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                        {editingUnit ? `Edit ${editingUnit.unit_number}` : "New Unit"}
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <Field label="Unit Number *" value={unitForm.unit_number} onChange={(v) => uField("unit_number", v)} placeholder="Unit A" required />
                        <Field label="Monthly Rent *" type="number" value={unitForm.rent_amount} onChange={(v) => uField("rent_amount", v)} placeholder="1800" required />
                        <Field label="Deposit" type="number" value={unitForm.deposit_amount} onChange={(v) => uField("deposit_amount", v)} placeholder="1800" />
                        <Field label="Sq Ft" type="number" value={unitForm.sqft} onChange={(v) => uField("sqft", v)} placeholder="850" />
                        <Field label="Beds" type="number" value={unitForm.bedrooms} onChange={(v) => uField("bedrooms", v)} placeholder="2" />
                        <Field label="Baths" type="number" value={unitForm.bathrooms} onChange={(v) => uField("bathrooms", v)} placeholder="1" />
                      </div>
                      <Field label="Notes" value={unitForm.notes} onChange={(v) => uField("notes", v)} placeholder="Optional notes" />
                      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                      <div className="flex justify-end mt-3">
                        <button type="submit" disabled={saving}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs tracking-[0.1em] uppercase hover:opacity-90 transition-opacity disabled:opacity-40">
                          {saving ? "Saving…" : editingUnit ? "Save Changes" : "Add Unit"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Unit List */}
                  {(selected.units ?? []).length === 0 && !showAddUnit ? (
                    <div className="px-5 py-8 text-center">
                      <p className="text-sm text-muted-foreground">No units yet.</p>
                      <p className="text-xs text-muted-foreground mt-1">Click "+ Add Unit" to add the first unit.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {(selected.units ?? []).map((unit: Unit) => (
                        <div key={unit.id} className="px-5 py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div>
                              <p className="text-sm font-medium text-foreground">{unit.unit_number}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {fmt(unit.rent_amount)}/mo
                                {unit.sqft && ` · ${unit.sqft.toLocaleString()} sq ft`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`text-[0.58rem] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full border ${UNIT_STATUS_STYLE[unit.status]}`}>
                              {UNIT_STATUS_LABEL[unit.status]}
                            </span>
                            <button onClick={() => startEditUnit(unit)}
                              className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors">
                              Edit
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
