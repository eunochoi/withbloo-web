'use client';

import { MoreIcon } from '@/common/constants/appIcons';
import { useItemAccent } from '@/common/hooks/useItemAccent';

import { authAction } from "@/common/auth/authAction";
import HabitMenus from "@/common/components/ui/Habit/HabitMenus";
import { habitQueries } from "@/common/queries/habitQueries";
import { useQuery } from "@tanstack/react-query";
import { format } from 'date-fns';
import { AnimatePresence } from "framer-motion";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


import InfoNotice from '@/common/components/ui/InfoNotice';
import { BottomSheet } from "../../ui/BottomSheet/BottomSheet";
import { BottomSheetBody } from "../../ui/BottomSheet/BottomSheetBody";
import { BottomSheetTitle } from "../../ui/BottomSheet/BottomSheetTitle";
import ActivityRecordListModal from '../ActivityRecords/ActivityRecordListModal';
import ActivityRecordFormModal from '../ActivityRecords/ActivityRecordFormModal';
import type { ActivityRecord } from '@/common/actions/records';
import { HabitInfoCarousel } from "./HabitInfoCarousel";
import HabitInfoHeader from "./HabitInfoHeader";
import MonthInfo from "./MonthInfo";
import YearInfo from "./YearInfo";

interface Props {
  habitId: string;
  today: string;
}

const HabitDetailClientPage = ({ habitId, today }: Props) => {
  const router = useRouter();
  const [isRecordListOpen, setRecordListOpen] = useState(false);
  const [recordDay, setRecordDay] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState<{ record: Partial<ActivityRecord>; day: string | null } | null>(null);
  const [isDialogMounted, setIsDialogMounted] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [chartDate, setChartDate] = useState<Date>(new Date());

  const { data: habitDataById, isError } = useQuery({
    ...habitQueries.byId(habitId, authAction),
    enabled: habitId !== null,
  });
  const monthQuery = useQuery({
    ...habitQueries.month(habitId, today.slice(0, 7), authAction),
    enabled: !!habitDataById,
  });
  const yearQuery = useQuery({
    ...habitQueries.year(habitId, today.slice(0, 4), authAction),
    enabled: !!habitDataById && habitDataById.priority > 0,
  });
  const monthRate = monthQuery.isError ? null : (monthQuery.data?.summary?.completionRate ?? null);

  const accent = useItemAccent(habitDataById?.iconColor);

  useEffect(() => {
    if (isError && isDialogMounted) notFound();
  }, [isError, isDialogMounted]);

  return (
    <>
      <AnimatePresence onExitComplete={() => router.back()}>
        {isDialogMounted && (
          <BottomSheet
            ariaLabel="습관 정보"
            handleColor={accent.color}
            onClose={() => setIsDialogMounted(false)}
          >
            <BottomSheetTitle
              title="상세 정보"
              onBack={() => setIsDialogMounted(false)}
              headerButton={habitDataById && (
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
            <BottomSheetBody showScrollFade>
              <div className="flex w-full flex-col gap-8 pb-6 tablet:pb-7">
                <div className="flex flex-col gap-8">
                  <HabitInfoHeader habitData={habitDataById} />
                  {habitDataById && <HabitInfoCarousel free={habitDataById.priority === 0} today={today}
                    latestDate={habitDataById.latestRecordedDate} month={monthQuery.isError ? undefined : monthQuery.data?.summary}
                    year={yearQuery.isError ? undefined : yearQuery.data} color={accent.color} />}
                  {habitDataById?.description?.trim() && (
                    <p className="w-[90%] min-w-0 self-center whitespace-pre-wrap [overflow-wrap:anywhere] text-center text-base leading-relaxed text-theme-text-secondary">{habitDataById.description}</p>
                  )}
                  {habitDataById && habitDataById.priority > 0 && (
                    <div className="flex w-[90%] flex-col gap-3 self-center">
                      <div className="flex justify-between gap-2 text-sm text-theme-text-secondary"><span>이번 달 실천도</span><span>{monthRate === null ? '—' : `${monthRate.toFixed(1)}%`}</span></div>
                      {monthRate === null ? <div className="h-5 rounded-full bg-theme-border/80" /> : (
                        <div role="progressbar" aria-label="이번 달 실천도" aria-valuemin={0} aria-valuemax={100} aria-valuenow={monthRate} className="h-5 overflow-hidden rounded-full bg-theme-border/80">
                          <div className="h-full" style={{ width: `${Math.min(100, Math.max(0, monthRate))}%`, backgroundColor: accent.color }} />
                        </div>
                      )}
                    </div>
                  )}
                  {habitDataById && <div className="flex flex-col gap-3 px-1">
                    <button type="button" onClick={() => setRecordForm({ record: { type: 'MEMO' }, day: null })} className="min-h-12 rounded-full border border-black/10 text-theme-surface" style={{ backgroundColor: accent.color }}>기록 추가하기</button>
                    <button type="button" onClick={() => setRecordListOpen(true)} className="min-h-12 rounded-full border border-theme-text-secondary/10 bg-theme-surface-muted">기록 모두보기</button>
                  </div>}
                </div>

                <div className="flex flex-col gap-8">
                  <MonthInfo
                    key={habitId}
                    habitId={habitId}
                    onSelectDate={(date) => setRecordDay(date)}
                    today={today}
                    iconKey={habitDataById?.iconKey}
                    iconColor={habitDataById?.iconColor}
                    startedDate={habitDataById?.startedDate}
                  />
                </div>

                {habitDataById && habitDataById.priority > 0 && <YearInfo
                  displayDate={chartDate}
                  habitId={habitId}
                  startedDate={habitDataById.startedDate}
                  accent={accent}
                  today={today}
                  setDisplayDate={setChartDate} />}
                {habitDataById && <div className="space-y-2 px-1">
                  <InfoNotice>{format(new Date(habitDataById.initialStartedAt), 'yy년 M월 d일 HH:mm')} 시작</InfoNotice>
                  {habitDataById.priority === 0 && <InfoNotice>습관 시작일을 반영한 월간 경과 일수 ÷ 기록 횟수예요.</InfoNotice>}
                  {habitDataById.priority > 0 && <><InfoNotice>실천 가능일은 선택 기간 내 시작일~오늘이에요.</InfoNotice><InfoNotice>실천율 = 실천 횟수 ÷ 실천 가능일 × 100</InfoNotice></>}
                </div>}
              </div>
            </BottomSheetBody>
          </BottomSheet>
        )}
      </AnimatePresence>
      {habitDataById && <>
      {isRecordListOpen && <ActivityRecordListModal scope="habit" parentId={Number(habitId)} name={habitDataById.name} day={null} onOpenForm={(record, day) => setRecordForm({ record, day })} onClose={() => setRecordListOpen(false)} />}
      {recordDay && <ActivityRecordListModal scope="habit" parentId={Number(habitId)} name={habitDataById.name} day={recordDay} onOpenForm={(record, day) => setRecordForm({ record, day })} onClose={() => setRecordDay(null)} />}
      {recordForm && <ActivityRecordFormModal scope="habit" parentId={Number(habitId)} name={habitDataById.name} initialStartedAt={habitDataById.initialStartedAt} {...recordForm} onClose={() => setRecordForm(null)} />}
    </>}
    </>
  );
};

export default HabitDetailClientPage;
