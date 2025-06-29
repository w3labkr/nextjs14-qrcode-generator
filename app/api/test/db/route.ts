import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("데이터베이스 연결 테스트 시작");

    // 기본 연결 테스트
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("기본 연결 테스트 성공:", testQuery);

    // ApplicationLog 테이블 존재 확인
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'application_logs'
      );
    `;
    console.log("ApplicationLog 테이블 존재 확인:", tableExists);

    // ApplicationLog 테이블 구조 확인
    const tableStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'application_logs'
      ORDER BY ordinal_position;
    `;
    console.log("ApplicationLog 테이블 구조:", tableStructure);

    // 로그 개수 확인
    try {
      const logCount = await prisma.applicationLog.count();
      console.log("로그 개수:", logCount);

      // 최근 로그 몇 개 조회
      const recentLogs = await prisma.applicationLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          action: true,
          createdAt: true,
        },
      });
      console.log("최근 로그:", recentLogs);

      return NextResponse.json({
        success: true,
        message: "데이터베이스 연결 및 테이블 접근 성공",
        data: {
          connectionTest: testQuery,
          tableExists,
          tableStructure,
          logCount,
          recentLogs,
        },
      });
    } catch (logError) {
      console.error("로그 테이블 접근 실패:", logError);
      return NextResponse.json({
        success: false,
        message: "로그 테이블 접근 실패",
        error: logError instanceof Error ? logError.message : "Unknown error",
        data: {
          connectionTest: testQuery,
          tableExists,
          tableStructure,
        },
      });
    }
  } catch (error) {
    console.error("데이터베이스 테스트 실패:", error);
    return NextResponse.json(
      {
        success: false,
        message: "데이터베이스 연결 실패",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
