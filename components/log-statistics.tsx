import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLogStatisticsAction } from "@/app/actions";
import { Activity, AlertCircle, Key, Database } from "lucide-react";

export default async function LogStatistics() {
  try {
    const stats = await getLogStatisticsAction();

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API 요청</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.accessLogs}</div>
            <p className="text-xs text-muted-foreground">
              오늘: {stats.today.accessLogs}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">인증 이벤트</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.authLogs}</div>
            <p className="text-xs text-muted-foreground">
              오늘: {stats.today.authLogs}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">에러 발생</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.errorLogs}</div>
            <p className="text-xs text-muted-foreground">
              오늘: {stats.today.errorLogs}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">감사 로그</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.auditLogs}</div>
            <p className="text-xs text-muted-foreground">총 기록된 활동</p>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">로그 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            로그 통계를 불러올 수 없습니다. 관리자 권한이 필요할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    );
  }
}
