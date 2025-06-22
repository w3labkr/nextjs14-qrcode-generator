import { ImportStats } from "@/types/data-manager";

interface ImportResultsProps {
  importStats: ImportStats;
}

export default function ImportResults({ importStats }: ImportResultsProps) {
  return (
    <div className="border-t pt-4">
      <div className="space-y-2">
        <h4 className="font-medium text-green-600">가져오기 완료</h4>
        <div className="text-sm space-y-1">
          <p>
            • QR 코드: {importStats.imported.qrCodes}/
            {importStats.total.qrCodes}개 가져옴
          </p>
          <p>
            • 템플릿: {importStats.imported.templates}/
            {importStats.total.templates}개 가져옴
          </p>
        </div>
        {(importStats.imported.qrCodes < importStats.total.qrCodes ||
          importStats.imported.templates < importStats.total.templates) && (
          <p className="text-xs text-muted-foreground">
            일부 항목은 중복되거나 오류로 인해 가져오지 못했을 수 있습니다.
          </p>
        )}
      </div>
    </div>
  );
}
