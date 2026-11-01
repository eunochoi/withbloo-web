'use client';

import { PAGE_SCROLL_TO_TOP_EVENT } from '../constants/navigation';
import { usePathname, useRouter, useSelectedLayoutSegment } from "next/navigation";
import { CalendarIcon, HabitIcon, HomeIcon, SettingsIcon, DiaryIcon, SoberIcon } from '@/common/constants/appIcons';

const NAV_ITEMS = [
  { key: 'home', segment: 'home', icon: HomeIcon, label: '홈', href: '/home' },
  { key: 'calendar', segment: 'calendar', icon: CalendarIcon, label: '월간 기록', href: '/calendar' },
  { key: 'diaryList', segment: 'diary', icon: DiaryIcon, label: '일기 목록', href: '/diary' },
  { key: 'habit', segment: 'habit', icon: HabitIcon, label: '습관 관리', href: '/habit' },
  { key: 'sober', segment: 'sober', icon: SoberIcon, label: '거리두기', href: '/sober' },
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
