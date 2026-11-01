'use client';

import Image from 'next/image';
import Wordmark from '../Wordmark';
import cat from '/public/img/bloolog/cats/cat-blue.png';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

const LoadingScreen = ({ message, showLogo = true }: LoadingScreenProps) => {
  return (
    <div
      className="relative flex h-[100dvh] w-[100dvw] flex-col items-center justify-center gap-6"
      style={{ backgroundColor: 'var(--loading-background)', fontFamily: 'TmoneyRoundWind' }}
    >
      {showLogo && (
        <div className="flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-4">
            <Image src={cat} alt="" priority sizes="144px" className="h-auto w-64 max-w-full" />
            <Wordmark accentColor="var(--loading-indicator)" className="text-[36px]" />
          </div>
          <div className="flex gap-3">
            <div className="h-4 w-4 animate-pulse rounded-full" style={{ backgroundColor: 'var(--loading-indicator)' }} />
            <div className="h-4 w-4 animate-pulse rounded-full [animation-delay:200ms]" style={{ backgroundColor: 'var(--loading-indicator)' }} />
            <div className="h-4 w-4 animate-pulse rounded-full [animation-delay:400ms]" style={{ backgroundColor: 'var(--loading-indicator)' }} />
          </div>
        </div>
      )}
      {message && <span className="text-base text-theme-text-primary">{message}</span>}
    </div>
  );
};

export default LoadingScreen;
