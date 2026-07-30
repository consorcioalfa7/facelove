"use client";

import Link from "next/link";
import {
  BookOpen,
  Heart,
  Wand2,
  Users,
  Globe,
  Crown,
  Ghost,
  Flame,
  Sparkles,
  Swords,
  Rocket,
  BookMarked,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface GenreCardData {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  storyCount: number;
}

interface GenreCardProps {
  genre: GenreCardData;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

// Icon mapping for genres - using string identifiers
const genreIconMap: Record<string, string> = {
  romance: "heart",
  fantasy: "wand2",
  "sci-fi": "rocket",
  mystery: "ghost",
  thriller: "flame",
  horror: "ghost",
  drama: "crown",
  comedy: "sparkles",
  adventure: "swords",
  fiction: "bookopen",
  "true-story": "globe",
  "adult-fiction": "flame",
  erotica: "flame",
  literary: "bookmarked",
  historical: "crown",
  action: "swords",
  "young-adult": "users",
};

// Gradient combinations for genres - FaceLove Purple/Pink theme
const genreGradients: Record<string, string> = {
  default: "from-purple-500 to-fuchsia-600",
  romance: "from-pink-400 to-rose-600",
  fantasy: "from-violet-400 to-purple-600",
  "sci-fi": "from-cyan-400 to-blue-600",
  mystery: "from-slate-500 to-gray-700",
  thriller: "from-red-500 to-rose-700",
  horror: "from-gray-800 to-black",
  drama: "from-purple-600 to-violet-700",
  comedy: "from-yellow-400 to-amber-500",
  adventure: "from-emerald-500 to-green-600",
  fiction: "from-indigo-400 to-purple-600",
  "true-story": "from-teal-500 to-cyan-600",
  "adult-fiction": "from-rose-500 to-red-600",
  erotica: "from-pink-500 to-fuchsia-600",
  literary: "from-stone-500 to-neutral-700",
  historical: "from-amber-700 to-yellow-900",
  action: "from-orange-500 to-red-600",
  "young-adult": "from-green-400 to-emerald-600",
};

function getGenreGradient(slug: string): string {
  return genreGradients[slug] || genreGradients.default;
}

function getGenreIconName(slug: string): string {
  return genreIconMap[slug] || "bookopen";
}

// Icon component that renders based on name
function GenreIcon({ name, className }: { name: string; className?: string }) {
  const props = { className };
  
  switch (name) {
    case "heart":
      return <Heart {...props} />;
    case "wand2":
      return <Wand2 {...props} />;
    case "users":
      return <Users {...props} />;
    case "globe":
      return <Globe {...props} />;
    case "crown":
      return <Crown {...props} />;
    case "ghost":
      return <Ghost {...props} />;
    case "flame":
      return <Flame {...props} />;
    case "sparkles":
      return <Sparkles {...props} />;
    case "swords":
      return <Swords {...props} />;
    case "rocket":
      return <Rocket {...props} />;
    case "bookmarked":
      return <BookMarked {...props} />;
    case "bookopen":
    default:
      return <BookOpen {...props} />;
  }
}

export function GenreCard({
  genre,
  variant = "default",
  className,
}: GenreCardProps) {
  const iconName = getGenreIconName(genre.slug);
  const gradient = getGenreGradient(genre.slug);

  if (variant === "compact") {
    return (
      <Link href={`/genres/${genre.slug}`}>
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 group cursor-pointer",
            className
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br text-white shadow-md group-hover:shadow-lg transition-shadow",
              gradient
            )}
          >
            <GenreIcon name={iconName} className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {genre.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {genre.storyCount.toLocaleString()} stories
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/genres/${genre.slug}`} className="block group">
        <Card
          className={cn(
            "card-hover overflow-hidden h-full border-0",
            className
          )}
        >
          {/* Full gradient header */}
          <div
            className={cn(
              "h-40 bg-gradient-to-br relative overflow-hidden flex items-center justify-center",
              gradient
            )}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }} />
            </div>
            
            {/* Icon */}
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <GenreIcon name={iconName} className="w-8 h-8 text-white" />
            </div>

            {/* Story count badge */}
            <Badge
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm border-0 text-white hover:bg-white/30"
            >
              {genre.storyCount.toLocaleString()} stories
            </Badge>
          </div>

          <CardContent className="pt-4 pb-6">
            <h3 className="font-bold text-lg mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {genre.name}
            </h3>
            {genre.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {genre.description}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/genres/${genre.slug}`} className="block group">
      <Card
        className={cn(
          "card-hover h-full overflow-hidden",
          className
        )}
      >
        <CardContent className="pt-6 pb-6 flex flex-col h-full">
          {/* Icon and header */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg shadow-black/10 group-hover:scale-105 transition-transform duration-200 shrink-0",
                gradient
              )}
            >
              <GenreIcon name={iconName} className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {genre.name}
              </h3>
              <Badge
                variant="secondary"
                className="mt-1.5 text-xs font-normal"
              >
                {genre.storyCount.toLocaleString()}{" "}
                {genre.storyCount === 1 ? "story" : "stories"}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {genre.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-grow">
              {genre.description}
            </p>
          )}

          {/* Hover indicator */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
            <span>Explore stories</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
