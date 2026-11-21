import { DateSelectionCalendar } from '@/common/components/ui/DateSelectionCalendar';
import { DateSelectionForm } from '@/common/components/ui/DateSelectionForm';
import { useState } from 'react';
import { format } from 'date-fns';
import { useMonthCalendar } from '@/common/components/ui/Calendar/useMonthCalendar';
import { isValidHabitStartedAt } from '@/common/functions/habitStats';
import HabitFormPicker from './HabitFormPicker';

const HabitFormDatePicker = ({
  value,
  onApply,
  onClose,
  minDate,
  minDateTime,
}: {
  value: string;
  onApply: (value: string) => void;
  onClose: () => void;
  minDate?: string;
  minDateTime?: number;
}) => {
  const [date, setDate] = useState(value.slice(0, 10));
  const [hour, setHour] = useState(value.slice(11, 13));
  const [minute, setMinute] = useState(value.slice(14, 16));
  const [error, setError] = useState('');
  const today = format(new Date(), 'yyyy-MM-dd');
  const calendar = useMonthCalendar(date, { minDate, maxDate: today });
  const apply = () => {
    const local = `${date}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    const parsed = new Date(local);
    if (
      !/^\d{1,2}$/.test(hour) ||
      !/^\d{1,2}$/.test(minute) ||
      Number(hour) > 23 ||
      Number(minute) > 59
    ) {
      setError('시간은 0~23시, 분은 0~59분으로 입력해주세요.');
      return;
    }
    if (
      !Number.isFinite(parsed.getTime()) ||
      format(parsed, "yyyy-MM-dd'T'HH:mm") !== local ||
      !isValidHabitStartedAt(parsed.toISOString())
    ) {
      setError('1900년 이후의 현재 또는 과거 날짜와 시간을 선택해주세요.');
      return;
    }
    if (minDateTime !== undefined && parsed.getTime() < minDateTime) {
      setError('시작 일시 이후로 선택해주세요.');
      return;
    }
    onApply(local);
  };
  return (
    <HabitFormPicker
      fixedHeight
      id="habit-date-picker-title"
      title="시간 선택"
      onClose={onClose}
      onApply={apply}
    >
      <div className="space-y-5">
        <DateSelectionForm date={date} hour={hour} minute={minute} onTimeChange={(value) => { setHour(value.hour); setMinute(value.minute); setError(''); }}>
        <DateSelectionCalendar calendar={calendar} selected={date} today={today} onSelect={(date) => { setDate(date); setError(''); }}  />
        </DateSelectionForm>
        {error && (
          <p role="alert" className="text-sm text-theme-danger">
            {error}
          </p>
        )}
      </div>
    </HabitFormPicker>
  );
};

export default HabitFormDatePicker;
