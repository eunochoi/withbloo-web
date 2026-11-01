'use client';

import { cn } from '@/common/utils/cn';
import {
  HTMLMotionProps,
  motion,
  useReducedMotion,
} from 'framer-motion';
import { forwardRef } from 'react';

export type EnterMotionProps = HTMLMotionProps<'div'>;

export const EnterMotion = forwardRef<
  HTMLDivElement,
  EnterMotionProps
>(({ className, ...props }, ref) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={cn(
        'flex w-full flex-col',
        className,
      )}
      initial={
        prefersReducedMotion
          ? false
          : { y: 16 }
      }
      animate={{
        y: 0
      }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
      }}
      {...props}
    />
  );
});

EnterMotion.displayName = 'EnterMotion';
