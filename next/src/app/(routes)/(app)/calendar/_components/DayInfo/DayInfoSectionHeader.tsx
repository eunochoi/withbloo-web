import type { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  title: string;
}

const DayInfoSectionHeader = ({ children, title }: Props) => (
  <header className="flex items-center justify-between gap-2 py-2">
    <h3 className="flex items-center gap-2 text-base font-semibold text-theme-text-primary">
      {title}
    </h3>
    {children}
  </header>
);

export default DayInfoSectionHeader;
