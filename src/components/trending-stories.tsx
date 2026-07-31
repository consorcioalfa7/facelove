"use client";

import Link from "next/link";
import { ArrowRight, Star, Eye, User, Trophy, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeBadge } from "./theme-badge";
import { cn } from "@/lib/utils";

/* ============================================
   TRENDING STORIES DATA TYPES
   ============================================ */

export interface TrendingStoryData {
  id: string;
  slug?: string;
  title: string;
  author: {
    name: string;
    slug: string;
  };
  genre: {
    name: string;
    slug: string;
  };
  themes?: Array<{
    name: string;
    slug: string;
  }>;
  rating: number;
  readsCount: number;
  imageUrl?: string;
}

export interface TrendingStoriesProps {
  stories?: TrendingStoryData[];
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

/* ============================================
   RANKING BADGE COMPONENT
   Gradient background for top rankings
   ============================================ */

function RankingBadge({ rank }: { rank: number }) {
  // Gradient colors for top 3 positions
  const gradients = [
    "from-amber-400 via-yellow-500 to-amber-600", // #1 - Gold
    "from-slate-300 via-gray-400 to-slate-500",    // #2 - Silver
    "from-amber-600 via-orange-600 to-amber-700",  // #3 - Bronze
  ];

  // For ranks beyond 3, use a subtle purple gradient
  const defaultGradient = "from-purple-500 to-fuchsia-600";

  const gradient = rank <= 3 ? gradients[rank - 1] : defaultGradient;

  return (
    <div
      className={cn(
        "absolute top-3 left-3 z-10",
        "w-8 h-8 rounded-lg flex items-center justify-center",
        "bg-gradient-to-br shadow-lg",
        gradient,
        "text-white font-bold text-sm"
      )}
    >
      <Trophy className="w-4 h-4 mr-0.5" />
      {rank}
    </div>
  );
}

/* ============================================
   STAR RATING COMPONENT
   Pink stars for FaceLove theme
   ============================================ */

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-3.5 h-3.5 fill-pink-500 text-pink-500"
        />
      ))}
      {/* Half star */}
      {hasHalfStar && (
        <div className="relative">
          <Star className="w-3.5 h-3.5 text-pink-500/30" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
          </div>
        </div>
      )}
      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="w-3.5 h-3.5 text-muted-foreground/30"
        />
      ))}
    </div>
  );
}

/* ============================================
   STORY IMAGE / PLACEHOLDER
   16:9 aspect ratio with rounded corners
   ============================================ */

function StoryImage({
  imageUrl,
  title,
}: {
  imageUrl?: string;
  title: string;
}) {
  // Gradient options for placeholder backgrounds
  const gradients = [
    "from-purple-600 via-fuchsia-600 to-pink-600",
    "from-violet-600 via-purple-600 to-fuchsia-600",
    "from-fuchsia-600 via-pink-600 to-rose-600",
    "from-indigo-600 via-violet-600 to-purple-600",
    "from-pink-600 via-rose-600 to-red-600",
  ];

  // Generate consistent gradient based on title
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradient = gradients[hash % gradients.length];

  if (imageUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[var(--fl-surface-elevated)]">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay at bottom for better text readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    );
  }

  // Placeholder with gradient and icon
  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-lg",
        "bg-gradient-to-br flex items-center justify-center",
        gradient
      )}
    >
      <BookOpen className="w-10 h-10 text-white/40" />
      {/* Decorative elements */}
      <div className="absolute top-3 right-3 w-16 h-16 rounded-full bg-white/10 blur-xl" />
      <div className="absolute bottom-3 left-3 w-12 h-12 rounded-full bg-black/20 blur-lg" />
    </div>
  );
}

/* ============================================
   TRENDING STORY CARD
   Individual card for each trending story
   ============================================ */

interface TrendingCardProps {
  story: TrendingStoryData;
  rank: number;
}

