import Link from "next/link";
import { siteConfig } from "@/site.config";

export function Footer() {
  return (
    <footer className="bg-ink text-on-ink mt-auto">
      <div className="container mx-auto px-6 md:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <p className="font-display text-2xl mb-2">
              {siteConfig.companyName}
            </p>
            <p className="eyebrow text-white/55">
              {siteConfig.city}
            </p>
            <p className="text-sm text-white/55 mt-6 leading-relaxed">
              {siteConfig.subtitle} · Est. 2023
            </p>
          </div>

          <div className="flex flex-wrap gap-12 md:gap-16">
            <div>
              <p className="eyebrow text-white/45 mb-4">Navigate</p>
              <div className="flex flex-col gap-3">
                <Link href="/" className="text-sm text-white/70 hover:text-on-ink transition-colors">
                  Home
                </Link>
                <Link href="/properties" className="text-sm text-white/70 hover:text-on-ink transition-colors">
                  Properties
                </Link>
                <Link href="/about" className="text-sm text-white/70 hover:text-on-ink transition-colors">
                  About
                </Link>
              </div>
            </div>
            <div>
              <p className="eyebrow text-white/45 mb-4">Contact</p>
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-sm text-white/70 hover:text-on-ink transition-colors"
              >
                {siteConfig.email}
              </a>
            </div>
            <div>
              <p className="eyebrow text-white/45 mb-4">Access</p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/portal/login"
                  className="text-sm text-white/70 hover:text-on-ink transition-colors"
                >
                  Tenant Portal
                </Link>
                <Link
                  href="/manager/login"
                  className="text-sm text-white/70 hover:text-on-ink transition-colors"
                >
                  Manager Portal
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-14 pt-6">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} {siteConfig.companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
