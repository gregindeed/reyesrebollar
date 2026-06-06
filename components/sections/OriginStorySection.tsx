// components/sections/OriginStorySection.tsx
// Propframe section: brand narrative paragraphs paired with a heritage image.

import Image from "next/image";
import { siteConfig } from "@/site.config";

export function OriginStorySection() {
  return (
    <div className="bg-card border-t border-border">
      <div className="container mx-auto px-8 md:px-16 py-20 md:py-28 grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

        {/* Narrative */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10" style={{ backgroundColor: "var(--accent-brass)" }} />
            <p className="eyebrow text-brass">{siteConfig.originSectionLabel}</p>
          </div>
          <h2
            className="font-display text-foreground mb-8 leading-[1.08]"
            style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)" }}
          >
            {siteConfig.originHeading}
          </h2>
          <div className="space-y-5 text-base text-muted-foreground leading-relaxed max-w-xl">
            {siteConfig.originParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Heritage image */}
        <div className="relative h-[320px] sm:h-[420px] lg:h-[520px] rounded-2xl overflow-hidden ring-1 ring-black/5 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.4)]">
          <Image
            src={siteConfig.originImagePath}
            alt={siteConfig.originImageAlt}
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5">
            <span className="eyebrow text-white/90">Los Limones, Michoacán</span>
          </div>
        </div>

      </div>
    </div>
  );
}
