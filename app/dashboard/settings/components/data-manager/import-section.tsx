"use client";

import SectionHeader from "./section-header";
import AllDataJSONImportButton from "./all-data-json-import-button";
import QrCodesJSONImportButton from "./qr-codes-json-import-button";
import QrCodesCSVImportButton from "./qr-codes-csv-import-button";
import TemplatesJSONImportButton from "./templates-json-import-button";
import TemplatesCSVImportButton from "./templates-csv-import-button";

export default function ImportSection() {
  return (
    <div className="space-y-3">
      <SectionHeader
        title="데이터 가져오기"
        description="JSON 또는 CSV 파일에서 QR 코드와 템플릿을 가져옵니다."
      />
      <div className="space-y-4">
        {/* 통합 가져오기 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            통합 가져오기
          </h4>
          <AllDataJSONImportButton />
        </div>

        {/* 개별 가져오기 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            개별 가져오기
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <QrCodesJSONImportButton />
            <QrCodesCSVImportButton />
            <TemplatesJSONImportButton />
            <TemplatesCSVImportButton />
          </div>
        </div>
      </div>
    </div>
  );
}
