import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PopularBusinessCard } from "@/components/PopularBusinessCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { expandSearchTerms, normalizeCategoryName, synonymDictionary } from "@/utils/synonymDictionary";

interface Business {
  id: string;
  name: string;
  description?: string;
  category: string;
  address?: string;
  towns?: string;
  province_district?: string;
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
  const [searchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchCategories();
    
    // Get search term from URL params
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(0);
    setHasMore(true);
    // Always fetch businesses - either with filters or show all
    fetchBusinesses(true);
  }, [searchTerm, selectedCategory, selectedProducts, locationFilter, deliveryFilter]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("business_categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      const categoriesData = data || [];
      setCategories(categoriesData);
      setCategoryNames(categoriesData.map(cat => cat.name));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBusinesses = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setBusinesses([]);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 0 : currentPage;
      
      // Get category ID for selected category
      let categoryId = null;
      if (selectedCategory !== "all") {
        const categoryData = categories.find(cat => cat.name === selectedCategory);
        categoryId = categoryData?.id || null;
      }
      
      // Prepare product terms
      const productTerms = selectedProducts.length > 0 && !selectedProducts.includes("All Products") 
        ? selectedProducts 
        : null;
      
      // Prepare location parameters
      let locationToken = null;
      let locationTown = null;
      let locationProvince = null;
      
      if (locationFilter) {
        if (locationFilter.includes(",")) {
          const [town, province] = locationFilter.split(",").map((s) => s.trim());
          locationTown = town || null;
          locationProvince = province || null;
        } else {
          locationToken = locationFilter;
        }
      }
      
      // Prepare delivery options
      const deliveryOptions = deliveryFilter.length > 0 ? deliveryFilter : null;

      let searchResults = null;
      let searchError = null;

      // 3-Step Search Process
      if (searchTerm) {
        const trimmedTerm = searchTerm.toLowerCase().trim();

        // Step 1: Primary Search (Exact Phrase Match)
        try {
          const { data: step1Data, error: step1Error } = await supabase.rpc('search_businesses', {
            search_terms: [trimmedTerm], // Search for exact phrase
            category_id: categoryId,
            product_terms: productTerms,
            location_token: locationToken,
            location_town: locationTown,
            location_province: locationProvince,
            delivery_options: deliveryOptions,
            page: page,
            page_size: ITEMS_PER_PAGE
          });

          if (step1Error) throw step1Error;
          
          // If we found results with exact phrase match, use them
          if (step1Data && step1Data.length > 0) {
            searchResults = step1Data;
          } else {
            // Step 2: Secondary Search (Synonym Expansion)
            const { exactPhrases } = expandSearchTerms(searchTerm);
            
            // Try to find canonical phrase from synonym dictionary
            let canonicalPhrase = null;
            Object.keys(synonymDictionary).forEach(key => {
              const normalizedKey = key.toLowerCase().replace(/'/g, '').replace(/\s+/g, ' ').trim();
              const normalizedSearch = trimmedTerm.replace(/'/g, '').replace(/\s+/g, ' ').trim();
              
              if (normalizedKey === normalizedSearch || synonymDictionary[key].some(synonym => 
                synonym.toLowerCase().replace(/'/g, '').replace(/\s+/g, ' ').trim() === normalizedSearch
              )) {
                canonicalPhrase = key.toLowerCase();
                return;
              }
            });

            if (canonicalPhrase) {
              const { data: step2Data, error: step2Error } = await supabase.rpc('search_businesses', {
                search_terms: [canonicalPhrase], // Search for canonical phrase
                category_id: categoryId,
                product_terms: productTerms,
                location_token: locationToken,
                location_town: locationTown,
                location_province: locationProvince,
                delivery_options: deliveryOptions,
                page: page,
                page_size: ITEMS_PER_PAGE
              });

              if (step2Error) throw step2Error;
              
              if (step2Data && step2Data.length > 0) {
                searchResults = step2Data;
              }
            }

            // Step 3: Tertiary Search (Multi-Word AND Fallback)
            if (!searchResults || searchResults.length === 0) {
              const words = trimmedTerm.split(/\s+/).filter(word => word.length > 0);
              
              if (words.length > 1) {
                const { data: step3Data, error: step3Error } = await supabase.rpc('search_businesses', {
                  search_terms: words, // Individual words for AND logic
                  category_id: categoryId,
                  product_terms: productTerms,
                  location_token: locationToken,
                  location_town: locationTown,
                  location_province: locationProvince,
                  delivery_options: deliveryOptions,
                  page: page,
                  page_size: ITEMS_PER_PAGE
                });

                if (step3Error) throw step3Error;
                searchResults = step3Data || [];
              } else {
                // Single word, use as is
                const { data: singleWordData, error: singleWordError } = await supabase.rpc('search_businesses', {
                  search_terms: [trimmedTerm],
                  category_id: categoryId,
                  product_terms: productTerms,
                  location_token: locationToken,
                  location_town: locationTown,
                  location_province: locationProvince,
                  delivery_options: deliveryOptions,
                  page: page,
                  page_size: ITEMS_PER_PAGE
                });

                if (singleWordError) throw singleWordError;
                searchResults = singleWordData || [];
              }
            }
          }
        } catch (error) {
          searchError = error;
        }
      } else {
        // No search term, fetch all businesses with other filters
        const { data, error } = await supabase.rpc('search_businesses', {
          search_terms: null,
          category_id: categoryId,
          product_terms: productTerms,
          location_token: locationToken,
          location_town: locationTown,
          location_province: locationProvince,
          delivery_options: deliveryOptions,
          page: page,
          page_size: ITEMS_PER_PAGE
        });

        if (error) throw error;
        searchResults = data || [];
      }

      if (searchError) throw searchError;

      const newBusinesses = searchResults || [];
      
      if (reset) {
        setBusinesses(newBusinesses);
        setCurrentPage(0);
      } else {
        setBusinesses(prev => [...prev, ...newBusinesses]);
        setCurrentPage(page + 1);
      }
      
      setHasMore(newBusinesses.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch businesses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchBusinesses(false);
    }
  };

  const BusinessSkeleton = () => (
    <div className="w-[290px]">
      <Skeleton className="h-[290px] w-full rounded-t-lg" />
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
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <SearchFilters
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onLocationChange={setLocationFilter}
          onProductChange={(products) => {
            if (typeof products === 'string') {
              setSelectedProducts(products === 'all' ? [] : [products]);
            } else {
              setSelectedProducts(products);
            }
          }}
          onDeliveryFilter={(type) => {
            const filters = type ? type.split(',').filter(f => f.trim()) : [];
            setDeliveryFilter(filters);
          }}
          categories={categoryNames}
          initialSearchTerm={searchTerm}
          initialCategory={selectedCategory}
        />

        <div className="mt-8">
          <div className="flex flex-wrap justify-center gap-5 max-w-[590px] md:max-w-[590px] lg:max-w-[915px] mx-auto">
            {loading ? (
              // Show skeletons while loading
              Array.from({ length: 6 }).map((_, index) => (
                <BusinessSkeleton key={index} />
              ))
            ) : businesses.length > 0 ? (
              businesses.map((business) => (
                <PopularBusinessCard key={business.id} business={business} />
              ))
            ) : (
              <div className="text-center py-12 w-full">
                <p className="text-xl text-muted-foreground">
                  No businesses found matching your criteria.
                </p>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search filters or browse all categories.
                </p>
              </div>
            )}
          </div>
          
          {!loading && businesses.length > 0 && hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg border-2 border-primary shadow-lg hover:shadow-xl hover:bg-primary/90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}