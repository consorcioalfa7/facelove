"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search-bar";
import { StoryCard } from "@/components/story-card";
import {
  Search,
  BookOpen,
  Tags,
  Users,
  LayoutGrid,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  Heart,
  Sparkles,
  ArrowRight,
  Loader2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Types
interface SearchResult {
  id: string;
  title: string;
  slug?: string;
  name?: string;
  description?: string | null;
  bio?: string | null;
  type: "story" | "genre" | "theme" | "author";
  author?: { name: string; slug: string };
  genre?: { name: string; slug: string };
  rating?: number;
  readsCount?: number;
  storyCount?: number;
}

interface SearchResponse {
  success: boolean;
  results: {
    stories: SearchResult[];
    genres: SearchResult[];
    themes: SearchResult[];
    authors: SearchResult[];
  };
  total: number;
}

// Filter option types
type FilterType = "story" | "genre" | "theme" | "author";

interface ActiveFilter {
  id: string;
  label: string;
  type: FilterType;
}

// Popular searches for empty state
const POPULAR_SEARCHES = [
  { term: "Romance", emoji: "💕", count: "2.4k" },
  { term: "Fantasia", emoji: "🧙‍♀️", count: "1.8k" },
  { term: "Ficção Científica", emoji: "🚀", count: "980" },
  { term: "Mistério", emoji: "🔍", count: "756" },
  { term: "Drama", emoji: "🎭", count: "1.2k" },
  { term: "Comédia Romântica", emoji: "😄", count: "645" },
];

const TRENDING_TOPICS = [
  "Amor Proibido",
  "Segunda Chance",
  "CEO Romântico",
  "Fantasia Urbana",
  "Viagem no Tempo",
];

// Loading skeleton components
function StorySkeleton() {
  return (
    <Card className="overflow-hidden border-border/50">
      <Skeleton className="aspect-[3/4] w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function GenreSkeleton() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="h-5 flex-1" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-20" />
      </CardContent>
    </Card>
  );
}

function AuthorSkeleton() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 flex items-center gap-3">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function ThemeBadgeSkeleton() {
  return (
    <Skeleton className="h-10 w-28 rounded-full" />
  );
}

