// components/sections/ContactCTASection.tsx
// Propframe section: contact call-to-action banner.
// Enable by adding "contact-cta" to siteConfig.sections.

import Link from "next/link";
import { siteConfig } from "@/site.config";

export function ContactCTASection() {
  return (
    <div className="border-t border-border/40">
      <div className="container mx-auto px-8 md:px-16 py-20">
        <div className="max-w-xl">
          <p className="text-[0.65rem] tracking-[0.22em] uppercase text-terracotta mb-4">
            Get in touch
          </p>
          <h2
            className="font-display text-foreground leading-tight mb-4"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
          >
            {siteConfig.contactCTA.heading}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            {siteConfig.contactCTA.subheading}
          </p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="inline-block text-[0.65rem] tracking-[0.2em] uppercase text-foreground border border-border/60 hover:border-foreground/50 px-5 py-2.5 rounded-lg transition-colors hover:bg-muted"
          >
            {siteConfig.contactCTA.buttonText}
          </a>
        </div>
      </div>
    </div>
  );
}
