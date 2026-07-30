"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Loader2, ArrowRight, Command, TrendingUp, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  title: string;
  type: "story" | "genre" | "theme" | "author";
}

interface SearchBarProps {
  placeholder?: string;
  size?: "default" | "lg" | "sm";
  showSuggestions?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
}

// Popular search suggestions for the dropdown
const POPULAR_SEARCHES = [
  { term: "Romance", icon: "💕", trending: true },
  { term: "Fantasia", icon: "🧙‍♀️" },
  { term: "Ficção Científica", icon: "🚀" },
  { term: "Mistério", icon: "🔍" },
  { term: "Drama", icon: "🎭" },
  { term: "Comédia Romântica", icon: "😄", trending: true },
];

const typeConfig = {
  story: {
    label: "História",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    icon: "📖",
  },
  genre: {
    label: "Gênero",
    className: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800",
    icon: "🎨",
  },
  theme: {
    label: "Tema",
    className: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    icon: "🏷️",
  },
  author: {
    label: "Autor",
    className: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800",
    icon: "✍️",
  },
};

export function SearchBar({
  placeholder = "Buscar histórias, gêneros, temas, autores...",
  size = "default",
  showSuggestions = true,
  className,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showPopularSearches, setShowPopularSearches] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      // Show popular searches when query is empty
      setShowPopularSearches(query.length === 0);
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Fetch suggestions when debounced query changes
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowPopularSearches(searchQuery.length === 0);
      return;
    }

    setShowPopularSearches(false);
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showSuggestions && debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else if (debouncedQuery.length === 0) {
      setSuggestions([]);
      setShowPopularSearches(true);
    }
  }, [debouncedQuery, fetchSuggestions, showSuggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut handler (Cmd/Ctrl + K)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
        setShowPopularSearches(query.length === 0);
      }

      // Escape to close dropdown
      if (event.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [query.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    switch (suggestion.type) {
      case "story":
        router.push(`/stories/${suggestion.id}`);
        break;
      case "genre":
        router.push(`/genres/${suggestion.id}`);
        break;
      case "theme":
        router.push(`/themes/${suggestion.id}`);
        break;
      case "author":
        router.push(`/authors/${suggestion.id}`);
        break;
    }
    setIsFocused(false);
    setQuery("");
  };

  const handlePopularSearchClick = (term: string) => {
    setQuery(term);
    onSearch?.(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
    setIsFocused(false);
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const sizeClasses = {
    sm: "h-10 text-sm",
    default: "h-12",
    lg: "h-16 text-lg px-6",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    default: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit}>
        <div 
          className={cn(
            "relative group rounded-2xl transition-all duration-300",
            isFocused && "scale-[1.01]"
          )}
        >
          {/* Gradient background effect on focus */}
          <div className={cn(
            "absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 rounded-2xl opacity-0 blur-xl transition-opacity duration-300",
            isFocused && "opacity-20"
          )} />
          
          {/* Search Icon with animation */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Search 
              className={cn(
                "text-muted-foreground pointer-events-none transition-all duration-300",
                iconSizes[size],
                isFocused && "text-purple-500 scale-110 animate-pulse"
              )} 
            />
          </div>

          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowPopularSearches(query.length === 0);
            }}
            placeholder={placeholder}
            className={cn(
              "pl-12 pr-24 rounded-2xl border-2 transition-all duration-300 relative bg-background/95 backdrop-blur-sm",
              "focus:border-purple-400 focus:ring-4 focus:ring-purple-500/15",
              "placeholder:text-muted-foreground/60",
              sizeClasses[size],
              isFocused && "border-purple-400 shadow-xl shadow-purple-500/10"
            )}
          />

          {/* Right side actions */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
            {/* Keyboard shortcut hint */}
            {!isFocused && !query && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-muted/80 text-muted-foreground text-xs font-medium border mr-1">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            )}
            
            {/* Clear button */}
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="h-8 w-8 rounded-full opacity-70 hover:opacity-100 hover:bg-muted transition-all"
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              size="icon"
              disabled={!query.trim()}
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-300",
                "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
                "text-white shadow-md hover:shadow-lg hover:shadow-purple-500/25",
                "disabled:opacity-30 disabled:shadow-none"
              )}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-popover/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-purple-900/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Popular Searches (when no query or short query) */}
          {showPopularSearches && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-foreground">Buscas Populares</span>
                <Sparkles className="w-3.5 h-3.5 text-pink-400 ml-auto" />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((item) => (
                  <button
                    key={item.term}
                    onClick={() => handlePopularSearchClick(item.term)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                      "bg-muted hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300",
                      "border border-transparent hover:border-purple-200 dark:hover:border-purple-800",
                      item.trending && "ring-1 ring-pink-200 dark:ring-pink-800"
                    )}
                  >
                    <span>{item.icon}</span>
                    <span>{item.term}</span>
                    {item.trending && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-gradient-to-r from-orange-400 to-pink-400 text-white border-0">
                        HOT
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

              {/* Quick links */}
              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Ou explore:</span>
                <div className="flex gap-2">
                  <Link 
                    href="/genres" 
                    onClick={() => setIsFocused(false)}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    Gêneros
                  </Link>
                  <Link 
                    href="/themes" 
                    onClick={() => setIsFocused(false)}
                    className="text-xs text-pink-600 dark:text-pink-400 hover:underline font-medium"
                  >
                    Temas
                  </Link>
                  <Link 
                    href="/authors" 
                    onClick={() => setIsFocused(false)}
                    className="text-xs text-fuchsia-600 dark:text-fuchsia-400 hover:underline font-medium"
                  >
                    Autores
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center gap-3 p-8">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              <span className="text-sm text-muted-foreground">Buscando...</span>
            </div>
          )}

          {/* No results */}
          {!isLoading && !showPopularSearches && query.length >= 2 && suggestions.length === 0 && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Nenhum resultado para &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground/70">Tente com outros termos</p>
            </div>
          )}

          {/* Suggestions list */}
          {!isLoading && !showPopularSearches && suggestions.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-2 border-b border-border/50 bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  Sugestões para &ldquo;<span className="font-medium text-foreground">{query}</span>&rdquo;
                </p>
              </div>
              
              <ul className="py-2 max-h-72 overflow-y-auto">
                {suggestions.map((suggestion, index) => {
                  const config = typeConfig[suggestion.type];
                  return (
                    <li 
                      key={`${suggestion.type}-${suggestion.id}`} 
                      className={cn(
                        "transition-colors",
                        index !== suggestions.length - 1 && "border-b border-border/30"
                      )}
                    >
                      <button
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left group"
                      >
                        <span className="text-lg">{config.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {suggestion.title}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                            config.className
                          )}
                        >
                          {config.label}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* View all results link */}
              <div className="border-t p-3 bg-muted/20">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold",
                    "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl",
                    "hover:from-purple-600 hover:to-pink-600 transition-all duration-200",
                    "shadow-md hover:shadow-lg hover:shadow-purple-500/25"
                  )}
                  onClick={() => setIsFocused(false)}
                >
                  Ver todos os resultados
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
