import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  // 개발 모드에서만 작동
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not allowed in production" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 });
  }

  try {
    // 세션 쿠키 설정
    const cookieStore = cookies();
    cookieStore.set("next-auth.session-token", token, {
      httpOnly: true,
      secure: false, // 개발 모드에서는 false
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30일
    });

    // 대시보드로 리다이렉트
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Dev callback error:", error);
    return NextResponse.redirect(
      new URL("/auth/signin?error=DevCallbackError", request.url),
    );
  }
}
