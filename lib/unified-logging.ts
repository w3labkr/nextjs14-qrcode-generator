import { prisma } from "@/lib/prisma";
import { RLSManager } from "@/lib/rls-manager";
import type {
  ApplicationLogData,
  LogType,
  LogLevel,
  AccessLogMetadata,
  AuthLogMetadata,
  AuditLogMetadata,
  ErrorLogMetadata,
  AdminActionLogMetadata,
  QrGenerationLogMetadata,
  LogFilterOptions,
} from "@/types/logs";

/**
 * 통합 로깅 시스템
 * 모든 로그를 하나의 테이블로 관리하여 성능과 유지보수성을 향상
 */
export class UnifiedLogger {
  /**
   * Server Component에서 클라이언트 정보를 가져오는 헬퍼 함수
   * 이 함수는 Server Component에서만 호출되어야 합니다.
   */
  static async getClientInfoFromHeaders(): Promise<{
    ipAddress: string | null;
    userAgent: string | null;
  }> {
    try {
      // 동적으로 next/headers를 import하여 Server Component에서만 사용
      const { headers } = await import("next/headers");
      const headersList = headers();
      return {
        ipAddress:
          headersList.get("x-forwarded-for") ||
          headersList.get("x-real-ip") ||
          null,
        userAgent: headersList.get("user-agent") || null,
      };
    } catch (error) {
      // headers() 호출이 실패하는 경우 (클라이언트 사이드, API 라우트 등)
      return {
        ipAddress: null,
        userAgent: null,
      };
    }
  }

  /**
   * Request 객체에서 클라이언트 정보를 가져오는 헬퍼 함수
   * API 라우트에서 사용됩니다.
   */
  static getClientInfoFromRequest(request: Request): {
    ipAddress: string | null;
    userAgent: string | null;
  } {
    const headers = request.headers;
    return {
      ipAddress:
        headers.get("x-forwarded-for") || headers.get("x-real-ip") || null,
      userAgent: headers.get("user-agent") || null,
    };
  }

  /**
   * 기본 로그 생성 메서드
   */
  private static async createLog(
    data: ApplicationLogData,
    clientInfo?: { ipAddress: string | null; userAgent: string | null },
  ): Promise<void> {
    try {
      // 클라이언트 정보가 제공되지 않은 경우 자동으로 가져오기 시도
      let finalClientInfo = clientInfo;
      if (!finalClientInfo) {
        try {
          finalClientInfo = await this.getClientInfoFromHeaders();
        } catch {
          finalClientInfo = { ipAddress: null, userAgent: null };
        }
      }

      await prisma.applicationLog.create({
        data: {
          userId: data.userId,
          type: data.type,
          action: data.action,
          category: data.category,
          message: data.message,
          metadata: data.metadata as any,
          level: data.level || "INFO",
          ipAddress: data.ipAddress || finalClientInfo.ipAddress,
          userAgent: data.userAgent || finalClientInfo.userAgent,
        },
      });
    } catch (error) {
      console.error("로그 저장 실패:", error);
    }
  }

  /**
   * API 접근 로그
   */
  static async logAccess(
    params: {
      userId?: string;
      method: string;
      path: string;
      statusCode: number;
      responseTime?: number;
      requestId?: string;
    },
    clientInfo?: { ipAddress: string | null; userAgent: string | null },
  ) {
    const metadata: AccessLogMetadata = {
      method: params.method,
      path: params.path,
      statusCode: params.statusCode,
      responseTime: params.responseTime,
      requestId: params.requestId,
    };

    await this.createLog(
      {
        userId: params.userId,
        type: "ACCESS",
        action: `${params.method} ${params.path}`,
        category: "API_ACCESS",
        message: `${params.method} ${params.path} - ${params.statusCode}`,
        metadata,
        level: params.statusCode >= 400 ? "ERROR" : "INFO",
      },
      clientInfo,
    );
  }

  /**
   * 인증 로그
   */
  static async logAuth(
    params: {
      userId?: string;
      action: string;
      authAction: "LOGIN" | "LOGOUT" | "REFRESH" | "REVOKE" | "FAIL";
      provider?: string;
      sessionId?: string;
    },
    clientInfo?: { ipAddress: string | null; userAgent: string | null },
  ) {
    const metadata: AuthLogMetadata = {
      authAction: params.authAction,
      provider: params.provider,
      sessionId: params.sessionId,
    };

    await this.createLog(
      {
        userId: params.userId,
        type: "AUTH",
        action: params.action,
        category: "AUTHENTICATION",
        message: `사용자 인증: ${params.authAction}`,
        metadata,
        level: params.authAction === "FAIL" ? "WARN" : "INFO",
      },
      clientInfo,
    );
  }

