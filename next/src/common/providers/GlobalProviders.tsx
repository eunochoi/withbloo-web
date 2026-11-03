'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { NoticeHost } from "../components/ui/Notice/NoticeHost";
import { SystemBars } from '../components/layout/SystemBars';
import RQProvider from "./reactQuery/ReactQueryProvider";

interface Props {
  children: ReactNode;
}

/**
 * 전역 Provider 모음
 * - SessionProvider: 인증 (next-auth)
 * - RQProvider: React Query 상태 관리
 * - NoticeHost: 한 번에 하나의 알림 표시
 */
export const GlobalProviders = ({ children }: Props) => {
  useEffect(() => {
    let start: { x: number; y: number; input: HTMLElement; id: number } | null = null;
    let focusTimer: ReturnType<typeof setTimeout> | undefined;
    let focusWindow: ReturnType<typeof setTimeout> | undefined;
    let focusedInput: HTMLElement | null = null;

    const revealFocusedInput = () => {
      if (!focusedInput || document.activeElement !== focusedInput) return;
      focusedInput.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    };
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLTextAreaElement) &&
        !(target instanceof HTMLInputElement && ['text', 'search', 'email', 'password', 'tel', 'url', 'number'].includes(target.type))) return;
      focusedInput = target;
      clearTimeout(focusTimer);
      clearTimeout(focusWindow);
      requestAnimationFrame(revealFocusedInput);
      focusWindow = setTimeout(() => { focusedInput = null; }, 1500);
    };
    const onViewportResize = () => {
      if (!focusedInput) return;
      clearTimeout(focusTimer);
      focusTimer = setTimeout(revealFocusedInput, 100);
    };

    const onTouchStart = (event: TouchEvent) => {
      const active = document.activeElement;
      const editable = active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLInputElement && ['text', 'search', 'email', 'password', 'tel', 'url', 'number'].includes(active.type));
      if (event.touches.length !== 1 || !editable || !(event.target instanceof Node) || active.contains(event.target)) {
        start = null;
        return;
      }
      const touch = event.changedTouches[0];
      start = { x: touch.clientX, y: touch.clientY, input: active, id: touch.identifier };
    };

    const onTouchEnd = (event: TouchEvent) => {
      const touch = Array.from(event.changedTouches).find((item) => item.identifier === start?.id);
      if (start && touch && document.activeElement === start.input &&
        Math.hypot(touch.clientX - start.x, touch.clientY - start.y) < 10) {
        event.preventDefault();
        event.stopPropagation();
        start.input.blur();
      }
      start = null;
    };

    const onTouchMove = (event: TouchEvent) => {
      focusedInput = null;
      clearTimeout(focusTimer);
      const touch = Array.from(event.changedTouches).find((item) => item.identifier === start?.id);
      if (start && touch && Math.hypot(touch.clientX - start.x, touch.clientY - start.y) >= 10) start = null;
    };
    const onTouchCancel = () => { start = null; };
    document.addEventListener('focusin', onFocusIn);
    window.visualViewport?.addEventListener('resize', onViewportResize);
    document.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
    document.addEventListener('touchmove', onTouchMove, { capture: true, passive: true });
    document.addEventListener('touchend', onTouchEnd, { capture: true, passive: false });
    document.addEventListener('touchcancel', onTouchCancel, true);
    return () => {
      focusedInput = null;
      clearTimeout(focusTimer);
      clearTimeout(focusWindow);
      document.removeEventListener('focusin', onFocusIn);
      window.visualViewport?.removeEventListener('resize', onViewportResize);
      document.removeEventListener('touchstart', onTouchStart, true);
      document.removeEventListener('touchmove', onTouchMove, true);
      document.removeEventListener('touchend', onTouchEnd, true);
      document.removeEventListener('touchcancel', onTouchCancel, true);
    };
  }, []);

  return (
    <SessionProvider>
      <RQProvider>
        <NoticeHost />
        <SystemBars />
        {children}
      </RQProvider>
    </SessionProvider>
  );
};
