'use client';

import { authAction } from '@/common/auth/authAction';
import InfoNotice from '@/common/components/ui/InfoNotice';
import { habitQueries } from '@/common/queries/habitQueries';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

const HabitFlow = ({ today, hideTitle = false, compact = false }: { today: string; hideTitle?: boolean; compact?: boolean }) => {
  const query = useQuery({ ...habitQueries.flow(today, authAction) });
  if (query.isPending) return <p className="py-8 text-center text-sm text-theme-text-secondary">습관 흐름을 불러오는 중이에요.</p>;
  if (query.isError) return <button type="button" onClick={() => void query.refetch()} className="py-8 text-theme-accent">습관 흐름 다시 불러오기</button>;
  const days = query.data.map((day) => ({ ...day, percent: day.total ? day.completed / day.total * 100 : null }));
  const recent = days.slice(7);
  const previous = days.slice(0, 7);
  const recentEligible = recent.filter((day) => day.percent !== null);
  const previousEligible = previous.filter((day) => day.percent !== null);
  const average = (list: typeof days) => list.length ? list.reduce((sum, day) => sum + (day.percent ?? 0), 0) / list.length : null;
  const recentAverage = average(recentEligible);
  const previousAverage = average(previousEligible);
  const change = recentAverage !== null && previousAverage !== null ? Number((recentAverage - previousAverage).toFixed(1)) : null;
  const display = (value: number | null) => value === null ? '—' : `${Number(value.toFixed(1))}%`;

  if (compact) return (
    <>
      <div className="mx-1 flex min-w-0 flex-col gap-4 rounded-theme border border-theme-text-secondary/10 bg-theme-surface-muted/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-sm text-theme-text-secondary">최근 7일 평균</p><strong className="text-3xl font-semibold">{display(recentAverage)}</strong></div>
          <div className="text-right"><p className="font-semibold text-theme-accent">{change === null ? '비교할 기록 없음' : `${change > 0 ? '+' : ''}${change}%p ${change > 0 ? '↑' : change < 0 ? '↓' : ''}`}</p><p className="text-xs text-theme-text-secondary">이전 7일 {display(previousAverage)}</p></div>
        </div>
        <div className="flex gap-1">
          {[...recent].reverse().map((day) => <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-2" aria-label={`${day.date}, ${day.completed}/${day.total} 완료, ${display(day.percent)}`}>
            <span className="text-xs text-theme-text-secondary">{display(day.percent)}</span>
            <span className="flex h-24 w-[65%] items-end overflow-hidden rounded-lg bg-theme-border/80"><span className="w-full bg-theme-accent" style={{ height: `${day.percent ?? 0}%` }} /></span>
            <span className={day.date === today ? 'text-xs font-semibold text-theme-accent' : 'text-xs text-theme-text-secondary'}>{day.date === today ? '오늘' : format(parseISO(day.date), 'eee', { locale: ko })}</span>
          </div>)}
        </div>
      </div>
    </>
  );

  return (
    <section className="flex min-w-0 flex-col gap-6 px-2">
      {!hideTitle && <h2 className="text-xl font-semibold">습관 흐름</h2>}
      <div className="desktop:border border-theme-border/70 desktop:bg-theme-bg/70 desktop:py-3 rounded-theme flex flex-col items-center gap-2 text-center">
        <h3 className="text-base font-semibold">최근 7일 평균</h3>
        <p className="text-sm text-theme-text-secondary">{format(parseISO(recent[0].date), 'M.d')} ~ {format(parseISO(today), 'M.d')}</p>
        <strong className="py-2 text-4xl font-semibold text-theme-text-secondary">{display(recentAverage)}</strong>
        <p className="text-sm text-theme-accent">{change === null ? '비교할 기록이 없어요' : change === 0 ? '이전 7일과 같아요' : `이전 7일보다 ${Math.abs(change)}%p ${change > 0 ? '높아요' : '낮아요'}`}</p>
        {recentEligible.length < 7 && <p className="text-sm text-theme-text-secondary">{recentEligible.length ? `${recentEligible.length}일 기준` : '집계할 일반 습관이 없어요'}</p>}
      </div>
      <div className="flex gap-1">
        {[...recent].reverse().map((day) => (
          <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-2" aria-label={`${day.date}, ${day.completed}/${day.total} 완료, ${display(day.percent)}`}>
            <span className="text-sm text-theme-text-secondary">{display(day.percent)}</span>
            <span className="flex h-32 w-[70%] items-end overflow-hidden rounded-lg bg-theme-border/80"><span className="w-full bg-theme-accent" style={{ height: `${day.percent ?? 0}%` }} /></span>
            <span className={day.date === today ? 'text-sm font-semibold text-theme-accent' : 'text-sm text-theme-text-secondary'}>{format(parseISO(day.date), 'd')}</span>
            <span className={day.date === today ? 'text-sm font-semibold text-theme-accent' : 'text-sm text-theme-text-secondary'}>{day.date === today ? '오늘' : format(parseISO(day.date), 'eee', { locale: ko })}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-theme-border pt-5">
        <div><p>이전 7일 평균</p><p className="text-sm text-theme-text-secondary">{format(parseISO(previous[0].date), 'M.d')} ~ {format(parseISO(previous[6].date), 'M.d')}</p>{previousEligible.length < 7 && <p className="text-sm text-theme-text-secondary">{previousEligible.length ? `${previousEligible.length}일 기준` : '집계할 일반 습관이 없어요'}</p>}</div>
        <strong className="text-xl text-theme-text-secondary">{display(previousAverage)}</strong>
      </div>
      <div className='flex-col'>
        <InfoNotice>습관이 있었던 날의 완료율을 평균으로 계산해요.</InfoNotice>
        <InfoNotice>자유 기록은 실천율에 포함하지 않아요.</InfoNotice>
      </div>
    </section>
  );
};

export default HabitFlow;
