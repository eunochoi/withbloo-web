const HabitPageSkeleton = () => (
  <section className="grid w-full gap-6 pt-4 animate-pulse motion-reduce:animate-none desktop:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] desktop:items-start desktop:gap-x-8" role="status" aria-label="습관 목록 불러오는 중" aria-busy="true">
    <div className="grid min-w-0 grid-cols-2" aria-hidden="true">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className={`flex min-w-0 flex-col gap-4 border-theme-border/50 px-2 py-4 ${index % 2 === 0 ?'border-r' :''} ${index < 2 ?'border-b' :''}`}>
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-theme-skeleton" />
            <div className="h-6 w-3/4 rounded bg-theme-skeleton" />
            <div className="h-5 w-16 rounded bg-theme-skeleton" />
          </div>
          <div className="flex justify-around">
            {[0, 1, 2, 3].map((day) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1">
                <div className="h-5 w-4 rounded bg-theme-skeleton" />
                {index === 0 ? <div className="h-12 w-4/5 rounded-lg bg-theme-skeleton" /> : <><div className="h-5 w-4 rounded bg-theme-skeleton" /><div className="mt-1 h-5 w-5 rounded-md bg-theme-skeleton" /></>}
              </div>
            ))}
          </div>
          <div className="mt-auto h-9 w-full rounded-xl bg-theme-skeleton" />
        </div>
      ))}
    </div>
    <div className="hidden min-w-0 flex-col gap-4 desktop:flex desktop:border-l desktop:border-theme-border/60 desktop:pl-8" aria-hidden="true">
      <div className="h-7 w-32 rounded bg-theme-skeleton" />
      <div className="h-5 w-2/3 rounded bg-theme-skeleton" />
      <div className="h-24 rounded-xl bg-theme-skeleton" />
    </div>
  </section>
);

export default HabitPageSkeleton;
