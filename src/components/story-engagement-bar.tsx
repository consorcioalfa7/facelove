"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Bookmark,
  Eye,
  Clock,
  TrendingUp,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/favorite-button";
import { ShareButton } from "@/components/share-button";
import { cn } from "@/lib/utils";
import { addRecentlyViewed } from "@/lib/recently-viewed";

interface StoryEngagementBarProps {
  /** Story ID */
  storyId: string;
  /** Story title */
  title: string;
  /** Story slug */
  slug: string;
  /** Read count */
  readCount: number;
  /** Reading time in minutes */
  readingTime?: number;
  /** Rating */
  rating?: number;
  /** Optional class names */
  className?: string;
  /** Compact variant for mobile */
  compact?: boolean;
}

export function StoryEngagementBar({
  storyId,
  title,
  slug,
  readCount,
  readingTime,
  rating,
  className,
  compact = false,
}: StoryEngagementBarProps) {
  const [isSaved, setIsSaved] = useState(() => {
    // Check localStorage for saved state using lazy initializer
    if (typeof window === "undefined") return false;
    try {
      const savedStories = JSON.parse(
        localStorage.getItem("facelove-saved-stories") || "[]"
      );
      return savedStories.includes(storyId);
    } catch {
      return false;
    }
  });

  // Track recently viewed when component mounts
  useEffect(() => {
    if (storyId && title) {
      addRecentlyViewed(storyId, title, slug);
    }
  }, [storyId, title, slug]);

  const handleSave = () => {
    try {
      let savedStories = JSON.parse(
        localStorage.getItem("facelove-saved-stories") || "[]"
      );

      if (isSaved) {
        savedStories = savedStories.filter((id: string) => id !== storyId);
      } else {
        savedStories.push(storyId);
      }

      localStorage.setItem("facelove-saved-stories", JSON.stringify(savedStories));
      setIsSaved(!isSaved);
    } catch {
      // Ignore errors
    }
  };

  // Format number helper
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2 py-3 px-4 bg-muted/30 rounded-xl border",
          className
        )}
      >
        {/* Stats */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {formatNumber(readCount)}
          </span>
          {readingTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {readingTime}min
            </span>
          )}
          {rating && (
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <FavoriteButton storyId={storyId} size="sm" />
          <ShareButton url="" title={title} size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        {/* Left side - Stats */}
        <div className="flex items-center gap-6">
          {/* Read count */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Leituras</p>
              <p className="font-semibold text-foreground">
                {formatNumber(readCount)}
              </p>
            </div>
          </div>

          {/* Reading time */}
          {readingTime && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20">
                <Clock className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tempo de leitura</p>
                <p className="font-semibold text-foreground">{readingTime} min</p>
              </div>
            </div>
          )}

          {/* Rating */}
          {rating !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="p-2 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-900/20">
                <TrendingUp className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avaliação</p>
                <p className="font-semibold text-foreground">{rating.toFixed(1)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            onClick={handleSave}
            className={cn(
              "gap-2",
              isSaved &&
                "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            )}
          >
            <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
            {isSaved ? "Salvo" : "Salvar"}
          </Button>

          <FavoriteButton storyId={storyId} size="md" />

          <ShareButton url="" title={title} size="md" />
        </div>
      </div>
    </div>
  );
}
