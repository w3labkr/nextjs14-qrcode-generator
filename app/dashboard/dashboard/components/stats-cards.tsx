"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Heart, TrendingUp, Plus } from "lucide-react";
import { QR_CODE_TYPES } from "@/lib/constants";
import { getTypeLabel } from "@/lib/utils";

interface QrCodeStats {
  total: number;
  favorites: number;
  thisMonth: number;
  byType: { [key: string]: number };
}

interface StatsCardsProps {
  stats: QrCodeStats | null;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">전체 QR 코드</CardTitle>
          <QrCode className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
          <p className="text-xs text-muted-foreground">
            지금까지 생성한 QR 코드
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">즐겨찾기</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.favorites || 0}</div>
          <p className="text-xs text-muted-foreground">
            즐겨찾기로 저장된 QR 코드
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">이번 달</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.thisMonth || 0}</div>
          <p className="text-xs text-muted-foreground">
            이번 달 생성된 QR 코드
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">인기 유형</CardTitle>
          <Plus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.byType && Object.keys(stats.byType).length > 0
              ? getTypeLabel(
                  Object.entries(stats.byType).sort(
                    ([, a], [, b]) => b - a,
                  )[0][0],
                )
              : "없음"}
          </div>
          <p className="text-xs text-muted-foreground">가장 많이 사용한 유형</p>
        </CardContent>
      </Card>
    </div>
  );
}
