export const MAX_BACKUP_BYTES = 1024 * 1024 * 1024;
export const MAX_ENCRYPTED_BACKUP_BYTES = MAX_BACKUP_BYTES + 1024 * 1024;
export const MAX_DATABASE_BYTES = 64 * 1024 * 1024;
export const BACKUP_SCHEMA_VERSION = 12;
export class BackupError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "BackupError";
  }
}
export interface DiaryRecord {
  id: number;
  date: string;
  emotion: number;
  text: string;
  created_at: string;
  updated_at: string;
}
export interface HabitRecord {
  id: number;
  name: string;
  description: string | null;
  priority: number;
  icon_key: string;
  icon_color: string;
  initial_started_at: string;
  created_at: string;
  updated_at: string;
}
export interface SoberRecord {
  id: number;
  name: string;
  description: string | null;
  icon_key: string;
  icon_color: string;
  is_priority: number;
  initial_started_at: string;
  goal_mode: string;
  goal_days: number | null;
  created_at: string;
  updated_at: string;
}
export interface HabitMemoRecord {
  id: number;
  habit_id: number;
  recorded_at: string;
  memo: string;
  created_at: string;
  updated_at: string;
}
export interface RestartRecord {
  type?: 'MEMO' | 'RESTART';
  id: number;
  sober_id: number;
  restarted_at: string;
  memo: string | null;
  created_at: string;
  updated_at: string;
}
export interface CompletionRecord {
  habit_id: number;
  date: string;
  created_at: string;
}
export interface ImageRecord {
  id: number;
  diary_id: number;
  file_name: string;
  position: number;
}
export interface HabitMemoImageRecord { id: number; habit_memo_id: number; file_name: string; position: number; }
export interface SoberRecordImageRecord { id: number; sober_record_id: number; file_name: string; position: number; }
export interface BackupRecords {
  diaries: DiaryRecord[];
  habits: HabitRecord[];
  sobers: SoberRecord[];
  soberRestarts: RestartRecord[];
  habitMemos?: HabitMemoRecord[];
  completions: CompletionRecord[];
  images: ImageRecord[];
  habitMemoImages?: HabitMemoImageRecord[];
  soberRecordImages?: SoberRecordImageRecord[];
}
export interface BackupBundle {
  records: BackupRecords;
  media: Record<string, Uint8Array | string>;
}
export const backupSummary = (r: BackupRecords) => ({
  diaries: r.diaries.length,
  habits: r.habits.length,
  completions: r.completions.length,
  sobers: r.sobers.length,
  restarts: r.soberRestarts.filter((row) => (row.type ?? 'RESTART') === 'RESTART').length,
  photos: r.images.length + (r.habitMemoImages?.length ?? 0) + (r.soberRecordImages?.length ?? 0),
});
