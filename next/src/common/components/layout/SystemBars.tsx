'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const STATIC_THEME_PATHS = new Set([
  '/',
  '/login',
  '/intro',
  '/privacy',
  '/account-deletion',
]);

const STATIC_THEME_COLOR = '240 247 255';

export const SystemBars = () => {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;

    const applySystemBars = () => {
      const isStaticThemePage = STATIC_THEME_PATHS.has(pathname);

      const colorParts = isStaticThemePage
        ? STATIC_THEME_COLOR
        : getComputedStyle(root)
          .getPropertyValue(pathname === '/home' ? '--theme-accent-light' : '--theme-surface')
          .trim();

      const color = `rgb(${colorParts.split(/\s+/).join(', ')})`;

      document
        .getElementById('theme-color')
        ?.setAttribute('content', color);
    };

    applySystemBars();

    const observer = new MutationObserver(applySystemBars);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme-mode', 'data-theme-accent'],
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
};
