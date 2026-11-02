import { InfoIcon } from '@/common/constants/appIcons';
import type { itemAccentColors } from '@/common/functions/itemAccentColors';
import type { ReactNode } from 'react';

import { cn } from '@/common/utils/cn';

const InfoNotice = ({ children, className, accent, autoLineHeight = false }: { children: ReactNode; className?: string; accent?: ReturnType<typeof itemAccentColors>; autoLineHeight?: boolean }) => (
  <div style={accent ? { color: accent.text } : undefined} className={cn('flex w-full items-start gap-2 px-2 text-sm tracking-tight text-theme-accent-deep', !autoLineHeight && 'leading-5', className)}>
    <InfoIcon style={accent ? { color: accent.color } : undefined} className="mt-0.5 shrink-0 text-base text-theme-accent" aria-hidden="true" />
    <span className="min-w-0 flex-1">{children}</span>
  </div>
);

export default InfoNotice;
