import { cn } from '@/common/utils/cn';
import { HTMLAttributes } from 'react';

export const AppPageContainer = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mx-auto w-full min-w-0 px-[5dvw] tablet:max-w-[600px] tablet:px-9 desktop:max-w-[1000px] desktop:px-14', className)} {...props} />
);
