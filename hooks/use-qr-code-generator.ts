"use client";

import { useState, useCallback, useEffect } from "react";
import { useQrCodeSettings } from "@/hooks/use-qr-code-settings";
import {
  useInitialEffects,
  getDownloadFilename,
  getHighResDownloadFilename,
} from "@/hooks/use-qr-code-utils";
import { useTemplate } from "@/hooks/use-template";
import { useQrCodeGeneration } from "@/hooks/use-qr-code-generation";

export function useQrCodeGenerator() {
  const [qrData, setQrData] = useState("");
  const [activeTab, setActiveTab] = useState("url");
  const qrCodeSettings = useQrCodeSettings();

  const template = useTemplate({
    loadSettings: qrCodeSettings.loadSettings,
  });

  const qrCodeGeneration = useQrCodeGeneration({
    qrData,
    activeTab,
    format: qrCodeSettings.format,
    getCurrentSettings: qrCodeSettings.getCurrentSettings,
    frameOptions: qrCodeSettings.frameOptions,
    defaultTemplateLoaded: template.defaultTemplateLoaded,
    templateApplied: template.templateApplied,
  });

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      qrCodeGeneration.setHighResQrCode("");
      // 탭 변경 시 qrData를 초기화
      setQrData("");
    },
    [qrCodeGeneration.setHighResQrCode],
  );

  const handleFormatChange = useCallback(
    async (newFormat: "png" | "svg" | "jpg") => {
      qrCodeSettings.setFormat(newFormat);
      await qrCodeGeneration.handleFormatChange(newFormat);
    },
    [qrCodeSettings.setFormat, qrCodeGeneration.handleFormatChange],
  );

  // 템플릿 적용 후 QR 코드 자동 재생성
  useEffect(() => {
    if (template.templateApplied && qrData && template.defaultTemplateLoaded) {
      qrCodeGeneration.handleGenerate();
      template.setTemplateApplied(false);
    }
  }, [template.templateApplied, qrData, template.defaultTemplateLoaded]);

  useInitialEffects();

  return {
    // State
    qrData,
    setQrData,
    activeTab,
    setActiveTab,
    qrCode: qrCodeGeneration.qrCode,
    highResQrCode: qrCodeGeneration.highResQrCode,
    isLoading: qrCodeGeneration.isLoading,
    isGeneratingHighRes: qrCodeGeneration.isGeneratingHighRes,

    // Settings
    foregroundColor: qrCodeSettings.foregroundColor,
    setForegroundColor: qrCodeSettings.setForegroundColor,
    backgroundColor: qrCodeSettings.backgroundColor,
    setBackgroundColor: qrCodeSettings.setBackgroundColor,
    logo: qrCodeSettings.logo,
    format: qrCodeSettings.format,
    width: qrCodeSettings.width,
    setWidth: qrCodeSettings.setWidth,
    frameOptions: qrCodeSettings.frameOptions,
    setFrameOptions: qrCodeSettings.setFrameOptions,

    // Handlers
    handleLogoUpload: qrCodeSettings.handleLogoUpload,
    handleGenerate: qrCodeGeneration.handleGenerate,
    handleFormatChange,
    handleTabChange,
    handleGenerateHighRes: qrCodeGeneration.handleGenerateHighRes,
    handleLoadTemplate: template.handleLoadTemplate,
    getCurrentSettings: qrCodeSettings.getCurrentSettings,
    getDownloadFilename: () => getDownloadFilename(qrCodeSettings.format),
    getHighResDownloadFilename: () =>
      getHighResDownloadFilename(qrCodeSettings.format),

    // Template
    activeTemplateId: template.activeTemplateId,
  };
}
