'use client';

import { FontSize, FontType, } from '@/common/types/setting';
import { ThemeMode, ThemeName } from '@/common/types/theme';
import { useEffect, useRef } from 'react';

interface useApplySettingsProps {
  accent: ThemeName;
  mode: ThemeMode;
  fontSize: FontSize;
  fontType: FontType;
}

//apply hook 통합 및 속성 선택자를 이용해서 테마를 변경하도록 수정
export const useApplySettings = ({ accent, mode, fontSize, fontType }: useApplySettingsProps) => {
  // apply font size
  useEffect(() => {
    document.documentElement.dataset.fontSize = fontSize;
  }, [fontSize]);
  // apply font type
  useEffect(() => {
    document.documentElement.dataset.fontType = fontType;
  }, [fontType]);
  const previousTheme = useRef({ accent, mode });
  useEffect(() => {
    const root = document.documentElement;
    const changed = previousTheme.current.accent !== accent || previousTheme.current.mode !== mode;
    previousTheme.current = { accent, mode };
    if (changed) {
      root.style.setProperty('--previous-wordmark-image', window.getComputedStyle(root).getPropertyValue('--wordmark-image'));
      root.classList.add('theme-transitioning');
    }
    root.dataset.themeAccent = accent;
    root.dataset.themeMode = mode;
    const timeout = changed ? window.setTimeout(() => {
      root.classList.remove('theme-transitioning');
      root.style.removeProperty('--previous-wordmark-image');
    }, 450) : undefined;
    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
      root.classList.remove('theme-transitioning');
      root.style.removeProperty('--previous-wordmark-image');
    };
  }, [accent, mode]);
};
