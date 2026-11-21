import { useState } from 'react';
import InfoNotice from '@/common/components/ui/InfoNotice';
import { SheetSectionHeading } from '@/common/components/ui/BottomSheet/SheetSectionHeading';
import { HabitPriority } from '@/common/components/ui/Habit/HabitPriority';
import { CalendarIcon, EditIcon } from '@/common/constants/appIcons';
import HabitFormPicker from './HabitFormPicker';

const options = [
  { label: '우선순위 없음', description: '원하는 날에만 기록해요.' },
  { label: '낮음', description: '가볍게 이어가고 싶은 습관' },
  { label: '보통', description: '꾸준히 챙기고 싶은 습관' },
  { label: '높음', description: '우선해서 챙기고 싶은 습관' },
];

const sections = [
  { daily: false, title: '자유 기록', icon: EditIcon, priorities: [0] },
  { daily: true, title: '매일 기록', icon: CalendarIcon, priorities: [1, 2, 3] },
];

const HabitFormPriorityPicker = ({ value, onApply, onClose }: {
  value: number;
  onApply: (value: number) => void;
  onClose: () => void;
}) => {
  const [daily, setDaily] = useState(value > 0);
  const [priority, setPriority] = useState(value > 0 ? value : 1);
  return (
    <HabitFormPicker fixedHeight id="habit-priority-picker-title" title="우선순위"
      onClose={onClose} onApply={() => onApply(daily ? priority : 0)}>
      <div role="group" aria-label="우선순위" className="flex flex-col gap-12">
        {sections.map((section) => {
          const active = daily === section.daily;
          return (
            <section key={section.title} className="flex flex-col gap-4">
              <SheetSectionHeading icon={section.icon} title={section.title}
                toggle={{ checked: active, onChange: (checked) => setDaily(checked === section.daily) }} />
              <fieldset disabled={!active} className={`flex min-w-0 flex-col gap-3 pl-7 ${active ? '' : 'opacity-40'}`}>
                {section.priorities.map((option) => {
                  const { label, description } = options[option];
                  const selected = active && (option === 0 || option === priority);
                  return (
                    <button key={option} type="button" aria-pressed={selected}
                      aria-label={option === 0 ? '없음 · 자유 기록' : `${label} · 매일 기록`}
                      onClick={() => option === 0 ? setDaily(false) : setPriority(option)}
                      className={`flex min-h-16 items-center justify-between gap-3 rounded-2xl border p-4 text-left ${selected ? 'border-theme-accent bg-theme-accent/10' : 'border-theme-border/70'}`}>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className={`font-semibold ${selected ? 'text-theme-accent-deep' : ''}`}>{label}</span>
                        <span className="text-sm leading-5 text-theme-text-secondary">{description}</span>
                      </span>
                      <HabitPriority priority={option} className="shrink-0" />
                    </button>
                  );
                })}
                {!section.daily && (
                  <InfoNotice>자유 기록 항목은 완료율과 달성 개수 계산에 포함되지 않아요.</InfoNotice>
                )}
              </fieldset>
            </section>
          );
        })}
      </div>
    </HabitFormPicker>
  );
};

export default HabitFormPriorityPicker;
