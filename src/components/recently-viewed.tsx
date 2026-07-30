"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  X,
  Trash2,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  getRecentlyViewed,
  clearRecentlyViewed,
  removeRecentlyViewed,
} from "@/lib/recently-viewed";

interface RecentlyViewedItem {
  id: string;
  title: string;
  slug: string;
  viewedAt: string;
}

interface RecentlyViewedPanelProps {
  className?: string;
  maxItems?: number;
}

export function RecentlyViewedPanel({
  className,
  maxItems = 5,
}: RecentlyViewedPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Initialize state lazily to avoid setState in effect
  const [items, setItems] = useState<RecentlyViewedItem[]>(() => {
    if (typeof window === "undefined") return [];
    return getRecentlyViewed().slice(0, maxItems);
  });

  // Load recently viewed items - using callback pattern for event listener
  const loadItems = useCallback(() => {
    const items = getRecentlyViewed();
    setItems(items.slice(0, maxItems));
  }, [maxItems]);

  // Listen for external changes only (not initial load)
  useEffect(() => {
    const handleChanged = () => loadItems();
    window.addEventListener("recentlyViewedChanged", handleChanged);
    return () => window.removeEventListener("recentlyViewedChanged", handleChanged);
  }, [loadItems]);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeRecentlyViewed(id);
  };

  const handleClearAll = () => {
    clearRecentlyViewed();
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
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
  };

  // Don't render if no items
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-card border shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-500" />
          <h3 className="font-semibold text-sm">Lidos Recentemente</h3>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearAll}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            title="Limpar tudo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="h-7 w-7 text-muted-foreground"
          >
            <X
              className={cn(
                "w-4 h-4 transition-transform",
                !isOpen && "rotate-180"
              )}
            />
          </Button>
        </div>
      </div>

      {/* Items list */}
      {isOpen && (
        <ScrollArea className={cn("max-h-[300px]", maxItems > 5 && "max-h-[400px]")}>
          <div className="p-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/story/${item.id}`}
                className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors relative"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                  <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <span>{formatTimeAgo(item.viewedAt)}</span>
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleRemove(item.id, e)}
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 shrink-0 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>

                <ChevronRight className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
              </Link>
            ))}
            
            {/* View all link */}
            {items.length >= maxItems && (
              <Link
                href="/history"
                className="flex items-center justify-center gap-1 py-2.5 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:bg-muted/50 rounded-lg transition-colors mt-1"
              >
                Ver histórico completo
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// Compact version for sidebar/inline use
export function RecentlyViewedList({ maxItems = 3 }: { maxItems?: number }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    const load = () => setItems(getRecentlyViewed().slice(0, maxItems));
    load();
    
    const handleChanged = () => load();
    window.addEventListener("recentlyViewedChanged", handleChanged);
    return () => window.removeEventListener("recentlyViewedChanged", handleChanged);
  }, [maxItems]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
        Lidos Recentemente
      </p>
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/story/${item.id}`}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-500 shrink-0" />
          <span className="text-sm truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {item.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
