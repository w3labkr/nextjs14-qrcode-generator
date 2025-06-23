"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { exportUserData } from "@/app/actions/data-management";
import { downloadAsJSON } from "@/lib/download-utils";

interface QrCodesJSONExportButtonProps {
  disabled?: boolean;
}

export default function QrCodesJSONExportButton({
  disabled = false,
}: QrCodesJSONExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleQrCodesJSONExport = async () => {
    try {
      setIsExporting(true);

      // 데이터 가져오기
      const data = await exportUserData();
      const date = new Date().toISOString().split("T")[0];

      // QR 코드 데이터만 추출
      const qrCodesData = {
        qrCodes: data.qrCodes,
        exportDate: new Date().toISOString(),
        dataType: "qr-codes",
        count: data.qrCodes.length,
      };

      // 파일명 생성
      const filename = `qr-codes-${date}.json`;

      // 다운로드 실행
      downloadAsJSON(qrCodesData, filename);

      // 사용자에게 다운로드 시작 알림
      toast.success(
        `QR 코드 JSON 다운로드가 시작되었습니다! (${data.qrCodes.length}개)`,
        {
          description: "QR 코드 데이터가 JSON 파일로 다운로드됩니다.",
        },
      );

      // 브라우저가 팝업을 차단했을 경우를 대비한 추가 안내
      setTimeout(() => {
        toast.info(
          "다운로드가 시작되지 않았다면 브라우저의 팝업 차단 설정을 확인해주세요.",
          {
            duration: 3000,
          },
        );
      }, 1000);
    } catch (error) {
      console.error("QR 코드 JSON 내보내기 오류:", error);
      toast.error("QR 코드 JSON 데이터 내보내기에 실패했습니다.", {
        description:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleQrCodesJSONExport}
      disabled={disabled || isExporting}
      variant="outline"
      className="w-full"
    >
      <QrCode className="h-4 w-4 mr-2" />
      {isExporting ? "내보내는 중..." : "QR 코드 JSON 내보내기"}
    </Button>
  );
}
