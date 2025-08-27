import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Filter } from "lucide-react";

interface SearchFiltersProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onLocationChange: (location: string) => void;
  categories: string[];
}

export const SearchFilters = ({
  onSearchChange,
  onCategoryChange,
  onLocationChange,
  categories,
}: SearchFiltersProps) => {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(search);
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLocationChange(location);
  };

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Filter className="h-5 w-5" />
          Search & Filters
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </form>
          
          {/* Category Filter */}
          <Select onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Location Filter */}
          <form onSubmit={handleLocationSubmit} className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="City, State..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </form>
        </div>
        
        <div className="flex gap-2">
          <Button type="button" onClick={() => handleSearchSubmit(new Event('submit') as any)}>
            Search
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setSearch("");
              setLocation("");
              onSearchChange("");
              onLocationChange("");
              onCategoryChange("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </Card>
  );
};