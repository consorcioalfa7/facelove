import { db } from "@/lib/db";
import { SearchBar } from "@/components/search-bar";
import { StoryCard } from "@/components/story-card";
import { GenreCard } from "@/components/genre-card";
import { ThemeBadge } from "@/components/theme-badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  LayoutGrid,
  Tags,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Star,
  Clock,
  Heart,
} from "lucide-react";
import Link from "next/link";

// Fetch data for the page
async function getHomePageData() {
  const [genres, themes, stories, stats] = await Promise.all([
    // Get all genres with story counts
    db.genre.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    
    // Get popular themes (top 20 by story count)
    db.theme.findMany({
      orderBy: { storyCount: "desc" },
      take: 20,
    }),
    
    // Get recent stories (last 6)
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
      orderBy: { publishedAt: "desc" },
      take: 6,
    }),
    
    // Get statistics
    Promise.all([
      db.story.count(),
      db.author.count(),
      db.genre.count(),
      db.theme.count(),
    ]),
  ]);

  return {
    genres,
    themes,
    stories: stories.map((story) => ({
      ...story,
      themes: story.themes.map((st) => st.theme),
    })),
    stats: {
      totalStories: stats[0],
      totalAuthors: stats[1],
      totalGenres: stats[2],
      totalThemes: stats[3],
    },
  };
}

// Loading skeleton component
function HomePageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="h-12 bg-muted rounded-lg w-64 mx-auto mb-4" />
          <div className="h-6 bg-muted rounded w-96 mx-auto mb-8" />
          <div className="h-14 bg-muted rounded-xl w-full max-w-2xl mx-auto" />
        </div>
      </section>

      {/* Stats skeleton */}
      <section className="py-12 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-10 bg-muted rounded-lg w-20 mx-auto mb-2" />
                <div className="h-4 bg-muted rounded w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Genres skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-muted rounded w-48 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border p-6 h-48" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Stat card component - FaceLove themed
function StatCard({
  icon: Icon,
  value,
  label,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  delay?: number;
}) {
  return (
    <div
      className="text-center group animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-3xl font-bold tracking-tight mb-1">
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <div className="flex flex-col">
      {/* Hero Section - FaceLove branded */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
        {/* Background decorations - Purple/Pink gradient blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              ✨ Descubra Sua Próxima História Favorita
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up animation-delay-100">
              Bem-vindo ao{" "}
              <span className="gradient-text">FaceLove</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
              Explore milhares de histórias cativantes em cada gênero. De 
              romances comoventes a aventuras emocionantes, encontre sua leitura 
              perfeita hoje.
            </p>

            {/* Search bar */}
            <div className="max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
              <SearchBar size="lg" showSuggestions={false} />
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8 animate-fade-in-up animation-delay-400">
              <span className="text-sm text-muted-foreground">Populares:</span>
              {data.themes.slice(0, 5).map((theme) => (
                <ThemeBadge
                  key={theme.id}
                  theme={theme}
                  variant="outline"
                  size="default"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard
              icon={BookOpen}
              value={data.stats.totalStories}
              label="Histórias"
              delay={0}
            />
            <StatCard
              icon={Users}
              value={data.stats.totalAuthors}
              label="Autores"
              delay={100}
            />
            <StatCard
              icon={LayoutGrid}
              value={data.stats.totalGenres}
              label="Gêneros"
              delay={200}
            />
            <StatCard
              icon={Tags}
              value={data.stats.totalThemes}
              label="Temas"
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* Genres Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Explorar por Gênero
              </h2>
              <p className="text-muted-foreground">
                Encontre histórias em sua categoria favorita
              </p>
            </div>
            <Link href="/genres" className="hidden sm:block">
              <Button variant="ghost" className="gap-2 group text-purple-600 hover:text-purple-700">
                Ver todos os gêneros
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Genre grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {data.genres.map((genre, index) => (
              <div
                key={genre.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <GenreCard genre={genre} />
              </div>
            ))}
          </div>

          {/* Mobile view all link */}
          <div className="mt-8 text-center sm:hidden">
            <Link href="/genres">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                Ver todos os gêneros
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Themes Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="w-7 h-7 text-pink-500" />
                Temas Populares
              </h2>
              <p className="text-muted-foreground">
                Explore tópicos e tags em alta
              </p>
            </div>
            <Link href="/themes" className="hidden sm:block">
              <Button variant="ghost" className="gap-2 group text-purple-600 hover:text-purple-700">
                Ver todos os temas
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Theme badges cloud */}
          <div className="flex flex-wrap gap-3 max-w-4xl">
            {data.themes.map((theme, index) => (
              <div
                key={theme.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <ThemeBadge
                  theme={theme}
                  size="default"
                  clickable={true}
                  className="px-4 py-1.5"
                />
              </div>
            ))}
          </div>

          {/* Mobile view all link */}
          <div className="mt-8 text-center sm:hidden">
            <Link href="/themes">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                Ver todos os temas
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Stories Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                <Clock className="w-7 h-7 text-fuchsia-500" />
                Histórias Recentes
              </h2>
              <p className="text-muted-foreground">
                As adições mais recentes à nossa biblioteca
              </p>
            </div>
            <Link href="/stories" className="hidden sm:block">
              <Button variant="ghost" className="gap-2 group text-purple-600 hover:text-purple-700">
                Explorar todas as histórias
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Stories grid */}
          {data.stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.stories.map((story, index) => (
                <div
                  key={story.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <StoryCard story={story} />
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-pink-500/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma história ainda</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Volte em breve para novas histórias, ou explore nossos gêneros 
                e temas para descobrir o que está por vir.
              </p>
              <div className="flex gap-3 justify-center mt-6">
                <Link href="/genres">
                  <Button variant="outline">Explorar Gêneros</Button>
                </Link>
                <Link href="/themes">
                  <Button variant="outline">Explorar Temas</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Mobile browse link */}
          {data.stories.length > 0 && (
            <div className="mt-8 text-center sm:hidden">
              <Link href="/stories">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  Explorar todas as histórias
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - FaceLove Purple-Pink Gradient */}
      <section className="py-16 md:py-24 facelove-gradient relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Star className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para Começar?
            </h2>
            <p className="text-lg opacity-90 mb-8 leading-relaxed">
              Mergulhe em um mundo de histórias inesquecíveis no FaceLove. 
              Comece a explorar agora!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/genres">
                <Button
                  size="lg"
                  className="bg-white text-purple-900 hover:bg-gray-100 shadow-lg font-semibold gap-2"
                >
                  <LayoutGrid className="w-5 h-5" />
                  Explorar Gêneros
                </Button>
              </Link>
              <Link href="/search">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-semibold gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Descobrir Novidades
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
