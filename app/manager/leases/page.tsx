"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function LeasesPage() {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || !session.user.email?.endsWith("@reyesrebollar.com"))
        router.replace("/manager/login");
    });
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-[0.62rem] tracking-[0.2em] uppercase text-terracotta mb-3">Coming Soon</p>
        <h1 className="font-display text-2xl text-foreground mb-2">Leases</h1>
        <p className="text-sm text-muted-foreground">Building in Phase 3 — after tenants are set up.</p>
      </div>
    </div>
  );
}
