"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Star,
  BookOpen,
  Flame,
  Target,
  Clock,
  Award,
  Zap,
  Heart,
  Bookmark,
  TrendingUp,
  CheckCircle2,
  Lock,
  Crown,
  Gem,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Types
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "reading" | "social" | "exploration" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  maxProgress: number;
  unlockedAt?: number;
  progress: number;
  isSecret: boolean;
}

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, "progress" | "unlockedAt">[] = [
  // Common achievements (easy to get)
  {
    id: "first-read",
    title: "Primeira Leitura",
    description: "Leia sua primeira história",
    icon: "BookOpen",
    category: "reading",
    rarity: "common",
    points: 10,
    maxProgress: 1,
    isSecret: false,
  },
  {
    id: "first-favorite",
    title: "Colecionador",
    description: "Adicione uma história aos favoritos",
    icon: "Heart",
    category: "reading",
    rarity: "common",
    points: 10,
    maxProgress: 1,
    isSecret: false,
  },
  {
    id: "first-bookmark",
    title: "Marcador de Página",
    description: "Salve seu primeiro marcador de página",
    icon: "Bookmark",
    category: "reading",
    rarity: "common",
    points: 10,
    maxProgress: 1,
    isSecret: false,
  },
  {
    id: "explore-genres",
    title: "Explorador de Gêneros",
    description: "Visite a página de todos os gêneros",
    icon: "Layers",
    category: "exploration",
    rarity: "common",
    points: 15,
    maxProgress: 1,
    isSecret: false,
  },
  
  // Rare achievements
  {
    id: "read-5-stories",
    title: "Leitor Iniciante",
    description: "Leia 5 histórias diferentes",
    icon: "BookOpen",
    category: "reading",
    rarity: "rare",
    points: 25,
    maxProgress: 5,
    isSecret: false,
  },
  {
    id: "read-10-stories",
    title: "Leitor Dedicação",
    description: "Leia 10 histórias diferentes",
    icon: "Star",
    category: "reading",
    rarity: "rare",
    points: 50,
    maxProgress: 10,
    isSecret: false,
  },
  {
    id: "search-user",
    title: "Pesquisador",
    description: "Use a função de busca pela primeira vez",
    icon: "Search",
    category: "exploration",
    rarity: "rare",
    points: 20,
    maxProgress: 1,
    isSecret: false,
  },
  {
    id: "share-story",
    title: "Compartilhador",
    description: "Compartilhe uma história com amigos",
    icon: "Share2",
    category: "social",
    rarity: "rare",
    points: 30,
    maxProgress: 1,
    isSecret: false,
  },

  // Epic achievements
  {
    id: "read-25-stories",
    title: "Bibliófilo",
    description: "Leia 25 histórias diferentes",
    icon: "Library",
    category: "reading",
    rarity: "epic",
    points: 100,
    maxProgress: 25,
    isSecret: false,
  },
  {
    id: "50-hours-reading",
    title: "Maratonista de Leitura",
    description: "Acumule 50 horas de tempo de leitura",
    icon: "Clock",
    category: "reading",
    rarity: "epic",
    points: 150,
    maxProgress: 180000, // 50 hours in seconds
    isSecret: false,
  },
  {
    id: "7-day-streak",
    title: "Semana Perfeita",
    description: "Leia durante 7 dias consecutivos",
    icon: "Flame",
    category: "reading",
    rarity: "epic",
    points: 120,
    maxProgress: 7,
    isSecret: false,
  },
  {
    id: "all-genres",
    title: "Explorador Completo",
    description: "Leia histórias de todos os gêneros disponíveis",
    icon: "Grid3X3",
    category: "exploration",
    rarity: "epic",
    points: 200,
    maxProgress: 12, // Number of genres
    isSecret: false,
  },

  // Legendary achievements
  {
    id: "read-100-stories",
    title: "Mestre das Histórias",
    description: "Leia 100 histórias diferentes",
    icon: "Crown",
    category: "reading",
    rarity: "legendary",
    points: 500,
    maxProgress: 100,
    isSecret: false,
  },
  {
    id: "200-hours-reading",
    title: "Leitor Devoto",
    description: "Acumule 200 horas de tempo de leitura",
    icon: "Gem",
    category: "reading",
    rarity: "legendary",
    points: 500,
    maxProgress: 720000, // 200 hours in seconds
    isSecret: false,
  },
  {
    id: "30-day-streak",
    title: "Mês de Leitura",
    description: "Leia durante 30 dias consecutivos",
    icon: "Trophy",
    category: "reading",
    rarity: "legendary",
    points: 750,
    maxProgress: 30,
    isSecret: false,
  },
];

