import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FaceLoveLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showText?: boolean;
  className?: string;
  variant?: "default" | "neon" | "minimal";
}

/**
 * FaceLoveLogo Component
 * 
 * Renders the premium neon-style FaceLove logo with optional text.
 * Uses the new neon logo image that blends harmoniously with dark backgrounds.
 */
export function FaceLoveLogo({ 
  size = "md", 
  showText = false,
  className,
  variant = "neon"
}: FaceLoveLogoProps) {
  // Size configurations for different contexts
  const sizes = {
    sm: { container: "h-8 w-auto", width: 100 },
    md: { container: "h-10 w-auto", width: 140 },
    lg: { container: "h-12 w-auto", width: 180 },
    xl: { container: "h-16 w-auto", width: 240 },
    full: { container: "h-14 w-auto md:h-16", width: 220 },
  };

  const s = sizes[size];

  // Neon variant - uses the full logo image with text included
  if (variant === "neon") {
    return (
      <div className={cn("relative group", className)}>
        {/* Subtle glow effect behind logo */}
        <div 
          className={cn(
            "absolute -inset-4 rounded-2xl opacity-0 transition-opacity duration-500",
            "bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20",
            "blur-xl group-hover:opacity-100",
            "group-hover:scale-110 transition-transform duration-500"
          )}
          aria-hidden="true"
        />
        
        {/* Logo image with transparent background for seamless integration */}
        <div className={cn("relative", s.container)}>
          <Image
            src="/images/logo-facelove-neon.png"
            alt="FaceLove - Connect. Share. Live."
            width={s.width}
            height={s.width * 0.38} // Maintain aspect ratio ~2.6:1
            priority
            className="object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(147, 51, 234, 0.4))',
            }}
          />
        </div>
      </div>
    );
  }

  // Minimal variant - icon only for small spaces
  if (variant === "minimal") {
    return (
      <div className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl",
        s.container,
        "shadow-lg shadow-purple-500/25",
        "group-hover:shadow-purple-500/40 group-hover:scale-105",
        "transition-all duration-300"
      )}>
        <Image
          src="/images/logo-facelove-neon.png"
          alt="FaceLove Logo"
          fill
          className="object-contain p-1"
          priority
        />
      </div>
    );
  }

  // Default variant - original style with separate text
  return (
    <div className={cn("flex items-center gap-2.5 group", className)}>
      <div className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl",
        s.logo || "w-10 h-10",
        "shadow-lg shadow-purple-500/25",
        "group-hover:shadow-purple-500/40 group-hover:scale-105",
        "transition-all duration-300"
      )}>
        <Image
          src="/logo-facelove.png"
          alt="FaceLove Logo"
          fill
          className="object-contain p-0.5"
          priority
        />
      </div>

      {showText && (
        <span className={cn(
          "font-bold tracking-tight",
          s.text || "text-xl",
          "text-foreground"
        )}>
          Face<span className="gradient-text">Love</span>
        </span>
      )}
    </div>
  );
}

export function FaceLoveIcon({ size = "md", className }: Omit<FaceLoveLogoProps, 'showText'>) {
  return <FaceLoveLogo size={size} showText={false} className={className} variant="minimal" />;
}

export function FaceLoveLogoFull({ className }: { className?: string }) {
  return <FaceLoveLogo size="full" className={className} variant="neon" />;
}
