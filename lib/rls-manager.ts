import { prisma } from "@/lib/prisma";

/**
 * RLS (Row Level Security) 설정을 위한 유틸리티 클래스
 */
export class RLSManager {
  /**
   * 현재 사용자 ID를 설정합니다
   */
  static async setCurrentUser(userId: string) {
    await prisma.$executeRaw`SET app.current_user_id = ${userId}`;
  }

  /**
   * 관리자 권한을 설정합니다
   */
  static async setAdminMode(isAdmin: boolean = true) {
    await prisma.$executeRaw`SET app.is_admin = ${isAdmin}`;
  }

  /**
   * 사용자와 관리자 권한을 동시에 설정합니다
   */
  static async setUserContext(userId: string, isAdmin: boolean = false) {
    await Promise.all([
      prisma.$executeRaw`SET app.current_user_id = ${userId}`,
      prisma.$executeRaw`SET app.is_admin = ${isAdmin}`,
    ]);
  }

  /**
   * RLS 설정을 초기화합니다
   */
  static async clearContext() {
    await Promise.all([
      prisma.$executeRaw`SET app.current_user_id = ''`,
      prisma.$executeRaw`SET app.is_admin = false`,
    ]);
  }

  /**
   * 현재 RLS 컨텍스트를 조회합니다
   */
  static async getCurrentContext() {
    const [userIdResult, isAdminResult] = await Promise.all([
      prisma.$queryRaw<Array<{ current_setting: string }>>`
        SELECT current_setting('app.current_user_id', true) as current_setting
      `,
      prisma.$queryRaw<Array<{ current_setting: string }>>`
        SELECT current_setting('app.is_admin', true) as current_setting
      `,
    ]);

    return {
      userId: userIdResult[0]?.current_setting || null,
      isAdmin: isAdminResult[0]?.current_setting === "true",
    };
  }

  /**
   * 특정 사용자 컨텍스트에서 작업을 실행합니다
   */
  static async withUserContext<T>(
    userId: string,
    isAdmin: boolean = false,
    operation: () => Promise<T>,
  ): Promise<T> {
    // 이전 컨텍스트 저장
    const previousContext = await this.getCurrentContext();

    try {
      // 새 컨텍스트 설정
      await this.setUserContext(userId, isAdmin);

      // 작업 실행
      return await operation();
    } finally {
      // 이전 컨텍스트 복원
      if (previousContext.userId) {
        await this.setUserContext(
          previousContext.userId,
          previousContext.isAdmin,
        );
      } else {
        await this.clearContext();
      }
    }
  }

  /**
   * 관리자 컨텍스트에서 작업을 실행합니다
   */
  static async withAdminContext<T>(operation: () => Promise<T>): Promise<T> {
    const previousContext = await this.getCurrentContext();

    try {
      await this.setAdminMode(true);
      return await operation();
    } finally {
      await this.setAdminMode(previousContext.isAdmin);
    }
  }

  /**
   * RLS가 올바르게 작동하는지 테스트합니다
   */
  static async testRLS() {
    const testResults = {
      userAccess: false,
      adminAccess: false,
      isolation: false,
    };

    try {
      // 테스트용 사용자 생성
      const testUser = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@example.com`,
          name: "Test User",
        },
      });

      // 일반 사용자 컨텍스트 테스트
      await this.setUserContext(testUser.id, false);
      const userQrCodes = await prisma.qrCode.findMany();
      testResults.userAccess = Array.isArray(userQrCodes);

      // 관리자 컨텍스트 테스트
      await this.setUserContext(testUser.id, true);
      const adminLogs = await prisma.applicationLog.findMany({
        where: { type: "ADMIN" },
      });
      testResults.adminAccess = Array.isArray(adminLogs);

      // 격리 테스트 - 다른 사용자의 데이터에 접근할 수 없어야 함
      const otherUser = await prisma.user.create({
        data: {
          email: `test-other-${Date.now()}@example.com`,
          name: "Other User",
        },
      });

      await this.setUserContext(testUser.id, false);
      const isolatedQrCodes = await prisma.qrCode.findMany({
        where: { userId: otherUser.id },
      });
      testResults.isolation = isolatedQrCodes.length === 0;

      // 테스트 데이터 정리
      await this.withAdminContext(async () => {
        await prisma.user.deleteMany({
          where: {
            email: {
              in: [testUser.email!, otherUser.email!],
            },
          },
        });
      });

      return testResults;
    } catch (error) {
      console.error("RLS 테스트 실패:", error);
      return {
        userAccess: false,
        adminAccess: false,
        isolation: false,
        error: (error as Error).message,
      };
    } finally {
      await this.clearContext();
    }
  }
}

/**
 * 편의 함수들
 */
export const setCurrentUser = RLSManager.setCurrentUser;
export const setAdminMode = RLSManager.setAdminMode;
export const setUserContext = RLSManager.setUserContext;
export const clearRLSContext = RLSManager.clearContext;
export const withUserContext = RLSManager.withUserContext;
export const withAdminContext = RLSManager.withAdminContext;
