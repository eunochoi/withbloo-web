'use client';

import { useItemAccent } from '@/common/hooks/useItemAccent';
import { MoreIcon } from '@/common/constants/appIcons';

import { authAction } from "@/common/auth/authAction";
import HabitMenus from "@/common/components/ui/Habit/HabitMenus";
import { habitQueries } from "@/common/queries/habitQueries";
import { useQuery } from "@tanstack/react-query";
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { AnimatePresence } from "framer-motion";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


import InfoNotice from '@/common/components/ui/InfoNotice';
import { PanelDialog } from "../../ui/Dialog/PanelDialog";
import { PanelBody } from "../../ui/Dialog/PanelDialog/PanelBody";
import { PanelHeader } from "../../ui/Dialog/PanelDialog/PanelHeader";
import HabitInfoHeader from "./HabitInfoHeader";
import MonthInfo from "./MonthInfo";
import YearInfo from "./YearInfo";

interface Props {
  habitId: string;
  today: string;
}

const HabitDetailClientPage = ({ habitId, today }: Props) => {
  const router = useRouter();
  const [isDialogMounted, setIsDialogMounted] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [chartDate, setChartDate] = useState<Date>(new Date());

  const { data: habitDataById, isError } = useQuery({
    ...habitQueries.byId(habitId, authAction),
    enabled: habitId !== null,
  });

  const accent = useItemAccent(habitDataById?.iconColor);

  useEffect(() => {
    if (isError && isDialogMounted) notFound();
  }, [isError, isDialogMounted]);

  return (
    <AnimatePresence onExitComplete={() => router.back()}>
      {isDialogMounted && (
        <PanelDialog
          ariaLabel="습관 정보"
          handleColor={accent.color}
          onClose={() => setIsDialogMounted(false)}
        >
          <PanelHeader
            title="상세 정보"
            onBack={() => setIsDialogMounted(false)}
            headerRight={habitDataById && (
              <>
                <button
                  className="-mr-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-theme-text-tertiary"
                  aria-label={`${habitDataById.name} 수정·삭제 메뉴`}
                  aria-expanded={isMenuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                  type="button"
                >
                  <MoreIcon aria-hidden="true" />
                </button>
                <HabitMenus
                  habitId={habitDataById.id}
                  habitName={habitDataById.name}
                  priority={habitDataById.priority}
                  isMenuOpen={isMenuOpen}
                  setMenuOpen={setMenuOpen}
                  onDeleted={() => setIsDialogMounted(false)}
                />
              </>
            )}
          />
          <PanelBody showScrollFade>
            <div className="flex w-full flex-col gap-8 pb-6 tablet:pb-7">
              <HabitInfoHeader habitData={habitDataById} />

              {habitDataById?.priority === 0 && (
                <section className="space-y-3 px-2 pt-2">
                  <h2 className="text-lg font-semibold">최근 기록</h2>
                  <p className="text-sm text-theme-text-secondary">{habitDataById.latestRecordedDate
                    ? `${format(parseISO(habitDataById.latestRecordedDate), 'yyyy년 M월 d일')} · ${habitDataById.latestRecordedDate === today ? '오늘' : `${differenceInCalendarDays(parseISO(today), parseISO(habitDataById.latestRecordedDate))}일 전`}`
                    : '아직 기록이 없어요.'}</p>
                </section>
              )}
              <MonthInfo
                key={habitId}
                habitId={habitId}
                today={today}
                iconKey={habitDataById?.iconKey}
                iconColor={habitDataById?.iconColor}
                isFree={habitDataById?.priority === 0}
                startedDate={habitDataById?.startedDate}
                accent={accent}
              />

              {habitDataById && habitDataById.priority > 0 && <YearInfo
                displayDate={chartDate}
                habitId={habitId}
                startedDate={habitDataById.startedDate}
                accent={accent}
                today={today}
                setDisplayDate={setChartDate} />}
              {habitDataById && <div className="space-y-2 px-1">
                <InfoNotice accent={accent}>{format(new Date(habitDataById.initialStartedAt), 'yy년 M월 d일 HH:mm')} 시작</InfoNotice>
                {habitDataById.priority > 0 && <><InfoNotice accent={accent}>실천 가능일은 선택 기간 내 시작일~오늘이에요.</InfoNotice><InfoNotice accent={accent}>실천율 = 실천 횟수 ÷ 실천 가능일 × 100</InfoNotice></>}
              </div>}
            </div>
          </PanelBody>
        </PanelDialog>
      )}
    </AnimatePresence>
  );
};

export default HabitDetailClientPage;
