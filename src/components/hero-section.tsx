import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeBadge } from "@/components/theme-badge";
import { Star, Eye, ArrowRight, Sparkles, BookOpen, User } from "lucide-react";

// Props interface for the Hero Section
export interface HeroSectionProps {
  featuredStory?: {
    id: string;
    title: string;
    author: { name: string; slug: string };
    genre: { name: string; slug: string };
    themes: Array<{ name: string; slug: string }>;
    rating: number;
    readsCount: number;
    slug?: string;
  } | null;
}

// Star Rating Component for Featured Story Card
function FeaturedStarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-amber-400 text-amber-400"
        />
      ))}
      {/* Half star */}
      {hasHalfStar && (
        <div className="relative">
          <Star className="w-4 h-4 text-amber-400/30" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
        </div>
      )}
      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="w-4 h-4 text-white/20"
        />
      ))}
    </div>
  );
}

// Format number helper (e.g., 1500 -> 1.5K)
function formatReadsCount(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Premium HeroSection Component
 * 
 * Full-width hero section with:
 * - Cinematic background with dark purple gradient overlay
 * - Bold headline with gradient accent text
 * - Dual CTA buttons
 * - Glass-morphism featured story card (desktop) / stacked layout (mobile)
 */
export function HeroSection({ featuredStory }: HeroSectionProps) {
  const storyLink = featuredStory?.slug 
    ? `/story/${featuredStory.slug}` 
    : featuredStory?.id 
      ? `/story/${featuredStory.id}` 
      : "#";

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[750px] flex items-center overflow-hidden">
      {/* ==========================================
          BACKGROUND LAYER
          Cinematic gradient with purple/pink tones
          ========================================== */}
      <div 
        className="absolute inset-0 gradient-hero"
        aria-hidden="true"
      >
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a14] via-[#120a18] to-[#0f0618]" />
        
        {/* Decorative gradient orbs - cinematic atmosphere */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-pink-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px]" />
        
        {/* Subtle grid pattern overlay for depth */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[var(--fl-background)]" />
        
        {/* Side gradient overlays for content areas */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--fl-background)] to-transparent" />
      </div>

      {/* ==========================================
          CONTENT CONTAINER
          ========================================== */}
      <div className="relative z-10 w-full py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* ==========================================
                LEFT COLUMN - HERO COPY & CTAs
                ========================================== */}
            <div className="lg:col-span-7 xl:col-span-6 flex flex-col items-start">
              {/* Badge - Discovery callout */}
              <div className="animate-fade-in-up mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--fl-secondary-glow)]/20 border border-[var(--fl-border)] backdrop-blur-sm text-sm font-medium text-[var(--fl-text-secondary)]">
                  <Sparkles className="w-4 h-4 text-[var(--fl-primary)]" />
                  Descubra histórias inesquecíveis
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in-up animation-delay-100">
                <span className="text-white">Histórias reais.</span>
                <br />
                <span className="gradient-text">Conexões que ficam.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-[var(--fl-text-muted)] max-w-xl leading-relaxed mb-8 animate-fade-in-up animation-delay-200">
                Mergulhe em um universo de narrativas cativantes onde cada história 
                é uma porta para novas emoções. Encontre sua próxima leitura favorita.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
                <Link href="/stories">
                  <Button
                    size="lg"
                    className="
                      group px-8 py-6 text-base font-semibold
                      bg-gradient-to-r from-[var(--fl-primary)] to-[var(--fl-accent)]
                      hover:from-[var(--fl-primary-hover)] hover:to-[var(--fl-accent-hover)]
                      text-white shadow-lg shadow-[var(--fl-primary-glow)]
                      hover:shadow-xl hover:shadow-[var(--fl-glow-strong)]
                      transition-all duration-300
                      hover:-translate-y-0.5
                    "
                  >
                    <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Explorar histórias
                  </Button>
                </Link>
                
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="
                      px-8 py-6 text-base font-semibold
                      border-[var(--fl-border-hover)]
                      bg-[var(--fl-surface)]/50 backdrop-blur-sm
                      text-[var(--fl-text-primary)]
                      hover:bg-[var(--fl-surface-elevated)]
                      hover:border-[var(--fl-primary)]
                      transition-all duration-300
                      hover:-translate-y-0.5
                    "
                  >
                    Cadastrar-se
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Quick stats row */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-[var(--fl-border-subtle)] animate-fade-in-up animation-delay-400">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-xs text-[var(--fl-text-muted)]">Histórias</div>
                </div>
                <div className="w-px h-10 bg-[var(--fl-border-subtle)]" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-xs text-[var(--fl-text-muted)]">Autores</div>
                </div>
                <div className="w-px h-10 bg-[var(--fl-border-subtle)]" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-xs text-[var(--fl-text-muted)]">Leitores</div>
                </div>
              </div>
            </div>

            {/* ==========================================
                RIGHT COLUMN - FEATURED STORY CARD
                Glass-morphism card with story details
                ========================================== */}
            <div className="lg:col-span-5 xl:col-span-6 animate-fade-in-up animation-delay-300">
              {featuredStory ? (
                <Link href={storyLink} className="block group">
                  <div className="
                    relative glass-card
                    p-6 md:p-8
                    rounded-2xl
                    overflow-hidden
                    hover:-translate-y-2
                    hover:shadow-[var(--fl-shadow-xl)]
                  ">
                    {/* Shimmer effect overlay */}
                    <div className="absolute inset-0 shimmer-border rounded-2xl pointer-events-none" />
                    
                    {/* Featured badge */}
                    <div className="relative z-10 flex items-center justify-between mb-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--fl-primary)]/20 to-[var(--fl-secondary)]/20 border border-[var(--fl-primary)]/30 text-xs font-semibold text-[var(--fl-primary)]">
                        <Sparkles className="w-3.5 h-3.5" />
                        História em destaque
                      </span>
                      
                      {/* Decorative glow dot */}
                      <div className="w-2 h-2 rounded-full bg-[var(--fl-primary)] animate-pulse-glow" />
                    </div>

                    {/* Story Title */}
                    <h3 className="relative z-10 text-xl md:text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[var(--fl-accent)] transition-colors duration-300">
                      {featuredStory.title}
                    </h3>

                    {/* Author info */}
                    <div className="relative z-10 flex items-center gap-3 mb-5">
                      {/* Author avatar placeholder */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--fl-secondary)] to-[var(--fl-primary)] flex items-center justify-center text-white text-sm font-bold">
                        {featuredStory.author.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-[var(--fl-text-muted)]" />
                        <span className="text-[var(--fl-text-secondary)] font-medium hover:text-white transition-colors">
                          {featuredStory.author.name}
                        </span>
                      </div>
                    </div>

                    {/* Genre & Theme badges */}
                    <div className="relative z-10 flex flex-wrap items-center gap-2 mb-6">
                      <Badge 
                        variant="secondary" 
                        className="
                          bg-[var(--fl-secondary)]/20 
                          text-[var(--fl-text-secondary)] 
                          border border-[var(--fl-border)]
                          hover:bg-[var(--fl-secondary)]/30
                        "
                      >
                        {featuredStory.genre.name}
                      </Badge>
                      
                      {featuredStory.themes.slice(0, 3).map((theme) => (
                        <ThemeBadge
                          key={theme.slug}
                          theme={{ id: theme.slug, name: theme.name, slug: theme.slug }}
                          size="sm"
                          clickable={false}
                        />
                      ))}
                    </div>

                    {/* Stats row - Rating & Reads */}
                    <div className="relative z-10 flex items-center justify-between pt-5 border-t border-[var(--fl-border-subtle)]">
                      <div className="flex items-center gap-3">
                        <FeaturedStarRating rating={featuredStory.rating} />
                        <span className="text-sm font-medium text-white">
                          {featuredStory.rating.toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-sm text-[var(--fl-text-muted)]">
                          <Eye className="w-4 h-4" />
                          {formatReadsCount(featuredStory.readsCount)} leituras
                        </span>
                      </div>
                    </div>

                    {/* Read now CTA */}
                    <div className="relative z-10 mt-6">
                      <span className="
                        inline-flex items-center gap-2 
                        text-sm font-semibold text-[var(--fl-primary)]
                        group-hover:gap-3 transition-all duration-300
                      ">
                        Ler agora
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Background decorative gradients */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--fl-primary)]/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--fl-secondary)]/10 rounded-full blur-3xl pointer-events-none" />
                  </div>
                </Link>
              ) : (
                /* Placeholder card when no featured story */
                <div className="
                  relative glass-card
                  p-8
                  rounded-2xl
                  min-h-[320px]
                  flex flex-col items-center justify-center
                  text-center
                ">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--fl-secondary)]/20 to-[var(--fl-primary)]/20 flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-[var(--fl-text-muted)]" />
                  </div>
                  <p className="text-[var(--fl-text-muted)] mb-2">
                    Nenhuma história em destaque
                  </p>
                  <p className="text-sm text-[var(--fl-text-disabled)]">
                    Volte em breve para descobrir novas histórias
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
