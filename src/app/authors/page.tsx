import { db } from "@/lib/db";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Users,
  PenTool,
  BookOpen,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Fetch authors with story counts
async function getAuthors() {
  const authors = await db.author.findMany({
    orderBy: [{ name: "asc" }],
    include: {
      _count: {
        select: { stories: true },
      },
    },
  });

  return authors;
}

export const metadata = {
  title: "Autores | FaceLove",
  description: "Conheça os autores que compartilham suas histórias no FaceLove. Descubra novos escritores talentosos.",
};

export default async function AuthorsPage() {
  const authors = await getAuthors();

  // Calculate total stats
  const totalAuthors = authors.length;
  const totalStories = authors.reduce((acc, author) => acc + author._count.stories, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-fuchsia-500/10 via-purple-500/5 to-pink-500/10 border-b">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/2 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400 text-sm font-medium mb-6">
                <Users className="w-4 h-4" />
                Nossos Escritores
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Conheça Nossos{" "}
                <span className="gradient-text">Autores</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-6">
                Cada autor traz uma perspectiva única. Explore seus perfis, 
                descubra suas histórias e encontre seus favoritos.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5 text-fuchsia-500" />
                  <span className="font-semibold text-foreground">{totalAuthors}</span> autores
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold text-foreground">{totalStories}</span> histórias
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Authors Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {authors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {authors.map((author, index) => (
                  <Link
                    key={author.id}
                    href={`/authors/${author.slug}`}
                    className="animate-fade-in-up group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-purple-100 dark:border-purple-900/30 group-hover:border-purple-300 dark:group-hover:border-purple-700 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          {/* Avatar */}
                          <Avatar className="w-20 h-20 mb-4 ring-4 ring-purple-100 dark:ring-purple-900/30 ring-offset-2 ring-offset-background">
                            <AvatarImage src={author.avatarUrl || undefined} alt={author.name} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-bold">
                              {author.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* Name */}
                          <h3 className="font-bold text-lg mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {author.name}
                          </h3>

                          {/* Story count badge */}
                          <Badge 
                            variant="secondary"
                            className="mb-3 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            {author._count.stories} {author._count.stories === 1 ? 'história' : 'histórias'}
                          </Badge>

                          {/* Bio snippet */}
                          {author.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {author.bio}
                            </p>
                          )}

                          {/* Member since */}
                          {author.memberSince && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Membro desde {new Date(author.memberSince).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-20 animate-fade-in">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-fuchsia-100 to-purple-100 mb-6">
                  <Users className="w-12 h-12 text-fuchsia-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Nenhum autor encontrado</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Os autores estarão disponíveis em breve. Volte mais tarde!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section - Become an Author */}
        <section className="py-16 border-t bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-fuchsia-500/10">
          <div className="container mx-auto px-4 text-center">
            <PenTool className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h2 className="text-2xl font-bold mb-3">Você também pode ser um autor!</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Compartilhe suas histórias com milhares de leitores. Junte-se à nossa comunidade de escritores.
            </p>
            <Link href="/submit">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                <PenTool className="w-5 h-5" />
                Começar a Escrever
              </div>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
