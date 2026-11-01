'use client';

import { CheckIcon } from '@/common/constants/appIcons';

import { useSettingsContext } from '@/common/settings/useSettingsContext';
import { THEME_NAME_LIST, THEME_VALUE } from '@/common/types/theme';

const labels = {
  blue: '파랑',
  green: '초록',
  purple: '보라',
  pink: '분홍',
  yellow: '딥 청록',
  grey: '회색',
};
export const ThemeColorSelector = () => {
  const { theme } = useSettingsContext();
  return (
    <div
      role="radiogroup"
      aria-label="강조 색상"
      className="my-2 flex w-full items-center gap-3 py-2 tablet:gap-6"
    >
      {THEME_NAME_LIST.map((name) => (
        <button
          key={name}
          type="button"
          role="radio"
          aria-checked={theme.accent === name}
          aria-label={labels[name]}
          onClick={() => theme.setAccent(name)}
          className="flex aspect-square min-w-0 flex-1 items-center justify-center rounded-full border border-black/10"
          style={{ backgroundColor: `rgb(${THEME_VALUE[name].accent})` }}
        >
          {theme.accent === name && (
            <CheckIcon
              className="text-2xl text-theme-text-on-accent"
              aria-hidden="true"
            />
          )}
        </button>
      ))}
    </div>
  );
};
