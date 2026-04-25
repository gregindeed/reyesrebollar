"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type DashStats = {
  outstanding: number;
  overdueCount: number;
  openRequests: number;
  vacantUnits: number;
  totalTenants: number;
};

type ExpiringLease = {
  id: string;
  end_date: string;
  rent_amount: number;
  tenants: { full_name: string | null; company_name: string | null; tenant_type: string } | null;
  units: { unit_number: string; properties: { name: string } | null } | null;
};

type RecentRequest = {
  id: string;
  title: string;
  priority: string;
  status: string;
  created_at: string;
  tenants: { full_name: string | null; company_name: string | null; tenant_type: string; email: string } | null;
};

type RecentPayment = {
  id: string;
  amount_paid: number;
  paid_at: string;
  method: string;
  invoices: { category: string; tenants: { full_name: string | null; company_name: string | null; tenant_type: string } | null } | null;
};

const PRIORITY_DOT: Record<string, string> = {
  low: "bg-muted-foreground/30", normal: "bg-primary/50", urgent: "bg-red-500", high: "bg-orange-500",
};

const REQUEST_STATUS_STYLE: Record<string, string> = {
  new: "text-blue-700 bg-blue-50", in_review: "text-amber-700 bg-amber-50",
  scheduled: "text-purple-700 bg-purple-50", completed: "text-green-700 bg-green-50",
  canceled: "text-gray-500 bg-gray-50",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

const fmtDateFull = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const daysUntil = (d: string) =>
  Math.ceil((new Date(d + "T00:00:00").getTime() - Date.now()) / 86400000);

const tenantName = (t: { full_name: string | null; company_name: string | null; tenant_type: string } | null) =>
  t?.tenant_type === "company" ? (t.company_name ?? "Company") : (t?.full_name ?? "Tenant");

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

const today = new Date().toISOString().split("T")[0];
const in60  = new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0];

