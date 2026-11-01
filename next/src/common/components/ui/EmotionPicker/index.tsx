'use client';

import { CheckIcon } from '@/common/constants/appIcons';

import EmotionImage from '@/common/components/ui/EmotionImage';
import { EMOTIONS } from '@/common/constants/emotions';
import { EMOTION_UNSELECTED } from '@/common/constants/filterDefaults';
import { cn } from '@/common/utils/cn';


interface EmotionPickerProps {
  value: number;
  onChange: (value: number) => void;
  allowDeselect?: boolean;
}

export const EmotionPicker = ({ value, onChange, allowDeselect = false }: EmotionPickerProps) => {
  return (
    <div role="group" aria-label="감정 선택" className="grid w-full grid-cols-5 gap-x-1 gap-y-3">
      {EMOTIONS.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={value === item.id}
          onClick={() => onChange(allowDeselect && value === item.id ? EMOTION_UNSELECTED : item.id)}
          className={cn(
            'relative flex min-w-0 flex-col items-center gap-2 rounded-2xl border px-1 py-3 transition-colors',
            value === item.id ? 'border-theme-accent bg-theme-accent/10' : 'border-transparent',
          )}
        >
          <EmotionImage emotion={item} alt="" width={48} height={48} className="h-11 w-11 max-w-full object-contain tablet:h-12 tablet:w-12" />
          <span className="text-xs font-medium">{item.nameKr}</span>
          {value === item.id && <CheckIcon aria-hidden="true" className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-theme-accent p-0.5 text-theme-text-on-accent" />}
        </button>
      ))}
    </div>
  );
};
