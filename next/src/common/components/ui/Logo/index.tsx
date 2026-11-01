'use client';

import Image from 'next/image';
import { cn } from '@/common/utils/cn';

interface LogoProps {
  withText?: boolean;
  rootClassName?: string;
  logoClassName?: string;
  textClassName?: string;
}

const Logo = ({ withText = false, rootClassName, logoClassName, textClassName }: LogoProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", rootClassName)}>
      <div className="flex items-center justify-center">
        <Image src="/icon/icon.png" width={64} height={64} sizes="64px" className={cn('h-auto max-w-full', logoClassName)} alt="TOOK Logo" priority />
      </div>
      {withText && <span
        className={cn('uppercase  leading-tight text-theme-text-primary', textClassName)}
      >
        TOOK
      </span>}
    </div>
  );
};

export default Logo;
