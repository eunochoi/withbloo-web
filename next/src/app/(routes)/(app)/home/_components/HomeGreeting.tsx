import Link from'next/link';

const HomeGreeting = () => (
  <div className="flex flex-col gap-3 tablet:gap-4">
    <span className="flex items-center gap-2">
      <span className='text-4xl font-bold leading-tight tracking-tight tablet:text-4xl desktop:text-5xl'>어떤 하루든</span>
    </span>
    <span className='text-4xl font-bold leading-tight tracking-tight tablet:text-4xl desktop:text-5xl'>나의 기록으로</span>
    <div className="flex flex-wrap gap-2 text-base tablet:text-xl desktop:text-2xl font-semibold text-theme-accent-deep">
      <Link href="/calendar">#감정기록</Link>
      <Link href="/habit">#습관관리</Link>
      <Link href="/sober">#거리두기</Link>
    </div>
  </div>
);

export default HomeGreeting;
