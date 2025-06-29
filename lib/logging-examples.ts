import { NextRequest } from "next/server";
import { UnifiedLogger } from "@/lib/unified-logging";
import { PerformanceLogger } from "@/lib/logging-middleware";
import {
  logApiRequest,
  logAuthEvent,
  logError,
  logQrGeneration,
  logAudit,
  logSystem,
} from "@/lib/logging-middleware";

/**
 * 통합 로그 시스템 사용법 예시
 */

// 1. API 접근 로그
async function exampleApiAccess() {
  await UnifiedLogger.logAccess({
    userId: "user123",
    method: "POST",
    path: "/api/qrcode/generate",
    statusCode: 200,
    responseTime: 45,
    requestId: "req_1234567890",
  });
}

// 2. 인증 로그
async function exampleAuth() {
  await UnifiedLogger.logAuth({
    userId: "user123",
    action: "사용자 로그인",
    authAction: "LOGIN",
    provider: "google",
    sessionId: "sess_abcdef123456",
  });
}

// 3. 감사 로그 (데이터 변경)
async function exampleAudit() {
  await UnifiedLogger.logAudit({
    userId: "user123",
    action: "QR_CODE_CREATED",
    tableName: "qr_codes",
    recordId: "qr_789",
    oldValues: undefined,
    newValues: {
      type: "URL",
      content: "https://example.com",
      title: "회사 홈페이지",
    },
    changes: ["created"],
  });
}

// 4. 에러 로그
async function exampleError() {
  try {
    // 일부 작업 수행
    throw new Error("데이터베이스 연결 실패");
  } catch (error) {
    await UnifiedLogger.logError({
      userId: "user123",
      error: error as Error,
      errorCode: "DB_CONN_001",
      requestId: "req_1234567890",
      additionalInfo: {
        connectionString: "***masked***",
        retryCount: 3,
        lastAttempt: new Date().toISOString(),
      },
    });
  }
}

// 5. QR 코드 생성 로그
async function exampleQrGeneration() {
  await UnifiedLogger.logQrGeneration({
    userId: "user123",
    qrType: "URL",
    contentHash: "sha256_abc123...", // 개인정보 보호를 위한 해시값
    size: "200x200",
    format: "PNG",
    customization: {
      backgroundColor: "#ffffff",
      foregroundColor: "#000000",
      logo: true,
      errorCorrectionLevel: "M",
    },
  });
}

// 6. 관리자 액션 로그
async function exampleAdminAction() {
  await UnifiedLogger.logAdminAction({
    adminId: "admin123",
    action: "USER_ACCOUNT_SUSPENDED",
    targetUserId: "user456",
    affectedRecords: 1,
    details: "스팸 활동으로 인한 계정 정지",
  });
}

// 7. 시스템 로그
async function exampleSystemLog() {
  await UnifiedLogger.logSystem({
    action: "SCHEDULED_CLEANUP",
    message: "시스템 정리 작업이 완료되었습니다",
    level: "INFO",
    metadata: {
      deletedFiles: 150,
      reclaimedSpace: "2.5GB",
      duration: "5m 30s",
    },
  });
}

// 8. 성능 측정
async function examplePerformanceTracking() {
  const perf = new PerformanceLogger("QR_CODE_GENERATION", "user123");

  try {
    // QR 코드 생성 작업 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 작업 완료 및 성능 로그 기록
    const duration = await perf.end({
      qrType: "URL",
      size: "200x200",
      success: true,
    });

    console.log(`QR 코드 생성 완료: ${duration}ms`);
  } catch (error) {
    await perf.end({
      error: (error as Error).message,
      success: false,
    });
  }
}

// 9. 로그 조회 및 필터링
async function exampleLogRetrieval() {
  // 특정 사용자의 최근 로그 조회
  const userLogsResult = await UnifiedLogger.getLogs({
    userId: "user123",
    limit: 50,
    orderBy: "desc",
  });

  // 에러 로그만 조회
  const errorLogsResult = await UnifiedLogger.getLogs({
    type: "ERROR",
    level: ["ERROR", "FATAL"],
    startDate: new Date("2023-01-01"),
    endDate: new Date("2023-12-31"),
  });

  // 특정 액션 검색
  const qrLogsResult = await UnifiedLogger.getLogs({
    search: "QR 코드",
    type: "QR_GENERATION",
    limit: 100,
  });

  return {
    userLogs: userLogsResult.logs,
    errorLogs: errorLogsResult.logs,
    qrLogs: qrLogsResult.logs,
  };
}

// 10. 로그 통계
async function exampleLogStatistics() {
  // 전체 로그 통계
  const overallStats = await UnifiedLogger.getLogStats();

  // 특정 기간 통계
  const monthlyStats = await UnifiedLogger.getLogStats({
    startDate: new Date("2023-11-01"),
    endDate: new Date("2023-11-30"),
  });

  // 특정 사용자 통계
  const userStats = await UnifiedLogger.getLogStats({
    userId: "user123",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 지난 7일
  });

  return { overallStats, monthlyStats, userStats };
}

// 11. 미들웨어 사용 예시 (API 라우트에서)
export async function apiRouteExample(request: Request) {
  const startTime = Date.now();

  try {
    // API 작업 수행
    const result = { success: true, data: "QR 코드 생성 완료" };

    // 응답 생성
    const response = new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // API 요청 로그 (성공)
    await logApiRequest(
      request as NextRequest,
      response,
      "user123",
      Date.now() - startTime,
    );

    return response;
  } catch (error) {
    // 에러 로그
    await logError(
      error as Error,
      request as NextRequest,
      "user123",
      "API_ERROR_001",
      request.headers.get("x-request-id") || undefined,
      { endpoint: "/api/qrcode/generate" },
    );

    const errorResponse = new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );

    // API 요청 로그 (실패)
    await logApiRequest(
      request as NextRequest,
      errorResponse,
      "user123",
      Date.now() - startTime,
    );

    return errorResponse;
  }
}

// 12. 정기적인 로그 정리 (크론 작업)
export async function scheduledLogCleanup() {
  try {
    // 90일 이전의 로그 정리
    const deletedCount = await UnifiedLogger.cleanupOldLogs(90);

    await UnifiedLogger.logSystem({
      action: "SCHEDULED_LOG_CLEANUP",
      message: `${deletedCount}개의 오래된 로그를 정리했습니다`,
      level: "INFO",
      metadata: {
        deletedCount,
        retentionDays: 90,
        cleanupDate: new Date().toISOString(),
      },
    });

    return { success: true, deletedCount };
  } catch (error) {
    await UnifiedLogger.logError({
      error: error as Error,
      errorCode: "LOG_CLEANUP_FAILED",
      additionalInfo: {
        task: "scheduled_cleanup",
        timestamp: new Date().toISOString(),
      },
    });

    return { success: false, error: (error as Error).message };
  }
}

// 사용법 예시 실행
export async function runAllExamples() {
  console.log("통합 로그 시스템 예시 실행 중...");

  await exampleApiAccess();
  await exampleAuth();
  await exampleAudit();
  await exampleError();
  await exampleQrGeneration();
  await exampleAdminAction();
  await exampleSystemLog();
  await examplePerformanceTracking();

  const logs = await exampleLogRetrieval();
  const stats = await exampleLogStatistics();

  console.log("로그 조회 결과:", logs);
  console.log("로그 통계:", stats);

  console.log("모든 예시가 완료되었습니다!");
}
