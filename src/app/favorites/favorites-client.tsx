"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StoryCard, StoryCardData } from "@/components/story-card";
import { Button } from "@/components/ui/button";
import {
  getFavorites,
  clearFavorites,
} from "@/lib/favorites";
import {
  Heart,
  BookOpen,
  Trash2,
  RefreshCcw,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Story data shape matching API response
interface StoryApiResponse {
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
    id: string;
    name: string;
    slug: string;
  }>;
  rating: number;
  votesCount: number;
  readsCount: number;
  publishedAt: string | null;
}

export function FavoritesContent() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [stories, setStories] = useState<StoryCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Load favorites and fetch story data
  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Get favorite IDs from localStorage
      const ids = getFavorites();
      setFavoriteIds(ids);
      
      // Update count display in header
      const countElement = document.getElementById("favorites-count");
      if (countElement) {
        countElement.textContent = ids.length.toString();
      }

      if (ids.length === 0) {
        setStories([]);
        setIsLoading(false);
        return;
      }

      // Fetch stories for each favorite ID
      const storyPromises = ids.map(async (id) => {
        try {
          const response = await fetch(`/api/stories/${id}`);
          if (!response.ok) return null;
          
          const json = await response.json();
          if (!json.success || !json.data) return null;
          
          const storyData: StoryApiResponse = json.data;
          
          // Transform to StoryCardData format
          return {
            id: storyData.id,
            slug: storyData.slug,
            title: storyData.title,
            description: storyData.description,
            author: storyData.author,
            genre: storyData.genre,
            themes: storyData.themes || [],
            rating: storyData.rating,
            votesCount: storyData.votesCount,
            readsCount: storyData.readsCount,
            publishedAt: storyData.publishedAt ? new Date(storyData.publishedAt) : null,
          } as StoryCardData;
        } catch {
          return null;
        }
      });

      const results = await Promise.all(storyPromises);
      // Filter out null results (stories not found or errors)
      const validStories = results.filter((s): s is StoryCardData => s !== null);
      
      setStories(validStories);
      
      // If some stories weren't found, update the IDs list
      if (validStories.length !== ids.length) {
        setFavoriteIds(validStories.map((s) => s.id));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and listen for changes
  useEffect(() => {
    loadFavorites();

    // Listen for favorites changes
    const handleFavoritesChanged = () => {
      loadFavorites();
    };
    
    window.addEventListener("favoritesChanged", handleFavoritesChanged);
    return () => window.removeEventListener("favoritesChanged", handleFavoritesChanged);
  }, [loadFavorites]);

  // Handle clear all favorites
  const handleClearAll = async () => {
    setIsClearingAll(true);
    // Small delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 300));
    clearFavorites();
    setStories([]);
    setFavoriteIds([]);
    
    // Update count display
    const countElement = document.getElementById("favorites-count");
    if (countElement) {
      countElement.textContent = "0";
    }
    
    setIsClearingAll(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-xl bg-muted/60 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state - no favorites
  if (stories.length === 0 && favoriteIds.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-lg mx-auto animate-fade-in">
            {/* Empty State Illustration */}
            <div className="relative inline-block mb-8">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900/20 dark:to-purple-900/20 rounded-full blur-3xl scale-150" />
              
              {/* Main circle */}
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-pink-100 via-purple-100 to-fuchsia-100 dark:from-pink-900/30 dark:via-purple-900/30 dark:to-fuchsia-900/30 flex items-center justify-center border border-white/50 shadow-xl">
                <Heart className="w-14 h-14 text-pink-400 dark:text-pink-400" />
                
                {/* Sparkles around heart */}
                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400" />
                <Sparkles className="absolute -bottom-1 -left-3 w-4 h-4 text-purple-400" />
                <Sparkles className="absolute top-4 -left-5 w-3 h-3 text-pink-400" />
              </div>

              {/* Floating hearts */}
              <div className="absolute -top-4 left-8 text-pink-300 dark:text-pink-700 opacity-60 animate-bounce" style={{ animationDelay: "0.1s", animationDuration: "2s" }}>
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div className="absolute top-4 -right-6 text-purple-300 dark:text-purple-700 opacity-60 animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "2.5s" }}>
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div className="absolute -bottom-2 right-10 text-fuchsia-300 dark:text-fuchsia-700 opacity-50 animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "2.2s" }}>
                <Heart className="w-3 h-3 fill-current" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-3 text-foreground">
              Nenhum favorito ainda
            </h2>
            
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Você ainda não salvou nenhuma história como favorita. 
              Explore nossa coleção e clique no coração para salvar suas histórias favoritas!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/stories">
                <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25">
                  <BookOpen className="w-4 h-4" />
                  Explorar Histórias
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              
              <Link href="/genres">
                <Button variant="outline" className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20">
                  Ver por Gênero
                </Button>
              </Link>
            </div>

            {/* Tip box */}
            <div className="mt-10 p-4 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/20">
              <p className="text-sm text-muted-foreground">
                💡 <strong className="text-foreground">Dica:</strong> Ao encontrar uma história que você gosta, 
                clique no botão de coração ❤️ para adicioná-la aqui.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Favorites grid with stories
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Actions bar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{stories.length}</span>{" "}
            {stories.length === 1 ? "história salva" : "histórias salvas"}
          </p>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadFavorites}
              className="gap-2 text-muted-foreground"
            >
              <RefreshCcw className="w-4 h-4" />
              Atualizar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={isClearingAll}
              className="gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
            >
              {isClearingAll ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Limpar Tudo
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stories Grid */}
        {stories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        ) : (
          /* Some favorites exist but stories couldn't be loaded */
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 mb-6">
              <BookOpen className="w-9 h-9 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold mb-3">Histórias não encontradas</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Algumas das suas histórias favoritas não puderam ser carregadas. 
              Elas podem ter sido removidas do sistema.
            </p>
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="gap-2"
            >
              Limpar Favoritos Inválidos
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
