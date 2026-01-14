export type PropertyStatus = "active" | "sold" | "under-contract" | "pending";
export type PropertyType = "residential" | "commercial" | "industrial" | "land" | "mixed-use";

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: PropertyType;
  status: PropertyStatus;
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  squareFeet: number;
  units?: number;
  description: string;
  imageUrl?: string;
  monthlyIncome?: number;
  expenses?: number;
}

export interface PortfolioMetrics {
  totalProperties: number;
  totalValue: number;
  totalInvestment: number;
  totalEquity: number;
  monthlyIncome: number;
  annualReturn: number;
}
