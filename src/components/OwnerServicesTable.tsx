import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OwnerService {
  service_id: number;
  service_name: string;
  default_duration_min: number | null;
  total_resources: number;
}

export function OwnerServicesTable({ userId }: { userId: string }) {
  const [services, setServices] = useState<OwnerService[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOwnerServices();
  }, [userId]);

  async function fetchOwnerServices() {
    try {
      setLoading(true);
      
      // Query to get services with resource counts
      const { data, error } = await supabase
        .from("business_resources")
        .select(`
          service_id,
          services:service_id (
            id,
            popular_products,
            default_duration_min
          ),
          business_id,
          businesses:business_id (
            owner_id
          )
        `)
        .eq("businesses.owner_id", userId);

      if (error) throw error;

      // Group by service_id and count resources
      const serviceMap = new Map<number, OwnerService>();
      
      data?.forEach((item: any) => {
        const serviceId = item.service_id;
        if (item.services && item.businesses) {
          if (serviceMap.has(serviceId)) {
            const existing = serviceMap.get(serviceId)!;
            serviceMap.set(serviceId, {
              ...existing,
              total_resources: existing.total_resources + 1,
            });
          } else {
            serviceMap.set(serviceId, {
              service_id: serviceId,
              service_name: item.services.popular_products,
              default_duration_min: item.services.default_duration_min,
              total_resources: 1,
            });
          }
        }
      });

      setServices(Array.from(serviceMap.values()));
    } catch (error) {
      console.error("Error fetching owner services:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Manage My Services & Schedule</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Manage My Services & Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Default Slot</TableHead>
                <TableHead>Total Resources</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.service_id}>
                  <TableCell className="font-medium">{service.service_name}</TableCell>
                  <TableCell>
                    {service.service_name === "Futsal Field Rental"
                      ? "60 mins"
                      : service.default_duration_min
                      ? `${service.default_duration_min} mins`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{service.total_resources}</TableCell>
                  <TableCell>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/availability?serviceId=${service.service_id}`)}
                    >
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {services.map((service) => (
            <Card key={service.service_id} className="shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Service Name</p>
                  <p className="font-medium">{service.service_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Default Slot</p>
                    <p className="font-medium">
                      {service.service_name === "Futsal Field Rental"
                        ? "60 mins"
                        : service.default_duration_min
                        ? `${service.default_duration_min} mins`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Resources</p>
                    <p className="font-medium">{service.total_resources}</p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/availability?serviceId=${service.service_id}`)}
                >
                  Manage
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
