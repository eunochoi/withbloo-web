'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ScrollContainer } from "@/common/components/ui/ScrollContainer";
import LoginBottomSection from './_components/LoginBottomSection';
import LoginTopSection from './_components/LoginTopSection';


const LoginClientPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/home');
    router.prefetch('/calendar');
    router.prefetch('/diary');
    router.prefetch('/habit');
    router.prefetch('/setting');
  }, [router]);

  return (
    <ScrollContainer
      className="static-theme-blue bg-theme-accent-light h-[100dvh] w-[100dvw]  text-theme-text-primary"
      showScrollFade
      scrollFadeClassName='tablet:hidden'
      scrollAreaClassName='tablet:overflow-hidden'
      contentClassName='tablet:h-full'
    >
      <div className="grid min-h-[100dvh] tablet:h-full tablet:min-h-0 tablet:grid-cols-2 desktop:grid-cols-[4fr_3fr]">
        <div className="min-w-0 tablet:min-h-0 tablet:overflow-y-auto">
          <LoginTopSection />
        </div>
        <div className="min-w-0 tablet:min-h-0 tablet:overflow-y-auto">
          <LoginBottomSection />
        </div>
      </div>
    </ScrollContainer>
  );
};

export default LoginClientPage;
