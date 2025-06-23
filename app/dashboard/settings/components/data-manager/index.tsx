"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ExportSection from "./export-section";
import ImportSection from "./import-section";
import UsageGuide from "./usage-guide";

export default function DataManager() {
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
          <ImportSection />
        </div>

        {/* 사용 안내 */}
        <UsageGuide />
      </CardContent>
    </Card>
  );
}
