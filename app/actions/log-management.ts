"use server";

import { auth } from "@/auth";
import {
  createAccessLog,
  createAuthLog,
  createAuditLog,
  createErrorLog,
  createAdminActionLog,
  getAccessLogs,
  getAuthLogs,
  getAuditLogs,
  getErrorLogs,
  getAdminActionLogs,
  getLogStatistics,
} from "@/lib/log-utils";
import type {
  AccessLogData,
  AuthLogData,
  AuditLogData,
  ErrorLogData,
  AdminActionLogData,
  AccessLogFilterOptions,
  AuthLogFilterOptions,
  AuditLogFilterOptions,
  AdminActionLogFilterOptions,
  LogFilterOptions,
} from "@/types/logs";

// API 접근 로그 생성
export async function createAccessLogAction(
  data: Omit<AccessLogData, "id" | "createdAt">,
) {
  try {
    return await createAccessLog(data);
  } catch (error) {
    console.error("API 접근 로그 생성 액션 실패:", error);
    throw new Error("API 접근 로그 생성에 실패했습니다");
  }
}

// 인증 로그 생성
export async function createAuthLogAction(
  data: Omit<AuthLogData, "id" | "createdAt">,
) {
  try {
    return await createAuthLog(data);
  } catch (error) {
    console.error("인증 로그 생성 액션 실패:", error);
    throw new Error("인증 로그 생성에 실패했습니다");
  }
}

// 감사 로그 생성
export async function createAuditLogAction(
  data: Omit<AuditLogData, "id" | "createdAt">,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("인증이 필요합니다");
    }

    return await createAuditLog(data);
  } catch (error) {
    console.error("감사 로그 생성 액션 실패:", error);
    throw new Error("감사 로그 생성에 실패했습니다");
  }
}

// 에러 로그 생성
export async function createErrorLogAction(
  data: Omit<ErrorLogData, "id" | "createdAt">,
) {
  try {
    return await createErrorLog(data);
  } catch (error) {
    console.error("에러 로그 생성 액션 실패:", error);
    throw new Error("에러 로그 생성에 실패했습니다");
  }
}

// 관리자 액션 로그 생성
export async function createAdminActionLogAction(
  data: Omit<AdminActionLogData, "id" | "createdAt">,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("인증이 필요합니다");
    }

    // TODO: 관리자 권한 체크 로직 추가
    // if (!isAdmin(session.user.id)) {
    //   throw new Error('관리자 권한이 필요합니다')
    // }

    return await createAdminActionLog(data);
  } catch (error) {
    console.error("관리자 액션 로그 생성 액션 실패:", error);
    throw new Error("관리자 액션 로그 생성에 실패했습니다");
  }
}

// API 접근 로그 조회
export async function getAccessLogsAction(
  options: AccessLogFilterOptions = {},
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("인증이 필요합니다");
    }

    // 일반 사용자는 자신의 로그만 조회 가능
    if (!options.userId) {
      options.userId = session.user.id;
    }

    return await getAccessLogs(options);
  } catch (error) {
    console.error("API 접근 로그 조회 액션 실패:", error);
    throw new Error("API 접근 로그 조회에 실패했습니다");
  }
}

// 인증 로그 조회
export async function getAuthLogsAction(options: AuthLogFilterOptions = {}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("인증이 필요합니다");
    }

    // 일반 사용자는 자신의 로그만 조회 가능
    if (!options.userId) {
      options.userId = session.user.id;
    }

    return await getAuthLogs(options);
  } catch (error) {
    console.error("인증 로그 조회 액션 실패:", error);
    throw new Error("인증 로그 조회에 실패했습니다");
  }
}

// 감사 로그 조회 (관리자만)
export async function getAuditLogsAction(options: AuditLogFilterOptions = {}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("인증이 필요합니다");
    }

    // TODO: 관리자 권한 체크 로직 추가
    // if (!isAdmin(session.user.id)) {
    //   throw new Error('관리자 권한이 필요합니다')
    // }

    return await getAuditLogs(options);
  } catch (error) {
    console.error("감사 로그 조회 액션 실패:", error);
    throw new Error("감사 로그 조회에 실패했습니다");
  }
}

// 에러 로그 조회 (관리자만)
export async function getErrorLogsAction(options: LogFilterOptions = {}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("인증이 필요합니다");
    }

    // TODO: 관리자 권한 체크 로직 추가
    // if (!isAdmin(session.user.id)) {
    //   throw new Error('관리자 권한이 필요합니다')
    // }

    return await getErrorLogs(options);
  } catch (error) {
    console.error("에러 로그 조회 액션 실패:", error);
    throw new Error("에러 로그 조회에 실패했습니다");
  }
}

// 관리자 액션 로그 조회 (관리자만)
export async function getAdminActionLogsAction(
  options: AdminActionLogFilterOptions = {},
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("인증이 필요합니다");
    }

    // TODO: 관리자 권한 체크 로직 추가
    // if (!isAdmin(session.user.id)) {
    //   throw new Error('관리자 권한이 필요합니다')
    // }

    return await getAdminActionLogs(options);
  } catch (error) {
    console.error("관리자 액션 로그 조회 액션 실패:", error);
    throw new Error("관리자 액션 로그 조회에 실패했습니다");
  }
}

// 로그 통계 조회 (관리자만)
export async function getLogStatisticsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("인증이 필요합니다");
    }

    // TODO: 관리자 권한 체크 로직 추가
    // if (!isAdmin(session.user.id)) {
    //   throw new Error('관리자 권한이 필요합니다')
    // }

    return await getLogStatistics();
  } catch (error) {
    console.error("로그 통계 조회 액션 실패:", error);
    throw new Error("로그 통계 조회에 실패했습니다");
  }
}
