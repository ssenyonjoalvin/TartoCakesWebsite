type Props = {
  className?: string;
};

export function Skeleton({ className = "" }: Props) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-tarto-ink/10 ${className}`}
    />
  );
}

/** Same footprint as CakeCard so the grid doesn't jump when data arrives. */
export function CakeCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white">
      <Skeleton className="aspect-[4/5] rounded-none" />
      <div className="flex flex-1 flex-col items-center gap-2 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-3 h-11 w-full rounded-full" />
      </div>
    </div>
  );
}

export function CakeGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading cakes"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <CakeCardSkeleton key={index} />
      ))}
    </div>
  );
}
