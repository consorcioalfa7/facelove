"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Shield, Heart, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ============================================
   AGE GATE PROPS INTERFACE
   ============================================ */
interface AgeGateProps {
  /** Minimum age requirement (default 18) */
  minAge?: number;
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Callback when verified */
  onVerified?: () => void;
  /** Callback when declined */
  onDeclined?: () => void;
}

/* ============================================
   LOCAL STORAGE KEYS
   ============================================ */
const AGE_VERIFIED_KEY = "age_verified";
const AGE_VERIFIED_AT_KEY = "age_verified_at";

/* ============================================
   FLOATING HEART PARTICLE COMPONENT
   Creates animated heart particles in background
   ============================================ */
function FloatingHeart({ delay, duration, left, size }: { 
  delay: number; 
  duration: number; 
  left: number; 
  size: number;
}) {
  return (
    <div
      className="absolute bottom-0 opacity-0 animate-float-heart pointer-events-none"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        fontSize: `${size}px`,
      }}
    >
      <Heart 
        className="text-[var(--fl-primary)]/20" 
        fill="currentColor"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
}

/* ============================================
   HEART PARTICLES GENERATOR
   Generates random floating hearts
   ============================================ */
function HeartParticles() {
  const hearts = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    left: Math.random() * 100,
    size: 12 + Math.random() * 20,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {hearts.map((heart) => (
        <FloatingHeart key={heart.id} {...heart} />
      ))}
    </div>
  );
}

/* ============================================
   MAIN AGE GATE COMPONENT
   Premium 18+ Age Verification Overlay
   ============================================ */
