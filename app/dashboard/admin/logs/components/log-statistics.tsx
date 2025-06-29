"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  Shield,
  Users,
  TrendingUp,
  Clock,
  Database,
  Zap,
} from "lucide-react";

interface LogStatisticsData {
  totalLogs: number;
  errorLogs: number;
  adminActions: number;
  activeUsers: number;
  recentActivity: number;
  systemHealth: "good" | "warning" | "critical";
  averageResponseTime: number;
  diskUsage: number;
}

export function LogStatistics() {
  const [stats, setStats] = useState<LogStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get("/api/admin/logs/statistics");
        setStats(response.data);
      } catch (error) {
        console.error("통계 데이터 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();

    // 30초마다 통계 업데이트
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">로딩 중...</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">집계 중...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            통계 데이터를 불러올 수 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthColor = {
    good: "text-green-600",
    warning: "text-yellow-600",
    critical: "text-red-600",
  };

  const healthBg = {
    good: "bg-green-100",
    warning: "bg-yellow-100",
    critical: "bg-red-100",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 전체 로그 수 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">전체 로그</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalLogs.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">누적 시스템 로그</p>
        </CardContent>
      </Card>

      {/* 오류 로그 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">오류 로그</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.errorLogs.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">24시간 내 오류 발생</p>
        </CardContent>
      </Card>

      {/* 관리자 액션 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">관리자 액션</CardTitle>
          <Shield className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.adminActions.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">24시간 내 관리자 활동</p>
        </CardContent>
      </Card>

      {/* 활성 사용자 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
          <Users className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.activeUsers.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">24시간 내 활성 사용자</p>
        </CardContent>
      </Card>

      {/* 최근 활동 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">최근 활동</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.recentActivity.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">최근 1시간 활동</p>
        </CardContent>
      </Card>

      {/* 시스템 상태 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">시스템 상태</CardTitle>
          <Activity className={`h-4 w-4 ${healthColor[stats.systemHealth]}`} />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge
              className={`${healthBg[stats.systemHealth]} ${healthColor[stats.systemHealth]} border-0`}
            >
              {stats.systemHealth === "good"
                ? "정상"
                : stats.systemHealth === "warning"
                  ? "주의"
                  : "위험"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            실시간 시스템 상태
          </p>
        </CardContent>
      </Card>

      {/* 평균 응답 시간 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">평균 응답시간</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageResponseTime}ms
          </div>
          <p className="text-xs text-muted-foreground">API 평균 응답시간</p>
        </CardContent>
      </Card>

      {/* 디스크 사용량 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">로그 저장소</CardTitle>
          <Zap className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.diskUsage}%</div>
          <p className="text-xs text-muted-foreground">로그 저장소 사용률</p>
        </CardContent>
      </Card>
    </div>
  );
}
