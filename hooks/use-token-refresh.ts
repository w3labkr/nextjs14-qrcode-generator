"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

interface ExtendedSession {
  accessTokenExpires?: number;
  error?: string;
}

export function useTokenRefresh() {
  const { data: session, status } = useSession();
  const extendedSession = session as ExtendedSession;

  useEffect(() => {
    // 토큰 에러가 있는 경우 자동 로그아웃
    if (extendedSession?.error === "RefreshAccessTokenError") {
      console.warn("토큰 갱신 실패로 인한 자동 로그아웃");
      signOut({ callbackUrl: "/auth/signin" });
      return;
    }

    // 토큰 만료 임박 시 자동 갱신 (5분 전)
    if (extendedSession?.accessTokenExpires) {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = extendedSession.accessTokenExpires - now;

      // 5분(300초) 전에 토큰 갱신 시도
      if (timeUntilExpiry <= 300 && timeUntilExpiry > 0) {
        // NextAuth.js는 자동으로 토큰을 갱신하므로 세션을 다시 가져오기만 하면 됨
        console.log("토큰 만료 임박, 자동 갱신 중...");
        // 세션 업데이트를 트리거하여 토큰 갱신 확인
        const checkSession = async () => {
          try {
            await fetch("/api/auth/session");
          } catch (error) {
            console.error("세션 확인 중 오류:", error);
          }
        };
        checkSession();
      }
    }
  }, [extendedSession]);

  return {
    session: extendedSession,
    status,
    isTokenExpiring: extendedSession?.accessTokenExpires
      ? Math.floor(Date.now() / 1000) >=
        extendedSession.accessTokenExpires - 300
      : false,
    hasTokenError: extendedSession?.error === "RefreshAccessTokenError",
  };
}