function TrendingCard({ story, rank }: TrendingCardProps) {
  return (
    <Link
      href={`/story/${story.id}`}
      className="group block flex-shrink-0 w-[280px] sm:w-full"
    >
      <article
        className={cn(
          "relative h-full overflow-hidden rounded-xl",
          "bg-[var(--fl-surface-elevated)]",
          "border border-[var(--fl-border)]",
          "shadow-[var(--fl-shadow-md)]",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-1.5",
          "hover:border-[var(--fl-border-hover)]",
          "hover:shadow-[var(--fl-shadow-lg)]"
        )}
      >
        {/* Ranking Badge */}
        <RankingBadge rank={rank} />

        {/* Story Image/Thumbnail */}
        <div className="p-3 pb-0">
          <StoryImage imageUrl={story.imageUrl} title={story.title} />
        </div>

        {/* Card Content */}
        <div className="p-4 pt-3">
          {/* Title */}
          <h3
            className={cn(
              "font-bold text-base leading-tight line-clamp-2 mb-2",
              "text-[var(--fl-text-primary)]",
              "group-hover:text-[var(--fl-primary)]",
              "transition-colors duration-200"
            )}
          >
            {story.title}
          </h3>

          {/* Author */}
          <span
            className="inline-flex items-center gap-1.5 text-sm text-[var(--fl-text-muted)] hover:text-[var(--fl-secondary)] transition-colors mb-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/authors/${story.author.slug}`;
            }}
          >
            <User className="w-3.5 h-3.5" />
            <span>{story.author.name}</span>
          </span>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/20"
            >
              {story.genre.name}
            </Badge>
            {story.themes?.slice(0, 1).map((theme, idx) => (
              <ThemeBadge
                key={idx}
                theme={{ id: `${story.id}-${idx}`, ...theme }}
                size="sm"
                variant="outline"
                clickable={false}
              />
            ))}
            {story.themes && story.themes.length > 1 && (
              <span className="text-xs text-[var(--fl-text-muted)]">
                +{story.themes.length - 1}
              </span>
            )}
          </div>

          {/* Stats Footer */}
          <div
            className={cn(
              "flex items-center justify-between pt-3",
              "border-t border-[var(--fl-border-subtle)]"
            )}
          >
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <StarRating rating={story.rating} />
              <span className="text-sm font-semibold text-[var(--fl-text-primary)] ml-1">
                {story.rating.toFixed(1)}
              </span>
            </div>

            {/* Read Count */}
            <div className="flex items-center gap-1 text-xs text-[var(--fl-text-muted)]">
              <Eye className="w-3.5 h-3.5" />
              <span>{formatReadCount(story.readsCount)} leituras</span>
            </div>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div
          className="
            absolute inset-0 opacity-0 group-hover:opacity-100
            transition-opacity duration-500 pointer-events-none
            rounded-xl
          "
          style={{
            background:
              "linear-gradient(135deg, var(--fl-glow), var(--fl-glow-purple))",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />
      </article>
    </Link>
  );
}

/* ============================================
   EMPTY STATE COMPONENT
   Displayed when no stories are available
   ============================================ */

function EmptyState() {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4",
        "rounded-xl border border-dashed border-[var(--fl-border-subtle)]",
        "bg-[var(--fl-surface)]"
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full mb-4",
          "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
          "flex items-center justify-center"
        )}
      >
        <Trophy className="w-7 h-7 text-[var(--fl-text-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--fl-text-primary)] mb-2">
        Nenhuma história em destaque
      </h3>
      <p className="text-sm text-[var(--fl-text-muted)] text-center max-w-xs">
        As histórias mais lidas da semana aparecerão aqui.
      </p>
    </div>
  );
}

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

function formatReadCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/* ============================================
   MAIN TRENDING STORIES SECTION
   ============================================ */

export function TrendingStories({
  stories = [],
  limit = 5,
  showHeader = true,
  className,
}: TrendingStoriesProps) {
  // Limit the number of stories displayed
  const displayStories = stories.slice(0, limit);

  return (
    <section className={cn("w-full py-10 md:py-14 lg:py-16", className)}>
      {/* Section Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl",
                "bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500",
                "flex items-center justify-center",
                "shadow-lg shadow-amber-500/25"
              )}
            >
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--fl-text-primary)]">
                Histórias em alta
              </h2>
              <p className="text-sm text-[var(--fl-text-muted)] mt-0.5">
                O que a comunidade está lendo agora
              </p>
            </div>
          </div>

          <Link
            href="/stories?sort=trending"
            className={cn(
              "group hidden sm:flex items-center gap-1.5",
              "text-sm font-medium",
              "text-[var(--fl-primary)] hover:text-[var(--fl-primary-hover)]",
              "transition-colors duration-200"
            )}
          >
            Ver todas
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {/* Stories Container */}
      {displayStories.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Mobile: Horizontal Scrollable */}
          <div
            className={cn(
              "flex gap-4 md:hidden overflow-x-auto",
              "snap-x snap-mandatory pb-4",
              "-mx-4 px-4",
              "scrollbar-hide"
            )}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {displayStories.map((story, index) => (
              <div key={story.id} className="snap-start">
                <TrendingCard story={story} rank={index + 1} />
              </div>
            ))}
          </div>

          {/* Desktop: Responsive Grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {displayStories.map((story, index) => (
              <TrendingCard key={story.id} story={story} rank={index + 1} />
            ))}
          </div>

          {/* Mobile "Ver todos" link below scroll */}
          <div className="mt-6 md:hidden text-center">
            <Link
              href="/stories?sort=trending"
              className={cn(
                "inline-flex items-center gap-1.5",
                "text-sm font-medium",
                "text-[var(--fl-primary)] hover:text-[var(--fl-primary-hover)]",
                "transition-colors duration-200"
              )}
            >
              Ver ranking completo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

export default TrendingStories;
