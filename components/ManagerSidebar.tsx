"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const links = [
  { href: "/manager/dashboard", label: "Dashboard" },
  { href: "/manager/properties", label: "Properties" },
  { href: "/manager/tenants", label: "Tenants" },
  { href: "/manager/leases", label: "Leases" },
  { href: "/manager/invoices", label: "Invoices" },
  { href: "/manager/requests", label: "Maintenance" },
  { href: "/manager/notices", label: "Notices" },
];

export function ManagerSidebar() {
  const [email, setEmail] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // useEffect must always be called before any conditional return
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
    });
  }, []);

  // Don't render sidebar on login/entry pages
  if (pathname === "/manager/login" || pathname === "/manager") return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/manager/login");
  };

  return (
    <aside className="w-56 shrink-0 bg-card border-r border-border/40 flex flex-col min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-border/40">
        <Link href="/manager/dashboard" className="flex items-center gap-2.5">
          <Image
            src="/reyesrebollar_logo.png"
            alt="RRP"
            width={28}
            height={28}
            className="object-contain opacity-80"
          />
          <div>
            <p className="text-xs font-semibold tracking-wide leading-tight text-foreground">
              Reyes Rebollar
            </p>
            <p className="text-[0.58rem] tracking-[0.16em] uppercase text-terracotta leading-tight mt-0.5">
              Manager
            </p>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 pt-4">
        <p className="text-[0.58rem] tracking-[0.16em] uppercase text-muted-foreground/60 px-3 mb-2">
          Navigation
        </p>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors ${
              pathname === link.href
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {link.label}
          </Link>
        ))}

        <div className="border-t border-border/40 mt-4 pt-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            ← Main site
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-border/40">
        {email && (
          <p className="text-[0.65rem] text-muted-foreground mb-3 truncate">{email}</p>
        )}
        <button
          onClick={handleSignOut}
          className="text-[0.62rem] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
