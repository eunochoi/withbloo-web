'use client';


import { AUTH_ERROR_CODE } from '@/common/auth/types';
import SocialLoginButton from '@/common/components/ui/SocialLoginButton';
import { LOGIN_PROVIDERS } from '@/common/constants/loginProviders';
import { useCurrentUser } from '@/common/hooks/useCurrentUser';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


const LoginBottomSection = () => {
  const router = useRouter();
  const { data: user, isSuccess, isPending, isFetching, error, refetch } = useCurrentUser({
    redirectOnAuthError: false,
    refetchOnWindowFocus: 'always',
    staleTime: 0,
    gcTime: 0,
    retry: (failureCount, queryError) => queryError.code !== AUTH_ERROR_CODE.needLogin && failureCount < 1,
  });

  useEffect(() => {
    if (isSuccess && user && !isFetching) {
      router.replace('/home');
    }
  }, [isSuccess, user, isFetching, router]);

  const isCheckingAuth = isPending || isFetching || isSuccess;
  const needsLogin = error?.code === AUTH_ERROR_CODE.needLogin;

  return (
    <section
      aria-labelledby="login-title"
      className="flex flex-col items-center gap-10 bg-theme-surface px-6 py-16">
      <div className="flex w-full max-w-[340px] flex-1 flex-col items-center justify-center gap-9 desktop:gap-11">
        <div className="flex flex-col gap-3 text-center desktop:gap-4">
          <h2 id="login-title" className="text-[24px] font-bold leading-tight tracking-tight desktop:text-[28px]">
            나의 하루를 시작해요
          </h2>
          <p className="text-sm leading-relaxed text-theme-text-secondary desktop:text-base">
            오늘의 마음을 남기고,<br />
            나를 조금 더 알아가요.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-4">
          {isCheckingAuth ? (
            <p role="status" className="min-w-60 text-center text-sm text-theme-accent bg-theme-accent-light px-6 py-3 border-[1px] border-theme-accent/30 rounded-full">
              {isSuccess && !isFetching ? '홈 화면으로 이동...' : '로그인 상태 확인...'}
            </p>
          ) : needsLogin ? (
            <SocialLoginButton
              provider="google"
              onClick={() => signIn('google', { callbackUrl: '/home' }, LOGIN_PROVIDERS.google.signInOptions)}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <p role="alert" className="text-sm text-theme-text-secondary">
                로그인 상태를 확인하지 못했어요. 잠시 후 다시 시도해주세요.
              </p>
              <button className="px-3 py-2 text-sm text-theme-accent" onClick={() => { void refetch(); }} type="button">
                다시 시도
              </button>
            </div>
          )}
        </div>

      </div>
      <p className="text-center text-sm leading-relaxed text-theme-text-secondary">
        기록하지 못한 날이 있어도 괜찮아요.<br />
        나의 속도로 시작해요.
      </p>
    </section>
  );
};

export default LoginBottomSection;
