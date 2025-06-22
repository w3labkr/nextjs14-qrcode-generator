"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserQrCodes, getQrCodeStats } from "@/app/actions/qr-code";
import { toast } from "sonner";
import { StatsCards } from "./components/stats-cards";
import { RecentQrCodes } from "./components/recent-qr-codes";
import { TypeStats } from "./components/type-stats";

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

  return (
    <>
      <StatsCards stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentQrCodes recentQrCodes={recentQrCodes} />
        <TypeStats stats={stats} />
      </div>
    </>
  );
}
