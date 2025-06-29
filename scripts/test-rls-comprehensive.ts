#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";
import { validateRLSPolicies } from "../lib/rls-utils.js";
import { RLSManager } from "../lib/rls-manager.js";

const prisma = new PrismaClient();

/**
 * RLS 통합 테스트 스크립트
 * 이 스크립트는 RLS 시스템의 전체적인 동작을 테스트합니다.
 */

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  duration: number;
}

const results: TestResult[] = [];

function addResult(
  testName: string,
  passed: boolean,
  message: string,
  startTime: number,
) {
  results.push({
    testName,
    passed,
    message,
    duration: Date.now() - startTime,
  });
}

async function testRLSPolicyValidation() {
  const startTime = Date.now();
  console.log("🔍 RLS 정책 검증 테스트 시작...");

  try {
    const validation = await validateRLSPolicies();
    if (validation.success && validation.missingPolicies) {
      const message = `${validation.totalPolicies}개 정책 발견, ${validation.missingPolicies.length}개 테이블에 정책 누락`;
      addResult(
        "RLS 정책 검증",
        validation.missingPolicies.length === 0,
        message,
        startTime,
      );
    } else {
      addResult(
        "RLS 정책 검증",
        false,
        validation.error || "Unknown error",
        startTime,
      );
    }
  } catch (error) {
    addResult("RLS 정책 검증", false, `오류: ${error}`, startTime);
  }
}

async function testRLSContextManagement() {
  const startTime = Date.now();
  console.log("🔧 RLS 컨텍스트 관리 테스트 시작...");

  try {
    const testUserId = "test-user-" + Date.now();

    // 컨텍스트 설정 테스트
    await RLSManager.setUserContext(testUserId, false);

    // 컨텍스트 검증 테스트
    const validation = await RLSManager.validateContext();

    if (validation.valid && validation.context?.userId === testUserId) {
      addResult(
        "RLS 컨텍스트 관리",
        true,
        "컨텍스트 설정 및 검증 성공",
        startTime,
      );
    } else {
      addResult(
        "RLS 컨텍스트 관리",
        false,
        validation.error || "컨텍스트 불일치",
        startTime,
      );
    }

    // 컨텍스트 클리어
    await RLSManager.clearContext();
  } catch (error) {
    addResult("RLS 컨텍스트 관리", false, `오류: ${error}`, startTime);
  }
}

async function testRLSPerformance() {
  const startTime = Date.now();
  console.log("⚡ RLS 성능 테스트 시작...");

  try {
    const benchmark = await RLSManager.benchmarkRLS();

    if (benchmark.success && benchmark.results) {
      const avgSetTime = benchmark.results.setContextAvg;
      const avgClearTime = benchmark.results.clearContextAvg;

      // 성능 기준: 컨텍스트 설정/클리어가 10ms 이하
      const performanceOk = avgSetTime < 10 && avgClearTime < 10;
      const message = `평균 설정시간: ${avgSetTime.toFixed(2)}ms, 평균 클리어시간: ${avgClearTime.toFixed(2)}ms`;

      addResult("RLS 성능", performanceOk, message, startTime);
    } else {
      addResult(
        "RLS 성능",
        false,
        benchmark.error || "벤치마크 실패",
        startTime,
      );
    }
  } catch (error) {
    addResult("RLS 성능", false, `오류: ${error}`, startTime);
  }
}

async function testRLSIsolation() {
  const startTime = Date.now();
  console.log("🔒 RLS 격리 테스트 시작...");

  try {
    // 테스트용 사용자 생성
    const user1 = await prisma.user.create({
      data: {
        email: `test1-${Date.now()}@example.com`,
        name: "Test User 1",
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: `test2-${Date.now()}@example.com`,
        name: "Test User 2",
      },
    });

    // User1 컨텍스트로 QR 코드 생성
    await RLSManager.setUserContext(user1.id, false);
    const user1QrCode = await prisma.qrCode.create({
      data: {
        userId: user1.id,
        type: "URL",
        content: "https://example.com",
        settings: "{}",
      },
    });

    // User2 컨텍스트에서 User1의 QR 코드 조회 시도
    await RLSManager.setUserContext(user2.id, false);
    const user2QrCodes = await prisma.qrCode.findMany({
      where: { userId: user1.id },
    });

    // User2는 User1의 QR 코드를 볼 수 없어야 함
    const isolationWorking = user2QrCodes.length === 0;

    // 정리
    await RLSManager.withAdminContext(async () => {
      await prisma.qrCode.delete({ where: { id: user1QrCode.id } });
      await prisma.user.deleteMany({
        where: { id: { in: [user1.id, user2.id] } },
      });
    });

    addResult(
      "RLS 격리",
      isolationWorking,
      isolationWorking ? "격리 정상 동작" : "격리 실패",
      startTime,
    );
  } catch (error) {
    addResult("RLS 격리", false, `오류: ${error}`, startTime);
  } finally {
    await RLSManager.clearContext();
  }
}

async function runAllTests() {
  console.log("🚀 RLS 통합 테스트 시작\n");

  const overallStartTime = Date.now();

  await testRLSPolicyValidation();
  await testRLSContextManagement();
  await testRLSPerformance();
  await testRLSIsolation();

  const overallDuration = Date.now() - overallStartTime;

  console.log("\n📊 테스트 결과:");
  console.log("================");

  let passedCount = 0;
  results.forEach((result) => {
    const status = result.passed ? "✅ 통과" : "❌ 실패";
    console.log(`${status} ${result.testName} (${result.duration}ms)`);
    console.log(`   ${result.message}`);
    if (result.passed) passedCount++;
  });

  console.log(`\n총 테스트: ${results.length}개`);
  console.log(`통과: ${passedCount}개`);
  console.log(`실패: ${results.length - passedCount}개`);
  console.log(`전체 소요시간: ${overallDuration}ms`);

  const allPassed = passedCount === results.length;
  console.log(
    `\n${allPassed ? "🎉 모든 테스트 통과!" : "⚠️ 일부 테스트 실패"}`,
  );

  process.exit(allPassed ? 0 : 1);
}

// 스크립트 실행
runAllTests()
  .catch((error) => {
    console.error("테스트 실행 중 오류:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
