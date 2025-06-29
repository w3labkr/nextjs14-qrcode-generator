import { UnifiedLogger } from "./unified-logging";
import type {
  ApplicationLogData,
  LogType,
  LogLevel,
  AuthAction,
} from "@/types/logs";

/**
 * 인증 관련 로그 생성
 */
export async function createAuthLog({
  userId,
  action,
  level = "INFO",
  provider,
  sessionId,
  ipAddress,
  userAgent,
  message,
}: {
  userId?: string;
  action: AuthAction;
  level?: LogLevel;
  provider?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  message?: string;
}) {
  return UnifiedLogger.logAuth(
    {
      userId,
      action: message || `Authentication ${action.toLowerCase()}`,
      authAction: action,
      provider,
      sessionId,
    },
    { ipAddress: ipAddress || null, userAgent: userAgent || null },
  );
}

/**
 * API 접근 로그 생성
 */
export async function createAccessLog({
  userId,
  method,
  path,
  statusCode,
  responseTime,
  ipAddress,
  userAgent,
  requestId,
}: {
  userId?: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime?: number;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}) {
  return UnifiedLogger.logAccess(
    {
      userId,
      method,
      path,
      statusCode,
      responseTime,
      requestId,
    },
    { ipAddress: ipAddress || null, userAgent: userAgent || null },
  );
}

/**
 * 오류 로그 생성
 */
export async function createErrorLog({
  userId,
  error,
  context,
  level = "ERROR",
  ipAddress,
  userAgent,
}: {
  userId?: string;
  error: Error | string;
  context?: string;
  level?: LogLevel;
  ipAddress?: string;
  userAgent?: string;
}) {
  return UnifiedLogger.logError(
    {
      userId,
      error,
      requestId: context,
    },
    { ipAddress: ipAddress || null, userAgent: userAgent || null },
  );
}

/**
 * QR 코드 생성 로그
 */
export async function createQRGenerationLog({
  userId,
  qrType,
  dataSize,
  success,
  ipAddress,
  userAgent,
}: {
  userId?: string;
  qrType: string;
  dataSize?: number;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}) {
  return UnifiedLogger.logQrGeneration(
    {
      userId,
      qrType,
      size: dataSize?.toString(),
      format: "PNG",
    },
    { ipAddress: ipAddress || null, userAgent: userAgent || null },
  );
}

/**
 * 감사 로그 생성 (데이터 변경 추적)
 */
export async function createAuditLog({
  userId,
  tableName,
  recordId,
  action,
  oldValues,
  newValues,
  ipAddress,
  userAgent,
}: {
  userId?: string;
  tableName: string;
  recordId?: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  return UnifiedLogger.logAudit(
    {
      userId,
      action: `${action}_${tableName.toUpperCase()}`,
      tableName,
      recordId,
      oldValues,
      newValues,
    },
    { ipAddress: ipAddress || null, userAgent: userAgent || null },
  );
}

/**
 * 관리자 액션 로그
 */
export async function createAdminLog({
  userId,
  action,
  target,
  details,
  level = "INFO",
  ipAddress,
  userAgent,
}: {
  userId?: string;
  action: string;
  target?: string;
  details?: Record<string, any>;
  level?: LogLevel;
  ipAddress?: string;
  userAgent?: string;
}) {
  return UnifiedLogger.logAdminAction(
    {
      adminId: userId || "system",
      action,
      targetUserId: target,
      details: JSON.stringify(details || {}),
    },
    { ipAddress: ipAddress || null, userAgent: userAgent || null },
  );
}

/**
 * 시스템 로그 생성
 */
export async function createSystemLog({
  action,
  message,
  level = "INFO",
  metadata,
}: {
  action: string;
  message?: string;
  level?: LogLevel;
  metadata?: Record<string, any>;
}) {
  return UnifiedLogger.logSystem({
    action,
    message: message || action,
    metadata,
  });
}
