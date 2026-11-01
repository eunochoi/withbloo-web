export const SOBER_GOALS = [3, 7, 14, 30, 90, 180, 365, 730, 1095] as const;
export const SOBER_DAY_MS = 86400000;

export interface SoberRecord {
  id: number;
  restartedAt: Date | string;
  memo: string | null;
}

export function getSoberSummary(sober: { initialStartedAt: Date | string; goalMode: string; goalDays: number | null }, restarts: SoberRecord[], now: number) {
  const starts = [new Date(sober.initialStartedAt).getTime(), ...restarts.slice().sort((a, b) => new Date(a.restartedAt).getTime() - new Date(b.restartedAt).getTime() || a.id - b.id).map((item) => new Date(item.restartedAt).getTime())];
  const records = starts.map((start, index) => ({ start, end: starts[index + 1] ?? now, current: index === starts.length - 1, duration: Math.max(0, (starts[index + 1] ?? now) - start) }));
  const current = records[records.length - 1];
  const goalDays = sober.goalMode === 'MANUAL' && sober.goalDays ? sober.goalDays : SOBER_GOALS.find((days) => current.duration < days * SOBER_DAY_MS) ?? 1095;
  return { current, records, goalDays, progress: Math.min(100, current.duration / (goalDays * SOBER_DAY_MS) * 100), longest: Math.max(...records.map((record) => record.duration)), achievements: records.flatMap((record) => SOBER_GOALS.filter((days) => days * SOBER_DAY_MS <= record.duration).map((days) => ({ days, achievedAt: record.start + days * SOBER_DAY_MS }))) };
}

export function formatSoberDuration(duration: number) {
  const minutes = Math.floor(Math.max(0, duration) / 60000);
  return `${Math.floor(minutes / 1440)}일 ${Math.floor(minutes % 1440 / 60)}시간 ${minutes % 60}분`;
}

export function formatSoberGoal(days: number) {
  const labels: Partial<Record<number, string>> = { 14: '2주', 30: '1개월', 90: '3개월', 180: '6개월', 365: '1년', 730: '2년', 1095: '3년' };
  return labels[days] ?? `${days}일`;
}

export function sortSobers<T extends { id: number; isPriority: boolean; createdAt: Date | string; initialStartedAt: Date | string; goalMode: string; goalDays: number | null; restarts: SoberRecord[] }>(items: T[], preferences: { sort?: string; priorityFirst?: boolean; recordSort?: string }, now: number): T[] {
  return items.slice().sort((a, b) => {
    if (preferences.priorityFirst && a.isPriority !== b.isPriority) return Number(b.isPriority) - Number(a.isPriority);
    const duration = getSoberSummary(a, a.restarts, now).current.duration - getSoberSummary(b, b.restarts, now).current.duration;
    if (duration) return preferences.recordSort === 'ASC' || preferences.sort === 'SHORT' ? duration : -duration;
    const created = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return (preferences.sort === 'ASC' ? created : -created) || b.id - a.id;
  });
}

export function getSoberDurationDistribution<T extends { initialStartedAt: Date | string; goalMode: string; goalDays: number | null; restarts: SoberRecord[] }>(items: T[], now: number) {
  const thresholds = [3, 7, 14, 30, 90];
  const counts = Array<number>(6).fill(0);
  for (const item of items) {
    const duration = getSoberSummary(item, item.restarts, now).current.duration;
    const index = thresholds.findIndex((days) => duration < days * SOBER_DAY_MS);
    counts[index === -1 ? thresholds.length : index] += 1;
  }
  return counts;
}
