import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  Star,
  Eye,
  Heart,
  BookOpen,
  Clock,
  Bookmark,
  Share2,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ThemeBadge } from "@/components/theme-badge";
import { StoryCard, StoryCardData } from "@/components/story-card";

// Types
interface StoryPageParams {
  params: Promise<{ id: string }>;
}

interface StoryAuthor {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  memberSince: Date | null;
}

interface StoryGenre {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface StoryTheme {
  id: string;
  name: string;
  slug: string;
}

interface StoryData {
  id: string;
  externalId: string | null;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  rating: number;
  votesCount: number;
  readsCount: number;
  commentsCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: StoryAuthor;
  genre: StoryGenre;
  themes: StoryTheme[];
}

interface StoryResponse {
  success: boolean;
  data: StoryData;
  error?: string;
}

// Fetch story data
async function getStory(id: string): Promise<StoryResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/stories/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      return { success: false, data: {} as StoryData, error: "Story not found" };
    }
    return { success: false, data: {} as StoryData, error: "Failed to fetch story" };
  }

  return res.json();
}

// Fetch related stories (same genre)
async function getRelatedStories(
  genreSlug: string,
  currentStoryId: string,
  limit: number = 4
): Promise<StoryCardData[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  try {
    const res = await fetch(
      `${baseUrl}/api/genres/${genreSlug}?limit=${limit + 1}`,
      { cache: "no-store" }
    );

    if (!res.ok) return [];

    const data = await res.json();
    
    if (!data.success || !data.data?.stories) return [];

    // Filter out current story and transform to card format
    return data.data.stories
      .filter((s: { id: string }) => s.id !== currentStoryId)
      .slice(0, limit)
      .map((story: {
        id: string;
        slug: string;
        title: string;
        description: string | null;
        author: { name: string; slug: string };
        genre: { name: string; slug: string };
        themes: Array<{ id: string; name: string; slug: string }>;
        rating: number;
        votesCount: number;
        readsCount: number;
        publishedAt: Date | null;
      }) => ({
        id: story.id,
        slug: story.slug,
        title: story.title,
        description: story.description,
        author: story.author,
        genre: story.genre,
        themes: story.themes,
        rating: story.rating,
        votesCount: story.votesCount,
        readsCount: story.readsCount,
        publishedAt: story.publishedAt,
      }));
  } catch {
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: StoryPageParams): Promise<Metadata> {
  const { id } = await params;
  const response = await getStory(id);

  if (!response.success || !response.data.title) {
    return {
      title: "Story Not Found",
      description: "The requested story could not be found.",
    };
  }

  const story = response.data;
  return {
    title: `${story.title} - ${story.genre.name}`,
    description:
      story.description ||
      `Read "${story.title}" by ${story.author.name}. A ${story.genre.name.toLowerCase()} story on StoryVault.`,
    keywords: [
      story.title,
      story.author.name,
      story.genre.name,
      ...story.themes.map((t) => t.name),
      "story",
      "fiction",
      "reading",
    ],
    openGraph: {
      title: `${story.title} by ${story.author.name}`,
      description:
        story.description ||
        `A ${story.genre.name.toLowerCase()} story`,
      type: "article",
      publishedTime: story.publishedAt?.toISOString(),
      authors: [story.author.name],
      tags: [story.genre.name, ...story.themes.map((t) => t.name)],
    },
  };
}

// Loading skeleton component
function StoryDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Main content skeleton */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Skeleton className="h-8 w-24 mb-6" />

          {/* Title section */}
          <div className="space-y-4 mb-8">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex gap-3">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Content skeleton */}
          <div className="space-y-4 max-w-3xl">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className={`h-4 ${i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-11/12" : "w-10/12"}`} />
            ))}
          </div>

          {/* Related stories skeleton */}
          <div className="mt-16 pt-8 border-t">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-64">
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Format date helper
function formatDate(date: Date | null): string {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

// Format relative date
function formatRelativeDate(date: Date | null): string {
  if (!date) return "";
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

// Format number helper
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Star Rating Component
function StarRating({ rating, showValue = true, size = "md" }: { 
  rating: number; 
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const starSizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-7 h-7" : "w-5 h-5";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${starSizeClass} fill-amber-400 text-amber-400`}
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${starSizeClass} text-amber-400/30`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${starSizeClass} fill-amber-400 text-amber-400`} />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={`${starSizeClass} text-muted-foreground/30`}
          />
        ))}
      </div>
      {showValue && (
        <span className={`font-semibold text-foreground ${size === "lg" ? "text-lg" : size === "sm" ? "text-sm" : ""}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Parse content and extract introduction
function parseContent(content: string | null): { 
  introduction: string | null; 
  paragraphs: string[] 
} {
  if (!content) return { introduction: null, paragraphs: [] };

  // Split by double newlines to get paragraphs
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // First paragraph is typically the introduction
  const introduction = paragraphs.length > 0 ? paragraphs[0] : null;

  return { introduction, paragraphs };
}

export default async function StoryDetailPage({
  params,
}: StoryPageParams) {
  const { id } = await params;

  const response = await getStory(id);

  // Handle 404
  if (!response.success || !response.data.id) {
    notFound();
  }

  const story = response.data;
  const { introduction, paragraphs } = parseContent(story.content);

  // Get related stories
  const relatedStories = await getRelatedStories(
    story.genre.slug,
    story.id
  );

  // Estimate reading time (average 200 words per minute)
  const wordCount = story.content ? story.content.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="border-b bg-muted/30 sticky top-16 z-40 backdrop-blur-sm bg-opacity-90">
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
                  <Link
                    href={`/genres/${story.genre.slug}`}
                    className="flex items-center gap-1 text-sm"
                  >
                    {story.genre.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium line-clamp-1">
                  {story.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </nav>

      {/* Main Content */}
      <article className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to browse
            </Link>

            {/* Story Header */}
            <header className="mb-10">
              {/* Genre badge */}
              <Link href={`/genres/${story.genre.slug}`}>
                <Badge
                  variant="secondary"
                  className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  {story.genre.name}
                </Badge>
              </Link>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
                {story.title}
              </h1>

              {/* Author and meta info */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground mb-6">
                <Link
                  href={`/authors/${story.author.slug}`}
                  className="flex items-center gap-2 hover:text-foreground transition-colors group"
                >
                  <User className="w-4 h-4 text-rose-500" />
                  <span className="font-medium group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {story.author.name}
                  </span>
                </Link>

                {story.publishedAt && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <time dateTime={story.publishedAt.toISOString()}>
                      Published {formatDate(story.publishedAt)}
                      <span className="ml-1 opacity-70">
                        ({formatRelativeDate(story.publishedAt)})
                      </span>
                    </time>
                  </span>
                )}

                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  {readTime} min read
                </span>
              </div>

              {/* Theme badges */}
              {story.themes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {story.themes.map((theme) => (
                    <ThemeBadge key={theme.id} theme={theme} size="default" />
                  ))}
                </div>
              )}

              {/* Stats bar */}
              <Card className="bg-gradient-to-r from-amber-50 via-rose-50 to-emerald-50 dark:from-amber-950/20 dark:via-rose-950/20 dark:to-emerald-950/20 border-2 shadow-md">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Rating */}
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <StarRating rating={story.rating} size="lg" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {story.votesCount.toLocaleString()} votes
                        </p>
                      </div>
                    </div>

                    <Separator orientation="vertical" className="hidden sm:block h-12" />

                    {/* Stats grid */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1.5 justify-center text-foreground">
                          <Eye className="w-5 h-5 text-rose-500" />
                          <span className="text-lg font-bold">
                            {formatNumber(story.readsCount)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">reads</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1.5 justify-center text-foreground">
                          <Heart className="w-5 h-5 text-amber-500" />
                          <span className="text-lg font-bold">
                            {formatNumber(story.votesCount)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">votes</p>
                      </div>

                      {story.commentsCount > 0 && (
                        <div className="text-center">
                          <div className="flex items-center gap-1.5 justify-center text-foreground">
                            <BookOpen className="w-5 h-5 text-emerald-500" />
                            <span className="text-lg font-bold">
                              {story.commentsCount}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">comments</p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="hidden lg:flex items-center gap-2 ml-auto">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Bookmark className="w-4 h-4" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </header>

            <Separator className="mb-10" />

            {/* Story Content */}
            <div className="max-w-3xl mx-auto">
              {/* Introduction highlight */}
              {introduction && (
                <div className="mb-10 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 dark:from-amber-950/20 dark:to-rose-950/20 border border-amber-200/50 dark:border-amber-800/30">
                  <p className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">
                    Introduction
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-foreground/90 first-letter:text-4xl first-letter:md:text-5xl first-letter:font-bold first-letter:text-amber-600 dark:first-letter:text-amber-400 first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                    {introduction}
                  </p>
                </div>
              )}

              {/* Main content paragraphs */}
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {paragraphs.slice(1).map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base md:text-lg leading-relaxed text-foreground/90 mb-6 animate-fade-in-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {paragraph}
                  </p>
                ))}

                {/* If there's no separate intro, show all paragraphs normally */}
                {paragraphs.length <= 1 &&
                  paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-base md:text-lg leading-relaxed text-foreground/90 mb-6"
                    >
                      {paragraph}
                    </p>
                  ))}
              </div>

              {/* End of story indicator */}
              <div className="flex items-center justify-center my-12">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Separator className="w-16" />
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm font-medium">End of Story</span>
                  <Separator className="w-16" />
                </div>
              </div>

              {/* Author info card at bottom */}
              <Card className="mb-10 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500" />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar placeholder */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center flex-shrink-0">
                      {story.author.avatarUrl ? (
                        <img
                          src={story.author.avatarUrl}
                          alt={story.author.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground mb-1">
                        Written by
                      </p>
                      <Link
                        href={`/authors/${story.author.slug}`}
                        className="font-semibold text-lg hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      >
                        {story.author.name}
                      </Link>
                      {story.author.bio && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {story.author.bio}
                        </p>
                      )}
                    </div>

                    <Link href={`/authors/${story.author.slug}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap">
                        View Profile
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Related Stories Section */}
            {relatedStories.length > 0 && (
              <section className="mt-16 pt-10 border-t">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-emerald-500" />
                    More {story.genre.name} Stories
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    If you enjoyed this story, you might like these too
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedStories.map((relatedStory, index) => (
                    <div
                      key={relatedStory.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <StoryCard story={relatedStory} />
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Link href={`/genres/${story.genre.slug}`}>
                    <Button variant="outline" className="gap-2 group">
                      View all {story.genre.name} stories
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </section>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

// Export loading component
export function Loading() {
  return <StoryDetailSkeleton />;
}
