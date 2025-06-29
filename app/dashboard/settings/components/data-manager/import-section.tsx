"use client";

import SectionHeader from "./section-header";
import QrCodesCSVImportButton from "./qr-codes-csv-import-button";

export default function ImportSection() {
  return (
    <div className="space-y-3">
      <SectionHeader
        title="데이터 가져오기"
        description="CSV 파일에서 QR 코드를 가져옵니다."
      />
      <div className="space-y-4">
        <div className="flex justify-center">
          <QrCodesCSVImportButton />
        </div>
      </div>
    </div>
  );
}