// Results tab content with loading state
function TabContentWithLoading({
  children,
  isLoading,
  skeletonType,
  count = 6,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  skeletonType: "story" | "genre" | "theme" | "author";
  count?: number;
}) {
  if (isLoading) {
    const SkeletonComponent = 
      skeletonType === "story" ? StorySkeleton :
      skeletonType === "genre" ? GenreSkeleton :
      skeletonType === "author" ? AuthorSkeleton : ThemeBadgeSkeleton;

    if (skeletonType === "theme") {
      return (
        <div className="flex flex-wrap gap-3 animate-in fade-in duration-300">
          {[...Array(count)].map((_, i) => (
            <ThemeBadgeSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (skeletonType === "story") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {[...Array(count)].map((_, i) => (
            <StorySkeleton key={i} />
          ))}
        </div>
      );
    }

    return (
      <div className={cn(
        "grid gap-4 animate-in fade-in duration-300",
        skeletonType === "author" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      )}>
        {[...Array(count)].map((_, i) => (
          <SkeletonComponent key={i} />
        ))}
      </div>
    );
  }

  return <>{children}</>;
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  // State management
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("stories");
  const [sortBy, setSortBy] = useState("relevance");
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [visibleCount, setVisibleCount] = useState({
    stories: 6,
    genres: 12,
    themes: 20,
    authors: 6,
  });
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        // Reset visible counts when new search is performed
        setVisibleCount({
          stories: 6,
          genres: 12,
          themes: 20,
          authors: 6,
        });
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search on mount if query present
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  // Count total results by type
  const getCountByType = (type: keyof SearchResponse["results"]) => {
    return results?.results[type]?.length || 0;
  };

  const getTotalCount = () => {
    if (!results?.results) return 0;
    return (
      getCountByType("stories") +
      getCountByType("genres") +
      getCountByType("themes") +
      getCountByType("authors")
    );
  };

  const totalResults = getTotalCount();

  // Add filter handler
  const addFilter = (filter: ActiveFilter) => {
    if (!activeFilters.find(f => f.id === filter.id)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  // Remove filter handler
  const removeFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter(f => f.id !== filterId));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  // Load more handler
  const handleLoadMore = async (type: "stories" | "genres" | "themes" | "authors") => {
    setIsLoadMoreLoading(true);
    
    // Simulate loading delay for better UX feel
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setVisibleCount(prev => ({
      ...prev,
      [type]: prev[type] + (type === "stories" || type === "authors" ? 6 : type === "themes" ? 10 : 6),
    }));
    
    setIsLoadMoreLoading(false);
  };

  // Check if there are more results to show
  const hasMoreResults = (type: "stories" | "genres" | "themes" | "authors") => {
    const count = getCountByType(type);
    return visibleCount[type] < count;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Enhanced Gradient Background */}
        <section className="relative overflow-hidden">
          {/* Animated background layers */}
          <div className="absolute inset-0 -z-10">
            {/* Main gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500" />
            
            {/* Animated orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-bounce" style={{ animationDuration: '7s' }} />
            
            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}
            />
            
            {/* Floating hearts decoration */}
            <div className="absolute top-20 left-10 text-white/10 text-4xl animate-bounce" style={{ animationDuration: '3s' }}>♥</div>
            <div className="absolute top-40 right-20 text-white/10 text-3xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>♡</div>
            <div className="absolute bottom-32 left-1/4 text-white/10 text-2xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>♥</div>
          </div>

          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Descubra sua próxima história favorita</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white">
                Encontre{" "}
                <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
                  Histórias
                </span>{" "}
                que te fazem sentir
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Explore milhares de histórias, gêneros e temas. De romance a fantasia, 
                encontre a história perfeita para você.
              </p>

              {/* Large search bar */}
              <div className="mb-6">
                <SearchBar
                  size="lg"
                  showSuggestions={true}
                  placeholder="Buscar histórias, gêneros, temas, autores..."
                  onSearch={setQuery}
                />
              </div>

              {/* Keyboard shortcut hint */}
              <p className="text-sm text-white/60 flex items-center justify-center gap-2">
                <kbd className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-xs font-mono">⌘</kbd>
                <span>+</span>
                <kbd className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-xs font-mono">K</kbd>
                <span className="ml-1">para buscar rapidamente</span>
              </p>

              {/* Quick stats when there are results */}
              {!isLoading && query && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className={cn(
                    "inline-flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-sm transition-all",
                    totalResults > 0 
                      ? "bg-white/20 border border-white/30" 
                      : "bg-white/10 border border-white/20"
                  )}>
                    {totalResults > 0 ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-green-300" />
                        </div>
                        <p className="text-white/90">
                          <span className="font-bold text-white text-lg">{totalResults}</span> resultados para{" "}
                          <span className="font-semibold text-yellow-200">&ldquo;{query}&rdquo;</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-orange-400/20 flex items-center justify-center">
                          <Search className="w-4 h-4 text-orange-300" />
                        </div>
                        <p className="text-white/90">
                          Nenhum resultado encontrado para{" "}
                          <span className="font-semibold">&ldquo;{query}&rdquo;</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-background" />
            </svg>
          </div>
        </section>

        {/* Results Section */}
        {(query || isLoading) && (
          <section className="py-8 md:py-12 bg-background">
            <div className="container mx-auto px-4">
              
              {/* Active Filters Display */}
              {activeFilters.length > 0 && (
                <div className="max-w-5xl mx-auto mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-wrap items-center gap-2 p-4 rounded-2xl bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                      <Filter className="w-4 h-4" />
                      <span>Filtros:</span>
                    </div>
                    {activeFilters.map((filter) => (
                      <Badge
                        key={filter.id}
                        variant="secondary"
                        className="gap-1.5 pr-1 hover:bg-destructive/10 group cursor-pointer transition-colors"
                        onClick={() => removeFilter(filter.id)}
                      >
                        {filter.label}
                        <X className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs ml-auto text-muted-foreground hover:text-foreground"
                    >
                      Limpar tudo
                    </Button>
                  </div>
                </div>
              )}

              {isLoading ? (
                /* Full loading skeleton */
                <div className="max-w-5xl mx-auto space-y-8">
                  {/* Tabs skeleton */}
                  <div className="flex justify-center">
                    <div className="flex gap-2 p-1 bg-muted rounded-xl">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-24 rounded-lg" />
                      ))}
                    </div>
                  </div>
                  
                  {/* Content skeleton */}
                  <div className="space-y-6">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <StorySkeleton key={i} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : !results || totalResults === 0 ? (
                /* Empty State - Enhanced */
                <div className="max-w-2xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center">
                    {/* Illustration */}
                    <div className="relative inline-block mb-8">
                      <div className="w-32 h-32 mx-auto relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-fuchsia-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-fuchsia-900/30 rounded-3xl rotate-6" />
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-900/20 dark:via-fuchsia-900/20 dark:to-pink-900/20 rounded-3xl -rotate-3" />
                        <div className="relative w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-3xl flex items-center justify-center shadow-xl">
                          <div className="text-center">
                            <Search className="w-12 h-12 text-purple-400 mx-auto mb-1" />
                            <span className="text-3xl block">🔍</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Decorative elements */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full animate-bounce flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs">✨</span>
                      </div>
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full animate-bounce flex items-center justify-center shadow-lg" style={{ animationDelay: '0.5s' }}>
                        <span className="text-white text-xs">💫</span>
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Nenhum resultado encontrado
                    </h2>
                    
                    <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                      Não encontramos nada para &ldquo;<span className="font-medium text-foreground">{query}</span>&rdquo;. 
                      Tente buscar com termos diferentes ou explore nossas sugestões abaixo.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                      <Button 
                        variant="outline" 
                        className="gap-2 px-6 h-12 rounded-xl border-2 hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-700 dark:hover:bg-purple-950/30"
                        onClick={() => { setQuery(''); setResults(null); }}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        Nova Busca
                      </Button>
                      <Link href="/genres">
                        <Button variant="outline" className="gap-2 px-6 h-12 rounded-xl border-2 hover:border-fuchsia-300 hover:bg-fuchsia-50 dark:hover:border-fuchsia-700 dark:hover:bg-fuchsia-950/30">
                          <Tags className="w-4 h-4" />
                          Explorar Gêneros
                        </Button>
                      </Link>
                      <Link href="/themes">
                        <Button variant="outline" className="gap-2 px-6 h-12 rounded-xl border-2 hover:border-pink-300 hover:bg-pink-50 dark:hover:border-pink-700 dark:hover:bg-pink-950/30">
                          <Heart className="w-4 h-4" />
                          Explorar Temas
                        </Button>
                      </Link>
                    </div>

                    {/* Popular suggestions */}
                    <div className="bg-muted/50 rounded-2xl p-6 border border-border/50">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold">Buscas Populares</h3>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {POPULAR_SEARCHES.map((item) => (
                          <Link
                            key={item.term}
                            href={`/search?q=${encodeURIComponent(item.term)}`}
                            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border/50 hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-700 dark:hover:bg-purple-950/30 transition-all duration-200 hover:shadow-md"
                          >
                            <span>{item.emoji}</span>
                            <span className="text-sm font-medium">{item.term}</span>
                            <Badge variant="secondary" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.count}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Results with enhanced tabs */
                <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Sort and view options bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <TabsList className="bg-muted/80 p-1 rounded-xl h-auto">
                      <TabsTrigger value="stories" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2.5">
                        <BookOpen className="w-4 h-4" />
                        Histórias
                        {getCountByType("stories") > 0 && (
                          <Badge variant="secondary" className="ml-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                            {getCountByType("stories")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="genres" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2.5">
                        <LayoutGrid className="w-4 h-4" />
                        Gêneros
                        {getCountByType("genres") > 0 && (
                          <Badge variant="secondary" className="ml-1 text-xs bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300">
                            {getCountByType("genres")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="themes" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2.5">
                        <Tags className="w-4 h-4" />
                        Temas
                        {getCountByType("themes") > 0 && (
                          <Badge variant="secondary" className="ml-1 text-xs bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
                            {getCountByType("themes")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="authors" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2.5">
                        <Users className="w-4 h-4" />
                        Autores
                        {getCountByType("authors") > 0 && (
                          <Badge variant="secondary" className="ml-1 text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                            {getCountByType("authors")}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    {/* Sort dropdown */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px] rounded-xl border-border/50">
                        <SlidersHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevância</SelectItem>
                        <SelectItem value="recentes">Mais Recentes</SelectItem>
                        <SelectItem value="populares">Mais Populares</SelectItem>
                        <SelectItem value="avaliados">Melhor Avaliados</SelectItem>
                        <SelectItem value="titulo">Título A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    {/* Stories Tab */}
                    <TabsContent value="stories">
                      <div className="space-y-6">
                        {/* Section header */}
                        <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Histórias</h3>
                            <p className="text-sm text-muted-foreground">
                              {getCountByType("stories")} {getCountByType("stories") === 1 ? "história encontrada" : "histórias encontradas"}
                            </p>
                          </div>
                        </div>

                        <TabContentWithLoading isLoading={false} skeletonType="story">
                          {results.results.stories?.length > 0 ? (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.results.stories.slice(0, visibleCount.stories).map((story, index) => (
                                  <div
                                    key={story.id}
                                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                  >
                                    <StoryCard story={{
                                      ...story,
                                      themes: [],
                                      publishedAt: new Date(),
                                    }} />
                                  </div>
                                ))}
                              </div>
                              
                              {/* Load More Button */}
                              {hasMoreResults("stories") && (
                                <div className="flex justify-center pt-6">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleLoadMore("stories")}
                                    disabled={isLoadMoreLoading}
                                    className="gap-2 px-8 h-12 rounded-xl border-2 hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-700 dark:hover:bg-purple-950/30 transition-all"
                                  >
                                    {isLoadMoreLoading ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Carregando...
                                      </>
                                    ) : (
                                      <>
                                        Carregar Mais
                                        <ChevronDown className="w-4 h-4" />
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}

                              {/* End of results indicator */}
                              {!hasMoreResults("stories") && visibleCount.stories < getCountByType("stories") && (
                                <p className="text-center text-sm text-muted-foreground pt-4">
                                  Todos os resultados foram exibidos
                                </p>
                              )}
                            </>
                          ) : (
                            <EmptyStateForTab 
                              icon={<BookOpen className="w-12 h-12" />}
                              title="Nenhuma história encontrada"
                              description="Tente buscar por outros termos ou explore nossas categorias."
                            />
                          )}
                        </TabContentWithLoading>
                      </div>
                    </TabsContent>

                    {/* Genres Tab */}
                    <TabsContent value="genres">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/25">
                            <LayoutGrid className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Gêneros</h3>
                            <p className="text-sm text-muted-foreground">
                              {getCountByType("genres")} {getCountByType("genres") === 1 ? "gênero encontrado" : "gêneros encontrados"}
                            </p>
                          </div>
                        </div>

                        <TabContentWithLoading isLoading={false} skeletonType="genre" count={6}>
                          {results.results.genres?.length > 0 ? (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.results.genres.slice(0, visibleCount.genres).map((genre, index) => (
                                  <Link 
                                    key={genre.id} 
                                    href={`/genres/${genre.slug}`}
                                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                  >
                                    <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-border/50 group h-full">
                                      <CardContent className="p-5">
                                        <div className="flex items-start gap-3">
                                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-100 to-pink-100 dark:from-fuchsia-900/30 dark:to-pink-900/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                            🎨
                                          </div>
                                          <div className="min-w-0">
                                            <h4 className="font-semibold text-fuchsia-700 dark:text-fuchsia-400 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-300 truncate">
                                              {genre.name}
                                            </h4>
                                            {genre.description && (
                                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {genre.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        {genre.storyCount !== undefined && (
                                          <div className="mt-3 pt-3 border-t border-border/30">
                                            <Badge variant="secondary" className="bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 border-0">
                                              📚 {genre.storyCount} {genre.storyCount === 1 ? "história" : "histórias"}
                                            </Badge>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </Link>
                                ))}
                              </div>

                              {hasMoreResults("genres") && (
                                <div className="flex justify-center pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleLoadMore("genres")}
                                    disabled={isLoadMoreLoading}
                                    className="gap-2 px-8 h-11 rounded-xl border-2 border-fuchsia-200 hover:border-fuchsia-400 hover:bg-fuchsia-50 dark:border-fuchsia-800 dark:hover:border-fuchsia-700 dark:hover:bg-fuchsia-950/30 transition-all"
                                  >
                                    {isLoadMoreLoading ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Carregando...
                                      </>
                                    ) : (
                                      <>
                                        Ver Mais Gêneros
                                        <ArrowRight className="w-4 h-4" />
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </>
                          ) : (
                            <EmptyStateForTab 
                              icon={<LayoutGrid className="w-12 h-12" />}
                              title="Nenhum gênero encontrado"
                              description="Explore todos os gêneros disponíveis."
                              actionHref="/genres"
                              actionLabel="Ver Todos os Gêneros"
                            />
                          )}
                        </TabContentWithLoading>
                      </div>
                    </TabsContent>

                    {/* Themes Tab */}
                    <TabsContent value="themes">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
                            <Tags className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Temas</h3>
                            <p className="text-sm text-muted-foreground">
                              {getCountByType("themes")} {getCountByType("themes") === 1 ? "tema encontrado" : "temas encontrados"}
                            </p>
                          </div>
                        </div>

                        <TabContentWithLoading isLoading={false} skeletonType="theme" count={10}>
                          {results.results.themes?.length > 0 ? (
                            <>
                              <div className="flex flex-wrap gap-3">
                                {results.results.themes.slice(0, visibleCount.themes).map((theme, index) => (
                                  <Link
                                    key={theme.id}
                                    href={`/themes/${theme.slug}`}
                                    className="animate-in fade-in zoom-in duration-200"
                                    style={{ animationDelay: `${index * 30}ms` }}
                                  >
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        "px-4 py-2.5 text-sm font-medium cursor-pointer transition-all duration-200",
                                        "bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 hover:from-pink-200 hover:to-rose-200",
                                        "dark:from-pink-900/30 dark:to-rose-900/30 dark:text-pink-400 dark:hover:from-pink-900/40 dark:hover:to-rose-900/40",
                                        "border border-pink-200/50 hover:border-pink-400 dark:border-pink-800/50 dark:hover:border-pink-700",
                                        "hover:shadow-md hover:shadow-pink-500/10 hover:scale-105"
                                      )}
                                    >
                                      <span className="mr-1.5">#</span>
                                      {theme.name}
                                      {theme.storyCount !== undefined && (
                                        <span className="ml-2 opacity-70 text-xs bg-pink-200/50 dark:bg-pink-800/50 px-1.5 py-0.5 rounded-full">
                                          {theme.storyCount}
                                        </span>
                                      )}
                                    </Badge>
                                  </Link>
                                ))}
                              </div>

                              {hasMoreResults("themes") && (
                                <div className="flex justify-center pt-6">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleLoadMore("themes")}
                                    disabled={isLoadMoreLoading}
                                    className="gap-2 px-8 h-11 rounded-xl border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 dark:border-pink-800 dark:hover:border-pink-700 dark:hover:bg-pink-950/30 transition-all"
                                  >
                                    {isLoadMoreLoading ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Carregando...
                                      </>
                                    ) : (
                                      <>
                                        Ver Mais Temas
                                        <ChevronDown className="w-4 h-4" />
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </>
                          ) : (
                            <EmptyStateForTab 
                              icon={<Tags className="w-12 h-12" />}
                              title="Nenhum tema encontrado"
                              description="Explore os temas mais populares da comunidade."
                              actionHref="/themes"
                              actionLabel="Ver Todos os Temas"
                            />
                          )}
                        </TabContentWithLoading>
                      </div>
                    </TabsContent>

                    {/* Authors Tab */}
                    <TabsContent value="authors">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Autores</h3>
                            <p className="text-sm text-muted-foreground">
                              {getCountByType("authors")} {getCountByType("authors") === 1 ? "autor encontrado" : "autores encontrados"}
                            </p>
                          </div>
                        </div>

                        <TabContentWithLoading isLoading={false} skeletonType="author" count={6}>
                          {results.results.authors?.length > 0 ? (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.results.authors.slice(0, visibleCount.authors).map((author, index) => (
                                  <Link
                                    key={author.id}
                                    href={`/authors/${author.slug}`}
                                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                  >
                                    <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-border/50 group">
                                      <CardContent className="p-5">
                                        <div className="flex items-center gap-4">
                                          <div className={cn(
                                            "w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center",
                                            "bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500",
                                            "shadow-lg shadow-purple-500/25",
                                            "group-hover:scale-110 transition-transform duration-300"
                                          )}>
                                            <span className="text-white font-bold text-xl">
                                              {author.name.charAt(0)}
                                            </span>
                                          </div>
                                          <div className="min-w-0">
                                            <h4 className="font-semibold truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                              {author.name}
                                            </h4>
                                            {author.bio && (
                                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {author.bio}
                                              </p>
                                            )}
                                            {author.storyCount !== undefined && (
                                              <p className="text-xs text-violet-500 dark:text-violet-400 mt-2 font-medium">
                                                ✍️ {author.storyCount} {author.storyCount === 1 ? "história" : "histórias"}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </Link>
                                ))}
                              </div>

                              {hasMoreResults("authors") && (
                                <div className="flex justify-center pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleLoadMore("authors")}
                                    disabled={isLoadMoreLoading}
                                    className="gap-2 px-8 h-11 rounded-xl border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:hover:border-violet-700 dark:hover:bg-violet-950/30 transition-all"
                                  >
                                    {isLoadMoreLoading ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Carregando...
                                      </>
                                    ) : (
                                      <>
                                        Ver Mais Autores
                                        <ArrowRight className="w-4 h-4" />
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </>
                          ) : (
                            <EmptyStateForTab 
                              icon={<Users className="w-12 h-12" />}
                              title="Nenhum autor encontrado"
                              description="Conheça nossos autores mais populares."
                              actionHref="/authors"
                              actionLabel="Ver Todos os Autores"
                            />
                          )}
                        </TabContentWithLoading>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Popular searches section when no query */}
        {!query && !isLoading && (
          <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                {/* Section header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-800/50">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Em Alta</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                    Buscas Populares
                  </h2>
                  
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Descubra o que a comunidade está buscando agora mesmo
                  </p>
                </div>

                {/* Popular search terms */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                  {POPULAR_SEARCHES.map((item, index) => (
                    <Link
                      key={item.term}
                      href={`/search?q=${encodeURIComponent(item.term)}`}
                      className={cn(
                        "group inline-flex items-center gap-2.5 pl-2 pr-4 py-2.5 rounded-full transition-all duration-300",
                        "bg-background border-2 border-border/50 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10",
                        "dark:hover:border-purple-700 dark:hover:shadow-purple-500/5",
                        "hover:-translate-y-0.5",
                        index < 3 && "ring-2 ring-purple-200/50 dark:ring-purple-800/50"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="font-medium">{item.term}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                      {index < 3 && (
                        <Badge className="text-[10px] h-4 px-1 bg-gradient-to-r from-orange-400 to-pink-400 text-white border-0">
                          HOT
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Trending topics section */}
                <div className="bg-background rounded-3xl p-8 border-2 border-border/50 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Tópicos em Destaque</h3>
                      <p className="text-sm text-muted-foreground">Temas que estão conquistando leitores</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {TRENDING_TOPICS.map((topic, index) => (
                      <Link
                        key={topic}
                        href={`/search?q=${encodeURIComponent(topic)}`}
                        className="group flex items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-200 dark:hover:border-purple-800 border border-transparent transition-all duration-200"
                      >
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate transition-colors">
                          {topic}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Reusable empty state component for tabs
function EmptyStateForTab({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">{description}</p>
      
      {actionHref && actionLabel && (
        <Link href={actionHref}>
          <Button variant="outline" className="gap-2 rounded-xl">
            {actionLabel}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64 mx-auto" />
                <Skeleton className="h-96 w-full max-w-3xl mx-auto" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <SearchPageInner />
    </Suspense>
  );
}
