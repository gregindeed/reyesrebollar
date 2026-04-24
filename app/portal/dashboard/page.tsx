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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/portal/login"); return; }

      setUser(session.user);

      const [{ data: tenantData }, { data: leaseData }, { data: reqData }] =
        await Promise.all([
          supabase.from("tenants").select("*").eq("id", session.user.id).single(),
          supabase.from("leases").select("*").eq("tenant_id", session.user.id).order("start_date", { ascending: false }).limit(1).single(),
          supabase.from("maintenance_requests").select("*").eq("tenant_id", session.user.id).order("created_at", { ascending: false }).limit(5),
        ]);

      setTenant(tenantData);
      setLease(leaseData);
      setRequests(reqData ?? []);
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
        <div className="mb-12">
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-terracotta mb-3">Welcome back</p>
          <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            {tenant?.full_name ?? user?.email?.split("@")[0]}
          </h1>
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
      </main>
    </div>
  );
}