export default function ManagerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashStats>({ outstanding: 0, overdueCount: 0, openRequests: 0, vacantUnits: 0, totalTenants: 0 });
  const [expiring, setExpiring] = useState<ExpiringLease[]>([]);
  const [requests, setRequests] = useState<RecentRequest[]>([]);
  const [payments, setPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/manager/login"); return; }
      if (!session.user.email?.endsWith("@reyesrebollar.com")) {
        setUnauthorized(true); setLoading(false); return;
      }
      setUser(session.user);

      const [
        { data: invoices },
        { data: reqs },
        { count: vacantCount },
        { count: tenantCount },
        { data: leases },
        { data: pays },
      ] = await Promise.all([
        // All unpaid invoices with payments
        supabase.from("invoices")
          .select("amount, status, due_date, payments(amount_paid)")
          .neq("status", "paid")
          .neq("status", "canceled")
          .neq("status", "draft"),
        // Recent maintenance requests
        supabase.from("maintenance_requests")
          .select("id, title, priority, status, created_at, tenants(full_name, company_name, tenant_type, email)")
          .in("status", ["new", "in_review", "scheduled", "waiting_tenant", "waiting_vendor"])
          .order("created_at", { ascending: false })
          .limit(5),
        // Vacant units
        supabase.from("units").select("*", { count: "exact", head: true }).eq("status", "vacant"),
        // Total active tenants
        supabase.from("tenants").select("*", { count: "exact", head: true }).eq("status", "active"),
        // Leases expiring within 60 days
        supabase.from("leases")
          .select("id, end_date, rent_amount, tenants(full_name, company_name, tenant_type), units(unit_number, properties(name))")
          .eq("status", "active")
          .gte("end_date", today)
          .lte("end_date", in60)
          .order("end_date"),
        // Recent payments
        supabase.from("payments")
          .select("id, amount_paid, paid_at, method, invoices(category, tenants(full_name, company_name, tenant_type))")
          .order("created_at", { ascending: false })
          .limit(4),
      ]);

      // Calculate outstanding balance and overdue count
      const invList = invoices ?? [];
      const outstanding = invList.reduce((sum, inv) => {
        const paid = ((inv.payments ?? []) as { amount_paid: number }[]).reduce((ps, p) => ps + p.amount_paid, 0);
        return sum + inv.amount - paid;
      }, 0);
      const overdueCount = invList.filter((i) => i.status === "due" && i.due_date < today).length;

      setStats({
        outstanding,
        overdueCount,
        openRequests: reqs?.length ?? 0,
        vacantUnits: vacantCount ?? 0,
        totalTenants: tenantCount ?? 0,
      });
      setExpiring((leases as unknown as ExpiringLease[]) ?? []);
      setRequests((reqs as unknown as RecentRequest[]) ?? []);
      setPayments((pays as unknown as RecentPayment[]) ?? []);
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

  const todayFormatted = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-10 max-w-5xl">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[0.62rem] tracking-[0.2em] uppercase text-terracotta mb-1">Manager Portal</p>
            <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)" }}>
              {greeting()}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">{todayFormatted}</p>
          </div>
          {/* Quick actions */}
          <div className="flex gap-2 flex-wrap justify-end">
            {[
              { label: "+ Tenant", href: "/manager/tenants" },
              { label: "+ Invoice", href: "/manager/invoices" },
              { label: "+ Notice", href: "/manager/notices" },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className="text-[0.62rem] tracking-[0.1em] uppercase text-muted-foreground border border-border/60 px-3 py-1.5 rounded-lg hover:text-foreground hover:border-border transition-colors">
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Primary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">

          <Link href="/manager/invoices"
            className="bg-card border border-border/50 rounded-xl p-5 hover:border-border transition-colors">
            <p className={`text-2xl font-bold mb-1 ${stats.outstanding > 0 ? "text-red-600" : "text-green-700"}`}>
              {fmt(stats.outstanding)}
            </p>
            <p className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground">Outstanding</p>
          </Link>

          <Link href="/manager/invoices"
            className="bg-card border border-border/50 rounded-xl p-5 hover:border-border transition-colors">
            <p className={`text-2xl font-bold mb-1 ${stats.overdueCount > 0 ? "text-red-600" : "text-foreground"}`}>
              {stats.overdueCount}
            </p>
            <p className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground">Overdue Invoices</p>
          </Link>

          <Link href="/manager/requests"
            className="bg-card border border-border/50 rounded-xl p-5 hover:border-border transition-colors">
            <p className={`text-2xl font-bold mb-1 ${stats.openRequests > 0 ? "text-amber-700" : "text-foreground"}`}>
              {stats.openRequests}
            </p>
            <p className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground">Open Requests</p>
          </Link>

          <Link href="/manager/properties"
            className="bg-card border border-border/50 rounded-xl p-5 hover:border-border transition-colors">
            <p className={`text-2xl font-bold mb-1 ${stats.vacantUnits > 0 ? "text-green-700" : "text-foreground"}`}>
              {stats.vacantUnits}
            </p>
            <p className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground">Vacant Units</p>
          </Link>

        </div>

        {/* Secondary stats strip */}
        <div className="flex gap-6 px-1 mb-8 text-xs text-muted-foreground">
          <span>{stats.totalTenants} active tenant{stats.totalTenants !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span>{expiring.length} lease{expiring.length !== 1 ? "s" : ""} expiring within 60 days</span>
        </div>

        {/* Main content grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Expiring Leases */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[0.62rem] tracking-[0.18em] uppercase text-muted-foreground">Expiring Leases</p>
              <Link href="/manager/leases" className="text-[0.62rem] tracking-[0.1em] uppercase text-primary hover:opacity-70">
                View all →
              </Link>
            </div>

            {expiring.length === 0 ? (
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <p className="text-sm text-muted-foreground">No leases expiring in the next 60 days.</p>
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40">
                {expiring.map((l) => {
                  const days = daysUntil(l.end_date);
                  return (
                    <div key={l.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {tenantName(l.tenants)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {l.units?.properties?.name} · {l.units?.unit_number}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-xs font-semibold ${days <= 30 ? "text-red-600" : "text-amber-700"}`}>
                            {days}d left
                          </p>
                          <p className="text-[0.6rem] text-muted-foreground mt-0.5">{fmtDateFull(l.end_date)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Open Maintenance */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[0.62rem] tracking-[0.18em] uppercase text-muted-foreground">Open Maintenance</p>
              <Link href="/manager/requests" className="text-[0.62rem] tracking-[0.1em] uppercase text-primary hover:opacity-70">
                View all →
              </Link>
            </div>

            {requests.length === 0 ? (
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <p className="text-sm text-muted-foreground">No open maintenance requests.</p>
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40">
                {requests.map((r) => (
                  <div key={r.id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[r.priority]}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tenantName(r.tenants)} · {fmtDate(r.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[0.55rem] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${REQUEST_STATUS_STYLE[r.status] ?? "text-gray-600 bg-gray-50"}`}>
                      {r.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[0.62rem] tracking-[0.18em] uppercase text-muted-foreground">Recent Payments</p>
              <Link href="/manager/invoices" className="text-[0.62rem] tracking-[0.1em] uppercase text-primary hover:opacity-70">
                View all →
              </Link>
            </div>

            {payments.length === 0 ? (
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40">
                {payments.map((p) => (
                  <div key={p.id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-green-700">{fmt(p.amount_paid)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tenantName(p.invoices?.tenants ?? null)} · {p.method.replace("_", " ")}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground flex-shrink-0">{fmtDateFull(p.paid_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Portfolio summary */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[0.62rem] tracking-[0.18em] uppercase text-muted-foreground">Quick Links</p>
            </div>
            <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40">
              {[
                { label: "Properties & Units", sub: "Manage your portfolio", href: "/manager/properties" },
                { label: "Tenants", sub: `${stats.totalTenants} active`, href: "/manager/tenants" },
                { label: "Leases", sub: "View all contracts", href: "/manager/leases" },
                { label: "Invoices & Payments", sub: fmt(stats.outstanding) + " outstanding", href: "/manager/invoices" },
                { label: "Notices", sub: "Send communications", href: "/manager/notices" },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">→</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
