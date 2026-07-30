import Link from "next/link";
import { Star, Eye, Calendar, User, BookOpen, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeBadge } from "./theme-badge";
import { FavoriteButton } from "./favorite-button";
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
  /** Optional thumbnail image URL for horizontal/ranking variants */
  imageUrl?: string | null;
  /** Optional ranking position (1-10) for ranking variants */
  rank?: number;
}

interface StoryCardProps {
  story: StoryCardData;
  variant?: "default" | "compact" | "featured" | "horizontal" | "ranking";
  className?: string;
  showFavorite?: boolean;
}

/** Pink/Purple gradient text class for rankings */
const gradientTextClass = 
  "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent";

/** Glow shadow effect for hover states */
const glowShadowClass = 
  "hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] hover:shadow-purple-500/20";

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
          className={cn(starSize, "fill-pink-400 text-pink-400")}
        />
      ))}
      {/* Half star */}
      {hasHalfStar && (
        <div className="relative">
          <Star className={cn(starSize, "text-pink-400/30")} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={cn(starSize, "fill-pink-400 text-pink-400")} />
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

/** Genre badge with purple/pink gradient background */
function GenreBadge({ name }: { name: string }) {
  return (
    <Badge
      variant="secondary"
      className="bg-gradient-to-r from-purple-500/15 to-pink-500/15 text-purple-300 border border-purple-500/20 hover:from-purple-500/25 hover:to-pink-500/25 transition-all duration-300"
    >
      {name}
    </Badge>
  );
}

/** Ranking badge overlaid on image */
function RankingBadge({ rank }: { rank: number }) {
  const getRankColors = (r: number) => {
    switch (r) {
      case 1:
        return "from-yellow-400 to-amber-500 text-yellow-900";
      case 2:
        return "from-gray-300 to-gray-400 text-gray-700";
      case 3:
        return "from-amber-600 to-orange-700 text-amber-100";
      default:
        return "from-purple-500 to-fuchsia-600 text-white";
    }
  };

  return (
    <div className={cn(
      "absolute top-2 left-2 z-10 w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center font-bold text-sm shadow-lg",
      getRankColors(rank)
    )}>
      #{rank}
    </div>
  );
}

export function StoryCard({
  story,
  variant = "default",
  className,
  showFavorite = true,
}: StoryCardProps) {
  // ==========================================
  // HORIZONTAL VARIANT - For "Mais lidas da semana"
  // ==========================================
  if (variant === "horizontal") {
    return (
      <Link href={`/story/${story.id}`}>
        <Card
          className={cn(
            "group cursor-pointer overflow-hidden transition-all duration-300",
            "bg-card/80 backdrop-blur-sm border-border/50",
            glowShadowClass,
            "hover:scale-[1.02]",
            className
          )}
        >
          <CardContent className="p-0 flex h-[120px]">
            {/* Thumbnail Image (16:9 aspect ratio) */}
            <div className="relative w-[180px] flex-shrink-0 overflow-hidden">
              {story.imageUrl ? (
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600/40 via-fuchsia-600/30 to-pink-600/40 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-white/50" />
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Ranking Badge */}
              {story.rank && story.rank <= 10 && (
                <RankingBadge rank={story.rank} />
              )}

              {/* Favorite Button */}
              {showFavorite && (
                <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FavoriteButton 
                    storyId={story.id} 
                    size="sm"
                    className="bg-black/40 backdrop-blur-sm hover:bg-black/60 border-white/20"
                  />
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
              <div className="min-w-0">
                {/* Title */}
                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-pink-400 transition-colors duration-300 mb-1.5">
                  {story.title}
                </h3>

                {/* Badges Row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <GenreBadge name={story.genre.name} />
                  {story.themes.length > 0 && (
                    <ThemeBadge theme={story.themes[0]} size="sm" />
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <StarRating rating={story.rating} />
                  <span className="text-xs font-medium text-pink-400 ml-0.5">
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

  // ==========================================
  // RANKING VARIANT - Prominent ranking display
  // ==========================================
  if (variant === "ranking") {
    const rank = story.rank || 1;
    
    return (
      <Link href={`/story/${story.id}`}>
        <Card
          className={cn(
            "group cursor-pointer overflow-hidden transition-all duration-300",
            "bg-card/80 backdrop-blur-sm border-border/50",
            glowShadowClass,
            "hover:scale-[1.02]",
            className
          )}
        >
          <CardContent className="p-4 flex items-center gap-4">
            {/* Large Ranking Number */}
            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-colors duration-300 relative">
              <span className={cn("text-3xl font-bold", gradientTextClass)}>
                #{rank}
              </span>
              {/* Decorative glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 blur-md" />
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
              {/* Title & Author */}
              <h3 className="font-semibold line-clamp-1 group-hover:text-pink-400 transition-colors duration-300">
                {story.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                por <span className="text-purple-400">{story.author.name}</span>
              </p>

              {/* Badges Row */}
              <div className="flex items-center gap-2 mt-2">
                <GenreBadge name={story.genre.name} />
                {story.themes.slice(0, 2).map((theme) => (
                  <ThemeBadge key={theme.id} theme={theme} size="sm" />
                ))}
              </div>
            </div>

            {/* Stats Column */}
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 justify-end">
                <StarRating rating={story.rating} />
                <span className="text-sm font-semibold text-pink-400 ml-1">
                  {story.rating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1 justify-end mt-1.5 text-sm text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                <span>{formatNumber(story.readsCount)} leituras</span>
              </div>
            </div>

            {/* Favorite Button */}
            {showFavorite && (
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <FavoriteButton storyId={story.id} size="sm" />
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }

  // ==========================================
  // COMPACT VARIANT
  // ==========================================
  if (variant === "compact") {
    return (
      <Link href={`/story/${story.id}`}>
        <Card
          className={cn(
            "cursor-pointer group p-4 relative transition-all duration-300",
            "bg-card/80 backdrop-blur-sm border-border/50",
            glowShadowClass,
            "hover:scale-[1.01]",
            className
          )}
        >
          {/* Favorite Button - Top Right */}
          {showFavorite && (
            <div className="absolute top-2 right-2 z-10">
              <FavoriteButton storyId={story.id} size="sm" />
            </div>
          )}
          
          <CardContent className="p-0 flex items-start gap-4">
            {/* Genre icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-colors duration-300">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-pink-400 transition-colors duration-300">
                {story.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {story.author.name}
                </span>
                <span>•</span>
                <GenreBadge name={story.genre.name} />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <StarRating rating={story.rating} />
                  <span className="text-xs text-pink-400 ml-1 font-medium">
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

  // ==========================================
  // FEATURED VARIANT
  // ==========================================
  if (variant === "featured") {
    return (
      <Link href={`/story/${story.id}`}>
        <Card
          className={cn(
            "cursor-pointer group overflow-hidden relative transition-all duration-300",
            "bg-card/80 backdrop-blur-sm border-border/50",
            glowShadowClass,
            "hover:scale-[1.01]",
            className
          )}
        >
          {/* Favorite Button - Top Right (overlapping gradient header) */}
          {showFavorite && (
            <div className="absolute top-3 right-3 z-10">
              <FavoriteButton 
                storyId={story.id} 
                size="md"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
              />
            </div>
          )}
          
          {/* Gradient header */}
          <div className="h-32 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600 relative overflow-hidden">
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

            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={story.rating} size="md" />
                  <span className="text-sm font-medium text-pink-400">{story.rating.toFixed(1)}</span>
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
              <span className="font-medium text-purple-400 hover:text-pink-400 transition-colors duration-300">
                {story.author.name}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // ==========================================
  // DEFAULT VARIANT
  // ==========================================
  return (
    <Link href={`/story/${story.id}`}>
      <Card
        className={cn(
          "cursor-pointer group h-full relative transition-all duration-300",
          "bg-card/80 backdrop-blur-sm border-border/50",
          glowShadowClass,
          "hover:scale-[1.01]",
          className
        )}
      >
        {/* Favorite Button - Top Right */}
        {showFavorite && (
          <div className="absolute top-3 right-3 z-10">
            <FavoriteButton storyId={story.id} size="sm" />
          </div>
        )}
        
        <CardContent className="pt-6 pb-6 flex flex-col h-full">
          {/* Header with genre badge and title */}
          <div className="mb-3">
            <GenreBadge name={story.genre.name} className="mb-2" />
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-pink-400 transition-colors duration-300">
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
          <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <StarRating rating={story.rating} />
                <span className="text-sm font-medium text-pink-400 ml-1">
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
