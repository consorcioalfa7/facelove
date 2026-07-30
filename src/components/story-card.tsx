import Link from "next/link";
import { Star, Eye, Calendar, User, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeBadge } from "./theme-badge";
import { cn } from "@/lib/utils";

export interface StoryCardData {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
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
  publishedAt?: Date | null;
}

interface StoryCardProps {
  story: StoryCardData;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div className="flex items-center gap-0.5">
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className={cn(starSize, "fill-amber-400 text-amber-400")}
        />
      ))}
      {/* Half star */}
      {hasHalfStar && (
        <div className="relative">
          <Star className={cn(starSize, "text-amber-400/30")} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={cn(starSize, "fill-amber-400 text-amber-400")} />
          </div>
        </div>
      )}
      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={cn(starSize, "text-muted-foreground/30")}
        />
      ))}
    </div>
  );
}

export function StoryCard({
  story,
  variant = "default",
  className,
}: StoryCardProps) {
  if (variant === "compact") {
    return (
      <Link href={`/stories/${story.slug}`}>
        <Card
          className={cn(
            "card-hover cursor-pointer group p-4",
            className
          )}
        >
          <CardContent className="p-0 flex items-start gap-4">
            {/* Genre icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/10 to-rose-500/10 flex items-center justify-center group-hover:from-amber-500/20 group-hover:to-rose-500/20 transition-colors">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {story.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {story.author.name}
                </span>
                <span>•</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                  {story.genre.name}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <StarRating rating={story.rating} />
                  <span className="text-xs text-muted-foreground ml-1">
                    {story.rating.toFixed(1)}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  {formatNumber(story.readsCount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/stories/${story.slug}`}>
        <Card
          className={cn(
            "card-hover cursor-pointer group overflow-hidden",
            className
          )}
        >
          {/* Gradient header */}
          <div className="h-32 bg-gradient-to-br from-amber-500 via-rose-500 to-emerald-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 left-6 right-6">
              <Badge className="bg-white/20 backdrop-blur-sm border-0 text-white hover:bg-white/30 mb-2">
                {story.genre.name}
              </Badge>
              <h2 className="text-xl font-bold text-white line-clamp-2 drop-shadow-lg">
                {story.title}
              </h2>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
            <div className="absolute bottom-8 left-1/3 w-24 h-12 rounded-full bg-black/10 blur-xl" />
          </div>

          <CardContent className="pt-4 pb-6">
            {story.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {story.description}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-4">
              {story.themes.slice(0, 3).map((theme) => (
                <ThemeBadge key={theme.id} theme={theme} />
              ))}
              {story.themes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{story.themes.length - 3} more
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={story.rating} size="md" />
                  <span className="text-sm font-medium">{story.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({story.votesCount})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatNumber(story.readsCount)}
                </span>
                {story.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(story.publishedAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">by</span>
              <span className="font-medium hover:text-amber-600 transition-colors">
                {story.author.name}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/stories/${story.slug}`}>
      <Card
        className={cn(
          "card-hover cursor-pointer group h-full",
          className
        )}
      >
        <CardContent className="pt-6 pb-6 flex flex-col h-full">
          {/* Header with genre badge and title */}
          <div className="mb-3">
            <Badge
              variant="secondary"
              className="mb-2 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
            >
              {story.genre.name}
            </Badge>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {story.title}
            </h3>
          </div>

          {/* Description */}
          {story.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
              {story.description}
            </p>
          )}

          {/* Themes */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {story.themes.slice(0, 3).map((theme) => (
              <ThemeBadge key={theme.id} theme={theme} />
            ))}
            {story.themes.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{story.themes.length - 3}
              </Badge>
            )}
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-between pt-4 border-t mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <StarRating rating={story.rating} />
                <span className="text-sm font-medium ml-1">
                  {story.rating.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {formatNumber(story.readsCount)}
              </span>
            </div>
          </div>

          {/* Author info */}
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span>{story.author.name}</span>
            {story.publishedAt && (
              <>
                <span>•</span>
                <span>{formatDate(story.publishedAt)}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Helper functions
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}
