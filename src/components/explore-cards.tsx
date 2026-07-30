import Link from "next/link";
import { BookOpen, Heart, PenTool, Users, ArrowRight } from "lucide-react";

export interface ExploreCardsProps {
  genresCount?: number;
  themesCount?: number;
  authorsCount?: number;
}

// Card data configuration
const exploreCards = [
  {
    id: "genres",
    title: "Gêneros",
    description: "Fiction, True Story, Fantasy, Romance e mais.",
    countLabel: (count?: number) => `${count ?? 12} gêneros`,
    href: "/genres",
    Icon: BookOpen,
    gradient: "from-purple-500 to-fuchsia-600",
  },
  {
    id: "themes",
    title: "Temas",
    description: "Romance, BDSM, Traição, Primeira vez e mais.",
    countLabel: (count?: number) => `${count ?? 50}+ temas`,
    href: "/themes",
    Icon: Heart,
    gradient: "from-pink-400 to-rose-600",
  },
  {
    id: "authors",
    title: "Autores",
    description: "Histórias de autores incríveis da comunidade.",
    countLabel: (count?: number) => `${count ?? 120}+ autores`,
    href: "/authors",
    Icon: PenTool,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "community",
    title: "Comunidade",
    description: "Participe, comente e compartilhe experiências.",
    countLabel: () => "Entrar agora",
    href: "/community",
    Icon: Users,
    gradient: "from-fuchsia-500 to-pink-600",
  },
];

/**
 * ExploreCards - Homepage section for exploring content categories
 * 
 * Displays 4 cards in a responsive grid layout for navigating to:
 * Genres, Themes, Authors, and Community sections.
 * 
 * Features:
 * - Server component (no client-side interactivity)
 * - Responsive grid: 1 col mobile → 2 cols tablet → 4 cols desktop
 * - Glass card styling with hover effects
 * - Gradient icon backgrounds (purple-pink theme)
 * - Hover animations: translateY, glow shadow, arrow reveal
 */
export function ExploreCards({
  genresCount,
  themesCount,
  authorsCount,
}: ExploreCardsProps) {
  // Get the appropriate count for each card type
  const getCount = (id: string): number | undefined => {
    switch (id) {
      case "genres":
        return genresCount;
      case "themes":
        return themesCount;
      case "authors":
        return authorsCount;
      default:
        return undefined;
    }
  };

  return (
    <section className="w-full py-10 md:py-14 lg:py-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--fl-text-primary)]">
          Explorar por
        </h2>
        <Link
          href="/explore"
          className="group flex items-center gap-1.5 text-sm font-medium text-[var(--fl-primary)] hover:text-[var(--fl-primary-hover)] transition-colors"
        >
          Ver todos
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
        {exploreCards.map((card) => {
          const count = getCount(card.id);
          const { Icon } = card;

          return (
            <Link key={card.id} href={card.href} className="group block">
              <article
                className="
                  relative overflow-hidden rounded-xl p-5 md:p-6
                  bg-[var(--fl-surface-elevated)]
                  border border-[var(--fl-border)]
                  shadow-[var(--fl-shadow-md)]
                  transition-all duration-300 ease-out
                  group-hover:-translate-y-1
                  group-hover:border-[var(--fl-border-hover)]
                  group-hover:shadow-[var(--fl-shadow-lg)], 0 0 30px var(--fl-glow)
                "
              >
                {/* Subtle gradient overlay on hover */}
                <div
                  className="
                    absolute inset-0 opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                    bg-gradient-to-br from-purple-500/5 via-transparent to-fuchsia-500/5
                    pointer-events-none
                  "
                />

                {/* Card Content */}
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div
                    className={`
                      w-12 h-12 md:w-14 md:h-14 rounded-xl mb-4
                      flex items-center justify-center
                      bg-gradient-to-br ${card.gradient}
                      text-white
                      shadow-lg shadow-black/10
                      group-hover:scale-110 group-hover:shadow-xl
                      transition-all duration-300 ease-out
                    `}
                  >
                    <Icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="text-base md:text-lg font-semibold text-[var(--fl-text-primary)] mb-1.5 group-hover:text-[var(--fl-primary)] transition-colors duration-200">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[var(--fl-text-muted)] leading-relaxed mb-3 line-clamp-2">
                    {card.description}
                  </p>

                  {/* Footer with Count/Link */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--fl-border-subtle)]">
                    <span className="text-xs font-medium text-[var(--fl-primary)]">
                      {card.countLabel(count)}
                    </span>
                    
                    {/* Arrow indicator on hover */}
                    <ArrowRight
                      className="
                        w-4 h-4 text-[var(--fl-primary)]
                        opacity-0 -translate-x-2
                        group-hover:opacity-100 group-hover:translate-x-0
                        transition-all duration-300 ease-out
                      "
                    />
                  </div>
                </div>

                {/* Glow effect on hover */}
                <div
                  className="
                    absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100
                    transition-opacity duration-500
                    pointer-events-none
                  "
                  style={{
                    background:
                      "linear-gradient(135deg, var(--fl-glow), var(--fl-glow-purple))",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                  }}
                />
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default ExploreCards;
