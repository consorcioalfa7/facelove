import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthorsLoading() {
  return (
    <div className="min-h-screen">
      {/* Page header skeleton */}
      <section className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-fuchsia-500/10 border-b">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Skeleton className="h-10 w-48 mb-3" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
      </section>

      {/* Authors grid skeleton */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
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
