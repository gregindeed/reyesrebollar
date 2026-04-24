"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

const pillars = [
  "Residential Holdings",
  "Commercial Properties",
  "El Cajon, California",
  "Family Partnership",
  "Est. 2023",
];

export function Hero() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-8 md:px-16 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-stretch relative overflow-x-hidden">

          {/* ── Right: Image ── */}
          <div className="md:order-2 relative">
            {/* Soft terracotta glow behind image */}
            <div
              className="absolute -z-10 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ background: "oklch(0.52 0.11 42)", top: "-2rem", left: "-2rem" }}
            />
            <div className="relative h-[360px] md:h-full min-h-[400px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/el-cajon-aerial.jpg"
                alt="El Cajon, California"
                fill
                className="object-cover object-center brightness-105"
                priority
              />
              {/* Subtle warm vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>

          {/* ── Left: Text ── */}
          <div className="md:order-1 flex flex-col justify-between min-h-[400px] py-2">

            {/* Big heading */}
            <h1
              className="font-display text-foreground leading-[1.1] tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4.2rem)" }}
            >
              Reyes Rebollar<br />Properties LLC
            </h1>

            {/* Animated pillar list */}
            <ul className="space-y-1.5 my-10">
              {pillars.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0.55 }}
                  whileHover={{
                    opacity: 1,
                    x: 6,
                    transition: { duration: 0.25, ease: "easeOut" },
                  }}
                  transition={{ delay: index * 0.08 }}
                  className="cursor-default"
                >
                  <span className="text-xs tracking-[0.16em] uppercase text-foreground/70 hover:text-foreground transition-colors">
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* Bottom: label + description + CTA */}
            <div>
              <p className="text-[0.62rem] tracking-[0.22em] uppercase text-terracotta mb-3">
                Los Limones, Michoacán · El Cajon, California
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                A family real estate holding company building lasting value in
                Southern California — rooted in legacy, guided by integrity.
              </p>
              <Link
                href="/properties"
                className="inline-block mt-6 text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-border/60 hover:border-foreground/50 pb-0.5"
              >
                View Portfolio
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
