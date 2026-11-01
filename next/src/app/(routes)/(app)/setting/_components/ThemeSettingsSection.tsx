'use client';

import { OrderIcon } from '@/common/constants/appIcons';

import { useRouter } from 'next/navigation';

import { useSettingsContext } from '@/common/settings/useSettingsContext';
import { EMOTION_ICON_STYLE_LABELS } from '@/common/types/setting';
import { EmotionIconStyleSelector } from './EmotionIconStyleSelector';
import { FontSizeSelector } from './FontSizeSelector';
import { FontTypeSelector } from './FontTypeSelector';
import { SettingItem } from './SettingItem';
import { SettingSubsection } from './SettingSubsection';
import { ThemeColorSelector } from './ThemeColorSelector';
import { ThemeModeSelector } from './ThemeModeSelector';

const colorLabels = { blue: '파랑', green: '초록', purple: '보라', pink: '분홍', yellow: '딥 청록', grey: '회색' };

export const ThemeSettingsSection = () => {
  const router = useRouter();
  const { theme, emotionIcon, font } = useSettingsContext();
  return (
    <div className="flex w-full flex-col gap-12">
      <SettingSubsection title="화면 꾸미기">
        <div className="flex flex-col gap-3"><SettingItem settingItemKey="강조 색상" settingItemValue={colorLabels[theme.accent]} /><ThemeColorSelector /></div>
        <div className="flex flex-col gap-3"><SettingItem settingItemKey="감정 아이콘" settingItemValue={EMOTION_ICON_STYLE_LABELS[emotionIcon.style]} /><EmotionIconStyleSelector /></div>
        <div className="flex flex-col gap-3"><SettingItem settingItemKey="배경 색상" settingItemValue={theme.mode} /><ThemeModeSelector /></div>
        <div className="flex flex-col gap-3"><SettingItem settingItemKey="폰트 크기" settingItemValue={font.size} /><FontSizeSelector /></div>
        <div className="flex flex-col gap-3"><SettingItem settingItemKey="글꼴" settingItemValue={font.type} /><FontTypeSelector /></div>
      </SettingSubsection>
      <SettingSubsection title="습관 정렬">
        <SettingItem settingItemKey="습관 목록 순서 개인화" settingItemValue={<button onClick={() => router.push('/habit/order', { scroll: false })} type="button" aria-label="습관 순서 설정"><OrderIcon className="text-xl" /></button>} />
      </SettingSubsection>
    </div>
  );
};
