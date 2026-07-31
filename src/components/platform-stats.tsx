import { BookOpen, Users, Eye, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================
   PLATFORM STATS COMPONENT
   Displays platform-wide statistics in a 
   visually appealing card layout
   ============================================ */

export interface PlatformStatsProps {
  /** Statistics data */
  stats?: {
    totalStories: number;
    totalAuthors: number;
    totalReaders?: number; // fallback to stories * 50
    totalCountries?: number; // default 80
  };
  /** Display format */
  format?: "compact" | "full";
  /** Additional class names */
  className?: string;
}

// Default statistics values
const DEFAULT_STATS = {
  totalStories: 50000,
  totalAuthors: 12000,
  totalReaders: 500000,
  totalCountries: 80,
};

// Stat configuration with icons and labels
const STAT_CONFIG = [
  {
    key: "totalStories" as const,
    icon: BookOpen,
    label: "Histórias publicadas",
    colorClass: "text-pink-500",
    bgClass: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
  },
  {
    key: "totalAuthors" as const,
    icon: Users,
    label: "Autores ativos",
    colorClass: "text-purple-500",
    bgClass: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    key: "totalReaders" as const,
    icon: Eye,
    label: "Leitores mensais",
    colorClass: "text-fuchsia-500",
    bgClass: "bg-fuchsia-500/10",
    borderColor: "border-fuchsia-500/20",
  },
  {
    key: "totalCountries" as const,
    icon: Globe,
    label: "Países alcançados",
    colorClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
  },
];

/**
 * Format number to compact display (e.g., 50000 → "50K+")
 */
function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M+`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K+`;
  }
  return `${num}+`;
}

/**
 * Format number for full display (e.g., 50000 → "50,000+")
 */
function formatFullNumber(num: number): string {
  return num.toLocaleString("pt-BR") + "+";
}

/**
 * PlatformStats - Server Component displaying platform statistics
 * 
 * @example
 * ```tsx
 * <PlatformStats 
 *   stats={{ totalStories: 50000, totalAuthors: 12000 }}
 *   format="compact"
 * />
 * ```
 */
export function PlatformStats({
  stats: propStats,
  format = "compact",
  className,
}: PlatformStatsProps) {
  // Merge provided stats with defaults
  const stats = {
    ...DEFAULT_STATS,
    ...propStats,
    totalReaders: propStats?.totalReaders ?? (propStats?.totalStories ?? DEFAULT_STATS.totalStories) * 50,
    totalCountries: propStats?.totalCountries ?? DEFAULT_STATS.totalCountries,
  };

  // Choose formatter based on format prop
  const formatter = format === "compact" ? formatCompactNumber : formatFullNumber;

  return (
    <div
      className={cn(
        // Base styling with FaceLove design tokens
        "rounded-xl p-6 md:p-8",
        // Background using surface-elevated token
        "[background:var(--fl-surface-elevated)]",
        // Border using FaceLove border token
        "border [border-color:var(--fl-border-subtle)]",
        // Shadow using FaceLove shadow token
        "[box-shadow:var(--fl-shadow-md)]",
        className
      )}
      role="region"
      aria-label="Estatísticas da Plataforma"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {STAT_CONFIG.map((config, index) => {
          const Icon = config.icon;
          const value = stats[config.key];
          const formattedValue = formatter(value);

          return (
            <div
              key={config.key}
              className={cn(
                "relative flex flex-col items-center text-center p-4 rounded-lg",
                "transition-all duration-300 ease-out",
                "hover:[background:var(--fl-surface-overlay)]",
                "group",
                // Add right border except for last item on desktop
                "lg:border-r [border-color:var(--fl-border-subtle)]",
                index === STAT_CONFIG.length - 1 && "lg:border-r-0",
                // Add bottom border for second row items on mobile
                "md:border-b-0 border-b [border-color:var(--fl-border-subtle)]",
                index >= 2 && "md:border-b-0 border-b-0"
              )}
            >
              {/* Icon container */}
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full mb-3",
                  "transition-transform duration-300 group-hover:scale-110",
                  config.bgClass
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6",
                    config.colorClass
                  )}
                  aria-hidden="true"
                />
              </div>

              {/* Stat value */}
              <span
                className={cn(
                  "text-3xl md:text-4xl font-bold tracking-tight mb-1",
                  // Use primary text color from FL tokens
                  "[color:var(--fl-text-primary)]"
                )}
              >
                {formattedValue}
              </span>

              {/* Stat label */}
              <span
                className={cn(
                  "text-sm font-medium",
                  // Use muted text color from FL tokens
                  "[color:var(--fl-text-muted)]"
                )}
              >
                {config.label}
              </span>

              {/* Decorative glow effect on hover */}
              <div
                className={cn(
                  "absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300",
                  "group-hover:opacity-100 pointer-events-none",
                  config.bgClass,
                  "blur-xl -z-10"
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Optional: Subtle gradient line at bottom */}
      <div
        className="mt-6 h-px w-full opacity-50"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--fl-primary), var(--fl-secondary), transparent)",
        }}
      />
    </div>
  );
}
