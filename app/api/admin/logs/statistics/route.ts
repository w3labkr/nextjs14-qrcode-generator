import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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
 * 로그 통계 조회 API
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

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // 병렬로 통계 쿼리 실행
    const [totalLogs, errorLogs, adminActions, activeUsers, recentActivity] =
      await Promise.all([
        // 전체 로그 수
        prisma.applicationLog.count(),

        // 24시간 내 오류 로그
        prisma.applicationLog.count({
          where: {
            level: { in: ["ERROR", "FATAL"] },
            createdAt: { gte: oneDayAgo },
          },
        }),

        // 24시간 내 관리자 액션
        prisma.applicationLog.count({
          where: {
            type: "ADMIN",
            createdAt: { gte: oneDayAgo },
          },
        }),

        // 24시간 내 활성 사용자 수
        prisma.applicationLog.findMany({
          where: {
            userId: { not: null },
            createdAt: { gte: oneDayAgo },
          },
          select: { userId: true },
          distinct: ["userId"],
        }),

        // 1시간 내 활동
        prisma.applicationLog.count({
          where: {
            createdAt: { gte: oneHourAgo },
          },
        }),
      ]);

    // 시스템 상태 계산
    let systemHealth: "good" | "warning" | "critical" = "good";

    if (errorLogs > 50) {
      systemHealth = "critical";
    } else if (errorLogs > 10) {
      systemHealth = "warning";
    }

    // 평균 응답 시간 (임시값 - 실제로는 별도 메트릭에서 가져와야 함)
    const averageResponseTime = Math.floor(Math.random() * 200) + 50; // 50-250ms 범위

    // 디스크 사용량 (임시값 - 실제로는 시스템 메트릭에서 가져와야 함)
    const diskUsage = Math.floor((totalLogs / 100000) * 100); // 10만 로그 = 100% 가정

    const statistics = {
      totalLogs,
      errorLogs,
      adminActions,
      activeUsers: activeUsers.length,
      recentActivity,
      systemHealth,
      averageResponseTime,
      diskUsage: Math.min(diskUsage, 100), // 100% 초과 방지
    };

    return NextResponse.json(statistics);
  } catch (error) {
    console.error("로그 통계 조회 실패:", error);

    return NextResponse.json(
      { error: "통계 조회에 실패했습니다" },
      { status: 500 },
    );
  }
}
