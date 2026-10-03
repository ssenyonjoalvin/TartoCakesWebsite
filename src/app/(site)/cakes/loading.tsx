import { Skeleton, CakeGridSkeleton } from "@/components/ui/Skeleton";

export default function CakesLoading() {
  return (
    <section className="bg-tarto-cream py-14">
      <div className="site-container">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-60" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-24 rounded-full" />
          ))}
        </div>
        <div className="mt-10">
          <CakeGridSkeleton />
        </div>
      </div>
    </section>
  );
}
