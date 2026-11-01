
import ScrollableName from '@/common/components/ui/ScrollableName';
import { MoreIcon } from '@/common/constants/appIcons';
import HabitMenus from "@/common/components/ui/Habit/HabitMenus";
import { HabitPriority } from '@/common/components/ui/Habit/HabitPriority';
import HabitIcon from "@/common/components/ui/HabitIcon";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";


interface Props {
  id: number;
  name: string;
  priority: number;
  iconKey: string;
  iconColor: string;
  isMenuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}

const HabitBoxHeader = ({ id, name, priority, iconKey, iconColor, isMenuOpen, setMenuOpen }: Props) => {
  return (
    <div className="min-w-0">
      <div className="relative min-w-0">
        <Link
          href={`/habit/${id}`}
          scroll={false}
          className="flex min-w-0 flex-col items-center gap-2"
          aria-label={`${name} 습관 정보`}
        >
          <HabitIcon iconKey={iconKey} iconColor={iconColor} className="shrink-0 text-3xl" />
          <ScrollableName name={name} className="w-full text-center text-base font-semibold text-theme-text-primary" />
          <span className="flex h-5 items-center justify-center" >{priority === 0 ? <span className="text-sm text-theme-text-secondary">자유 기록</span> : <HabitPriority priority={priority} className="gap-0.5 text-base" />}</span>
        </Link>
        <button
          type="button"
          className="absolute right-0 top-0 -mr-3.5 flex h-9 w-8 items-center justify-center text-xl text-theme-text-secondary"
          aria-label={`${name} 수정·삭제 메뉴`}
          aria-expanded={isMenuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MoreIcon aria-hidden="true" />
        </button>
        <HabitMenus
          showDetail
          habitId={id}
          habitName={name}
          priority={priority}
          isMenuOpen={isMenuOpen}
          setMenuOpen={setMenuOpen}
        />
      </div>

    </div>
  );
};

export default HabitBoxHeader;
