"use client";

import { usePathname } from "next/navigation";
import { PortalNav } from "@/components/PortalNav";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/portal/login" || pathname === "/portal";

  return (
    <div className="min-h-screen bg-background">
      {!isLogin && <PortalNav />}
      {children}
    </div>
  );
}
