import { differenceInCalendarDays, format } from 'date-fns';
import { parseLocalDate } from '@/common/utils/date/parseLocalDate';
import SoberInfoCarousel from '../Sober/SoberInfoCarousel';

export function HabitInfoCarousel({ free, today, latestDate, month, year, color }: {
  free: boolean;
  today: string;
  latestDate?: string | null;
  month?: { completedCount: number; targetDays: number; completionRate: number | null; averageInterval: number | null };
  year?: { completed: number; missed: number | null; rate: number | null };
  color: string;
}) {
  const validLatest = latestDate && latestDate <= today ? latestDate : null;
  const daysAgo = validLatest ? differenceInCalendarDays(parseLocalDate(today), parseLocalDate(validLatest)) : null;
  const label = free ? '최근 기록' : '이번 달 실천 횟수';
  const secondLabel = free ? '이번 달 기록' : '올해 실천 횟수';
  const value = free ? validLatest ? format(parseLocalDate(validLatest), 'yy년 M월 d일') : '아직 기록이 없어요.' : month ? `${month.completedCount}회 / ${month.targetDays}일` : '—';
  const subtitle = free ? validLatest ? daysAgo === 0 ? '오늘' : `${daysAgo}일 전` : ''
    : `${Number(today.slice(0, 4))}년 ${Number(today.slice(5, 7))}월 · 실천율 ${month?.completionRate == null ? '—' : `${month.completionRate.toFixed(1)}%`}`;
  const stats = free
    ? [{ label: '이번 달 기록', value: month ? `${month.completedCount}회` : '—' }, { label: '평균 기록 주기', value: month?.averageInterval == null ? '—' : `${Number(month.averageInterval.toFixed(1))}일` }]
    : [{ label: '올해 실천 횟수', value: year && year.missed !== null ? `${year.completed}회 / ${year.completed + year.missed}일` : '—' }, { label: '올해 실천율', value: year?.rate == null ? '—' : `${year.rate.toFixed(1)}%` }];
  return <SoberInfoCarousel color={color} labels={[label, secondLabel]} pages={[
    <div key="current" className="flex w-full flex-col items-center gap-0.5 text-center">
      <p className="text-sm text-theme-text-secondary">{label}</p>
      <p className="flex min-h-12 w-full items-center justify-center text-3xl font-bold leading-tight">{value}</p>
      <p className="text-sm text-theme-text-secondary">{subtitle}</p>
    </div>,
    <div key="summary" className="grid w-full grid-cols-2">
      {stats.map((stat) => <div key={stat.label} className="flex min-w-0 flex-col items-center gap-1 px-2 text-center">
        <p className="text-base font-semibold">{stat.label}</p><p className="text-base font-medium tracking-tighter">{stat.value}</p>
      </div>)}
    </div>,
  ]} />;
}
