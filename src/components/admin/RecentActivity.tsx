import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Store, 
  UserPlus, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function RecentActivity() {
  // Mock data - in real app this would come from API
  const activities = [
    {
      id: 1,
      type: "listing",
      title: "New listing submitted",
      description: "Sunset Cafe - Coffee Shop in Downtown",
      user: "John Smith",
      avatar: "/placeholder.svg",
      timestamp: "2 minutes ago",
      status: "pending",
      icon: Store
    },
    {
      id: 2,
      type: "user",
      title: "New user registration",
      description: "sarah.johnson@example.com",
      user: "Sarah Johnson",
      avatar: "/placeholder.svg", 
      timestamp: "5 minutes ago",
      status: "completed",
      icon: UserPlus
    },
    {
      id: 3,
      type: "payment",
      title: "Payment received",
      description: "$89.99 - Premium listing upgrade",
      user: "Mike Wilson",
      avatar: "/placeholder.svg",
      timestamp: "12 minutes ago", 
      status: "completed",
      icon: DollarSign
    },
    {
      id: 4,
      type: "listing",
      title: "Listing approved",
      description: "TechHub Coworking - Business Services",
      user: "Admin",
      avatar: "/placeholder.svg",
      timestamp: "23 minutes ago",
      status: "approved",
      icon: CheckCircle
    },
    {
      id: 5,
      type: "listing",
      title: "Listing flagged for review", 
      description: "Quick Mart - Potential policy violation",
      user: "System",
      avatar: "/placeholder.svg",
      timestamp: "1 hour ago",
      status: "flagged",
      icon: AlertCircle
    },
    {
      id: 6,
      type: "user",
      title: "User verification completed",
      description: "Business owner verification approved",
      user: "Emma Davis",
      avatar: "/placeholder.svg",
      timestamp: "2 hours ago",
      status: "completed", 
      icon: CheckCircle
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "flagged":
        return <Badge variant="destructive">Flagged</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Activity Feed */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg border bg-muted/20">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{activity.title}</p>
                        {getStatusBadge(activity.status)}
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.avatar} />
                        <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{activity.user}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}