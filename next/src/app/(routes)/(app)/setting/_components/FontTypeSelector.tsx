'use client';

import { SettingChoice, SettingChoiceGrid } from './SettingChoice';

import { useSettingsContext } from '@/common/settings/useSettingsContext';
import { FONT_TYPE_LIST, type FontType } from '@/common/types/setting';

const fontFamilies = {
  타입1: 'TmoneyRoundWind',
  타입2: 'SUIT',
  타입3: 'HakgyoansimGeurimilgiTTF-R',
  타입4: 'Paperozi',
  타입5: 'MaruBuri',
} satisfies Record<FontType, string>;

export const FontTypeSelector = () => {
  const { font } = useSettingsContext();
  return (
    <SettingChoiceGrid role="radiogroup" aria-label="글꼴">
      {FONT_TYPE_LIST.map((type) => (
        <SettingChoice key={type} aria-label={`글꼴 ${type}`} aria-checked={font.type === type} onClick={() => font.setFontType(type)}>
          <span aria-hidden="true" className="flex h-9 items-center whitespace-nowrap text-lg" style={{ fontFamily: fontFamilies[type] }}>가나다</span>
          <span className="text-sm">{type}</span>
        </SettingChoice>
      ))}
    </SettingChoiceGrid>
  );
};