export function AgeGate({
  minAge = 18,
  title = "Bem-vindo ao FaceLove",
  message = `Este conteúdo é destinado a maiores de ${18} anos. Ao continuar, você confirma que tem idade legal para acessar conteúdo adulto.`,
  confirmText = "Sim, tenho 18+ anos",
  cancelText = "Não, sou menor",
  onVerified,
  onDeclined,
}: AgeGateProps) {
  /* ----------------------------------------
     STATE MANAGEMENT
     ---------------------------------------- */
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showExitMessage, setShowExitMessage] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  /* ----------------------------------------
     CHECK AGE VERIFICATION STATUS
     ---------------------------------------- */
  const checkVerification = useCallback(() => {
    try {
      const verified = localStorage.getItem(AGE_VERIFIED_KEY);
      return verified === "true";
    } catch {
      // localStorage might be blocked
      return false;
    }
  }, []);

  /* ----------------------------------------
     SET AGE VERIFICATION
     ---------------------------------------- */
  const setVerified = useCallback(() => {
    try {
      localStorage.setItem(AGE_VERIFIED_KEY, "true");
      localStorage.setItem(AGE_VERIFIED_AT_KEY, new Date().toISOString());
    } catch {
      // Silently fail if localStorage is not available
    }
  }, []);

  /* ----------------------------------------
     HANDLE CONFIRMATION (User is 18+)
     ---------------------------------------- */
  const handleConfirm = useCallback(() => {
    setIsExiting(true);
    
    // Small delay to allow exit animation to play
    setTimeout(() => {
      setVerified();
      setIsVisible(false);
      onVerified?.();
    }, 400);
  }, [setVerified, onVerified]);

  /* ----------------------------------------
     HANDLE DECLINE (User is under 18)
     ---------------------------------------- */
  const handleDecline = useCallback(() => {
    setShowExitMessage(true);
    onDeclined?.();
    
    // Redirect after showing message
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = "about:blank";
      }
    }, 2000);
  }, [onDeclined]);

  /* ----------------------------------------
     KEYBOARD NAVIGATION HANDLER
     ---------------------------------------- */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Enter or Space on confirm button
    if (e.key === "Enter" || e.key === " ") {
      if (document.activeElement === confirmButtonRef.current) {
        e.preventDefault();
        handleConfirm();
      }
    }
    // Escape to decline
    if (e.key === "Escape") {
      handleDecline();
    }
  }, [handleConfirm, handleDecline]);

  /* ----------------------------------------
     INITIALIZATION & FOCUS MANAGEMENT
     ---------------------------------------- */
  useEffect(() => {
    setIsMounted(true);
    
    // Check if already verified
    const alreadyVerified = checkVerification();
    
    if (!alreadyVerified) {
      // Small delay to prevent flash
      const timer = setTimeout(() => {
        setIsVisible(true);
        
        // Focus confirm button after mount for accessibility
        requestAnimationFrame(() => {
          confirmButtonRef.current?.focus();
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [checkVerification]);

  /* ----------------------------------------
     PREVENT BODY SCROLL WHEN VISIBLE
     ---------------------------------------- */
  useEffect(() => {
    if (isVisible && !isExiting) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible, isExiting]);

  /* ----------------------------------------
     DON'T RENDER IF ALREADY VERIFIED OR NOT MOUNTED
     ---------------------------------------- */
  if (!isMounted || (!isVisible && !isExiting)) {
    return null;
  }

  /* ==========================================
     RENDER AGE GATE OVERLAY
     ========================================== */
  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-message"
      onKeyDown={handleKeyDown}
      className={cn(
        "fixed inset-0 z-[9999]",
        "flex items-center justify-center",
        "transition-all duration-500 ease-out",
        isExiting 
          ? "opacity-0 scale-95 blur-sm" 
          : "opacity-100 scale-100"
      )}
    >
      {/* ==========================================
          BACKGROUND LAYERS
          Dark gradient with animated effects
          ========================================== */}
      
      {/* Base dark background */}
      <div 
        className="absolute inset-0 bg-[var(--fl-background)]"
        aria-hidden="true"
      />
      
      {/* Animated gradient orbs - cinematic atmosphere */}
      <div 
        className="absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Primary purple orb - top left */}
        <div 
          className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full animate-pulse-glow-slow"
          style={{
            background: "radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        
        {/* Secondary pink orb - bottom right */}
        <div 
          className="absolute -bottom-[25%] -right-[15%] w-[700px] h-[700px] rounded-full animate-pulse-glow-slow"
          style={{
            animationDelay: "2s",
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        
        {/* Tertiary fuchsia orb - center */}
        <div 
          className="absolute top-[30%] left-[50%] translate-x-[-50%] w-[400px] h-[400px] rounded-full animate-pulse-glow-slow"
          style={{
            animationDelay: "4s",
            background: "radial-gradient(circle, rgba(217, 70, 239, 0.15) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px"
          }}
        />

        {/* Floating heart particles */}
        <HeartParticles />
      </div>

      {/* Vignette effect overlay */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,10,15,0.8)_100%)]"
        aria-hidden="true"
      />

      {/* ==========================================
          MAIN CONTENT CARD
          Glass-morphism container
          ========================================== */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg mx-4",
          "p-8 md:p-12",
          "rounded-3xl",
          "bg-[var(--fl-surface-overlay)]/90 backdrop-blur-xl",
          "border border-[var(--fl-border)]",
          "shadow-[var(--fl-shadow-glow)]",
          "transition-all duration-500 ease-out delay-100",
          isExiting ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        )}
      >
        {/* Decorative shimmer border effect */}
        <div 
          className="absolute inset-0 rounded-3xl pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute inset-[-1px] rounded-3xl bg-gradient-to-br from-[var(--fl-primary)]/20 via-transparent to-[var(--fl-secondary)]/20 animate-shimmer-border" />
        </div>

        {/* Close button (for exit state) */}
        {showExitMessage && (
          <button
            onClick={() => window.location.href = "about:blank"}
            className="absolute top-4 right-4 p-2 rounded-full text-[var(--fl-text-muted)] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ==========================================
            CONTENT AREA
            ========================================== */}
        <div className="relative text-center">
          
          {/* Logo / Icon Section with Glow Animation */}
          <div 
            className={cn(
              "inline-flex items-center justify-center",
              "w-24 h-24 md:w-28 md:h-28 mb-8",
              "rounded-full",
              "bg-gradient-to-br from-[var(--fl-primary)]/20 via-[var(--fl-secondary)]/20 to-[var(--fl-accent)]/20",
              "border border-[var(--fl-border)]",
              "animate-logo-pulse",
              "shadow-[0_0_40px_var(--fl-primary-glow)]"
            )}
          >
            <Shield 
              className="w-12 h-12 md:w-14 md:h-14 text-[var(--fl-primary)] drop-shadow-[0_0_10px_var(--fl-primary)]" 
              strokeWidth={1.5}
            />
          </div>

          {/* Title with fade-in animation */}
          <h1 
            id="age-gate-title"
            className={cn(
              "text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4",
              "animate-fade-in-up"
            )}
            style={{ animationDelay: "0.2s", animationFillMode: "both" }}
          >
            {title}
          </h1>

          {/* Message with fade-in animation */}
          <p 
            id="age-gate-message"
            className={cn(
              "text-base md:text-lg text-[var(--fl-text-secondary)] leading-relaxed mb-8 max-w-md mx-auto",
              "animate-fade-in-up"
            )}
            style={{ animationDelay: "0.35s", animationFillMode: "both" }}
          >
            {message.replace("{minAge}", String(minAge))}
          </p>

          {/* Age indicator badge */}
          <div 
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full",
              "bg-[var(--fl-secondary)]/20 border border-[var(--fl-border)]",
              "animate-fade-in-up"
            )}
            style={{ animationDelay: "0.45s", animationFillMode: "both" }}
          >
            <Lock className="w-4 h-4 text-[var(--fl-primary)]" />
            <span className="text-sm font-semibold text-[var(--fl-text-secondary)]">
              Conteúdo +{minAge}
            </span>
          </div>

          {/* Exit Message State */}
          {showExitMessage ? (
            <div 
              className="animate-scale-in-bounce p-6 rounded-2xl bg-red-500/10 border border-red-500/30"
            >
              <p className="text-red-300 font-medium mb-2">
                Acesso não permitido
              </p>
              <p className="text-sm text-red-400/80">
                Redirecionando...
              </p>
            </div>
          ) : (
            /* Action Buttons */
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              style={{ animationDelay: "0.55s", animationFillMode: "both" }}
            >
              {/* Confirm Button - Pink/Magenta Gradient */}
              <Button
                ref={confirmButtonRef}
                onClick={handleConfirm}
                size="lg"
                className={cn(
                  "group relative px-8 py-6 text-base font-semibold",
                  "rounded-xl overflow-hidden",
                  "bg-gradient-to-r from-[var(--fl-primary)] via-[#e879f9] to-[var(--fl-accent)]",
                  "hover:from-[var(--fl-primary-hover)] hover:via-[#f472b6] hover:to-[var(--fl-accent-hover)]",
                  "text-white shadow-lg shadow-[var(--fl-primary-glow)]",
                  "hover:shadow-xl hover:shadow-[var(--fl-glow-strong)]",
                  "transform hover:-translate-y-1 active:translate-y-0",
                  "transition-all duration-300 ease-out",
                  "animate-slide-up-fade",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fl-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fl-background)]"
                )}
                aria-label={confirmText}
              >
                {/* Shimmer effect on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                
                <Heart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="currentColor" />
                {confirmText}
              </Button>

              {/* Decline Button - Ghost Style */}
              <Button
                onClick={handleDecline}
                variant="ghost"
                size="lg"
                className={cn(
                  "group px-8 py-6 text-base font-medium",
                  "rounded-xl",
                  "border border-[var(--fl-border-subtle)]",
                  "bg-[var(--fl-surface)]/50 backdrop-blur-sm",
                  "text-[var(--fl-text-muted)] hover:text-[var(--fl-text-disabled)]",
                  "hover:bg-white/5 hover:border-[var(--fl-border)]",
                  "transform hover:-translate-y-0.5 active:translate-y-0",
                  "transition-all duration-300 ease-out",
                  "animate-slide-up-fade",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fl-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fl-background)]"
                )}
                style={{ animationDelay: "0.65s", animationFillMode: "both" }}
                aria-label={cancelText}
              >
                <X className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                {cancelText}
              </Button>
            </div>
          )}

          {/* Disclaimer text */}
          <p 
            className={cn(
              "mt-8 text-xs text-[var(--fl-text-disabled)] leading-relaxed",
              "animate-fade-in-up"
            )}
            style={{ animationDelay: "0.75s", animationFillMode: "both" }}
          >
            Ao acessar este site, você concorda com nossos{" "}
            <span className="underline underline-offset-2 decoration-[var(--fl-border)] hover:text-[var(--fl-text-secondary)] transition-colors cursor-pointer">
              Termos de Uso
            </span>{" "}
            e{" "}
            <span className="underline underline-offset-2 decoration-[var(--fl-border)] hover:text-[var(--fl-text-secondary)] transition-colors cursor-pointer">
              Política de Privacidade
            </span>
          </p>
        </div>
      </div>

      {/* Inline Styles for Animations */}
      <style jsx global>{`
        /* Floating Heart Animation */
        @keyframes float-heart {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          50% {
            transform: translateY(-50vh) rotate(180deg) scale(1.1);
            opacity: 0.3;
          }
          90% {
            opacity: 0.1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg) scale(0.8);
            opacity: 0;
          }
        }

        .animate-float-heart {
          animation: float-heart linear infinite;
        }

        /* Slow Pulse Glow for Background Orbs */
        @keyframes pulse-glow-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
        }

        .animate-pulse-glow-slow {
          animation: pulse-glow-slow 8s ease-in-out infinite;
        }

        /* Logo Pulse Glow Effect */
        @keyframes logo-pulse {
          0%, 100% {
            box-shadow: 0 0 40px var(--fl-primary-glow), 
                        0 0 80px var(--fl-glow-purple),
                        inset 0 0 20px rgba(236, 72, 153, 0.1);
          }
          50% {
            box-shadow: 0 0 60px var(--fl-glow-strong), 
                        0 0 120px var(--fl-glow-purple),
                        inset 0 0 30px rgba(236, 72, 153, 0.2);
          }
        }

        .animate-logo-pulse {
          animation: logo-pulse 3s ease-in-out infinite;
        }

        /* Fade In Up Animation */
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        /* Slide Up Fade Animation for Buttons */
        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up-fade {
          animation: slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        /* Shimmer Border Animation */
        @keyframes shimmer-border {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-shimmer-border {
          background-size: 200% 200%;
          animation: shimmer-border 4s linear infinite;
        }

        /* Scale In Bounce for Exit Message */
        @keyframes scale-in-bounce {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in-bounce {
          animation: scale-in-bounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        /* Gradient Text Utility */
        .gradient-text {
          background: linear-gradient(135deg, var(--fl-primary) 0%, var(--fl-accent) 50%, var(--fl-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}

/* ============================================
   HOOK FOR USING AGE GATE
   Convenience hook for page-level integration
   ============================================ */
export function useAgeGate() {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const verified = localStorage.getItem(AGE_VERIFIED_KEY) === "true";
      setIsVerified(verified);
    } catch {
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verify = useCallback(() => {
    try {
      localStorage.setItem(AGE_VERIFIED_KEY, "true");
      localStorage.setItem(AGE_VERIFIED_AT_KEY, new Date().toISOString());
      setIsVerified(true);
    } catch {
      // Silently fail
    }
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(AGE_VERIFIED_KEY);
      localStorage.removeItem(AGE_VERIFIED_AT_KEY);
      setIsVerified(false);
    } catch {
      // Silently fail
    }
  }, []);

  return { isVerified, isLoading, verify, reset };
}

export default AgeGate;
