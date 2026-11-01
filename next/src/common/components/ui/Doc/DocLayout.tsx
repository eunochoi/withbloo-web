import type { ReactNode } from 'react';

import { ScrollContainer } from '@/common/components/ui/ScrollContainer';

interface Props {
  children: ReactNode;
}

const docMainClass = 'flex w-full flex-col bg-theme-surface ';

const DocLayout = ({ children }: Props) => {
  return (
    <ScrollContainer
      className="h-[100dvh] w-[100dvw] bg-theme-accent-light static-theme-blue"
      showScrollFade

    >
      <main className={docMainClass}>{children}</main>
    </ScrollContainer>
  );
};

export default DocLayout;
