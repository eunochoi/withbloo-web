const HomePageSkeleton = () => (
  <section className="flex w-full min-w-0 flex-col gap-14 pt-4 animate-pulse motion-reduce:animate-none" role="status" aria-label="홈 기록 불러오는 중" aria-busy="true">
    {[0, 1, 2, 3].map((section) => (
      <div key={section} className="flex min-w-0 flex-col gap-6" aria-hidden="true">
        <div className="flex items-center justify-between gap-3 py-2">
          <div className="h-7 w-32 rounded bg-theme-skeleton" />
          <div className="h-5 w-24 rounded bg-theme-skeleton" />
        </div>
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex items-center gap-4 py-3">
            <div className="h-12 w-12 shrink-0 rounded-full bg-theme-skeleton" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-5 w-3/4 rounded bg-theme-skeleton" />
              <div className="h-4 w-1/2 rounded bg-theme-skeleton" />
            </div>
          </div>
        ))}
      </div>
    ))}
  </section>
);

export default HomePageSkeleton;
