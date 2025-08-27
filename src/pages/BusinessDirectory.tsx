import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BusinessCard } from "@/components/BusinessCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

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
}

interface Category {
  name: string;
}

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchBusinesses();
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [searchTerm, selectedCategory, locationFilter]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("business_categories")
        .select("name")
        .order("name");

      if (error) throw error;
      setCategories(data.map((cat: Category) => cat.name));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("businesses")
        .select("*")
        .order("rating", { ascending: false });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply category filter
      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      // Apply location filter
      if (locationFilter) {
        query = query.or(`city.ilike.%${locationFilter}%,state.ilike.%${locationFilter}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch businesses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const BusinessSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Business Directory</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing local businesses in your area. From restaurants to services, find exactly what you're looking for.
          </p>
        </div>

        <SearchFilters
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onLocationChange={setLocationFilter}
          categories={categories}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <BusinessSkeleton key={i} />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold mb-4">No businesses found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}