  /**
   * 감사 로그 (데이터 변경)
   */
  static async logAudit(
    params: {
      userId?: string;
      action: string;
      tableName: string;
      recordId?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      changes?: string[];
    },
    clientInfo?: { ipAddress: string | null; userAgent: string | null },
  ) {
    const metadata: AuditLogMetadata = {
      tableName: params.tableName,
      recordId: params.recordId,
      oldValues: params.oldValues,
      newValues: params.newValues,
      changes: params.changes,
    };

    await this.createLog(
      {
        userId: params.userId,
        type: "AUDIT",
        action: params.action,
        category: "DATA_CHANGE",
        message: `${params.tableName} 테이블에서 ${params.action} 수행`,
        metadata,
        level: "INFO",
      },
      clientInfo,
    );
  }

  /**
   * 에러 로그
   */
  static async logError(
    params: {
      userId?: string;
      error: Error | string;
      errorCode?: string;
      requestId?: string;
      additionalInfo?: Record<string, any>;
    },
    clientInfo?: { ipAddress: string | null; userAgent: string | null },
  ) {
    const errorMessage =
      typeof params.error === "string" ? params.error : params.error.message;

    const metadata: ErrorLogMetadata = {
      errorCode: params.errorCode,
      stackTrace:
        typeof params.error === "object" ? params.error.stack : undefined,
      requestId: params.requestId,
      additionalInfo: params.additionalInfo,
    };

    await this.createLog(
      {
        userId: params.userId,
        type: "ERROR",
        action: "ERROR_OCCURRED",
        category: "APPLICATION_ERROR",
        message: errorMessage,
        metadata,
        level: "ERROR",
      },
      clientInfo,
    );
  }

  /**
   * 관리자 액션 로그
   */
  static async logAdminAction(
    params: {
      adminId: string;
      action: string;
      targetUserId?: string;
      affectedRecords?: number;
      details?: string;
    },
    clientInfo?: { ipAddress: string | null; userAgent: string | null },
  ) {
    const metadata: AdminActionLogMetadata = {
      targetUserId: params.targetUserId,
      affectedRecords: params.affectedRecords,
      details: params.details,
    };

    await this.createLog(
      {
        userId: params.adminId,
        type: "ADMIN",
        action: params.action,
        category: "ADMIN_ACTION",
        message: `관리자 액션: ${params.action}`,
        metadata,
        level: "INFO",
      },
      clientInfo,
    );
  }

  /**
   * QR 코드 생성 로그
   */
  static async logQrGeneration(
    params: {
      userId?: string;
      qrType: string;
      contentHash?: string;
      size?: string;
      format?: string;
      customization?: Record<string, any>;
    },
    clientInfo?: { ipAddress: string | null; userAgent: string | null },
  ) {
    const metadata: QrGenerationLogMetadata = {
      qrType: params.qrType,
      contentHash: params.contentHash,
      size: params.size,
      format: params.format,
      customization: params.customization,
    };

    await this.createLog(
      {
        userId: params.userId,
        type: "QR_GENERATION",
        action: "QR_CODE_GENERATED",
        category: "QR_SERVICE",
        message: `QR 코드 생성: ${params.qrType}`,
        metadata,
        level: "INFO",
      },
      clientInfo,
    );
  }

  /**
   * 시스템 로그
   */
  static async logSystem(
    params: {
      action: string;
      message: string;
      level?: LogLevel;
      metadata?: Record<string, any>;
    },
    clientInfo?: { ipAddress: string | null; userAgent: string | null },
  ) {
    await this.createLog(
      {
        type: "SYSTEM",
        action: params.action,
        category: "SYSTEM",
        message: params.message,
        metadata: params.metadata,
        level: params.level || "INFO",
      },
      clientInfo,
    );
  }

