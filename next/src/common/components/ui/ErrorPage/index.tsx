import EmotionImage from '@/common/components/ui/EmotionImage';
import { EMOTIONS } from '@/common/constants/emotions';
import { cn } from '@/common/utils/cn';
import { ReactNode } from 'react';

interface Button {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface ErrorPageProps {
  title: string;
  description: string | ReactNode;
  buttons?: Button[];
}

export const ErrorPage = ({ title, description, buttons = [] }: ErrorPageProps) => {
  return (
    <div className="flex h-[100dvh] w-[100dvw] items-center justify-center bg-theme-bg p-5 text-theme-text-primary">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4 rounded-[20px] bg-theme-surface px-6 py-9 text-center shadow-theme-floating backdrop-blur-xl">
        <div className="flex items-center justify-center leading-none">
          <EmotionImage
            unoptimized
            className="h-24 w-24 brightness-110"
            emotion={EMOTIONS[6]}
            alt={EMOTIONS[6].nameKr}
            width={128}
            height={128}
            priority
          />
        </div>
        <h2 className="m-0  text-3xl text-theme-text-primary">{title}</h2>
        <div className="text-base font-medium leading-normal text-theme-text-secondary">
          {typeof description === 'string' ? <p className="m-0 leading-normal">{description}</p> : description}
        </div>
        {buttons.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {buttons.map((button, index) => (
              <button
                key={index}
                className={cn(
                  "cursor-pointer rounded-full px-5 py-2 text-sm font-medium shadow-card",
                  (button.variant || 'primary') === 'primary'
                    ? "bg-theme-accent text-theme-text-on-accent"
                    : "bg-theme-surface-muted text-theme-text-secondary",
                )}
                onClick={button.onClick}
                type="button"
              >
                {button.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
