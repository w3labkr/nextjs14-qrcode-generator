"use client";

import { useSession } from "next-auth/react";

import { UserNav } from "@/components/user-nav";
import { COPYRIGHT_TEXT } from "@/lib/constants";
import { Unauthenticated } from "@/components/unauthenticated";
import { NewQrCodeButton } from "@/components/new-qr-code-button";

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">계정 관리</h1>
              <p className="text-muted-foreground">&nbsp;</p>
            </div>
            <div className="flex items-center space-x-4">
              <NewQrCodeButton />
              <UserNav />
            </div>
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 animate-pulse rounded-lg"
              />
            ))}
          </div>
          <div className="mt-auto pt-16 text-center text-sm text-muted-foreground">
            {COPYRIGHT_TEXT}
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Unauthenticated description="계정 정보를 관리하려면 로그인해주세요." />
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">계정 관리</h1>
            <p className="text-muted-foreground">
              계정 정보를 확인하고 보안 설정을 관리하세요.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <NewQrCodeButton />
            <UserNav />
          </div>
        </div>
        {children}
        <div className="mt-auto pt-16 text-center text-sm text-muted-foreground">
          {COPYRIGHT_TEXT}
        </div>
      </div>
    </div>
  );
}
