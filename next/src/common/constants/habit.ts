export const MAX_HABIT_COUNT = 20;
export const HABIT_NAME_MIN_LENGTH = 1;
export const HABIT_NAME_MAX_LENGTH = 30;
export const HABIT_PRIORITY_MIN = 0;
export const HABIT_PRIORITY_MAX = 3;
export const DEFAULT_HABIT_PRIORITY = 1;
export const HABIT_PRIORITY_VALUES = [
  HABIT_PRIORITY_MIN,
  1,
  2,
  HABIT_PRIORITY_MAX,
] as const;
