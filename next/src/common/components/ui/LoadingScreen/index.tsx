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
          <div className="flex flex-col items-center gap-6">
            <Image src={cat} alt="" priority sizes="144px" className="h-auto w-64 max-w-full" />
            <Wordmark accentColor="var(--loading-indicator)" className="text-[32px]" />
          </div>
        </div>
      )}
      {message && <span className="text-base text-theme-text-primary">{message}</span>}
    </div>
  );
};

export default LoadingScreen;
