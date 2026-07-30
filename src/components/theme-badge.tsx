import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface ThemeBadgeData {
  id: string;
  name: string;
  slug: string;
}

interface ThemeBadgeProps {
  theme: ThemeBadgeData;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default";
  clickable?: boolean;
  className?: string;
}

// Color palette for themes - warm tones
const themeColors = [
  "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400",
  "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
  "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
  "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
  "bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400",
  "bg-lime-100 text-lime-700 hover:bg-lime-200 dark:bg-lime-900/30 dark:text-lime-400",
  "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400",
  "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
  "bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-400",
  "bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
];

function getThemeColor(slug: string): string {
  // Generate consistent color based on slug
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  return themeColors[Math.abs(hash) % themeColors.length];
}

export function ThemeBadge({
  theme,
  variant = "default",
  size = "sm",
  clickable = true,
  className,
}: ThemeBadgeProps) {
  const colorClass = variant === "default" ? getThemeColor(theme.slug) : "";
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    default: "text-sm px-2.5 py-1",
  };

  const badge = (
    <Badge
      variant={variant}
      className={cn(
        "font-normal transition-all duration-200 cursor-pointer",
        sizeClasses[size],
        colorClass,
        !clickable && "cursor-default pointer-events-none",
        className
      )}
    >
      {theme.name}
    </Badge>
  );

  if (clickable) {
    return (
      <Link href={`/themes/${theme.slug}`} className="inline-flex">
        {badge}
      </Link>
    );
  }

  return badge;
}
