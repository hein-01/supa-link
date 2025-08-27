import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Store, 
  UserPlus, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Eye,
  ShoppingBag
} from "lucide-react";

export default function AdminMetrics() {
  // Mock data - in real app this would come from API
  const metrics = [
    {
      title: "Total Listings",
      value: "2,847",
      change: "+12%",
      changeType: "positive" as const,
      icon: Store,
      description: "Active business listings"
    },
    {
      title: "Total Users",
      value: "18,432",
      change: "+8%",
      changeType: "positive" as const,
      icon: Users,
      description: "Registered users"
    },
    {
      title: "New Sign-ups",
      value: "234",
      change: "+23%",
      changeType: "positive" as const,
      icon: UserPlus,
      description: "This month"
    },
    {
      title: "Total Revenue",
      value: "$54,280",
      change: "+18%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "Monthly revenue"
    },
    {
      title: "Page Views",
      value: "124,583",
      change: "+5%",
      changeType: "positive" as const,
      icon: Eye,
      description: "This month"
    },
    {
      title: "Active Orders",
      value: "89",
      change: "-2%",
      changeType: "negative" as const,
      icon: ShoppingBag,
      description: "Pending orders"
    },
    {
      title: "Growth Rate",
      value: "15.3%",
      change: "+2.1%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Monthly growth"
    },
    {
      title: "Avg. Session",
      value: "4m 32s",
      change: "+12s",
      changeType: "positive" as const,
      icon: Calendar,
      description: "User engagement"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                <span
                  className={`font-medium ${
                    metric.changeType === 'positive' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}
                >
                  {metric.change}
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}