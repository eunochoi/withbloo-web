'use client';

import ScrollableName from '@/common/components/ui/ScrollableName';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { authAction } from '@/common/auth/authAction';
import { deleteSoberRestart, saveSoberRestart } from '@/common/actions/sober';
import {
  formatSoberDuration,
  formatSoberGoal,
  getSoberSummary,
} from '@/common/functions/sober';
import { getTodayString } from '@/common/functions/getTodayString';
import { CalendarDay } from '@/common/components/ui/Calendar/CalendarDay';
import { CalendarGrid } from '@/common/components/ui/Calendar/CalendarGrid';
import CalendarHeader from '@/common/components/ui/Calendar/CalendarHeader';
import { useMonthCalendar } from '@/common/components/ui/Calendar/useMonthCalendar';
import { useMonthSwipe } from '@/common/components/ui/Calendar/useMonthSwipe';
import { PanelDialog } from '@/common/components/ui/Dialog/PanelDialog';
import { PanelHeader } from '@/common/components/ui/Dialog/PanelDialog/PanelHeader';
import { PanelBody } from '@/common/components/ui/Dialog/PanelDialog/PanelBody';
import { PickerDialog } from '@/common/components/ui/Dialog/PickerDialog';
import { ConfirmDialog } from '@/common/components/ui/Dialog/ConfirmDialog';
import { showNotice } from '@/common/components/ui/Notice/notice';
import SoberRestartForm from './SoberRestartForm';
import { useItemAccent } from '@/common/hooks/useItemAccent';
import {
  AddIcon,
  MoreIcon,
  AchievementIcon,
  DescriptionIcon,
} from '@/common/constants/appIcons';
import SoberMenu from './SoberMenu';
import SoberInfoCarousel from './SoberInfoCarousel';
import SoberMemos from './SoberMemos';
import { SoberIcon } from './SoberIcon';
import type { SoberWithRestarts } from './types';

