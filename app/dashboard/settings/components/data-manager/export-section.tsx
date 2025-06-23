"use client";

import SectionHeader from "./section-header";
import JSONExportButton from "./json-export-button";
import CSVExportButton from "./csv-export-button";
import DownloadTroubleshootDialog from "./download-troubleshoot-dialog";

export default function ExportSection() {
  return (
    <div className="space-y-3">
      <SectionHeader
        title="데이터 내보내기"
        description="모든 QR 코드와 템플릿을 JSON 또는 CSV 파일로 내보냅니다."
      />
      <div className="flex flex-col gap-2">
        <JSONExportButton />
        <CSVExportButton />
      </div>
      <div className="flex justify-center pt-2">
        <DownloadTroubleshootDialog />
      </div>
    </div>
  );
}
