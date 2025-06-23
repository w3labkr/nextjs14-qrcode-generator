import { prisma } from "@/lib/prisma";

/**
 * RLS(Row Level Security)를 위한 유틸리티 함수들
 */

/**
 * 현재 사용자 ID를 설정하여 RLS 정책을 활성화합니다.
 * @param userId - 현재 사용자의 ID
 * @returns Prisma 클라이언트 인스턴스
 */
export async function withRLS(userId: string) {
  // SQL 인젝션을 방지하기 위해 userId 검증
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid user ID");
  }

  // CUID 또는 UUID 형식 검증 (추가 보안)
  // CUID: 25자리 문자열 (예: c1234567890123456789012345)
  // UUID: 36자리 문자열 (예: 12345678-1234-1234-1234-123456789012)
  const cuidRegex = /^c[0-9a-z]{24}$/i;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!cuidRegex.test(userId) && !uuidRegex.test(userId)) {
    throw new Error("Invalid user ID format");
  }

  // PostgreSQL 세션에 현재 사용자 ID 설정
  await prisma.$executeRawUnsafe(`SET app.current_user_id = '${userId}'`);
  return prisma;
}

/**
 * RLS 설정을 초기화합니다.
 */
export async function resetRLS() {
  await prisma.$executeRawUnsafe(`RESET app.current_user_id`);
}

/**
 * 트랜잭션과 함께 RLS를 사용합니다.
 * @param userId - 현재 사용자의 ID
 * @param callback - 실행할 트랜잭션 콜백
 * @returns 트랜잭션 결과
 */
export async function withRLSTransaction<T>(
  userId: string,
  callback: (tx: any) => Promise<T>,
): Promise<T> {
  // SQL 인젝션을 방지하기 위해 userId 검증
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid user ID");
  }

  // CUID 또는 UUID 형식 검증 (추가 보안)
  // CUID: 25자리 문자열 (예: c1234567890123456789012345)
  // UUID: 36자리 문자열 (예: 12345678-1234-1234-1234-123456789012)
  const cuidRegex = /^c[0-9a-z]{24}$/i;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!cuidRegex.test(userId) && !uuidRegex.test(userId)) {
    throw new Error("Invalid user ID format");
  }

  return await prisma.$transaction(async (tx) => {
    // 트랜잭션 내에서 사용자 ID 설정
    await tx.$executeRawUnsafe(`SET app.current_user_id = '${userId}'`);
    return await callback(tx);
  });
}

/**
 * 서버 액션에서 RLS를 사용하기 위한 헬퍼 함수
 * @param userId - 현재 사용자의 ID
 * @returns RLS가 설정된 Prisma 클라이언트
 */
export async function getPrismaWithRLS(userId: string) {
  return await withRLS(userId);
}

/**
 * RLS 정책이 올바르게 작동하는지 테스트하는 함수
 * @param userId - 테스트할 사용자 ID
 */
export async function testRLS(userId: string) {
  try {
    const db = await withRLS(userId);

    // 사용자의 QR 코드만 조회되는지 확인
    const qrCodes = await db.qrCode.findMany();
    console.log(`User ${userId} can access ${qrCodes.length} QR codes`);

    // 사용자의 템플릿만 조회되는지 확인
    const templates = await db.qrTemplate.findMany();
    console.log(`User ${userId} can access ${templates.length} templates`);

    return {
      qrCodesCount: qrCodes.length,
      templatesCount: templates.length,
    };
  } catch (error) {
    console.error("RLS test failed:", error);
    throw error;
  }
}

/**
 * RLS 없이 관리자 권한으로 데이터에 접근하는 함수
 * 주의: 이 함수는 관리자 전용이며 신중하게 사용해야 합니다.
 */
export async function withoutRLS() {
  // RLS 정책을 우회하기 위해 설정 제거
  await prisma.$executeRawUnsafe(`RESET app.current_user_id`);
  return prisma;
}
