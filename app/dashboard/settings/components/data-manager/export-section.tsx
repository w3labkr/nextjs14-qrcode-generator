"use client";

import SectionHeader from "./section-header";
import QrCodesJSONExportButton from "./qr-codes-json-export-button";
import QrCodesCSVExportButton from "./qr-codes-csv-export-button";
import DownloadTroubleshootDialog from "./download-troubleshoot-dialog";

export default function ExportSection() {
  return (
    <div className="space-y-3">
      <SectionHeader
        title="데이터 내보내기"
        description="QR 코드를 JSON/CSV 파일로 내보낼 수 있습니다."
      />
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <QrCodesJSONExportButton />
          <QrCodesCSVExportButton />
        </div>
      </div>
      <div className="flex justify-center pt-2">
        <DownloadTroubleshootDialog />
      </div>
    </div>
  );
}
