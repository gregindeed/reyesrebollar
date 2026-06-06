// app/properties/page.tsx
// Public portfolio page — privacy-safe aggregate only.
// No street addresses or property-level financials are exposed here.
// Detailed records live behind the secure portal.

import Link from "next/link";
import { properties } from "@/lib/data/properties";
import { getPropertyTypeLabel } from "@/lib/portfolio-utils";
import { siteConfig } from "@/site.config";

export const metadata = {
  title: `Portfolio — ${siteConfig.companyName}`,
  description:
    "An overview of the regions and asset classes held by " +
    `${siteConfig.companyName}. Detailed records are kept private.`,
};

export default function PropertiesPage() {
  const active = properties.filter((p) => p.status === "active");
  const totalUnits = active.reduce((sum, p) => sum + (p.units ?? 1), 0);
  const sinceYear = properties.reduce(
    (min, p) => Math.min(min, new Date(p.purchaseDate + "T00:00:00").getFullYear()),
    9999
  );

  // Property-type mix (counts only — no addresses)
  const typeCounts = active.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1;
    return acc;
  }, {});
  const typeMix = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  const stats = [
    { value: String(active.length), label: "Holdings" },
    { value: String(totalUnits), label: "Units" },
    { value: String(siteConfig.regions.length), label: "Regions" },
    { value: `'${String(sinceYear).slice(2)}`, label: "Established" },
  ];

  return (
    <div className="container mx-auto px-8 md:px-16 py-16 md:py-24">

      {/* Header */}
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-10" style={{ backgroundColor: "var(--accent-brass)" }} />
          <p className="eyebrow text-brass">Portfolio</p>
        </div>
        <h1
          className="font-display text-foreground leading-[1.04] mb-6"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
        >
          A portfolio built to last
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          {siteConfig.companyName} holds a growing portfolio of residential and
          commercial real estate across Southern California and Mexico. As a
          privately held family company, we keep individual holding details
          confidential — the overview below reflects the shape of what we&rsquo;ve built.
        </p>
      </div>

      {/* Aggregate stats */}
      <dl className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border rounded-xl overflow-hidden">
        {stats.map((s) => (
          <div key={s.label} className="bg-card p-7 md:p-8">
            <dd className="font-display text-4xl md:text-5xl text-foreground leading-none">
              {s.value}
            </dd>
            <dt className="mt-3 text-[0.62rem] tracking-[0.2em] uppercase text-muted-foreground">
              {s.label}
            </dt>
          </div>
        ))}
      </dl>

      {/* Asset classes + regions */}
      <div className="mt-20 grid lg:grid-cols-2 gap-16 lg:gap-24">
        <div>
          <p className="eyebrow text-brass mb-7">Asset Classes</p>
          <div className="space-y-5">
            {typeMix.map(([type, count]) => (
              <div
                key={type}
                className="flex items-baseline justify-between border-b border-border pb-4"
              >
                <span className="font-display text-xl md:text-2xl text-foreground">
                  {getPropertyTypeLabel(type as never)}
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {count} {count === 1 ? "holding" : "holdings"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow text-brass mb-7">Regions</p>
          <div className="space-y-5">
            {siteConfig.regions.map((r) => (
              <div key={r.name} className="border-b border-border pb-4">
                <p className="font-display text-xl md:text-2xl text-foreground leading-tight">
                  {r.name}
                </p>
                <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground mt-1.5">
                  {r.area}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Private records note */}
      <div className="mt-20 bg-ink text-on-ink rounded-2xl p-10 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="max-w-lg">
          <p className="eyebrow text-sage-light mb-4">Detailed Records</p>
          <p className="font-display text-2xl md:text-3xl leading-snug">
            Holding-level details are kept private.
          </p>
          <p className="text-sm text-white/65 leading-relaxed mt-4">
            Tenants and partners can access statements, documents, and property
            information securely through the portal.
          </p>
        </div>
        <Link
          href="/portal"
          className="shrink-0 inline-flex items-center gap-2 bg-white text-foreground text-xs tracking-[0.18em] uppercase px-7 py-4 rounded-full hover:bg-white/90 transition-colors"
        >
          Enter Portal
          <span>→</span>
        </Link>
      </div>

    </div>
  );
}
