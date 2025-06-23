"use client";

import { SessionProvider } from "next-auth/react";
import { useTokenRefresh } from "@/hooks/use-token-refresh";
import { TOKEN_CONFIG } from "@/lib/constants";

interface AuthProviderProps {
  children: React.ReactNode;
}

function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  // 토큰 자동 갱신 훅 실행
  useTokenRefresh();

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider
      // 세션 갱신 주기를 설정된 시간으로 설정
      refetchInterval={TOKEN_CONFIG.SESSION_REFETCH_INTERVAL}
      // 윈도우 포커스 시 세션 재검증
      refetchOnWindowFocus={true}
    >
      <TokenRefreshProvider>{children}</TokenRefreshProvider>
    </SessionProvider>
  );
}
