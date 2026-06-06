// components/sections/HeroSection.tsx
// Propframe section: full-height immersive hero — image with overlaid
// headline, copy, CTAs, live stats, and a scroll cue.

"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/site.config";
import { properties } from "@/lib/data/properties";

const ease = [0.22, 1, 0.36, 1] as const;

// ── Live portfolio stats ──────────────────────────────────────────────
const active = properties.filter((p) => p.status === "active");
const totalUnits = active.reduce((sum, p) => sum + (p.units ?? 1), 0);
const sinceYear = properties.reduce(
  (min, p) => Math.min(min, new Date(p.purchaseDate + "T00:00:00").getFullYear()),
  9999
);

const stats: { value: string; label: string }[] = [
  { value: String(active.length), label: "Properties" },
  { value: String(totalUnits), label: "Units" },
  { value: `'${String(sinceYear).slice(2)}`, label: "Established" },
];

export function HeroSection() {
  const [first, ...rest] = siteConfig.companyName.split(" ");

  return (
    <section className="relative w-full min-h-[100svh] flex flex-col justify-end overflow-hidden">
      {/* ── Background image ── */}
      <Image
        src={siteConfig.heroImagePath}
        alt={siteConfig.heroImageAlt}
        fill
        className="object-cover object-center -z-20"
        priority
        sizes="100vw"
      />

      {/* ── Cinematic gradient (single smooth ramp) ── */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(12,15,14,0.86) 0%, rgba(12,15,14,0.55) 22%, rgba(12,15,14,0.22) 48%, rgba(12,15,14,0.04) 72%, rgba(12,15,14,0) 100%)",
        }}
      />
      {/* faint top scrim for header legibility */}
      <div
        className="absolute inset-x-0 top-0 h-40 -z-10"
        style={{ background: "linear-gradient(to bottom, rgba(12,15,14,0.34), transparent)" }}
      />

      {/* ── Overlaid content ── */}
      <div className="container mx-auto px-8 md:px-16 pt-32 pb-16 md:pb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="flex items-center gap-2.5 mb-7"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sage-light" />
            <span className="eyebrow text-white/80">{siteConfig.locationTagline}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.05 }}
            className="font-display text-white leading-[0.95] tracking-[-0.02em] [text-shadow:0_2px_40px_rgba(0,0,0,0.4)]"
            style={{ fontSize: "clamp(3.2rem, 7vw, 6.5rem)" }}
          >
            {first} <span className="text-sage-light">{rest[0]}</span>
            <br />
            <span className="text-white/70 italic font-light">{rest.slice(1).join(" ")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
            className="mt-8 text-base md:text-lg text-white/80 leading-relaxed max-w-lg [text-shadow:0_1px_20px_rgba(0,0,0,0.5)]"
          >
            {siteConfig.heroDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.25 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/properties"
              className="group inline-flex items-center gap-2 bg-white text-foreground text-xs tracking-[0.18em] uppercase px-7 py-4 rounded-full hover:bg-white/90 transition-colors"
            >
              View Portfolio
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/portal"
              className="inline-flex items-center text-xs tracking-[0.18em] uppercase text-white px-6 py-4 border border-white/35 rounded-full hover:bg-white/10 hover:border-white/60 transition-colors"
            >
              Tenant Portal
            </Link>
          </motion.div>
        </div>

        {/* Live stat strip */}
        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.45 }}
          className="mt-16 flex gap-12 sm:gap-16 border-t border-white/15 pt-8 max-w-2xl"
        >
          {stats.map((s) => (
            <div key={s.label}>
              <dd className="font-display text-3xl md:text-4xl text-white leading-none">{s.value}</dd>
              <dt className="mt-2 text-[0.6rem] tracking-[0.2em] uppercase text-white/55">
                {s.label}
              </dt>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* ── Scroll cue ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="pointer-events-none absolute bottom-7 right-8 hidden md:flex flex-col items-center gap-2"
      >
        <span className="text-[0.55rem] tracking-[0.25em] uppercase text-white/45 [writing-mode:vertical-rl]">
          Scroll
        </span>
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="block h-8 w-px bg-white/40"
        />
      </motion.div>
    </section>
  );
}
