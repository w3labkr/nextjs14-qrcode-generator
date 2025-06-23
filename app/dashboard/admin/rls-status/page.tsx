"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface RLSStatusData {
  rls: {
    success: boolean;
    tables: Array<{
      schemaname: string;
      tablename: string;
      rowsecurity: boolean;
      policy_count: number;
    }>;
    timestamp: string;
  };
  currentContext: string | null;
  statistics: {
    totalQrCodes: number;
    totalTemplates: number;
    totalUsers: number;
    totalAccounts: number;
    totalSessions: number;
  };
  timestamp: string;
}

export default function RLSStatusPage() {
  const [data, setData] = useState<RLSStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRLSStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/rls-status");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRLSStatus();
  }, []);

  const getStatusIcon = (enabled: boolean, policyCount: number) => {
    if (enabled && policyCount > 0) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (enabled && policyCount === 0) {
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusText = (enabled: boolean, policyCount: number) => {
    if (enabled && policyCount > 0) {
      return "활성화됨";
    } else if (enabled && policyCount === 0) {
      return "정책 없음";
    } else {
      return "비활성화됨";
    }
  };

  const getStatusColor = (enabled: boolean, policyCount: number) => {
    if (enabled && policyCount > 0) {
      return "bg-green-100 text-green-800";
    } else if (enabled && policyCount === 0) {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">RLS 상태를 확인하는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchRLSStatus} className="mt-4">
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">RLS 상태 모니터링</h1>
        <Button onClick={fetchRLSStatus} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 현재 컨텍스트 */}
      <Card>
        <CardHeader>
          <CardTitle>현재 RLS 컨텍스트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <span className="font-medium">사용자 ID:</span>
            <Badge variant={data.currentContext ? "default" : "secondary"}>
              {data.currentContext || "설정되지 않음"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 테이블별 RLS 상태 */}
      <Card>
        <CardHeader>
          <CardTitle>테이블별 RLS 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.rls.tables.map((table) => (
              <div
                key={table.tablename}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(table.rowsecurity, table.policy_count)}
                  <div>
                    <h3 className="font-medium">{table.tablename}</h3>
                    <p className="text-sm text-gray-600">
                      정책 수: {table.policy_count}개
                    </p>
                  </div>
                </div>
                <Badge
                  className={getStatusColor(
                    table.rowsecurity,
                    table.policy_count,
                  )}
                >
                  {getStatusText(table.rowsecurity, table.policy_count)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 전체 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>데이터베이스 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {data.statistics.totalUsers}
              </p>
              <p className="text-sm text-gray-600">사용자</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {data.statistics.totalQrCodes}
              </p>
              <p className="text-sm text-gray-600">QR 코드</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {data.statistics.totalTemplates}
              </p>
              <p className="text-sm text-gray-600">템플릿</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {data.statistics.totalAccounts}
              </p>
              <p className="text-sm text-gray-600">계정</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {data.statistics.totalSessions}
              </p>
              <p className="text-sm text-gray-600">세션</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 타임스탬프 */}
      <div className="text-center text-sm text-gray-500">
        마지막 업데이트: {new Date(data.timestamp).toLocaleString("ko-KR")}
      </div>
    </div>
  );
}
