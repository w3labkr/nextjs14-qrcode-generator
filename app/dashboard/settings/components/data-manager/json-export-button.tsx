"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportUserData } from "@/app/actions/data-management";
import { downloadAsJSON } from "@/lib/download-utils";

interface JSONExportButtonProps {
  disabled?: boolean;
}

export default function JSONExportButton({
  disabled = false,
}: JSONExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleJSONExport = async () => {
    try {
      setIsExporting(true);

      // 데이터 가져오기
      const data = await exportUserData();

      // 파일명 생성
      const filename = `qr-data-export-${new Date().toISOString().split("T")[0]}.json`;

      // 다운로드 실행
      downloadAsJSON(data, filename);

      // 사용자에게 다운로드 시작 알림
      toast.success(
        `JSON 데이터 다운로드가 시작되었습니다! (QR 코드: ${data.data.qrCodes.length}개, 템플릿: ${data.data.templates.length}개)`,
        {
          description: "파일이 다운로드 폴더에 저장됩니다.",
        },
      );

      // 브라우저가 팝업을 차단했을 경우를 대비한 추가 안내
      setTimeout(() => {
        toast.info(
          "다운로드가 시작되지 않았다면 브라우저의 팝업 차단 설정을 확인해주세요.",
          {
            duration: 5000,
          },
        );
      }, 2000);
    } catch (error) {
      console.error("JSON 내보내기 오류:", error);
      toast.error("JSON 데이터 내보내기에 실패했습니다.", {
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
      onClick={handleJSONExport}
      disabled={disabled || isExporting}
      variant="outline"
      className="w-full"
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "내보내는 중..." : "JSON으로 내보내기"}
    </Button>
  );
}
