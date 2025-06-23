"use client";

import SectionHeader from "./section-header";
import JSONExportButton from "./json-export-button";
import QrCodesCSVExportButton from "./qr-codes-csv-export-button";
import TemplatesCSVExportButton from "./templates-csv-export-button";
import DownloadTroubleshootDialog from "./download-troubleshoot-dialog";

export default function ExportSection() {
  return (
    <div className="space-y-3">
      <SectionHeader
        title="데이터 내보내기"
        description="QR 코드와 템플릿을 개별적으로 또는 통합 JSON 파일로 내보낼 수 있습니다."
      />
      <div className="flex flex-col gap-2">
        <JSONExportButton />
        <QrCodesCSVExportButton />
        <TemplatesCSVExportButton />
      </div>
      <div className="flex justify-center pt-2">
        <DownloadTroubleshootDialog />
      </div>
    </div>
  );
}
