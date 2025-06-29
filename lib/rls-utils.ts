import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";

/**
 * RLS(Row Level Security)를 위한 유틸리티 함수들
 */

/**
 * 사용자 ID 형식 검증 함수
 * @param userId - 검증할 사용자 ID
 */
function validateUserId(userId: string): void {
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid user ID: must be a non-empty string");
  }

  // CUID 또는 UUID 형식 검증 (추가 보안)
  // CUID: 25자리 문자열 (예: c1234567890123456789012345)
  // UUID: 36자리 문자열 (예: 12345678-1234-1234-1234-123456789012)
  const cuidRegex = /^c[0-9a-z]{24}$/i;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!cuidRegex.test(userId) && !uuidRegex.test(userId)) {
    throw new Error("Invalid user ID format: must be CUID or UUID");
  }
}

/**
 * 현재 사용자 ID를 설정하여 RLS 정책을 활성화합니다.
 * @param userId - 현재 사용자의 ID
 * @returns Prisma 클라이언트 인스턴스
 */
export async function withRLS(userId: string) {
  validateUserId(userId);

  try {
    // PostgreSQL 세션에 현재 사용자 ID 설정
    await prisma.$executeRawUnsafe(`SET app.current_user_id = '${userId}'`);
    return prisma;
  } catch (error) {
    console.error("Failed to set RLS context:", error);
    throw new Error("Failed to initialize RLS context");
  }
}

/**
 * 현재 사용자 ID와 이메일을 모두 설정하여 RLS 정책을 활성화합니다.
 * @param userId - 현재 사용자의 ID
 * @param userEmail - 현재 사용자의 이메일 (verification_tokens 테이블용)
 * @returns Prisma 클라이언트 인스턴스
 */
export async function withRLSFull(userId: string, userEmail?: string) {
  validateUserId(userId);

  try {
    // PostgreSQL 세션에 현재 사용자 ID 설정
    await prisma.$executeRawUnsafe(`SET app.current_user_id = '${userId}'`);

    // 이메일이 제공된 경우 설정 (verification_tokens 테이블용)
    if (userEmail) {
      await prisma.$executeRawUnsafe(
        `SET app.current_user_email = '${userEmail}'`,
      );
    }

    return prisma;
  } catch (error) {
    console.error("Failed to set RLS context:", error);
    throw new Error("Failed to initialize RLS context");
  }
}

/**
 * RLS 설정을 초기화합니다.
 */
export async function resetRLS() {
  try {
    await prisma.$executeRawUnsafe(`RESET app.current_user_id`);
  } catch (error) {
    console.error("Failed to reset RLS context:", error);
    throw new Error("Failed to reset RLS context");
  }
}

/**
 * 트랜잭션과 함께 RLS를 사용합니다.
 * @param userId - 현재 사용자의 ID
 * @param callback - 실행할 트랜잭션 콜백
 * @returns 트랜잭션 결과
 */
export async function withRLSTransaction<T>(
  userId: string,
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  validateUserId(userId);

  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 트랜잭션 내에서 사용자 ID 설정
      await tx.$executeRawUnsafe(`SET app.current_user_id = '${userId}'`);
      return await callback(tx);
    });
  } catch (error) {
    console.error("RLS transaction failed:", error);
    throw error;
  }
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
  try {
    // RLS 정책을 우회하기 위해 설정 제거
    await prisma.$executeRawUnsafe(`RESET app.current_user_id`);
    return prisma;
  } catch (error) {
    console.error("Failed to reset RLS for admin access:", error);
    throw new Error("Failed to initialize admin access");
  }
}

/**
 * 인증된 사용자를 위한 RLS 래퍼 함수
 * NextAuth 세션에서 사용자 ID를 자동으로 추출하여 RLS를 적용합니다.
 * @param session - NextAuth 세션 객체
 * @returns RLS가 적용된 Prisma 클라이언트
 */
export async function withAuthenticatedRLS(session: any) {
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Valid session required");
  }

  return await withRLS(session.user.id);
}

/**
 * 인증된 사용자를 위한 RLS 트랜잭션 래퍼 함수
 * @param session - NextAuth 세션 객체
 * @param callback - 실행할 트랜잭션 콜백
 * @returns 트랜잭션 결과
 */
export async function withAuthenticatedRLSTransaction<T>(
  session: any,
  callback: (tx: any) => Promise<T>,
): Promise<T> {
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Valid session required");
  }

  return await withRLSTransaction(session.user.id, callback);
}

/**
 * RLS 컨텍스트 상태를 확인하는 함수
 * @returns 현재 설정된 사용자 ID
 */
export async function getCurrentRLSContext(): Promise<string | null> {
  try {
    const result = await prisma.$queryRaw<Array<{ current_setting: string }>>`
      SELECT current_setting('app.current_user_id', true) as current_setting
    `;
    return result[0]?.current_setting || null;
  } catch (error) {
    console.error("Failed to get RLS context:", error);
    return null;
  }
}

/**
 * RLS 정책 상태를 확인하는 함수
 * @returns RLS 정책 정보
 */
export async function checkRLSStatus() {
  try {
    const result = await prisma.$queryRaw<
      Array<{
        schemaname: string;
        tablename: string;
        rowsecurity: boolean;
        policy_count: number;
      }>
    >`
      SELECT
        schemaname,
        tablename,
        rowsecurity,
        (SELECT count(*) FROM pg_policies WHERE schemaname = n.nspname AND tablename = c.relname) as policy_count
      FROM pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE c.relname IN ('qr_codes', 'qr_templates', 'users', 'accounts', 'sessions')
      AND n.nspname = 'public'
      ORDER BY tablename
    `;

    return {
      success: true,
      tables: result,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to check RLS status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * RLS 성능 모니터링을 위한 쿼리 실행 시간 측정
 * @param userId - 사용자 ID
 * @param queryFn - 실행할 쿼리 함수
 * @returns 쿼리 결과와 실행 시간
 */
export async function measureRLSPerformance<T>(
  userId: string,
  queryFn: (db: PrismaClient) => Promise<T>,
): Promise<{ result: T; executionTime: number }> {
  const startTime = Date.now();

  try {
    const db = await withRLS(userId);
    const result = await queryFn(db);
    const executionTime = Date.now() - startTime;

    console.log(`RLS Query executed in ${executionTime}ms for user ${userId}`);

    return {
      result,
      executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(
      `RLS Query failed after ${executionTime}ms for user ${userId}:`,
      error,
    );
    throw error;
  }
}

/**
 * 현재 RLS 컨텍스트에서 사용자 ID를 가져옵니다.
 * @returns 현재 사용자 ID 또는 null
 */
export function getRlsUserId(): string | null {
  // 이 함수는 실제로는 세션에서 사용자 ID를 가져와야 합니다.
  // 현재는 임시로 null을 반환합니다.
  // 실제 구현에서는 NextAuth session이나 다른 방법으로 사용자 ID를 가져와야 합니다.
  return null;
}
