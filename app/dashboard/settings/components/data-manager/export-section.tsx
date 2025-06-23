"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileDown, FileText } from "lucide-react";
import { exportUserData } from "@/app/actions/data-management";
import { convertQrCodesToCSV, convertTemplatesToCSV } from "@/lib/csv-utils";
import { toast } from "sonner";

export default function ExportSection() {
  const [isExporting, setIsExporting] = useState(false);

  const handleJSONExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportUserData();

      // JSON 파일로 다운로드
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        `JSON 데이터를 성공적으로 내보냈습니다! (QR 코드: ${data.qrCodes.length}개, 템플릿: ${data.templates.length}개)`,
      );
    } catch (error) {
      console.error("JSON 내보내기 오류:", error);
      toast.error("JSON 데이터 내보내기에 실패했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCSVExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportUserData();

      console.log("내보낼 데이터:", data);

      // QR 코드 CSV 파일
      const qrCsv = convertQrCodesToCSV(data.qrCodes);
      console.log("QR CSV 데이터:", qrCsv.substring(0, 200) + "...");

      const qrBlob = new Blob(["\uFEFF" + qrCsv], {
        type: "text/csv;charset=utf-8",
      });
      const qrUrl = URL.createObjectURL(qrBlob);

      // 템플릿 CSV 파일
      const templateCsv = convertTemplatesToCSV(data.templates);
      console.log("템플릿 CSV 데이터:", templateCsv.substring(0, 200) + "...");

      const templateBlob = new Blob(["\uFEFF" + templateCsv], {
        type: "text/csv;charset=utf-8",
      });
      const templateUrl = URL.createObjectURL(templateBlob);

      const date = new Date().toISOString().split("T")[0];

      // QR 코드 CSV 다운로드
      const qrLink = document.createElement("a");
      qrLink.href = qrUrl;
      qrLink.download = `qr-codes-${date}.csv`;
      document.body.appendChild(qrLink);
      qrLink.click();
      document.body.removeChild(qrLink);
      URL.revokeObjectURL(qrUrl);

      // 템플릿 CSV 다운로드
      const templateLink = document.createElement("a");
      templateLink.href = templateUrl;
      templateLink.download = `templates-${date}.csv`;
      document.body.appendChild(templateLink);
      templateLink.click();
      document.body.removeChild(templateLink);
      URL.revokeObjectURL(templateUrl);

      toast.success(
        `CSV 데이터를 성공적으로 내보냈습니다! (QR 코드: ${data.qrCodes.length}개, 템플릿: ${data.templates.length}개)`,
      );
    } catch (error) {
      console.error("CSV 내보내기 오류:", error);
      toast.error("CSV 데이터 내보내기에 실패했습니다.");
    } finally {
      setIsExporting(false);
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
          disabled={isExporting}
          variant="outline"
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "내보내는 중..." : "JSON으로 내보내기"}
        </Button>
        <Button
          onClick={handleCSVExport}
          disabled={isExporting}
          variant="outline"
          className="w-full"
        >
          <FileText className="h-4 w-4 mr-2" />
          {isExporting ? "내보내는 중..." : "CSV로 내보내기"}
        </Button>
      </div>
    </div>
  );
}
