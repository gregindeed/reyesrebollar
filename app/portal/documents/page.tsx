"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Doc = {
  id: string;
  name: string;
  document_type: string;
  file_path: string;
  entity_type: string;
  created_at: string;
};

export default function TenantDocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/portal/login"); return; }
      setUser(session.user);

      const { data: tenant } = await supabase
        .from("tenants").select("id, leases(id)").eq("email", session.user.email).single();

      if (!tenant) { setLoading(false); return; }

      const entityIds = [tenant.id, ...((tenant.leases as { id: string }[] | null) ?? []).map((l) => l.id)];

      const { data: documents } = await supabase
        .from("documents")
        .select("id, name, document_type, file_path, entity_type, created_at")
        .eq("is_shared", true)
        .in("entity_id", entityIds)
        .order("created_at", { ascending: false });

      setDocs((documents as Doc[]) ?? []);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleDownload = async (doc: Doc) => {
    setDownloading(doc.id);
    const { data } = await supabase.storage.from("documents").createSignedUrl(doc.file_path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    setDownloading(null);
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const DOC_TYPE_LABEL: Record<string, string> = {
    lease: "Lease", contract: "Contract", addendum: "Addendum",
    inspection: "Inspection", notice: "Notice", id: "ID",
    receipt: "Receipt", invoice: "Invoice", photo: "Photo", other: "Document",
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Portal Nav */}
      <header className="bg-white border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/portal/dashboard" className="flex items-center gap-3">
            <Image src="/reyesrebollar_logo.png" alt="RRP" width={32} height={32} className="object-contain opacity-85" />
            <div>
              <p className="text-sm font-medium leading-tight">Reyes Rebollar Properties</p>
              <p className="text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground leading-tight">Tenant Portal</p>
            </div>
          </Link>
          <Link href="/portal/dashboard"
            className="text-[0.65rem] tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-14 max-w-2xl">
        <div className="mb-10">
          <p className="text-[0.65rem] tracking-[0.22em] uppercase text-terracotta mb-3">Portal</p>
          <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
            My Documents
          </h1>
        </div>

        {docs.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-xl p-10 text-center">
            <p className="text-sm text-muted-foreground mb-1">No documents have been shared with you yet.</p>
            <p className="text-xs text-muted-foreground">
              Contact your property manager at{" "}
              <a href="mailto:reyes@reyesrebollar.com" className="underline hover:opacity-70">
                reyes@reyesrebollar.com
              </a>
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/40">
            {docs.map((doc) => (
              <div key={doc.id} className="px-5 py-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {DOC_TYPE_LABEL[doc.document_type] ?? "Document"} · {fmtDate(doc.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  disabled={downloading === doc.id}
                  className="text-xs tracking-[0.1em] uppercase text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  {downloading === doc.id ? "…" : "Download"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
