// components/sections/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Section registry — maps every section key to its React component.
//
// To add a new section to propframe:
//   1. Create the component file in this folder (e.g. MyNewSection.tsx)
//   2. Add it to this registry with a kebab-case key
//   3. Add that key to siteConfig.sections in site.config.ts for any client
//      that should display it
// ─────────────────────────────────────────────────────────────────────────────

import { HeroSection }             from "./HeroSection";
import { OpeningStatementSection } from "./OpeningStatementSection";
import { OriginStorySection }      from "./OriginStorySection";
import { PillarsSection }          from "./PillarsSection";
import { RegionsSection }          from "./RegionsSection";
import { HoldingsSection }         from "./HoldingsSection";
import { TeamSection }             from "./TeamSection";
import { TestimonialsSection }     from "./TestimonialsSection";
import { ContactCTASection }       from "./ContactCTASection";
import { ClosingQuoteSection }     from "./ClosingQuoteSection";

export const sectionRegistry: Record<string, React.ComponentType> = {
  "hero":               HeroSection,
  "opening-statement":  OpeningStatementSection,
  "origin-story":       OriginStorySection,
  "pillars":            PillarsSection,
  "regions":            RegionsSection,
  "holdings":           HoldingsSection,
  "team":               TeamSection,
  "testimonials":       TestimonialsSection,
  "contact-cta":        ContactCTASection,
  "closing-quote":      ClosingQuoteSection,
};
