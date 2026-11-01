'use client';

import { SettingChoiceGrid } from './SettingChoice';
import EmotionImage from '@/common/components/ui/EmotionImage';
import { EMOTIONS } from '@/common/constants/emotions';
import { useSettingsContext } from '@/common/settings/useSettingsContext';
import { EMOTION_ICON_STYLE_LABELS, EMOTION_ICON_STYLE_LIST } from '@/common/types/setting';
import { cn } from '@/common/utils/cn';

export const EmotionIconStyleSelector = ({ compact = false, choiceClassName }: { compact?: boolean; choiceClassName?: string }) => {
  const { emotionIcon } = useSettingsContext();

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">감정 아이콘 스타일</legend>
      <SettingChoiceGrid className="my-0">
        {EMOTION_ICON_STYLE_LIST.map((style) => (
          <label
            key={style}
            className={cn(
              'relative flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 border px-2 py-2 rounded-xl transition-colors',
              compact ? 'gap-1 py-2' : 'h-24',
              emotionIcon.style === style ? 'border-theme-accent bg-theme-accent-light/50' : 'border-0',
              choiceClassName,
            )}
          >
            <input
              type="radio"
              name="emotion-icon-style"
              value={style}
              checked={emotionIcon.style === style}
              onChange={() => emotionIcon.setStyle(style)}
              className="sr-only"
            />
            <span aria-hidden="true" className="flex items-center justify-center gap-1">
              {[EMOTIONS[0], EMOTIONS[6]].map((emotion) => (
                <EmotionImage key={emotion.id} emotion={emotion} iconStyle={style} alt="" width={28} height={28} className={cn('object-contain', compact ? 'h-[1.75rem] w-[1.75rem]' : 'h-7 w-7')} />
              ))}
            </span>
            <span className={cn('whitespace-nowrap font-medium text-theme-text-primary', compact ? 'text-base' : 'text-sm')}>{EMOTION_ICON_STYLE_LABELS[style]}</span>
          </label>
        ))}
      </SettingChoiceGrid>
    </fieldset>
  );
};
