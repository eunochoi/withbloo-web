'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarDay } from '@/common/components/ui/Calendar/CalendarDay';
import { CalendarGrid } from '@/common/components/ui/Calendar/CalendarGrid';
import CalendarHeader from '@/common/components/ui/Calendar/CalendarHeader';
import { useMonthCalendar } from '@/common/components/ui/Calendar/useMonthCalendar';
import { useMonthSwipe } from '@/common/components/ui/Calendar/useMonthSwipe';
import { PanelDialog } from '@/common/components/ui/Dialog/PanelDialog';
import { PanelHeader } from '@/common/components/ui/Dialog/PanelDialog/PanelHeader';
import { PanelBody } from '@/common/components/ui/Dialog/PanelDialog/PanelBody';
import { PanelFooter } from '@/common/components/ui/Dialog/PanelDialog/PanelFooter';
import { PanelSubmitButton } from '@/common/components/ui/Dialog/PanelDialog/PanelSubmitButton';
import { SoberIcon } from './SoberIcon';
import type { SoberWithRestarts } from './types';

export default function SoberRestartForm({ item, editing, initialValue, initialMemo, saving, onClose, onSave }: {
  item: SoberWithRestarts; editing: boolean; initialValue: string; initialMemo: string; saving: boolean; onClose: () => void; onSave: (value: string, memo: string) => Promise<void>;
}) {
  const [date, setDate] = useState(initialValue.slice(0, 10));
  const [hour, setHour] = useState(initialValue.slice(11, 13));
  const [minute, setMinute] = useState(initialValue.slice(14, 16));
  const [memo, setMemo] = useState(initialMemo);
  const [error, setError] = useState('');
  const today = format(new Date(), 'yyyy-MM-dd');
  const calendar = useMonthCalendar(date, { minDate: format(new Date(item.initialStartedAt), 'yyyy-MM-dd'), maxDate: today });
  const swipe = useMonthSwipe(calendar.goPreviousMonth, calendar.goNextMonth);
  const recorded = new Set(item.restarts.map((entry) => format(new Date(entry.restartedAt), 'yyyy-MM-dd')));
  const save = async () => {
    const local = `${date}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    const time = new Date(local).getTime();
    if (!/^\d{1,2}$/.test(hour) || !/^\d{1,2}$/.test(minute) || Number(hour) > 23 || Number(minute) > 59 || !Number.isFinite(time) || format(new Date(time), "yyyy-MM-dd'T'HH:mm") !== local || time > Date.now()) {
      setError('현재 또는 과거 날짜와 시간을 선택해주세요.');
      return;
    }
    if (time < new Date(item.initialStartedAt).getTime()) { setError('시작 시각 이후에 기록해주세요.'); return; }
    setError('');
    await onSave(local, memo);
  };
  const title = editing ? '다시 시작 기록 수정' : '다시 시작 기록 추가';
  return <PanelDialog ariaLabel={title} dismissible={!saving} onClose={onClose}>
    <PanelHeader title={title} />
    <PanelBody showScrollFade><fieldset disabled={saving} className="m-0 flex min-w-0 flex-col gap-5 border-0 pb-6 pt-4">
      <CalendarHeader monthLabel={calendar.monthLabel} canGoPrevious={calendar.canGoPrevious} canGoNext={calendar.canGoNext} onPreviousMonth={calendar.goPreviousMonth} onNextMonth={calendar.goNextMonth} onToday={() => calendar.showDate(today)} centerTitle />
      <CalendarGrid {...swipe} aria-label="다시 시작 날짜 선택">{calendar.days.map((day) => {
        const available = calendar.isDateAvailable(day.dateKey);
        const hasRecord = available && !day.isOutsideMonth && recorded.has(day.dateKey);
        return <CalendarDay key={day.dateKey} day={day} isToday={day.dateKey === today} isSelected={day.dateKey === date} showTodayIndicator={false} label={`${day.dateKey}${hasRecord ? ', 다시 시작한 날' : ''}`} className={!available ? 'opacity-30' : undefined} onClick={available ? () => { setDate(day.dateKey); calendar.showDate(day.dateKey); setError(''); } : undefined}><span className={`flex h-8 w-8 items-center justify-center rounded-full text-base ${day.dateKey === date ? 'bg-theme-accent text-theme-text-on-accent' : ''}`}>{day.dayNumber}</span>{hasRecord && <SoberIcon name={item.iconKey} color={item.iconColor} className="h-5 w-5" />}</CalendarDay>;
      })}</CalendarGrid>
      <div className="flex items-center justify-center gap-3"><input aria-label="시 (0~23)" inputMode="numeric" maxLength={2} value={hour} onChange={(event) => { setHour(event.target.value); setError(''); }} className="h-12 w-16 rounded-2xl border border-theme-border bg-transparent text-center text-lg" /><span>:</span><input aria-label="분 (0~59)" inputMode="numeric" maxLength={2} value={minute} onChange={(event) => { setMinute(event.target.value); setError(''); }} className="h-12 w-16 rounded-2xl border border-theme-border bg-transparent text-center text-lg" /></div>
      <label className="flex flex-col gap-2 text-base">메모 (선택)<textarea aria-label="다시 시작 메모" value={memo} maxLength={500} onChange={(event) => { setMemo(event.target.value); setError(''); }} placeholder="다시 시작하는 이유나 지금의 생각을 남겨보세요." className="h-28 resize-none rounded-2xl border border-theme-border bg-transparent p-4 text-base placeholder:text-theme-text-tertiary" /><span className="text-right text-xs text-theme-text-secondary">{memo.length} / 500</span></label>
      {error && <p role="alert" className="text-sm text-theme-danger">{error}</p>}
    </fieldset></PanelBody>
    <PanelFooter><PanelSubmitButton type="button" disabled={saving} aria-busy={saving} onClick={() => void save()}>{saving ? '저장 중...' : editing ? '수정한 기록 저장하기' : '다시 시작 기록하기'}</PanelSubmitButton></PanelFooter>
  </PanelDialog>;
}
