import { NextRequest, NextResponse } from "next/server";
import { LogCleanupManager } from "@/lib/log-cleanup";

/**
 * 자동 로그 정리 크론잡 API
 * Vercel Cron Jobs에서 정기적으로 호출됩니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 크론잡 시크릿 검증
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET이 설정되지 않았습니다");
      return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("크론잡 인증 실패");
      return NextResponse.json({ error: "인증 실패" }, { status: 401 });
    }

    console.log("자동 로그 정리 크론잡 시작");

    // 로그 정리 실행
    const result = await LogCleanupManager.cleanupOldLogs();

    // 로그 테이블 통계 조회
    const stats = await LogCleanupManager.getLogTableStats();

    const response = {
      success: true,
      message: "로그 정리 완료",
      cleanup: result,
      stats,
      timestamp: new Date().toISOString(),
    };

    console.log("자동 로그 정리 결과:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("자동 로그 정리 실패:", error);

    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * 로그 정리 상태 조회 API (관리자용)
 */
export async function GET(request: NextRequest) {
  try {
    // 간단한 인증 (실제로는 관리자 권한 확인 필요)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "인증 실패" }, { status: 401 });
    }

    // 로그 테이블 통계 조회
    const stats = await LogCleanupManager.getLogTableStats();

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("로그 정리 상태 조회 실패:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
