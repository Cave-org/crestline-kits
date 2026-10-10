import clsx from "clsx";

export function Bone({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-md bg-line/70", className)} />;
}

export function CardSkeleton() {
  return (
    <div>
      <Bone className="aspect-square w-full" />
      <Bone className="mt-3 h-3.5 w-4/5" />
      <Bone className="mt-2 h-4 w-1/3" />
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ShopSkeleton() {
  return (
    <div className="container-x pt-8" aria-busy="true" aria-label="Loading">
      <Bone className="h-3 w-32" />
      <Bone className="mt-5 h-11 w-64" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Bone key={i} className="h-8 w-28 rounded-full" />
        ))}
      </div>
      <Bone className="mt-6 h-12 w-full" />
      <GridSkeleton />
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="container-x pt-6" aria-busy="true" aria-label="Loading">
      <Bone className="h-3 w-48" />
      <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div>
          <Bone className="aspect-square w-full rounded-lg" />
          <div className="mt-3 grid grid-cols-4 gap-3">
            <Bone className="aspect-square" />
            <Bone className="aspect-square" />
          </div>
        </div>
        <div>
          <Bone className="h-3.5 w-40" />
          <Bone className="mt-3 h-10 w-4/5" />
          <Bone className="mt-5 h-8 w-36" />
          <Bone className="mt-5 h-4 w-full" />
          <Bone className="mt-2 h-4 w-2/3" />
          <div className="mt-8 flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Bone key={i} className="h-11 w-14" />
            ))}
          </div>
          <Bone className="mt-6 h-20 w-full rounded-lg" />
          <Bone className="mt-6 h-12 w-full" />
          <Bone className="mt-3 h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="container-x pt-8 md:pt-12">
        <Bone className="h-12 w-3/4 md:h-20" />
        <Bone className="mt-3 h-12 w-1/2 md:h-20" />
      </div>
      <Bone className="mt-8 h-[360px] w-full rounded-none sm:h-[440px] md:mt-10 md:h-[540px]" />
      <div className="container-x mt-16">
        <Bone className="h-9 w-72" />
        <GridSkeleton count={4} />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container-x max-w-4xl pt-10" aria-busy="true" aria-label="Loading">
      <Bone className="h-12 w-64" />
      <Bone className="mt-3 h-4 w-48" />
      <Bone className="mt-10 h-64 w-full rounded-xl" />
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Bone className="h-8 w-48" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Bone className="h-24 rounded-xl bg-white" />
        <Bone className="h-24 rounded-xl bg-white" />
        <Bone className="h-24 rounded-xl bg-white" />
      </div>
      <Bone className="mt-6 h-96 rounded-xl bg-white" />
    </div>
  );
}