// Secret achievements
const SECRET_ACHIEVEMENTS: Omit<Achievement, "progress" | "unlockedAt">[] = [
  {
    id: "midnight-reader",
    title: "Leitor da Meia-Noite",
    description: " Leia uma história entre meia-noite e 3 da manhã",
    icon: "Moon",
    category: "special",
    rarity: "epic",
    points: 175,
    maxProgress: 1,
    isSecret: true,
  },
  {
    id: "speed-reader",
    title: "Leitor Veloz",
    description: "Complete uma história em menos de 2 minutos",
    icon: "Zap",
    category: "special",
    rarity: "rare",
    points: 40,
    maxProgress: 1,
    isSecret: true,
  },
];

// LocalStorage key
const ACHIEVEMENTS_KEY = "facelove-achievements";
const STATS_KEY = "facelove-achievement-stats";

// Stats tracking
interface AchievementStats {
  storiesRead: Set<string>;
  totalReadTime: number; // in seconds
  genresVisited: Set<string>;
  searchesPerformed: number;
  sharesPerformed: number;
  favoritesCount: number;
  bookmarksCreated: number;
  readDays: Set<string>; // ISO date strings for each day
  midnightReads: number;
  speedReads: number;
}

// Get default stats
function getDefaultStats(): AchievementStats {
  return {
    storiesRead: new Set(),
    totalReadTime: 0,
    genresVisited: new Set(),
    searchesPerformed: 0,
    sharesPerformed: 0,
    favoritesCount: 0,
    bookmarksCreated: 0,
    readDays: new Set(),
    midnightReads: 0,
    speedReads: 0,
  };
}

// Load stats
function loadStats(): AchievementStats {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (!saved) return getDefaultStats();
    
    const parsed = JSON.parse(saved);
    return {
      ...parsed,
      storiesRead: new Set(parsed.storiesRead || []),
      genresVisited: new Set(parsed.genresVisited || []),
      readDays: new Set(parsed.readDays || []),
    };
  } catch {
    return getDefaultStats();
  }
}

// Save stats
function saveStats(stats: AchievementStats): void {
  try {
    const toSave = {
      ...stats,
      storiesRead: Array.from(stats.storiesRead),
      genresVisited: Array.from(stats.genresVisited),
      readDays: Array.from(stats.readDays),
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(toSave));
  } catch {
    // Ignore errors
  }
}

// Track actions
export function trackStoryRead(storyId: string, genreId?: string, timeSeconds?: number): void {
  const stats = loadStats();
  stats.storiesRead.add(storyId);
  if (timeSeconds) stats.totalReadTime += timeSeconds;
  if (genreId) stats.genresVisited.add(genreId);
  stats.readDays.add(new Date().toISOString().split("T")[0]);
  
  // Check for secret achievements
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 3) {
    stats.midnightReads++;
  }
  if (timeSeconds && timeSeconds < 120) {
    stats.speedReads++;
  }
  
  saveStats(stats);
  checkAndUnlockAchievements();
}

export function trackFavorite(): void {
  const stats = loadStats();
  stats.favoritesCount++;
  saveStats(stats);
  checkAndUnlockAchievements();
}

export function trackBookmark(): void {
  const stats = loadStats();
  stats.bookmarksCreated++;
  saveStats(stats);
  checkAndUnlockAchievements();
}

export function trackSearch(): void {
  const stats = loadStats();
  stats.searchesPerformed++;
  saveStats(stats);
  checkAndUnlockAchievements();
}

export function trackShare(): void {
  const stats = loadStats();
  stats.sharesPerformed++;
  saveStats(stats);
  checkAndUnlockAchievements();
}

export function trackGenreVisit(genreId: string): void {
  const stats = loadStats();
  stats.genresVisited.add(genreId);
  saveStats(stats);
  checkAndUnlockAchievements();
}

