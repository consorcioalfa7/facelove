import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  ChevronLeft,
  ArrowRight,
  Type,
  BookMarked,
  Layers,
  Timer,
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
import { ReadingControls } from "@/components/story-reading-controls";
import { StoryNavigation } from "@/components/story-navigation";
import { StoryClientWrapper } from "@/components/story-client-wrapper";
import { ReadingTimer } from "@/components/reading-timer";
import { StoryComments } from "@/components/story-comments";
import { BookmarkButton } from "@/components/bookmark-button";

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

// Get previous and next stories for navigation
async function getAdjacentStories(
  currentId: string,
  genreId: string
): Promise<{
  previous: { id: string; title: string; slug: string; authorName: string } | null;
  next: { id: string; title: string; slug: string; authorName: string } | null;
}> {
  try {
    // Get stories in the same genre ordered by published date
    const stories = await db.story.findMany({
      where: {
        publishedAt: { not: null },
        genreId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 50, // Get enough to find neighbors
    });

    const currentIndex = stories.findIndex((s) => s.id === currentId);
    
    if (currentIndex === -1) {
      return { previous: null, next: null };
    }

    return {
      previous: currentIndex < stories.length - 1
        ? {
            id: stories[currentIndex + 1].id,
            title: stories[currentIndex + 1].title,
            slug: stories[currentIndex + 1].slug,
            authorName: stories[currentIndex + 1].author.name,
          }
        : null,
      next: currentIndex > 0
        ? {
            id: stories[currentIndex - 1].id,
            title: stories[currentIndex - 1].title,
            slug: stories[currentIndex - 1].slug,
            authorName: stories[currentIndex - 1].author.name,
          }
        : null,
    };
  } catch (error) {
    console.error("Error fetching adjacent stories:", error);
    return { previous: null, next: null };
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

// Calculate reading time with more detail
function calculateReadingTime(content: string): {
  minutes: number;
  words: number;
  displayText: string;
} {
  const words = content.split(/\s+/).filter(w => w.length > 0).length;
  const readingSpeed = 200; // words per minute
  const minutes = Math.ceil(words / readingSpeed);
  
  let displayText: string;
  if (minutes < 1) {
    displayText = "< 1 min";
  } else if (minutes === 1) {
    displayText = "1 min de leitura";
  } else if (minutes <= 5) {
    displayText = `${minutes} mins de leitura`;
  } else if (minutes <= 15) {
    displayText = `${minutes} mins de leitura • Curta`;
  } else if (minutes <= 30) {
    displayText = `${minutes} mins de leitura • Média`;
  } else {
    displayText = `${minutes} mins de leitura • Longa`;
  }
  
  return { minutes, words, displayText };
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

  // Get adjacent stories for navigation
  const { previous: previousStory, next: nextStory } = await getAdjacentStories(
    id,
    story.genre.id
  );

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

  // Better paragraph splitting - handle various formats
  const paragraphs = mainContent
    .split(/\n\s*\n|\n(?=[A-Z])/)
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim());

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
      take: 6,
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
      votesCount: s.votesCount,
      readsCount: s.readsCount,
      publishedAt: s.publishedAt ? new Date(s.publishedAt) : null,
    }));
  } catch (e) {
    // Silently fail - related stories are optional
  }

  const readingTime = calculateReadingTime(rawContent);
  const isLongStory = readingTime.minutes > 15;

  return (
    <StoryClientWrapper>
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Reading Controls - Progress Bar & Font Size Toggle */}
      <ReadingControls contentId="story-content" />

      <main className="flex-1">
        {/* Enhanced Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-500/15 via-fuchsia-500/10 to-pink-500/10 py-10 md:py-14 lg:py-18 border-b border-purple-200/30 dark:border-purple-800/30">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-pink-400/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-fuchsia-400/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" 
               style={{ 
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
               }} 
          />

          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <Breadcrumb className="mb-6">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/" className="text-muted-foreground hover:text-purple-600 transition-colors">
                        Home
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`/genres/${story.genre.slug}`} className="text-muted-foreground hover:text-purple-600 transition-colors">
                        {story.genre.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbPage className="font-medium text-purple-700 dark:text-purple-300 max-w-[200px] truncate">
                    {story.title}
                  </BreadcrumbPage>
                </BreadcrumbList>
              </Breadcrumb>

              {/* Genre badge with enhanced styling */}
              <Badge 
                variant="secondary"
                className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 dark:from-purple-900/50 dark:to-pink-900/50 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/50 transition-all duration-300 mb-4 px-4 py-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                {story.genre.name}
              </Badge>

              {/* Title with enhanced typography */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-purple-900 via-fuchsia-800 to-pink-900 dark:from-purple-100 dark:via-fuchsia-200 dark:to-pink-100 bg-clip-text text-transparent leading-tight">
                {story.title}
              </h1>

              {/* Description if available */}
              {story.description && (
                <p className="text-base md:text-lg text-muted-foreground mb-5 max-w-2xl leading-relaxed">
                  {story.description}
                </p>
              )}

              {/* Meta info with better layout */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-5 text-sm text-muted-foreground bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                    {story.author.name.charAt(0)}
                  </div>
                  <span>
                    por{" "}
                    <Link 
                      href={`/authors/${story.author.slug}`}
                      className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline decoration-purple-300 dark:decoration-purple-700 underline-offset-2 transition-colors"
                    >
                      {story.author.name}
                    </Link>
                  </span>
                </span>
                
                <span className="hidden sm:inline-flex items-center gap-1 text-muted-foreground/50">•</span>
                
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-purple-500/70" />
                  <time dateTime={story.publishedAt ? new Date(story.publishedAt as string).toISOString() : ""}>
                    {formatDate(story.publishedAt)}
                  </time>
                </span>
                
                <span className="hidden md:inline-flex items-center gap-1 text-muted-foreground/50">•</span>
                
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Eye className="w-4 h-4 text-pink-500/70" />
                  <span className="font-medium">{story.readsCount.toLocaleString()}</span>
                  <span className="hidden sm:inline">leituras</span>
                </span>

                <span className="hidden md:inline-flex items-center gap-1 text-muted-foreground/50">•</span>

                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Timer className="w-4 h-4 text-fuchsia-500/70" />
                  <span className="font-medium">{readingTime.displayText}</span>
                </span>
              </div>

              {/* Tags with enhanced styling */}
              <div className="flex flex-wrap gap-2 mt-4">
                {story.themes.map((theme) => (
                  <ThemeBadge key={theme.id} theme={theme} size="sm" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Bar */}
        <section className="border-b bg-gradient-to-r from-muted/50 via-purple-50/30 to-muted/50 dark:from-muted/30 dark:via-purple-950/20 dark:to-muted/30 sticky top-[33px] z-30 backdrop-blur-md bg-opacity-80">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="p-3 md:p-4 rounded-xl bg-card/80 border border-purple-100/50 dark:border-purple-800/30 shadow-sm hover:shadow-md hover:border-purple-300/60 dark:hover:border-purple-700/50 transition-all duration-300 group">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent">
                  {story.rating.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                  <span>{story.votesCount}</span> votos
                </div>
              </div>
              
              <div className="p-3 md:p-4 rounded-xl bg-card/80 border border-pink-100/50 dark:border-pink-800/30 shadow-sm hover:shadow-md hover:border-pink-300/60 dark:hover:border-pink-700/50 transition-all duration-300 group">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Eye className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                  {story.readsCount.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">leituras</div>
              </div>
              
              <div className="p-3 md:p-4 rounded-xl bg-card/80 border border-fuchsia-100/50 dark:border-fuchsia-800/30 shadow-sm hover:shadow-md hover:border-fuchsia-300/60 dark:hover:border-fuchsia-700/50 transition-all duration-300 group">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-fuchsia-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-fuchsia-600 to-purple-500 bg-clip-text text-transparent">
                  {readingTime.minutes}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">min de leitura</div>
              </div>
              
              <div className="p-3 md:p-4 rounded-xl bg-card/80 border border-purple-100/50 dark:border-purple-800/30 shadow-sm hover:shadow-md hover:border-purple-300/60 dark:hover:border-purple-700/50 transition-all duration-300 group">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <MessageSquare className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                  {story.commentsCount}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">comentários</div>
              </div>
            </div>
            
            {/* Reading tips bar */}
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-dashed border-purple-200/30 dark:border-purple-700/20 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-purple-500/70" />
                Ajuste a fonte acima
              </span>
              <span className="text-muted-foreground/30">|</span>
              <span className="flex items-center gap-1">
                <BookMarked className="w-3.5 h-3.5 text-pink-500/70" />
                Barra de progresso ativa
              </span>
            </div>
          </div>
        </section>

        {/* Introduction Section - Enhanced */}
        {introduction && (
          <section className="border-b bg-gradient-to-r from-purple-50 via-fuchsia-50/50 to-pink-50 dark:from-purple-950/30 dark:via-fuchsia-950/20 dark:to-pink-950/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
              <div className="max-w-3xl mx-auto">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-xl shadow-purple-500/10 border border-purple-200/50 dark:border-purple-700/30 relative overflow-hidden">
                  {/* Decorative corner gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-lg shadow-purple-500/25">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg md:text-xl font-bold text-purple-800 dark:text-purple-300">
                          Introdução
                        </h2>
                        <p className="text-xs text-purple-500 dark:text-purple-400 font-medium">
                          Sobre esta história
                        </p>
                      </div>
                    </div>
                    
                    <div className="prose prose-purple dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg whitespace-pre-wrap">
                        {introduction}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Content - Enhanced Typography with Sidebar */}
        <div className="container mx-auto px-4 py-10 md:py-14 transition-all duration-300">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
            
            {/* Main Article Content */}
            <article 
              id="story-content"
              className="flex-1 min-w-0 text-lg leading-8"
            >
              {/* Chapter/Section indicator */}
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-dashed border-purple-200/40 dark:border-purple-700/30">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-purple-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-semibold text-purple-800 dark:text-purple-300">Capítulo 1</h2>
                <p className="text-xs text-muted-foreground">O começo da história</p>
              </div>
            </div>

            {/* Content paragraphs with enhanced styling */}
            <div className="space-y-7">
              {paragraphs.map((paragraph, index) => {
                // Check if paragraph looks like dialogue or special formatting
                const isDialogue = paragraph.startsWith('"') || paragraph.startsWith('"');
                const isFirstParagraph = index === 0;
                
                return (
                  <p 
                    key={index} 
                    className={`text-gray-700 dark:text-gray-300 leading-relaxed md:leading-loose animate-fade-in-up first-letter:first-letter:text-3xl first-letter:md:first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-purple-700 dark:first-letter:text-purple-400 ${
                      isDialogue ? 'pl-4 md:pl-6 border-l-2 border-purple-200 dark:border-purple-800 italic bg-purple-50/30 dark:bg-purple-950/20 py-2 rounded-r-lg' : ''
                    } ${
                      isFirstParagraph ? '' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {paragraph}
                  </p>
                );
              })}
            </div>
            
            {/* Story End Indicator */}
            <div className="mt-12 pt-8 border-t-2 border-dashed border-purple-200 dark:border-purple-800">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-100 via-fuchsia-100 to-pink-100 dark:from-purple-900/30 dark:via-fuchsia-900/20 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-700/30">
                  <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                  <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ✨ Fim da História ✨
                  </span>
                  <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
                </div>
                
                {isLongStory && (
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Obrigado por ler até o final! Esta é uma história extensa com aproximadamente{' '}
                    <span className="font-medium text-purple-600 dark:text-purple-400">{readingTime.words.toLocaleString()}</span> palavras.
                  </p>
                )}
              </div>
            </div>
        </article>

        {/* Reading Sidebar - Timer & Tools */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-[120px] space-y-6">
            {/* Reading Timer */}
            <ReadingTimer 
              storyId={story.id}
              storyTitle={story.title}
              autoStart={true}
            />

            {/* Quick Bookmark */}
            <Card className="border-purple-100 dark:border-purple-800/50 overflow-hidden">
              <CardContent className="pt-5 pb-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-purple-500" />
                  Ferramentas de Leitura
                </h4>
                <div className="space-y-2">
                  <BookmarkButton 
                    storyId={story.id}
                    storyTitle={story.title}
                    currentPosition={0}
                    compact={false}
                  />
                </div>
                
                {/* Keyboard shortcuts hint */}
                <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">Atalhos do teclado:</p>
                  <p><kbd className="px-1.5 py-0.5 rounded bg-background border font-mono">←</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-background border font-mono">→</kbd> História anterior/próxima</p>
                  <p><kbd className="px-1.5 py-0.5 rounded bg-background border font-mono">?</kbd> Ver todos os atalhos</p>
                  <p><kbd className="px-1.5 py-0.5 rounded bg-background border font-mono">/</kbd> Focar na busca</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Story Quick Stats */}
            <Card className="bg-gradient-to-br from-purple-50/80 to-pink-50/40 dark:from-purple-950/20 dark:to-pink-950/10 border-purple-100/50">
              <CardContent className="pt-5 pb-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-pink-500" />
                  Sobre esta história
                </h4>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Gênero</dt>
                    <dd className="font-medium">{story.genre.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tempo</dt>
                    <dd className="font-medium">{readingTime.minutes} min</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Palavras</dt>
                    <dd className="font-medium">{readingTime.words.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Avaliação</dt>
                    <dd className="font-medium flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                      {story.rating.toFixed(1)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
        </div>

        {/* Story Navigation - Previous / Next */}
        <StoryNavigation 
          previousStory={previousStory}
          nextStory={nextStory}
        />

        {/* Comments Section */}
        <section className="border-t py-12 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <StoryComments 
                storyId={story.id}
                storyTitle={story.title}
                allowRating={true}
                maxVisible={5}
              />
            </div>
          </div>
        </section>

        {/* Author Info Section - Enhanced */}
        <section className="border-t bg-gradient-to-b from-muted/30 to-background py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="overflow-hidden border-0 shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/15 transition-all duration-500">
                {/* Gradient header */}
                <CardHeader className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white p-6 relative overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full" 
                         style={{
                           backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
                         }}
                    />
                  </div>
                  <CardTitle className="flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-lg">Sobre o Autor</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 via-fuchsia-400 to-pink-400 p-0.5">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                          <span className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {story.author.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                        {story.author.name}
                      </h3>
                      {story.author.bio && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                          {story.author.bio}
                        </p>
                      )}
                      {story.author.memberSince && (
                        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Membro desde {formatDate(story.author.memberSince)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                    <Button 
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-950/50 font-medium transition-all duration-300"
                      asChild
                    >
                      <Link href={`/authors/${story.author.slug}`}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Ver todas as histórias do autor
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Related Stories Section - Enhanced */}
        {relatedStories.length > 0 && (
          <section className="border-t bg-gradient-to-b from-background to-muted/20 py-12 md:py-16">
            <div className="container mx-auto px-4">
              {/* Section header */}
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Histórias Relacionadas
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Mais histórias de {story.genre.name.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/genres/${story.genre.slug}`}
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors px-4 py-2 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50"
                  >
                    Ver todos em {story.genre.name.toLowerCase()}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                
                {/* Stories grid */}
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

                {/* Show more link for mobile */}
                <div className="mt-8 text-center sm:hidden">
                  <Link 
                    href={`/genres/${story.genre.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400"
                  >
                    Ver mais histórias
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Call to Action Section */}
        <section className="border-t py-12 bg-gradient-to-r from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-950/20 dark:via-fuchsia-950/10 dark:to-pink-950/20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/30 shadow-sm">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gostou desta história?
                </span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Explore mais histórias incríveis no FaceLove
              </h3>
              
              <p className="text-muted-foreground max-w-md mx-auto">
                Descubra milhares de romances e histórias de autores talentosos de todo o mundo.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 font-semibold px-8"
                  asChild
                >
                  <Link href="/genres">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Explorar Gêneros
                  </Link>
                </Button>
                
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-950/50 font-semibold px-8"
                  asChild
                >
                  <Link href="/">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar ao Início
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </StoryClientWrapper>
  );
}
