"use client";

import { useSession } from "next-auth/react";

import { UserNav } from "@/components/user-nav";
import { NewQrCodeButton } from "@/components/new-qr-code-button";
import { Unauthenticated } from "@/components/unauthenticated";
import { COPYRIGHT_TEXT } from "@/lib/constants";

interface HistoryLayoutProps {
  children: React.ReactNode;
}

export default function HistoryLayout({ children }: HistoryLayoutProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">QR 코드 히스토리</h1>
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
        </div>
        <div className="mt-auto pt-16 text-center text-sm text-muted-foreground">
          {COPYRIGHT_TEXT}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Unauthenticated description="QR 코드 히스토리를 보려면 로그인해주세요." />
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">QR 코드 히스토리</h1>
            <p className="text-muted-foreground">
              생성한 QR 코드를 관리하고 다시 다운로드하세요.
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
