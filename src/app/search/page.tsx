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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function SearchPageInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortBy, setSortBy] = useState("relevance");

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data);
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

  // Count total results
  const getTotalCount = () => {
    if (!results?.results) return 0;
    return (
      (results.results.stories?.length || 0) +
      (results.results.genres?.length || 0) +
      (results.results.themes?.length || 0) +
      (results.results.authors?.length || 0)
    );
  };

  const totalResults = getTotalCount();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Search */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-pink-500/10 border-b">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Buscar{" "}
                <span className="gradient-text">Histórias</span>
              </h1>

              {/* Large search bar */}
              <SearchBar
                size="lg"
                showSuggestions={true}
                placeholder="Buscar histórias, gêneros, temas, autores..."
              />

              {/* Quick stats when there are results */}
              {!isLoading && query && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {totalResults > 0 ? (
                    <>
                      Encontrados{" "}
                      <span className="font-semibold text-foreground">{totalResults}</span> resultados para{" "}
                      <span className="font-medium text-purple-600">&ldquo;{query}&rdquo;</span>
                    </>
                  ) : (
                    <>
                      Nenhum resultado encontrado para{" "}
                      <span className="font-medium">&ldquo;{query}&rdquo;</span>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Results Section */}
        {(query || isLoading) && (
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              {isLoading ? (
                /* Loading skeleton */
                <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-32 bg-muted rounded-xl" />
                  ))}
                </div>
              ) : !results || totalResults === 0 ? (
                /* No results */
                <div className="text-center py-16 animate-fade-in">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-6">
                    <Search className="w-12 h-12 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Nenhum resultado encontrado</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    Tente buscar com termos diferentes ou explore nossas categorias.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/genres">
                      <Button variant="outline" className="gap-2">
                        <LayoutGrid className="w-4 h-4" />
                        Explorar Gêneros
                      </Button>
                    </Link>
                    <Link href="/themes">
                      <Button variant="outline" className="gap-2">
                        <Tags className="w-4 h-4" />
                        Explorar Temas
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Results with tabs */
                <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <TabsList className="bg-muted">
                      <TabsTrigger value="all" className="gap-2">
                        Todos ({totalResults})
                      </TabsTrigger>
                      <TabsTrigger value="stories" className="gap-2">
                        <BookOpen className="w-4 h-4" />
                        Histórias ({results.results.stories?.length || 0})
                      </TabsTrigger>
                      <TabsTrigger value="genres" className="gap-2">
                        <LayoutGrid className="w-4 h-4" />
                        Gêneros ({results.results.genres?.length || 0})
                      </TabsTrigger>
                      <TabsTrigger value="themes" className="gap-2">
                        <Tags className="w-4 h-4" />
                        Temas ({results.results.themes?.length || 0})
                      </TabsTrigger>
                      <TabsTrigger value="authors" className="gap-2">
                        <Users className="w-4 h-4" />
                        Autores ({results.results.authors?.length || 0})
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* All Results Tab */}
                  <TabsContent value="all" className="space-y-8">
                    {/* Stories */}
                    {results.results.stories && results.results.stories.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-purple-500" />
                          Histórias
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {results.results.stories.slice(0, 6).map((story, index) => (
                            <div
                              key={story.id}
                              className="animate-fade-in-up"
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
                      </div>
                    )}

                    {/* Genres */}
                    {results.results.genres && results.results.genres.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <LayoutGrid className="w-5 h-5 text-fuchsia-500" />
                          Gêneros
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {results.results.genres.map((genre) => (
                            <Link key={genre.id} href={`/genres/${genre.slug}`}>
                              <Badge 
                                variant="secondary"
                                className="px-4 py-2 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 cursor-pointer"
                              >
                                {genre.name}
                                {genre.storyCount && (
                                  <span className="ml-2 opacity-70">({genre.storyCount})</span>
                                )}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Themes */}
                    {results.results.themes && results.results.themes.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Tags className="w-5 h-5 text-pink-500" />
                          Temas
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {results.results.themes.map((theme) => (
                            <Link key={theme.id} href={`/themes/${theme.slug}`}>
                              <Badge 
                                variant="secondary"
                                className="px-4 py-2 text-sm bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 cursor-pointer"
                              >
                                {theme.name}
                                {theme.storyCount && (
                                  <span className="ml-2 opacity-70">({theme.storyCount})</span>
                                )}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Authors */}
                    {results.results.authors && results.results.authors.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-violet-500" />
                          Autores
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {results.results.authors.map((author) => (
                            <Link key={author.id} href={`/authors/${author.slug}`}>
                              <Card className="hover:shadow-md transition-all cursor-pointer border-purple-100 dark:border-purple-900/30 hover:border-purple-300">
                                <CardContent className="p-4 flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center">
                                    <span className="text-white font-bold">
                                      {author.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{author.name}</p>
                                    {author.bio && (
                                      <p className="text-xs text-muted-foreground line-clamp-1">
                                        {author.bio}
                                      </p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Stories Tab */}
                  <TabsContent value="stories">
                    {results.results.stories && results.results.stories.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.results.stories.map((story, index) => (
                          <div
                            key={story.id}
                            className="animate-fade-in-up"
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
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma história encontrada.
                      </p>
                    )}
                  </TabsContent>

                  {/* Genres Tab */}
                  <TabsContent value="genres">
                    {results.results.genres && results.results.genres.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {results.results.genres.map((genre) => (
                          <Link key={genre.id} href={`/genres/${genre.slug}`}>
                            <Card className="hover:shadow-md transition-all cursor-pointer border-purple-100 dark:border-purple-900/30 hover:border-purple-300">
                              <CardContent className="p-4">
                                <h4 className="font-semibold text-purple-700 dark:text-purple-400">
                                  {genre.name}
                                </h4>
                                {genre.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {genre.description}
                                  </p>
                                )}
                                {genre.storyCount !== undefined && (
                                  <Badge variant="secondary" className="mt-2 text-xs">
                                    {genre.storyCount} histórias
                                  </Badge>
                                )}
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum gênero encontrado.
                      </p>
                    )}
                  </TabsContent>

                  {/* Themes Tab */}
                  <TabsContent value="themes">
                    {results.results.themes && results.results.themes.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {results.results.themes.map((theme) => (
                          <Link key={theme.id} href={`/themes/${theme.slug}`}>
                            <Badge 
                              variant="secondary"
                              className="px-4 py-2 text-sm bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 cursor-pointer"
                            >
                              {theme.name}
                              {theme.storyCount && (
                                <span className="ml-2 opacity-70">({theme.storyCount})</span>
                              )}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum tema encontrado.
                      </p>
                    )}
                  </TabsContent>

                  {/* Authors Tab */}
                  <TabsContent value="authors">
                    {results.results.authors && results.results.authors.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {results.results.authors.map((author) => (
                          <Link key={author.id} href={`/authors/${author.slug}`}>
                            <Card className="hover:shadow-md transition-all cursor-pointer border-purple-100 dark:border-purple-900/30 hover:border-purple-300">
                              <CardContent className="p-4 flex items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">
                                    {author.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-semibold">{author.name}</h4>
                                  {author.bio && (
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                      {author.bio}
                                    </p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum autor encontrado.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </section>
        )}

        {/* Popular searches section when no query */}
        {!query && !isLoading && (
          <section className="py-12 md:py-16 border-t bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-bold mb-6 text-center">Buscas Populares</h2>
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                {["Romance", "Aventura", "Fantasia", "Ficção Científica", "Mistério", "Drama", "Comédia", "Terror"].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="px-4 py-2 rounded-full bg-background border hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-700 dark:hover:bg-purple-900/20 transition-colors text-sm"
                  >
                    {term}
                  </Link>
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-20 text-center">
          <div className="animate-pulse">Carregando...</div>
        </main>
        <Footer />
      </div>
    }>
      <SearchPageInner />
    </Suspense>
  );
}
