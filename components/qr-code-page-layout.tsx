"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";

import { GithubBadge } from "@/components/github-badge";
import { UserNav } from "@/components/user-nav";
import { QrCodeSettingsPanel } from "@/components/qr-code-settings-panel";
import { QrCodePreviewCard } from "@/components/qr-code-preview-card";
import TemplateManager from "@/components/template-manager";
import { useQrCodeGenerator } from "@/hooks/use-qr-code-generator";

interface QrCodePageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  qrType: string;
}

export function QrCodePageLayout({
  children,
  title,
  description,
  qrType,
}: QrCodePageLayoutProps) {
  const { data: session } = useSession();
  const {
    // State
    qrData,
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
    handleGenerateHighRes,
    handleLoadTemplate,
    getCurrentSettings,
    getDownloadFilename,
    getHighResDownloadFilename,
    activeTemplateId,
  } = useQrCodeGenerator();

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
          <h2 className="text-4xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <GithubBadge />
        <div className="z-10 w-full max-w-4xl items-start justify-between font-mono text-sm lg:flex gap-8">
          <div className="flex flex-col gap-4 flex-1">
            {children}

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
                activeTemplateId={activeTemplateId || undefined}
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
