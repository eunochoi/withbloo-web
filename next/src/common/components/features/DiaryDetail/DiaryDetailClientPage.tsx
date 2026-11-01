'use client';

import { MoreIcon } from '@/common/constants/appIcons';

import { authAction } from "@/common/auth/authAction";
import { diaryQueries } from "@/common/queries/diaryQueries";
import DiaryMenus from "@/common/components/ui/Diary/DiaryMenus";
import { PanelDialog } from "@/common/components/ui/Dialog/PanelDialog";
import { PanelBody } from "@/common/components/ui/Dialog/PanelDialog/PanelBody";
import { PanelHeader } from "@/common/components/ui/Dialog/PanelDialog/PanelHeader";
import { parseLocalDate } from "@/common/utils/date/parseLocalDate";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { AnimatePresence } from "framer-motion";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DiaryDetailContent } from "./DiaryDetailContent";
import { DiaryDetailGallery } from "./DiaryDetailGallery";

interface DiaryDetailClientPageProps {
  diaryId: string;
}

const DiaryDetailClientPage = ({ diaryId }: DiaryDetailClientPageProps) => {
  const router = useRouter();
  const [isDialogMounted, setIsDialogMounted] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { data: diaryData, isError } = useQuery({
    ...diaryQueries.byId(diaryId, authAction),
    enabled: diaryId !== null,
  });

  useEffect(() => {
    if (isError && isDialogMounted) notFound();
  }, [isError, isDialogMounted]);

  if (!diaryData) return null;

  const headerTitle = format(parseLocalDate(diaryData.date), 'yyyy년 M월 d일 eeee', { locale: ko });
  const hasImages = diaryData.Images.length > 0;

  return (
    <AnimatePresence onExitComplete={() => router.back()}>
      {isDialogMounted && (
        <PanelDialog
          ariaLabel={headerTitle}
          onClose={() => setIsDialogMounted(false)}
        >
          <PanelHeader
            title={headerTitle}
            onBack={() => setIsDialogMounted(false)}
            backLabel="뒤로가기"
            rightAction={(
              <>
                <button
                  className="-mr-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-theme-text-tertiary"
                  aria-label="일기 메뉴"
                  aria-expanded={isMenuOpen}
                  onClick={() => setMenuOpen((prev) => !prev)}
                  type="button"
                >
                  <MoreIcon />
                </button>
                <DiaryMenus
                  isMenuOpen={isMenuOpen}
                  setMenuOpen={setMenuOpen}
                  diaryData={diaryData}
                  onDeleted={() => setIsDialogMounted(false)}
                />
              </>
            )}
          />
          <PanelBody>
            <div className="flex w-full min-w-0 flex-col gap-12 pt-5 pb-[max(2rem,env(safe-area-inset-bottom))] landscape-short:gap-6 landscape-short:pt-2">
              <DiaryDetailContent diaryData={diaryData} />
              {hasImages && <DiaryDetailGallery key={diaryData.id} images={diaryData.Images} />}
            </div>
          </PanelBody>
        </PanelDialog>
      )}
    </AnimatePresence>
  );
};

export default DiaryDetailClientPage;
