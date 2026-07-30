import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function GenresLoading() {
  return (
    <div className="min-h-screen">
      {/* Page header skeleton */}
      <section className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-fuchsia-500/10 border-b">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Skeleton className="h-10 w-56 mb-3" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
      </section>

      {/* Genres grid skeleton */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden h-48 md:h-52">
                <CardContent className="pt-6 pb-6 flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2 flex-grow" />
                  <Skeleton className="h-4 w-5/6 mb-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
