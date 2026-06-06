// lib/supabase.ts — propframe platform Supabase client
// Points to the same shared Supabase project as all client deployments.

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL      ?? "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key"
);

// ── Platform types ──────────────────────────────────────────────────────────

export type Company = {
  id:         string;
  name:       string;
  slug:       string;
  status:     "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
};

export type CompanyMember = {
  id:         string;
  user_id:    string;
  company_id: string;
  role:       "owner" | "admin" | "manager" | "staff" | "viewer";
  status:     "active" | "inactive";
  created_at: string;
};
