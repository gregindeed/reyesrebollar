"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ManagerNav } from "@/components/ManagerNav";
import type { User } from "@supabase/supabase-js";

type Request = {
  id: string; title: string; description: string | null;
  priority: string; status: string; created_at: string; updated_at: string;
  tenants: { full_name: string | null; email: string; unit: string | null } | null;
};

const STATUS_OPTIONS = ["open", "in_progress", "resolved"];
const STATUS_LABEL: Record<string, string> = { open: "Open", in_progress: "In Progress", resolved: "Resolved" };
const STATUS_COLOR: Record<string, string> = {
  open: "text-amber-700 bg-amber-50 border-amber-200",
  in_progress: "text-blue-700 bg-blue-50 border-blue-200",
  resolved: "text-green-700 bg-green-50 border-green-200",
};
const PRIORITY_DOT: Record<string, string> = {
  low: "bg-muted-foreground/30", normal: "bg-primary/50", urgent: "bg-red-500",
};

export default function ManagerRequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("maintenance_requests")
      .select("*, tenants(full_name, email, unit)")
      .order("created_at", { ascending: false });
    setRequests((data as unknown as Request[]) ?? []);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/manager/login"); return; }
      const { data: adminData } = await supabase.from("admins").select("id").eq("id", session.user.id).single();
      if (!adminData) { router.replace("/manager/login"); return; }
      setUser(session.user);
      await fetchRequests();
      setLoading(false);
    };
    init();
  }, [router]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await supabase.from("maintenance_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    await fetchRequests();
    setUpdating(null);
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);
  const countFor = (s: string) => s === "all" ? requests.length : requests.filter(r => r.status === s).length;
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen">
      <ManagerNav email={user?.email} />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-10">
          <p className="text-[0.62rem] tracking-[0.2em] uppercase text-terracotta mb-2">Queue</p>
          <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>Maintenance Requests</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-[0.62rem] tracking-[0.14em] uppercase pb-0.5 transition-colors ${
                filter === s
                  ? "text-foreground border-b border-foreground"
                  : "text-muted-foreground border-b border-transparent hover:text-foreground"
              }`}>
              {s === "all" ? "All" : STATUS_LABEL[s]}
              <span className="ml-1.5 opacity-50">({countFor(s)})</span>
            </button>
          ))}
        </div>

        {/* Requests */}
        {filtered.length > 0 ? (
          <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40">
            {filtered.map((req) => (
              <div key={req.id} className="px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${PRIORITY_DOT[req.priority]}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground mb-0.5">{req.title}</p>
                      {req.description && (
                        <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{req.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-[0.6rem] tracking-wide text-muted-foreground uppercase">
                        <span>{req.tenants?.full_name ?? req.tenants?.email ?? "Unknown"}</span>
                        {req.tenants?.unit && <span>Unit {req.tenants.unit}</span>}
                        <span>{fmt(req.created_at)}</span>
                        <span className="capitalize">{req.priority} priority</span>
                      </div>
                    </div>
                  </div>

                  {/* Status selector */}
                  <div className="flex-shrink-0">
                    <select
                      value={req.status}
                      onChange={(e) => updateStatus(req.id, e.target.value)}
                      disabled={updating === req.id}
                      className={`text-[0.6rem] tracking-[0.1em] uppercase border rounded-full px-3 py-1.5 focus:outline-none cursor-pointer disabled:opacity-50 transition-colors ${STATUS_COLOR[req.status]}`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No requests with this status.</p>
          </div>
        )}
      </main>
    </div>
  );
}
