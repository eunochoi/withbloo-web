'use client';

import ActivityRecordListModal from '../ActivityRecords/ActivityRecordListModal';
import ActivityRecordFormModal from '../ActivityRecords/ActivityRecordFormModal';
import type { ActivityRecord } from '@/common/actions/records';

import ScrollableName from '@/common/components/ui/ScrollableName';

import { getActivityDates } from '@/common/actions/records';
import { authAction } from '@/common/auth/authAction';
import { BottomSheet } from '@/common/components/ui/BottomSheet/BottomSheet';
import { BottomSheetBody } from '@/common/components/ui/BottomSheet/BottomSheetBody';
import { BottomSheetTitle } from '@/common/components/ui/BottomSheet/BottomSheetTitle';
import { CalendarDay } from '@/common/components/ui/Calendar/CalendarDay';
import { CalendarGrid } from '@/common/components/ui/Calendar/CalendarGrid';
import CalendarHeader from '@/common/components/ui/Calendar/CalendarHeader';
import { useMonthCalendar } from '@/common/components/ui/Calendar/useMonthCalendar';
import { useMonthSwipe } from '@/common/components/ui/Calendar/useMonthSwipe';
import {
  AchievementIcon
} from '@/common/constants/appIcons';
import { getTodayString } from '@/common/functions/getTodayString';
import {
  formatSoberDuration,
  formatSoberGoal,
  getSoberSummary,
} from '@/common/functions/sober';
import { useItemAccent } from '@/common/hooks/useItemAccent';
import { useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { useState } from 'react';
import { SoberIcon } from './SoberIcon';
import SoberInfoCarousel from './SoberInfoCarousel';
import SoberMenu from './SoberMenu';
import type { SoberWithRestarts } from './types';

export const SoberDetail = ({
  item,
  now,
  onClose,
  onEdit,
}: {
  item: SoberWithRestarts;
  now: number;
  onClose: () => void;
  onEdit: () => void;
}) => {
  const today = getTodayString();
  const startDay = format(new Date(item.initialStartedAt), 'yyyy-MM-dd');
  const calendar = useMonthCalendar(today, {
    minDate: startDay,
    maxDate: today,
  });
  const from = new Date(`${calendar.days[0].dateKey}T00:00:00`);
  const memoDates = useQuery({ queryKey: ['sober', 'memo-dates', item.id, calendar.visibleMonth], queryFn: () => authAction(() => getActivityDates('sober', item.id, from.toISOString(), addDays(from, 42).toISOString())) });
  const memoDays = new Set((memoDates.data ?? []).map((time) => format(new Date(time), 'yyyy-MM-dd')));
  const swipe = useMonthSwipe(calendar.goPreviousMonth, calendar.goNextMonth);
  const [hoursOnly, setHoursOnly] = useState(false);
  const [expandedRecords, setExpandedRecords] = useState(false);
  const [isRecordListOpen, setRecordListOpen] = useState(false);
  const [recordDay, setRecordDay] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState<{ record: Partial<ActivityRecord>; day: string | null } | null>(null);
  const summary = getSoberSummary(item, item.restarts, now);
  const itemAccent = useItemAccent(item.iconColor);
  const accent = itemAccent.color;
  const minutes = Math.floor(summary.current.duration / 60000);
  const durationText = hoursOnly
    ? `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`
    : formatSoberDuration(summary.current.duration);
  const achievementDays = new Set(
    summary.achievements.map((achievement) =>
      format(new Date(achievement.achievedAt), 'yyyy-MM-dd'),
    ),
  );
  const dates = item.restarts.reduce<Record<string, typeof item.restarts>>(
    (map, record) => {
      const key = format(new Date(record.restartedAt), 'yyyy-MM-dd');
      (map[key] ??= []).push(record);
      return map;
    },
    {},
  );
  return (
    <>
      <BottomSheet
        handleColor={accent}
        ariaLabel="거리두기 상세 정보"
        onClose={onClose}
      >
        <BottomSheetTitle
          title="상세 정보"
          headerButton={
            <SoberMenu
              id={item.id}
              name={item.name}
              onEdit={onEdit}
              onDeleted={onClose}
            />
          }
        />
        <BottomSheetBody showScrollFade>
          <div className="flex flex-col gap-8 pb-8">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center gap-3">
                <SoberIcon
                  name={item.iconKey}
                  color={item.iconColor}
                  className="h-16 w-16"
                />
                <h2 className="w-[90%] min-w-0 text-center text-xl font-semibold">
                  <ScrollableName name={item.name} />
                </h2>
              </div>
              <SoberInfoCarousel
                color={accent}
                pages={[
                  <div
                    key="current"
                    className="flex w-full flex-col items-center gap-0.5 text-center"
                  >
                    <p className="text-sm text-theme-text-secondary">
                      현재 거리두기 중
                    </p>
                    <button
                      type="button"
                      aria-label="현재 거리두기 중"
                      title="누르면 일·시간·분과 총 시간·분 표시를 전환해요."
                      onClick={() => setHoursOnly((value) => !value)}
                      className="min-h-12 w-full text-3xl font-bold leading-tight"
                    >
                      {durationText}
                    </button>
                    <p className="text-sm text-theme-text-secondary">
                      {format(
                        new Date(summary.current.start),
                        'yy년 M월 d일 HH:mm',
                      )}{' '}
                      시작
                    </p>
                  </div>,
                  <div key="summary" className="grid w-full grid-cols-2">
                    {[
                      {
                        label: '최고 기록',
                        value: formatSoberDuration(summary.longest),
                      },
                      {
                        label: '첫 시작일',
                        value: format(
                          new Date(item.initialStartedAt),
                          'yy년 M월 d일 HH:mm',
                        ),
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex min-w-0 flex-col items-center gap-1 px-2 text-center"
                      >
                        <p className="text-base font-semibold">
                          {stat.label}
                        </p>
                        <p className="text-base font-medium tracking-tighter">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>,
                ]}
              />
              {item.description?.trim() && (
                <p className="w-[90%] self-center whitespace-pre-wrap [overflow-wrap:anywhere] text-center text-base leading-relaxed text-theme-text-secondary">
                  {item.description}
                </p>
              )}
              <div className="flex w-[90%] flex-col gap-3 self-center">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="text-theme-text-secondary">
                    목표 {formatSoberGoal(summary.goalDays)}
                  </span>
                  <span
                    className="font-semibold"
                    style={{ color: itemAccent.text }}
                  >
                    {summary.progress.toFixed(0)}%
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`목표 ${formatSoberGoal(summary.goalDays)}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={summary.progress}
                  className="h-5 overflow-hidden rounded-full bg-theme-border/80"
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${summary.progress}%`,
                      backgroundColor: accent,
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 px-1">
                <button
                  type="button"
                  onClick={() => setRecordForm({ record: { type: 'RESTART' }, day: null })}
                  className="min-h-12 rounded-full border border-black/10 text-theme-surface"
                  style={{ backgroundColor: accent }}
                >
                  다시 시작
                </button>
                <button
                  type="button"
                  onClick={() => setRecordListOpen(true)}
                  className="min-h-12 rounded-full border border-theme-text-secondary/10 bg-theme-surface-muted"
                >
                  기록 모아보기
                </button>
              </div>
            </div>
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">월간 기록</h3>
              <div className="space-y-4 px-1">
                <CalendarHeader
                  monthLabel={calendar.monthLabel}
                  onPreviousMonth={calendar.goPreviousMonth}
                  onNextMonth={calendar.goNextMonth}
                  onToday={() => calendar.showDate(today)}
                  canGoPrevious={calendar.canGoPrevious}
                  canGoNext={calendar.canGoNext}
                  detail
                />
                <CalendarGrid {...swipe}>
                  {calendar.days.map((day) => {
                    const available = calendar.isDateAvailable(day.dateKey);
                    const restart =
                      available &&
                      !day.isOutsideMonth &&
                      !!dates[day.dateKey]?.length;
                    const achievement =
                      available &&
                      !day.isOutsideMonth &&
                      !restart &&
                      achievementDays.has(day.dateKey);
                    return (
                      <CalendarDay
                        key={day.dateKey}
                        day={day}
                        isToday={day.dateKey === today}
                        showTodayIndicator={false}
                        className={!available ? 'opacity-30' : 'font-medium'}
                        label={[
                          day.dateKey,
                          memoDays.has(day.dateKey) ? '기록 있음' : '',
                          restart
                            ? '다시 시작한 날'
                            : achievement
                              ? '목표 달성'
                              : available && !day.isOutsideMonth
                                ? '리셋 없이 지낸 날'
                                : '',
                        ]
                          .filter(Boolean)
                          .join(', ')}
                        onClick={
                          available
                            ? () => {
                              calendar.showDate(day.dateKey);
                              setRecordDay(day.dateKey);
                            }
                            : undefined
                        }
                      >
                        {restart ? (
                          <SoberIcon
                            name={item.iconKey}
                            color={item.iconColor}
                            className="h-8 w-8"
                          />
                        ) : achievement ? (
                          <AchievementIcon className="text-2xl text-[#DCC17D]" />
                        ) : (
                          <span>{day.dayNumber}</span>
                        )}
                        {!day.isOutsideMonth && available && memoDays.has(day.dateKey) && <span aria-hidden="true" className="absolute bottom-1 h-1 w-1 rounded-full bg-theme-text-secondary" />}
                      </CalendarDay>
                    );
                  })}
                </CalendarGrid>
              </div>
            </section>
            <section className="space-y-4 border-t border-theme-border/30 pt-8">
              <h3 className="text-lg font-semibold">상위 기록</h3>
              <div className="px-1">
                {summary.records
                  .slice()
                  .sort((a, b) => b.duration - a.duration || a.start - b.start)
                  .slice(0, expandedRecords ? 20 : 5)
                  .map((record, index) => (
                    <div
                      key={`${record.start}-${index}`}
                      className="flex items-center gap-4 py-3"
                    >
                      <span
                        className="w-7 shrink-0 font-semibold"
                        style={{ color: itemAccent.text }}
                      >
                        {index + 1}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="font-semibold">
                          {formatSoberDuration(record.duration)}
                        </p>
                        <p
                          className="text-sm tracking-tighter text-theme-text-secondary"
                          style={
                            record.current
                              ? { color: itemAccent.text }
                              : undefined
                          }
                        >
                          {format(new Date(record.start), 'yy년 M월 d일 HH:mm')}{' '}
                          –{' '}
                          {record.current
                            ? '현재'
                            : format(
                              new Date(record.end),
                              'yy년 M월 d일 HH:mm',
                            )}
                        </p>
                      </div>
                    </div>
                  ))}
                {summary.records.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setExpandedRecords(!expandedRecords)}
                    aria-expanded={expandedRecords}
                    className="min-h-11 w-full text-sm"
                    style={{ color: accent }}
                  >
                    {expandedRecords ? '접기' : '기록 더보기'}
                  </button>
                )}
              </div>
            </section>
          </div>
        </BottomSheetBody>
      </BottomSheet>
      {isRecordListOpen && <ActivityRecordListModal scope="sober" parentId={item.id} name={item.name} day={null} onOpenForm={(record, day) => setRecordForm({ record, day })} onClose={() => setRecordListOpen(false)} />}
      {recordDay && <ActivityRecordListModal scope="sober" parentId={item.id} name={item.name} day={recordDay} achievements={summary.achievements} onOpenForm={(record, day) => setRecordForm({ record, day })} onClose={() => setRecordDay(null)} />}
      {recordForm && <ActivityRecordFormModal scope="sober" parentId={item.id} initialStartedAt={item.initialStartedAt} {...recordForm} onClose={() => setRecordForm(null)} />}
    </>
  );
};
