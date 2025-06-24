"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { getRememberMeCookie } from "@/lib/auth-utils";

export function useRememberMe() {
  const { data: session, update } = useSession();
  const hasUpdated = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 로그인 직후 한 번만 실행
    if (
      session?.user &&
      !hasUpdated.current &&
      (session as any).rememberMe === undefined // rememberMe가 아직 설정되지 않은 경우
    ) {
      const rememberMe = getRememberMeCookie();

      // 세션 업데이트를 통해 rememberMe 값 설정
      update({ rememberMe });
      hasUpdated.current = true;

      console.log("로그인 후 rememberMe 값 설정:", rememberMe);
    }
  }, [session, update]);

  return session;
}
