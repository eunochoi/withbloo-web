import { ThemeMode, ThemeName } from "./theme";

export const FONT_SIZE_LIST = ['작게', '보통', '크게'] as const;
export const FONT_TYPE_LIST = ['타입1', '타입2', '타입3'] as const;

export type FontSize = typeof FONT_SIZE_LIST[number];
export type FontType = typeof FONT_TYPE_LIST[number];

export const EMOTION_ICON_STYLE_LIST = ['basic', 'simple', 'emoji'] as const;
export type EmotionIconStyle = typeof EMOTION_ICON_STYLE_LIST[number];
export const DEFAULT_EMOTION_ICON_STYLE: EmotionIconStyle = 'basic';
export const EMOTION_ICON_STYLE_LABELS: Record<EmotionIconStyle, string> = {
  basic: '기본형',
  simple: '단순형',
  emoji: '이모지',
};

//took:[email]:setting, localStorage value type
export interface LocalSettingValue {
  emotionIconStyle?: EmotionIconStyle;
  font: {
    size: FontSize;
    type: FontType;
    version?: 2;
  };
  theme: {
    accent: ThemeName;
    mode: ThemeMode;
  }
};
export interface SettingsContextType {
  emotionIcon: {
    style: EmotionIconStyle;
    setStyle: (style: EmotionIconStyle) => void;
  };
  font: {
    size: FontSize;
    type: FontType;
    setFontSize: (size: FontSize) => void;
    setFontType: (type: FontType) => void;
  },
  theme: {
    accent: ThemeName;
    mode: ThemeMode
    setAccent: (themeName: ThemeName) => void;
    setMode: (themeMode: ThemeMode) => void;
  }
}
