import { useEffect, useRef, useState } from 'react';
import HabitIcon from '@/common/components/ui/HabitIcon';
import AppUnderlineTabs from '@/common/components/ui/AppUnderlineTabs';
import PickerInfoCard from '@/common/components/ui/PickerInfoCard';
import PickerGridItem from '@/common/components/ui/PickerGridItem';
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
  const initialSelection = useRef<HTMLButtonElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    initialSelection.current?.scrollIntoView({ block: 'nearest' });
  }, []);
  return (
    <HabitFormPicker
      fixedHeight
      scrollFade
      id="habit-icon-picker-title"
      title="습관 아이콘"
      onClose={onClose}
      onApply={() => onApply(draft)}
      fixedContent={
        <div className="shrink-0 space-y-4 pb-4">
          <AppUnderlineTabs
            options={HABIT_ICON_CATEGORIES.map((item) => ({ value: item.id, label: item.label }))}
            value={categoryId}
            scrollToSelected
            accessibilityLabel="아이콘 분류"
            onChange={(id) => {
              setCategoryId(id);
              grid.current?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
            }}
          />
          <PickerInfoCard>
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
              <p className="text-sm leading-5 tracking-tight text-theme-text-secondary">
                {category.description}
              </p>
            </div>
          </PickerInfoCard>
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
          <PickerGridItem
            key={key}
            ref={key === value ? initialSelection : undefined}
            label={HABIT_ICON_LABELS[key]}
            selected={draft === key}
            onClick={() => setDraft(key)}
          >
            <HabitIcon iconKey={key} iconColor={iconColor} className="text-3xl" />
          </PickerGridItem>
        ))}
      </div>
    </HabitFormPicker>
  );
};

export default HabitFormIconPicker;
