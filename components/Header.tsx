"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/site.config";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Overlay (transparent, light text) only on the homepage hero, before scroll.
  const overlay = isHome && !scrolled;

  return (
    <header
      className={[
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        overlay
          ? "bg-transparent border-b border-transparent py-5"
          : "bg-background/85 backdrop-blur-md border-b border-border py-3.5",
      ].join(" ")}
    >
      <div className="container mx-auto px-6 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div>
            <p
              className={[
                "font-display text-base leading-tight transition-colors",
                overlay ? "text-white" : "text-foreground",
              ].join(" ")}
            >
              {siteConfig.companyName}
            </p>
            <p
              className={[
                "text-[0.6rem] tracking-[0.22em] uppercase leading-tight mt-0.5 transition-colors",
                overlay ? "text-white/70" : "text-muted-foreground",
              ].join(" ")}
            >
              {siteConfig.subtitle}
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-7">
          <Link
            href="/properties"
            className={[
              "hidden sm:inline-block text-[0.7rem] tracking-[0.16em] uppercase transition-colors",
              overlay ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            Properties
          </Link>
          <Link
            href="/about"
            className={[
              "hidden sm:inline-block text-[0.7rem] tracking-[0.16em] uppercase transition-colors",
              overlay ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            About
          </Link>
          <Link
            href="/portal"
            className={[
              "text-[0.7rem] tracking-[0.16em] uppercase px-4 py-2 rounded-full transition-colors",
              overlay
                ? "border border-white/40 text-white hover:bg-white/10 hover:border-white/70"
                : "bg-primary text-primary-foreground hover:opacity-90",
            ].join(" ")}
          >
            Tenant Portal
          </Link>
        </nav>
      </div>
    </header>
  );
}
