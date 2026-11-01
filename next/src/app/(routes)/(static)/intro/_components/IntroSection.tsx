import { ReactNode } from 'react';

import { cn } from '@/common/utils/cn';
import { twMerge } from 'tailwind-merge';
import {
  introContainerClass,
  introContentClass,
  introDescriptionClass,
  introSectionClass,
  introTitleClass,
} from '../_styles/classes';

interface IntroSectionProps {
  title: string;
  hashtag: string;
  description: string[];
  children: ReactNode;
  reverse?: boolean;
  bordered?: boolean;
}

const IntroSection = ({
  title,
  hashtag,
  description,
  children,
  reverse = false,
  bordered = false,
}: IntroSectionProps) => (
  <section className={twMerge(introSectionClass, bordered && 'border-t border-theme-border/50')}>
    <div
      className={cn(
        introContainerClass,
        'grid items-center gap-8 desktop:gap-16',
        reverse
          ? 'desktop:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'
          : 'desktop:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]',
      )}
    >
      <div
        className={cn(
          introContentClass,
          reverse && 'desktop:order-2 desktop:text-right',
        )}
      >
        <span className="w-full text-base font-semibold text-theme-accent-deep desktop:text-lg">
          {hashtag}
        </span>
        <h2 className={introTitleClass}>{title}</h2>
        <div className={introDescriptionClass}>
          {description.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  </section>
);

export default IntroSection;
