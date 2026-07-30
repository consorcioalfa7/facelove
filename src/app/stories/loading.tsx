import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function StoriesLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header skeleton */}
      <section className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-fuchsia-500/10 border-b">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Skeleton className="h-10 w-64 mb-3" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </div>
      </section>

      {/* Stats bar skeleton */}
      <section className="py-6 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stories grid skeleton */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 pb-6">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <div className="flex justify-between pt-4 border-t">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
