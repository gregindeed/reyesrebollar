import { Property, PortfolioMetrics } from "@/types/property";

export function calculatePortfolioMetrics(properties: Property[]): PortfolioMetrics {
  const totalProperties = properties.length;
  const totalValue = properties.reduce((sum, prop) => sum + prop.currentValue, 0);
  const totalInvestment = properties.reduce((sum, prop) => sum + prop.purchasePrice, 0);
  const totalEquity = totalValue - totalInvestment;
  const monthlyIncome = properties.reduce(
    (sum, prop) => sum + (prop.monthlyIncome || 0) - (prop.expenses || 0),
    0
  );
  const annualReturn = totalInvestment > 0 ? ((monthlyIncome * 12) / totalInvestment) * 100 : 0;

  return {
    totalProperties,
    totalValue,
    totalInvestment,
    totalEquity,
    monthlyIncome,
    annualReturn,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    residential: "Residential",
    commercial: "Commercial",
    industrial: "Industrial",
    land: "Land",
    "mixed-use": "Mixed-Use",
  };
  return labels[type] || type;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    sold: "bg-gray-100 text-gray-800",
    "under-contract": "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
