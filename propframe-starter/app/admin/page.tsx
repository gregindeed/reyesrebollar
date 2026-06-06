"use client";
// app/admin/page.tsx — platform admin dashboard
// Only accessible to emails listed in platformConfig.adminEmails

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { platformConfig } from "@/site.config";
import type { Company } from "@/lib/supabase";

type CompanyWithMembers = Company & { member_count: number };

const STATUS_STYLE: Record<string, string> = {
  active:    "text-green-400 bg-green-400/10 border-green-400/20",
  inactive:  "text-gray-400 bg-gray-400/10 border-gray-400/20",
  suspended: "text-red-400 bg-red-400/10 border-red-400/20",
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function AdminDashboard() {
  const router = useRouter();
  const [companies, setCompanies]   = useState<CompanyWithMembers[]>([]);
  const [loading,   setLoading]     = useState(true);
  const [userEmail, setUserEmail]   = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/signin"); return; }

      const email = session.user.email ?? "";
      if (!(platformConfig.adminEmails as readonly string[]).includes(email)) {
        setUnauthorized(true); setLoading(false); return;
      }

      setUserEmail(email);
      await loadCompanies();
    };
    init();
  }, [router]);

  const loadCompanies = async () => {
    const { data: companies } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (!companies) { setLoading(false); return; }

    // Get member counts
    const withCounts = await Promise.all(
      companies.map(async (c) => {
        const { count } = await supabase
          .from("company_members")
          .select("*", { count: "exact", head: true })
          .eq("company_id", c.id)
          .eq("status", "active");
        return { ...c, member_count: count ?? 0 };
      })
    );

    setCompanies(withCounts);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/signin");
  };

  if (loading) {
    return (
      <Shell email={userEmail} onSignOut={handleSignOut}>
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Shell>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">You don&apos;t have access to the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <Shell email={userEmail} onSignOut={handleSignOut}>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard label="Total companies" value={companies.length} />
        <StatCard label="Active" value={companies.filter(c => c.status === "active").length} />
        <StatCard label="Total members" value={companies.reduce((n, c) => n + c.member_count, 0)} />
      </div>

      {/* Companies table */}
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Companies</h2>
          <button
            onClick={loadCompanies}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Refresh
          </button>
        </div>

        {companies.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">No companies yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                {["Company", "Slug", "Status", "Members", "Created"].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs tracking-[0.1em] uppercase text-muted-foreground font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{c.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-muted-foreground">{c.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs border px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{c.member_count}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-muted-foreground">{fmtDate(c.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Shell({ email, onSignOut, children }: {
  email: string | null; onSignOut: () => void; children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-foreground tracking-tight">propframe</span>
            <span className="text-xs text-muted-foreground border border-border/50 px-2 py-0.5 rounded">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            {email && <span className="text-xs text-muted-foreground">{email}</span>}
            <button
              onClick={onSignOut}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold text-foreground mb-8">Admin dashboard</h1>
        {children}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border/50 rounded-xl px-6 py-5">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
