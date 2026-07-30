"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Star,
  Sparkles,
  List,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types
interface StoryPreview {
  id: string;
  title: string;
  slug: string;
  authorName?: string;
  genreName?: string;
  readingTime?: number;
  rating?: number;
}

interface StoryNavigationEnhancedProps {
  /** Current story ID */
  currentStoryId: string;
  /** Current story index in the list */
  currentIndex?: number;
  /** Total stories count */
  totalStories?: number;
  /** Previous story data */
  prevStory?: StoryPreview | null;
  /** Next story data */
  nextStory?: StoryPreview | null;
  /** Related stories to show */
  relatedStories?: StoryPreview[];
  /** Layout variant */
  variant?: "horizontal" | "vertical" | "grid";
  /** Show mini thumbnails */
  showThumbnails?: boolean;
  /** Additional class names */
  className?: string;
}

// Generate initials for avatar
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function StoryNavigationEnhanced({
  currentStoryId,
  currentIndex,
  totalStories = 0,
  prevStory,
  nextStory,
  relatedStories = [],
  variant = "horizontal",
  showThumbnails = true,
  className,
}: StoryNavigationEnhancedProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showRelated, setShowRelated] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Arrow left for previous
      if ((e.key === "ArrowLeft" || e.key === "j") && prevStory) {
        e.preventDefault();
        window.location.href = `/story/${prevStory.id}`;
      }
      
      // Arrow right for next
      if ((e.key === "ArrowRight" || e.key === "k") && nextStory) {
        e.preventDefault();
        window.location.href = `/story/${nextStory.id}`;
      }

      // Escape to toggle related stories
      if (e.key === "Escape" && relatedStories.length > 0) {
        setShowRelated(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevStory, nextStory, relatedStories.length]);

  // No navigation available
  if (!prevStory && !nextStory && relatedStories.length === 0) {
    return null;
  }

  // Horizontal variant - compact prev/next buttons
  if (variant === "horizontal") {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-fuchsia-50/30 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-fuchsia-950/10 border",
          className
        )}
      >
        {/* Previous Story */}
        <Link href={`/story/${prevStory?.id || "#"}`} className="flex-1">
          <Button
            variant="outline"
            disabled={!prevStory}
            className={cn(
              "w-full gap-2 h-auto py-3 group",
              !prevStory && "opacity-40 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
            <div className="text-left min-w-0">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                Anterior
              </p>
              {prevStory ? (
                <p className="font-medium text-sm truncate group-hover:text-purple-600 transition-colors">
                  {prevStory.title}
                </p>
              ) : (
                <p className="text-sm">Início da lista</p>
              )}
            </div>
          </Button>
        </Link>

        {/* Center Info */}
        {totalStories > 0 && currentIndex !== undefined && (
          <div className="hidden md:flex items-center gap-2 px-4 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            <span>
              {currentIndex + 1} de {totalStories}
            </span>
            
            {/* Progress dots */}
            <div className="flex items-center gap-1 ml-2">
              {[...Array(Math.min(7, totalStories))].map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    i === Math.min(currentIndex, 6)
                      ? "bg-purple-500 scale-110"
                      : i < currentIndex
                        ? "bg-purple-300 dark:bg-purple-700"
                        : "bg-muted-foreground/20"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Next Story */}
        <Link href={`/story/${nextStory?.id || "#"}`} className="flex-1">
          <Button
            variant="outline"
            disabled={!nextStory}
            className={cn(
              "w-full gap-2 h-auto py-3 group flex-row-reverse",
              !nextStory && "opacity-40 cursor-not-allowed"
            )}
          >
            <ChevronRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
            <div className="text-right min-w-0">
              <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                Próximo
                <ArrowRight className="w-3 h-3" />
              </p>
              {nextStory ? (
                <p className="font-medium text-sm truncate group-hover:text-pink-600 transition-colors">
                  {nextStory.title}
                </p>
              ) : (
                <p className="text-sm">Fim da lista</p>
              )}
            </div>
          </Button>
        </Link>
      </div>
    );
  }

  // Vertical variant - full cards
  if (variant === "vertical") {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Previous Story Card */}
        {prevStory ? (
          <Link href={`/story/${prevStory.id}`}>
            <Card className="group hover:border-purple-200 dark:hover:border-purple-800 transition-all hover:shadow-md cursor-pointer overflow-hidden">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-colors">
                  <ArrowLeft className="w-6 h-6 text-purple-500 group-hover:-translate-x-1 transition-transform" />
                </div>

                <div className="flex-1 min-w-0">
                  <Badge variant="secondary" className="mb-1 text-xs">
                    História Anterior
                  </Badge>
                  <h4 className="font-semibold truncate group-hover:text-purple-600 transition-colors">
                    {prevStory.title}
                  </h4>
                  
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    {prevStory.authorName && (
                      <span className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[8px] bg-purple-100 dark:bg-purple-900 text-purple-600">
                            {getInitials(prevStory.authorName)}
                          </AvatarFallback>
                        </Avatar>
                        {prevStory.authorName}
                      </span>
                    )}
                    
                    {prevStory.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {prevStory.readingTime}min
                      </span>
                    )}

                    {prevStory.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                        {prevStory.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          /* Empty state */
          <div className="text-center p-4 rounded-xl border border-dashed text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Você está no início</p>
          </div>
        )}

        {/* Next Story Card */}
        {nextStory ? (
          <Link href={`/story/${nextStory.id}`}>
            <Card className="group hover:border-pink-200 dark:hover:border-pink-800 transition-all hover:shadow-md cursor-pointer overflow-hidden">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/10 to-fuchsia-500/10 flex items-center justify-center group-hover:from-pink-500/20 group-hover:to-fuchsia-500/20 transition-colors">
                  <ArrowRight className="w-6 h-6 text-pink-500 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="flex-1 min-w-0">
                  <Badge variant="secondary" className="mb-1 text-xs">
                    Próxima História
                  </Badge>
                  <h4 className="font-semibold truncate group-hover:text-pink-600 transition-colors">
                    {nextStory.title}
                  </h4>
                  
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    {nextStory.authorName && (
                      <span className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[8px] bg-pink-100 dark:bg-pink-900 text-pink-600">
                            {getInitials(nextStory.authorName)}
                          </AvatarFallback>
                        </Avatar>
                        {nextStory.authorName}
                      </span>
                    )}
                    
                    {nextStory.readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {nextStory.readingTime}min
                      </span>
                    )}

                    {nextStory.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                        {nextStory.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          /* Empty state */
          <div className="text-center p-4 rounded-xl border border-dashed text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Você chegou ao fim!</p>
            <Link href="/stories">
              <Button variant="ghost" size="sm" className="mt-2">
                Explorar mais histórias
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Grid variant - shows related stories
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with view toggle */}
      {relatedStories.length > 0 && (
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-purple-500" />
            Histórias Relacionadas
          </h3>
          
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            <Button
              size="icon"
              variant={viewMode === "list" ? "secondary" : "ghost"}
              className="h-7 w-7"
              onClick={() => setViewMode("list")}
            >
              <List className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              className="h-7 w-7"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Related Stories Grid/List */}
      {relatedStories.length > 0 && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
              : "space-y-2"
          }
        >
          {relatedStories.map((story) => (
            <Link key={story.id} href={`/story/${story.id}`}>
              <Card
                className={cn(
                  "group hover:border-purple-200 dark:hover:border-purple-800 transition-all hover:shadow-md cursor-pointer",
                  viewMode === "list" && "hover:bg-muted/30"
                )}
              >
                <CardContent className={cn("p-3", viewMode === "grid" && "p-4")}>
                  <div className="flex items-start gap-3">
                    {/* Thumbnail placeholder */}
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm truncate group-hover:text-purple-600 transition-colors">
                        {story.title}
                      </h4>
                      
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {story.authorName && (
                          <span>{story.authorName}</span>
                        )}
                        
                        {story.genreName && (
                          <>
                            <span>•</span>
                            <span>{story.genreName}</span>
                          </>
                        )}

                        {story.readingTime && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {story.readingTime}min
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Prev/Next at bottom */}
      {(prevStory || nextStory) && (
        <div className="flex items-center justify-between pt-4 border-t gap-4">
          {prevStory ? (
            <Link href={`/story/${prevStory.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
            </Link>
          ) : (
            <div /> // Spacer for centering
          )}

          <span className="text-xs text-muted-foreground hidden sm:inline">
            Use ← → para navegar
          </span>

          {nextStory ? (
            <Link href={`/story/${nextStory.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <div /> // Spacer for centering
          )}
        </div>
      )}
    </div>
  );
}
