import { HTMLAttributes } from 'react';
import { cn } from '@/common/utils/cn';
import { APP_LIST_COLUMNS } from '@/common/components/layout/AppPageContainer';

const Toolbar = ({ alignToList, className, ...props }: HTMLAttributes<HTMLDivElement> & { alignToList?: boolean }) => {
  const bar = <div className={cn('flex min-h-10 min-w-0 items-center gap-4', className)} {...props} />;
  return alignToList ? <div className={APP_LIST_COLUMNS}>{bar}</div> : bar;
};

export default Toolbar;
