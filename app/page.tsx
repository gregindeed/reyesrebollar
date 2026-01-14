import { properties } from "@/lib/data/properties";
import { calculatePortfolioMetrics, formatCurrency, formatPercent } from "@/lib/portfolio-utils";
import { MetricsCard } from "@/components/MetricsCard";
import { PropertyCard } from "@/components/PropertyCard";
import { Hero } from "@/components/Hero";
import { Building2, DollarSign, TrendingUp, Home, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  const metrics = calculatePortfolioMetrics(properties);
  const activeProperties = properties.filter((p) => p.status === "active");
  const underContractProperties = properties.filter((p) => p.status === "under-contract");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <Hero />
      </div>

      {/* Portfolio Metrics Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Portfolio Overview</h2>
        <p className="text-muted-foreground">
          Real-time insights and comprehensive management of your real estate investments
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <MetricsCard
          title="Total Properties"
          value={metrics.totalProperties.toString()}
          icon={Building2}
          description="Active & under contract"
        />
        <MetricsCard
          title="Portfolio Value"
          value={formatCurrency(metrics.totalValue)}
          icon={Home}
          description="Current market value"
        />
        <MetricsCard
          title="Total Investment"
          value={formatCurrency(metrics.totalInvestment)}
          icon={DollarSign}
          description="Purchase price total"
        />
        <MetricsCard
          title="Total Equity"
          value={formatCurrency(metrics.totalEquity)}
          icon={Wallet}
          description={`${formatPercent((metrics.totalEquity / metrics.totalInvestment) * 100)} gain`}
        />
        <MetricsCard
          title="Monthly Net Income"
          value={formatCurrency(metrics.monthlyIncome)}
          icon={TrendingUp}
          description={`${formatPercent(metrics.annualReturn)} annual return`}
        />
      </div>

      {/* Properties Section */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Properties ({properties.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeProperties.length})</TabsTrigger>
          <TabsTrigger value="under-contract">
            Under Contract ({underContractProperties.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {activeProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="under-contract" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {underContractProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
