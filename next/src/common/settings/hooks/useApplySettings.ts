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
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyMode = () => {
      root.dataset.themeMode = mode === '자동' ? (media.matches ? '어둡게' : '밝게') : mode;
    };
    applyMode();
    if (mode === '자동') media.addEventListener('change', applyMode);
    const timeout = changed ? window.setTimeout(() => {
      root.classList.remove('theme-transitioning');
      root.style.removeProperty('--previous-wordmark-image');
    }, 450) : undefined;
    return () => {
      if (mode === '자동') media.removeEventListener('change', applyMode);
      if (timeout !== undefined) window.clearTimeout(timeout);
      root.classList.remove('theme-transitioning');
      root.style.removeProperty('--previous-wordmark-image');
    };
  }, [accent, mode]);
};
