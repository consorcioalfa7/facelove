import Link from "next/link";
import { Metadata, notFound } from "next/navigation";
import { db } from "@/lib/db";
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
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

// Types
interface StoryPageParams {
  params: Promise<{ id: string; slug?: string[] }>;
}

interface StoryAuthor {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  memberSince?: Date | null;
}

interface StoryGenre {
  id: string;
  name: string;
  slug: string;
}

interface StoryTheme {
  id: string;
  name: string;
  slug: string;
}

interface StoryData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  rating: number;
  votesCount: number;
  readsCount: number;
  commentsCount: number;
  publishedAt: Date | null | string;
  author: StoryAuthor;
  genre: StoryGenre;
  themes: StoryTheme[];
}

interface StoryResponse {
  success: boolean;
  data: StoryData;
  error?: string;
}

// Fetch story data directly from database
async function getStory(id: string): Promise<StoryResponse> {
  try {
    const story = await db.story.findUnique({
      where: { id },
      include: {
        author: true,
        genre: { select: { id: true, name: true, slug: true } },
        themes: {
          include: { theme: true },
        },
      },
    });

    if (!story) {
      return { success: false, data: {} as StoryData, error: "Story not found" };
    }

    return {
      success: true,
      data: {
        id: story.id,
        title: story.title,
        slug: story.slug,
        description: story.description,
        content: story.content,
        rating: story.rating,
        votesCount: story.votesCount,
        readsCount: story.readsCount,
        commentsCount: story.commentsCount,
        publishedAt: story.publishedAt,
        author: {
          id: story.author.id,
          name: story.author.name,
          slug: story.author.slug,
          bio: story.author.bio,
          memberSince: story.author.memberSince as Date | null | undefined,
        },
        genre: story.genre,
        themes: story.themes.map((st) => ({
          id: st.theme.id,
          name: st.theme.name,
          slug: st.theme.slug,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching story:", error);
    return { success: false, data: {} as StoryData, error: String(error) };
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: StoryPageParams): Promise<Metadata> {
  const { id } = await params;
  const response = await getStory(id);

  if (!response.success || !response.data?.title) {
    return {
      title: "História Não Encontrada | FaceLove",
      description: "A história solicitada não foi encontrada.",
    };
  }

  const story = response.data;
  return {
    title: `${story.title} - ${story.genre.name} | FaceLove`,
    description:
      story.description ||
      `Leia "${story.title}" por ${story.author.name}. Uma história ${story.genre.name.toLowerCase()} no FaceLove.`,
    keywords: [
      story.title,
      story.author.name,
      story.genre.name,
      ...story.themes.map((t) => t.name),
      "história",
      "leitura",
    ],
    openGraph: {
      title: `${story.title} por ${story.author.name}`,
      description:
        story.description || `Uma história ${story.genre.name.toLowerCase()}`,
      type: "article",
      publishedTime: story.publishedAt ? new Date(story.publishedAt as string).toISOString() : undefined,
      authors: [story.author.name],
      tags: [story.genre.name, ...story.themes.map((t) => t.name)],
    },
  };
}

// Format date helper
function formatDate(date: Date | string | null): string {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default async function StoryDetailPage({
  params,
}: StoryPageParams) {
  const { id } = await params;

  const response = await getStory(id);

  // Handle 404
  if (!response.success || !response.data?.title) {
    notFound();
  }

  const story = response.data;

  // Parse content
  const rawContent = story.content || "";
  const hasIntro = rawContent.includes("Introduction:");
  
  let introduction = "";
  let mainContent = "";
  
  if (hasIntro) {
    const parts = rawContent.split("Introduction:");
    introduction = parts[0]?.trim() || "";
    mainContent = parts.slice(1).join("Introduction:").trim();
  } else {
    mainContent = rawContent;
  }
  
  const paragraphs = mainContent
    .split(/\n\n+/)
    .filter(p => p.trim().length > 0)
    .map(p => p.trim());

  // Get related stories directly from database
  let relatedStories: StoryCardData[] = [];
  try {
    const storiesDb = await db.story.findMany({
      where: {
        publishedAt: { not: null },
        genreId: story.genre.id,
        id: { not: id },
      },
      include: {
        author: { select: { name: true, slug: true } },
        genre: { select: { name: true, slug: true } },
        themes: {
          include: { theme: true },
          take: 3,
        },
      },
      take: 4,
      orderBy: { rating: "desc" },
    });

    relatedStories = storiesDb.map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      description: s.description,
      author: s.author,
      genre: s.genre,
      themes: s.themes.map((t) => ({
        id: t.theme.id,
        name: t.theme.name,
        slug: t.theme.slug,
      })),
      rating: s.rating,
      readsCount: s.readsCount,
      publishedAt: s.publishedAt ? new Date(s.publishedAt) : null,
    }));
  } catch (e) {
    // Silently fail - related stories are optional
  }

  const readingTime = Math.ceil(rawContent.split(/\s+/).length / 200);
  const isLongStory = readingTime > 15;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-transparent py-12 md:py-16 border-b border-purple-100/20">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
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
                      <Link href={`/genres/${story.genre.slug}`}>
                        {story.genre.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbPage>{story.title}</BreadcrumbPage>
                </BreadcrumbList>
              </Breadcrumb>

              {/* Genre badge */}
              <Badge 
                variant="secondary"
                className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 transition-colors mb-4"
              >
                <BookOpen className="w-3.5 h-3.5 mr-1" />
                {story.genre.name}
              </Badge>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
                {story.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>por</span>
                  <Link 
                    href={`/authors/${story.author.slug}`}
                    className="font-medium text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    {story.author.name}
                  </Link>
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={story.publishedAt ? new Date(story.publishedAt as string).toISOString() : ""}>
                    {formatDate(story.publishedAt)}
                  </time>
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {story.readsCount.toLocaleString()} leituras
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {story.themes.map((theme) => (
                  <ThemeBadge key={theme.id} theme={theme} size="sm" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-lg bg-card border">
                <Star className="w-5 h-5 mx-auto text-yellow-500 fill-yellow-500 mb-1" />
                <div className="text-2xl font-bold text-purple-900">{story.rating.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">avaliação</div>
              </div>
              <div className="p-3 rounded-lg bg-card border">
                <Eye className="w-5 h-5 mx-auto text-pink-500 mb-1" />
                <div className="text-2xl font-bold text-purple-900">{story.readsCount.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">leituras</div>
              </div>
              <div className="p-3 rounded-lg bg-card border">
                <Clock className="w-5 h-5 mx-auto text-fuchsia-500 mb-1" />
                <div className="text-2xl font-bold text-purple-900">{readingTime}</div>
                <div className="text-xs text-muted-foreground">min de leitura</div>
              </div>
              <div className="p-3 rounded-lg bg-card border">
                <MessageSquare className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                <div className="text-2xl font-bold text-purple-900">{story.votesCount}</div>
                <div className="text-xs text-muted-foreground">votos</div>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        {introduction && (
          <section className="border-b bg-gradient-to-r from-purple-500/5 via-fuchsia-500/10 to-transparent">
            <div className="container mx-auto px-4 py-8 md:py-12">
              <div className="max-w-3xl mx-auto">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg shadow-purple-500/20 border border-purple-200/50 dark:border-purple-700/30">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white">
                      <Sparkles className="w-6 h-6 p-1" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-300 mb-2">Introdução:</h2>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{introduction}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        <article className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            {paragraphs.map((paragraph, index) => (
              <p 
                key={index} 
                className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {paragraph}
              </p>
            ))}
            
            {isLongStory && (
              <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                <p className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  ✨ Fim da História ✨
                </p>
              </div>
            )}
          </div>
        </article>

        {/* Author Info */}
        <section className="border-t bg-muted/30 mt-12">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white p-4">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>Sobre o Autor</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {story.author.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{story.author.name}</h3>
                      {story.author.bio && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {story.author.bio}
                        </p>
                      )}
                      {story.author.memberSince && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Membro desde {formatDate(story.author.memberSince)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    className="mt-4 border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400"
                    asChild
                  >
                    <Link href={`/authors/${story.author.slug}`}>
                      Ver todas as histórias do autor →
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <section className="border-t bg-muted/30 mt-12">
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-end justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  Histórias Relacionadas
                </h2>
                <Link 
                  href={`/genres/${story.genre.slug}`}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Ver todos em {story.genre.name.toLowerCase()} →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedStories.slice(0, 6).map((relatedStory, index) => (
                  <div
                    key={relatedStory.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <StoryCard story={relatedStory} variant="compact" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
