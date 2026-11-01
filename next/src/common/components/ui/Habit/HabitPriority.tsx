import { StarRating } from '../StarRating';

export const HabitPriority = ({ priority, className, color }: { priority: number; className?: string; color?: string }) => {
  return (
    <span aria-label={`우선순위 별 ${priority}개`}>
      <StarRating rating={priority} maxRating={3} className={className} color={color} />
    </span>
  )
}

