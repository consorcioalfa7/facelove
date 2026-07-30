import { db } from "@/lib/db";
import { HeroSection } from "@/components/hero-section";
import { PlatformStats } from "@/components/platform-stats";
import { ExploreCards } from "@/components/explore-cards";
import { TrendingStories } from "@/components/trending-stories";
import { ValueProps } from "@/components/value-props";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  MessageSquare,
  UserPlus,
  Activity,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// ============================================
// DATA FETCHING FUNCTION
// Gets all data needed for the homepage
// ============================================

async function getHomePageData() {
  const [genres, themes, stories, allStats, featuredStory] = await Promise.all([
    // Get all genres with story counts
    db.genre.findMany({
      orderBy: { sortOrder: "asc" },
    }),

    // Get popular themes (top 20 by story count)
    db.theme.findMany({
      orderBy: { storyCount: "desc" },
      take: 20,
    }),

    // Get trending stories (sorted by reads count, take 8 for trending section)
    db.story.findMany({
      where: { publishedAt: { not: null } },
      include: {
        author: true,
        genre: true,
        themes: {
          include: { theme: true },
          take: 3,
        },
      },
      orderBy: { readsCount: "desc" },
      take: 8,
    }),

    // Get statistics counts
    Promise.all([
      db.story.count(),
      db.author.count(),
      db.genre.count(),
      db.theme.count(),
    ]),

    // Get featured story (highest rated with reads, or first published)
    db.story.findFirst({
      where: { 
        publishedAt: { not: null },
        rating: { gte: 4.0 },
      },
      include: {
        author: true,
        genre: true,
        themes: {
          include: { theme: true },
          take: 3,
        },
      },
      orderBy: [
        { rating: "desc" },
        { readsCount: "desc" },
      ],
    }),
  ]);

  // If no highly-rated featured story, get the most recent published one
  const finalFeaturedStory = featuredStory ?? await db.story.findFirst({
    where: { publishedAt: { not: null } },
    include: {
      author: true,
      genre: true,
      themes: {
        include: { theme: true },
        take: 3,
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  return {
    genres,
    themes,
    stories: stories.map((story) => ({
      ...story,
      themes: story.themes.map((st) => st.theme),
    })),
    stats: {
      totalStories: allStats[0],
      totalAuthors: allStats[1],
      totalGenres: allStats[2],
      totalThemes: allStats[3],
    },
    featuredStory: finalFeaturedStory
      ? {
          id: finalFeaturedStory.id,
          slug: finalFeaturedStory.slug,
          title: finalFeaturedStory.title,
          author: {
            name: finalFeaturedStory.author.name,
            slug: finalFeaturedStory.author.slug,
          },
          genre: {
            name: finalFeaturedStory.genre.name,
            slug: finalFeaturedStory.genre.slug,
          },
          themes: finalFeaturedStory.themes.map((st) => ({
            name: st.theme.name,
            slug: st.theme.slug,
          })),
          rating: finalFeaturedStory.rating,
          readsCount: finalFeaturedStory.readsCount,
        }
      : null,
  };
}

// ============================================
// COMMUNITY SECTION COMPONENT
// Simple preview cards for community features
// ============================================

function CommunitySection() {
  const communityFeatures = [
    {
      icon: MessageSquare,
      title: "Discussões ativas",
      description: "Participe de conversas sobre suas histórias favoritas",
      href: "/community/discussions",
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: UserPlus,
      title: "Novos autores",
      description: "Descubra talentos emergentes da comunidade",
      href: "/authors?sort=newest",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      icon: Activity,
      title: "Atividade recente",
      description: "Acompanhe o que está acontecendo agora",
      href: "/community/activity",
      gradient: "from-fuchsia-500 to-purple-600",
    },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--fl-text-primary)] mb-3">
            Comunidade
          </h2>
          <p className="text-[var(--fl-text-muted)] max-w-lg mx-auto">
            Conecte-se e compartilhe experiências com outros leitores e autores
          </p>
        </div>

        {/* Community Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {communityFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Link key={feature.title} href={feature.href} className="group block">
                <article className="
                  relative overflow-hidden rounded-xl p-6 md:p-8
                  bg-[var(--fl-surface-elevated)]
                  border border-[var(--fl-border)]
                  shadow-[var(--fl-shadow-md)]
                  transition-all duration-300 ease-out
                  group-hover:-translate-y-1
                  group-hover:border-[var(--fl-border-hover)]
                  group-hover:shadow-[var(--fl-shadow-lg)]
                  h-full
                ">
                  {/* Gradient overlay on hover */}
                  <div className="
                    absolute inset-0 opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                    bg-gradient-to-br from-purple-500/5 via-transparent to-fuchsia-500/5
                    pointer-events-none
                  " />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`
                      w-14 h-14 rounded-xl mb-5
                      flex items-center justify-center
                      bg-gradient-to-br ${feature.gradient}
                      text-white shadow-lg
                      group-hover:scale-110 transition-transform duration-300
                    `}>
                      <IconComponent className="w-7 h-7" strokeWidth={2} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-[var(--fl-text-primary)] mb-2 group-hover:text-[var(--fl-primary)] transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-[var(--fl-text-muted)] leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    {/* CTA Link */}
                    <span className="
                      inline-flex items-center gap-1.5 text-sm font-medium
                      text-[var(--fl-primary)]
                      group-hover:gap-2.5 transition-all duration-300
                    ">
                      Explorar
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="mt-10 text-center">
          <Link href="/community">
            <Button
              variant="outline"
              className="
                gap-2 px-6 py-5
                border-[var(--fl-border)]
                bg-[var(--fl-surface-elevated)]
                text-[var(--fl-text-primary)]
                hover:bg-[var(--fl-surface-overlay)]
                hover:border-[var(--fl-primary)]
                hover:text-[var(--fl-primary)]
                transition-all duration-300
              "
            >
              <Users className="w-5 h-5" />
              Ver toda a comunidade
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================
// MAIN HOMEPAGE COMPONENT
// ============================================

export default async function HomePage() {
  const data = await getHomePageData();

  // Transform stories for TrendingStories component
  const trendingStories = data.stories.slice(0, 8).map((story) => ({
    id: story.id,
    slug: story.slug,
    title: story.title,
    author: {
      name: story.author.name,
      slug: story.author.slug,
    },
    genre: {
      name: story.genre.name,
      slug: story.genre.slug,
    },
    themes: story.themes?.map((theme) => ({
      name: theme.name,
      slug: theme.slug,
    })),
    rating: story.rating,
    readsCount: story.readsCount,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      {/* ==========================================
          1. HERO SECTION
          Cinematic hero with featured story card
          ========================================== */}
      <HeroSection featuredStory={data.featuredStory} />

      {/* ==========================================
          2. PLATFORM STATS
          Key platform metrics display
          ========================================== */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <PlatformStats
            stats={{
              totalStories: 50000, // Display values (as per mockup)
              totalAuthors: 12000,
              totalReaders: 500000,
              totalCountries: 80,
            }}
            format="compact"
          />
        </div>
      </section>

      {/* ==========================================
          3. EXPLORE CARDS
          Navigation cards for Genres, Themes, Authors, Community
          ========================================== */}
      <section className="px-4">
        <div className="container mx-auto">
          <ExploreCards
            genresCount={data.genres.length}
            themesCount={data.themes.length}
            authorsCount={data.stats.totalAuthors}
          />
        </div>
      </section>

      {/* ==========================================
          4. TRENDING STORIES / MAIS LIDAS
          Most read stories of the week
          ========================================== */}
      <section className="px-4 pb-4">
        <div className="container mx-auto">
          <TrendingStories
            stories={trendingStories}
            limit={8}
            showHeader={true}
          />
        </div>
      </section>

      {/* ==========================================
          5. VALUE PROPS
          Trust-building value propositions
          ========================================== */}
      <section className="px-4">
        <div className="container mx-auto">
          <ValueProps showTitle={false} variant="default" />
        </div>
      </section>

      {/* ==========================================
          6. COMMUNITY SECTION
          Preview cards for discussions, authors, activity
          ========================================== */}
      <CommunitySection />

      {/* ==========================================
          7. FOOTER
          Site footer with links and newsletter
          ========================================== */}
      <Footer />
    </div>
  );
}
