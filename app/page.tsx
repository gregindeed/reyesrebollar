import { properties } from "@/lib/data/properties";
import { PropertyCard } from "@/components/PropertyCard";
import { Hero } from "@/components/Hero";
import Link from "next/link";

const values = [
  {
    title: "Honesty & Integrity",
    body: "Our word is our bond — every transaction and relationship conducted with the same straightforward honesty our family has always lived by.",
  },
  {
    title: "Hard Work",
    body: "From the lime groves at dawn to managing properties today, what you build is only as strong as the effort you put in.",
  },
  {
    title: "Long-Term Vision",
    body: "Like farmers who plant for future harvests, we build for generations — with patience, foresight, and a commitment to lasting value.",
  },
  {
    title: "Family First",
    body: "Every decision is made with the collective good in mind. Our strength comes from unity, just as a grove is stronger than a single tree.",
  },
];

export default function HomePage() {
  const activeProperties = properties.filter((p) => p.status === "active");

  return (
    <div>
      {/* Hero */}
      <Hero />

      {/* Opening statement */}
      <div className="container mx-auto px-8 md:px-16 pt-10 pb-16">
        <div className="max-w-2xl">
          <p className="text-[0.65rem] tracking-[0.22em] uppercase text-terracotta mb-8">
            The Partnership
          </p>
          <p
            className="font-display leading-snug text-foreground"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}
          >
            From the lime groves of Los Limones to the hills of El Cajon —
            we carry the same values our family has always known.
          </p>
        </div>
      </div>

      {/* Origin story */}
      <div className="border-t border-border/40">
        <div className="container mx-auto px-8 md:px-16 py-20 grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[0.62rem] tracking-[0.2em] uppercase text-muted-foreground mb-5">
              From Los Limones, Michoacán
            </p>
            <h2
              className="font-display text-foreground mb-8 leading-tight"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
            >
              Roots that run deep
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                The Reyes Rebollar family story begins in the fertile lands of Los Limones —
                a town named for the lime groves that generations of our family cultivated.
                Every season brought rich harvests, but more importantly, it planted values
                that would outlast any crop.
              </p>
              <p>
                Hard work. Integrity. Family. These weren't lessons taught in a classroom —
                they were lived in the fields, passed quietly from one generation to the next.
                When the family came to California, they brought those values with them, whole
                and intact. The landscape changed. The principles didn't.
              </p>
              <p>
                Reyes Rebollar Properties LLC was founded on that understanding. Each property
                in our portfolio is not just an asset — it is a commitment, a piece of something
                we are building to last.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 gap-8 md:pt-10">
            {values.map((v) => (
              <div key={v.title} className="border-t border-border/50 pt-5">
                <h3 className="font-medium text-xs tracking-wide uppercase text-foreground mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-card border-t border-border/40">
        <div className="container mx-auto px-8 md:px-16 py-20">
          <div className="flex items-baseline justify-between mb-2 border-b border-border/50 pb-6">
            <p className="text-[0.65rem] tracking-[0.22em] uppercase text-muted-foreground">
              Holdings
            </p>
            <Link
              href="/properties"
              className="text-[0.65rem] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              All Properties →
            </Link>
          </div>

          <div className="divide-y divide-border/40">
            {activeProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </div>

      {/* Closing quote */}
      <div className="container mx-auto px-8 md:px-16 py-20 max-w-3xl">
        <p
          className="font-display text-muted-foreground leading-snug"
          style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)" }}
        >
          "From the soil of Michoacán to the streets of California —
          our roots run deep, and our future grows bright."
        </p>
      </div>
    </div>
  );
}
