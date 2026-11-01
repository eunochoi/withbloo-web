'use client';

import { SettingChoice, SettingChoiceGrid } from './SettingChoice';

import { PiCircleHalfFill } from 'react-icons/pi';
import { DarkModeIcon, LightModeIcon } from '@/common/constants/appIcons';

import { useSettingsContext } from '@/common/settings/useSettingsContext';
import { THEME_MODE_LIST } from '@/common/types/theme';

export const ThemeModeSelector = () => {
  const { theme } = useSettingsContext();
  return (
    <SettingChoiceGrid role="radiogroup" aria-label="배경 색상">
      {THEME_MODE_LIST.map((mode) => (
        <SettingChoice
          key={mode}
          aria-checked={theme.mode === mode}
          aria-label={mode === '자동' ? '배경 색상, 자동, 기기 설정 따르기' : `배경 색상, ${mode}`}
          onClick={() => theme.setMode(mode)}
        >
          {mode === '밝게' ? (
            <LightModeIcon className="text-3xl" />
          ) : mode === '어둡게' ? (
            <DarkModeIcon className="text-3xl" />
          ) : (
            <PiCircleHalfFill className="text-3xl" />
          )}
          <span className="text-sm">{mode}</span>
        </SettingChoice>
      ))}
    </SettingChoiceGrid>
  );
};
