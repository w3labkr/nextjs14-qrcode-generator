import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { withApiLogging } from "@/lib/api-logging";

export const dynamic = "force-dynamic";

const handlePOST = async (req: NextRequest) => {
  try {
    // 현재 세션 확인
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "세션이 없습니다" }, { status: 401 });
    }

    // NextAuth.js의 JWT 콜백에서 자동으로 토큰 갱신이 처리됨
    // 이 엔드포인트는 단순히 현재 세션 상태를 반환
    return NextResponse.json({
      success: true,
      session: {
        user: session.user,
        expires: session.expires,
      },
    });
  } catch (error) {
    console.error("토큰 갱신 API 오류:", error);
    return NextResponse.json(
      { error: "토큰 갱신에 실패했습니다" },
      { status: 500 },
    );
  }
};

export const POST = withApiLogging(handlePOST);

const handleGET = async (req: NextRequest) => {
  return handlePOST(req);
};

export const GET = withApiLogging(handleGET);
