import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BusinessCard } from "@/components/BusinessCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

export default function FindShops() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
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
      setCategories(data?.map((cat: { name: string }) => cat.name) || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("businesses")
        .select("*")
        .order("rating", { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

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
    <div className="w-[320px] mx-[5px] md:mx-[10px] mb-4">
      <Skeleton className="h-[280px] w-full rounded-t-lg" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Find Local Shops
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing local businesses in your area. From restaurants to retail stores, 
            find exactly what you're looking for.
          </p>
        </div>

        <SearchFilters
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onLocationChange={setLocationFilter}
          categories={categories}
        />

        <div className="flex flex-wrap justify-center mt-8">
          {loading ? (
            // Show skeletons while loading
            Array.from({ length: 6 }).map((_, index) => (
              <BusinessSkeleton key={index} />
            ))
          ) : businesses.length > 0 ? (
            businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                No businesses found matching your criteria.
              </p>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search filters or browse all categories.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}