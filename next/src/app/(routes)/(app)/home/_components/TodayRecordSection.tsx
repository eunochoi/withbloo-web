'use client';

import { DiaryIcon, HabitIcon, SoberIcon } from '@/common/constants/appIcons';

import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { authAction } from '@/common/auth/authAction';
import EmotionImage from '@/common/components/ui/EmotionImage';
import { EMOTIONS } from '@/common/constants/emotions';
import { resolveHabitIconColor } from '@/common/constants/habitIconColors';
import { getTodayString } from '@/common/functions/getTodayString';
import {
  getSoberSummary,
  SOBER_DAY_MS,
  sortSobers,
} from '@/common/functions/sober';
import { diaryQueries } from '@/common/queries/diaryQueries';
import { habitQueries } from '@/common/queries/habitQueries';
import { soberQueries } from '@/common/queries/soberQueries';

const itemClass =
  'flex min-w-0 flex-col items-center gap-2 px-2 text-center text-sm desktop:text-base text-theme-text-secondary transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent';

const TodayRecordSection = ({ initialDate }: { initialDate: string }) => {
  const [today, setToday] = useState(initialDate);
  const [now, setNow] = useState(Date.now());
  const [soberSort, setSoberSort] = useState<{
    sort?: string;
    priorityFirst?: boolean;
    recordSort?: string;
  }>({});
  const router = useRouter();
  useEffect(() => {
    try {
      setSoberSort(JSON.parse(localStorage.getItem('took:sober-sort') ?? '{}'));
    } catch {}
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncToday = () => setToday(getTodayString());
    syncToday();
    const interval = window.setInterval(syncToday, 30_000);
    window.addEventListener('focus', syncToday);
    document.addEventListener('visibilitychange', syncToday);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', syncToday);
      document.removeEventListener('visibilitychange', syncToday);
    };
  }, []);

  const diaryQuery = useQuery({ ...diaryQueries.byDate(today, authAction) });
  const soberQuery = useQuery(soberQueries.list(authAction));
  const sober = sortSobers(soberQuery.data ?? [], soberSort, now)[0];
  const soberDays = sober
    ? Math.floor(
        getSoberSummary(sober, sober.restarts, now).current.duration /
          SOBER_DAY_MS,
      ) + 1
    : null;
  const habitQuery = useQuery({ ...habitQueries.todayStat(authAction, today) });
  const completed = habitQuery.data?.todayDoneHabits ?? 0;
  const freeCount = habitQuery.data?.excludedCompleted ?? 0;
  const total = habitQuery.data?.createdHabits ?? 0;
  const progress = total > 0 ? Math.min(1, Math.max(0, completed / total)) : 0;
  const progressColor =
    progress >= 0.75 ? '#7BBDAD' : progress >= 0.25 ? '#EFBE48' : '#E599A5';
  const diary = diaryQuery.data ?? null;
  const emotion = diary ? EMOTIONS[diary.emotion] : undefined;

  return (
    <div className="grid grid-cols-3 desktop:grid-cols-4 rounded-2xl border border-theme-accent/20 bg-theme-surface py-4 desktop:py-6">
      <div className="hidden min-w-0 flex-col items-center gap-2 px-2 text-center text-sm text-theme-text-secondary desktop:flex desktop:text-base">
        <span className="font-semibold tracking-tighter">
          {format(parseISO(today), 'EEEE', { locale: ko })}
        </span>
        <span className="flex h-16 w-full items-center justify-center">
          <span className="text-2xl desktop:text-3xl font-bold leading-tight text-theme-text-primary">
            {Number(today.slice(5, 7))}월 {Number(today.slice(8, 10))}일
          </span>
        </span>
        <span>{today.slice(0, 4)}년</span>
      </div>
      <button
        type="button"
        className={`${itemClass} desktop:border-l desktop:border-theme-accent/20`}
        disabled={diaryQuery.isPending || diaryQuery.isError}
        onClick={() =>
          router.push(
            diary ? `/diary/${diary.id}` : `/diary/new?date=${today}`,
            { scroll: false },
          )
        }
      >
        <span className="font-semibold tracking-tighter">오늘의 일기</span>
        <span
          className="flex h-16 items-center justify-center"
          aria-hidden="true"
        >
          {diaryQuery.isPending ? (
            <span className="h-14 w-14 animate-pulse rounded-full bg-theme-skeleton motion-reduce:animate-none" />
          ) : emotion ? (
            <EmotionImage
              emotion={emotion}
              iconStyle="basic"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12"
            />
          ) : (
            <DiaryIcon className="text-5xl text-theme-text-disabled" />
          )}
        </span>
        <span aria-live="polite">
          {diaryQuery.isPending
            ? '확인 중'
            : diaryQuery.isError
              ? '불러오기 실패'
              : emotion
                ? `'${emotion.nameKr}' 기록 남김`
                : '기록 없음'}
        </span>
      </button>
      <button
        type="button"
        className={`${itemClass} border-l border-theme-accent/20`}
        onClick={() => router.push('/habit')}
      >
        <span className="font-semibold tracking-tighter">오늘의 습관</span>
        <span
          className="flex h-16 items-center justify-center"
          aria-hidden="true"
        >
          {habitQuery.isPending ? (
            <span className="h-14 w-14 animate-pulse rounded-full bg-theme-skeleton motion-reduce:animate-none" />
          ) : habitQuery.isError ? (
            <HabitIcon className="text-5xl text-theme-text-disabled" />
          ) : (
            <span className="relative flex h-14 w-14 items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 h-full w-full -rotate-90"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45.5"
                  fill="none"
                  stroke="rgb(var(--theme-border))"
                  strokeWidth="9"
                />
                {progress > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="45.5"
                    fill="none"
                    stroke={progressColor}
                    strokeWidth="9"
                    strokeLinecap="round"
                    pathLength="100"
                    strokeDasharray={`${progress * 100} 100`}
                  />
                )}
              </svg>
              <span className="text-base desktop:text-lg font-semibold text-theme-text-primary">
                {total > 0 ? `${completed}/${total}` : '—'}
              </span>
            </span>
          )}
        </span>
        <span aria-live="polite">
          {habitQuery.isPending
            ? '확인 중'
            : habitQuery.isError
              ? '불러오기 실패'
              : total === 0
                ? freeCount
                  ? `${freeCount}건 자유 기록`
                  : '습관을 추가해 보세요'
                : completed >= total
                  ? '완료'
                  : `${Math.round(progress * 100)}%`}
        </span>
      </button>
      <button
        type="button"
        className={`${itemClass} border-l border-theme-accent/20`}
        onClick={() => router.push(sober ? `/sober/${sober.id}` : '/sober')}
      >
        <span className="font-semibold tracking-tighter">거리두기</span>
        <span className="flex h-16 w-full items-center justify-center">
          {soberQuery.isPending ? (
            <span className="h-14 w-14 animate-pulse rounded-full bg-theme-skeleton motion-reduce:animate-none" />
          ) : sober && !soberQuery.isError ? (
            <span
              className="whitespace-nowrap text-2xl desktop:text-3xl font-bold leading-tight"
              style={{ color: resolveHabitIconColor(sober.iconColor) }}
            >
              {soberDays}<span className="text-sm desktop:text-base font-normal text-theme-text-secondary">일차</span>
            </span>
          ) : (
            <SoberIcon
              className="text-5xl text-theme-text-disabled"
              aria-hidden="true"
            />
          )}
        </span>
        <span aria-live="polite">
          {soberQuery.isPending
            ? '확인 중'
            : soberQuery.isError
              ? '불러오기 실패'
              : sober
                ? sober.name
                : '기록 없음'}
        </span>
      </button>
    </div>
  );
};

export default TodayRecordSection;
