import SkeletonLine from 'src/components/Skeleton';

function PodiumSkeleton({ place }: { place: 1 | 2 | 3 }) {
  const heights = {
    1: 'h-[189px]',
    2: 'h-[149px]',
    3: 'h-[109px]',
  };

  const roundedClasses = {
    1: 'rounded-tl-2xl rounded-tr-2xl',
    2: 'rounded-tr-2xl',
    3: 'rounded-tl-2xl',
  };

  return (
    <div
      className={`bg-[#1b1b1b] box-border content-stretch flex flex-col gap-2.5 ${heights[place]} items-center overflow-clip px-2 py-2 relative ${roundedClasses[place]} shrink-0 w-[100px]`}
    >
      {/* Avatar skeleton */}
      <div className="absolute content-stretch flex flex-col gap-2 items-center translate-x-[-50%] w-[69px] left-1/2 -top-7">
        <div className="content-stretch flex gap-1 items-center justify-center relative shrink-0 w-full">
          <SkeletonLine className="size-4 rounded-full" />
          <SkeletonLine className="h-4 w-12 rounded" />
        </div>
        <SkeletonLine className="size-11 rounded-full" />
      </div>

      {/* Username skeleton */}
      <div className="content-stretch flex flex-col gap-1 items-start relative shrink-0 w-full mt-8">
        <SkeletonLine className="h-5 w-16 mx-auto rounded" />
        {place === 1 && <div className="h-4 shrink-0 w-full" />}
      </div>
    </div>
  );
}

function PodiumSectionSkeleton() {
  return (
    <div className="content-stretch flex h-[239px] items-end relative shrink-0">
      <PodiumSkeleton place={3} />
      <PodiumSkeleton place={1} />
      <PodiumSkeleton place={2} />
    </div>
  );
}

function LeaderboardRowSkeleton() {
  return (
    <div className="content-stretch flex gap-2 items-center relative shrink-0 w-full">
      <div className="box-border content-stretch flex items-center pl-0 pr-[26px] py-0 relative shrink-0">
        <div className="box-border content-stretch flex gap-2.5 items-center mr-[-26px] pl-2 pr-8 py-1 relative rounded-bl-[100px] rounded-tl-[100px] shrink-0 w-[50px]">
          <div
            aria-hidden="true"
            className="absolute border border-[rgba(255,255,255,0.08)] border-solid inset-0 pointer-events-none rounded-bl-[100px] rounded-tl-[100px]"
          />
          <SkeletonLine className="h-5 w-3.5 rounded" />
        </div>
        <div className="mr-[-26px] relative shrink-0 size-10">
          <SkeletonLine className="size-10 rounded-full" />
        </div>
      </div>
      <div className="basis-0 content-stretch flex font-medium grow items-center justify-between min-h-px min-w-px not-italic relative shrink-0">
        <SkeletonLine className="h-5 w-24 rounded" />
        <SkeletonLine className="h-4 w-16 rounded" />
      </div>
    </div>
  );
}

function LeaderboardListSkeleton() {
  return (
    <div className="content-stretch flex flex-col gap-2.5 h-44 items-start relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-col gap-3 h-[390px] items-start px-4 py-0 relative shrink-0 w-[343px]">
        {Array.from({ length: 7 }).map((_, i) => (
          <LeaderboardRowSkeleton key={i} />
        ))}
      </div>
      <div className="absolute bottom-0 h-5 left-0 w-[343px]" />
    </div>
  );
}

function LeaderboardContainerSkeleton() {
  return (
    <div className="bg-[#161616] relative rounded-xl shrink-0 w-full">
      <div className="box-border content-stretch flex flex-col items-start overflow-clip pb-0 pt-4 px-0 relative rounded-[inherit] w-full">
        <LeaderboardListSkeleton />
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[#2b2b2b] border-solid inset-0 pointer-events-none rounded-xl shadow-[0px_-9px_12.8px_0px_rgba(0,0,0,0.25)]"
      />
    </div>
  );
}

export default function LeaderboardSkeleton() {
  return (
    <div className="content-stretch flex flex-col items-center relative size-full">
      <PodiumSectionSkeleton />
      <LeaderboardContainerSkeleton />
    </div>
  );
}