// Load achievements
function loadAchievements(): Achievement[] {
  try {
    const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!saved) return [];
    
    const parsed: Achievement[] = JSON.parse(saved);
    return parsed.map((a) => ({
      ...a,
      unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

// Save achievements
function saveAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    window.dispatchEvent(new CustomEvent("achievementsChanged"));
  } catch {
    // Ignore
  }
}

// Check and unlock achievements
export function checkAndUnlockAchievements(): Achievement[] {
  const stats = loadStats();
  let achievements = loadAchievements();
  let changed = false;

  const allDefs = [...ACHIEVEMENT_DEFINITIONS, ...SECRET_ACHIEVEMENTS];

  for (const def of allDefs) {
    // Skip if already unlocked
    const existing = achievements.find((a) => a.id === def.id);
    if (existing?.unlockedAt) continue;

    // Check if achievement exists, create if not
    let achievement = existing || {
      ...def,
      progress: 0,
      unlockedAt: undefined,
    };

    // Calculate progress based on type
    switch (def.id) {
      case "first-read":
        achievement.progress = Math.min(stats.storiesRead.size, def.maxProgress);
        break;
      case "first-favorite":
        achievement.progress = Math.min(stats.favoritesCount, def.maxProgress);
        break;
      case "first-bookmark":
        achievement.progress = Math.min(stats.bookmarksCreated, def.maxProgress);
        break;
      case "explore-genres":
        achievement.progress = Math.min(stats.genresVisited.size > 0 ? 1 : 0, def.maxProgress);
        break;
      case "read-5-stories":
      case "read-10-stories":
      case "read-25-stories":
      case "read-100-stories":
        achievement.progress = Math.min(stats.storiesRead.size, def.maxProgress);
        break;
      case "search-user":
        achievement.progress = Math.min(stats.searchesPerformed, def.maxProgress);
        break;
      case "share-story":
        achievement.progress = Math.min(stats.sharesPerformed, def.maxProgress);
        break;
      case "50-hours-reading":
      case "200-hours-reading":
        achievement.progress = Math.min(stats.totalReadTime, def.maxProgress);
        break;
      case "7-day-streak":
      case "30-day-streak": {
        // Calculate streak from readDays
        const days = Array.from(stats.readDays).sort().reverse();
        let streak = 0;
        let currentDate = new Date();
        
        for (const dayStr of days) {
          const dayDate = new Date(dayStr);
          const diffDays = Math.floor(
            (currentDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (diffDays === streak) {
            streak++;
            currentDate = dayDate;
          } else if (diffDays > streak) {
            break;
          }
        }
        
        achievement.progress = Math.min(streak, def.maxProgress);
        break;
      }
      case "all-genres":
        achievement.progress = Math.min(stats.genresVisited.size, def.maxProgress);
        break;
      case "midnight-reader":
        achievement.progress = Math.min(stats.midnightReads, def.maxProgress);
        break;
      case "speed-reader":
        achievement.progress = Math.min(stats.speedReads, def.maxProgress);
        break;
      default:
        achievement.progress = 0;
    }

    // Unlock if complete
    if (
      achievement.progress >= def.maxProgress &&
      !achievement.unlockedAt
    ) {
      achievement.unlockedAt = new Date();
      
      // Dispatch event for toast notification
      window.dispatchEvent(
        new CustomEvent("achievementUnlocked", {
          detail: achievement,
        })
      );
    }

    // Update or add
    if (!existing) {
      achievements.push(achievement as Achievement);
    } else {
      const index = achievements.findIndex((a) => a.id === def.id);
      if (index !== -1) {
        achievements[index] = achievement as Achievement;
      }
    }

    changed = true;
  }

  if (changed) {
    saveAchievements(achievements);
  }

  return achievements;
}

// Get achievement stats summary
export function getAchievementSummary() {
  const achievements = loadAchievements();
  const unlocked = achievements.filter((a) => a.unlockedAt);
  const totalPoints = unlocked.reduce((sum, a) => sum + a.points, 0);
  const byRarity = {
    common: unlocked.filter((a) => a.rarity === "common").length,
    rare: unlocked.filter((a) => a.rarity === "rare").length,
    epic: unlocked.filter((a) => a.rarity === "epic").length,
    legendary: unlocked.filter((a) => a.rarity === "legendary").length,
  };
  
  const totalAvailable = ACHIEVEMENT_DEFINITIONS.length + SECRET_ACHIEVEMENTS.length;

  return {
    total: unlocked.length,
    totalAvailable,
    totalPoints,
    percentage: Math.round((unlocked.length / totalAvailable) * 100),
    byRarity,
    recent: unlocked.sort(
      (a, b) =>
        new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
    ).slice(0, 5),
  };
}

// Icon component
function AchievementIcon({ name, className }: { name: string; className?: string }) {
  const props = { className };

  switch (name) {
    case "Trophy": return <Trophy {...props} />;
    case "Star": return <Star {...props} />;
    case "BookOpen": return <BookOpen {...props} />;
    case "Flame": return <Flame {...props} />;
    case "Target": return <Target {...props} />;
    case "Clock": return <Clock {...props} />;
    case "Award": return <Award {...props} />;
    case "Zap": return <Zap {...props} />;
    case "Heart": return <Heart {...props} />;
    case "Bookmark": return <Bookmark {...props} />;
    case "TrendingUp": return <TrendingUp {...props} />;
    case "CheckCircle2": return <CheckCircle2 {...props} />;
    case "Lock": return <Lock {...props} />;
    case "Crown": return <Crown {...props} />;
    case "Gem": return <Gem {...props} />;
    case "Moon": return <span {...props}>🌙</span>; // Using emoji for moon
    default: return <Award {...props} />;
  }
}

// Rarity colors
const RARITY_CONFIG = {
  common: {
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700",
    gradient: "from-gray-400 to-gray-500",
  },
  rare: {
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
    gradient: "from-green-400 to-emerald-500",
  },
  epic: {
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700",
    gradient: "from-purple-400 to-pink-500",
  },
  legendary: {
    color: "text-orange-500 dark:text-orange-400",
    bg: "bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 dark:from-orange-950/30 via-amber-950/20 dark:to-yellow-950/20 border-orange-300 dark:border-700",
    gradient: "from-orange-400 via-amber-400 to-yellow-400",
  },
};

// Main Achievements Component
interface AchievementsProps {
  /** Show compact version */
  compact?: boolean;
  /** Filter by category */
  categoryFilter?: "all" | "reading" | "social" | "exploration" | "special";
  /** Additional class names */
  className?: string;
}

export function Achievements({
  compact = false,
  categoryFilter = "all",
  className,
}: AchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeCategory, setActiveCategory] = useState(categoryFilter);

  useEffect(() => {
    // Initialize and unlock any pending
    const updated = checkAndUnlockAchievements();
    setAchievements(updated);

    const handleChange = () => {
      setAchievements(loadAchievements());
    };

    window.addEventListener("achievementsChanged", handleChange);
    
    // Listen for unlock events
    const handleUnlock = (e: CustomEvent) => {
      setAchievements(loadAchievements());
    };
    window.addEventListener("achievementUnlocked", handleUnlock as EventListener);

    return () => {
      window.removeEventListener("achievementsChanged", handleChange);
      window.removeEventListener("achievementUnlocked", handleUnlock as EventListener);
    };
  }, []);

  const filtered =
    activeCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === activeCategory);

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;
  const totalCount = ACHIEVEMENT_DEFINITIONS.length + SECRET_ACHIEVEMENTS.length;
  const totalPoints = achievements
    .filter((a) => a.unlockedAt)
    .reduce((sum, a) => sum + a.points, 0);

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Conquistas
              <Badge variant="secondary" className="text-xs">
                {unlockedCount}/{totalCount}
              </Badge>
            </h3>
            <span className="text-xs font-medium text-muted-foreground">
              {totalPoints} pts
            </span>
          </div>

          {/* Mini progress */}
          <Progress
            value={totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}
            className="mt-3 h-2 [&>div]:bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400"
          />

          {/* Recent unlocks */}
          <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto">
            {achievements
              .filter((a) => a.unlockedAt)
              .sort(
                (a, b) =>
                  new Date(b.unlockedAt!).getTime() -
                  new Date(a.unlockedAt!).getTime()
              )
              .slice(0, 5)
              .map((achievement) => {
                const config = RARITY_CONFIG[achievement.rarity];
                return (
                  <TooltipProvider key={achievement.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg hover:bg-muted/80 transition-colors cursor-default",
                            config.bg,
                            "border"
                          )}
                        >
                          <AchievementIcon
                            name={achievement.icon}
                            className={cn("w-5 h-5 shrink-0", config.color)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {achievement.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {achievement.points} pts
                            </p>
                          </div>
                          <CheckCircle2
                            className={cn(
                              "w-4 h-4 shrink-0 text-green-500",
                              config.color
                            )}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-xs">{achievement.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
          </div>

          {unlockedCount === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Complete ações para desbloquear conquistas!
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full view
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Conquistas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Desbloqueie conquistas lendo e explorando
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-500">{totalPoints}</p>
            <p className="text-xs text-muted-foreground">pontos</p>
          </div>
          <Badge
            variant="outline"
            className="border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 px-3 py-1.5"
          >
            <Trophy className="w-4 h-4 mr-1" />
            {unlockedCount}/{totalCount}
          </Badge>
        </div>
      </div>

      {/* Overall progress */}
      <Card className="overflow-hidden">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-sm text-muted-foreground">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </span>
          </div>
          <Progress
            value={totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}
            className="h-3 [&>div]:bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400"
          />
        </CardContent>
      </Card>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Todos", count: totalCount },
          { key: "reading", label: "📖 Leitura", icon: "BookOpen" },
          { key: "social", label: "💬 Social", icon: "Heart" },
          { key: "exploration", label: "🧭 Explorar", icon: "Compass" },
          { key: "special", label: "✨ Especiais", icon: "Star" },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              activeCategory === cat.key
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((achievement) => {
          const config = RARITY_CONFIG[achievement.rarity];
          const isUnlocked = !!achievement.unlockedAt;
          const progressPercent = Math.round(
            (achievement.progress / achievement.maxProgress) * 100
          );

          return (
            <Card
              key={achievement.id}
              className={cn(
                "transition-all duration-300 overflow-hidden group hover:shadow-lg",
                !isUnlocked && "opacity-75",
                isUnlocked &&
                  "ring-2 ring-offset-2 ring-yellow-300/50 dark:ring-yellow-500/30"
              )}
            >
              <CardHeader
                className={cn(
                  "pb-3",
                  config.bg,
                  "border-b"
                )}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "p-2.5 rounded-xl bg-background/50 backdrop-blur-sm",
                      config.gradient.replace("from-", "to-").replace(" ", "-to-") === config.gradient
                        ? ""
                        : `bg-gradient-to-br ${config.gradient}`
                    )
                  }
                  >
                    <AchievementIcon
                      name={achievement.icon}
                      className={cn(
                        "w-6 h-6",
                        isUnlocked ? config.color : "text-muted-foreground"
                      )}
                    />
                  </div>
                  
                  <div className="text-right ml-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        isUnlocked
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : ""
                      )}
                    >
                      {achievement.rarity}
                    </Badge>
                    <p className="text-lg font-bold mt-1">{achievement.points}</p>
                  </div>
                </div>
                
                {!isUnlocked && achievement.isSecret && (
                  <Lock className="w-4 h-4 text-muted-foreground ml-auto mt-1" />
                )}
              </CardHeader>

              <CardContent className="pt-0 pb-4">
                <h3 className="font-semibold text-sm mb-1 truncate">
                  {isUnlocked ? achievement.title : "???"}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {isUnlocked
                    ? achievement.description
                    : "Conquista secreta - continue explorando!"}
                </p>

                {/* Progress bar */}
                {!isUnlocked && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">
                        {progressPercent}%
                      </span>
                    </div>
                    <Progress
                      value={progressPercent}
                      className="h-2 [&>div]:bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>
                )}

                {isUnlocked && (
                  <div className="flex items-center justify-center gap-1.5 mt-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-semibold">
                      Desbloqueada!
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-semibold mb-2">Nenhuma conquista nesta categoria</h3>
          <p className="text-sm text-muted-foreground">
            Explore outras categorias para encontrar conquistas
          </p>
        </div>
      )}
    </div>
  );
}

// Hook for using achievements data
export function useAchievements() {
  const [summary, setSummary] = useState(() => getAchievementSummary());

  useEffect(() => {
    const update = () => setSummary(getAchievementSummary());
    
    update();
    window.addEventListener("achievementsChanged", update);
    return () => window.removeEventListener("achievementsChanged", update);
  }, []);

  return {
    ...summary,
    refresh: () => setSummary(getAchievementSummary()),
    track: {
      storyRead: trackStoryRead,
      favorite: trackFavorite,
      bookmark: trackBookmark,
      search: trackSearch,
      share: trackShare,
      genreVisit: trackGenreVisit,
    },
  };
}
