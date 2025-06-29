import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UnifiedLogger } from "@/lib/unified-logging";
import { getAdminEmails } from "@/lib/env-validation";
import type { LogFilterOptions } from "@/types/logs";

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
 * 관리자 로그 조회 API
 */
export async function POST(request: NextRequest) {
  try {
    console.log("관리자 로그 조회 API 시작");

    const session = await auth();
    console.log("세션 확인:", {
      hasSession: !!session,
      userEmail: session?.user?.email,
    });

    if (!session?.user?.email) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const isAdmin = await checkAdminAccess(session.user.email);
    console.log("관리자 권한 확인:", { isAdmin, email: session.user.email });

    if (!isAdmin) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다" },
        { status: 403 },
      );
    }

    // 데이터베이스 연결 테스트
    try {
      console.log("데이터베이스 연결 테스트 중...");
      const testResult = await prisma.$queryRaw`SELECT 1 as test`;
      console.log("데이터베이스 연결 성공:", testResult);
    } catch (dbError) {
      console.error("데이터베이스 연결 실패:", dbError);
      return NextResponse.json(
        {
          error: "데이터베이스 연결에 실패했습니다",
          details:
            dbError instanceof Error ? dbError.message : "Unknown DB error",
        },
        { status: 500 },
      );
    }

    const filters: LogFilterOptions = await request.json();
    console.log("로그 조회 요청 필터:", filters);

    // 관리자 액션 로깅
    try {
      const clientInfo = await UnifiedLogger.getClientInfoFromRequest(request);
      await UnifiedLogger.logAdminAction(
        {
          adminId: session.user.id || session.user.email,
          action: "VIEW_LOGS",
          details: "로그 조회",
        },
        clientInfo,
      );
    } catch (logError) {
      console.warn("관리자 액션 로깅 실패:", logError);
    }

    const result = await UnifiedLogger.getLogs(
      filters,
      session.user.id || session.user.email,
      true,
    );

    console.log("로그 조회 결과:", {
      totalCount: result.totalCount,
      logsLength: result.logs?.length,
      currentPage: result.currentPage,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("관리자 로그 조회 실패:", error);
    console.error(
      "에러 스택:",
      error instanceof Error ? error.stack : "Unknown error",
    );

    // 오류 로깅
    try {
      const clientInfo = await UnifiedLogger.getClientInfoFromRequest(request);
      await UnifiedLogger.logError(
        {
          error: error instanceof Error ? error : new Error("Unknown error"),
          errorCode: "ADMIN_LOG_FETCH_ERROR",
          additionalInfo: { endpoint: "/api/admin/logs" },
        },
        clientInfo,
      );
    } catch (logError) {
      console.warn("에러 로깅 실패:", logError);
    }

    return NextResponse.json(
      {
        error: "로그 조회에 실패했습니다",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
