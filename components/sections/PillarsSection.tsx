// components/sections/PillarsSection.tsx
// Propframe section: the family's three guiding pillars, on a charcoal field.

"use client";

import { motion } from "motion/react";
import { siteConfig } from "@/site.config";

const ease = [0.22, 1, 0.36, 1] as const;

export function PillarsSection() {
  return (
    <section className="bg-ink text-on-ink">
      <div className="container mx-auto px-8 md:px-16 py-24 md:py-32">

        {/* Intro */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-7">
            <span className="h-px w-10 bg-sage-light" />
            <span className="eyebrow text-sage-light">{siteConfig.pillarsLabel}</span>
          </div>
          <h2
            className="font-display leading-[1.05] tracking-[-0.01em]"
            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
          >
            {siteConfig.pillarsHeading}
          </h2>
          <p className="mt-7 text-base md:text-lg text-white/65 leading-relaxed">
            {siteConfig.pillarsIntro}
          </p>
        </div>

        {/* Pillars */}
        <div className="mt-16 md:mt-20 grid md:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden">
          {siteConfig.values.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease, delay: i * 0.12 }}
              className="bg-ink p-8 md:p-10 flex flex-col"
            >
              <span className="font-display text-sage-light text-2xl leading-none mb-6">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-2xl md:text-3xl text-white mb-4">
                {p.title}
              </h3>
              <p className="text-sm md:text-[0.95rem] text-white/60 leading-relaxed">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
