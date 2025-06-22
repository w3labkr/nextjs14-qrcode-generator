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
  const handleDownload = async (
    qrCode: QrCodeData,
    downloadFormat?: string,
  ) => {
    try {
      // settings에서 원본 설정 정보 추출
      let originalSettings = {};
      try {
        originalSettings =
          typeof qrCode.settings === "string"
            ? JSON.parse(qrCode.settings)
            : qrCode.settings || {};
      } catch (e) {
        console.warn("Settings 파싱 오류, 기본값 사용:", e);
      }

      // 다운로드 형식 결정 (매개변수로 받은 형식 우선, 없으면 원본 형식, 최종적으로는 png)
      const format = downloadFormat || (originalSettings as any)?.type || "png";

      const result = await downloadQrCode(
        qrCode.content,
        qrCode.type,
        originalSettings, // 원본 설정값 전달
        qrCode.title,
        format,
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
