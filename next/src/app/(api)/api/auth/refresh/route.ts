import { randomUUID } from 'node:crypto';
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  clearAccessRefreshToken,
  rotateRefreshToken,
  RefreshTokenError,
} from "@/common/auth/token";

/**
 * 리프레시 토큰을 검증하고 현재 로그인 세션을 rotation한다.
 */
export const POST = async () => {
  const requestId = randomUUID();
  const startedAt = Date.now();
  // 1. refresh token은 HttpOnly 쿠키이므로 서버에서 직접 읽는다.
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const hasAccessToken = Boolean(cookieStore.get('accessToken')?.value);

  console.info('[auth.refresh]', {
    requestId,
    outcome: 'started',
    hasAccessToken,
    hasRefreshToken: Boolean(refreshToken),
  });

  const logResult = (outcome: 'success' | 'rejected' | 'error', reason: string, status: number) => {
    const details = { requestId, outcome, reason, status, durationMs: Date.now() - startedAt };
    if (outcome === 'error') console.error('[auth.refresh]', details);
    else if (outcome === 'rejected') console.warn('[auth.refresh]', details);
    else console.info('[auth.refresh]', details);
  };

  if (!refreshToken) {
    logResult('rejected', 'MISSING_REFRESH_COOKIE', 401);
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    // 2. JWT 검증, 서버 세션 검증, currentTokenHash 비교,
    //    rotation, 새 쿠키 저장까지 rotateRefreshToken에서 수행한다.
    await rotateRefreshToken(refreshToken);
    logResult('success', 'TOKENS_ROTATED', 200);

    // 3. 토큰 원문은 JSON으로 반환하지 않는다.
    //    성공 시 Set-Cookie 헤더로 브라우저 쿠키가 교체된다.
    return NextResponse.json({ result: true });
  } catch (error) {
    if (error instanceof RefreshTokenError && error.code === 'EXPIRED') {
      logResult('rejected', 'REFRESH_SESSION_EXPIRED', 401);
      await clearAccessRefreshToken();
      return NextResponse.json({ error: "리프레시 토큰이 만료되었습니다." }, { status: 401 });
    }

    if (
      error instanceof RefreshTokenError ||
      (error instanceof Error && (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError'))
    ) {
      const reason = error instanceof RefreshTokenError
        ? error.code === 'INVALID'
          ? error.message === '이미 폐기된 로그인 세션입니다.'
            ? 'REFRESH_SESSION_REVOKED'
            : error.message === '유효하지 않은 로그인 세션입니다.'
              ? 'REFRESH_SESSION_NOT_FOUND'
              : 'REFRESH_TOKEN_INVALID'
          : `REFRESH_SESSION_${error.code}`
        : error instanceof Error && error.name === 'TokenExpiredError'
          ? 'REFRESH_JWT_EXPIRED'
          : 'REFRESH_JWT_INVALID';
      logResult('rejected', reason, 401);
      await clearAccessRefreshToken();
      return NextResponse.json({ error: "유효하지 않은 리프레시 토큰입니다." }, { status: 401 });
    }

    logResult('error', 'INTERNAL_ERROR', 500);
    return NextResponse.json({ error: "서버 에러가 발생했습니다." }, { status: 500 });
  }
};
