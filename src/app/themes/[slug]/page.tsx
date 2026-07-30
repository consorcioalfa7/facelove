import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  Tags,
  ArrowLeft,
  Star,
  FileText,
} from "lucide-react";
import { ThemeStoriesClient } from "./theme-stories-client";
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

// Types
interface ThemeData {
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

// Fetch theme data directly from database
async function getTheme(slug: string): Promise<ThemeData | null> {
  try {
    const theme = await db.theme.findUnique({
      where: { slug },
    });

    if (!theme) {
      return null;
    }

    return {
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      description: theme.description,
      sortOrder: theme.sortOrder,
      storyCount: theme.storyCount,
      createdAt: theme.createdAt,
    };
  } catch (error) {
    console.error("Error fetching theme:", error);
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
  const theme = await getTheme(slug);

  if (!theme) {
    return {
      title: "Tema Não Encontrado | FaceLove",
    };
  }

  return {
    title: `${theme.name} - Explorar Tema | FaceLove`,
    description:
      theme.description ||
      `Descubra histórias sobre ${theme.name} no FaceLove. Explore nossa coleção com ${theme.storyCount} histórias.`,
    openGraph: {
      title: `${theme.name} Tema | FaceLove`,
      description:
        theme.description ||
        `Explore ${theme.storyCount} histórias com o tema ${theme.name} no FaceLove`,
      type: "website",
    },
  };
}

// Static params generation for static generation
export async function generateStaticParams() {
  try {
    const themes = await db.theme.findMany({
      select: { slug: true },
      take: 50,
    });

    return themes.map((theme) => ({
      slug: theme.slug,
    }));
  } catch {
    return [];
  }
}

// Main page component
export default async function ThemePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sortBy?: string; limit?: string }>;
}) {
  const { slug } = await params;
  const queryParams = await searchParams;

  // Fetch theme data
  const theme = await getTheme(slug);

  // Handle 404
  if (!theme) {
    notFound();
  }

  // Parse query parameters with defaults
  const page = parseInt(queryParams.page || "1", 10) || 1;
  const sortBy = queryParams.sortBy || "date";
  const limit = parseInt(queryParams.limit || "20", 10) || 20;

  // Build order by clause based on sortBy
  let orderBy: Record<string, "asc" | "desc"> = { publishedAt: "desc" };
  switch (sortBy) {
    case "rating":
      orderBy = { rating: "desc" };
      break;
    case "reads":
      orderBy = { readsCount: "desc" };
      break;
    case "oldest":
      orderBy = { publishedAt: "asc" };
      break;
    default:
      orderBy = { publishedAt: "desc" };
  }

  // Fetch stories directly from database
  const skip = (page - 1) * limit;
  const [storiesDb, total] = await Promise.all([
    db.story.findMany({
      where: {
        publishedAt: { not: null },
        themes: {
          some: {
            theme: { slug },
          },
        },
      },
      include: {
        author: { select: { name: true, slug: true } },
        genre: { select: { name: true, slug: true } },
        themes: {
          include: { theme: true },
          take: 3,
        },
      },
      orderBy,
      take: limit,
      skip,
    }),
    db.story.count({
      where: {
        publishedAt: { not: null },
        themes: {
          some: {
            theme: { slug },
          },
        },
      },
    }),
  ]);

  // Transform story data to match StoryCard format
  const stories = storiesDb.map((story) => ({
    id: story.id,
    title: story.title,
    slug: story.slug,
    description: story.description,
    author: story.author,
    genre: story.genre,
    themes: story.themes.map((t) => t.theme),
    rating: story.rating,
    votesCount: story.votesCount,
    readsCount: story.readsCount,
    publishedAt: story.publishedAt ? new Date(story.publishedAt) : null,
  }));

  const totalPages = Math.ceil(total / limit);
  const pagination: PaginationData = {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section - FaceLove Pink/Purple Theme */}
        <section className="relative overflow-hidden bg-gradient-to-br from-pink-500/10 via-fuchsia-500/5 to-purple-500/10 border-b">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-fuchsia-500/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/3 rounded-full blur-3xl" />
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
                    <Link href="/themes">Temas</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbPage>{theme.name}</BreadcrumbPage>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="max-w-2xl">
                {/* Theme badge and title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 shadow-lg shadow-pink-500/25">
                    <Tags className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <Badge
                      variant="secondary"
                      className="bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 mb-1"
                    >
                      Tema
                    </Badge>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                      {theme.name}
                    </h1>
                  </div>
                </div>

                {/* Description */}
                {theme.description && (
                  <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                    {theme.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-pink-500" />
                    <span className="font-medium text-foreground">
                      {theme.storyCount.toLocaleString()}
                    </span>{" "}
                    histórias
                  </span>
                </div>
              </div>

              {/* Back button */}
              <Link href="/themes">
                <Button variant="outline" className="gap-2 border-pink-200 text-pink-600 hover:bg-pink-50 dark:border-pink-700 dark:text-pink-400">
                  <ArrowLeft className="w-4 h-4" />
                  Todos os Temas
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stories Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Client component for interactive features */}
            <ThemeStoriesClient
              initialStories={stories}
              initialPagination={pagination}
              themeSlug={slug}
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
