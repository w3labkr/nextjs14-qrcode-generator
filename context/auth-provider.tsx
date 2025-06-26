"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useTokenRefresh } from "@/hooks/use-token-refresh";
import { useRememberMe } from "@/hooks/use-remember-me";
import { appConfig } from "@/config/app";

interface AuthProviderProps {
  children: React.ReactNode;
}

function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useTokenRefresh();
  useRememberMe();

  if (!isMounted) {
    return <>{children}</>;
  }

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
        refetchInterval={appConfig.session.sessionRefetchInterval}
        refetchOnWindowFocus={true}
      >
        <TokenRefreshProvider>{children}</TokenRefreshProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
