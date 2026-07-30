import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StoryNavigationProps {
  previousStory?: {
    id: string;
    title: string;
    slug: string;
    authorName: string;
  } | null;
  nextStory?: {
    id: string;
    title: string;
    slug: string;
    authorName: string;
  } | null;
}

export function StoryNavigation({
  previousStory,
  nextStory,
}: StoryNavigationProps) {
  if (!previousStory && !nextStory) {
    return null;
  }

  return (
    <section className="py-8 border-t bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Previous Story */}
            {previousStory ? (
              <Card className="group hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 overflow-hidden">
                <Link href={`/story/${previousStory.id}`} className="block h-full">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center group-hover:from-purple-500 group-hover:to-pink-500 group-hover:text-white transition-all duration-300">
                        <ChevronLeft className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <ArrowLeft className="w-3 h-3" />
                        Anterior
                      </span>
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {previousStory.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        por {previousStory.authorName}
                      </p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ) : (
              <div />
            )}

            {/* Next Story */}
            {nextStory ? (
              <Card className="group hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-300 overflow-hidden md:text-right">
                <Link href={`/story/${nextStory.id}`} className="block h-full">
                  <CardContent className="p-5 flex items-start gap-4 md:flex-row-reverse">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 flex items-center justify-center group-hover:from-pink-500 group-hover:to-purple-500 group-hover:text-white transition-all duration-300">
                        <ChevronRight className="h-5 w-5 text-pink-600 dark:text-pink-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-pink-600 dark:text-pink-400 uppercase tracking-wider flex items-center gap-1 mb-1 md:justify-end">
                        Próxima
                        <ArrowRight className="w-3 h-3" />
                      </span>
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {nextStory.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        por {nextStory.authorName}
                      </p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ) : (
              !previousStory && <div />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
