'use client';

import { ReactNode } from "react";

import BottomNav from "@/common/components/ui/BottomNav";
import SideBar from "@/common/components/ui/SideBar";

interface Props {
  children: ReactNode;
}

const ResponsiveAppLayout = ({ children }: Props) => {
  return (
    <div className="flex w-screen justify-center">
      <div className="hidden h-dvh shrink-0 tablet:block tablet:w-32 desktop:w-[200px]">
        <SideBar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-center">
        {children}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-[max(15px,env(safe-area-inset-bottom))] z-[95] flex items-center justify-center tablet:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default ResponsiveAppLayout;
