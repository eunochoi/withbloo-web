import type { HTMLAttributes } from 'react';

import { cn } from '@/common/utils/cn';

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

export const CalendarGrid = ({ children, className, daysClassName, ...props }: HTMLAttributes<HTMLDivElement> & { daysClassName?: string }) => (
  <div className={cn('w-full', className)} {...props}>
    <div className="mb-1.5 grid h-10 grid-cols-7 items-center text-center text-sm text-theme-text-secondary">
      {WEEKDAYS.map((weekday, index) => (
        <span
          key={weekday}
          className={cn(
            index === 5 && 'text-theme-calendar-saturday',
            index === 6 && 'text-theme-calendar-sunday',
          )}
        >
          {weekday}
        </span>
      ))}
    </div>
    <div className={cn("grid grid-cols-7 gap-1", daysClassName)}>
      {children}
    </div>
  </div>
);
