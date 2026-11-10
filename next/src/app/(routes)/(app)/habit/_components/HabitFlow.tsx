'use client';

import { authAction } from '@/common/auth/authAction';
import InfoNotice from '@/common/components/ui/InfoNotice';
import { habitQueries } from '@/common/queries/habitQueries';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

const HabitFlow = ({
  today,
  compact = false,
}: {
  today: string;
  compact?: boolean;
}) => {
  const query = useQuery({ ...habitQueries.flow(today, authAction) });
  if (query.isPending)
    return (
      <p className="py-8 text-center text-sm text-theme-text-secondary">
        습관 흐름을 불러오는 중이에요.
      </p>
    );
  if (query.isError)
    return (
      <button
        type="button"
        onClick={() => void query.refetch()}
        className="py-8 text-theme-accent"
      >
        습관 흐름 다시 불러오기
      </button>
    );
  const days = query.data.map((day) => ({
    ...day,
    percent: day.total ? (day.completed / day.total) * 100 : null,
  }));
  const recent = days.slice(7);
  const display = (value: number | null) =>
    value === null ? '—' : `${Number(value.toFixed(1))}%`;

  if (compact) {
    const previous = days.slice(0, 7);
    const recentEligible = recent.filter((day) => day.percent !== null);
    const previousEligible = previous.filter((day) => day.percent !== null);
    const average = (list: typeof days) =>
      list.length
        ? list.reduce((sum, day) => sum + (day.percent ?? 0), 0) / list.length
        : null;
    const recentAverage = average(recentEligible);
    const previousAverage = average(previousEligible);
    const change =
      recentAverage !== null && previousAverage !== null
        ? Number((recentAverage - previousAverage).toFixed(1))
        : null;
    return (
      <>
        <div className="mx-1 flex min-w-0 flex-col gap-4 rounded-theme border border-theme-accent/20 bg-theme-accent-light/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-theme-text-secondary">최근 7일 평균</p>
              <strong className="text-3xl font-semibold">
                {display(recentAverage)}
              </strong>
            </div>
            <div className="text-right">
              <p className="font-semibold text-theme-accent">
                {change === null
                  ? '비교할 기록 없음'
                  : `${change > 0 ? '+' : ''}${change}%p ${change > 0 ? '↑' : change < 0 ? '↓' : ''}`}
              </p>
              <p className="text-xs text-theme-text-secondary">
                이전 7일 {display(previousAverage)}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {[...recent].reverse().map((day) => (
              <div
                key={day.date}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
                aria-label={`${day.date}, ${day.completed}/${day.total} 완료, ${display(day.percent)}`}
              >
                <span className="text-xs text-theme-text-secondary">
                  {display(day.percent)}
                </span>
                <span className="flex h-24 w-[65%] items-end overflow-hidden rounded-lg bg-theme-border/80">
                  <span
                    className="w-full bg-theme-accent"
                    style={{ height: `${day.percent ?? 0}%` }}
                  />
                </span>
                <span
                  className={
                    day.date === today
                      ? 'text-xs font-semibold text-theme-accent'
                      : 'text-xs text-theme-text-secondary'
                  }
                >
                  {day.date === today
                    ? '오늘'
                    : format(parseISO(day.date), 'eee', { locale: ko })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <section className="flex min-w-0 flex-col gap-6 px-2">
      <h2 className="text-xl font-semibold">습관 흐름</h2>
      <div className="flex gap-1">
        {[...recent].reverse().map((day) => (
          <div
            key={day.date}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
            aria-label={`${day.date}, ${day.completed}/${day.total} 완료, ${display(day.percent)}`}
          >
            <span className="text-sm text-theme-text-secondary">
              {display(day.percent)}
            </span>
            <span className="flex h-32 w-[70%] items-end overflow-hidden rounded-lg bg-theme-border/80">
              <span
                className="w-full bg-theme-accent"
                style={{ height: `${day.percent ?? 0}%` }}
              />
            </span>
            <span
              className={
                day.date === today
                  ? 'text-sm text-theme-accent'
                  : 'text-sm text-theme-text-secondary'
              }
            >
              {day.date === today
                ? '오늘'
                : format(parseISO(day.date), 'eee', { locale: ko })}
            </span>
            <span
              className={
                day.date === today
                  ? 'text-sm text-theme-accent'
                  : 'text-sm text-theme-text-secondary'
              }
            >
              {format(parseISO(day.date), 'd')}
            </span>
          </div>
        ))}
      </div>
      <InfoNotice>자유 기록은 실천율에 포함하지 않아요.</InfoNotice>
    </section>
  );
};

export default HabitFlow;
