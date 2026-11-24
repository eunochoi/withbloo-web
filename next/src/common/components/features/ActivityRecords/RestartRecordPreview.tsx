'use client';

import { ResetIcon } from '@/common/constants/appIcons';
import { useItemAccent } from '@/common/hooks/useItemAccent';
import Link from 'next/link';

export default function RestartRecordPreview({ iconColor, href }: { iconColor: string; href: string }) {
  const accent = useItemAccent(iconColor);

  return (
    <Link
      href={href}
      scroll={false}
      prefetch={false}
      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-lg p-4 text-center"
      style={{ backgroundColor: accent.background }}
    >
      <span
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: accent.border }}
      >
        <ResetIcon className="h-10 w-10" style={{ color: accent.text }} aria-hidden="true" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-xl font-bold" style={{ color: accent.text }}>다시 시작</span>
        <span className="text-base text-theme-text-secondary">새로운 거리두기 기록을 시작했어요.</span>
      </span>
    </Link>
  );
}
