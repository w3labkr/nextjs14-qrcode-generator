import { NextRequest } from "next/server";
import { UnifiedLogger } from "@/lib/unified-logging";
import type { LogLevel } from "@/types/logs";

/**
 * 클라이언트 IP 주소 추출
 */
function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const remoteAddress = request.headers.get("x-vercel-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (remoteAddress) {
    return remoteAddress;
  }

  return null;
}

/**
 * API 요청 로깅 미들웨어
 */
export async function logApiRequest(
  request: NextRequest,
  response: Response,
  userId?: string | null,
  responseTime?: number,
) {
  // 서버 환경에서만 실행
  if (typeof window !== "undefined") {
    return;
  }

  try {
    const clientInfo = UnifiedLogger.getClientInfoFromRequest(request);

    await UnifiedLogger.logAccess(
      {
        userId: userId || undefined,
        method: request.method,
        path: request.nextUrl.pathname,
        statusCode: response.status,
        responseTime,
        requestId: request.headers.get("x-request-id") || undefined,
      },
      clientInfo,
    );
  } catch (error) {
    console.error("API 요청 로그 기록 실패:", error);
  }
}

/**
 * 인증 이벤트 로깅
 */
export async function logAuthEvent(
  action: string,
  authAction: "LOGIN" | "LOGOUT" | "REFRESH" | "REVOKE" | "FAIL",
  request?: NextRequest,
  userId?: string | null,
  provider?: string,
  sessionId?: string,
) {
  // 서버 환경에서만 실행
  if (typeof window !== "undefined") {
    return;
  }

  try {
    const clientInfo = request
      ? UnifiedLogger.getClientInfoFromRequest(request)
      : undefined;

    await UnifiedLogger.logAuth(
      {
        userId: userId || undefined,
        action,
        authAction,
        provider,
        sessionId,
      },
      clientInfo,
    );
  } catch (error) {
    console.error("인증 이벤트 로그 기록 실패:", error);
  }
}

/**
 * 에러 로깅
 */
export async function logError(
  error: Error | string,
  request?: NextRequest,
  userId?: string | null,
  errorCode?: string,
  requestId?: string,
  additionalInfo?: Record<string, any>,
) {
  // 서버 환경에서만 실행
  if (typeof window !== "undefined") {
    return;
  }

  try {
    const clientInfo = request
      ? UnifiedLogger.getClientInfoFromRequest(request)
      : undefined;

    await UnifiedLogger.logError(
      {
        userId: userId || undefined,
        error,
        errorCode,
        requestId,
        additionalInfo,
      },
      clientInfo,
    );
  } catch (error) {
    console.error("에러 로그 기록 실패:", error);
  }
}

/**
 * QR 코드 생성 로깅
 */
export async function logQrGeneration(
  qrType: string,
  request?: NextRequest,
  userId?: string | null,
  contentHash?: string,
  size?: string,
  format?: string,
  customization?: Record<string, any>,
) {
  // 서버 환경에서만 실행
  if (typeof window !== "undefined") {
    return;
  }

  try {
    const clientInfo = request
      ? UnifiedLogger.getClientInfoFromRequest(request)
      : undefined;

    await UnifiedLogger.logQrGeneration(
      {
        userId: userId || undefined,
        qrType,
        contentHash,
        size,
        format,
        customization,
      },
      clientInfo,
    );
  } catch (error) {
    console.error("QR 코드 생성 로그 기록 실패:", error);
  }
}

/**
 * 감사 로그 (데이터 변경 이력)
 */
export async function logAudit(
  action: string,
  tableName: string,
  request?: NextRequest,
  userId?: string | null,
  recordId?: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  changes?: string[],
) {
  // 서버 환경에서만 실행
  if (typeof window !== "undefined") {
    return;
  }

  try {
    const clientInfo = request
      ? UnifiedLogger.getClientInfoFromRequest(request)
      : undefined;

    await UnifiedLogger.logAudit(
      {
        userId: userId || undefined,
        action,
        tableName,
        recordId,
        oldValues,
        newValues,
        changes,
      },
      clientInfo,
    );
  } catch (error) {
    console.error("감사 로그 기록 실패:", error);
  }
}

/**
 * 시스템 로그
 */
export async function logSystem(
  action: string,
  message: string,
  request?: NextRequest,
  level: LogLevel = "INFO",
  metadata?: Record<string, any>,
) {
  // 서버 환경에서만 실행
  if (typeof window !== "undefined") {
    return;
  }

  try {
    const clientInfo = request
      ? UnifiedLogger.getClientInfoFromRequest(request)
      : undefined;

    await UnifiedLogger.logSystem(
      {
        action,
        message,
        level,
        metadata,
      },
      clientInfo,
    );
  } catch (error) {
    console.error("시스템 로그 기록 실패:", error);
  }
}

/**
 * 성능 측정 및 로깅 헬퍼
 */
export class PerformanceLogger {
  private startTime: number;
  private readonly action: string;
  private readonly userId?: string;

  constructor(action: string, userId?: string) {
    this.startTime = Date.now();
    this.action = action;
    this.userId = userId;
  }

  async end(additionalMetadata?: Record<string, any>) {
    const duration = Date.now() - this.startTime;

    try {
      await UnifiedLogger.logSystem({
        action: this.action,
        message: `작업 완료: ${this.action} (${duration}ms)`,
        level: "INFO",
        metadata: {
          duration,
          userId: this.userId,
          ...additionalMetadata,
        },
      });
    } catch (error) {
      console.error("성능 로그 기록 실패:", error);
    }

    return duration;
  }
}

/**
 * 요청 ID 생성
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 로그 레벨에 따른 필터링
 */
export function shouldLog(level: LogLevel): boolean {
  const currentLevel = process.env.LOG_LEVEL || "INFO";
  const levels = ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"];
  const currentIndex = levels.indexOf(currentLevel);
  const logIndex = levels.indexOf(level);

  return logIndex >= currentIndex;
}
