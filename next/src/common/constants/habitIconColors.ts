export const HABIT_ICON_COLORS = {
  "coral": {
    "label": "코랄",
    "value": "#DE9692"
  },
  "peach": {
    "label": "살구",
    "value": "#E7B294"
  },
  "mustard": {
    "label": "버터",
    "value": "#DCC17D"
  },
  "pistachio": {
    "label": "피스타치오",
    "value": "#C4CA96"
  },
  "green": {
    "label": "세이지",
    "value": "#AEC5A3"
  },
  "mint": {
    "label": "민트",
    "value": "#9BCDC1"
  },
  "aqua": {
    "label": "아쿠아",
    "value": "#92C5CB"
  },
  "sky": {
    "label": "하늘",
    "value": "#9DBFCC"
  },
  "blue": {
    "label": "블루",
    "value": "#A0B6D9"
  },
  "lavender": {
    "label": "라벤더",
    "value": "#B8AED3"
  },
  "mauve": {
    "label": "모브",
    "value": "#C29DBB"
  },
  "pink": {
    "label": "로즈",
    "value": "#D8A7BC"
  },
  "slate": {
    "label": "그레이",
    "value": "#A8B4C5"
  },
  "mocha": {
    "label": "모카",
    "value": "#B99E8C"
  }
} as const;

export type HabitIconColorKey = 'theme' | keyof typeof HABIT_ICON_COLORS;
export const DEFAULT_HABIT_ICON_COLOR: HabitIconColorKey = 'theme';

export const isHabitIconColor = (value: unknown): value is HabitIconColorKey =>
  value === 'theme' || (typeof value === 'string' && Object.prototype.hasOwnProperty.call(HABIT_ICON_COLORS, value));

export const getHabitIconColor = (value: unknown): HabitIconColorKey =>
  isHabitIconColor(value) ? value : DEFAULT_HABIT_ICON_COLOR;

export const resolveHabitIconColor = (value: unknown) => {
  const key = getHabitIconColor(value);
  return key === 'theme' ? 'rgb(var(--theme-accent))' : HABIT_ICON_COLORS[key].value;
};
