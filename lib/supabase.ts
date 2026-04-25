import { createClient } from "@supabase/supabase-js";

// Fallback placeholders prevent the build from crashing during static prerender.
// At runtime, real values from env are always present.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key"
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
  entity_type: string;
  entity_id: string;
  name: string;
  document_type: string;
  file_url: string;
  file_path: string;
  is_shared: boolean;
  uploaded_by: string | null;
  created_at: string;
};

export type Property = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  type: "residential" | "commercial" | "mixed";
  status: "active" | "inactive";
  notes: string | null;
  created_at: string;
  units?: Unit[];
};

export type Unit = {
  id: string;
  property_id: string;
  unit_number: string;
  rent_amount: number;
  deposit_amount: number;
  status: "vacant" | "occupied" | "pending_move_in" | "pending_move_out" | "maintenance";
  sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  notes: string | null;
  created_at: string;
};

export type Invoice = {
  id: string;
  tenant_id: string;
  lease_id: string | null;
  unit_id: string | null;
  amount: number;
  due_date: string;
  category: "rent" | "deposit" | "late_fee" | "utility" | "repair" | "other";
  status: "draft" | "due" | "overdue" | "paid" | "partially_paid" | "canceled";
  description: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  invoice_id: string;
  amount_paid: number;
  paid_at: string;
  method: "check" | "cash" | "zelle" | "venmo" | "bank_transfer" | "money_order" | "other";
  notes: string | null;
  receipt_url: string | null;
  receipt_path: string | null;
  recorded_by: string | null;
  created_at: string;
};

export type Notice = {
  id: string;
  type: "rent_reminder" | "late_rent" | "lease_renewal" | "entry_notice" | "maintenance" | "general";
  subject: string;
  body: string;
  sent_to_type: "tenant" | "property" | "all";
  property_id: string | null;
  tenant_id: string | null;
  sent_at: string;
};
