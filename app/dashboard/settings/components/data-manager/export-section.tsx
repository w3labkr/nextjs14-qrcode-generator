"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileDown, History, Layout } from "lucide-react";
import {
  exportUserData,
  exportQrCodes,
  exportTemplates,
} from "@/app/actions/data-management";
import { toast } from "sonner";

type ExportType = "all" | "qrcodes" | "templates";

export default function ExportSection() {
  const [isExporting, setIsExporting] = useState<ExportType | null>(null);

  const downloadFile = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = async () => {
    try {
      setIsExporting("all");
      const data = await exportUserData();

      downloadFile(
        data,
        `qr-data-all-${new Date().toISOString().slice(0, 10)}.json`,
      );

      toast.success(
        `전체 데이터가 성공적으로 내보내졌습니다! (QR 코드: ${data.stats.totalQrCodes}개, 템플릿: ${data.stats.totalTemplates}개)`,
      );
    } catch (error) {
      console.error("전체 내보내기 오류:", error);
      toast.error("전체 데이터 내보내기에 실패했습니다.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportQrCodes = async () => {
    try {
      setIsExporting("qrcodes");
      const data = await exportQrCodes();

      downloadFile(
        data,
        `qr-codes-${new Date().toISOString().slice(0, 10)}.json`,
      );

      toast.success(
        `QR 코드 히스토리가 성공적으로 내보내졌습니다! (QR 코드: ${data.stats.totalQrCodes}개)`,
      );
    } catch (error) {
      console.error("QR 코드 내보내기 오류:", error);
      toast.error("QR 코드 내보내기에 실패했습니다.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportTemplates = async () => {
    try {
      setIsExporting("templates");
      const data = await exportTemplates();

      downloadFile(
        data,
        `qr-templates-${new Date().toISOString().slice(0, 10)}.json`,
      );

      toast.success(
        `템플릿이 성공적으로 내보내졌습니다! (템플릿: ${data.stats.totalTemplates}개)`,
      );
    } catch (error) {
      console.error("템플릿 내보내기 오류:", error);
      toast.error("템플릿 내보내기에 실패했습니다.");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileDown className="h-4 w-4" />
        <h4 className="font-medium">데이터 내보내기</h4>
      </div>
      <p className="text-sm text-muted-foreground">
        원하는 데이터 종류를 선택하여 JSON 파일로 다운로드합니다.
      </p>

      <div className="space-y-2">
        <Button
          onClick={handleExportAll}
          disabled={isExporting !== null}
          className="w-full justify-start"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting === "all" ? "내보내는 중..." : "전체 데이터 내보내기"}
        </Button>

        <Button
          onClick={handleExportQrCodes}
          disabled={isExporting !== null}
          className="w-full justify-start"
          variant="outline"
        >
          <History className="h-4 w-4 mr-2" />
          {isExporting === "qrcodes" ? "내보내는 중..." : "히스토리 내보내기"}
        </Button>

        <Button
          onClick={handleExportTemplates}
          disabled={isExporting !== null}
          className="w-full justify-start"
          variant="outline"
        >
          <Layout className="h-4 w-4 mr-2" />
          {isExporting === "templates" ? "내보내는 중..." : "템플릿 내보내기"}
        </Button>
      </div>
    </div>
  );
}
