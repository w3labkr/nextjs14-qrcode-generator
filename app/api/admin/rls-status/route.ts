import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  checkRLSStatus,
  getCurrentRLSContext,
  withoutRLS,
} from "@/lib/rls-utils";

export const dynamic = "force-dynamic";

/**
 * RLS 상태를 확인하는 관리자 전용 API
 * 실제 프로덕션에서는 관리자 권한 확인이 필요합니다.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    // TODO: 실제 프로덕션에서는 관리자 권한 확인 로직 추가
    // if (!session.user.isAdmin) {
    //   return NextResponse.json(
    //     { error: "관리자 권한이 필요합니다." },
    //     { status: 403 },
    //   );
    // }

    const [rlsStatus, currentContext] = await Promise.all([
      checkRLSStatus(),
      getCurrentRLSContext(),
    ]);

    // 전체 통계 조회 (관리자 권한)
    const adminDb = await withoutRLS();
    const stats = await Promise.all([
      adminDb.qrCode.count(),
      adminDb.qrTemplate.count(),
      adminDb.user.count(),
      adminDb.account.count(),
      adminDb.session.count(),
    ]);

    return NextResponse.json({
      rls: rlsStatus,
      currentContext,
      statistics: {
        totalQrCodes: stats[0],
        totalTemplates: stats[1],
        totalUsers: stats[2],
        totalAccounts: stats[3],
        totalSessions: stats[4],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("RLS 상태 확인 실패:", error);
    return NextResponse.json(
      {
        error: "RLS 상태를 확인하는데 실패했습니다.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
