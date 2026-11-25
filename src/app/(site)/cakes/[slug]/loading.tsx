import { Skeleton } from "@/components/ui/Skeleton";

export default function CakeDetailLoading() {
  return (
    <section
      role="status"
      aria-label="Loading cake"
      className="bg-tarto-cream py-8 lg:py-12"
    >
      <div className="site-container grid items-start gap-8 lg:grid-cols-[480px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[520px_minmax(0,1fr)]">
        <Skeleton className="aspect-[3/4] w-full max-w-[520px] rounded-2xl sm:aspect-[4/5]" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-20 w-full max-w-xl" />
          <div className="flex gap-2.5 pt-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-11 w-14 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-full sm:w-60" />
        </div>
      </div>
    </section>
  );
}
