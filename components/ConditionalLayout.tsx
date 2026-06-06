"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isApp = pathname.startsWith("/portal") || pathname.startsWith("/manager");
  const isHome = pathname === "/";

  if (isApp) return <>{children}</>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Home hero sits under the transparent fixed header; other pages clear it. */}
      <main className={`flex-1 ${isHome ? "" : "pt-20 md:pt-24"}`}>{children}</main>
      <Footer />
    </div>
  );
}
