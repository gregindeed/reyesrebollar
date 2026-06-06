// components/sections/OpeningStatementSection.tsx
// Propframe section: large pull-quote intro paragraph with section label.

import { siteConfig } from "@/site.config";

export function OpeningStatementSection() {
  return (
    <div className="container mx-auto px-8 md:px-16 py-20 md:py-28">
      <div className="max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="h-px w-10 bg-brass" style={{ backgroundColor: "var(--accent-brass)" }} />
          <p className="eyebrow text-brass">The Partnership</p>
        </div>
        <p
          className="font-display leading-[1.25] text-foreground"
          style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.6rem)" }}
        >
          {siteConfig.openingStatement}
        </p>
      </div>
    </div>
  );
}
