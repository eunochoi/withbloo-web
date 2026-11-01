
import type { SoberWithRestarts } from '@/common/components/features/Sober/types';
import { getSoberDurationDistribution } from '@/common/functions/sober';
import { twMerge } from 'tailwind-merge';

const labels = [
  '3일 미만',
  '3일~1주',
  '1~2주',
  '2주~1개월',
  '1~3개월',
  '3개월 이상',
];

interface Props {
  items: SoberWithRestarts[];
  now: number;
  compact?: boolean;
}

const SoberDurationChart = ({ items, now, compact = false }: Props) => {
  const counts = getSoberDurationDistribution(items, now);
  const maxCount = Math.max(...counts, 1);

  const asideClassName = twMerge(
    'min-w-0 border-theme-border/60',
    compact
      ? 'h-52 border-b px-2 py-5 desktop:hidden'
      : 'hidden h-60 desktop:sticky desktop:top-[max(112px,calc(var(--page-toolbar-height,0px)+24px))] desktop:block desktop:border-l desktop:pl-8',
  );

  const sectionClassName = twMerge(
    'flex h-full flex-col gap-4',
    compact && 'justify-center gap-2',
  );

  const headerClassName = twMerge(
    'flex items-baseline justify-between gap-4',
    !compact && 'py-2',
  );

  const titleClassName = twMerge(
    'text-lg font-semibold',
    !compact && 'text-xl font-bold',
  );

  const chartLabel = `현재 유지 기간별 항목 수: ${labels
    .map((label, index) => `${label} ${counts[index]}개`)
    .join(', ')}`;

  return (
    <aside className={asideClassName}>
      <section className={sectionClassName}>
        <header className={headerClassName}>
          <h2 className={titleClassName}>거리두기 현황</h2>
          <span className="shrink-0 text-sm text-theme-text-secondary">
            전체 {items.length}개
          </span>
        </header>

        <div className="flex h-full" role="img" aria-label={chartLabel}>
          {counts.map((count, index) => (
            <div
              key={labels[index]}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <div className="flex h-full w-full items-end justify-center">
                <div className="flex h-full flex-col items-center gap-1">
                  <div className="flex w-4 max-w-5 flex-1 flex-col justify-end">
                    <span className="py-1 text-center text-sm font-medium leading-none text-theme-accent">
                      {count > 0 ? count : ''}
                    </span>
                    <div
                      className={twMerge(
                        'min-h-1 w-full rounded-[3px] transition-[height] duration-200 ease-in-out',
                        count > 0 ? 'bg-theme-accent' : 'bg-theme-border',
                      )}
                      style={{ height: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <span className="text-center text-xs leading-4 text-theme-text-secondary">
                {labels[index]}
              </span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
};

export default SoberDurationChart;
