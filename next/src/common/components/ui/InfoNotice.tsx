import { InfoIcon } from '@/common/constants/appIcons';
import type { ReactNode } from 'react';

import { cn } from '@/common/utils/cn';

const InfoNotice = ({ children, className, autoLineHeight = false }: { children: ReactNode; className?: string; autoLineHeight?: boolean }) => (
  <div className={cn('flex w-full items-start gap-2 text-sm tracking-tight text-theme-accent-deep', !autoLineHeight && 'leading-5', className)}>
    <InfoIcon className="mt-0.5 shrink-0 text-base text-theme-accent" aria-hidden="true" />
    <span className="min-w-0 flex-1">{children}</span>
  </div>
);

export default InfoNotice;
