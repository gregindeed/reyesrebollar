"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase, type Tenant, type Lease, type MaintenanceRequest } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const STATUS_COLOR: Record<string, string> = {
  open: "text-amber-700 bg-amber-50",
  in_progress: "text-blue-700 bg-blue-50",
  resolved: "text-green-700 bg-green-50",
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "text-muted-foreground",
  normal: "text-foreground",
  urgent: "text-red-600 font-medium",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [lease, setLease] = useState<Lease | null>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/portal/login"); return; }

      setUser(session.user);

      // Find tenant by email (matches record created by manager)
      const { data: tenantData } = await supabase
        .from("tenants").select("*").eq("email", session.user.email).single();

      // Update user_id link if not set
      if (tenantData && !tenantData.user_id) {
        await supabase.from("tenants").update({ user_id: session.user.id }).eq("id", tenantData.id);
      }

      const [{ data: leaseData }, { data: reqData }, { count: dCount }, { data: invData }] = await Promise.all([
        supabase.from("leases").select("*").eq("tenant_id", tenantData?.id ?? "").order("start_date", { ascending: false }).limit(1).single(),
        supabase.from("maintenance_requests").select("*").eq("tenant_id", tenantData?.id ?? "").order("created_at", { ascending: false }).limit(5),
        supabase.from("documents").select("*", { count: "exact", head: true }).eq("is_shared", true).in("entity_id", [tenantData?.id ?? ""]),
        supabase.from("invoices").select("amount, status, payments(amount_paid)").eq("tenant_id", tenantData?.id ?? "").neq("status", "paid").neq("status", "canceled").neq("status", "draft"),
      ]);

      const bal = (invData ?? []).reduce((s: number, inv: { amount: number; payments: { amount_paid: number }[] }) => {
        const paid = inv.payments.reduce((ps, p) => ps + p.amount_paid, 0);
        return s + inv.amount - paid;
      }, 0);

      setTenant(tenantData);
      setLease(leaseData);
      setRequests(reqData ?? []);
      setDocCount(dCount ?? 0);
      setBalance(bal);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/portal/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen">
      {/* Portal Nav */}
      <header className="bg-white border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/reyesrebollar_logo.png" alt="RRP" width={32} height={32} className="object-contain opacity-85" />
            <div>
              <p className="text-sm font-medium leading-tight">Reyes Rebollar Properties</p>
              <p className="text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground leading-tight">Tenant Portal</p>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-[0.65rem] tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-terracotta mb-3">Welcome back</p>
          <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            {tenant?.full_name ?? user?.email?.split("@")[0]}
          </h1>
        </div>

        {/* Balance */}
        <div className="mb-8">
          <div className={`rounded-xl p-5 border ${balance > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.6rem] uppercase tracking-wide text-muted-foreground mb-1">Current Balance</p>
                <p className={`text-3xl font-bold ${balance > 0 ? "text-red-700" : "text-green-700"}`}>
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(balance)}
                </p>
                {balance === 0 && <p className="text-xs text-green-700 mt-1">You're all caught up!</p>}
              </div>
              <Link href="/portal/invoices"
                className="text-xs tracking-[0.1em] uppercase text-primary border border-primary/30 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors">
                View Invoices
              </Link>
            </div>
          </div>
        </div>

        {/* Lease card */}
        <div className="mb-6">
          <p className="text-[0.62rem] tracking-[0.18em] uppercase text-muted-foreground mb-4">Your Lease</p>
          {lease ? (
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1">Property</p>
                  <p className="text-sm font-medium text-foreground">{lease.property_address}</p>
                </div>
                {lease.unit && (
                  <div>
                    <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1">Unit</p>
                    <p className="text-sm font-medium text-foreground">{lease.unit}</p>
                  </div>
                )}
                <div>
                  <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1">Monthly Rent</p>
                  <p className="text-sm font-medium text-foreground">{formatCurrency(lease.rent_amount)}</p>
                </div>
                <div>
                  <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1">Lease Start</p>
                  <p className="text-sm text-foreground">{formatDate(lease.start_date)}</p>
                </div>
                <div>
                  <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1">Lease End</p>
                  <p className="text-sm text-foreground">{formatDate(lease.end_date)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <p className="text-sm text-muted-foreground">No lease information on file yet. Contact us at reyes@reyesrebollar.com.</p>
            </div>
          )}
        </div>

        {/* Maintenance requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.62rem] tracking-[0.18em] uppercase text-muted-foreground">Maintenance</p>
            <Link
              href="/portal/maintenance"
              className="text-[0.62rem] tracking-[0.14em] uppercase text-primary hover:opacity-70 transition-opacity"
            >
              + New Request
            </Link>
          </div>

          {requests.length > 0 ? (
            <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40">
              {requests.map((req) => (
                <div key={req.id} className="px-6 py-4 flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-sm font-medium mb-0.5 ${PRIORITY_COLOR[req.priority]}`}>
                      {req.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(req.created_at)}</p>
                  </div>
                  <span className={`text-[0.6rem] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLOR[req.status]}`}>
                    {STATUS_LABEL[req.status]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <p className="text-sm text-muted-foreground">No maintenance requests yet.</p>
              <Link
                href="/portal/maintenance"
                className="inline-block mt-3 text-[0.65rem] tracking-[0.14em] uppercase text-primary border-b border-primary/30 pb-0.5 hover:opacity-70 transition-opacity"
              >
                Submit your first request →
              </Link>
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[0.62rem] tracking-[0.18em] uppercase text-muted-foreground">Documents</p>
            <Link href="/portal/documents"
              className="text-[0.62rem] tracking-[0.12em] uppercase text-primary hover:opacity-70 transition-opacity">
              View all →
            </Link>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-5">
            {docCount > 0 ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">
                  {docCount} document{docCount !== 1 ? "s" : ""} shared with you
                </p>
                <Link href="/portal/documents"
                  className="text-xs tracking-[0.1em] uppercase text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                  View &amp; Download
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No documents shared yet.</p>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
