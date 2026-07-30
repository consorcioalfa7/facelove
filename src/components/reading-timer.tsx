"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Timer,
  Pause,
  Play,
  RotateCcw,
  Clock,
  BookOpen,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Types
interface ReadingSession {
  startTime: number;
  elapsed: number;
  storyId: string;
}

interface ReadingTimerProps {
  /** Story ID for tracking */
  storyId: string;
  /** Story title */
  storyTitle?: string;
  /** Show compact timer (for inline use) */
  compact?: boolean;
  /** Auto-start when component mounts (default: true) */
  autoStart?: boolean;
  /** Additional class names */
  className?: string;
  /** Callback when session ends */
  onSessionComplete?: (duration: number) => void;
}

// LocalStorage keys
const STORAGE_KEY = "facelove-reading-sessions";
const SETTINGS_KEY = "facelove-timer-settings";

interface TimerSettings {
  showMinutes: boolean;
  soundEnabled: boolean;
  autoPause: boolean; // Auto-pause when tab is not visible
}

const DEFAULT_SETTINGS: TimerSettings = {
  showMinutes: true,
  soundEnabled: true,
  autoPause: false,
};

// Format time helper
function formatTime(seconds: number, showMinutes = true): string {
  if (showMinutes) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  
  // Show only seconds for shorter sessions
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

// Get reading time goal in minutes (can be customized)
function getReadingGoal(): number {
  return 15; // 15 minutes default reading goal
}

// Calculate words per minute estimate
function calculateWPM(timeSeconds: number, estimatedWords?: number): number | null {
  if (!estimatedWords || timeSeconds < 10) return null;
  const minutes = timeSeconds / 60;
  return Math.round(estimatedWords / minutes);
}

// Load today's total reading time
function getTodaysTotal(): number {
  try {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const today = new Date().toDateString();
    const todaysSessions = sessions.filter((s: ReadingSession) =>
      new Date(s.startTime).toDateString() === today
    );
    
    return todaysSessions.reduce(
      (acc: number, s: ReadingSession) => acc + s.elapsed,
      0
    );
  } catch {
    return 0;
  }
}

export function ReadingTimer({
  storyId,
  storyTitle,
  compact = false,
  autoStart = true,
  className,
  onSessionComplete,
}: ReadingTimerProps) {
  const [elapsed, setElapsed] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(() => {
    // Auto-start if enabled
    if (typeof window === "undefined" || !autoStart) return false;
    return true; // Start immediately on mount for auto-start
  });
  const [totalToday, setTotalToday] = useState<number>(() => getTodaysTotal());
  const [settings, setSettings] = useState<TimerSettings>(() => {
    try {
      if (typeof window === "undefined") return DEFAULT_SETTINGS;
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Use defaults
    }
    return DEFAULT_SETTINGS;
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize timer start time when running
  useEffect(() => {
    if (isRunning && startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }
  }, [isRunning]);

  // Listen for visibility change (auto-pause)
  const saveSession = useCallback(
    (duration: number) => {
      try {
        const sessions = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]"
        );
        
        sessions.push({
          startTime: Date.now() - duration * 1000,
          elapsed: duration,
          storyId,
          storyTitle: storyTitle || "Unknown Story",
        });

        // Keep only last 100 sessions
        if (sessions.length > 100) {
          sessions.splice(0, sessions.length - 100);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        setTotalToday(getTodaysTotal());
      } catch {
        // Ignore storage errors
      }
    },
    [storyId, storyTitle]
  );

  // Timer tick function
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Handle visibility change (auto-pause)
  useEffect(() => {
    if (!settings.autoPause) return;

    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        setIsRunning(false);
        saveSession(elapsed);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [settings.autoPause, isRunning, elapsed, saveSession]);

  // Start/pause toggle
  const toggleTimer = () => {
    if (isRunning) {
      // Pausing - save current session
      setIsRunning(false);
      saveSession(elapsed);
      onSessionComplete?.(elapsed);
    } else {
      // Starting
      setIsRunning(true);
      startTimeRef.current = Date.now();
    }
  };

  // Reset timer
  const resetTimer = () => {
    if (isRunning && elapsed > 0) {
      saveSession(elapsed);
    }
    setElapsed(0);
    setIsRunning(false);
  };

  // Goal progress (15 min daily goal)
  const goalProgress = Math.min((totalToday / (getReadingGoal() * 60)) * 100, 100);
  const goalReached = totalToday >= getReadingGoal() * 60;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isRunning ? "secondary" : "ghost"}
              size="sm"
              onClick={toggleTimer}
              className={cn(
                "gap-1.5 font-mono text-xs",
                isRunning && "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
                className
              )}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-purple-700 dark:text-purple-400">
                    {formatTime(elapsed)}
                  </span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{formatTime(elapsed)}</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isRunning ? "Pausar" : "Continuar"} leitura</p>
            {elapsed > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Tempo hoje: {formatTime(totalToday)}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header with gradient */}
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Timer
              className={cn(
                "w-5 h-5",
                isRunning ? "text-purple-500 animate-pulse" : "text-muted-foreground"
              )}
            />
            Timer de Leitura
          </span>
          
          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={resetTimer}
              disabled={elapsed === 0}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant={isRunning ? "secondary" : "default"}
              size="sm"
              onClick={toggleTimer}
              className={cn(
                "gap-1.5",
                isRunning
                  ? ""
                  : "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              )}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Iniciar
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Main Timer Display */}
        <div className="text-center py-4 rounded-lg bg-gradient-to-br from-purple-500/5 to-pink-500/5 border">
          <div
            className={cn(
              "text-4xl font-bold font-mono tracking-wider transition-colors",
              isRunning
                ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500"
                : "text-foreground"
            )}
          >
            {formatTime(elapsed)}
          </div>
          <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
            {isRunning ? (
              <>
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "2s" }} />
                Lendo agora...
              </>
            ) : elapsed > 0 ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pausado
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5" /> Pronto para começar
              </>
            )}
          </p>
        </div>

        {/* Today's Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              Hoje
            </span>
            <span className="font-medium">{formatTime(totalToday)}</span>
          </div>

          {/* Daily Goal Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Award className="w-3.5 h-3.5" />
                Meta diária ({getReadingGoal()}min)
              </span>
              <span className={cn(goalReached ? "text-green-600" : "text-muted-foreground")}>
                {Math.round(goalProgress)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  goalReached
                    ? "bg-gradient-to-r from-green-500 to-emerald-400"
                    : "bg-gradient-to-r from-purple-500 to-pink-400"
                )}
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>

          {/* Goal Reached Badge */}
          {goalReached && (
            <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-sm animate-scale-in-bounce">
              <Award className="w-4 h-4" />
              Meta diária alcançada! 🎉
            </div>
          )}
        </div>

        {/* Quick Info */}
        {storyTitle && (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            Lendo: <span className="font-medium truncate block mt-0.5">{storyTitle}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for accessing reading timer data
export function useReadingTimer() {
  const getTotalToday = (): number => {
    try {
      const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const today = new Date().toDateString();
      const todaysSessions = sessions.filter(
        (s: ReadingSession) => new Date(s.startTime).toDateString() === today
      );
      return todaysSessions.reduce(
        (acc: number, s: ReadingSession) => acc + s.elapsed,
        0
      );
    } catch {
      return 0;
    }
  };

  const getAllSessions = (): ReadingSession[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const getWeeklyTotal = (): number => {
    try {
      const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentSessions = sessions.filter(
        (s: ReadingSession) => s.startTime >= oneWeekAgo
      );
      return recentSessions.reduce(
        (acc: number, s: ReadingSession) => acc + s.elapsed,
        0
      );
    } catch {
      return 0;
    }
  };

  return { getTotalToday, getAllSessions, getWeeklyTotal };
}
