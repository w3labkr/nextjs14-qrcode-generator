"use server";

import { auth } from "@/auth";
import { UnifiedLogger } from "@/lib/unified-logging";
import type {
  LogType,
  LogLevel,
  LogFilterOptions,
  ApplicationLogData,
} from "@/types/logs";

// 관리자 권한 확인 함수
function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  // 환경변수에서 관리자 이메일 목록 가져오기
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
  return adminEmails.includes(email);
}

/**
 * API 접근 로그 생성
 */
export async function logAccessAction(params: {
  method: string;
  path: string;
  statusCode: number;
  responseTime?: number;
  requestId?: string;
}) {
  try {
    const session = await auth();
    await UnifiedLogger.logAccess({
      userId: session?.user?.id,
      ...params,
    });
    return { success: true };
  } catch (error) {
    console.error("API 접근 로그 생성 실패:", error);
    return { success: false, error: "API 접근 로그 생성에 실패했습니다" };
  }
}

/**
 * 인증 로그 생성
 */
export async function logAuthAction(params: {
  action: string;
  authAction: "LOGIN" | "LOGOUT" | "REFRESH" | "REVOKE" | "FAIL";
  provider?: string;
  sessionId?: string;
}) {
  try {
    const session = await auth();
    await UnifiedLogger.logAuth({
      userId: session?.user?.id,
      ...params,
    });
    return { success: true };
  } catch (error) {
    console.error("인증 로그 생성 실패:", error);
    return { success: false, error: "인증 로그 생성에 실패했습니다" };
  }
}

/**
 * 감사 로그 생성 (데이터 변경)
 */
export async function logAuditAction(params: {
  action: string;
  tableName: string;
  recordId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changes?: string[];
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("인증이 필요합니다");
    }

    await UnifiedLogger.logAudit({
      userId: session.user.id,
      ...params,
    });
    return { success: true };
  } catch (error) {
    console.error("감사 로그 생성 실패:", error);
    return { success: false, error: "감사 로그 생성에 실패했습니다" };
  }
}

/**
 * 에러 로그 생성
 */
export async function logErrorAction(params: {
  error: Error | string;
  errorCode?: string;
  requestId?: string;
  additionalInfo?: Record<string, any>;
}) {
  try {
    const session = await auth();
    await UnifiedLogger.logError({
      userId: session?.user?.id,
      ...params,
    });
    return { success: true };
  } catch (error) {
    console.error("에러 로그 생성 실패:", error);
    return { success: false, error: "에러 로그 생성에 실패했습니다" };
  }
}

/**
 * 관리자 액션 로그 생성
 */
export async function logAdminAction(params: {
  action: string;
  targetUserId?: string;
  affectedRecords?: number;
  details?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("인증이 필요합니다");
    }

    if (!isAdmin(session.user.email)) {
      throw new Error("관리자 권한이 필요합니다");
    }

    await UnifiedLogger.logAdminAction({
      adminId: session.user.id,
      ...params,
    });
    return { success: true };
  } catch (error) {
    console.error("관리자 액션 로그 생성 실패:", error);
    return { success: false, error: "관리자 액션 로그 생성에 실패했습니다" };
  }
}

/**
 * QR 코드 생성 로그
 */
export async function logQrGenerationAction(params: {
  qrType: string;
  contentHash?: string;
  size?: string;
  format?: string;
  customization?: Record<string, any>;
}) {
  try {
    const session = await auth();
    await UnifiedLogger.logQrGeneration({
      userId: session?.user?.id,
      ...params,
    });
    return { success: true };
  } catch (error) {
    console.error("QR 코드 생성 로그 생성 실패:", error);
    return { success: false, error: "QR 코드 생성 로그 생성에 실패했습니다" };
  }
}

/**
 * 로그 조회
 */
export async function getLogsAction(filters: LogFilterOptions = {}) {
  try {
    const session = await auth();

    // 관리자가 아닌 경우 자신의 로그만 조회 가능
    if (!isAdmin(session?.user?.email)) {
      filters.userId = session?.user?.id;
    }

    const logs = await UnifiedLogger.getLogs(filters);
    return { success: true, data: logs };
  } catch (error) {
    console.error("로그 조회 액션 실패:", error);
    return { success: false, error: "로그 조회에 실패했습니다" };
  }
}

/**
 * 로그 통계 조회
 */
export async function getLogStatsAction(
  filters: Partial<LogFilterOptions> = {},
) {
  try {
    const session = await auth();

    // 관리자가 아닌 경우 자신의 로그 통계만 조회 가능
    if (!isAdmin(session?.user?.email)) {
      filters.userId = session?.user?.id;
    }

    const stats = await UnifiedLogger.getLogStats(filters);
    return { success: true, data: stats };
  } catch (error) {
    console.error("로그 통계 조회 실패:", error);
    return { success: false, error: "로그 통계 조회에 실패했습니다" };
  }
}

/**
 * 오래된 로그 정리 (관리자만)
 */
export async function cleanupOldLogsAction(retentionDays = 90) {
  try {
    const session = await auth();

    if (!session?.user?.id || !isAdmin(session.user.email)) {
      throw new Error("관리자 권한이 필요합니다");
    }

    const deletedCount = await UnifiedLogger.cleanupOldLogs(retentionDays);
    return { success: true, data: { deletedCount } };
  } catch (error) {
    console.error("로그 정리 실패:", error);
    return { success: false, error: "로그 정리에 실패했습니다" };
  }
}
