export const DIARY_LIST_PAGE_SIZE = 5;
export const DIARY_TEXT_MAX_LENGTH = 500;
export const DIARY_TEXT_PREVIEW_LINE_COUNT = 3;

// Diary save/delete already invalidate this prefix.
export const FEED_QUERY_KEY = ['diary', 'diaryList', 'feed'] as const;
