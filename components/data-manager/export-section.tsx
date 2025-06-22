"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";
import { exportUserData } from "@/app/actions/qr-code";
import { toast } from "sonner";

export default function ExportSection() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportUserData();

      // JSON 파일로 다운로드
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `데이터가 성공적으로 내보내졌습니다! (QR 코드: ${data.stats.totalQrCodes}개, 템플릿: ${data.stats.totalTemplates}개)`,
      );
    } catch (error) {
      console.error("내보내기 오류:", error);
      toast.error("데이터 내보내기에 실패했습니다.");
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
        모든 QR 코드와 템플릿을 JSON 파일로 다운로드합니다.
      </p>
      <Button onClick={handleExport} disabled={isExporting} className="w-full">
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? "내보내는 중..." : "데이터 내보내기"}
      </Button>
    </div>
  );
}
