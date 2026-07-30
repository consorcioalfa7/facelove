"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  RefreshCcw,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StoryCard } from "./story-card";
import type { StoryCardData } from "./story-card";
import { getRecentlyViewed } from "@/lib/recently-viewed";

interface RecommendationProps {
  /** Maximum number of recommendations to show */
  limit?: number;
  /** Show the header section */
  showHeader?: boolean;
  /** Additional class names */
  className?: string;
}

// Fallback recommendations when no history exists
function getTrendingRecommendations(): Omit<StoryCardData, 'id' | 'slug' | 'author' | 'genre' | 'themes' | 'rating' | 'votesCount' | 'readsCount' | 'publishedAt'>[] {
  return [
    { title: "Romance do Coração", description: "Uma história de amor que transcende o tempo..." },
    { title: "Mistérios da Noite", description: "O que se esconde nas sombras?" },
    { title: "Aventuras no Futuro", description: "Viaje através das estrelas..." },
    { title: "Segredos Antigos", description: "Alguns mistérios são melhores deixados no passado." },
  ];
}

export function StoryRecommendations({
  limit = 4,
  showHeader = true,
  className,
}: RecommendationProps) {
  const [recommendations, setRecommendations] = useState<StoryCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState<"history" | "trending">("trending");

  // Fetch recommendations based on reading history
  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Get recently viewed items
      const recentItems = getRecentlyViewed();
      
      if (recentItems.length > 0) {
        setSource("history");
        
        // Get genre IDs from recent stories for personalized recommendations
        const storyIds = recentItems.slice(0, 5).map(item => item.id);
        
        // Fetch similar stories (in production, this would use a recommendation API)
        const params = new URLSearchParams();
        storyIds.forEach(id => params.append("exclude", id));
        params.append("limit", limit.toString());
        
        const response = await fetch(`/api/stories?${params.toString()}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.stories) {
            const stories: StoryCardData[] = data.stories.map((s: Record<string, unknown>) => ({
              id: s.id as string,
              slug: s.slug as string,
              title: s.title as string,
              description: s.description as string | null,
              author: s.author as StoryCardData["author"],
              genre: s.genre as StoryCardData["genre"],
              themes: (s.themes || []).map((t: Record<string, unknown>) => ({
                id: t.id as string,
                name: t.name as string,
                slug: t.slug as string,
              })),
              rating: s.rating as number,
              votesCount: s.votesCount as number,
              readsCount: s.readsCount as number,
              publishedAt: s.publishedAt ? new Date(s.publishedAt as string) : null,
            }));
            
            setRecommendations(stories);
            
            if (stories.length > 0) {
              return;
            }
          }
        }
      }
      
      // Fall back to trending/popular stories
      setSource("trending");
      
      const response = await fetch(`/api/stories?limit=${limit}&sortBy=rating`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.stories) {
          const stories: StoryCardData[] = data.stories.map((s: Record<string, unknown>) => ({
            id: s.id as string,
            slug: s.slug as string,
            title: s.title as string,
            description: s.description as string | null,
            author: s.author as StoryCardData["author"],
            genre: s.genre as StoryCardData["genre"],
            themes: (s.themes || []).map((t: Record<string, unknown>) => ({
              id: t.id as string,
              name: t.name as string,
              slug: t.slug as string,
            })),
            rating: s.rating as number,
            votesCount: s.votesCount as number,
            readsCount: s.readsCount as number,
            publishedAt: s.publishedAt ? new Date(s.publishedAt as string) : null,
          }));
          
          setRecommendations(stories);
        }
      }
    } catch (error) {
      console.error("[Recommendations] Error fetching:", error);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // Initial fetch and listen for changes
  useEffect(() => {
    fetchRecommendations();

    const handleHistoryChange = () => fetchRecommendations();
    window.addEventListener("recentlyViewedChanged", handleHistoryChange);
    
    return () => window.removeEventListener("recentlyViewedChanged", handleHistoryChange);
  }, [fetchRecommendations]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-bold">Recomendados Para Você</h2>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="animate-pulse overflow-hidden h-[280px]" />
          ))}
        </div>
      </div>
    );
  }

  // Don't render if no recommendations
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Recomendados Para Você
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {source === "history"
                  ? "Baseado no seu histórico de leitura"
                  : "Histórias populares que você pode gostar"}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRecommendations}
            disabled={isLoading}
            className="gap-2 text-muted-foreground hover:text-purple-600"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading && "animate-spin"}`} />
            Atualizar
          </Button>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {recommendations.slice(0, limit).map((story, index) => (
          <div
            key={story.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <StoryCard story={story} variant="default" />
          </div>
        ))}
      </div>

      {/* View all link */}
      <div className="mt-8 pt-6 border-t text-center">
        <Link href="/stories?sort=rating">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 group border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
          >
            Explorar Mais Histórias
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Compact horizontal scrollable version for sidebars/inline use
export function RecommendedStoriesCompact({ limit = 3 }: { limit?: number }) {
  const [stories, setStories] = useState<StoryCardData[]>([]);
  
  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/stories?limit=${limit}&sortBy=reads`);
        if (response.ok) {
          const data = await response.json();
          if (data.success?.stories) {
            setStories(data.stories);
          }
        }
      } catch (error) {
        console.error("[RecommendedStories] Error:", error);
      }
    }
    load();
  }, [limit]);

  if (stories.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5" />
        Populares Agora
      </p>
      <div className="space-y-2">
        {stories.slice(0, limit).map((story: StoryCardData) => (
          <Link
            key={story.id}
            href={`/story/${story.id}`}
            className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-10 h-14 rounded-md bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center shrink-0 group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {story.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{story.genre.name}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  {story.readsCount >= 1000 
                    ? `${(story.readsCount / 1000).toFixed(1)}k`
                    : story.readsCount}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Need to import Eye icon
// Eye is now imported at the top of the file

