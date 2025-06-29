import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminLogsContent } from "./components/admin-logs-content";
import { LogStatistics } from "./components/log-statistics";
import { LogCleanupManager } from "./components/log-cleanup-manager";
import { AlertTriangle, Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAdminEmails } from "@/lib/env-validation";

export const metadata: Metadata = {
  title: "관리자 로그 관리 | QR 코드 생성기",
  description: "시스템 로그 및 오류 관리 대시보드",
};

/**
 * 관리자 권한 확인 함수
 */
async function checkAdminAccess(
  email: string | null | undefined,
): Promise<boolean> {
  if (!email) return false;

  const adminEmails = getAdminEmails();
  return adminEmails.includes(email);
}

export default async function AdminLogsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const isAdmin = await checkAdminAccess(session.user.email);

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>접근 권한 없음</AlertTitle>
        <AlertDescription>
          관리자만 이 페이지에 접근할 수 있습니다. 계정 권한을 확인해주세요.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    로딩 중...
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">집계 중...</p>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <LogStatistics />
      </Suspense>

      {/* 탭 컨테이너 */}
      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs">로그 조회</TabsTrigger>
          <TabsTrigger value="cleanup">로그 정리</TabsTrigger>
        </TabsList>

        {/* 로그 조회 탭 */}
        <TabsContent value="logs">
          <Suspense
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>시스템 로그</CardTitle>
                  <CardDescription>
                    로그 데이터를 불러오는 중...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex space-x-4 animate-pulse">
                        <div className="h-4 w-4 bg-muted rounded" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            }
          >
            <AdminLogsContent />
          </Suspense>
        </TabsContent>

        {/* 로그 정리 탭 */}
        <TabsContent value="cleanup">
          <Suspense
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>로그 정리</CardTitle>
                  <CardDescription>
                    로그 정리 옵션을 불러오는 중...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-20 bg-muted rounded animate-pulse" />
                    <div className="h-40 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            }
          >
            <LogCleanupManager />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
