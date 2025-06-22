"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  generateQrCode,
  generateAndSaveQrCode,
  generateHighResQrCode,
  updateQrCode,
} from "@/app/actions/qr-code";
import usePdfGenerator from "@/hooks/use-pdf-generator";
import type { QrCodeFormat, QrCodeType, FrameOptions } from "@/types/qr-code";
import type { QrCodeOptions } from "@/app/actions/qr-code";

interface UseQrCodeGenerationProps {
  qrData: string;
  activeTab: string;
  format: QrCodeFormat;
  getCurrentSettings: (qrData: string) => QrCodeOptions;
  frameOptions: FrameOptions;
  isEditMode: boolean;
  editingQrCodeId: string | null;
  exitEditMode: () => void;
  defaultTemplateLoaded: boolean;
  templateApplied: boolean;
}

export function useQrCodeGeneration({
  qrData,
  activeTab,
  format,
  getCurrentSettings,
  frameOptions,
  isEditMode,
  editingQrCodeId,
  exitEditMode,
  defaultTemplateLoaded,
  templateApplied,
}: UseQrCodeGenerationProps) {
  const { data: session } = useSession();
  const { generatePdf } = usePdfGenerator();

  const [qrCode, setQrCode] = useState("");
  const [highResQrCode, setHighResQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingHighRes, setIsGeneratingHighRes] = useState(false);

  const getQrType = useCallback((tab: string): QrCodeType => {
    switch (tab) {
      case "url":
        return "URL";
      case "wifi":
        return "WIFI";
      case "email":
        return "EMAIL";
      case "sms":
        return "SMS";
      case "vcard":
        return "VCARD";
      case "location":
        return "LOCATION";
      default:
        return "TEXT";
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!qrData) return;

    setIsLoading(true);
    try {
      const qrType = getQrType(activeTab);
      const settings = getCurrentSettings(qrData);

      if (session?.user) {
        let result: any = null;

        if (isEditMode && editingQrCodeId) {
          const updateResult = await updateQrCode(editingQrCodeId, {
            ...settings,
            type: format === "pdf" ? "png" : format,
            qrType,
            title: `${qrType} QR 코드 - ${new Date().toLocaleDateString("ko-KR")}`,
          });

          if (updateResult.success) {
            result = {
              qrCodeDataUrl: updateResult.qrCodeDataUrl,
              savedId: editingQrCodeId,
            };
            toast.success("QR 코드가 성공적으로 업데이트되었습니다!");
            exitEditMode();
          } else {
            toast.error(
              updateResult.error || "QR 코드 업데이트에 실패했습니다.",
            );
            return;
          }
        } else {
          result = await generateAndSaveQrCode({
            ...settings,
            type: format === "pdf" ? "png" : format,
            qrType,
            title: `${qrType} QR 코드`,
          });
        }

        if (format === "pdf" && result) {
          const pdfDataUrl = await generatePdf({
            qrCodeUrl: result.qrCodeDataUrl,
            qrText: qrData,
            frameOptions:
              frameOptions.type !== "none" ? frameOptions : undefined,
          });
          setQrCode(pdfDataUrl);
        } else if (result) {
          setQrCode(result.qrCodeDataUrl);
        }

        if (result?.savedId && !isEditMode) {
          if (!defaultTemplateLoaded || !templateApplied) {
            toast.success("QR 코드가 생성되고 히스토리에 저장되었습니다!");
          }
        }
      } else {
        if (format === "pdf") {
          const pngOptions = {
            ...settings,
            type: "png" as const,
          };

          // @ts-ignore
          const pngDataUrl = await generateQrCode(pngOptions);

          const pdfDataUrl = await generatePdf({
            qrCodeUrl: pngDataUrl,
            qrText: qrData,
            frameOptions:
              frameOptions.type !== "none" ? frameOptions : undefined,
          });

          setQrCode(pdfDataUrl);
        } else {
          const options = {
            ...settings,
            type: format,
          };

          // @ts-ignore
          const qrCodeDataUrl = await generateQrCode(options);
          setQrCode(qrCodeDataUrl);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("QR 코드 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [
    qrData,
    activeTab,
    format,
    getCurrentSettings,
    frameOptions,
    session?.user,
    isEditMode,
    editingQrCodeId,
    exitEditMode,
    defaultTemplateLoaded,
    templateApplied,
    generatePdf,
    getQrType,
  ]);

  const handleFormatChange = useCallback(
    async (newFormat: QrCodeFormat) => {
      if (
        qrCode &&
        newFormat === "pdf" &&
        qrCode.indexOf("data:application/pdf") === -1
      ) {
        setIsLoading(true);
        try {
          const pdfDataUrl = await generatePdf({
            qrCodeUrl: qrCode,
            qrText: qrData,
            frameOptions:
              frameOptions.type !== "none" ? frameOptions : undefined,
          });
          setQrCode(pdfDataUrl);
        } catch (error) {
          console.error("PDF 변환 오류:", error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [qrCode, qrData, frameOptions, generatePdf],
  );

  const handleGenerateHighRes = useCallback(async () => {
    if (!qrData || !session?.user) return;

    setIsGeneratingHighRes(true);
    try {
      const settings = getCurrentSettings(qrData);
      const highResOptions = {
        ...settings,
        type: format === "pdf" ? "png" : format,
        width: 4096,
      };

      // @ts-ignore
      const highResDataUrl = await generateHighResQrCode(highResOptions);
      setHighResQrCode(highResDataUrl);
      toast.success("고해상도 QR 코드가 생성되었습니다! (4096x4096)");
    } catch (error) {
      console.error("고해상도 QR 코드 생성 오류:", error);
      toast.error("고해상도 QR 코드 생성에 실패했습니다.");
    } finally {
      setIsGeneratingHighRes(false);
    }
  }, [qrData, session?.user, getCurrentSettings, format]);

  return {
    qrCode,
    setQrCode,
    highResQrCode,
    setHighResQrCode,
    isLoading,
    isGeneratingHighRes,
    handleGenerate,
    handleFormatChange,
    handleGenerateHighRes,
  };
}
