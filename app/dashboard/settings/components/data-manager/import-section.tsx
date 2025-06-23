"use client";

import SectionHeader from "./section-header";
import JSONImportButton from "./json-import-button";
import CSVImportButton from "./csv-import-button";
import AllDataJSONImportButton from "./all-data-json-import-button";
import QrCodesJSONImportButton from "./qr-codes-json-import-button";
import QrCodesCSVImportButton from "./qr-codes-csv-import-button";
import TemplatesJSONImportButton from "./templates-json-import-button";
import TemplatesCSVImportButton from "./templates-csv-import-button";
import { ImportStats } from "@/types/data-manager";

interface ImportSectionProps {
  onImportComplete: (stats: ImportStats) => void;
}

export default function ImportSection({
  onImportComplete,
}: ImportSectionProps) {
  const handleSimpleImportComplete = () => {
    // 간단한 가져오기 완료 시 더미 통계 제공
    onImportComplete({
      imported: { qrCodes: 0, templates: 0 },
      total: { qrCodes: 0, templates: 0 },
    });
  };

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
          <AllDataJSONImportButton
            onImportComplete={handleSimpleImportComplete}
          />
        </div>

        {/* 개별 가져오기 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            개별 가져오기
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <QrCodesJSONImportButton
              onImportComplete={handleSimpleImportComplete}
            />
            <QrCodesCSVImportButton
              onImportComplete={handleSimpleImportComplete}
            />
            <TemplatesJSONImportButton
              onImportComplete={handleSimpleImportComplete}
            />
            <TemplatesCSVImportButton
              onImportComplete={handleSimpleImportComplete}
            />
          </div>
        </div>

        {/* 고급 가져오기 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            고급 가져오기 (설정 옵션 포함)
          </h4>
          <div className="flex flex-col gap-2">
            <JSONImportButton onImportComplete={onImportComplete} />
            <CSVImportButton onImportComplete={onImportComplete} />
          </div>
        </div>
      </div>
    </div>
  );
}
