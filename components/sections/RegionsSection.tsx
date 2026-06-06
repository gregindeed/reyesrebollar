// components/sections/RegionsSection.tsx
// Propframe section: the regions the company operates in — privacy-safe,
// no addresses or property-level detail.

"use client";

import { motion } from "motion/react";
import { siteConfig } from "@/site.config";

const ease = [0.22, 1, 0.36, 1] as const;

export function RegionsSection() {
  return (
    <section className="bg-background border-t border-border">
      <div className="container mx-auto px-8 md:px-16 py-20 md:py-28">

        {/* Intro */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10" style={{ backgroundColor: "var(--accent-brass)" }} />
            <p className="eyebrow text-brass">{siteConfig.regionsLabel}</p>
          </div>
          <h2
            className="font-display text-foreground leading-[1.08]"
            style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.9rem)" }}
          >
            {siteConfig.regionsHeading}
          </h2>
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            {siteConfig.regionsIntro}
          </p>
        </div>

        {/* Regions */}
        <div className="mt-14 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden">
          {siteConfig.regions.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease, delay: i * 0.1 }}
              className="bg-card p-8 md:p-10 flex flex-col"
            >
              <span className="eyebrow text-brass mb-5">{r.area}</span>
              <h3 className="font-display text-2xl md:text-3xl text-foreground mb-3 leading-tight">
                {r.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.blurb}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
