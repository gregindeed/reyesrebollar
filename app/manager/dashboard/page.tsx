"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ManagerNav } from "@/components/ManagerNav";
import type { User } from "@supabase/supabase-js";

type Stats = { tenants: number; open: number; urgent: number; inProgress: number };
type RecentRequest = { id: string; title: string; priority: string; status: string; created_at: string; tenants: { full_name: string | null; email: string } | null };

const STATUS_COLOR: Record<string, string> = {
  open: "text-amber-700 bg-amber-50",
  in_progress: "text-blue-700 bg-blue-50",
  resolved: "text-green-700 bg-green-50",
};

const PRIORITY_DOT: Record<string, string> = {
  low: "bg-muted-foreground/40",
  normal: "bg-primary/50",
  urgent: "bg-red-500",
};

export default function ManagerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({ tenants: 0, open: 0, urgent: 0, inProgress: 0 });
  const [recent, setRecent] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/manager/login"); return; }

      // Admin check — any @reyesrebollar.com email is authorized
      if (!session.user.email?.endsWith("@reyesrebollar.com")) {
        setUnauthorized(true); setLoading(false); return;
      }

      setUser(session.user);

      const [{ count: tenantCount }, { data: requests }] = await Promise.all([
        supabase.from("tenants").select("*", { count: "exact", head: true }),
        supabase.from("maintenance_requests").select("id, title, priority, status, created_at, tenants(full_name, email)").order("created_at", { ascending: false }).limit(6),
      ]);

      const allRequests = requests ?? [];
      setStats({
        tenants: tenantCount ?? 0,
        open: allRequests.filter(r => r.status === "open").length,
        urgent: allRequests.filter(r => r.priority === "urgent").length,
        inProgress: allRequests.filter(r => r.status === "in_progress").length,
      });
      setRecent(allRequests as unknown as RecentRequest[]);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (unauthorized) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <p className="text-sm font-medium text-foreground">Access denied</p>
      <p className="text-xs text-muted-foreground">This account is not authorized as a manager.</p>
      <button onClick={() => supabase.auth.signOut().then(() => router.replace("/manager/login"))}
        className="mt-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
        Sign out
      </button>
    </div>
  );

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="min-h-screen">
      <ManagerNav email={user?.email} />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[0.62rem] tracking-[0.2em] uppercase text-terracotta mb-2">Overview</p>
          <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
            Manager Dashboard
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Tenants", value: stats.tenants, href: "/manager/tenants" },
            { label: "Open Requests", value: stats.open, href: "/manager/requests" },
            { label: "In Progress", value: stats.inProgress, href: "/manager/requests" },
            { label: "Urgent", value: stats.urgent, href: "/manager/requests" },
          ].map((s) => (
            <Link key={s.label} href={s.href} className="bg-card border border-border/50 rounded-xl p-5 hover:border-border transition-colors">
              <p className="text-2xl font-bold text-foreground mb-1">{s.value}</p>
              <p className="text-[0.62rem] tracking-[0.1em] uppercase text-muted-foreground">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Recent requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.62rem] tracking-[0.18em] uppercase text-muted-foreground">Recent Requests</p>
            <Link href="/manager/requests" className="text-[0.62rem] tracking-[0.12em] uppercase text-primary hover:opacity-70 transition-opacity">
              View all →
            </Link>
          </div>

          {recent.length > 0 ? (
            <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40">
              {recent.map((req) => (
                <div key={req.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[req.priority]}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{req.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.tenants?.full_name ?? req.tenants?.email ?? "Unknown"} · {fmt(req.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[0.58rem] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLOR[req.status]}`}>
                    {req.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <p className="text-sm text-muted-foreground">No maintenance requests yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
