"use client";

import SectionHeader from "./section-header";
import JSONImportButton from "./json-import-button";
import CSVImportButton from "./csv-import-button";
import { ImportStats } from "@/types/data-manager";

interface ImportSectionProps {
  onImportComplete: (stats: ImportStats) => void;
}

export default function ImportSection({
  onImportComplete,
}: ImportSectionProps) {
  return (
    <div className="space-y-3">
      <SectionHeader
        title="데이터 가져오기"
        description="JSON 또는 CSV 파일에서 QR 코드와 템플릿을 가져옵니다."
      />
      <div className="flex flex-col gap-2">
        <JSONImportButton onImportComplete={onImportComplete} />
        <CSVImportButton onImportComplete={onImportComplete} />
      </div>
    </div>
  );
}
