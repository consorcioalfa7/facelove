"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Clock, X, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

// Types
interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount?: number;
}

// LocalStorage key
const HISTORY_KEY = "facelove-search-history";
const MAX_HISTORY = 20;

// Popular searches (can be customized or fetched from API)
const POPULAR_SEARCHES = [
  "romance",
  "fantasia",
  "mistério",
  "amor",
  "aventura",
  "drama",
  "comédia",
  "ficção científica",
];

// Get search history
function getSearchHistory(): SearchHistoryItem[] {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

// Add to search history
export function addToSearchHistory(query: string, resultCount?: number): void {
  if (!query.trim()) return;

  try {
    const history = getSearchHistory();
    
    // Remove existing entry for same query
    const filtered = history.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
    
    // Add new entry at the beginning
    filtered.unshift({
      query: query.trim(),
      timestamp: Date.now(),
      resultCount,
    });

    // Limit size
    const limited = filtered.slice(0, MAX_HISTORY);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent("searchHistoryChanged"));
  } catch {
    // Ignore errors
  }
}

// Clear search history
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new CustomEvent("searchHistoryChanged"));
    toast.success("Histórico de busca limpo");
  } catch {
    // Ignore
  }
}

// Remove single item
export function removeFromSearchHistory(query: string): void {
  try {
    const history = getSearchHistory();
    const filtered = history.filter((item) => item.query !== query);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("searchHistoryChanged"));
  } catch {
    // Ignore
  }
}

// Format relative time
function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "agora";
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `há ${Math.floor(seconds / 86400)}d`;
  return new Date(timestamp).toLocaleDateString("pt-BR");
}

interface SearchHistoryProps {
  /** Trigger element (optional - will show button by default) */
  children?: React.ReactNode;
  /** Show popular searches */
  showPopular?: boolean;
  /** Max items to display */
  maxItems?: number;
  /** Additional class names */
  className?: string;
  /** Callback when search is selected */
  onSelect?: (query: string) => void;
  /** Compact mode */
  compact?: boolean;
}

export function SearchHistory({
  children,
  showPopular = true,
  maxItems = 10,
  className,
  onSelect,
  compact = false,
}: SearchHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Use lazy initializer for history
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => getSearchHistory());
  const [filterText, setFilterText] = useState("");

  // Update history from events (only in callbacks)
  useEffect(() => {
    const handleChange = () => setHistory(getSearchHistory());
    window.addEventListener("searchHistoryChanged", handleChange);
    return () => window.removeEventListener("searchHistoryChanged", handleChange);
  }, []);

  // Filtered history based on input
  const filteredHistory = filterText
    ? history.filter((item) =>
        item.query.toLowerCase().includes(filterText.toLowerCase())
      )
    : history.slice(0, maxItems);

  // Handle select
  const handleSelect = useCallback(
    (query: string) => {
      addToSearchHistory(query);
      onSelect?.(query);
      setIsOpen(false);
      setFilterText("");
    },
    [onSelect]
  );

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div onClick={() => setIsOpen(true)} className={className || "cursor-pointer"}>
          {children || (
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              Histórico
            </Button>
          )}
        </div>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Histórico de Busca
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Filter input */}
            <Input
              placeholder="Filtrar buscas..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />

            {/* History list */}
            {filteredHistory.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto space-y-1">
                {filteredHistory.map((item) => (
                  <button
                    key={`${item.query}-${item.timestamp}`}
                    onClick={() => handleSelect(item.query)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate font-medium group-hover:text-purple-600 transition-colors">
                        {item.query}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.resultCount !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {item.resultCount} resultados
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(item.timestamp)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromSearchHistory(item.query);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </button>
                ))}

                {/* Clear all */}
                {history.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSearchHistory();
                    }}
                    className="w-full text-destructive hover:text-destructive text-xs mt-2"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Limpar todo o histórico
                  </Button>
                )}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma busca recente</p>
              </div>
            )}

            {/* Popular searches */}
            {showPopular && (
              <>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-pink-500" />
                    Buscas Populares
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSelect(term)}
                        className="px-3 py-1.5 rounded-full bg-muted hover:bg-purple-100 dark:hover:bg-purple-900/30 text-sm transition-colors hover:text-purple-700 dark:hover:text-purple-300"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Full version with inline display
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-purple-500" />
          Buscas Recentes
          {history.length > 0 && (
            <span className="text-xs text-muted-foreground font-normal">
              ({history.length})
            </span>
          )}
        </h3>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearchHistory}
            className="text-xs text-muted-foreground hover:text-destructive h-7"
          >
            Limpar
          </Button>
        )}
      </div>

      {/* History items */}
      {filteredHistory.length > 0 ? (
        <ul className="space-y-1">
          {filteredHistory.slice(0, maxItems).map((item) => (
            <li key={`${item.query}-${item.timestamp}`}>
              <Link
                href={`/search?q=${encodeURIComponent(item.query)}`}
                onClick={() => addToSearchHistory(item.query)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate text-sm group-hover:text-purple-600 transition-colors">
                    {item.query}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.resultCount !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {item.resultCount}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(item.timestamp)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Nenhuma busca realizada ainda
        </p>
      )}

      {/* Popular searches */}
      {showPopular && (
        <div className="pt-3 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Populares
          </p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SEARCHES.slice(0, 5).map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-2.5 py-1 rounded-full bg-muted/70 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-xs transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for accessing search history
export function useSearchHistory() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setCount(getSearchHistory().length);
    };
    
    updateCount();
    window.addEventListener("searchHistoryChanged", updateCount);
    return () => window.removeEventListener("searchHistoryChanged", updateCount);
  }, []);

  return {
    count,
    history: getSearchHistory(),
    clear: clearSearchHistory,
    add: addToSearchHistory,
    remove: removeFromSearchHistory,
  };
}
