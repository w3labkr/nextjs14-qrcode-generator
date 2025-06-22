"use client";

import { UserNav } from "@/components/user-nav";
import { OfflineIndicator } from "@/components/offline-indicator";
import { InstallPromptBanner } from "@/components/install-prompt";

interface PageHeaderProps {
  isEditMode: boolean;
}

export function PageHeader({ isEditMode }: PageHeaderProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* 상단 네비게이션 */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              {isEditMode ? "QR 코드 편집" : "QR 코드 생성기"}
            </h1>
            {isEditMode && (
              <span className="text-sm text-muted-foreground bg-blue-100 text-blue-800 px-2 py-1 rounded">
                편집 모드
              </span>
            )}
          </div>
          <UserNav />
        </div>
      </div>

      {/* 메인 제목과 설명 */}
      <div className="flex flex-col gap-4 mb-8">
        <h2 className="text-4xl font-bold">
          {isEditMode ? "QR 코드 편집하기" : "오픈소스 QR 코드 생성기"}
        </h2>
        <p className="text-muted-foreground">
          {isEditMode
            ? "기존 QR 코드의 내용과 설정을 수정하고 업데이트하세요."
            : "URL, 텍스트, Wi-Fi 등 원하는 콘텐츠를 QR 코드로 즉시 만들어보세요. 다양한 옵션으로 자유롭게 커스터마이징할 수 있습니다."}
        </p>

        {/* PWA 관련 알림들 */}
        <OfflineIndicator />
        <InstallPromptBanner />
      </div>
    </div>
  );
}
