"use client";

import { useSession } from "next-auth/react";

import { UserNav } from "@/components/user-nav";
import { NewQrCodeButton } from "@/components/new-qr-code-button";
import { COPYRIGHT_TEXT } from "@/lib/constants";
import { Unauthenticated } from "@/components/unauthenticated";

interface TemplatesLayoutProps {
  children: React.ReactNode;
}

export default function TemplatesLayout({ children }: TemplatesLayoutProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">템플릿 관리</h1>
              <p className="text-muted-foreground">&nbsp;</p>
            </div>
            <div className="flex items-center space-x-4">
              <NewQrCodeButton />
              <UserNav />
            </div>
          </div>
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-32 bg-gray-200 rounded-lg" />
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
      <Unauthenticated description="템플릿 관리 기능을 사용하려면 로그인해주세요." />
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">템플릿 관리</h1>
            <p className="text-muted-foreground">
              QR 코드 설정을 템플릿으로 저장하고 재사용하세요.
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
