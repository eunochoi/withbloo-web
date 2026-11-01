'use client';

import { SettingChoice, SettingChoiceGrid } from './SettingChoice';

import { DarkModeIcon, LightModeIcon } from '@/common/constants/appIcons';


import { useSettingsContext } from '@/common/settings/useSettingsContext';
import { THEME_MODE_LIST } from '@/common/types/theme';

export const ThemeModeSelector = () => {
  const { theme } = useSettingsContext();
  return <SettingChoiceGrid role="radiogroup" aria-label="배경 색상">{THEME_MODE_LIST.map((mode) => <SettingChoice key={mode} aria-checked={theme.mode === mode} onClick={() => theme.setMode(mode)}>{mode === '밝게' ? <LightModeIcon className="text-3xl" /> : <DarkModeIcon className="text-3xl" />}<span className="text-sm">{mode}</span></SettingChoice>)}</SettingChoiceGrid>;
};
