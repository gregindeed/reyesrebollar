// app/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Public homepage — dynamic section renderer.
//
// Sections are defined in siteConfig.sections (site.config.ts).
// To add, remove, or reorder sections for a client, edit that array.
// To add a new section type, create the component and register it in
// components/sections/index.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { siteConfig } from "@/site.config";
import { sectionRegistry } from "@/components/sections";

export default function HomePage() {
  return (
    <div>
      {siteConfig.sections.map((key) => {
        const Section = sectionRegistry[key];
        if (!Section) {
          console.warn(`[propframe] Unknown section key: "${key}" — skipping.`);
          return null;
        }
        return <Section key={key} />;
      })}
    </div>
  );
}
