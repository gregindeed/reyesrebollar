import Link from "next/link";
import { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  sold: "Sold",
  "under-contract": "Under Contract",
  pending: "Pending",
};

export function PropertyCard({ property }: PropertyCardProps) {
  const year = new Date(property.purchaseDate + "T00:00:00").getFullYear();

  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <div className="py-7 flex items-start justify-between gap-6 group-hover:opacity-75 transition-opacity">
        {/* Left */}
        <div>
          <p className="text-[0.62rem] tracking-[0.2em] uppercase text-muted-foreground mb-2">
            {property.city}, {property.state}
          </p>
          <h3 className="font-display text-xl md:text-2xl text-foreground leading-tight mb-2">
            {property.address}
          </h3>
          <p className="text-xs text-muted-foreground tracking-wide">
            {property.units ? `${property.units} units` : property.type}
            &nbsp;·&nbsp;
            Acquired {year}
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 pt-1 flex-shrink-0">
          <span className="text-[0.65rem] tracking-[0.15em] uppercase text-muted-foreground hidden sm:block">
            {STATUS_LABEL[property.status] ?? property.status}
          </span>
          <span className="text-muted-foreground group-hover:translate-x-1 transition-transform text-sm">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
