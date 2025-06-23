import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 크론 시크릿 확인
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 간단한 데이터베이스 조회 (첫 번째 사용자 하나만 조회)
    const userCount = await prisma.user.count();

    console.log(
      `[CRON] Keep-alive executed at ${new Date().toISOString()}, user count: ${userCount}`,
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      userCount,
      message: "Database keep-alive successful",
    });
  } catch (error) {
    console.error("[CRON] Keep-alive failed:", error);
    return NextResponse.json(
      {
        error: "Keep-alive failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
