// components/sections/ClosingQuoteSection.tsx
// Propframe section: full-bleed charcoal closing quote in display type.

import { siteConfig } from "@/site.config";

export function ClosingQuoteSection() {
  return (
    <div className="bg-ink text-on-ink">
      <div className="container mx-auto px-8 md:px-16 py-24 md:py-36">
        <div className="max-w-4xl">
          <span
            className="block h-px w-12 mb-10"
            style={{ backgroundColor: "var(--accent-brass)" }}
          />
          <p
            className="font-display italic font-light leading-[1.3]"
            style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.8rem)" }}
          >
            {siteConfig.closingQuote}
          </p>
          <p className="eyebrow text-white/45 mt-10">
            {siteConfig.companyShort} · {siteConfig.city}
          </p>
        </div>
      </div>
    </div>
  );
}
