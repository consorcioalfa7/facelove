"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFavorites,
  isFavorite as checkIsFavorite,
  toggleFavorite,
  getFavoritesCount,
} from "@/lib/favorites";

interface FavoriteButtonProps {
  /** Story ID to track */
  storyId: string;
  /** Optional additional class names */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show favorites count badge */
  showCount?: boolean;
  /** Callback when favorite state changes */
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({
  storyId,
  className,
  size = "md",
  showCount = false,
  onToggle,
}: FavoriteButtonProps) {
  // Use lazy initializers to avoid setState in useEffect
  const [isFavorited, setIsFavorited] = useState(() => checkIsFavorite(storyId));
  const [totalCount, setTotalCount] = useState(() => getFavoritesCount());
  const [isAnimating, setIsAnimating] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: {
      button: "w-7 h-7",
      icon: "w-4 h-4",
      badge: "text-[10px] min-w-[16px] h-4 -top-1 -right-1",
    },
    md: {
      button: "w-9 h-9",
      icon: "w-5 h-5",
      badge: "text-xs min-w-[18px] h-5 -top-1.5 -right-1.5",
    },
    lg: {
      button: "w-11 h-11",
      icon: "w-6 h-6",
      badge: "text-sm min-w-[20px] h-6 -top-2 -right-2",
    },
  };

  const config = sizeConfig[size];

  // Note: State is initialized via lazy initializer above.
  // When storyId changes, parent should use React's 'key' prop to force remount,
  // or the favoritesChanged event listener below handles external updates.

  // Listen for favorites changes from other components (setState in callback is allowed)
  const handleFavoritesChanged = useCallback(() => {
    setIsFavorited(checkIsFavorite(storyId));
    setTotalCount(getFavoritesCount());
  }, [storyId]);

  useEffect(() => {
    window.addEventListener("favoritesChanged", handleFavoritesChanged);
    return () => {
      window.removeEventListener("favoritesChanged", handleFavoritesChanged);
    };
  }, [handleFavoritesChanged]);

  // Handle toggle click
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnimating(true);
    const newState = toggleFavorite(storyId);
    setIsFavorited(newState);
    setTotalCount(getFavoritesCount());

    if (onToggle) {
      onToggle(newState);
    }

    // Reset animation after completion
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
        "active:scale-90 hover:scale-105",
        config.button,
        isFavorited
          ? "bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30"
          : "bg-muted/80 hover:bg-muted backdrop-blur-sm",
        className
      )}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorited}
    >
      {/* Heart Icon */}
      <Heart
        className={cn(
          config.icon,
          "transition-all duration-300",
          isAnimating && "animate-bounce",
          isFavorited
            ? "fill-pink-500 text-pink-500 scale-110"
            : "fill-none text-muted-foreground/70 hover:text-pink-400"
        )}
        style={
          isAnimating
            ? {
                animation: `heartPop 0.3s ease-out`,
              }
            : undefined
        }
      />

      {/* Favorites Count Badge */}
      {showCount && totalCount > 0 && (
        <span
          className={cn(
            "absolute flex items-center justify-center font-bold rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg pointer-events-none",
            config.badge
          )}
        >
          {totalCount > 99 ? "99+" : totalCount}
        </span>
      )}

      {/* Ripple effect on favoriting */}
      {isFavorited && isAnimating && (
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400/30 to-purple-400/30 animate-ping" />
      )}
    </button>
  );
}

// Keyframes for custom animation (will be added via CSS)
const FavoriteButtonStyles = () => (
  <style jsx global>{`
    @keyframes heartPop {
      0% {
        transform: scale(1);
      }
      25% {
        transform: scale(1.3);
      }
      50% {
        transform: scale(0.95);
      }
      75% {
        transform: scale(1.15);
      }
      100% {
        transform: scale(1);
      }
    }
  `}</style>
);

// Export styles component for inclusion in layout if needed
export { FavoriteButtonStyles };
