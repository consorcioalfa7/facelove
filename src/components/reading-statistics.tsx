"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  TrendingUp,
  Trophy,
  Flame,
  Target,
  BarChart3,
  RefreshCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  getUserStats,
  getAllReadingProgress,
  clearReadingStats,
  type UserReadingStats,
  type StoryReadingProgress,
} from "@/lib/reading-stats";

interface ReadingStatsProps {
  /** Show the detailed progress list */
  showDetails?: boolean;
  /** Compact variant for sidebars */
  compact?: boolean;
  /** Additional class names */
  className?: string;
}

export function ReadingStatistics({
  showDetails = false,
  compact = false,
  className,
}: ReadingStatsProps) {
  const [stats, setStats] = useState<UserReadingStats | null>(null);
  const [recentStories, setRecentStories] = useState<StoryReadingProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = useCallback(() => {
    setIsLoading(true);
    
    try {
      const userStats = getUserStats();
      setStats(userStats);
      
      if (showDetails || !compact) {
        const recent = getAllReadingProgress().slice(0, 5);
        setRecentStories(recent);
      }
    } catch (error) {
      console.error("[ReadingStats] Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [showDetails, compact]);

  // Initial load and listen for changes
  useEffect(() => {
    loadStats();

    const handleChange = () => loadStats();
    window.addEventListener("readingProgressChanged", handleChange);
    return () => window.removeEventListener("readingProgressChanged", handleChange);
  }, [loadStats]);

  // Loading skeleton
  if (isLoading && !stats) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="h-8 w-40 bg-muted rounded" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state - no reading activity yet
  if (!stats || stats.totalStoriesRead === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="pt-6 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <BookOpen className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            Sem Dados de Leitura
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
            Comece a ler histórias para acompanhar seu progresso aqui!
          </p>
          <Link href="/stories">
            <Button size="sm" variant="outline" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Explorar Histórias
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Compact version for sidebar
  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5" />
          Suas Estatísticas
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.totalStoriesRead}</p>
            <p className="text-[10px] text-muted-foreground">Lidas</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xl font-bold text-pink-600 dark:text-pink-400">{formatTime(stats.totalReadingTime)}</p>
            <p className="text-[10px] text-muted-foreground">Tempo</p>
          </div>
        </div>

        {stats.streakDays > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">{stats.streakDays} dias seguidos</span>
          </div>
        )}
      </div>
    );
  }

  // Full stats card
  return (
    <TooltipProvider>
      <Card className={cn("overflow-hidden", className)}>
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Estatísticas de Leitura
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={loadStats}
              disabled={isLoading}
              className="h-8 w-8"
            >
              <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Main stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{stats.totalStoriesRead}</p>
                  <p className="text-xs text-muted-foreground">Histórias</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total de histórias que você começou a ler</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-pink-500" />
                  <p className="text-2xl font-bold">{formatTime(stats.totalReadingTime)}</p>
                  <p className="text-xs text-muted-foreground">Leitura</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tempo total de leitura</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <Target className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{stats.completedStories.length}</p>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Histórias que você terminou de ler</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "text-center p-3 rounded-xl hover:bg-muted transition-colors",
                  stats.streakDays > 0 
                    ? "bg-orange-50 dark:bg-orange-900/20" 
                    : "bg-muted/50"
                )}>
                  <Flame className={cn(
                    "w-6 h-6 mx-auto mb-2",
                    stats.streakDays > 0 ? "text-orange-500" : "text-muted-foreground"
                  )} />
                  <p className="text-2xl font-bold">{stats.streakDays}</p>
                  <p className="text-xs text-muted-foreground">Sequência</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Dias consecutivos lendo</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Reading goal progress */}
          {stats.totalStoriesRead > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Meta mensal
                </span>
                <span className="font-medium">{Math.min(stats.completedStories.length, 10)}/10</span>
              </div>
              <Progress 
                value={(Math.min(stats.completedStories.length, 10) / 10) * 100} 
                className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500"
              />
            </div>
          )}

          {/* In-progress stories */}
          {showDetails && stats.storiesInProgress.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Em Andamento ({stats.storiesInProgress.length})
              </h4>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {recentStories
                  .filter(s => !s.completed)
                  .slice(0, 5)
                  .map((story) => (
                    <Link
                      key={story.storyId}
                      href={`/story/${story.storyId}`}
                      className="block p-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {story.storyTitle}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Lido pela última vez {formatTimeAgo(story.lastReadAt)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                            {Math.round(story.lastPosition)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Mini progress bar */}
                      <Progress 
                        value={story.lastPosition} 
                        className="h-1 mt-2 [&>div]:bg-gradient-to-r [&>div]:from-purple-400 [&>div]:to-pink-400"
                      />
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Clear stats button */}
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Tem certeza que deseja limpar todas as estatísticas?")) {
                  clearReadingStats();
                }
              }}
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Limpar Estatísticas
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

// Helper functions
function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ""}`;
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
