import { prisma } from "@/lib/prisma";
import { getLogRetentionDays } from "@/lib/env-validation";
import { UnifiedLogger } from "@/lib/unified-logging";

/**
 * 로그 정리 유틸리티
 */
export class LogCleanupManager {
  /**
   * 보존 기간이 지난 로그 삭제
   */
  static async cleanupOldLogs(): Promise<{
    deletedCount: number;
    retentionDays: number;
    cutoffDate: Date;
  }> {
    try {
      const retentionDays = getLogRetentionDays();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      console.log(
        `로그 정리 시작: ${retentionDays}일 이전 로그 삭제 (기준일: ${cutoffDate.toISOString()})`,
      );

      // 삭제 대상 로그 수 조회
      const targetCount = await prisma.applicationLog.count({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      if (targetCount === 0) {
        console.log("삭제할 로그가 없습니다.");
        return {
          deletedCount: 0,
          retentionDays,
          cutoffDate,
        };
      }

      console.log(`삭제 대상 로그: ${targetCount}개`);

      // 배치 단위로 삭제 (성능 최적화)
      const batchSize = 1000;
      let deletedCount = 0;

      while (true) {
        const batch = await prisma.applicationLog.findMany({
          where: {
            createdAt: {
              lt: cutoffDate,
            },
          },
          select: { id: true },
          take: batchSize,
        });

        if (batch.length === 0) {
          break;
        }

        const batchIds = batch.map((log: { id: string }) => log.id);

        const deleteResult = await prisma.applicationLog.deleteMany({
          where: {
            id: {
              in: batchIds,
            },
          },
        });

        deletedCount += deleteResult.count;
        console.log(
          `배치 삭제 완료: ${deleteResult.count}개 (누적: ${deletedCount}개)`,
        );

        // 배치 간 짧은 지연 (DB 부하 방지)
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(`로그 정리 완료: 총 ${deletedCount}개 로그 삭제`);

      // 시스템 로그 기록
      await UnifiedLogger.logSystem({
        action: "LOG_CLEANUP_COMPLETED",
        message: `자동 로그 정리 완료: ${deletedCount}개 로그 삭제`,
        metadata: {
          deletedCount,
          retentionDays,
          cutoffDate: cutoffDate.toISOString(),
          targetCount,
        },
      });

      return {
        deletedCount,
        retentionDays,
        cutoffDate,
      };
    } catch (error) {
      console.error("로그 정리 실패:", error);

      // 오류 로깅
      await UnifiedLogger.logError({
        error: error instanceof Error ? error : new Error("Unknown error"),
        errorCode: "LOG_CLEANUP_ERROR",
        additionalInfo: {
          retentionDays: getLogRetentionDays(),
        },
      });

      throw error;
    }
  }

  /**
   * 로그 테이블 크기 조회
   */
  static async getLogTableStats(): Promise<{
    totalLogs: number;
    oldestLog: Date | null;
    newestLog: Date | null;
    retentionDays: number;
    estimatedSize: string;
  }> {
    const retentionDays = getLogRetentionDays();

    const [totalLogs, oldestLogResult, newestLogResult] = await Promise.all([
      prisma.applicationLog.count(),
      prisma.applicationLog.findFirst({
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
      prisma.applicationLog.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    // 대략적인 크기 계산 (1개 로그 = 약 1KB로 가정)
    const estimatedSizeKB = totalLogs * 1;
    let estimatedSize: string;

    if (estimatedSizeKB > 1024 * 1024) {
      estimatedSize = `${(estimatedSizeKB / (1024 * 1024)).toFixed(2)} GB`;
    } else if (estimatedSizeKB > 1024) {
      estimatedSize = `${(estimatedSizeKB / 1024).toFixed(2)} MB`;
    } else {
      estimatedSize = `${estimatedSizeKB} KB`;
    }

    return {
      totalLogs,
      oldestLog: oldestLogResult?.createdAt || null,
      newestLog: newestLogResult?.createdAt || null,
      retentionDays,
      estimatedSize,
    };
  }

  /**
   * 수동 로그 정리 (관리자 전용)
   */
  static async manualCleanup(
    adminId: string,
    options: {
      beforeDate?: Date;
      logTypes?: string[];
      logLevels?: string[];
      dryRun?: boolean;
    } = {},
  ): Promise<{
    deletedCount: number;
    dryRun: boolean;
    criteria: any;
  }> {
    try {
      const where: any = {};

      if (options.beforeDate) {
        where.createdAt = { lt: options.beforeDate };
      }

      if (options.logTypes && options.logTypes.length > 0) {
        where.type = { in: options.logTypes };
      }

      if (options.logLevels && options.logLevels.length > 0) {
        where.level = { in: options.logLevels };
      }

      // 삭제 대상 로그 수 조회
      const targetCount = await prisma.applicationLog.count({ where });

      let deletedCount = 0;

      if (!options.dryRun && targetCount > 0) {
        // 실제 삭제 실행
        const deleteResult = await prisma.applicationLog.deleteMany({ where });
        deletedCount = deleteResult.count;

        // 관리자 액션 로깅
        await UnifiedLogger.logAdminAction({
          adminId,
          action: "MANUAL_LOG_CLEANUP",
          details: `수동 로그 정리: ${deletedCount}개 삭제`,
          affectedRecords: deletedCount,
        });
      } else {
        deletedCount = targetCount; // 드라이런의 경우 삭제 예정 개수 반환
      }

      return {
        deletedCount,
        dryRun: options.dryRun || false,
        criteria: {
          beforeDate: options.beforeDate?.toISOString(),
          logTypes: options.logTypes,
          logLevels: options.logLevels,
        },
      };
    } catch (error) {
      console.error("수동 로그 정리 실패:", error);

      await UnifiedLogger.logError({
        userId: adminId,
        error: error instanceof Error ? error : new Error("Unknown error"),
        errorCode: "MANUAL_LOG_CLEANUP_ERROR",
        additionalInfo: { options },
      });

      throw error;
    }
  }
}
