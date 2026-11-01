'use client';

import { ReactNode, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AppPageContainer } from "./AppPageContainer";

import { PAGE_SCROLL_TO_TOP_EVENT } from '@/common/constants/navigation';
import { cn } from "@/common/utils/cn";
import { ScrollContainer } from "../ui/ScrollContainer";
import { ScrollEdgeFade } from "../ui/ScrollContainer/ScrollEdgeFade";
import { EnterMotion } from "./EnterMotion";

interface Props {
  header?: ReactNode;
  children: ReactNode;
  scrollRef?: RefObject<HTMLDivElement>;
  toolbar?: ReactNode;
  fixedDesktop?: boolean;
}

const AppPageLayout = ({ header, children, scrollRef, toolbar, fixedDesktop = false }: Props) => {
  const layoutRef = useRef<HTMLDivElement>(null);
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isToolbarPinned, setToolbarPinned] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const hasToolbar = Boolean(toolbar);
  const hasHeader = Boolean(header);

  useImperativeHandle(scrollRef, () => internalScrollRef.current!, []);

  useEffect(() => {
    const scrollToTop = () => {
      internalScrollRef.current?.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };
    window.addEventListener(PAGE_SCROLL_TO_TOP_EVENT, scrollToTop);
    return () => window.removeEventListener(PAGE_SCROLL_TO_TOP_EVENT, scrollToTop);
  }, []);

  useEffect(() => {
    const syncLayout = () => {
      const topHeight = headerRef.current?.offsetHeight ?? 0;
      layoutRef.current?.style.setProperty('--page-top-height', `${topHeight}px`);
      layoutRef.current?.style.setProperty('--page-toolbar-height', `${toolbarRef.current?.offsetHeight ?? 0}px`);
      const scrollTop = internalScrollRef.current?.scrollTop ?? 0;
      setToolbarPinned(hasToolbar && scrollTop > 0 && scrollTop >= topHeight);
    };
    const observer = new ResizeObserver(syncLayout);
    if (headerRef.current) observer.observe(headerRef.current);
    if (toolbarRef.current) observer.observe(toolbarRef.current);
    syncLayout();
    return () => observer.disconnect();
  }, [hasToolbar, hasHeader]);

  return (
    <div ref={layoutRef} className="flex h-dvh w-full min-w-0 flex-col">
      <ScrollContainer
        ref={internalScrollRef}
        onScroll={(event) => {
          const scrollTop = event.currentTarget.scrollTop;
          setToolbarPinned(hasToolbar && scrollTop > 0 && scrollTop >= (headerRef.current?.offsetHeight ?? 0));
        }}
        className="flex-1"
        contentClassName={cn("flex flex-col", fixedDesktop && "desktop:h-full desktop:min-h-0")}
        scrollAreaClassName={fixedDesktop ? "desktop:overflow-hidden" : undefined}
        scrollFadeClassName={fixedDesktop ? "desktop:hidden" : undefined}
        showScrollFade
        showTopFade={!hasToolbar}
      >
        {/* Keep the toolbar inside the top section while allowing the title to scroll away. */}
        {(hasHeader || hasToolbar) && (
          <div className={cn('shrink-0', hasToolbar && 'sticky top-[calc(-1*var(--page-top-height,0px))] z-[91]')}>
            {hasHeader && <div ref={headerRef} className="flow-root">{header}</div>}
            {hasToolbar && (
              <div ref={toolbarRef} data-component="pageToolbar" className="relative bg-theme-surface py-2">
                <AppPageContainer>{toolbar}</AppPageContainer>
                <ScrollEdgeFade edge="top" visible={isToolbarPinned} className="absolute inset-x-0 top-full h-6" />
              </div>
            )}
          </div>
        )}
        <main className={cn('flex flex-1 flex-col pb-[calc(var(--mobileNav)+env(safe-area-inset-bottom)+1rem)] tablet:pb-4 desktop:pb-24', hasToolbar ? 'pt-4' : 'tablet:pt-4 desktop:pt-6', fixedDesktop && 'tablet:pb-8 desktop:min-h-0 desktop:pb-4')}>
          <AppPageContainer className={fixedDesktop ? "flex flex-1 flex-col desktop:min-h-0" : undefined}>
            <EnterMotion className={fixedDesktop ? "flex-1 desktop:min-h-0" : undefined}>{children}</EnterMotion>
          </AppPageContainer>
        </main>
      </ScrollContainer>
    </div>
  );
};

export default AppPageLayout;
