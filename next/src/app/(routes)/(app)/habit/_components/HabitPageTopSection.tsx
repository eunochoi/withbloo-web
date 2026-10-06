import AppPageTitle from '@/common/components/layout/AppPageTitle';
import { TopSectionCatClass, TopSectionCatSize } from '@/common/constants/TopSectionCat';
import Image from 'next/image';
import habitCat from '/public/img/hiding-cat/hiding-cat-habit.png';

const HabitPageTopSection = () => {
  return (
    <>
      <section className="px-[5dvw] pt-[5dvw] tablet:px-9 tablet:pt-6 desktop:px-14">
        <AppPageTitle title="습관 더하기" description="작은 습관이 하루를 조금씩 바꿔요" />
      </section>
      <Image priority src={habitCat} alt="습관을 체크한 노트를 든 고양이" sizes={TopSectionCatSize} className={TopSectionCatClass} />
    </>
  );
};

export default HabitPageTopSection;
