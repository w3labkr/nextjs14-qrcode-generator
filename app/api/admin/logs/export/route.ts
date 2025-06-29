import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UnifiedLogger } from "@/lib/unified-logging";
import { getAdminEmails } from "@/lib/env-validation";
import { convertLogsToCSV } from "@/lib/csv-utils";
import type { LogFilterOptions } from "@/types/logs";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

/**
 * 관리자 권한 확인
 */
async function checkAdminAccess(
  email: string | null | undefined,
): Promise<boolean> {
  if (!email) return false;

  const adminEmails = getAdminEmails();
  return adminEmails.includes(email);
}

/**
 * 관리자 로그 CSV 내보내기 API
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const isAdmin = await checkAdminAccess(session.user.email);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 },
      );
    }

    const filters: LogFilterOptions = await request.json();

    // 관리자 액션 로깅
    try {
      const clientInfo = await UnifiedLogger.getClientInfoFromRequest(request);
      await UnifiedLogger.logAdminAction(
        {
          adminId: session.user.id || session.user.email,
          action: "EXPORT_LOGS",
          details: "로그 CSV 내보내기",
        },
        clientInfo,
      );
    } catch (logError) {
      console.warn("관리자 액션 로깅 실패:", logError);
    }

    // 모든 로그 데이터를 가져오기 (페이지네이션 없이)
    const exportFilters = {
      ...filters,
      page: undefined,
      limit: undefined,
    };

    const result = await UnifiedLogger.getLogs(
      exportFilters,
      session.user.id || session.user.email,
      true,
    );

    if (!result.logs || result.logs.length === 0) {
      return NextResponse.json(
        { error: "내보낼 로그 데이터가 없습니다" },
        { status: 404 },
      );
    }

    // CSV 변환
    const csvContent = convertLogsToCSV(result.logs);

    // 파일명 생성
    const fileName = `logs-${format(new Date(), "yyyy-MM-dd-HHmm", { locale: ko })}.csv`;

    // CSV 응답 반환
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("관리자 로그 CSV 내보내기 실패:", error);

    // 오류 로깅
    try {
      const clientInfo = await UnifiedLogger.getClientInfoFromRequest(request);
      await UnifiedLogger.logError(
        {
          error: error instanceof Error ? error : new Error("Unknown error"),
          errorCode: "ADMIN_LOG_EXPORT_ERROR",
          additionalInfo: { endpoint: "/api/admin/logs/export" },
        },
        clientInfo,
      );
    } catch (logError) {
      console.warn("에러 로깅 실패:", logError);
    }

    return NextResponse.json(
      {
        error: "로그 CSV 내보내기에 실패했습니다",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
