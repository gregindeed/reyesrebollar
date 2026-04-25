import type { Metadata } from "next";
import { ManagerSidebar } from "@/components/ManagerSidebar";

export const metadata: Metadata = {
  title: "Manager Portal — Reyes Rebollar Properties LLC",
};

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <ManagerSidebar />
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>
    </div>
  );
}
