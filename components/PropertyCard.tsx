import { Property } from "@/types/property";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getPropertyTypeLabel, getStatusColor } from "@/lib/portfolio-utils";
import { Building2, MapPin, Calendar, TrendingUp } from "lucide-react";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const equity = property.currentValue - property.purchasePrice;
  const equityPercent = ((equity / property.purchasePrice) * 100).toFixed(1);
  const netIncome = (property.monthlyIncome || 0) - (property.expenses || 0);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{property.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {property.address}, {property.city}, {property.state} {property.zipCode}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(property.status)}>
            {property.status.replace("-", " ")}
          </Badge>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline">{getPropertyTypeLabel(property.type)}</Badge>
          {property.units && (
            <Badge variant="outline">{property.units} units</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{property.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Purchase Price</p>
            <p className="font-semibold">{formatCurrency(property.purchasePrice)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Current Value</p>
            <p className="font-semibold">{formatCurrency(property.currentValue)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Equity</p>
            <p className="font-semibold text-green-600">
              {formatCurrency(equity)} ({equityPercent}%)
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Net Monthly Income</p>
            <p className="font-semibold">
              {netIncome > 0 ? formatCurrency(netIncome) : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Square Feet</p>
            <p className="font-semibold">{property.squareFeet.toLocaleString()} sq ft</p>
          </div>
          <div>
            <p className="text-muted-foreground">Purchase Date</p>
            <p className="font-semibold">
              {new Date(property.purchaseDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
