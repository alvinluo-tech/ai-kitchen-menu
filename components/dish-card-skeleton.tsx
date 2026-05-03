import { Skeleton } from "@/components/ui/skeleton";

export function DishCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl shadow-md ring-1 ring-foreground/10">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-3 md:p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
