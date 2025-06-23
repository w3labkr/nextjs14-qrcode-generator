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
  // PostgreSQL 세션에 현재 사용자 ID 설정
  await prisma.$executeRaw`SET app.current_user_id = ${userId}`;
  return prisma;
}

/**
 * RLS 설정을 초기화합니다.
 */
export async function resetRLS() {
  await prisma.$executeRaw`RESET app.current_user_id`;
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
  return await prisma.$transaction(async (tx) => {
    // 트랜잭션 내에서 사용자 ID 설정
    await tx.$executeRaw`SET app.current_user_id = ${userId}`;
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
  await prisma.$executeRaw`RESET app.current_user_id`;
  return prisma;
}
