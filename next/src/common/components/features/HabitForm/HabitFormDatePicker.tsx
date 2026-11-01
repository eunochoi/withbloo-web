import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarDay } from '@/common/components/ui/Calendar/CalendarDay';
import { CalendarGrid } from '@/common/components/ui/Calendar/CalendarGrid';
import CalendarHeader from '@/common/components/ui/Calendar/CalendarHeader';
import { useMonthSwipe } from '@/common/components/ui/Calendar/useMonthSwipe';
import { useMonthCalendar } from '@/common/components/ui/Calendar/useMonthCalendar';
import { isValidHabitStartedAt } from '@/common/functions/habitStats';
import HabitFormPicker from './HabitFormPicker';

const HabitFormDatePicker = ({ value, onApply, onClose, minDate, minDateTime, title = '언제부터 습관을 시작했나요?' }: { value: string; onApply: (value: string) => void; onClose: () => void; minDate?: string; minDateTime?: number; title?: string }) => {
  const [date, setDate] = useState(value.slice(0, 10));
  const [hour, setHour] = useState(value.slice(11, 13));
  const [minute, setMinute] = useState(value.slice(14, 16));
  const [error, setError] = useState('');
  const today = format(new Date(), 'yyyy-MM-dd');
  const calendar = useMonthCalendar(date, { minDate, maxDate: today });
  const swipeProps = useMonthSwipe(calendar.goPreviousMonth, calendar.goNextMonth);
  const apply = () => {
    const local = `${date}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    const parsed = new Date(local);
    if (!/^\d{1,2}$/.test(hour) || !/^\d{1,2}$/.test(minute) || Number(hour) > 23 || Number(minute) > 59) {
      setError('시간은 0~23시, 분은 0~59분으로 입력해주세요.');
      return;
    }
    if (!Number.isFinite(parsed.getTime()) || format(parsed, "yyyy-MM-dd'T'HH:mm") !== local || !isValidHabitStartedAt(parsed.toISOString())) {
      setError('1900년 이후의 현재 또는 과거 날짜와 시간을 선택해주세요.');
      return;
    }
    if (minDateTime !== undefined && parsed.getTime() < minDateTime) {
      setError('시작 일시 이후로 선택해주세요.');
      return;
    }
    onApply(local);
  };
  return <HabitFormPicker id="habit-date-picker-title" title={title} onClose={onClose} onApply={apply}>
    <div className="space-y-5">
      <CalendarHeader monthLabel={calendar.monthLabel} onPreviousMonth={calendar.goPreviousMonth} onNextMonth={calendar.goNextMonth} onToday={() => calendar.showDate(today)} canGoPrevious={calendar.canGoPrevious} canGoNext={calendar.canGoNext} centerTitle />
      <CalendarGrid {...swipeProps} aria-label="습관 시작 날짜 선택">
        {calendar.days.map((day) => {
          const available = calendar.isDateAvailable(day.dateKey);
          return <CalendarDay key={day.dateKey} day={day} isToday={day.dateKey === today} isSelected={day.dateKey === date} showTodayIndicator={false} className={!available ? 'opacity-30' : undefined}
            onClick={available ? () => { setDate(day.dateKey); calendar.showDate(day.dateKey); setError(''); } : undefined}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-full text-base ${day.dateKey === date ? 'bg-theme-accent text-theme-text-on-accent' : ''}`}>{day.dayNumber}</span>
          </CalendarDay>;
        })}
      </CalendarGrid>
      <div className="flex items-center justify-center gap-3">
        <input aria-label="시 입력" inputMode="numeric" maxLength={2} value={hour} onChange={(event) => { setHour(event.target.value); setError(''); }} className="h-12 w-16 rounded-2xl border border-theme-border bg-transparent text-center text-lg" />
        <span>:</span>
        <input aria-label="분 입력" inputMode="numeric" maxLength={2} value={minute} onChange={(event) => { setMinute(event.target.value); setError(''); }} className="h-12 w-16 rounded-2xl border border-theme-border bg-transparent text-center text-lg" />
      </div>
      {error && <p role="alert" className="text-sm text-theme-danger">{error}</p>}
    </div>
  </HabitFormPicker>;
};

export default HabitFormDatePicker;
