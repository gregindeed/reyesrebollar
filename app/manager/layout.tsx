import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manager Portal — Reyes Rebollar Properties LLC",
  description: "Property management portal for Reyes Rebollar Properties LLC",
};

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
