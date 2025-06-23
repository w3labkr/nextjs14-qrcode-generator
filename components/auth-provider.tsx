"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useTokenRefresh } from "@/hooks/use-token-refresh";
import { useRememberMe } from "@/hooks/use-remember-me";
import { TOKEN_CONFIG } from "@/lib/constants";

interface AuthProviderProps {
  children: React.ReactNode;
}

function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  useTokenRefresh();
  useRememberMe(); // rememberMe 값 설정
  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5분
            gcTime: 1000 * 60 * 10, // 10분
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider
        refetchInterval={TOKEN_CONFIG.SESSION_REFETCH_INTERVAL}
        refetchOnWindowFocus={true}
      >
        <TokenRefreshProvider>{children}</TokenRefreshProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