const localInput = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
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
  const query = useQueryClient();
  const today = getTodayString();
  const startDay = format(new Date(item.initialStartedAt), 'yyyy-MM-dd');
  const calendar = useMonthCalendar(today, {
    minDate: startDay,
    maxDate: today,
  });
  const swipe = useMonthSwipe(calendar.goPreviousMonth, calendar.goNextMonth);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null | undefined>(undefined);
  const [restartAt, setRestartAt] = useState(localInput(new Date()));
  const [memo, setMemo] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [hoursOnly, setHoursOnly] = useState(false);
  const [recordMenu, setRecordMenu] = useState<number | null>(null);
  const [expandedRecords, setExpandedRecords] = useState(false);
  const [memosOpen, setMemosOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const pendingDelete = useRef<number | null>(null);
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
  const openRestart = (id?: number, day?: string) => {
    const record = item.restarts.find((entry) => entry.id === id);
    setEditing(id ?? null);
    setRestartAt(
      record
        ? localInput(new Date(record.restartedAt))
        : day
          ? `${day}T${day === today ? localInput(new Date()).slice(11) : '12:00'}`
          : localInput(new Date()),
    );
    setMemo(record?.memo ?? '');
  };
  const save = async (value: string, note: string) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await authAction(() =>
        saveSoberRestart({
          id: editing ?? undefined,
          soberId: item.id,
          restartedAt: new Date(value).toISOString(),
          memo: note,
        }),
      );
      await query.invalidateQueries({ queryKey: ['sober'] });
      setEditing(undefined);
      showNotice(
        editing ? '다시 시작 기록을 수정했어요' : '다시 시작 기록을 추가했어요',
      );
    } catch (error) {
      showNotice(error instanceof Error ? error.message : '저장하지 못했어요.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  const remove = async () => {
    const target = pendingDelete.current;
    pendingDelete.current = null;
    try {
      if (typeof target === 'number')
        await authAction(() => deleteSoberRestart(item.id, target));
      await query.invalidateQueries({ queryKey: ['sober'] });
      showNotice('다시 시작 기록을 삭제했어요');
    } catch (error) {
      showNotice(error instanceof Error ? error.message : '삭제하지 못했어요.');
    }
  };
  return (
    <>
      <PanelDialog
        handleColor={accent}
        ariaLabel="거리두기 상세 정보"
        onClose={onClose}
      >
        <PanelHeader
          title="상세 정보"
          rightAction={
            <SoberMenu
              id={item.id}
              name={item.name}
              onEdit={onEdit}
              onDeleted={onClose}
            />
          }
        />
        <PanelBody showScrollFade>
          <div className="flex flex-col gap-8 pb-8 pt-2">
            <div className="flex flex-col gap-7">
              <div className="flex flex-col items-center gap-3 pt-2">
                <SoberIcon
                  name={item.iconKey}
                  color={item.iconColor}
                  className="h-16 w-16"
                />
                <h2 className="w-full min-w-0 text-center text-xl font-semibold">
                  <ScrollableName name={item.name} />
                </h2>
              </div>
              <div className="flex w-full flex-col gap-7 px-1">
                <SoberInfoCarousel
                  color={accent}
                  pages={[
                    <div
                      key="current"
                      className="flex w-full flex-col items-center gap-0.5 text-center"
                    >
                      <p className="text-sm text-theme-text-secondary">
                        현재 진행중인 시간
                      </p>
                      <button
                        type="button"
                        aria-label="현재 진행중인 시간"
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
                  <p className="w-[90%] self-center whitespace-pre-wrap text-center text-base leading-relaxed text-theme-text-secondary">
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
                    className="h-4 overflow-hidden rounded-full bg-theme-border/80"
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
              </div>
              <div className="flex flex-col gap-3 px-1">
                <button
                  type="button"
                  onClick={() => openRestart()}
                  className="min-h-12 rounded-full border border-black/10 text-theme-surface"
                  style={{ backgroundColor: accent }}
                >
                  다시 시작하기
                </button>
                <button
                  type="button"
                  onClick={() => setMemosOpen(true)}
                  className="min-h-12 rounded-full border border-theme-text-secondary/10 bg-theme-surface-muted"
                >
                  기록보기
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
                                setSelectedDay(day.dateKey);
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
                      </CalendarDay>
                    );
                  })}
                </CalendarGrid>
              </div>
            </section>
            <section className="space-y-4 border-t border-theme-border/50 pt-8">
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
        </PanelBody>
      </PanelDialog>
      <AnimatePresence>
        {selectedDay && editing === undefined && (
          <PanelDialog
            ariaLabel={selectedDay}
            onClose={() => setSelectedDay(null)}
          >
            <PanelHeader
              title={format(new Date(`${selectedDay}T12:00`), 'yyyy년 M월 d일')}
            />
            <PanelBody>
              <div className="flex flex-col gap-3 pb-8 pt-4">
                <button
                  type="button"
                  onClick={() => openRestart(undefined, selectedDay)}
                  aria-label="이 날짜에 다시 시작 기록 추가"
                  className="flex min-h-11 items-center gap-1 self-end text-sm text-theme-accent"
                >
                  <AddIcon />
                  기록 추가
                </button>
                {summary.achievements
                  .filter(
                    (achievement) =>
                      format(new Date(achievement.achievedAt), 'yyyy-MM-dd') ===
                      selectedDay,
                  )
                  .map((achievement) => (
                    <div
                      key={`${achievement.days}-${achievement.achievedAt}`}
                      className="flex items-center gap-3 rounded-2xl border border-theme-border/50 p-4"
                    >
                      <AchievementIcon className="text-2xl text-theme-accent" />
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {achievement.days}일 달성!
                        </p>
                        <p className="text-sm text-theme-text-tertiary">
                          {format(new Date(achievement.achievedAt), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                {(dates[selectedDay] ?? []).map((record) => (
                  <div
                    key={record.id}
                    className="space-y-2 rounded-2xl border border-theme-border/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p>{format(new Date(record.restartedAt), 'HH:mm')}</p>
                      <button
                        type="button"
                        aria-label={`${format(new Date(record.restartedAt), 'HH:mm')} 다시 시작 기록 메뉴`}
                        onClick={() => setRecordMenu(record.id)}
                        className="-mr-5 flex h-11 w-11 items-center justify-center text-xl text-theme-text-secondary"
                      >
                        <MoreIcon />
                      </button>
                    </div>
                    {record.memo && (
                      <p className="whitespace-pre-wrap text-sm tracking-tighter text-theme-text-secondary">
                        {record.memo}
                      </p>
                    )}
                  </div>
                ))}
                {!dates[selectedDay]?.length &&
                  !summary.achievements.some(
                    (achievement) =>
                      format(new Date(achievement.achievedAt), 'yyyy-MM-dd') ===
                      selectedDay,
                  ) && (
                    <div className="flex flex-col items-center gap-3 pt-8">
                      <DescriptionIcon className="text-2xl text-theme-accent" />
                      <p className="text-center">
                        이날은 다시 시작한 기록이 없어요.
                      </p>
                    </div>
                  )}
              </div>
            </PanelBody>
          </PanelDialog>
        )}
        {editing !== undefined && (
          <SoberRestartForm
            key={editing ?? 'new'}
            item={item}
            editing={editing !== null}
            initialValue={restartAt}
            initialMemo={memo}
            saving={saving}
            onClose={() => setEditing(undefined)}
            onSave={save}
          />
        )}
        {recordMenu !== null && (
          <PickerDialog
            labelledBy="sober-record-menu"
            onClose={() => setRecordMenu(null)}
          >
            <div className="flex flex-col gap-6 pb-6">
              <h2
                id="sober-record-menu"
                className="text-center text-lg font-semibold"
              >
                다시 시작 기록
              </h2>
              <button
                type="button"
                onClick={() => {
                  openRestart(recordMenu);
                  setRecordMenu(null);
                }}
                className="flex min-h-16 flex-col gap-1 rounded-2xl border border-theme-border/50 p-4 text-left"
              >
                <span className="font-semibold">기록 수정하기</span>
                <span className="text-sm text-theme-text-secondary">
                  일시와 메모를 바꿔요.
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleting(recordMenu);
                  setRecordMenu(null);
                }}
                className="flex min-h-16 flex-col gap-1 rounded-2xl border border-theme-border/50 p-4 text-left"
              >
                <span className="font-semibold text-theme-danger">
                  기록 삭제하기
                </span>
                <span className="text-sm text-theme-text-secondary">
                  이 재시작 기록을 삭제해요.
                </span>
              </button>
            </div>
          </PickerDialog>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {memosOpen && (
          <SoberMemos
            soberId={item.id}
            name={item.name}
            onClose={() => setMemosOpen(false)}
            onMenu={(id) => setRecordMenu(id)}
          />
        )}
      </AnimatePresence>
      <ConfirmDialog
        isOpen={deleting !== null}
        title="기록을 삭제하시겠어요?"
        message="이 다시 시작 기록과 메모가 삭제되고, 경과 시간과 통계가 다시 계산돼요. 삭제한 뒤에는 되돌릴 수 없어요."
        confirmLabel="삭제하기"
        danger
        onClose={() => {
          pendingDelete.current = deleting;
          setDeleting(null);
        }}
        onConfirm={() => void remove()}
      />
    </>
  );
};
