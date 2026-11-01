interface SummaryHabit {
  id: number;
  priority: number;
  startedDate: string;
}

// Free records remain visible, but do not affect either side of a completion rate.
export const getHabitDaySummary = (date: string, habits: SummaryHabit[], completedIds: ReadonlySet<number>) => {
  const eligible = habits.filter((habit) => habit.startedDate <= date);
  const counted = eligible.filter((habit) => habit.priority > 0);
  const completed = counted.filter((habit) => completedIds.has(habit.id)).length;
  return {
    total: counted.length,
    completed,
    excludedCompleted: eligible.filter((habit) => habit.priority === 0 && completedIds.has(habit.id)).length,
    percent: counted.length ? completed / counted.length * 100 : null,
  };
};

export const isValidHabitStartedAt = (value: unknown, now = Date.now()): value is string => {
  if (typeof value !== 'string') return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value
    && value >= '1900-01-01T00:00:00.000Z' && value <= '2100-12-31T23:59:59.999Z'
    && time <= now;
};
