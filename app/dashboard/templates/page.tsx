"use client";

import { useSession } from "next-auth/react";
import TemplateManager from "@/components/template-manager";
import { UserNav } from "@/components/user-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { QrCodeOptions } from "@/app/actions/qr-code";

export default function TemplatesPage() {
  const { data: session, status } = useSession();

  // 템플릿 적용 함수 (여기서는 알림만 표시)
  const handleLoadTemplate = (settings: QrCodeOptions) => {
    // 메인 페이지로 이동하면서 설정을 전달하거나 로컬 스토리지에 저장
    localStorage.setItem("qr-template-settings", JSON.stringify(settings));
    window.location.href = "/";
  };

  // 현재 설정 (기본값)
  const getCurrentSettings = (): QrCodeOptions => ({
    text: "",
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    width: 400,
  });

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">템플릿 관리</h1>
            <UserNav />
          </div>
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-32 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">템플릿 관리</h1>
            <UserNav />
          </div>
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>로그인이 필요합니다</CardTitle>
              <CardDescription>
                템플릿 기능을 사용하려면 로그인해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/auth/signin">로그인</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">템플릿 관리</h1>
            <p className="text-muted-foreground mt-2">
              자주 사용하는 QR 코드 설정을 템플릿으로 저장하고 관리하세요.
            </p>
          </div>
          <UserNav />
        </div>

        <div className="space-y-6">
          {/* 템플릿 관리자 */}
          <TemplateManager
            currentSettings={getCurrentSettings()}
            onLoadTemplate={handleLoadTemplate}
          />

          {/* 안내 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>템플릿 사용 방법</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">1. 템플릿 저장</h4>
                  <p className="text-sm text-muted-foreground">
                    메인 페이지에서 QR 코드를 커스터마이징한 후 "현재 설정 저장"
                    버튼으로 템플릿을 저장하세요.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">2. 템플릿 적용</h4>
                  <p className="text-sm text-muted-foreground">
                    저장된 템플릿의 "적용" 버튼을 클릭하면 해당 설정이 즉시
                    적용됩니다.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">3. 기본 템플릿</h4>
                  <p className="text-sm text-muted-foreground">
                    자주 사용하는 템플릿을 기본 템플릿으로 설정하면 로그인 시
                    자동으로 적용됩니다.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">4. 템플릿 관리</h4>
                  <p className="text-sm text-muted-foreground">
                    이름 변경, 기본 설정 변경, 삭제 등 템플릿을 자유롭게 관리할
                    수 있습니다.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button asChild>
                  <Link href="/">QR 코드 생성기로 이동</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
