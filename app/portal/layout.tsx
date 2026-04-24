import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenant Portal — Reyes Rebollar Properties LLC",
  description: "Tenant portal for Reyes Rebollar Properties LLC",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
