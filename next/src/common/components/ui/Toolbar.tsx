import { HTMLAttributes } from 'react';
import { cn } from '@/common/utils/cn';

const Toolbar = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex min-h-10 min-w-0 items-center gap-4', className)} {...props} />
);

export default Toolbar;
