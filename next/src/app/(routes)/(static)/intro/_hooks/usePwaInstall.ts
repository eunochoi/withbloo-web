import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferredPrompt(null);

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const installPwa = async () => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone || navigator.userAgent.includes('TOOK_APP')) {
      alert('이미 앱으로 실행 중입니다. 별도로 설치하지 않아도 됩니다.');
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } catch {
        alert(
          '설치 창을 열지 못했어요. 브라우저 메뉴에서 앱 설치 또는 홈 화면에 추가를 선택해주세요.',
        );
      } finally {
        setDeferredPrompt(null);
      }
      return;
    }

    const isIOS =
      /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

    if (isIOS) {
      alert(
        'iPhone·iPad에서는 공유 메뉴에서 설치할 수 있어요.\n\n' +
          "1. Safari에서 '위블'을 열어주세요.\n" +
          '2. 공유 버튼을 누르세요. 메뉴 안에 공유 버튼이 있을 수도 있어요.\n' +
          '3. “홈 화면에 추가”를 선택하고 “추가”를 누르세요.\n\n' +
          '“웹 앱으로 열기”가 보이면 켜주세요.\n' +
          '“홈 화면에 추가”가 없으면 공유 메뉴의 “동작 편집”에서 추가해주세요.',
      );
      return;
    }

    alert(
      "지금은 버튼으로 설치 창을 열 수 없어요.\n\n브라우저 메뉴에서 “앱 설치” 또는 “홈 화면에 추가”를 선택해주세요. 이미 설치했다면 홈 화면의 '위블' 아이콘으로 실행해주세요.",
    );
  };

  return { installPwa, canInstall: !!deferredPrompt };
};
