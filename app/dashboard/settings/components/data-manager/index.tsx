"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImportStats } from "@/types/data-manager";
import ExportSection from "./export-section";
import ImportSection from "./import-section";
import ImportResults from "./import-results";
import UsageGuide from "./usage-guide";

export default function DataManager() {
  const [importStats, setImportStats] = useState<ImportStats | null>(null);

  const handleImportComplete = (stats: ImportStats) => {
    setImportStats(stats);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>데이터 관리</CardTitle>
        <CardDescription>
          QR 코드와 템플릿 데이터를 내보내거나 가져올 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 내보내기 섹션 */}
        <ExportSection />

        <div className="border-t pt-4">
          {/* 가져오기 섹션 */}
          <ImportSection onImportComplete={handleImportComplete} />
        </div>

        {/* 가져오기 결과 표시 */}
        {importStats && <ImportResults importStats={importStats} />}

        {/* 사용 안내 */}
        <UsageGuide />
      </CardContent>
    </Card>
  );
}
