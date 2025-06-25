"use client";

export const dynamic = "force-dynamic";

import { useMemo, useEffect } from "react";
import { debounce } from "lodash";
import { useSession } from "next-auth/react";

import { QrCodeSettingsPanel } from "@/components/qr-code-settings-panel";
import { QrCodePreviewCard } from "@/components/qr-code-preview-card";
import TemplateManager from "@/components/template-manager";
import { QrCodeTypeNavigation } from "@/components/qr-code-type-navigation";
import { VCardForm } from "@/app/qrcode/vcard/vcard-form";
import { useQrCodeGenerator } from "@/hooks/use-qr-code-generator";

export default function VCardQrCodePage() {
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

  // 디바운스된 setQrData 생성 (lodash debounce 사용)
  const debouncedSetQrData = useMemo(
    () => debounce((data: string) => setQrData(data), 300),
    [setQrData],
  );

  // 컴포넌트 마운트 시 활성 탭 설정
  useEffect(() => {
    setActiveTab("vcard");
  }, [setActiveTab]);

  // 각 폼에서 데이터가 변경될 때 QR 데이터 업데이트
  const handleFormDataChange = (data: string) => {
    debouncedSetQrData(data);
  };

  return (
    <div className="z-10 w-full max-w-4xl items-start justify-between font-mono text-sm lg:flex gap-8">
      <div className="flex flex-col gap-4 flex-1">
        <QrCodeTypeNavigation />
        <VCardForm onChange={handleFormDataChange} />

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
  );
}
