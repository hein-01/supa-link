import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Globe, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Business {
  id: string;
  name: string;
  description?: string;
  category: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  image_url?: string;
  rating: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  license_expired_date?: string;
}

interface BusinessCardProps {
  business: Business;
}

export const BusinessCard = ({ business }: BusinessCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  const isLicenseValid = () => {
    if (!business.license_expired_date) return false;
    
    // Create date objects for comparison (date only, no time)
    const expiryDate = new Date(business.license_expired_date);
    const currentDate = new Date();
    
    // Set both dates to start of day for accurate date comparison
    expiryDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    
    // License is valid if expiry date is today or in the future
    return expiryDate >= currentDate;
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      {business.image_url && (
        <div className="relative w-full h-[200px] overflow-hidden">
          <img
            src={business.image_url}
            alt={business.name}
            className="w-[320px] h-[200px] object-cover rounded-t-lg"
          />
          {isLicenseValid() && (
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1">
              <CheckCircle className="h-5 w-5 text-green-600 fill-green-100" />
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold line-clamp-2">{business.name}</h3>
          <Badge variant="outline">{business.category}</Badge>
        </div>
        
        {business.description && (
          <p className="text-muted-foreground text-sm line-clamp-3">
            {business.description}
          </p>
        )}
        
        <div className="flex items-center gap-1">
          {renderStars(business.rating)}
          <span className="text-sm text-muted-foreground ml-2">
            {business.rating.toFixed(1)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {business.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{business.address}, {business.city}, {business.state} {business.zip_code}</span>
          </div>
        )}
        
        {business.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{business.phone}</span>
          </div>
        )}
        
        {business.website && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
              Visit Website
            </a>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/business/${business.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};