'use client';

import { MoreIcon } from '@/common/constants/appIcons';

import { authAction } from "@/common/auth/authAction";
import { diaryQueries } from "@/common/queries/diaryQueries";
import DiaryMenus from "@/common/components/ui/Diary/DiaryMenus";
import { BottomSheet, type BottomSheetHandle } from "@/common/components/ui/BottomSheet/BottomSheet";
import { BottomSheetBody } from "@/common/components/ui/BottomSheet/BottomSheetBody";
import { BottomSheetTitle } from "@/common/components/ui/BottomSheet/BottomSheetTitle";
import { parseLocalDate } from "@/common/utils/date/parseLocalDate";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { DiaryDetailContent } from "./DiaryDetailContent";
import { DiaryDetailGallery } from "./DiaryDetailGallery";

interface DiaryDetailClientPageProps {
  diaryId: string;
}

const DiaryDetailClientPage = ({ diaryId }: DiaryDetailClientPageProps) => {
  const router = useRouter();
  const sheetRef = useRef<BottomSheetHandle>(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { data: diaryData, isError } = useQuery({
    ...diaryQueries.byId(diaryId, authAction),
    enabled: diaryId !== null,
  });

  useEffect(() => {
    if (isError) notFound();
  }, [isError]);

  if (!diaryData) return null;

  const headerTitle = format(parseLocalDate(diaryData.date), 'yyyy년 M월 d일 eeee', { locale: ko });
  const hasImages = diaryData.Images.length > 0;

  return (
    <>
        <BottomSheet
          ref={sheetRef}
          ariaLabel={headerTitle}
          onClose={() => router.back()}
        >
          <BottomSheetTitle
            title={headerTitle}
            onBack={() => sheetRef.current?.close()}
            backLabel="뒤로가기"
            headerButton={(
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
                  onDeleted={() => sheetRef.current?.close()}
                />
              </>
            )}
          />
          <BottomSheetBody>
            <div className="flex w-full min-w-0 flex-col gap-12 pb-[max(2rem,env(safe-area-inset-bottom))] landscape-short:gap-6">
              <DiaryDetailContent diaryData={diaryData} />
              {hasImages && <DiaryDetailGallery key={diaryData.id} images={diaryData.Images} />}
            </div>
          </BottomSheetBody>
        </BottomSheet>
    </>
  );
};

export default DiaryDetailClientPage;
