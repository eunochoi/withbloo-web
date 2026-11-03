const CalendarPageSkeleton = () => (
  <section className="grid w-full min-w-0 flex-1 items-stretch gap-6 pt-3 animate-pulse motion-reduce:animate-none desktop:min-h-0 desktop:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] desktop:gap-x-8" role="status" aria-label="달력 기록 불러오는 중" aria-busy="true">
    <div className="flex min-w-0 flex-col gap-4 desktop:min-h-0" aria-hidden="true">
      <div className="flex min-h-12 items-center justify-between gap-4">
        <div className="h-8 w-8 rounded-full bg-theme-skeleton" />
        <div className="h-7 w-32 rounded bg-theme-skeleton" />
        <div className="h-8 w-8 rounded-full bg-theme-skeleton" />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="mx-auto h-5 w-5 rounded bg-theme-skeleton" />
        ))}
      </div>
      <div className="grid min-h-[21rem] flex-1 grid-cols-7 grid-rows-6 gap-1 desktop:min-h-0">
        {Array.from({ length: 42 }, (_, index) => (
          <div key={index} className="flex min-w-0 flex-col items-center justify-center gap-1">
            <div className="h-4 w-4 rounded bg-theme-skeleton" />
            <div className="h-7 w-7 rounded-full bg-theme-skeleton" />
          </div>
        ))}
      </div>
    </div>
    <div className="hidden min-w-0 flex-col gap-6 desktop:flex desktop:border-l desktop:border-theme-border/60 desktop:pl-8" aria-hidden="true">
      <div className="h-7 w-32 rounded bg-theme-skeleton" />
      <div className="h-12 w-12 rounded-full bg-theme-skeleton" />
      <div className="h-5 w-2/3 rounded bg-theme-skeleton" />
      <div className="h-4 w-full rounded bg-theme-skeleton" />
      <div className="h-4 w-4/5 rounded bg-theme-skeleton" />
    </div>
  </section>
);

export default CalendarPageSkeleton;
