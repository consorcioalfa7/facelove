"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // Show button when scrolled down 300px
      setIsVisible(scrollTop > 300);
      
      // Check if near bottom (within 200px)
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 200);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
      {/* Scroll to bottom button when at top */}
      {!isAtBottom && isVisible && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          variant="outline"
          className={cn(
            "h-10 w-10 rounded-full shadow-lg transition-all duration-300",
            "bg-background/90 backdrop-blur-sm border-border/50",
            "hover:bg-purple-500 hover:text-white hover:border-purple-500"
          )}
          aria-label="Rolar para baixo"
        >
          <ArrowUp className="h-4 w-4 rotate-180" />
        </Button>
      )}
      
      {/* Back to top button */}
      <Button
        onClick={scrollToTop}
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full shadow-lg transition-all duration-300",
          "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
          "text-white hover:shadow-xl hover:shadow-purple-500/25",
          "group"
        )}
        aria-label="Voltar ao topo"
      >
        <ArrowUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
      </Button>
    </div>
  );
}
