import { isHabitIconColor } from "../constants/habitIconColors";
import { isValidHabitIconKey } from "../constants/habitIcons";
import { SOBER_ICONS } from "../constants/sober";
import { isValidLocalDateString } from "../utils/date/isValidLocalDateString";
import { BackupError, type BackupBundle, type BackupRecords } from "./types";
const invalid = () => {
  throw new BackupError("백업 기록의 값이나 연결 정보가 올바르지 않습니다.");
};
const id = (value: number) =>
  Number.isSafeInteger(value) && value > 0 && value <= 2147483647;
const time = (value: string) =>
  typeof value === "string" && Number.isFinite(Date.parse(value));
const date = (value: string) =>
  typeof value === "string" &&
  value >= "1900-01-01" &&
  value <= "2100-12-31" &&
  isValidLocalDateString(value);
const name = (value: string) =>
  typeof value === "string" &&
  value.trim().length >= 1 &&
  value.trim().length <= 30;
const unique = <T>(rows: T[], key: (row: T) => unknown) =>
  new Set(rows.map(key)).size === rows.length;
const timestamps = (row: { created_at: string; updated_at: string }) =>
  time(row.created_at) && time(row.updated_at);
export function validateBackupRecords(
  { records: r, media }: BackupBundle,
  timezone: string,
) {
  if (r.habits.length > 20 || r.sobers.length > 10)
    throw new BackupError("습관은 20개, 거리두기는 10개까지 복원할 수 있어요.");
  if (
    !unique(r.diaries, (row) => row.id) ||
    !unique(r.diaries, (row) => row.date) ||
    !unique(r.habits, (row) => row.id) ||
    !unique(r.habits, (row) =>
      typeof row.name === "string" ? row.name.trim() : null,
    ) ||
    !unique(r.sobers, (row) => row.id) ||
    !unique(r.sobers, (row) =>
      typeof row.name === "string" ? row.name.trim() : null,
    ) ||
    !unique(r.soberRestarts, (row) => row.id) ||
    !unique(r.images, (row) => row.id) ||
    !unique(r.images, (row) => row.file_name) ||
    !unique(r.images, (row) => `${row.diary_id}:${row.position}`) ||
    !unique(r.completions, (row) => `${row.habit_id}:${row.date}`)
  )
    invalid();
  const diaries = new Set(r.diaries.map((row) => row.id));
  const habits = new Map(r.habits.map((row) => [row.id, row]));
  const sobers = new Map(r.sobers.map((row) => [row.id, row]));
  const now = Date.now();
  for (const row of r.diaries)
    if (
      !id(row.id) ||
      !date(row.date) ||
      !Number.isInteger(row.emotion) ||
      row.emotion < 0 ||
      row.emotion > 11 ||
      typeof row.text !== "string" ||
      !row.text.trim() ||
      row.text.length > 500 ||
      !timestamps(row)
    )
      invalid();
  for (const row of r.habits)
    if (
      !id(row.id) ||
      !name(row.name) ||
      !Number.isInteger(row.priority) ||
      row.priority < 0 ||
      row.priority > 3 ||
      !isValidHabitIconKey(row.icon_key) ||
      !isHabitIconColor(row.icon_color) ||
      !time(row.initial_started_at) ||
      row.initial_started_at < "1900-01-01" ||
      Date.parse(row.initial_started_at) > now ||
      !timestamps(row)
    )
      invalid();
  for (const row of r.sobers)
    if (
      !id(row.id) ||
      !name(row.name) ||
      (row.description !== null &&
        (typeof row.description !== "string" ||
          row.description.length > 500)) ||
      typeof row.icon_key !== "string" ||
      !Object.hasOwn(SOBER_ICONS, row.icon_key) ||
      !isHabitIconColor(row.icon_color) ||
      ![0, 1].includes(row.is_priority) ||
      !time(row.initial_started_at) ||
      row.initial_started_at < "1900-01-01" ||
      Date.parse(row.initial_started_at) > now ||
      !timestamps(row) ||
      (row.goal_mode === "AUTO"
        ? row.goal_days !== null
        : row.goal_mode !== "MANUAL" ||
          !Number.isInteger(row.goal_days) ||
          row.goal_days! < 1 ||
          row.goal_days! > 36500)
    )
      invalid();
  for (const row of r.soberRestarts) {
    const sober = sobers.get(row.sober_id);
    if (
      !id(row.id) ||
      !sober ||
      !time(row.restarted_at) ||
      Date.parse(row.restarted_at) < Date.parse(sober.initial_started_at) ||
      Date.parse(row.restarted_at) > now ||
      (row.memo !== null &&
        (typeof row.memo !== "string" || row.memo.length > 500)) ||
      !timestamps(row)
    )
      invalid();
  }
  const localDay = new Intl.DateTimeFormat("sv-SE", { timeZone: timezone });
  for (const row of r.completions) {
    const habit = habits.get(row.habit_id);
    if (
      !habit ||
      !date(row.date) ||
      !time(row.created_at) ||
      row.date < localDay.format(new Date(habit.initial_started_at))
    )
      invalid();
  }
  for (const row of r.images) {
    if (
      !id(row.id) ||
      !diaries.has(row.diary_id) ||
      typeof row.file_name !== "string" ||
      !/^[a-zA-Z0-9_-]+\.jpg$/.test(row.file_name) ||
      !Number.isInteger(row.position) ||
      row.position < 0 ||
      row.position > 4 ||
      !media[`media/${row.file_name}`]
    )
      invalid();
  }
  if (
    Object.keys(media).length !== r.images.length ||
    Object.keys(media).some((key) => !/^media\/[a-zA-Z0-9_-]+\.jpg$/.test(key))
  )
    invalid();
}
// Only explicit record columns are serialized; no accounts, sessions, or device settings.
export const recordColumns = {
  diaries: ["id", "date", "emotion", "text", "created_at", "updated_at"],
  habits: [
    "id",
    "name",
    "priority",
    "icon_key",
    "icon_color",
    "initial_started_at",
    "created_at",
    "updated_at",
  ],
  sobers: [
    "id",
    "name",
    "description",
    "icon_key",
    "icon_color",
    "is_priority",
    "initial_started_at",
    "goal_mode",
    "goal_days",
    "created_at",
    "updated_at",
  ],
  soberRestarts: [
    "id",
    "sober_id",
    "restarted_at",
    "memo",
    "created_at",
    "updated_at",
  ],
  completions: ["habit_id", "date", "created_at"],
  images: ["id", "diary_id", "file_name", "position"],
} satisfies Record<keyof BackupRecords, string[]>;
