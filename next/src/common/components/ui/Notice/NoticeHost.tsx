'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { subscribeNotice, type NoticeContent } from './notice';

type Notice = NoticeContent & { id: number };

export const NoticeHost = () => {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let nextId = 0;
    return subscribeNotice((content) => {
      setNotice({ id: ++nextId, ...content });
    });
  }, []);

  useEffect(() => {
    const updatePortalRoot = () => {
      const dialogs = document.querySelectorAll<HTMLDialogElement>('dialog[open]');
      setPortalRoot(dialogs[dialogs.length - 1] ?? document.body);
    };
    const observer = new MutationObserver(updatePortalRoot);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['open'],
    });
    updatePortalRoot();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), notice.tone === "error" ? 4000 : notice.tone ? 2000 : 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  if (!notice || !portalRoot) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-[999999] mx-auto w-fit max-w-[calc(100vw-2rem)] rounded-2xl border bg-theme-surface px-5 py-3 text-center shadow-card ${notice.tone === 'error' ? 'border-theme-danger' : 'border-theme-border-muted'}`}
    >
      <p className={`text-base font-medium ${notice.tone === 'error' ? 'text-theme-danger' : 'text-theme-text-primary'}`}>{notice.title}</p>
      {notice.message && <p className="mt-1 text-sm text-theme-text-secondary">{notice.message}</p>}
    </div>,
    portalRoot,
  );
};
