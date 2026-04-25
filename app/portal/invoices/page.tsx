"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Payment = {
  id: string;
  amount_paid: number;
  paid_at: string;
  method: string;
  receipt_path: string | null;
};

type Invoice = {
  id: string;
  amount: number;
  due_date: string;
  category: string;
  status: string;
  description: string | null;
  created_at: string;
  payments: Payment[];
};

const STATUS_STYLE: Record<string, string> = {
  due:            "text-blue-700 bg-blue-50",
  overdue:        "text-red-700 bg-red-50",
  paid:           "text-green-700 bg-green-50",
  partially_paid: "text-amber-700 bg-amber-50",
  draft:          "text-gray-600 bg-gray-50",
  canceled:       "text-gray-500 bg-gray-50",
};

const STATUS_LABEL: Record<string, string> = {
  due: "Due", overdue: "Overdue", paid: "Paid",
  partially_paid: "Partial", draft: "Draft", canceled: "Canceled",
};

const CATEGORY_LABEL: Record<string, string> = {
  rent: "Rent", deposit: "Deposit", late_fee: "Late Fee",
  utility: "Utility", repair: "Repair", other: "Other",
};

function displayStatus(inv: Invoice): string {
  if (inv.status === "due" && new Date(inv.due_date) < new Date()) return "overdue";
  return inv.status;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function TenantInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/portal/login"); return; }

      const { data: tenant } = await supabase
        .from("tenants").select("id").eq("email", session.user.email).single();

      if (!tenant) { setLoading(false); return; }

      const { data } = await supabase
        .from("invoices")
        .select("*, payments(*)")
        .eq("tenant_id", tenant.id)
        .neq("status", "draft")
        .order("due_date", { ascending: false });

      setInvoices((data as Invoice[]) ?? []);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleReceiptDownload = async (path: string) => {
    setDownloading(path);
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    setDownloading(null);
  };

  const totalBalance = invoices
    .filter((i) => displayStatus(i) !== "paid" && i.status !== "canceled")
    .reduce((s, i) => s + i.amount - (i.payments?.reduce((ps, p) => ps + p.amount_paid, 0) ?? 0), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-14 max-w-2xl">
        <div className="mb-8">
          <p className="text-[0.65rem] tracking-[0.22em] uppercase text-terracotta mb-3">Billing</p>
          <h1 className="font-display text-foreground mb-6" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
            Invoices & Payments
          </h1>

          {/* Balance summary */}
          <div className={`rounded-xl p-5 border ${totalBalance > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
            <p className="text-[0.6rem] uppercase tracking-wide text-muted-foreground mb-1">Current Balance</p>
            <p className={`text-3xl font-bold ${totalBalance > 0 ? "text-red-700" : "text-green-700"}`}>
              {fmt(totalBalance)}
            </p>
            {totalBalance === 0 && <p className="text-xs text-green-700 mt-1">You're all caught up!</p>}
          </div>

          {/* Payment instructions */}
          <div className="mt-4 bg-card border border-border/50 rounded-xl p-4">
            <p className="text-[0.6rem] uppercase tracking-wide text-muted-foreground mb-2">How to Pay</p>
            <p className="text-xs text-foreground leading-relaxed">
              We accept Zelle, Venmo, check, and cash. Please send payments to{" "}
              <span className="font-medium">reyes@reyesrebollar.com</span> or contact your property manager for payment details.
            </p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No invoices on file.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => {
              const ds = displayStatus(inv);
              const paid = inv.payments.reduce((s, p) => s + p.amount_paid, 0);
              const rem = inv.amount - paid;
              const isOpen = expanded === inv.id;
              return (
                <div key={inv.id} className="bg-card border border-border/50 rounded-xl overflow-hidden">
                  <button className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                    onClick={() => setExpanded(isOpen ? null : inv.id)}>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-foreground">{CATEGORY_LABEL[inv.category]}</p>
                        <span className={`text-[0.55rem] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full ${STATUS_STYLE[ds]}`}>
                          {STATUS_LABEL[ds]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Due {fmtDate(inv.due_date)}</p>
                      {inv.description && <p className="text-xs text-muted-foreground mt-0.5">{inv.description}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-foreground">{fmt(inv.amount)}</p>
                      {rem > 0 && rem < inv.amount && (
                        <p className="text-xs text-amber-600">{fmt(rem)} remaining</p>
                      )}
                      {ds === "paid" && <p className="text-xs text-green-700">Paid in full</p>}
                    </div>
                  </button>

                  {isOpen && inv.payments.length > 0 && (
                    <div className="border-t border-border/40 divide-y divide-border/30">
                      {inv.payments.map((p) => (
                        <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-green-700">{fmt(p.amount_paid)} paid</p>
                            <p className="text-[0.6rem] text-muted-foreground mt-0.5">
                              {fmtDate(p.paid_at)} · {p.method.replace("_", " ")}
                            </p>
                          </div>
                          {p.receipt_path && (
                            <button onClick={() => handleReceiptDownload(p.receipt_path!)}
                              disabled={downloading === p.receipt_path}
                              className="text-[0.6rem] tracking-[0.1em] uppercase text-primary border border-primary/30 px-2.5 py-1 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-40">
                              {downloading === p.receipt_path ? "…" : "Receipt"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {isOpen && inv.payments.length === 0 && (
                    <div className="border-t border-border/40 px-5 py-3">
                      <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
