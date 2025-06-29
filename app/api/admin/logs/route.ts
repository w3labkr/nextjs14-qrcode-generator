import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UnifiedLogger } from "@/lib/unified-logging";
import { getAdminEmails } from "@/lib/env-validation";
import type { LogFilterOptions } from "@/types/logs";

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
 * 관리자 로그 조회 API
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

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("관리자 로그 조회 실패:", error);

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
