import { db } from "@/lib/db";
import { ThemeBadge } from "@/components/theme-badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Tags,
  TrendingUp,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";

// Fetch themes data
async function getThemes() {
  const themes = await db.theme.findMany({
    orderBy: [
      { storyCount: "desc" },
      { name: "asc" }
    ],
  });
  
  const totalThemes = themes.length;
  const totalStories = themes.reduce((acc, t) => acc + (t.storyCount || 0), 0);

  return { themes, totalThemes, totalStories };
}

export const metadata = {
  title: "Temas | FaceLove",
  description: "Explore todos os temas e tags disponíveis no FaceLove. Encontre histórias sobre seus assuntos favoritos.",
};

export default async function ThemesPage() {
  const { themes, totalThemes, totalStories } = await getThemes();

  // Group themes by first letter for better organization
  const groupedThemes = themes.reduce((acc, theme) => {
    const letter = theme.name.charAt(0).toUpperCase();
    if (!acc[letter]) {
      acc[letter] = [];
    }
    acc[letter].push(theme);
    return acc;
  }, {} as Record<string, typeof themes>);

  // Get top 10 most popular themes
  const popularThemes = themes.slice(0, 10);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-pink-500/10 via-fuchsia-500/5 to-purple-500/10 border-b">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-fuchsia-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-sm font-medium mb-6">
                <Tags className="w-4 h-4" />
                Descubra por Tema
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Explorar{" "}
                <span className="gradient-text">Temas</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-6">
                Encontre história pelos temas que mais te interessam. Do romance à aventura, 
                há um tema para cada leitor.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Tags className="w-5 h-5 text-pink-500" />
                  <span className="font-semibold text-foreground">{totalThemes}</span> temas
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-5 h-5 text-fuchsia-500" />
                  <span className="font-semibold text-foreground">{totalStories.toLocaleString()}</span> histórias
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Themes Section */}
        {popularThemes.length > 0 && (
          <section className="py-8 border-b bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-pink-500" />
                Temas Mais Populares
              </h2>
              <div className="flex flex-wrap gap-3">
                {popularThemes.map((theme) => (
                  <ThemeBadge
                    key={theme.id}
                    theme={theme}
                    size="default"
                    clickable={true}
                    className="px-4 py-2"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Themes Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold mb-6">Todos os Temas</h2>
            
            {themes.length > 0 ? (
              <div className="flex flex-wrap gap-3 max-w-4xl">
                {themes.map((theme, index) => (
                  <div
                    key={theme.id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    <ThemeBadge
                      theme={theme}
                      size="default"
                      clickable={true}
                      className="px-3 py-1.5"
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-20 animate-fade-in">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-fuchsia-100 mb-6">
                  <Tags className="w-12 h-12 text-pink-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Nenhum tema encontrado</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Os temas estarão disponíveis em breve. Volte mais tarde!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 border-t bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-3">Quer explorar de outra forma?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Navegue por gênero ou veja todas as nossas histórias.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/genres">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Explorar por Gênero
                </div>
              </Link>
              <Link href="/stories">
                <div className="border border-pink-200 dark:border-pink-700 text-pink-700 dark:text-pink-400 px-6 py-3 rounded-lg font-medium hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors inline-flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Ver Todas as Histórias
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
