"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Tags,
  SlidersHorizontal,
  ArrowUpDown,
  Grid3X3,
} from "lucide-react";
import { StoryCard } from "@/components/story-card";
import { StoryCardData } from "@/components/story-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Types
interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ThemeStoriesClientProps {
  initialStories: StoryCardData[];
  initialPagination: PaginationData;
  themeSlug: string;
  currentSort: string;
  currentLimit: number;
}

// Sort options
const sortOptions = [
  { value: "date", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "rating", label: "Highest Rated" },
  { value: "reads", label: "Most Read" },
  { value: "title", label: "Title A-Z" },
];

// Limit options
const limitOptions = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
];

// Loading skeleton for stories grid
function StoriesGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-card rounded-xl border p-6 h-full">
            {/* Badge */}
            <Skeleton className="h-5 w-16 mb-3" />
            {/* Title */}
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-4" />
            {/* Description */}
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-4" />
            {/* Theme badges */}
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            {/* Footer */}
            <div className="border-t pt-4 mt-auto">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-5 w-8" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-10" />
                </div>
              </div>
              <Skeleton className="h-4 w-24 mt-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
        <Tags className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No stories found</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        There are no stories with this theme yet. Check back soon or explore
        other themes to discover amazing stories.
      </p>
      <div className="flex gap-3 justify-center">
        <Link href="/themes">
          <Button variant="outline">Browse Other Themes</Button>
        </Link>
        <Link href="/genres">
          <Button variant="outline">Explore Genres</Button>
        </Link>
      </div>
    </div>
  );
}

// Main client component
export function ThemeStoriesClient({
  initialStories,
  initialPagination,
  themeSlug,
  currentSort,
  currentLimit,
}: ThemeStoriesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [stories, setStories] = useState<StoryCardData[]>(initialStories);
  const [pagination, setPagination] =
    useState<PaginationData>(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get current values from URL or props
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = searchParams.get("sortBy") || currentSort;
  const limit = parseInt(
    searchParams.get("limit") || currentLimit.toString(),
    10
  );

  // Update URL and fetch data
  const updateParams = useCallback(
    (newPage: number, newSortBy: string, newLimit: number) => {
      const params = new URLSearchParams();
      params.set("page", newPage.toString());
      params.set("limit", newLimit.toString());
      if (newSortBy !== "date") {
        params.set("sortBy", newSortBy);
      }

      setIsTransitioning(true);

      // Update URL without navigation
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  // Fetch stories when params change
  useEffect(() => {
    let isMounted = true;

    async function fetchStories() {
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("limit", limit.toString());
        params.set("theme", themeSlug);
        if (sortBy !== "date") {
          params.set("sortBy", sortBy);
        }

        const res = await fetch(`/api/stories?${params.toString()}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          const rawStories = data.data || [];
          setStories(
            rawStories.map((story: Record<string, unknown> & { themes?: Array<{ theme: unknown }>; publishedAt?: string | null }) => ({
              ...story,
              themes: story.themes?.map((t) => t.theme) || [],
              publishedAt: story.publishedAt ? new Date(story.publishedAt) : null,
            }))
          );
          setPagination(data.pagination || initialPagination);
        }
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setTimeout(() => setIsTransitioning(false), 150);
        }
      }
    }

    fetchStories();

    return () => {
      isMounted = false;
    };
  }, [currentPage, sortBy, limit, themeSlug, initialPagination]);

  // Handle sort change
  function handleSortChange(value: string) {
    updateParams(1, value, limit);
  }

  // Handle limit change
  function handleLimitChange(value: string) {
    updateParams(1, sortBy, parseInt(value, 10));
  }

  // Handle page change
  function handlePageChange(page: number) {
    updateParams(page, sortBy, limit);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Generate pagination items
  function generatePaginationItems() {
    const { totalPages, page } = pagination;
    const items: React.ReactNode[] = [];

    if (totalPages <= 7) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={page === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            isActive={page === 1}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis after first if needed
      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={page === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis before last if needed
      if (page < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            isActive={page === totalPages}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  }

  // Show loading skeleton on initial load
  if (isLoading && stories.length === 0) {
    return <StoriesGridSkeleton count={limit} />;
  }

  return (
    <div className={cn(isTransitioning && "opacity-50 transition-opacity duration-150")}>
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b">
        {/* Results count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Grid3X3 className="w-4 h-4" />
          <span>
            Showing{" "}
            <span className="font-medium text-foreground">
              {stories.length > 0 ? (currentPage - 1) * limit + 1 : 0}
              {" - "}
              {Math.min(currentPage * limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {pagination.total.toLocaleString()}
            </span>{" "}
            stories
          </span>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort by */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[160px]" size="sm">
                <SlidersHorizontal className="w-4 h-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Per page */}
          <Select
            value={limit.toString()}
            onValueChange={handleLimitChange}
          >
            <SelectTrigger className="w-[130px]" size="sm">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stories grid or empty state */}
      {stories.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <StoryCard story={story} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-10 pt-6 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.hasPrev) {
                          handlePageChange(currentPage - 1);
                        }
                      }}
                      className={
                        !pagination.hasPrev
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {generatePaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.hasNext) {
                          handlePageChange(currentPage + 1);
                        }
                      }}
                      className={
                        !pagination.hasNext
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : !isLoading ? (
        <EmptyState />
      ) : null}

      {/* Overlay loader during transitions */}
      {isLoading && stories.length > 0 && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-background/30">
          <div className="flex items-center gap-3 px-6 py-3 rounded-lg bg-card shadow-lg border">
            <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}
