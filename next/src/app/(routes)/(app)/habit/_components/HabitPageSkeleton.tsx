const HabitPageSkeleton = () => (
  <section className="pt-4 grid w-full gap-6 p-2 animate-pulse motion-reduce:animate-none desktop:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] desktop:items-start desktop:gap-x-8" role="status" aria-label="습관 목록 불러오는 중">
    <div className="flex min-w-0 flex-col gap-6" aria-hidden="true">
      <div className="grid w-full grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-64 rounded-xl bg-theme-skeleton" />
        ))}
      </div>
    </div>
    <div className="hidden min-w-0 flex-col gap-6 desktop:sticky desktop:top-[max(112px,calc(var(--page-toolbar-height,0px)+24px))] desktop:flex desktop:self-start desktop:border-l desktop:border-theme-border/60 desktop:pl-8" aria-hidden="true">
      <div className="h-36 rounded-xl bg-theme-skeleton" />
    </div>
  </section>
);

export default HabitPageSkeleton;
