"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const links = [
  { href: "/manager/dashboard", label: "Dashboard" },
  { href: "/manager/tenants", label: "Tenants" },
  { href: "/manager/requests", label: "Maintenance" },
];

export function ManagerNav({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/manager/login");
  };

  return (
    <header className="bg-white border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/manager/dashboard" className="flex items-center gap-3">
            <Image src="/reyesrebollar_logo.png" alt="RRP" width={30} height={30} className="object-contain opacity-85" />
            <div>
              <p className="text-xs font-medium leading-tight">Reyes Rebollar</p>
              <p className="text-[0.58rem] tracking-[0.16em] uppercase text-terracotta leading-tight">Manager</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 ml-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs tracking-[0.08em] transition-colors ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          {email && <span className="text-xs text-muted-foreground hidden sm:block">{email}</span>}
          <button
            onClick={handleSignOut}
            className="text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
