'use client';

import ScrollableName from '@/common/components/ui/ScrollableName';

import { StarIcon } from '@/common/constants/appIcons';
import { resolveHabitIconColor } from '@/common/constants/habitIconColors';
import { formatSoberDuration, formatSoberGoal, getSoberSummary } from '@/common/functions/sober';
import { useRouter } from 'next/navigation';
import { SoberIcon } from './SoberIcon';
import SoberMenu from './SoberMenu';
import type { SoberWithRestarts } from './types';

interface SoberCardProps {
  item: SoberWithRestarts;
  now: number;
}

const SoberCard = ({ item, now }: SoberCardProps) => {
  const router = useRouter();
  const summary = getSoberSummary(item, item.restarts, now);
  const duration = formatSoberDuration(summary.current.duration);
  const goal = formatSoberGoal(summary.goalDays);

  const openDetail = () => {
    router.push(`/sober/${item.id}`, { scroll: false });
  };

  return (
    <article className="flex h-40 pb-2 flex-col justify-evenly border-b border-theme-border/60 px-2 last:border-b-0">
      <div className="flex items-center gap-3">
        <SoberIcon name={item.iconKey} color={item.iconColor} />
        <button
          type="button"
          aria-label={`${item.name} 거리두기 정보`}
          onClick={openDetail}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ScrollableName name={item.name} className="font-semibold" />
          {item.isPriority && (
            <StarIcon className="shrink-0 text-lg" aria-label="중요" />
          )}
        </button>
        <SoberMenu
          id={item.id}
          name={item.name}
          onDetail={openDetail}
          onEdit={() => router.push(`/sober/${item.id}/edit`, { scroll: false })}
        />
      </div>

      <button
        type="button"
        onClick={openDetail}
        className="flex items-end gap-4 text-left"
        aria-label={`${item.name}, ${duration}, 목표 ${goal}`}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-3">
          <span className="text-lg font-semibold">{duration}</span>
          <span className="h-5 overflow-hidden rounded-full bg-theme-border/80">
            <span
              className="block h-full rounded-full"
              style={{
                width: `${summary.progress}%`,
                backgroundColor: resolveHabitIconColor(item.iconColor),
              }}
            />
          </span>
        </span>
        <span className="flex w-28 shrink-0 flex-col items-end gap-1">
          <span className="text-2xl font-bold">
            {Number(summary.progress.toFixed(1))}%
          </span>
          <span className="text-sm text-theme-text-secondary">목표 {goal}</span>
        </span>
      </button>
    </article>
  );
};

export default SoberCard;
