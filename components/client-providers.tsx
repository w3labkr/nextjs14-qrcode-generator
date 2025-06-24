"use client";

import { ReactNode, Suspense } from "react";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/loading-spinner";

const AuthProvider = dynamic(
  () => import("@/components/auth-provider").then((mod) => mod.AuthProvider),
  {
    ssr: false,
    loading: () => <LoadingSpinner />,
  },
);

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  );
}
