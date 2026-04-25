"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Priority = "low" | "normal" | "urgent";

export default function MaintenancePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/portal/login"); return; }
      setUser(session.user);
      setLoading(false);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);

    // Get tenant record by email
    const { data: tenant } = await supabase.from("tenants").select("id").eq("email", user.email).single();
    if (!tenant) { setError("Tenant profile not found. Contact your property manager."); setSubmitting(false); return; }

    const { error } = await supabase.from("maintenance_requests").insert({
      tenant_id: tenant.id,
      title,
      description: description || null,
      priority,
    });

    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-12 max-w-xl">
        <div className="mb-10">
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-terracotta mb-3">Maintenance</p>
          <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>
            Submit a Request
          </h1>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="text-[0.65rem] tracking-[0.14em] uppercase text-muted-foreground block mb-2">
                Issue title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Leaking faucet in bathroom"
                required
                className="w-full bg-card border border-border/60 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[0.65rem] tracking-[0.14em] uppercase text-muted-foreground block mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail — location, when it started, etc."
                rows={4}
                className="w-full bg-card border border-border/60 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors resize-none"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="text-[0.65rem] tracking-[0.14em] uppercase text-muted-foreground block mb-3">
                Priority
              </label>
              <div className="flex gap-3">
                {(["low", "normal", "urgent"] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-lg text-xs tracking-[0.1em] uppercase border transition-colors ${
                      priority === p
                        ? p === "urgent"
                          ? "bg-red-50 border-red-300 text-red-700"
                          : "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !title}
              className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-3 text-xs tracking-[0.12em] uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        ) : (
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <p className="text-2xl mb-4">✓</p>
            <h2 className="font-display text-lg text-foreground mb-2">Request submitted</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              We've received your request and will follow up shortly at{" "}
              <span className="font-medium">{user?.email}</span>.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setSubmitted(false); setTitle(""); setDescription(""); setPriority("normal"); }}
                className="text-xs tracking-[0.12em] uppercase text-primary border-b border-primary/30 pb-0.5 hover:opacity-70 transition-opacity mx-auto"
              >
                Submit another request
              </button>
              <Link
                href="/portal/dashboard"
                className="text-xs tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
