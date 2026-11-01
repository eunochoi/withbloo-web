'use client';

import InfoNotice from '@/common/components/ui/InfoNotice';
import type { ReactNode } from 'react';
import { useId } from 'react';

export function OnboardingFrame({
  title,
  description,
  info,
  children,
}: {
  title: string;
  description: string;
  info?: string;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-12 break-keep px-6 py-6 text-base leading-[1.5] text-theme-text-primary"
    >
      <header className="flex shrink-0 flex-col gap-2 text-center">
        <h2
          id={titleId}
          className="text-2xl font-semibold leading-7 tracking-tight"
        >
          {title}
        </h2>
        <p className="text-base text-theme-text-secondary">{description}</p>
      </header>
      <div className="flex shrink-0 flex-col gap-6">
        {children}
        {info && <InfoNotice className="shrink-0 text-xs">{info}</InfoNotice>}
      </div>
    </section>
  );
}
