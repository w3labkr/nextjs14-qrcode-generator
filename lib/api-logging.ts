import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { logApiRequest } from "@/lib/logging-middleware";

/**
 * API 라우트에서 사용할 수 있는 로깅 래퍼 함수
 */
export function withApiLogging<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    let response: NextResponse;

    try {
      // 핸들러 실행
      response = await handler(request, ...args);
    } catch (error) {
      // 에러 발생 시 500 응답 생성
      response = NextResponse.json(
        { error: "서버 에러가 발생했습니다" },
        { status: 500 },
      );

      console.error("API 핸들러 에러:", error);
    }

    // 로깅 수행 (비동기로 처리하여 응답 속도에 영향 없음)
    Promise.resolve().then(async () => {
      try {
        const session = await auth();
        const userId = session?.user?.id || null;
        await logApiRequest(request, response, userId);
      } catch (error) {
        console.error("API 로깅 실패:", error);
      }
    });

    return response;
  };
}

/**
 * 인증이 필요한 API 라우트에서 사용할 수 있는 로깅 래퍼 함수
 */
export function withAuthenticatedApiLogging<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    let response: NextResponse;
    let userId: string | null = null;

    try {
      // 세션 확인
      const session = await auth();
      userId = session?.user?.id || null;

      // 핸들러 실행
      response = await handler(request, ...args);
    } catch (error) {
      // 에러 발생 시 500 응답 생성
      response = NextResponse.json(
        { error: "서버 에러가 발생했습니다" },
        { status: 500 },
      );

      console.error("API 핸들러 에러:", error);
    }

    // 로깅 수행 (비동기로 처리하여 응답 속도에 영향 없음)
    Promise.resolve().then(async () => {
      try {
        await logApiRequest(request, response, userId);
      } catch (error) {
        console.error("API 로깅 실패:", error);
      }
    });

    return response;
  };
}
