import { cn } from '@/common/utils/cn';
import { HTMLAttributes } from 'react';

export const APP_LIST_COLUMNS = 'desktop:grid desktop:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] desktop:gap-x-8';

export const AppPageContainer = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mx-auto w-full min-w-0 px-[5dvw] tablet:max-w-[var(--app-content-max-width-tablet)] tablet:px-9 desktop:max-w-[var(--app-content-max-width-desktop)] desktop:px-14', className)} {...props} />
);
