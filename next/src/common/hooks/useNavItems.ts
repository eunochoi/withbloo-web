'use client';

import { PAGE_SCROLL_TO_TOP_EVENT } from '../constants/navigation';
import { usePathname, useRouter, useSelectedLayoutSegment } from "next/navigation";
import { DiaryCalendarIcon, FeedIcon, HabitIcon, HomeIcon, SettingsIcon, SoberIcon } from '@/common/constants/appIcons';

const NAV_ITEMS = [
  { key: 'home', segment: 'home', icon: HomeIcon, label: '홈', href: '/home' },
  { key: 'calendar', segment: 'diary', icon: DiaryCalendarIcon, label: '일기 달력', href: '/diary' },
  { key: 'habit', segment: 'habit', icon: HabitIcon, label: '습관 관리', href: '/habit' },
  { key: 'sober', segment: 'sober', icon: SoberIcon, label: '거리두기', href: '/sober' },
  { key: 'diaryList', segment: 'feed', icon: FeedIcon, label: '기록 모음', href: '/feed' },
  { key: 'setting', segment: 'setting', icon: SettingsIcon, label: '설정', href: '/setting' },
];

export const useNavItems = () => {
  const router = useRouter();
  const pathname = usePathname();
  const current = useSelectedLayoutSegment();

  const navigate = (href: string) => {
    if (pathname === href) {
      window.dispatchEvent(new Event(PAGE_SCROLL_TO_TOP_EVENT));
      return;
    }
    router.push(href);
  };

  return { items: NAV_ITEMS, current, navigate };
};
