"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileDown, FileText } from "lucide-react";
import { exportUserData } from "@/app/actions/data-management";
import { convertQrCodesToCSV, convertTemplatesToCSV } from "@/lib/csv-utils";
import { toast } from "sonner";

// 안전한 파일 다운로드 함수
const downloadFile = (blob: Blob, filename: string) => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    // 짧은 지연 후 정리
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("파일 다운로드 오류:", error);
    throw new Error("파일 다운로드에 실패했습니다.");
  }
};

export default function ExportSection() {
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  const handleJSONExport = async () => {
    try {
      setIsExportingJSON(true);
      const data = await exportUserData();

      // JSON 파일로 다운로드
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], {
        type: "application/json;charset=utf-8",
      });

      const filename = `qr-data-export-${new Date().toISOString().split("T")[0]}.json`;
      downloadFile(blob, filename);

      toast.success(
        `JSON 데이터를 성공적으로 내보냈습니다! (QR 코드: ${data.qrCodes.length}개, 템플릿: ${data.templates.length}개)`,
      );
    } catch (error) {
      console.error("JSON 내보내기 오류:", error);
      toast.error("JSON 데이터 내보내기에 실패했습니다.");
    } finally {
      setIsExportingJSON(false);
    }
  };

  const handleCSVExport = async () => {
    try {
      setIsExportingCSV(true);
      const data = await exportUserData();

      console.log("내보낼 데이터:", data);

      const date = new Date().toISOString().split("T")[0];

      // QR 코드 CSV 파일
      const qrCsv = convertQrCodesToCSV(data.qrCodes);
      console.log("QR CSV 데이터:", qrCsv.substring(0, 200) + "...");

      const qrBlob = new Blob(["\uFEFF" + qrCsv], {
        type: "text/csv;charset=utf-8",
      });
      downloadFile(qrBlob, `qr-codes-${date}.csv`);

      // 템플릿 CSV 파일 (짧은 지연 후 다운로드)
      setTimeout(() => {
        const templateCsv = convertTemplatesToCSV(data.templates);
        console.log(
          "템플릿 CSV 데이터:",
          templateCsv.substring(0, 200) + "...",
        );

        const templateBlob = new Blob(["\uFEFF" + templateCsv], {
          type: "text/csv;charset=utf-8",
        });
        downloadFile(templateBlob, `templates-${date}.csv`);
      }, 300);

      toast.success(
        `CSV 데이터를 성공적으로 내보냈습니다! (QR 코드: ${data.qrCodes.length}개, 템플릿: ${data.templates.length}개)`,
      );
    } catch (error) {
      console.error("CSV 내보내기 오류:", error);
      toast.error("CSV 데이터 내보내기에 실패했습니다.");
    } finally {
      setIsExportingCSV(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileDown className="h-4 w-4" />
        <h4 className="font-medium">데이터 내보내기</h4>
      </div>
      <p className="text-sm text-muted-foreground">
        모든 QR 코드와 템플릿을 JSON 또는 CSV 파일로 내보냅니다.
      </p>
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleJSONExport}
          disabled={isExportingJSON || isExportingCSV}
          variant="outline"
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExportingJSON ? "내보내는 중..." : "JSON으로 내보내기"}
        </Button>
        <Button
          onClick={handleCSVExport}
          disabled={isExportingJSON || isExportingCSV}
          variant="outline"
          className="w-full"
        >
          <FileText className="h-4 w-4 mr-2" />
          {isExportingCSV ? "내보내는 중..." : "CSV로 내보내기"}
        </Button>
      </div>
    </div>
  );
}
