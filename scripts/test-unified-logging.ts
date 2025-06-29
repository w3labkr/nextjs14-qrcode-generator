/**
 * 통합 로그 시스템 테스트 스크립트
 */
import { UnifiedLogger } from "../lib/unified-logging";

async function testUnifiedLogging() {
  console.log("🧪 통합 로그 시스템 테스트 시작...\n");

  try {
    // 1. 각 타입별 로그 생성 테스트
    console.log("1. 로그 생성 테스트...");

    await UnifiedLogger.logAccess({
      method: "GET",
      path: "/api/test",
      statusCode: 200,
      responseTime: 150,
    });
    console.log("✅ ACCESS 로그 생성 완료");

    await UnifiedLogger.logAuth({
      userId: undefined, // 유효하지 않은 사용자 ID 대신 undefined 사용
      action: "LOGIN",
      authAction: "LOGIN",
      provider: "google",
    });
    console.log("✅ AUTH 로그 생성 완료");

    await UnifiedLogger.logQrGeneration({
      userId: undefined, // 유효하지 않은 사용자 ID 대신 undefined 사용
      qrType: "URL",
      size: "400x400",
      format: "png",
      customization: {
        hasLogo: false,
        hasCustomColor: true,
      },
    });
    console.log("✅ QR_GENERATION 로그 생성 완료");

    await UnifiedLogger.logAudit({
      userId: undefined, // 유효하지 않은 사용자 ID 대신 undefined 사용
      action: "UPDATE_QR_CODE",
      tableName: "qr_codes",
      recordId: "test-qr-123",
      oldValues: { title: "이전 제목" },
      newValues: { title: "새로운 제목" },
    });
    console.log("✅ AUDIT 로그 생성 완료");

    await UnifiedLogger.logError({
      userId: undefined, // 유효하지 않은 사용자 ID 대신 undefined 사용
      error: new Error("테스트 에러"),
      errorCode: "TEST_ERROR",
      additionalInfo: { testData: true },
    });
    console.log("✅ ERROR 로그 생성 완료");

    await UnifiedLogger.logSystem({
      action: "SYSTEM_STARTUP",
      message: "시스템이 정상적으로 시작되었습니다.",
      level: "INFO",
    });
    console.log("✅ SYSTEM 로그 생성 완료");

    // 2. 로그 조회 테스트
    console.log("\n2. 로그 조회 테스트...");

    const logs = await UnifiedLogger.getLogs({
      limit: 10,
      orderBy: "desc",
    });
    console.log(`✅ 최근 로그 ${logs.length}개 조회 완료`);

    // 3. 통계 테스트
    console.log("\n3. 로그 통계 테스트...");

    const stats = await UnifiedLogger.getLogStats();
    console.log("✅ 로그 통계 조회 완료:");
    console.log(`   - 총 로그 수: ${stats.total}`);
    console.log(`   - 타입별: ${JSON.stringify(stats.byType, null, 2)}`);
    console.log(`   - 레벨별: ${JSON.stringify(stats.byLevel, null, 2)}`);

    console.log("\n🎉 통합 로그 시스템 테스트 완료!");

    return {
      success: true,
      logsCreated: 6,
      logsRetrieved: logs.length,
      stats,
    };
  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// 스크립트 실행
if (require.main === module) {
  testUnifiedLogging()
    .then((result) => {
      console.log("\n📊 테스트 결과:", result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("스크립트 실행 오류:", error);
      process.exit(1);
    });
}

export { testUnifiedLogging };
