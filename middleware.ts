import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { logApiRequest } from "@/lib/logging-middleware";

export async function middleware(request: NextRequest) {
  // 정적 파일과 Next.js 내부 경로는 로깅하지 않음
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon") ||
    request.nextUrl.pathname.startsWith("/api/_next") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // API 경로에 대해서만 로깅 수행
  if (request.nextUrl.pathname.startsWith("/api")) {
    try {
      // 세션 정보 가져오기 (옵션)
      const session = await auth();
      const userId = session?.user?.id || null;

      // API 요청 로깅 (비동기로 처리하여 응답 속도에 영향 없음)
      Promise.resolve()
        .then(() => logApiRequest(request, response, userId))
        .catch((error) => console.error("API 로깅 실패:", error));
    } catch (error) {
      // 로깅 실패가 메인 요청에 영향을 주지 않도록 함
      console.error("미들웨어에서 로깅 중 에러 발생:", error);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
