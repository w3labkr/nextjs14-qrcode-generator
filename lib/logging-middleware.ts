import { NextRequest } from "next/server";
import {
  createAccessLog,
  createAuthLog,
  createErrorLog,
  createQrGenerationLog,
} from "@/lib/log-utils";
import type { AuthAction } from "@/types/logs";

/**
 * API 요청 로그를 자동으로 기록하는 미들웨어 헬퍼
 */
export async function logApiRequest(
  request: NextRequest,
  response: Response,
  userId?: string | null,
) {
  // 서버 환경에서만 실행
  if (typeof window !== "undefined") {
    return;
  }

  try {
    await createAccessLog({
      userId,
      method: request.method,
      path: request.nextUrl.pathname,
      statusCode: response.status,
      userAgent: request.headers.get("user-agent") || undefined,
      ipAddress: getClientIP(request),
    });
  } catch (error) {
    console.error("API 요청 로그 기록 실패:", error);
  }
}

/**
 * 인증 이벤트 로그를 기록하는 헬퍼
 */
export async function logAuthEvent(action: AuthAction, userId?: string | null) {
  // 서버 환경에서만 실행
  if (typeof window !== "undefined") {
    return;
  }

  try {
    await createAuthLog({
      userId,
      action,
    });
  } catch (error) {
    console.error("인증 이벤트 로그 기록 실패:", error);
  }
}

/**
 * 에러 로그를 기록하는 헬퍼
 */
export async function logError(
  error: Error | string,
  userId?: string | null,
  context?: Record<string, any>,
) {
  // 서버 환경에서만 실행
  if (typeof window !== "undefined") {
    return;
  }

  try {
    const errorMessage = typeof error === "string" ? error : error.message;
    const fullErrorMessage = context
      ? `${errorMessage} | Context: ${JSON.stringify(context)}`
      : errorMessage;

    await createErrorLog({
      userId,
      errorMessage: fullErrorMessage,
    });
  } catch (logError) {
    console.error("에러 로그 기록 실패:", logError);
  }
}

/**
 * 에러 이벤트 로그를 기록하는 헬퍼
 */
export async function logErrorEvent(
  errorMessage: string,
  userId?: string | null,
) {
  // 서버 환경에서만 실행
  if (typeof window !== "undefined") {
    return;
  }

  try {
    await createErrorLog({
      userId,
      errorMessage,
    });
  } catch (error) {
    console.error("에러 이벤트 로그 기록 실패:", error);
  }
}

/**
 * QR 코드 생성 이벤트 로그를 기록하는 헬퍼
 */
