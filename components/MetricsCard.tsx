import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function MetricsCard({ title, value, icon: Icon, description, trend }: MetricsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p
            className={`text-xs mt-1 ${
              trend.positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.positive ? "+" : ""}
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
