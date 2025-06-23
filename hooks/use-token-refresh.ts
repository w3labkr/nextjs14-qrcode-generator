"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useCallback } from "react";
import { TOKEN_CONFIG } from "@/lib/constants";

interface ExtendedSession {
  accessTokenExpires?: number;
  rememberMe?: boolean;
  error?: string;
}

export function useTokenRefresh() {
  const { data: session, status, update } = useSession();
  const extendedSession = session as ExtendedSession;
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const refreshToken = useCallback(async () => {
    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    console.log("토큰 자동 갱신 시작...");

    try {
      // 세션 업데이트를 통해 토큰 갱신 트리거
      await update();
      console.log("토큰 갱신 완료");
    } catch (error) {
      console.error("토큰 갱신 중 오류:", error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [update]);

  const scheduleTokenRefresh = useCallback(
    (expiresAt: number) => {
      // 기존 타이머 클리어
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      // 토큰이 설정된 시간(기본 5분) 전에 갱신되도록 스케줄링
      const refreshTime = Math.max(
        0,
        (timeUntilExpiry - TOKEN_CONFIG.REFRESH_THRESHOLD_SECONDS) * 1000,
      );

      if (refreshTime > 0) {
        console.log(
          `토큰 갱신이 ${Math.floor(refreshTime / 1000)}초 후에 예약됨`,
        );
        refreshTimeoutRef.current = setTimeout(() => {
          refreshToken();
        }, refreshTime);
      } else if (timeUntilExpiry > 0) {
        // 이미 갱신 시점이 지났지만 아직 만료되지 않은 경우 즉시 갱신
        refreshToken();
      }
    },
    [refreshToken],
  );

  useEffect(() => {
    // 토큰 에러가 있는 경우 자동 로그아웃
    if (extendedSession?.error === "RefreshAccessTokenError") {
      console.warn("토큰 갱신 실패로 인한 자동 로그아웃");
      signOut({ callbackUrl: "/auth/signin" });
      return;
    }

    // 세션이 로드되고 토큰 만료 시간이 있는 경우 갱신 스케줄링
    if (
      status === "authenticated" &&
      extendedSession?.accessTokenExpires &&
      !extendedSession.error
    ) {
      scheduleTokenRefresh(extendedSession.accessTokenExpires);
    }

    // 컴포넌트 언마운트 시 타이머 클리어
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [extendedSession, status, scheduleTokenRefresh]);

  return {
    session: extendedSession,
    status,
    isTokenExpiring: extendedSession?.accessTokenExpires
      ? Math.floor(Date.now() / 1000) >=
        extendedSession.accessTokenExpires -
          TOKEN_CONFIG.REFRESH_THRESHOLD_SECONDS
      : false,
    hasTokenError: extendedSession?.error === "RefreshAccessTokenError",
    refreshToken,
    timeUntilExpiry: extendedSession?.accessTokenExpires
      ? Math.max(
          0,
          extendedSession.accessTokenExpires - Math.floor(Date.now() / 1000),
        )
      : 0,
  };
}
