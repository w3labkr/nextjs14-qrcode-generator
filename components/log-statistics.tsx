import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLogStatsAction } from "@/app/actions";
import { Activity, AlertCircle, Key, Database } from "lucide-react";

export default async function LogStatistics() {
  try {
    const result = await getLogStatsAction();

    if (!result.success || !result.data) {
      throw new Error(result.error || "통계 조회 실패");
    }

    const stats = result.data;

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 로그</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total?.total || 0}</div>
            <p className="text-xs text-muted-foreground">전체 로그 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">접근 로그</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byType?.ACCESS || 0}
            </div>
            <p className="text-xs text-muted-foreground">API 접근 기록</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오류 로그</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byLevel?.ERROR || 0}
            </div>
            <p className="text-xs text-muted-foreground">오류 발생 건수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">인증 로그</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byType?.AUTH || 0}</div>
            <p className="text-xs text-muted-foreground">인증 이벤트</p>
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
