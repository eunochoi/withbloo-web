'use client';

import { cn } from "@/common/utils/cn";
import { HTMLAttributes, ReactNode, forwardRef, useImperativeHandle, useState } from "react";
import { useInView } from "react-intersection-observer";
import { ScrollBoundary } from "./ScrollBoundary";
import { ScrollEdgeFade } from "./ScrollEdgeFade";

interface ScrollContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  scrollAreaClassName?: string;
  scrollFadeClassName?: string;
  showScrollFade?: boolean;
  showTopFade?: boolean;
  fadeOutset?: boolean;
}

export const ScrollContainer = forwardRef<HTMLDivElement, ScrollContainerProps>(
  ({
    children,
    className,
    contentClassName,
    scrollAreaClassName,
    scrollFadeClassName,
    showScrollFade = false,
    showTopFade = true,
    fadeOutset = false,
    ...props
  }, ref) => {
    const [scrollArea, setScrollArea] = useState<HTMLDivElement | null>(null);
    const { ref: topBoundaryRef, inView: isTopBoundaryVisible } = useInView({
      initialInView: true,
      root: scrollArea,
      skip: !showScrollFade,
    });
    const { ref: bottomBoundaryRef, inView: isBottomBoundaryVisible } = useInView({
      initialInView: true,
      root: scrollArea,
      skip: !showScrollFade,
    });
    const isVisibleTopFade = !isTopBoundaryVisible;
    const isVisibleBottomFade = !isBottomBoundaryVisible;

    useImperativeHandle(ref, () => scrollArea!, [scrollArea]);

    return (
      <div className={cn("relative min-h-0 w-full", fadeOutset ? "overflow-visible" : "overflow-hidden", className)}>
        <div
          ref={setScrollArea}
          className={cn("h-full w-full overflow-y-auto", scrollAreaClassName)}
          {...props}
        >
          <div className={cn("relative min-h-full w-full shrink-0", contentClassName)}>
            <ScrollBoundary ref={topBoundaryRef} edge="top" />
            {children}
            <ScrollBoundary ref={bottomBoundaryRef} edge="bottom" />
          </div>
        </div>
        {showScrollFade && (
          <>
            <ScrollEdgeFade
              edge="top"
              visible={showTopFade && isVisibleTopFade}
              className={cn("absolute inset-x-0 z-[90] h-16", fadeOutset ? "-top-1" : "top-0", scrollFadeClassName)}
            />
            <ScrollEdgeFade
              edge="bottom"
              visible={isVisibleBottomFade}
              className={cn("absolute inset-x-0 z-[90] h-16", fadeOutset ? "-bottom-1" : "bottom-0", scrollFadeClassName)}
            />
          </>
        )}
      </div>
    );
  },
);

ScrollContainer.displayName = 'ScrollContainer';
