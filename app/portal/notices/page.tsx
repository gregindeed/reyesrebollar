"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Notice = {
  id: string;
  type: string;
  subject: string;
  body: string;
  sent_to_type: string;
  sent_at: string;
};

const TYPE_LABEL: Record<string, string> = {
  general: "General", rent_reminder: "Rent Reminder", late_rent: "Late Rent",
  lease_renewal: "Lease Renewal", entry_notice: "Entry Notice", maintenance: "Maintenance",
};

const TYPE_STYLE: Record<string, string> = {
  general:       "text-gray-600 bg-gray-100",
  rent_reminder: "text-blue-700 bg-blue-50",
  late_rent:     "text-red-700 bg-red-50",
  lease_renewal: "text-amber-700 bg-amber-50",
  entry_notice:  "text-purple-700 bg-purple-50",
  maintenance:   "text-orange-700 bg-orange-50",
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function TenantNoticesPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/portal/login"); return; }

      // RLS policy handles filtering automatically
      const { data } = await supabase
        .from("notices")
        .select("id, type, subject, body, sent_to_type, sent_at")
        .order("sent_at", { ascending: false });

      setNotices((data as Notice[]) ?? []);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-14 max-w-2xl">
        <div className="mb-10">
          <p className="text-[0.65rem] tracking-[0.22em] uppercase text-terracotta mb-3">From Management</p>
          <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>Notices</h1>
        </div>

        {notices.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-xl p-10 text-center">
            <p className="text-sm text-muted-foreground">No notices from your property manager yet.</p>
          </div>
        ) : (
          <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40 overflow-hidden">
            {notices.map((n) => (
              <div key={n.id}>
                <button className="w-full text-left px-5 py-5 hover:bg-muted/30 transition-colors"
                  onClick={() => setExpanded(expanded === n.id ? null : n.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[0.55rem] tracking-[0.08em] uppercase px-2.5 py-1 rounded-full ${TYPE_STYLE[n.type]}`}>
                          {TYPE_LABEL[n.type] ?? n.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{n.subject}</p>
                      {expanded !== n.id && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{n.body}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">{fmtDate(n.sent_at)}</p>
                      <p className="text-[0.6rem] text-muted-foreground mt-1">{expanded === n.id ? "▲" : "▼"}</p>
                    </div>
                  </div>
                </button>
                {expanded === n.id && (
                  <div className="px-5 pb-6 pt-2 border-t border-border/30 bg-muted/10">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{n.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
