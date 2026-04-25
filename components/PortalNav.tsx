"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const links = [
  { href: "/portal/dashboard",    label: "Home" },
  { href: "/portal/invoices",     label: "Invoices" },
  { href: "/portal/documents",    label: "Documents" },
  { href: "/portal/maintenance",  label: "Maintenance" },
  { href: "/portal/notices",      label: "Notices" },
];

export function PortalNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/portal/login");
  };

  return (
    <header className="bg-white border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/portal/dashboard" className="flex items-center gap-3 flex-shrink-0">
            <Image src="/reyesrebollar_logo.png" alt="RRP" width={30} height={30} className="object-contain opacity-85" />
            <div>
              <p className="text-xs font-semibold leading-tight">Reyes Rebollar</p>
              <p className="text-[0.58rem] tracking-[0.14em] uppercase text-muted-foreground leading-tight">Tenant Portal</p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-1 mx-6">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className={`px-3 py-1.5 rounded-lg text-xs tracking-[0.06em] transition-colors ${
                  pathname === l.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Sign out */}
          <button onClick={handleSignOut}
            className="text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground transition-colors">
            Sign out
          </button>
        </div>

        {/* Mobile nav */}
        <div className="flex sm:hidden gap-1 mt-2 overflow-x-auto pb-0.5">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-lg text-xs tracking-[0.06em] transition-colors whitespace-nowrap ${
                pathname === l.href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