export async function logQrGenerationEvent(
  qrType: string,
  content: string,
  request?: NextRequest,
  userId?: string | null,
  customHeaders?: { ipAddress?: string; userAgent?: string },
) {
  // 서버 환경에서만 실행
  if (typeof window !== "undefined") {
    return;
  }

  try {
    // 개인정보가 포함될 수 있는 내용은 해싱하여 저장
    const hashedContent = await hashSensitiveContent(content, qrType);

    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    if (customHeaders) {
      ipAddress = customHeaders.ipAddress;
      userAgent = customHeaders.userAgent;
    } else if (request) {
      ipAddress = getClientIP(request);
      userAgent = request.headers.get("user-agent") || undefined;
    }

    await createQrGenerationLog({
      userId,
      qrType,
      content: hashedContent,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("QR 코드 생성 이벤트 로그 기록 실패:", error);
  }
}

/**
 * QR 코드 내용을 기반으로 타입을 추론하는 헬퍼 함수
 */
export function inferQrType(content: string): string {
  if (!content || typeof content !== "string") {
    return "UNKNOWN";
  }

  const trimmedContent = content.trim().toLowerCase();

  // URL 패턴 검사
  if (trimmedContent.match(/^https?:\/\//)) {
    return "URL";
  }

  // Email 패턴 검사
  if (
    trimmedContent.startsWith("mailto:") ||
    trimmedContent.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  ) {
    return "EMAIL";
  }

  // SMS 패턴 검사
  if (
    trimmedContent.startsWith("sms:") ||
    trimmedContent.startsWith("smsto:")
  ) {
    return "SMS";
  }

  // WiFi 패턴 검사
  if (trimmedContent.startsWith("wifi:")) {
    return "WIFI";
  }

  // vCard 패턴 검사
  if (
    trimmedContent.startsWith("begin:vcard") ||
    trimmedContent.includes("vcard")
  ) {
    return "VCARD";
  }

  // 지도/위치 패턴 검사
  if (
    trimmedContent.startsWith("geo:") ||
    trimmedContent.includes("maps.google.") ||
    trimmedContent.includes("openstreetmap.")
  ) {
    return "LOCATION";
  }

  // 기본적으로 텍스트로 분류
  return "TEXTAREA";
}

/**
 * 민감한 내용을 해싱하는 헬퍼 함수
 */
async function hashSensitiveContent(
  content: string,
  qrType: string,
): Promise<string> {
  // EMAIL, SMS, VCARD 등 개인정보가 포함될 수 있는 타입의 경우 해싱 처리
  const sensitiveTypes = ["EMAIL", "SMS", "VCARD"];

  if (sensitiveTypes.includes(qrType.toUpperCase())) {
    // 간단한 해싱 처리 (실제 운영환경에서는 더 강력한 해싱 알고리즘 사용 권장)
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // URL, TEXTAREA, WIFI, LOCATION 등은 일부만 저장 (첫 100자)
  return content.length > 100 ? content.substring(0, 100) + "..." : content;
}

/**
 * 클라이언트 IP 주소를 가져오는 헬퍼
 */
export function getClientIP(request: NextRequest): string {
  // Vercel의 경우 x-forwarded-for 헤더 사용
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // Cloudflare의 경우 cf-connecting-ip 헤더 사용
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // 기본 remote address
  const remoteAddr = request.headers.get("x-real-ip");
  if (remoteAddr) {
    return remoteAddr;
  }

  return "unknown";
}

/**
 * API 라우트에서 사용할 수 있는 래퍼 함수
 */
export function withLogging<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  options?: {
    logRequest?: boolean;
    logErrors?: boolean;
    getUserId?: (...args: T) => string | null | undefined;
  },
) {
  return async (...args: T): Promise<R> => {
    const { logRequest = true, logErrors = true, getUserId } = options || {};

    try {
      const result = await handler(...args);

      // 요청 로깅 (필요한 경우)
      if (logRequest && args[0] instanceof Request) {
        const request = args[0] as NextRequest;
        const userId = getUserId ? getUserId(...args) : undefined;

        // 응답 객체를 생성하여 로깅
        const response = new Response(null, { status: 200 });
        await logApiRequest(request, response, userId);
      }

      return result;
    } catch (error) {
      // 에러 로깅
      if (logErrors) {
        const userId = getUserId ? getUserId(...args) : undefined;
        await logError(error as Error, userId, {
          args: args.length > 0 ? "Arguments provided" : "No arguments",
        });
      }

      throw error;
    }
  };
}

/**
 * Next.js API 라우트에서 사용할 수 있는 로깅 미들웨어
 */
export function createLoggingMiddleware(
  getUserId?: (request: NextRequest) => string | null,
) {
  return async (request: NextRequest, handler: () => Promise<Response>) => {
    try {
      const response = await handler();

      // 요청 로깅
      const userId = getUserId ? getUserId(request) : null;
      await logApiRequest(request, response, userId);

      return response;
    } catch (error) {
      // 에러 로깅
      const userId = getUserId ? getUserId(request) : null;
      await logError(error as Error, userId, {
        method: request.method,
        path: request.nextUrl.pathname,
      });

      // 에러 응답 생성
      const errorResponse = new Response(
        JSON.stringify({ error: "서버 에러가 발생했습니다" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );

      // 에러 응답도 로깅
      await logApiRequest(request, errorResponse, userId);

      return errorResponse;
    }
  };
}
