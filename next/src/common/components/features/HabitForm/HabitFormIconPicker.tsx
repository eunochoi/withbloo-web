import { useEffect, useRef, useState } from 'react';
import HabitIcon from '@/common/components/ui/HabitIcon';
import { HABIT_ICON_CATEGORIES } from '@/common/constants/habitIconCategories';
import { HABIT_ICON_LABELS } from '@/common/constants/habitIconLabels';
import type { HabitIconKey } from '@/common/constants/habitIcons';
import HabitFormPicker from './HabitFormPicker';

const HabitFormIconPicker = ({
  value,
  iconColor,
  onApply,
  onClose,
}: {
  value: HabitIconKey;
  iconColor: string;
  onApply: (value: HabitIconKey) => void;
  onClose: () => void;
}) => {
  const [draft, setDraft] = useState(value);
  const [categoryId, setCategoryId] = useState<string>(
    () =>
      HABIT_ICON_CATEGORIES.find((category) =>
        (category.keys as readonly string[]).includes(value),
      )?.id ?? 'basic',
  );
  const category =
    HABIT_ICON_CATEGORIES.find((item) => item.id === categoryId) ??
    HABIT_ICON_CATEGORIES[0];
  const selectedChip = useRef<HTMLButtonElement>(null);
  const initialSelection = useRef<HTMLButtonElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    selectedChip.current?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }, [categoryId]);
  useEffect(() => {
    initialSelection.current?.scrollIntoView({ block: 'nearest' });
  }, []);
  return (
    <HabitFormPicker
      fixedHeight
      id="habit-icon-picker-title"
      title="습관 아이콘"
      onClose={onClose}
      onApply={() => onApply(draft)}
      fixedContent={
        <div className="shrink-0 space-y-4 pb-2">
          <div
            className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1"
            role="tablist"
            aria-label="아이콘 분류"
          >
            {HABIT_ICON_CATEGORIES.map((item) => (
              <button
                key={item.id}
                ref={categoryId === item.id ? selectedChip : undefined}
                type="button"
                role="tab"
                aria-selected={categoryId === item.id}
                onClick={() => {
                  setCategoryId(item.id);
                  grid.current?.scrollIntoView({
                    block: 'nearest',
                    behavior: window.matchMedia(
                      '(prefers-reduced-motion: reduce)',
                    ).matches
                      ? 'auto'
                      : 'smooth',
                  });
                }}
                className={`min-h-12 shrink-0 rounded-full border px-4 py-2 text-sm ${categoryId === item.id ? 'border-theme-accent bg-theme-accent/10 font-semibold text-theme-accent' : 'border-transparent text-theme-text-secondary'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-theme-accent/20 bg-theme-accent/10 p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-theme-surface">
              <HabitIcon
                iconKey={category.keys[0]}
                iconColor={iconColor}
                className="text-3xl"
              />
            </span>
            <div className="min-w-0 space-y-1.5">
              <h3 className="font-semibold text-theme-accent">
                {category.label}
              </h3>
              <p className="whitespace-pre-line text-sm leading-5 tracking-tight text-theme-text-secondary">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div
        ref={grid}
        className="grid grid-cols-3 gap-3"
        role="group"
        aria-label={category.label}
      >
        {category.keys.map((key) => (
          <button
            key={key}
            ref={key === value ? initialSelection : undefined}
            type="button"
            aria-label={HABIT_ICON_LABELS[key]}
            aria-pressed={draft === key}
            onClick={() => setDraft(key)}
            className={`flex aspect-square min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border p-2 ${draft === key ? 'border-theme-accent bg-theme-accent/10 text-theme-accent' : 'border-transparent text-theme-text-primary'}`}
          >
            <span className="flex h-10 items-center justify-center">
              <HabitIcon
                iconKey={key}
                iconColor={iconColor}
                className="text-3xl"
              />
            </span>
            <span className="flex min-h-10 items-center justify-center text-center text-sm font-semibold leading-5 tracking-tight">
              {HABIT_ICON_LABELS[key]}
            </span>
          </button>
        ))}
      </div>
    </HabitFormPicker>
  );
};

export default HabitFormIconPicker;
