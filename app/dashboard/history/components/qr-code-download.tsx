"use client";

import { downloadQrCode } from "@/lib/download-utils";
import { toast } from "sonner";

interface QrCodeData {
  id: string;
  type: string;
  title: string | null;
  content: string;
  settings: any;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useQrCodeDownload = () => {
  const handleDownload = async (qrCode: QrCodeData) => {
    try {
      const result = await downloadQrCode(
        qrCode.content,
        qrCode.type,
        qrCode.settings,
        qrCode.title,
      );

      if (result.success) {
        toast.success("QR 코드가 다운로드되었습니다.");
      } else {
        toast.error(result.error || "다운로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("다운로드 오류:", error);
      toast.error("다운로드에 실패했습니다.");
    }
  };

  return { handleDownload };
};
