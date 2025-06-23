"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { exportUserData } from "@/app/actions/data-management";
import { convertQrCodesToCSV, convertTemplatesToCSV } from "@/lib/csv-utils";
import { downloadAsCSV } from "@/lib/download-utils";

interface CSVExportButtonProps {
  disabled?: boolean;
}

export default function CSVExportButton({
  disabled = false,
}: CSVExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleCSVExport = async () => {
    try {
      setIsExporting(true);

      // 데이터 가져오기
      const data = await exportUserData();

      console.log("내보낼 데이터:", data);

      const date = new Date().toISOString().split("T")[0];

      // QR 코드 CSV 파일 생성 및 다운로드
      const qrCsv = convertQrCodesToCSV(data.qrCodes);
      console.log("QR CSV 데이터:", qrCsv.substring(0, 200) + "...");
      downloadAsCSV(qrCsv, `qr-codes-${date}.csv`);

      // 템플릿 CSV 파일 생성 및 다운로드 (짧은 지연 후)
      setTimeout(() => {
        const templateCsv = convertTemplatesToCSV(data.templates);
        console.log(
          "템플릿 CSV 데이터:",
          templateCsv.substring(0, 200) + "...",
        );
        downloadAsCSV(templateCsv, `templates-${date}.csv`);
      }, 500);

      // 성공 메시지
      toast.success(
        `CSV 데이터 다운로드가 시작되었습니다! (QR 코드: ${data.qrCodes.length}개, 템플릿: ${data.templates.length}개)`,
        {
          description: "2개의 CSV 파일이 다운로드 폴더에 저장됩니다.",
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
      console.error("CSV 내보내기 오류:", error);
      toast.error("CSV 데이터 내보내기에 실패했습니다.", {
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
      onClick={handleCSVExport}
      disabled={disabled || isExporting}
      variant="outline"
      className="w-full"
    >
      <FileText className="h-4 w-4 mr-2" />
      {isExporting ? "내보내는 중..." : "CSV로 내보내기"}
    </Button>
  );
}
