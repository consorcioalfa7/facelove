import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  LayoutGrid,
  Star,
  Eye,
  Calendar,
  FileText,
} from "lucide-react";
import { GenreStoriesClient } from "./genre-stories-client";
// Loading is handled by loading.tsx automatically
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";

// Types
interface GenreData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  storyCount: number;
  createdAt: Date;
}

interface StoriesResponse {
  success: boolean;
  data: StoryData[];
  pagination: PaginationData;
}

interface StoryData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  author: {
    name: string;
    slug: string;
  };
  genre: {
    name: string;
    slug: string;
  };
  themes: Array<{
    theme: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  rating: number;
  votesCount: number;
  readsCount: number;
  publishedAt: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Fetch genre data
async function getGenre(slug: string): Promise<GenreData | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/genres/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error("Error fetching genre:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const genre = await getGenre(slug);

  if (!genre) {
    return {
      title: "Genre Not Found",
    };
  }

  return {
    title: `${genre.name} Stories - Browse ${genre.name} Genre`,
    description:
      genre.description ||
      `Discover amazing ${genre.name} stories on StoryVault. Browse our collection of ${genre.storyCount} ${genre.name.toLowerCase()} stories.`,
    openGraph: {
      title: `${genre.name} Stories | StoryVault`,
      description:
        genre.description ||
        `Browse ${genre.storyCount} ${genre.name} stories on StoryVault`,
      type: "website",
    },
  };
}

// Static params generation for static generation
export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/genres`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    const genres = json.success ? json.data : [];

    return genres.map((genre: { slug: string }) => ({
      slug: genre.slug,
    }));
  } catch {
    return [];
  }
}

// Main page component
export default async function GenrePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sortBy?: string; limit?: string }>;
}) {
  const { slug } = await params;
  const queryParams = await searchParams;

  // Fetch genre data
  const genre = await getGenre(slug);

  // Handle 404
  if (!genre) {
    notFound();
  }

  // Parse query parameters with defaults
  const page = parseInt(queryParams.page || "1", 10) || 1;
  const sortBy = queryParams.sortBy || "date";
  const limit = parseInt(queryParams.limit || "20", 10) || 20;

  // Build API URL for stories
  const apiParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    genre: slug,
    sortBy: sortBy,
  });
  const storiesUrl = `/api/stories?${apiParams.toString()}`;

  // Fetch stories
  let storiesData: StoriesResponse | null = null;
  try {
    const res = await fetch(storiesUrl, { cache: "no-store" });
    if (res.ok) {
      storiesData = await res.json();
    }
  } catch (error) {
    console.error("Error fetching stories:", error);
  }

  // Transform story data to match StoryCard format
  const stories = (storiesData?.data || []).map((story) => ({
    ...story,
    themes: story.themes?.map((t: { theme: { id: string; name: string; slug: string } }) => t.theme) || [],
    publishedAt: story.publishedAt ? new Date(story.publishedAt) : null,
  }));

  const pagination = storiesData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-emerald-500/10 border-b">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-rose-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 py-12 md:py-16">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/genres">Genres</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{genre.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="max-w-2xl">
                {/* Genre badge and title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 shadow-lg shadow-amber-500/25">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 mb-1"
                    >
                      Genre
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                      {genre.name}
                    </h1>
                  </div>
                </div>

                {/* Description */}
                {genre.description && (
                  <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                    {genre.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-foreground">
                      {genre.storyCount.toLocaleString()}
                    </span>{" "}
                    stories
                  </span>
                </div>
              </div>

              {/* Back button */}
              <Link href="/genres">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  All Genres
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stories Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Client component for interactive features */}
            <GenreStoriesClient
              initialStories={stories}
              initialPagination={pagination}
              genreSlug={slug}
              currentSort={sortBy}
              currentLimit={limit}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


