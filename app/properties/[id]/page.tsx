import { properties } from "@/lib/data/properties";
import { notFound } from "next/navigation";
import { formatCurrency, getPropertyTypeLabel } from "@/lib/portfolio-utils";
import Link from "next/link";

export function generateStaticParams() {
  return properties.map((p) => ({ id: p.id }));
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = properties.find((p) => p.id === id);

  if (!property) notFound();

  const equity = property.currentValue - property.purchasePrice;
  const equityPercent =
    property.purchasePrice > 0
      ? ((equity / property.purchasePrice) * 100).toFixed(1)
      : null;
  const netMonthly = (property.monthlyIncome || 0) - (property.expenses || 0);

  const purchaseDate = new Date(property.purchaseDate + "T00:00:00").toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const STATUS_LABEL: Record<string, string> = {
    active: "Active",
    sold: "Sold",
    "under-contract": "Under Contract",
    pending: "Pending",
  };

  return (
    <div className="container mx-auto px-8 md:px-16 py-16 md:py-24">
      {/* Back */}
      <Link
        href="/properties"
        className="text-[0.65rem] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors mb-14 inline-block"
      >
        ← Properties
      </Link>

      {/* Property heading */}
      <div className="mb-16">
        <p className="text-[0.65rem] tracking-[0.22em] uppercase text-muted-foreground mb-5">
          {property.city}, {property.state} {property.zipCode}
          &nbsp;·&nbsp;
          {STATUS_LABEL[property.status]}
        </p>
        <h1
          className="font-display text-foreground leading-none"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
        >
          {property.address}
        </h1>
      </div>

      {/* Divider */}
      <div className="border-t border-border/50 mb-14" />

      {/* Details grid */}
      <div className="grid md:grid-cols-2 gap-x-20 gap-y-14 max-w-3xl">
        {/* Property */}
        <div>
          <p className="text-[0.62rem] tracking-[0.22em] uppercase text-terracotta mb-6">
            Property
          </p>
          <div className="space-y-4">
            <Row label="Type" value={getPropertyTypeLabel(property.type)} />
            {property.units && (
              <Row label="Units" value={`${property.units}`} />
            )}
            <Row
              label="Area"
              value={`${property.squareFeet.toLocaleString()} sq ft`}
            />
            <Row label="Acquired" value={purchaseDate} />
          </div>
        </div>

        {/* Financials */}
        <div>
          <p className="text-[0.62rem] tracking-[0.22em] uppercase text-terracotta mb-6">
            Financial
          </p>
          <div className="space-y-4">
            {property.purchasePrice > 0 ? (
              <>
                <Row label="Purchase Price" value={formatCurrency(property.purchasePrice)} />
                <Row label="Current Value" value={formatCurrency(property.currentValue)} />
                {equityPercent && (
                  <Row
                    label="Equity"
                    value={`${formatCurrency(equity)} (${equityPercent}%)`}
                    accent
                  />
                )}
              </>
            ) : (
              <Row label="Valuation" value="To be updated" />
            )}
            {netMonthly > 0 && (
              <Row label="Net Monthly" value={formatCurrency(netMonthly)} />
            )}
            {property.monthlyIncome ? (
              <Row
                label="Gross Monthly"
                value={formatCurrency(property.monthlyIncome)}
              />
            ) : (
              <Row label="Income" value="To be updated" />
            )}
            {property.expenses ? (
              <Row label="Expenses" value={formatCurrency(property.expenses)} />
            ) : null}
          </div>
        </div>
      </div>

      {/* Notes */}
      {property.description && (
        <div className="mt-16 border-t border-border/50 pt-10 max-w-2xl">
          <p className="text-[0.62rem] tracking-[0.22em] uppercase text-muted-foreground mb-4">
            Notes
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {property.description}
          </p>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline gap-4 pb-3 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground tracking-wide">{label}</span>
      <span
        className={`text-sm font-medium tabular-nums ${
          accent ? "text-[oklch(0.40_0.09_142)]" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
