import { prisma } from "@/lib/prisma";
import type {
  AccessLogData,
  AuthLogData,
  AuditLogData,
  ErrorLogData,
  AdminActionLogData,
  LogFilterOptions,
  AccessLogFilterOptions,
  AuthLogFilterOptions,
  AuditLogFilterOptions,
  AdminActionLogFilterOptions,
  AuthAction,
} from "@/types/logs";

// API 접근 로그 생성
export async function createAccessLog(
  data: Omit<AccessLogData, "id" | "createdAt">,
) {
  try {
    return await prisma.accessLog.create({
      data: {
        userId: data.userId,
        method: data.method,
        path: data.path,
        statusCode: data.statusCode,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
    });
  } catch (error) {
    console.error("API 접근 로그 생성 실패:", error);
    throw error;
  }
}

// 인증 로그 생성
export async function createAuthLog(
  data: Omit<AuthLogData, "id" | "createdAt">,
) {
  try {
    return await prisma.authLog.create({
      data: {
        userId: data.userId,
        action: data.action,
      },
    });
  } catch (error) {
    console.error("인증 로그 생성 실패:", error);
    throw error;
  }
}

// 감사 로그 생성
export async function createAuditLog(
  data: Omit<AuditLogData, "id" | "createdAt">,
) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        tableName: data.tableName,
        recordId: data.recordId,
      },
    });
  } catch (error) {
    console.error("감사 로그 생성 실패:", error);
    throw error;
  }
}

// 에러 로그 생성
export async function createErrorLog(
  data: Omit<ErrorLogData, "id" | "createdAt">,
) {
  try {
    return await prisma.errorLog.create({
      data: {
        userId: data.userId,
        errorMessage: data.errorMessage,
      },
    });
  } catch (error) {
    console.error("에러 로그 생성 실패:", error);
    throw error;
  }
}

// 관리자 액션 로그 생성
export async function createAdminActionLog(
  data: Omit<AdminActionLogData, "id" | "createdAt">,
) {
  try {
    return await prisma.adminActionLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        detail: data.detail,
      },
    });
  } catch (error) {
    console.error("관리자 액션 로그 생성 실패:", error);
    throw error;
  }
}

// API 접근 로그 조회
export async function getAccessLogs(options: AccessLogFilterOptions = {}) {
  try {
    const where: any = {};

    if (options.userId) where.userId = options.userId;
    if (options.method) where.method = options.method;
    if (options.statusCode) where.statusCode = options.statusCode;
    if (options.path) where.path = { contains: options.path };
    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }

    return await prisma.accessLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: options.orderBy || "desc",
      },
      take: options.limit,
      skip: options.offset,
    });
  } catch (error) {
    console.error("API 접근 로그 조회 실패:", error);
    throw error;
  }
}

// 인증 로그 조회
export async function getAuthLogs(options: AuthLogFilterOptions = {}) {
  try {
    const where: any = {};

    if (options.userId) where.userId = options.userId;
    if (options.action) where.action = options.action;
    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }

    return await prisma.authLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: options.orderBy || "desc",
      },
      take: options.limit,
      skip: options.offset,
    });
  } catch (error) {
    console.error("인증 로그 조회 실패:", error);
    throw error;
  }
}

// 감사 로그 조회 (관리자만)
export async function getAuditLogs(options: AuditLogFilterOptions = {}) {
  try {
    const where: any = {};

    if (options.userId) where.userId = options.userId;
    if (options.tableName) where.tableName = options.tableName;
    if (options.action) where.action = { contains: options.action };
    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }

    return await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: options.orderBy || "desc",
      },
      take: options.limit,
      skip: options.offset,
    });
  } catch (error) {
    console.error("감사 로그 조회 실패:", error);
    throw error;
  }
}

// 에러 로그 조회 (관리자만)
export async function getErrorLogs(options: LogFilterOptions = {}) {
  try {
    const where: any = {};

    if (options.userId) where.userId = options.userId;
    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }

    return await prisma.errorLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: options.orderBy || "desc",
      },
      take: options.limit,
      skip: options.offset,
    });
  } catch (error) {
    console.error("에러 로그 조회 실패:", error);
    throw error;
  }
}

// 관리자 액션 로그 조회 (관리자만)
export async function getAdminActionLogs(
  options: AdminActionLogFilterOptions = {},
) {
  try {
    const where: any = {};

    if (options.userId) where.adminId = options.userId;
    if (options.action) where.action = { contains: options.action };
    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = options.startDate;
      if (options.endDate) where.createdAt.lte = options.endDate;
    }

    return await prisma.adminActionLog.findMany({
      where,
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: options.orderBy || "desc",
      },
      take: options.limit,
      skip: options.offset,
    });
  } catch (error) {
    console.error("관리자 액션 로그 조회 실패:", error);
    throw error;
  }
}

// 로그 통계 조회 (관리자만)
export async function getLogStatistics() {
  try {
    const [
      accessLogCount,
      authLogCount,
      auditLogCount,
      errorLogCount,
      adminActionLogCount,
      todayAccessLogs,
      todayAuthLogs,
      todayErrorLogs,
    ] = await Promise.all([
      prisma.accessLog.count(),
      prisma.authLog.count(),
      prisma.auditLog.count(),
      prisma.errorLog.count(),
      prisma.adminActionLog.count(),
      prisma.accessLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.authLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.errorLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      total: {
        accessLogs: accessLogCount,
        authLogs: authLogCount,
        auditLogs: auditLogCount,
        errorLogs: errorLogCount,
        adminActionLogs: adminActionLogCount,
      },
      today: {
        accessLogs: todayAccessLogs,
        authLogs: todayAuthLogs,
        errorLogs: todayErrorLogs,
      },
    };
  } catch (error) {
    console.error("로그 통계 조회 실패:", error);
    throw error;
  }
}
