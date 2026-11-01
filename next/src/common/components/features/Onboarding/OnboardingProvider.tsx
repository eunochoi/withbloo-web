'use client';

import { AnimatePresence } from 'framer-motion';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useCurrentUser } from '@/common/hooks/useCurrentUser';
import { OnboardingDialog } from './OnboardingDialog';

const OnboardingContext = createContext<(() => void) | null>(null);

export function useOpenOnboarding() {
  const open = useContext(OnboardingContext);
  if (!open) throw new Error('OnboardingProvider가 필요합니다.');
  return open;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser();
  const key = user?.email ? `took:${user.email}:onboarding:v1` : null;
  const [checkedKey, setCheckedKey] = useState<string | null>(null);
  const [firstRun, setFirstRun] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    if (!key) {
      setCheckedKey(null);
      return;
    }
    let completed = false;
    try {
      completed = window.localStorage.getItem(key) === 'true';
    } catch {
      // 저장소를 사용할 수 없어도 안내는 볼 수 있다.
    }
    setCheckedKey(key);
    setFirstRun(!completed);
    setOpen(!completed);
  }, [key]);

  const finish = (skipStorage = false) => {
    if (firstRun && key && !skipStorage) window.localStorage.setItem(key, 'true');
    setOpen(false);
    setFirstRun(false);
  };

  return (
    <OnboardingContext.Provider value={() => { setFirstRun(false); setOpen(true); }}>
      {children}
      <AnimatePresence>
        {key && checkedKey === key && open && (
          <OnboardingDialog key={key} firstRun={firstRun} onClose={() => finish()} onContinueWithoutSaving={() => finish(true)} />
        )}
      </AnimatePresence>
    </OnboardingContext.Provider>
  );
}
