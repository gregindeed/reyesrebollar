// lib/useCompanyAuth.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared auth guard for manager pages.
//
// Replaces the old email-domain check with a company_members table lookup.
// Usage:
//
//   const { user, unauthorized, checked } = useCompanyAuth();
//
//   useEffect(() => {
//     if (!checked) return;
//     if (unauthorized || !user) return;      // guard handles redirect/message
//     // load page data...
//   }, [checked, unauthorized, user]);
//
// The hook handles:
//   1. Missing session → redirect to /manager/login
//   2. Missing NEXT_PUBLIC_COMPANY_ID → sets unauthorized with a clear message
//   3. No active company_members row → sets unauthorized + signs out
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import { useRouter }           from "next/navigation";
import type { User }           from "@supabase/supabase-js";
import { supabase }            from "@/lib/supabase";
import { COMPANY_ID }          from "@/site.config";

export type CompanyAuthState = {
  user:         User | null;
  unauthorized: boolean;
  authError:    string | null;
  checked:      boolean;   // true once the async check is complete
};

export function useCompanyAuth(): CompanyAuthState {
  const router = useRouter();
  const [user,         setUser]         = useState<User | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [authError,    setAuthError]    = useState<string | null>(null);
  const [checked,      setChecked]      = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/manager/login");
        return;
      }

      if (!COMPANY_ID) {
        if (!cancelled) {
          setAuthError(
            "This deployment is missing NEXT_PUBLIC_COMPANY_ID. " +
            "Contact your administrator."
          );
          setUnauthorized(true);
          setChecked(true);
        }
        return;
      }

      const { data, error } = await supabase
        .from("company_members")
        .select("id, status")
        .eq("user_id", session.user.id)
        .eq("company_id", COMPANY_ID)
        .single();

      if (cancelled) return;

      if (error || !data) {
        await supabase.auth.signOut();
        setAuthError(
          "Your account is not authorized for this company portal. " +
          "Contact your administrator."
        );
        setUnauthorized(true);
        setChecked(true);
        return;
      }

      if (data.status !== "active") {
        await supabase.auth.signOut();
        setAuthError(
          `Your account status is "${data.status}". ` +
          "Contact your administrator to activate it."
        );
        setUnauthorized(true);
        setChecked(true);
        return;
      }

      setUser(session.user);
      setChecked(true);
    }

    check();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, unauthorized, authError, checked };
}
