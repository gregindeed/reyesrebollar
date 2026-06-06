// components/sections/HoldingsSection.tsx
// Propframe section: live property listings pulled from the data layer.

import { properties } from "@/lib/data/properties";
import { PropertyCard } from "@/components/PropertyCard";
import Link from "next/link";

export function HoldingsSection() {
  const activeProperties = properties.filter((p) => p.status === "active");

  return (
    <div className="bg-background border-t border-border">
      <div className="container mx-auto px-8 md:px-16 py-20 md:py-28">
        <div className="flex items-end justify-between mb-10 border-b border-border pb-8">
          <div>
            <p className="eyebrow text-brass mb-4">Portfolio</p>
            <h2
              className="font-display text-foreground leading-none"
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}
            >
              Select Holdings
            </h2>
          </div>
          <Link
            href="/properties"
            className="group text-[0.7rem] tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            All Properties{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="divide-y divide-border">
          {activeProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
}
