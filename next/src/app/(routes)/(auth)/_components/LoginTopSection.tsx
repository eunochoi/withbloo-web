import Wordmark from '@/common/components/ui/Wordmark';
import Image from 'next/image';
import cat from '/public/img/bloolog/cats/cat-blue.png';


const LoginTopSection = () => (
  <div className='relative flex min-h-full flex-col'>
    <section
      aria-labelledby="login-intro-title"
      className={`w-full flex flex-col gap-12 px-6 pt-12 pb-0 tablet:px-10 desktop:gap-24 desktop:px-12 desktop:pt-10 desktop:pb-0 xl:px-20`}>
      <div className="flex items-center gap-4">
        <Wordmark className="text-5xl desktop:text-6xl" />
        <span className="text-xl font-bold desktop:text-2xl">- 위블</span>
      </div>

      <div className="flex flex-col gap-6">
        <span className="-mb-3 text-base font-semibold text-theme-accent-deep desktop:text-lg">#하루 #감정 #색상</span>
        <h1 id="login-intro-title" className="flex flex-col gap-3 desktop:gap-6 text-3xl desktop:text-5xl font-bold tracking-tight">
          <span>오늘도,</span>
          <span>나다운 색으로</span>
        </h1>
        <div className="flex flex-col text-lg desktop:text-xl desktop:text-2xl gap-1 desktop:gap-2 text-theme-text-secondary">
          <p>파란 날도, 분홍빛 날도</p>
          <p>블루와 함께 하루를 남겨요.</p>
        </div>
        <span className='text-theme-accent desktop:text-lg'>Bloom with Bloo and Blue.</span>

      </div>
    </section>
    <Image priority src={cat} alt="고양이 블루" sizes="(min-width: 1024px) 40vw, (min-width: 480px) 60vw, 68vw" className="mt-6 tablet:mt-auto ml-auto block w-3/4 tablet:w-2/3 " />
  </div>
);

export default LoginTopSection;
