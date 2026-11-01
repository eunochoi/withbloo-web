'use client';

import { useCurrentUser } from '@/common/hooks/useCurrentUser';
import { useLocalStorage } from '@/common/hooks/useLocalStorage';
import { DEFAULT_EMOTION_ICON_STYLE, EMOTION_ICON_STYLE_LIST, EmotionIconStyle, FONT_SIZE_LIST, FONT_TYPE_LIST, FontSize, FontType, LocalSettingValue } from '@/common/types/setting';
import { THEME_LOCAL_STORAGE_KEY, THEME_MODE_LIST, THEME_NAME_LIST, ThemeMode, ThemeName, ThemePreference } from '@/common/types/theme';
import { useCallback, useEffect, useState } from 'react';

export const useUserSettings = () => {
  const [hasMounted, setHasMounted] = useState(false);
  const { data: user } = useCurrentUser();
  const key = `took:${user?.email}:setting`;

  const {
    value: setting,
    setStoredValue: setSetting,
    isStorageReady: isUserSettingStorageReady,
  } = useLocalStorage<LocalSettingValue>(key, {
    emotionIconStyle: DEFAULT_EMOTION_ICON_STYLE,
    font: {
      size: '보통',
      type: '타입1',
      version: 2,
    },
    theme: {
      accent: 'blue',
      mode: '밝게',
    }
  });
  const { setStoredValue: setLocalTheme } = useLocalStorage<ThemePreference>(
    THEME_LOCAL_STORAGE_KEY,
    {
      mode: '밝게',
      theme: 'blue',
    },
  );
  const fontSize = setting?.font?.size;
  const storedFontType: string | undefined = setting?.font?.type;
  const fontType: FontType = setting?.font?.version === 2
    ? (FONT_TYPE_LIST.includes(storedFontType as FontType) ? storedFontType as FontType : '타입1')
    : storedFontType === '타입5' ? '타입3' : storedFontType === '타입2' ? '타입2' : '타입1';
  const accent = setting?.theme?.accent;
  const mode = setting?.theme?.mode;
  const emotionIconStyle = hasMounted && setting?.emotionIconStyle && EMOTION_ICON_STYLE_LIST.includes(setting.emotionIconStyle)
    ? setting.emotionIconStyle
    : DEFAULT_EMOTION_ICON_STYLE;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const setEmotionIconStyle = useCallback((style: EmotionIconStyle) => {
    if (EMOTION_ICON_STYLE_LIST.includes(style)) {
      setSetting((prev) => ({ ...prev, emotionIconStyle: style }));
    }
  }, [setSetting]);

  useEffect(() => {
    if (!user?.email || !isUserSettingStorageReady || !mode || !accent) {
      return;
    }

    setLocalTheme({ mode, theme: accent });
  }, [accent, isUserSettingStorageReady, mode, setLocalTheme, user?.email]);

  const setFontSize = useCallback((size: FontSize) => {
    if (FONT_SIZE_LIST.includes(size)) {
      setSetting((prev) => ({
        ...prev,
        font: {
          ...(prev.font),
          size,
        }
      }));
    }
  }, [setSetting]);

  const setFontType = useCallback((type: FontType) => {
    if (FONT_TYPE_LIST.includes(type)) {
      setSetting((prev) => ({
        ...prev,
        font: {
          ...(prev.font),
          type,
          version: 2,
        }
      }));
    }
  }, [setSetting]);

  const setAccent = useCallback((themeName: ThemeName) => {
    if (THEME_NAME_LIST.includes(themeName)) {
      setSetting((prev) => ({
        ...prev,
        theme: {
          ...(prev.theme),
          accent: themeName,
        }
      }));
      setLocalTheme((prev) => ({
        ...prev,
        theme: themeName,
      }));
    }
  }, [setLocalTheme, setSetting]);
  const setMode = useCallback((themeMode: ThemeMode) => {
    if (THEME_MODE_LIST.includes(themeMode)) {
      setSetting((prev) => ({
        ...prev,
        theme: {
          ...(prev.theme),
          mode: themeMode
        }
      }));
      setLocalTheme((prev) => ({
        ...prev,
        mode: themeMode,
      }));
    }
  }, [setLocalTheme, setSetting]);

  return {
    emotionIconStyle,
    setEmotionIconStyle,
    fontSize,
    fontType,
    accent,
    mode,
    setFontSize,
    setFontType,
    setAccent,
    setMode,
  };
};
