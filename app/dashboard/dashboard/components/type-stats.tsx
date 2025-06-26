"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QR_CODE_TYPES } from "@/lib/constants";
import { getTypeLabel } from "@/lib/utils";

interface QrCodeStats {
  total: number;
  favorites: number;
  thisMonth: number;
  byType: { [key: string]: number };
}

interface TypeStatsProps {
  stats: QrCodeStats | null;
}

export function TypeStats({ stats }: TypeStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>유형별 통계</CardTitle>
        <CardDescription>
          생성한 QR 코드를 유형별로 확인해보세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats?.byType && Object.keys(stats.byType).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(stats.byType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getTypeLabel(type)}</Badge>
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              아직 생성한 QR 코드가 없습니다.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