  /**
   * 로그 조회 (RLS 적용)
   */
  static async getLogs(
    filters: LogFilterOptions = {},
    requestUserId?: string,
    isAdmin: boolean = false,
  ) {
    const {
      userId,
      type,
      level,
      action,
      category,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
      orderBy = "desc",
      ipAddress,
      search,
    } = filters;

    // RLS 컨텍스트 설정
    if (requestUserId) {
      await RLSManager.setUserContext(requestUserId, isAdmin);
    }

    const where: any = {};

    if (userId) where.userId = userId;
    if (type) {
      where.type = Array.isArray(type) ? { in: type } : type;
    }
    if (level) {
      where.level = Array.isArray(level) ? { in: level } : level;
    }
    if (action) where.action = { contains: action, mode: "insensitive" };
    if (category) where.category = category;
    if (ipAddress) where.ipAddress = ipAddress;
    if (search) {
      where.OR = [
        { message: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    return await prisma.applicationLog.findMany({
      where,
      orderBy: { createdAt: orderBy },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * 로그 통계 (RLS 적용)
   */
  static async getLogStats(
    filters: Partial<LogFilterOptions> = {},
    requestUserId?: string,
    isAdmin: boolean = false,
  ) {
    const { userId, startDate, endDate } = filters;

    // RLS 컨텍스트 설정
    if (requestUserId) {
      await RLSManager.setUserContext(requestUserId, isAdmin);
    }

    const where: any = {};
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [typeStats, levelStats, totalCount] = await Promise.all([
      prisma.applicationLog.groupBy({
        by: ["type"],
        where,
        _count: { _all: true },
      }),
      prisma.applicationLog.groupBy({
        by: ["level"],
        where,
        _count: { _all: true },
      }),
      prisma.applicationLog.count({ where }),
    ]);

    return {
      total: totalCount,
      byType: typeStats.reduce(
        (acc: Record<string, number>, stat: any) => {
          acc[stat.type] = stat._count._all;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byLevel: levelStats.reduce(
        (acc: Record<string, number>, stat: any) => {
          acc[stat.level] = stat._count._all;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  /**
   * 오래된 로그 정리 (데이터 보존 정책, 관리자만 실행 가능)
   */
  static async cleanupOldLogs(retentionDays = 90, adminUserId?: string) {
    // 관리자 권한으로 실행
    if (adminUserId) {
      await RLSManager.setUserContext(adminUserId, true);
    } else {
      await RLSManager.setAdminMode(true);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const deletedCount = await prisma.applicationLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        level: {
          in: ["DEBUG", "INFO"], // 중요하지 않은 로그만 삭제
        },
      },
    });

    await this.logSystem({
      action: "LOG_CLEANUP",
      message: `${deletedCount.count}개의 오래된 로그를 정리했습니다.`,
      level: "INFO",
      metadata: { deletedCount: deletedCount.count, retentionDays },
    });

    return deletedCount.count;
  }
}

/**
 * QR 코드 타입 추론 함수
 */
export function inferQrType(text: string): string {
  // URL 패턴
  if (/^https?:\/\//.test(text)) return "URL";

  // Email 패턴
  if (/^mailto:|^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return "EMAIL";

  // WiFi 패턴
  if (/^WIFI:/.test(text)) return "WIFI";

  // SMS 패턴
  if (/^(sms:|smsto:)/.test(text)) return "SMS";

  // vCard 패턴
  if (/^BEGIN:VCARD/.test(text)) return "VCARD";

  // 지리적 좌표 패턴
  if (/^geo:|^-?\d+\.\d+,-?\d+\.\d+/.test(text)) return "LOCATION";

  // 전화번호 패턴
  if (/^tel:|\+?\d[\d\s\-\(\)]{8,}/.test(text)) return "PHONE";

  // 기본값
  return "TEXT";
}

// 편의 함수들
export const logAccess = UnifiedLogger.logAccess.bind(UnifiedLogger);
export const logAuth = UnifiedLogger.logAuth.bind(UnifiedLogger);
export const logAudit = UnifiedLogger.logAudit.bind(UnifiedLogger);
export const logError = UnifiedLogger.logError.bind(UnifiedLogger);
export const logAdminAction = UnifiedLogger.logAdminAction.bind(UnifiedLogger);
export const logQrGeneration =
  UnifiedLogger.logQrGeneration.bind(UnifiedLogger);
export const logSystem = UnifiedLogger.logSystem.bind(UnifiedLogger);
