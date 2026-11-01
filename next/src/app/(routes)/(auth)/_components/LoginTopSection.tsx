import Wordmark from '@/common/components/ui/Wordmark';
import Image from 'next/image';
import cat from '/public/img/bloolog/cats/cat-blue.png';


const LoginTopSection = () => (
  <div className='relative'>
    <section
      aria-labelledby="login-intro-title"
      className={`w-full flex flex-col gap-12 px-6 pt-12 pb-0 tablet:px-10 desktop:gap-24 desktop:px-12 desktop:pt-10 desktop:pb-0 xl:px-20`}>
      <Wordmark className="text-5xl desktop:text-7xl" />

      <div className="flex flex-col gap-6">
        <h1 id="login-intro-title" className="flex flex-col gap-2 text-3xl desktop:text-4xl font-bold tracking-tight">
          <span>어떤 하루든,</span>
          <span>모두 나의 기록으로</span>
        </h1>
        <div className="flex flex-col text-lg desktop:text-2xl gap-1 text-theme-text-secondary">
          <p>어떤 색의 하루라도, 블루와 함께.</p>
          <p>오늘의 마음을 가볍게 남겨보세요.</p>
        </div>
      </div>
    </section>
    <Image priority src={cat} alt="고양이 블루" sizes="(min-width: 1024px) 40vw, (min-width: 480px) 60vw, 68vw" className="mt-6 tablet:mt-0 desktop:absolute desktop:bottom-0 desktop:right-0 ml-auto block w-3/4 tablet:w-2/3 " />
  </div>
);

export default LoginTopSection;
