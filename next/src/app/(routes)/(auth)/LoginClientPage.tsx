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
      scrollFadeClassName='desktop:hidden'
    >
      <div className="grid min-h-[100dvh] desktop:grid-cols-[4fr_3fr]">
        <LoginTopSection />
        <LoginBottomSection />
      </div>
    </ScrollContainer>
  );
};

export default LoginClientPage;
