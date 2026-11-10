import type { ReactNode } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TodayIcon } from '@/common/constants/appIcons';

export function DateSelectionForm({ date, hour, minute, onTimeChange, children }: {
  date: string;
  hour?: string;
  minute?: string;
  onTimeChange?: (value: { hour: string; minute: string }) => void;
  children: ReactNode;
}) {
  const parsed = parseISO(date);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 rounded-2xl bg-theme-surface-muted p-4">
        <TodayIcon size="1.5rem" className="text-theme-accent" aria-hidden="true" />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-lg font-semibold">{isValid(parsed) ? format(parsed, 'yyyy년 M월 d일 (eee)', { locale: ko }) : '날짜를 선택해주세요.'}</p>
          {hour !== undefined && <p className="text-base text-theme-text-secondary">{hour}:{minute}</p>}
        </div>
      </div>
      {children}
      {hour !== undefined && minute !== undefined && onTimeChange && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-semibold">시간</span>
          <div className="flex items-center gap-3">
            <input aria-label="시 입력" inputMode="numeric" maxLength={2} value={hour}
              onChange={(event) => onTimeChange({ hour: event.target.value, minute })}
              className="h-12 w-16 rounded-2xl border border-theme-border bg-transparent text-center text-lg" />
            <span>:</span>
            <input aria-label="분 입력" inputMode="numeric" maxLength={2} value={minute}
              onChange={(event) => onTimeChange({ hour, minute: event.target.value })}
              className="h-12 w-16 rounded-2xl border border-theme-border bg-transparent text-center text-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
