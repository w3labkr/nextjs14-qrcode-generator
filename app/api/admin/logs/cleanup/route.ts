import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { LogCleanupManager } from "@/lib/log-cleanup";
import { getAdminEmails } from "@/lib/env-validation";

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
 * 수동 로그 정리 API
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

    const body = await request.json();
    const {
      beforeDate,
      logTypes,
      logLevels,
      dryRun = true, // 기본적으로 드라이런 모드
    } = body;

    const options: any = { dryRun };

    if (beforeDate) {
      options.beforeDate = new Date(beforeDate);
    }

    if (logTypes && Array.isArray(logTypes)) {
      options.logTypes = logTypes;
    }

    if (logLevels && Array.isArray(logLevels)) {
      options.logLevels = logLevels;
    }

    // 수동 로그 정리 실행
    const result = await LogCleanupManager.manualCleanup(
      session.user.id || session.user.email,
      options,
    );

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("수동 로그 정리 실패:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * 로그 정리 통계 조회 API
 */
export async function GET(request: NextRequest) {
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

    // 로그 테이블 통계 조회
    const stats = await LogCleanupManager.getLogTableStats();

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("로그 통계 조회 실패:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
