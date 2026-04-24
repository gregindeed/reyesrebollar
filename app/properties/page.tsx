"use client";

import { useState } from "react";
import { properties } from "@/lib/data/properties";
import { PropertyCard } from "@/components/PropertyCard";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Under Contract", value: "under-contract" },
  { label: "Sold", value: "sold" },
];

export default function PropertiesPage() {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? properties
      : properties.filter((p) => p.status === filter);

  const countFor = (value: string) =>
    value === "all"
      ? properties.length
      : properties.filter((p) => p.status === value).length;

  return (
    <div className="container mx-auto px-8 md:px-16 py-20 md:py-28">
      {/* Header */}
      <div className="mb-16">
        <p className="text-[0.65rem] tracking-[0.22em] uppercase text-terracotta mb-5">
          Portfolio
        </p>
        <h1
          className="font-display text-foreground leading-none mb-6"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
        >
          Our Holdings
        </h1>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          All real property assets held by Reyes Rebollar Properties LLC.
        </p>
      </div>

      {/* Filter — text only, minimal */}
      <div className="flex gap-6 mb-3 border-t border-border/50 pt-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-[0.65rem] tracking-[0.18em] uppercase transition-colors pb-0.5 ${
              filter === f.value
                ? "text-foreground border-b border-foreground"
                : "text-muted-foreground hover:text-foreground border-b border-transparent"
            }`}
          >
            {f.label}
            <span className="ml-1.5 opacity-50">({countFor(f.value)})</span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="divide-y divide-border/40">
          {filtered.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-16">
          No properties with this status.
        </p>
      )}
    </div>
  );
}
