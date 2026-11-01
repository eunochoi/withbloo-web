'use client';

import { StarIcon } from '@/common/constants/appIcons';

import { cn } from "@/common/utils/cn";



interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
  color?: string;
}

export const StarRating = ({ rating, maxRating = rating, className, color }: StarRatingProps) => {
  return (
    <div className={cn("flex text-xl", className)}>
      {Array.from({ length: maxRating }, (_, index) => (
        <span style={index < rating && color ? { color } : undefined} className={cn("star", index < rating ? "text-theme-accent" : "text-theme-text-disabled/70")} key={index}>
          <StarIcon />
        </span>
      ))}
    </div>
  );
};
