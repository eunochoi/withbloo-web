const DiaryPageSkeleton = () => (
  <section className="grid w-full gap-6 pt-4 animate-pulse motion-reduce:animate-none desktop:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] desktop:items-start desktop:gap-x-8" role="status" aria-label="일기 목록 불러오는 중" aria-busy="true">
    <div className="min-w-0" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div key={index} className={`flex flex-col gap-4 ${index > 0 ?'border-t border-theme-border/50 pt-6' :''} ${index < 2 ?'pb-6' :''}`}>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-full bg-theme-skeleton" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="h-6 w-36 max-w-full rounded bg-theme-skeleton" />
              <div className="h-5 w-24 max-w-full rounded bg-theme-skeleton" />
            </div>
            <div className="h-5 w-1 rounded-full bg-theme-skeleton" />
          </div>
          <div className="px-1 py-2">
            {[0, 1, 2].map((line) => (
              <div key={line} className="flex h-7 items-center">
                <div className={`h-4 rounded bg-theme-skeleton ${line === 2 ?'w-2/3' :'w-full'}`} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div className="hidden min-w-0 flex-col gap-6 desktop:flex desktop:border-l desktop:border-theme-border/60 desktop:pl-8" aria-hidden="true">
      <div className="h-7 w-32 rounded bg-theme-skeleton" />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((index) => <div key={index} className="h-24 rounded-xl bg-theme-skeleton" />)}
      </div>
    </div>
  </section>
);

export default DiaryPageSkeleton;
