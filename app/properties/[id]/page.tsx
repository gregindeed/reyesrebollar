// app/properties/[id]/page.tsx
// Property-level detail (addresses, valuations, income) is private.
// Public requests are redirected to the secure portal login — the data
// is never rendered or shipped to the public client.

import { redirect } from "next/navigation";

export default function PropertyDetailPage() {
  redirect("/portal/login");
}
