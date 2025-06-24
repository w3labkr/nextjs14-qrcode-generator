"use client";

import { useState, useCallback, useEffect } from "react";
import { useQrCodeSettings } from "@/hooks/use-qr-code-settings";
import { useEditMode } from "@/hooks/use-edit-mode";
import {
  useInitialEffects,
  getDownloadFilename,
  getHighResDownloadFilename,
} from "@/hooks/use-qr-code-utils";
import { useTemplate } from "@/hooks/use-template";
import { useQrCodeGeneration } from "@/hooks/use-qr-code-generation";
import { useQrFormStore } from "@/hooks/use-qr-form-store";

export function useQrCodeGenerator() {
  const [qrData, setQrData] = useState("");
  const [activeTab, setActiveTab] = useState("url");

  const {
    formData,
    updateFormData,
    getQrContent,
    setActiveTab: setStoreActiveTab,
  } = useQrFormStore();
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
      setStoreActiveTab(value);
      qrCodeGeneration.setHighResQrCode("");

      if (!editMode.isEditMode) {
        // 폼 스토어에서 해당 탭의 저장된 데이터 가져오기
        const savedContent = getQrContent();

        if (value === "url") {
          // URL 탭의 경우, 저장된 데이터가 없으면 빈 문자열 사용
          const urlData = formData.url || "";
          setQrData(urlData);
          if (!formData.url) {
            updateFormData("url", "");
          }
        } else {
          // 다른 탭의 경우, 저장된 내용이 있으면 사용, 없으면 빈 문자열
          setQrData(savedContent || "");
        }
      }
    },
    [
      editMode.isEditMode,
      qrCodeGeneration.setHighResQrCode,
      setStoreActiveTab,
      getQrContent,
      formData.url,
      updateFormData,
    ],
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

  // 폼 스토어의 데이터 변경 시 qrData 동기화
  useEffect(() => {
    const content = getQrContent();
    if (content && content !== qrData && !editMode.isEditMode) {
      setQrData(content);
    }
  }, [formData, activeTab, getQrContent, qrData, editMode.isEditMode]);

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

    // Template
    activeTemplateId: template.activeTemplateId,
  };
}
