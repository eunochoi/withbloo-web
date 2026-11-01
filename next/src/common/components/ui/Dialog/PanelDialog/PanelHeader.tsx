'use client';

import type { ReactNode } from 'react';
import { PANEL_HORIZONTAL_PADDING_CLASS } from './constants';

interface PanelHeaderProps {
  title?: string;
  onBack?: () => void;
  backLabel?: string;
  rightAction?: ReactNode;
  onTitleClick?: () => void;
}

export const PanelHeader = ({
  title,
  rightAction,
  onTitleClick,
}: PanelHeaderProps) => (
  <div
    className={`relative flex min-h-12 w-full shrink-0 items-center justify-center ${PANEL_HORIZONTAL_PADDING_CLASS}`}
  >
    {title &&
      (onTitleClick ? (
        <button
          type="button"
          onClick={onTitleClick}
          className="min-h-11 px-10 text-center text-lg font-semibold tracking-tight"
          aria-label={`${title}, 날짜 선택`}
        >
          {title}
        </button>
      ) : (
        <h2 className="px-10 text-center text-lg font-semibold tracking-tight">
          {title}
        </h2>
      ))}
    {rightAction && (
      <div className="absolute right-[5%] flex items-center tablet:right-12 desktop:right-[81px]">
        {rightAction}
      </div>
    )}
  </div>
);
