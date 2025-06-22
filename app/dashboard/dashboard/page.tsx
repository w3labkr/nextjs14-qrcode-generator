"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Heart, Plus, TrendingUp } from "lucide-react";
import { getUserQrCodes, getQrCodeStats } from "@/app/actions/qr-code";
import { toast } from "sonner";
import Link from "next/link";

interface QrCodeStats {
  total: number;
  favorites: number;
  thisMonth: number;
  byType: { [key: string]: number };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<QrCodeStats | null>(null);
  const [recentQrCodes, setRecentQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [statsResult, recentQrCodesResult] = await Promise.all([
        getQrCodeStats(),
        getUserQrCodes(1, 5),
      ]);

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }

      if (recentQrCodesResult) {
        setRecentQrCodes(recentQrCodesResult.qrCodes);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("대시보드 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadDashboardData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const getTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      URL: "웹사이트",
      TEXT: "텍스트",
      WIFI: "Wi-Fi",
      EMAIL: "이메일",
      SMS: "문자",
      VCARD: "연락처",
      LOCATION: "위치",
    };
    return typeMap[type] || type;
  };

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
    <>
      {/* 통계 카드 */}
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
            <p className="text-xs text-muted-foreground">
              가장 많이 사용한 유형
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 최근 QR 코드 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 생성한 QR 코드</CardTitle>
            <CardDescription>
              최근에 생성한 QR 코드들을 확인해보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentQrCodes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  아직 생성한 QR 코드가 없습니다.
                </p>
                <Button asChild>
                  <Link href="/">첫 QR 코드 만들기</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentQrCodes.map((qrCode) => (
                  <div
                    key={qrCode.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {qrCode.title || "제목 없음"}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {getTypeLabel(qrCode.type)}
                        </Badge>
                        {qrCode.isFavorite && (
                          <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {qrCode.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(qrCode.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/history">모든 히스토리 보기</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 유형별 통계 */}
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
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
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
      </div>
    </>
  );
}
