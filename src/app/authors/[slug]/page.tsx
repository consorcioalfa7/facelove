import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  User,
  Calendar,
  BookOpen,
  ArrowLeft,
  ArrowUpDown,
  Star,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoryCard, StoryCardData } from "@/components/story-card";

// Types
interface AuthorPageParams {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

interface AuthorData {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  memberSince: Date | null;
  createdAt: Date;
  storyCount: number;
  stories: StoryData[];
}

interface StoryData {
  id: string;
  externalId: string | null;
  title: string;
  slug: string;
  description: string | null;
  rating: number;
  votesCount: number;
  readsCount: number;
  commentsCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  genre: {
    id: string;
    name: string;
    slug: string;
  };
  themes: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface StoriesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface AuthorResponse {
  success: boolean;
  data: AuthorData;
  storiesPagination: StoriesPagination;
  error?: string;
}

// Fetch author data
async function getAuthor(
  slug: string,
  page: number = 1,
  sort: string = "date"
): Promise<AuthorResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/authors/${slug}?page=${page}&limit=12`,
    {
      cache: "no-store",
      headers: { "x-sort": sort },
    }
  );

  if (!res.ok) {
    if (res.status === 404) {
      return { success: false, data: {} as AuthorData, storiesPagination: {} as StoriesPagination, error: "Author not found" };
    }
    return { success: false, data: {} as AuthorData, storiesPagination: {} as StoriesPagination, error: "Failed to fetch author" };
  }

  const data = await res.json();
  
  // Sort stories client-side based on sort parameter
  if (data.success && data.data.stories) {
    const sortedStories = [...data.data.stories];
    switch (sort) {
      case "rating":
        sortedStories.sort((a: StoryData, b: StoryData) => b.rating - a.rating);
        break;
      case "reads":
        sortedStories.sort((a: StoryData, b: StoryData) => b.readsCount - a.readsCount);
        break;
      case "date":
      default:
        sortedStories.sort(
          (a: StoryData, b: StoryData) =>
            new Date(b.publishedAt || b.createdAt).getTime() -
            new Date(a.publishedAt || a.createdAt).getTime()
        );
        break;
    }
    data.data.stories = sortedStories;
  }
  
  return data;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: AuthorPageParams): Promise<Metadata> {
  const { slug } = await params;
  const response = await getAuthor(slug);

  if (!response.success || !response.data.name) {
    return {
      title: "Author Not Found",
      description: "The requested author could not be found.",
    };
  }

  const author = response.data;
  return {
    title: `${author.name} - Author Profile`,
    description:
      author.bio ||
      `Read ${author.storyCount} stories by ${author.name} on StoryVault. Discover their complete collection of works.`,
    openGraph: {
      title: `${author.name} - Author Profile | StoryVault`,
      description:
        author.bio ||
        `Explore stories by ${author.name}`,
      type: "profile",
    },
  };
}

// Loading skeleton component
function AuthorProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Profile header skeleton */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar skeleton */}
                <Skeleton className="w-32 h-32 rounded-full mx-auto md:mx-0" />

                {/* Info skeleton */}
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-10 w-64" />
                  <Skeleton className="h-5 w-40" />
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stories grid skeleton */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-64">
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="pt-4 flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Sort options
const sortOptions = [
  { value: "date", label: "Newest First" },
  { value: "rating", label: "Highest Rated" },
  { value: "reads", label: "Most Read" },
];

// Format date helper
function formatDate(date: Date | null): string {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// Format number helper
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Get initials for avatar placeholder
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function AuthorProfilePage({
  params,
  searchParams,
}: AuthorPageParams) {
  const { slug } = await params;
  const { page: pageParam, sort: sortParam } = await searchParams;
  
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const currentSort = sortParam || "date";

  const response = await getAuthor(slug, currentPage, currentSort);

  // Handle 404
  if (!response.success || !response.data.id) {
    notFound();
  }

  const author = response.data;
  const pagination = response.storiesPagination;

  // Transform story data to match StoryCard format
  const storiesForCards: StoryCardData[] = author.stories.map((story) => ({
    id: story.id,
    slug: story.slug,
    title: story.title,
    description: story.description,
    author: {
      name: author.name,
      slug: author.slug,
    },
    genre: story.genre,
    themes: story.themes,
    rating: story.rating,
    votesCount: story.votesCount,
    readsCount: story.readsCount,
    publishedAt: story.publishedAt,
  }));

  // Calculate average rating across all stories
  const avgRating =
    author.stories.length > 0
      ? author.stories.reduce((sum, s) => sum + s.rating, 0) /
        author.stories.length
      : 0;

  // Calculate total reads
  const totalReads = author.stories.reduce(
    (sum, s) => sum + s.readsCount,
    0
  );

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="flex items-center gap-1 text-sm">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/authors" className="flex items-center gap-1 text-sm">
                    Authors
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium">
                  {author.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </nav>

      {/* Author Profile Header */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-muted/50 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <Link
              href="/authors"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all authors
            </Link>

            <Card className="overflow-hidden border-2 shadow-lg shadow-amber-500/5">
              {/* Gradient accent bar */}
              <div className="h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500" />

              <CardContent className="p-6 md:p-10">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar */}
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-amber-500 via-rose-400 to-emerald-500 p-1">
                      <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                        {author.avatarUrl ? (
                          <img
                            src={author.avatarUrl}
                            alt={author.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl md:text-5xl font-bold gradient-text">
                            {getInitials(author.name)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                      {author.name}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4 text-sm text-muted-foreground">
                      {author.memberSince && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          Member since {formatDate(author.memberSince)}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-rose-500" />
                        {author.storyCount}{" "}
                        {author.storyCount === 1 ? "story" : "stories"}
                      </span>
                    </div>

                    {/* Bio */}
                    {author.bio && (
                      <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                        {author.bio}
                      </p>
                    )}

                    {/* Stats cards */}
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold">{avgRating.toFixed(1)}</span>
                        <span className="text-xs opacity-75">avg rating</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold">{formatNumber(totalReads)}</span>
                        <span className="text-xs opacity-75">total reads</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-semibold">{author.storyCount}</span>
                        <span className="text-xs opacity-75">works</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stories Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Section header with sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-amber-500" />
                  Stories by {author.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {pagination.total} {pagination.total === 1 ? "story" : "stories"}{" "}
                  in total
                </p>
              </div>

              {/* Sort dropdown - client component wrapper needed for interactivity */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <form className="flex items-center gap-2">
                  <input type="hidden" name="sort" value={currentSort} />
                  <Select name="sort" defaultValue={currentSort}>
                    <SelectTrigger className="w-[160px]">
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
                </form>
              </div>
            </div>

            {/* Stories Grid */}
            {storiesForCards.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {storiesForCards.map((story, index) => (
                    <div
                      key={story.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <StoryCard story={story} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-10 pt-8 border-t">
                    {/* Previous button */}
                    {pagination.hasPrev ? (
                      <Link
                        href={`/authors/${slug}?page=${currentPage - 1}&sort=${currentSort}`}
                      >
                        <Button variant="outline" className="gap-2">
                          <ArrowLeft className="w-4 h-4" />
                          Previous
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" disabled className="gap-2 opacity-50">
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </Button>
                    )}

                    {/* Page info */}
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    {/* Next button */}
                    {pagination.hasNext ? (
                      <Link
                        href={`/authors/${slug}?page=${currentPage + 1}&sort=${currentSort}`}
                      >
                        <Button variant="outline" className="gap-2">
                          Next
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" disabled className="gap-2 opacity-50">
                        Next
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Empty state */
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No stories yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  {author.name} hasn&apos;t published any stories yet. Check back
                  later or explore other authors!
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/genres">
                    <Button variant="outline">Browse Genres</Button>
                  </Link>
                  <Link href="/themes">
                    <Button variant="outline">Explore Themes</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Export loading component
export function Loading() {
  return <AuthorProfileSkeleton />;
}
