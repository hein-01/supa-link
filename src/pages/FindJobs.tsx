import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JobCard } from "@/components/JobCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import jobBannerBg from "@/assets/job-banner-bg.jpg";
import { ChevronDown } from "lucide-react";

interface JobPosting {
  id: string;
  business_name: string;
  job_title: string;
  salary_amount: string;
  salary_type: string;
  job_location: string;
  job_type: string;
  education_requirement: string;
  age_min: number | null;
  age_max: number | null;
  benefits: string[] | null;
  application_deadline: string;
  description: string;
  contact_number: string;
}

const FindJobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [triggerWidth, setTriggerWidth] = useState(0);

  useEffect(() => {
    if (!triggerRef.current) return;
    const el = triggerRef.current;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setTriggerWidth(rect.width);
    });
    ro.observe(el);
    // Initial measure
    setTriggerWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  // Filters state
  const FILTER_OPTIONS = [
    "All Jobs",
    "All Jobs (No minimum education requirement)",
    "All Jobs (Secondary school education)",
    "All Jobs (High School education)",
    "All Jobs with High School Graduates Preferred",
    "Driver",
    "Rider",
    "Delivery Person",
    "Security Officer",
    "Barista",
    "Cashier",
    "Kitchen Assistant",
    "Cleaner",
    "Nanny",
    "F&B Service Crew",
    "Waiter",
    "Waitress",
    "Trainee Chef",
    "Catering Assistant",
    "Construction Worker",
    "Others",
  ] as const;

  type FilterOption = (typeof FILTER_OPTIONS)[number];
  const [selectedOptions, setSelectedOptions] = useState<FilterOption[]>([]);
  const [appliedOptions, setAppliedOptions] = useState<FilterOption[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;
      const rows = data || [];
      setJobs(rows);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load job postings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Build and run a filtered page query
  const fetchFirstPageWithFilters = async (options: FilterOption[]) => {
    try {
      setLoading(true);
      let query = supabase
        .from("job_postings")
        .select("*")
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1);

      // Normalize: if includes All Jobs or empty -> no filter
      const normalized = options.includes("All Jobs") || options.length === 0 ? [] : options;

      if (normalized.length > 0) {
        // Education options mapping
        const eduConds: string[] = [];
        if (normalized.includes("All Jobs (No minimum education requirement)")) {
          eduConds.push(
            "education_requirement.ilike.%no minimum%",
            "education_requirement.ilike.%no education%",
            "education_requirement.eq.",
            "education_requirement.ilike.%none%"
          );
        }
        if (normalized.includes("All Jobs (Secondary school education)")) {
          eduConds.push("education_requirement.ilike.%secondary%");
        }
        if (normalized.includes("All Jobs (High School education)")) {
          eduConds.push("education_requirement.ilike.%high school%");
        }
        if (normalized.includes("All Jobs with High School Graduates Preferred")) {
          eduConds.push(
            "education_requirement.ilike.%high school%",
            "education_requirement.ilike.%graduate%",
            "education_requirement.ilike.%preferred%"
          );
        }

        // Role options mapping
        const roleKeywords: Record<string, string[]> = {
          "Driver": ["driver"],
          "Rider": ["rider"],
          "Delivery Person": ["delivery", "courier"],
          "Security Officer": ["security"],
          "Barista": ["barista"],
          "Cashier": ["cashier"],
          "Kitchen Assistant": ["kitchen assistant", "kitchen helper"],
          "Cleaner": ["cleaner", "cleaning"],
          "Nanny": ["nanny", "babysit"],
          "F&B Service Crew": ["service crew", "f&b", "food and beverage"],
          "Waiter": ["waiter", "server"],
          "Waitress": ["waitress", "server"],
          "Trainee Chef": ["trainee chef", "commis", "apprentice chef"],
          "Catering Assistant": ["catering"],
          "Construction Worker": ["construction", "worker", "labor", "labour"],
        };

        const roleConds: string[] = [];
        normalized.forEach((opt) => {
          if (opt in roleKeywords) {
            roleKeywords[opt].forEach((kw) => {
              roleConds.push(`job_title.ilike.%${kw}%`);
            });
          }
        });

        // Others-only: job titles that do NOT match any known role keywords
        const othersOnly = normalized.length === 1 && normalized.includes("Others");
        if (othersOnly) {
          const allRoleKeywords = Object.values(roleKeywords).flat();
          allRoleKeywords.forEach((kw) => {
            query = query.not("job_title", "ilike", `%${kw}%`);
          });
        } else {
          // Build OR filter across education and roles
          const orParts = [...eduConds, ...roleConds];
          if (orParts.length > 0) {
            query = query.or(orParts.join(","));
          }
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      const rows = data || [];
      setJobs(rows);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching filtered jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load job postings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreJobs = async () => {
    try {
      setLoadingMore(true);
      const from = jobs.length;
      const to = from + PAGE_SIZE - 1;
      let query = supabase
        .from("job_postings")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      // Apply the same filters as current appliedOptions
      const normalized = appliedOptions.includes("All Jobs") || appliedOptions.length === 0 ? [] : appliedOptions;
      if (normalized.length > 0) {
        const eduConds: string[] = [];
        if (normalized.includes("All Jobs (No minimum education requirement)")) {
          eduConds.push(
            "education_requirement.ilike.%no minimum%",
            "education_requirement.ilike.%no education%",
            "education_requirement.eq.",
            "education_requirement.ilike.%none%"
          );
        }
        if (normalized.includes("All Jobs (Secondary school education)")) {
          eduConds.push("education_requirement.ilike.%secondary%");
        }
        if (normalized.includes("All Jobs (High School education)")) {
          eduConds.push("education_requirement.ilike.%high school%");
        }
        if (normalized.includes("All Jobs with High School Graduates Preferred")) {
          eduConds.push(
            "education_requirement.ilike.%high school%",
            "education_requirement.ilike.%graduate%",
            "education_requirement.ilike.%preferred%"
          );
        }

        const roleKeywords: Record<string, string[]> = {
          "Driver": ["driver"],
          "Rider": ["rider"],
          "Delivery Person": ["delivery", "courier"],
          "Security Officer": ["security"],
          "Barista": ["barista"],
          "Cashier": ["cashier"],
          "Kitchen Assistant": ["kitchen assistant", "kitchen helper"],
          "Cleaner": ["cleaner", "cleaning"],
          "Nanny": ["nanny", "babysit"],
          "F&B Service Crew": ["service crew", "f&b", "food and beverage"],
          "Waiter": ["waiter", "server"],
          "Waitress": ["waitress", "server"],
          "Trainee Chef": ["trainee chef", "commis", "apprentice chef"],
          "Catering Assistant": ["catering"],
          "Construction Worker": ["construction", "worker", "labor", "labour"],
        };
        const roleConds: string[] = [];
        normalized.forEach((opt) => {
          if (opt in roleKeywords) {
            roleKeywords[opt].forEach((kw) => {
              roleConds.push(`job_title.ilike.%${kw}%`);
            });
          }
        });
        const othersOnly = normalized.length === 1 && normalized.includes("Others");
        if (othersOnly) {
          const allRoleKeywords = Object.values(roleKeywords).flat();
          allRoleKeywords.forEach((kw) => {
            query = query.not("job_title", "ilike", `%${kw}%`);
          });
        } else {
          const orParts = [...eduConds, ...roleConds];
          if (orParts.length > 0) {
            query = query.or(orParts.join(","));
          }
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      const rows = data || [];
      setJobs((prev) => [...prev, ...rows]);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error loading more jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load more job postings",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  // Helper: determine if a job matches a single option
  const jobMatchesOption = (job: JobPosting, option: FilterOption) => {
    const title = (job.job_title || "").toLowerCase();
    const edu = (job.education_requirement || "").toLowerCase();

    // Education-based options
    if (option === "All Jobs (No minimum education requirement)") {
      return (
        edu.includes("no minimum") ||
        edu.includes("no education") ||
        edu.trim() === "" ||
        edu === "none"
      );
    }
    if (option === "All Jobs (Secondary school education)") {
      return edu.includes("secondary");
    }
    if (option === "All Jobs (High School education)") {
      return edu.includes("high school");
    }
    if (option === "All Jobs with High School Graduates Preferred") {
      return edu.includes("high school") || edu.includes("graduate") || edu.includes("preferred");
    }

    // Role-based options (keywords on title)
    const roleKeywords: Record<string, string[]> = {
      "Driver": ["driver"],
      "Rider": ["rider"],
      "Delivery Person": ["delivery", "courier"],
      "Security Officer": ["security"],
      "Barista": ["barista"],
      "Cashier": ["cashier"],
      "Kitchen Assistant": ["kitchen assistant", "kitchen helper"],
      "Cleaner": ["cleaner", "cleaning"],
      "Nanny": ["nanny", "babysit"],
      "F&B Service Crew": ["service crew", "f&b", "food and beverage"],
      "Waiter": ["waiter", "server"],
      "Waitress": ["waitress", "server"],
      "Trainee Chef": ["trainee chef", "commis", "apprentice chef"],
      "Catering Assistant": ["catering"],
      "Construction Worker": ["construction", "worker", "labor", "labour"],
    };

    if (option in roleKeywords) {
      return roleKeywords[option]?.some((k) => title.includes(k));
    }

    if (option === "Others") {
      // Consider "Others" as titles that do not match any known role keyword
      const allRoleKeys = Object.values(roleKeywords).flat();
      const matchesAny = allRoleKeys.some((k) => title.includes(k));
      return !matchesAny; 
    }

    // "All Jobs" or unknown -> match all
    return true;
  };

  const applyFilters = () => {
    // Normalize and apply, then fetch first page with these filters
    const normalized = selectedOptions;
    const hasAll = normalized.includes("All Jobs");
    const next: FilterOption[] = hasAll ? ["All Jobs" as FilterOption] : normalized;
    setAppliedOptions(next);
    fetchFirstPageWithFilters(next);
  };

  const isOptionSelected = (opt: FilterOption) => selectedOptions.includes(opt);
  const toggleOption = (opt: FilterOption) => {
    setSelectedOptions((prev) => {
      // Selecting All Jobs clears others; selecting any other deselects All Jobs
      if (opt === "All Jobs") return prev.includes(opt) ? [] : ["All Jobs"]; 
      const withoutAll = prev.filter((p) => p !== "All Jobs");
      return withoutAll.includes(opt)
        ? withoutAll.filter((p) => p !== opt)
        : [...withoutAll, opt];
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16 pb-8">
        {/* Banner Section */}
        <div 
          className="relative h-[300px] md:h-[400px] bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: `url(${jobBannerBg})` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Content */}
          <div className="relative z-10 text-center px-4">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
              Listing your job for free, click here
            </h2>
            <Button 
              size="lg"
              onClick={() => navigate("/post-a-job")}
              className="text-lg px-8 py-6 hover-scale"
            >
              Post a job FREE
            </Button>
          </div>
        </div>

        {/* Jobs Listing Section */}
        <div className="container mx-auto px-4 pt-12">
          <div className="max-w-6xl mx-auto">
            
            {/* Filters Section (Dropdown) */}
            <div className="mb-8 p-4 md:p-6 border rounded-lg bg-white shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-0">
                <div className="flex-1 md:flex-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full md:w-full md:rounded-r-none justify-between"
                        ref={triggerRef}
                      >
                        <span>
                          Select job types{selectedOptions.length > 0 ? ` (${selectedOptions.length})` : ""}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="max-h-80 overflow-auto"
                      style={{ width: triggerWidth || undefined }}
                    >
                      <DropdownMenuLabel>Job filters</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {FILTER_OPTIONS.map((opt) => (
                        <DropdownMenuCheckboxItem
                          key={opt}
                          checked={isOptionSelected(opt)}
                          onCheckedChange={() => toggleOption(opt)}
                        >
                          {opt}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* Actions */}
                <div className="md:w-auto flex flex-row md:flex-row gap-2 md:gap-0 md:justify-start justify-end items-center">
                  <Button
                    onClick={applyFilters}
                    className="w-full md:w-auto md:rounded-l-none md:rounded-r-none"
                  >
                    Find Jobs
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full md:w-auto rounded-none md:-ml-px"
                    onClick={() => {
                      setSelectedOptions([]);
                      setAppliedOptions(["All Jobs" as FilterOption]);
                      // Reset to first page without filters
                      fetchJobs();
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              {/* Applied hint */}
              <div className="mt-3 text-xs text-muted-foreground">
                {appliedOptions.length === 0 || appliedOptions.includes("All Jobs")
                  ? "Showing all jobs"
                  : `Applied filters: ${appliedOptions.join(", ")}`}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No jobs posted yet. Be the first to post a job!
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      id={job.id}
                      businessName={job.business_name}
                      jobTitle={job.job_title}
                      salaryAmount={job.salary_amount}
                      salaryType={job.salary_type}
                      jobLocation={job.job_location}
                      jobType={job.job_type}
                      educationRequirement={job.education_requirement}
                      ageMin={job.age_min}
                      ageMax={job.age_max}
                      benefits={job.benefits}
                      applicationDeadline={job.application_deadline}
                      description={job.description}
                      contactNumber={job.contact_number}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button onClick={loadMoreJobs} disabled={loadingMore} className="rounded-none">
                      {loadingMore ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FindJobs;
