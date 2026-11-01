'use client';

import { SettingChoice, SettingChoiceGrid } from './SettingChoice';

import { useSettingsContext } from '@/common/settings/useSettingsContext';
import { FONT_SIZE_LIST } from '@/common/types/setting';

export const FontSizeSelector = () => {
  const { font } = useSettingsContext();
  const sizes = ['text-sm', 'text-lg', 'text-2xl'];
  return <SettingChoiceGrid role="radiogroup" aria-label="폰트 크기">{FONT_SIZE_LIST.map((size, index) => <SettingChoice key={size} aria-checked={font.size === size} onClick={() => font.setFontSize(size)}><span className={`${sizes[index]} flex h-9 items-center font-semibold`}>가나다</span><span className="text-sm">{size}</span></SettingChoice>)}</SettingChoiceGrid>;
};
