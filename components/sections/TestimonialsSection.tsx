// components/sections/TestimonialsSection.tsx
// Propframe section: client testimonial quotes.
// Enable by adding "testimonials" to siteConfig.sections and populating siteConfig.testimonials.

import { siteConfig } from "@/site.config";

export function TestimonialsSection() {
  if (!siteConfig.testimonials.length) return null;

  return (
    <div className="border-t border-border/40 bg-card">
      <div className="container mx-auto px-8 md:px-16 py-20">
        <p className="text-[0.65rem] tracking-[0.22em] uppercase text-terracotta mb-12">
          What clients say
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
          {siteConfig.testimonials.map((t, i) => (
            <div key={i} className="border-t border-border/50 pt-6">
              <p className="text-sm text-foreground leading-relaxed mb-4">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="text-xs font-medium text-foreground">{t.author}</p>
              <p className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground mt-0.5">
                {t.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
