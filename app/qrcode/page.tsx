"use client";

export const dynamic = "force-dynamic";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { debounce } from "lodash";

import { GithubBadge } from "@/components/github-badge";
import { UserNav } from "@/components/user-nav";
import { QrCodeTabs } from "@/components/qr-code-tabs";
import { QrCodeSettingsPanel } from "@/components/qr-code-settings-panel";
import { QrCodePreviewCard } from "@/components/qr-code-preview-card";
import TemplateManager from "@/components/template-manager";
import { useQrCodeGenerator } from "@/hooks/use-qr-code-generator";

export default function QrCodePage() {
  const { data: session } = useSession();
  const {
    // State
    qrData,
    setQrData,
    activeTab,
    qrCode,
    highResQrCode,
    isLoading,
    isGeneratingHighRes,
    isEditMode,
    foregroundColor,
    setForegroundColor,
    backgroundColor,
    setBackgroundColor,
    logo,
    format,
    frameOptions,
    setFrameOptions,

    // Handlers
    handleLogoUpload,
    handleGenerate,
    handleFormatChange,
    handleTabChange,
    handleGenerateHighRes,
    handleLoadTemplate,
    getCurrentSettings,
    getDownloadFilename,
    getHighResDownloadFilename,
  } = useQrCodeGenerator();

  // QR 데이터 변경을 debounce 처리
  const debouncedSetQrData = useMemo(
    () => debounce(setQrData, 200),
    [setQrData],
  );

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
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
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <GithubBadge />
        <div className="z-10 w-full max-w-4xl items-start justify-between font-mono text-sm lg:flex gap-8">
          <div className="flex flex-col gap-4 flex-1">
            <QrCodeTabs
              qrData={qrData}
              setQrData={debouncedSetQrData}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            <QrCodeSettingsPanel
              foregroundColor={foregroundColor}
              setForegroundColor={setForegroundColor}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              logo={logo}
              onLogoUpload={handleLogoUpload}
              frameOptions={frameOptions}
              setFrameOptions={setFrameOptions}
            />

            {session?.user && (
              <TemplateManager
                currentSettings={getCurrentSettings(qrData)}
                onLoadTemplate={handleLoadTemplate}
              />
            )}
          </div>

          <div className="flex-1 mt-8 lg:mt-0">
            <QrCodePreviewCard
              qrCode={qrCode}
              frameOptions={frameOptions}
              format={format}
              onFormatChange={handleFormatChange}
              onGenerate={handleGenerate}
              onGenerateHighRes={handleGenerateHighRes}
              isLoading={isLoading}
              isGeneratingHighRes={isGeneratingHighRes}
              isEditMode={isEditMode}
              qrData={qrData}
              highResQrCode={highResQrCode}
              getDownloadFilename={getDownloadFilename}
              getHighResDownloadFilename={getHighResDownloadFilename}
              currentSettings={getCurrentSettings(qrData)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
