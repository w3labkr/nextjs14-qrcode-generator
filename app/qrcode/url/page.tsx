"use client";

export const dynamic = "force-dynamic";

import { useMemo, useEffect } from "react";
import { debounce } from "lodash";
import { useSession } from "next-auth/react";

import { GithubBadge } from "@/components/github-badge";
import { UserNav } from "@/components/user-nav";
import { QrCodeSettingsPanel } from "@/components/qr-code-settings-panel";
import { QrCodePreviewCard } from "@/components/qr-code-preview-card";
import TemplateManager from "@/components/template-manager";
import { QrCodeTypeNavigation } from "@/components/qr-code-type-navigation";
import { UrlForm } from "@/app/qrcode/url/url-form";
import { useQrCodeGenerator } from "@/hooks/use-qr-code-generator";

export default function UrlQrCodePage() {
  const { data: session } = useSession();
  const {
    qrData,
    setQrData,
    setActiveTab,
    // State
    qrCode,
    highResQrCode,
    isLoading,
    isGeneratingHighRes,
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

  // QR 데이터 변경을 debounce 처리
  const debouncedSetQrData = useMemo(
    () => debounce(setQrData, 200),
    [setQrData],
  );

  // 컴포넌트 마운트 시 활성 탭 설정
  useEffect(() => {
    setActiveTab("url");
  }, [setActiveTab]);

  // 각 폼에서 데이터가 변경될 때 QR 데이터 업데이트
  const handleFormDataChange = (data: string) => {
    debouncedSetQrData(data);
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        {/* 상단 네비게이션 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">QR 코드 생성기</h1>
            </div>
            <UserNav />
          </div>
        </div>

        {/* 메인 제목과 설명 */}
        <div className="flex flex-col gap-4 mb-8">
          <h2 className="text-4xl font-bold">URL QR 코드 생성기</h2>
          <p className="text-muted-foreground">
            웹사이트 주소를 QR 코드로 변환하여 쉽게 공유하세요.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <GithubBadge />
        <div className="z-10 w-full max-w-4xl items-start justify-between font-mono text-sm lg:flex gap-8">
          <div className="flex flex-col gap-4 flex-1">
            <QrCodeTypeNavigation />
            <UrlForm value={qrData} onChange={handleFormDataChange} />

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
