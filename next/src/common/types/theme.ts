export const THEME_NAME_LIST = [
  'blue',
  'green',
  'purple',
  'pink',
  'yellow',
  'grey',
] as const;

export const THEME_ACCENT_LIST = [
  '140 173 226',
  '131 198 182',
  '151 159 199',
  '237 165 177',
  '98 158 154',
  '143 143 143',
] as const;

export const THEME_BG = '246 248 250' as const;

export const THEME_BG_DARK_MODE = `38 38 38`;

export const THEME_MODE_LIST = ['밝게', '어둡게'] as const;

// 이메일 없이 로딩 화면에서 접근하는 로컬 테마 설정
export const THEME_LOCAL_STORAGE_KEY = 'took:local:theme';

export type ThemeName = typeof THEME_NAME_LIST[number];
export type ThemeAccent = typeof THEME_ACCENT_LIST[number];
export type ThemeBG = typeof THEME_BG;
export type ThemeMode = typeof THEME_MODE_LIST[number];

export interface ThemePreference {
  mode: ThemeMode;
  theme: ThemeName;
}

export const THEME_VALUE: Record<
  ThemeName,
  {
    accent: ThemeAccent;
    accentLight: string;
    bg: ThemeBG;
  }
> = {
  blue: {
    accent: '140 173 226',
    accentLight: '240 247 255',
    bg: THEME_BG,
  },
  green: {
    accent: '131 198 182',
    accentLight: '238 250 246',
    bg: THEME_BG,
  },
  purple: {
    accent: '151 159 199',
    accentLight: '237 237 247',
    bg: THEME_BG,
  },
  pink: {
    accent: '237 165 177',
    accentLight: '249 241 242',
    bg: THEME_BG,
  },
  yellow: {
    accent: '98 158 154',
    accentLight: '239 247 246',
    bg: THEME_BG,
  },
  grey: {
    accent: '143 143 143',
    accentLight: '242 242 242',
    bg: THEME_BG,
  },
} as const;
