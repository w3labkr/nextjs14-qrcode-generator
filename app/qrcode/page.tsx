"use client";

export const dynamic = "force-dynamic";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { debounce } from "lodash";
import { GithubBadge } from "@/components/github-badge";
import { PageHeader } from "@/components/page-header";
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
      <PageHeader isEditMode={isEditMode} />

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
