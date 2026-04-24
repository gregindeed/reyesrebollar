import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type MaintenanceRequest = {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  priority: "low" | "normal" | "urgent";
  status: "open" | "in_progress" | "resolved";
  created_at: string;
  updated_at: string;
};

export type Lease = {
  id: string;
  tenant_id: string;
  property_address: string;
  unit: string | null;
  start_date: string;
  end_date: string;
  rent_amount: number;
};

export type Tenant = {
  id: string;
  full_name: string | null;
  phone: string | null;
  unit: string | null;
  property_id: string | null;
};

export type Document = {
  id: string;
  tenant_id: string;
  name: string;
  file_url: string | null;
  created_at: string;
};
