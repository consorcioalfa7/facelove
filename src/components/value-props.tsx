import { ShieldCheck, Heart, Users, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================
   VALUE PROPS (TRUST BLOCKS) COMPONENT
   Displays 4 trust-building value propositions
   ============================================ */

export interface ValuePropsProps {
  /** Show section title and description */
  showTitle?: boolean;
  /** Display variant */
  variant?: "default" | "compact";
  /** Additional class names */
  className?: string;
}

// Value proposition data configuration
const valuePropositions = [
  {
    id: "anonymous",
    title: "Anônimo e seguro",
    description: "Sua privacidade é nossa prioridade.",
    Icon: ShieldCheck,
    gradient: "from-violet-500 to-purple-600",
    glowColor: "rgba(139, 92, 246, 0.4)",
  },
  {
    id: "real-content",
    title: "Conteúdo real",
    description: "Histórias reais de pessoas reais.",
    Icon: Heart,
    gradient: "from-pink-500 to-rose-600",
    glowColor: "rgba(236, 72, 153, 0.4)",
  },
  {
    id: "community",
    title: "Comunidade ativa",
    description: "Interaja, comente e faça novos amigos.",
    Icon: Users,
    gradient: "from-fuchsia-500 to-purple-600",
    glowColor: "rgba(217, 70, 239, 0.4)",
  },
  {
    id: "multilingual",
    title: "Multilíngue",
    description: "Disponível em vários idiomas.",
    Icon: Globe,
    gradient: "from-purple-500 to-indigo-600",
    glowColor: "rgba(99, 102, 241, 0.4)",
  },
];

/**
 * ValueProps - Server Component displaying trust-building value propositions
 *
 * Shows 4 cards in a responsive grid layout highlighting key platform benefits:
 * Privacy/Security, Real Content, Active Community, and Multilingual Support.
 *
 * Features:
 * - Server component (no client-side interactivity required)
 * - Responsive grid: 2 cols mobile/tablet → 4 cols desktop
 * - Glass card styling with surface-elevated background
 * - Gradient icon containers (purple-pink theme)
 * - Hover animations: translateY lift, glow shadow intensification
 * - Uses FaceLove design tokens (--fl-* CSS variables)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ValueProps />
 *
 * // With section title
 * <ValueProps showTitle />
 *
 * // Compact variant
 * <ValueProps variant="compact" />
 * ```
 */
export function ValueProps({
  showTitle = false,
  variant = "default",
  className,
}: ValuePropsProps) {
  const isCompact = variant === "compact";

  return (
    <section
      className={cn(
        "w-full",
        isCompact ? "py-8 md:py-10" : "py-10 md:py-14 lg:py-16",
        className
      )}
      aria-label="Nossos Diferenciais"
    >
      {/* Optional Section Header */}
      {showTitle && (
        <div className="text-center mb-8 md:mb-10">
          <h2
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ color: "var(--fl-text-primary)" }}
          >
            Por que escolher o FaceLove?
          </h2>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto"
            style={{ color: "var(--fl-text-muted)" }}
          >
            Uma plataforma segura e acolhedora para suas histórias e conexões.
          </p>
        </div>
      )}

      {/* Value Props Grid */}
      <div
        className={cn(
          "grid gap-4 md:gap-5 lg:gap-6",
          "grid-cols-2 lg:grid-cols-4"
        )}
      >
        {valuePropositions.map((prop) => {
          const { Icon } = prop;

          return (
            <article
              key={prop.id}
              className={cn(
                "group relative overflow-hidden rounded-xl p-5 md:p-6",
                // Background using FL surface token
                "[background:var(--fl-surface-elevated)]",
                // Border using FL border token
                "border [border-color:var(--fl-border)]",
                // Shadow using FL shadow token
                "[box-shadow:var(--fl-shadow-md)]",
                // Smooth transitions for hover effects
                "transition-all duration-300 ease-out",
                // Hover state: lift effect
                "group-hover:-translate-y-1",
                // Hover state: border becomes more visible
                "group-hover:[border-color:var(--fl-border-hover)]",
                // Hover state: enhanced shadow
                "group-hover:[box-shadow:var(--fl-shadow-lg)]"
              )}
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
                {/* Icon Container with Gradient */}
                <div
                  className={cn(
                    "flex items-center justify-center mb-4",
                    isCompact ? "w-11 h-11 rounded-lg" : "w-12 h-12 md:w-14 md:h-14 rounded-xl",
                    `bg-gradient-to-br ${prop.gradient}`,
                    "text-white shadow-lg",
                    // Icon container shadow with glow
                    "shadow-black/10",
                    // Hover: scale up icon container
                    "group-hover:scale-110 group-hover:shadow-xl",
                    "transition-all duration-300 ease-out"
                  )}
                  style={{
                    boxShadow: `0 4px 12px ${prop.glowColor}`,
                  }}
                >
                  <Icon
                    className={cn(
                      isCompact ? "w-5 h-5" : "w-6 h-6 md:w-7 md:h-7"
                    )}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>

                {/* Title */}
                <h3
                  className={cn(
                    "font-semibold mb-1.5 transition-colors duration-200",
                    isCompact ? "text-sm" : "text-base md:text-lg"
                  )}
                  style={{ color: "var(--fl-text-primary)" }}
                >
                  {prop.title}
                </h3>

                {/* Description */}
                <p
                  className={cn(
                    "leading-relaxed",
                    isCompact ? "text-xs" : "text-sm"
                  )}
                  style={{ color: "var(--fl-text-muted)" }}
                >
                  {prop.description}
                </p>
              </div>

              {/* Glow effect on hover - border glow */}
              <div
                className="
                  absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100
                  transition-opacity duration-500
                  pointer-events-none
                "
                style={{
                  background: `linear-gradient(135deg, var(--fl-glow), var(--fl-glow-purple))`,
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px",
                }}
              />

              {/* Ambient glow behind card on hover */}
              <div
                className="
                  absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                  transition-opacity duration-500
                  pointer-events-none blur-xl -z-10
                "
                style={{
                  background: prop.glowColor,
                }}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ValueProps;
