"use client";

import SectionHeader from "./section-header";
import AllDataJSONExportButton from "./all-data-json-export-button";
import QrCodesJSONExportButton from "./qr-codes-json-export-button";
import QrCodesCSVExportButton from "./qr-codes-csv-export-button";
import DownloadTroubleshootDialog from "./download-troubleshoot-dialog";

export default function ExportSection() {
  return (
    <div className="space-y-3">
      <SectionHeader
        title="데이터 내보내기"
        description="QR 코드와 템플릿을 개별적으로 또는 통합하여 JSON/CSV 파일로 내보낼 수 있습니다."
      />
      <div className="space-y-4">
        {/* 통합 내보내기 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            통합 내보내기
          </h4>
          <AllDataJSONExportButton />
        </div>

        {/* 개별 내보내기 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            개별 내보내기
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <QrCodesJSONExportButton />
            <QrCodesCSVExportButton />
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-2">
        <DownloadTroubleshootDialog />
      </div>
    </div>
  );
}
