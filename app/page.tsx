"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { GithubBadge } from "@/components/github-badge";
import { PageHeader } from "@/components/page-header";
import { QrCodeTabs } from "@/components/qr-code-tabs";
import { QrCodeSettingsPanel } from "@/components/qr-code-settings-panel";
import { QrCodePreviewCard } from "@/components/qr-code-preview-card";
import TemplateManager from "@/components/template-manager";
import { useQrCodeGenerator } from "@/hooks/use-qr-code-generator";
import { COPYRIGHT_TEXT } from "@/lib/constants";

function HomePageContent() {
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

  return (
    <main className="flex min-h-screen flex-col p-4 sm:p-8 md:p-24">
      <PageHeader isEditMode={isEditMode} />

      <div className="flex-1 flex flex-col items-center justify-center">
        <GithubBadge />
        <div className="z-10 w-full max-w-4xl items-start justify-between font-mono text-sm lg:flex gap-8">
          <div className="flex flex-col gap-4 flex-1">
            <QrCodeTabs
              qrData={qrData}
              setQrData={setQrData}
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

            {/* 로그인 사용자에게만 템플릿 관리 기능 표시 */}
            {session?.user && (
              <TemplateManager
                currentSettings={getCurrentSettings()}
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
            />
          </div>
        </div>
      </div>
      <footer className="w-full mt-12 flex justify-center text-xs text-muted-foreground">
        {COPYRIGHT_TEXT}
      </footer>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
