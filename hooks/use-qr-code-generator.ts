"use client";

import { useState, useCallback, useEffect } from "react";
import { GITHUB_REPO_URL } from "@/lib/constants";
import { useQrCodeSettings } from "@/hooks/use-qr-code-settings";
import { useEditMode } from "@/hooks/use-edit-mode";
import {
  useInitialEffects,
  getDownloadFilename,
  getHighResDownloadFilename,
} from "@/hooks/use-qr-code-utils";
import { useTemplate } from "@/hooks/use-template";
import { useQrCodeGeneration } from "@/hooks/use-qr-code-generation";

export function useQrCodeGenerator() {
  const [qrData, setQrData] = useState(GITHUB_REPO_URL);
  const [activeTab, setActiveTab] = useState("url");

  const qrCodeSettings = useQrCodeSettings();

  const editMode = useEditMode({
    setQrData,
    setActiveTab,
    loadSettings: qrCodeSettings.loadSettings,
  });

  const template = useTemplate({
    loadSettings: qrCodeSettings.loadSettings,
    isEditMode: editMode.isEditMode,
  });

  const qrCodeGeneration = useQrCodeGeneration({
    qrData,
    activeTab,
    format: qrCodeSettings.format,
    getCurrentSettings: qrCodeSettings.getCurrentSettings,
    frameOptions: qrCodeSettings.frameOptions,
    isEditMode: editMode.isEditMode,
    editingQrCodeId: editMode.editingQrCodeId,
    exitEditMode: editMode.exitEditMode,
    defaultTemplateLoaded: template.defaultTemplateLoaded,
    templateApplied: template.templateApplied,
  });

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      qrCodeGeneration.setHighResQrCode("");

      if (!editMode.isEditMode) {
        if (value === "url") {
          setQrData(GITHUB_REPO_URL);
        } else {
          setQrData("");
        }
      }
    },
    [editMode.isEditMode, qrCodeGeneration.setHighResQrCode],
  );

  const handleFormatChange = useCallback(
    async (newFormat: "png" | "svg" | "jpeg") => {
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
  }, [
    template.templateApplied,
    qrData,
    template.defaultTemplateLoaded,
    qrCodeGeneration.handleGenerate,
    template.setTemplateApplied,
    qrCodeSettings.foregroundColor,
    qrCodeSettings.backgroundColor,
    qrCodeSettings.logo,
    qrCodeSettings.width,
    qrCodeSettings.frameOptions,
  ]);

  useInitialEffects();

  return {
    // State
    qrData,
    setQrData,
    activeTab,
    qrCode: qrCodeGeneration.qrCode,
    highResQrCode: qrCodeGeneration.highResQrCode,
    isLoading: qrCodeGeneration.isLoading,
    isGeneratingHighRes: qrCodeGeneration.isGeneratingHighRes,
    isEditMode: editMode.isEditMode,

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
  };
}
