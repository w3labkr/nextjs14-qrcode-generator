"use client";

import SectionHeader from "./section-header";
import QrCodesJSONImportButton from "./qr-codes-json-import-button";
import QrCodesCSVImportButton from "./qr-codes-csv-import-button";

export default function ImportSection() {
  return (
    <div className="space-y-3">
      <SectionHeader
        title="데이터 가져오기"
        description="JSON 또는 CSV 파일에서 QR 코드를 가져옵니다."
      />
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <QrCodesJSONImportButton />
          <QrCodesCSVImportButton />
        </div>
      </div>
    </div>
  );
}
