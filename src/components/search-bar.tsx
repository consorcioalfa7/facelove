"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
}

export function SearchBar({
  placeholder = "Search stories, genres, themes...",
  size = "default",
  showSuggestions = true,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

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
      return;
    }

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
    } else {
      setSuggestions([]);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
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

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
  };

  const sizeClasses = {
    sm: "h-9 text-sm",
    default: "h-11",
    lg: "h-14 text-lg px-6",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    default: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            className={cn(
              "absolute left-3 text-muted-foreground pointer-events-none",
              iconSizes[size]
            )}
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className={cn(
              "pl-10 pr-10 rounded-xl border-2 transition-all duration-200",
              "focus:border-purple-500 focus:ring-purple-500/20",
              "placeholder:text-muted-foreground/70",
              sizeClasses[size],
              isFocused &&
                "border-purple-500 shadow-lg shadow-purple-500/10"
            )}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-60 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && isFocused && (query.length >= 2 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 p-6">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              <span className="text-sm text-muted-foreground">Buscando...</span>
            </div>
          )}

          {/* No results */}
          {!isLoading && query.length >= 2 && suggestions.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No results found for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {/* Suggestions list */}
          {!isLoading && suggestions.length > 0 && (
            <>
              <ul className="py-2">
                {suggestions.map((suggestion) => (
                  <li key={`${suggestion.type}-${suggestion.id}`}>
                    <button
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                    >
                      <span
                        className={cn(
                          "text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded-full",
                          suggestion.type === "story" &&
                            "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                          suggestion.type === "genre" &&
                            "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
                          suggestion.type === "theme" &&
                            "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
                          suggestion.type === "author" &&
                            "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                        )}
                      >
                        {suggestion.type}
                      </span>
                      <span className="flex-1 truncate">{suggestion.title}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>

              {/* View all results link */}
              <div className="border-t p-2">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="block w-full text-center py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={() => setIsFocused(false)}
                >
                  View all results for &ldquo;{query}&rdquo;
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
