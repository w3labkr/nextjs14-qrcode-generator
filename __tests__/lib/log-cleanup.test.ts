/**
 * @jest-environment node
 */

import { LogCleanupManager } from "@/lib/log-cleanup";
import { prisma } from "@/lib/prisma";
import { getLogRetentionDays } from "@/lib/env-validation";
import { UnifiedLogger } from "@/lib/unified-logging";

// 모킹
jest.mock("@/lib/prisma", () => ({
  prisma: {
    applicationLog: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/env-validation");

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGetLogRetentionDays = getLogRetentionDays as jest.MockedFunction<
  typeof getLogRetentionDays
>;

describe("LogCleanupManager", () => {
  let logSystemSpy: jest.SpyInstance;
  let logErrorSpy: jest.SpyInstance;
  let logAdminActionSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetLogRetentionDays.mockReturnValue(30);

    // UnifiedLogger 메서드들을 spy로 모킹
    logSystemSpy = jest
      .spyOn(UnifiedLogger, "logSystem")
      .mockResolvedValue(undefined);
    logErrorSpy = jest
      .spyOn(UnifiedLogger, "logError")
      .mockResolvedValue(undefined);
    logAdminActionSpy = jest
      .spyOn(UnifiedLogger, "logAdminAction")
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("cleanupOldLogs", () => {
    it("보존 기간이 지난 로그를 삭제해야 함", async () => {
      const retentionDays = 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // 삭제 대상 로그 100개
      mockPrisma.applicationLog.count.mockResolvedValue(100);

      // 첫 번째 배치 (100개)
      mockPrisma.applicationLog.findMany.mockResolvedValueOnce(
        Array.from({ length: 100 }, (_, i) => ({ id: `log-${i}` })),
      );

      // 두 번째 배치 (빈 배열 - 더 이상 삭제할 로그 없음)
      mockPrisma.applicationLog.findMany.mockResolvedValueOnce([]);

      mockPrisma.applicationLog.deleteMany.mockResolvedValue({ count: 100 });

      const result = await LogCleanupManager.cleanupOldLogs();

      expect(result).toEqual({
        deletedCount: 100,
        retentionDays: 30,
        cutoffDate: expect.any(Date),
      });

      expect(mockPrisma.applicationLog.count).toHaveBeenCalledWith({
        where: {
          createdAt: {
            lt: expect.any(Date),
          },
        },
      });

      expect(mockPrisma.applicationLog.deleteMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: expect.any(Array),
          },
        },
      });

      expect(logSystemSpy).toHaveBeenCalledWith({
        action: "LOG_CLEANUP_COMPLETED",
        message: "자동 로그 정리 완료: 100개 로그 삭제",
        metadata: {
          deletedCount: 100,
          retentionDays: 30,
          cutoffDate: expect.any(String),
          targetCount: 100,
        },
      });
    });

    it("삭제할 로그가 없을 때 올바르게 처리해야 함", async () => {
      mockPrisma.applicationLog.count.mockResolvedValue(0);

      const result = await LogCleanupManager.cleanupOldLogs();

      expect(result).toEqual({
        deletedCount: 0,
        retentionDays: 30,
        cutoffDate: expect.any(Date),
      });

      expect(mockPrisma.applicationLog.deleteMany).not.toHaveBeenCalled();
      expect(logSystemSpy).not.toHaveBeenCalled();
    });

    it("대량 데이터를 배치로 처리해야 함", async () => {
      mockPrisma.applicationLog.count.mockResolvedValue(2500);

      // 첫 번째 배치 (1000개)
      mockPrisma.applicationLog.findMany
        .mockResolvedValueOnce(
          Array.from({ length: 1000 }, (_, i) => ({ id: `log-${i}` })),
        )
        // 두 번째 배치 (1000개)
        .mockResolvedValueOnce(
          Array.from({ length: 1000 }, (_, i) => ({ id: `log-${i + 1000}` })),
        )
        // 세 번째 배치 (500개)
        .mockResolvedValueOnce(
          Array.from({ length: 500 }, (_, i) => ({ id: `log-${i + 2000}` })),
        )
        // 네 번째 배치 (빈 배열)
        .mockResolvedValueOnce([]);

      mockPrisma.applicationLog.deleteMany
        .mockResolvedValueOnce({ count: 1000 })
        .mockResolvedValueOnce({ count: 1000 })
        .mockResolvedValueOnce({ count: 500 });

      const result = await LogCleanupManager.cleanupOldLogs();

      expect(result.deletedCount).toBe(2500);
      expect(mockPrisma.applicationLog.deleteMany).toHaveBeenCalledTimes(3);
    });

    it("오류 발생 시 로깅하고 예외를 재발생시켜야 함", async () => {
      const error = new Error("Database connection failed");
      mockPrisma.applicationLog.count.mockRejectedValue(error);

      await expect(LogCleanupManager.cleanupOldLogs()).rejects.toThrow(error);

      expect(logErrorSpy).toHaveBeenCalledWith({
        error,
        errorCode: "LOG_CLEANUP_ERROR",
        additionalInfo: {
          retentionDays: 30,
        },
      });
    });
  });

  describe("getLogTableStats", () => {
    it("로그 테이블 통계를 반환해야 함", async () => {
      const oldestDate = new Date("2024-01-01");
      const newestDate = new Date("2024-12-31");

      mockPrisma.applicationLog.count.mockResolvedValue(5000);
      mockPrisma.applicationLog.findFirst
        .mockResolvedValueOnce({ createdAt: oldestDate })
        .mockResolvedValueOnce({ createdAt: newestDate });

      const result = await LogCleanupManager.getLogTableStats();

      expect(result).toEqual({
        totalLogs: 5000,
        oldestLog: oldestDate,
        newestLog: newestDate,
        retentionDays: 30,
        estimatedSize: "4.88 MB",
      });

      expect(mockPrisma.applicationLog.count).toHaveBeenCalled();
      expect(mockPrisma.applicationLog.findFirst).toHaveBeenCalledTimes(2);
    });

    it("로그가 없을 때 null 값을 반환해야 함", async () => {
      mockPrisma.applicationLog.count.mockResolvedValue(0);
      mockPrisma.applicationLog.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await LogCleanupManager.getLogTableStats();

      expect(result).toEqual({
        totalLogs: 0,
        oldestLog: null,
        newestLog: null,
        retentionDays: 30,
        estimatedSize: "0 KB",
      });
    });

    it("대용량 데이터에 대한 크기를 올바르게 계산해야 함", async () => {
      // 2GB 상당
      mockPrisma.applicationLog.count.mockResolvedValue(2048 * 1024);
      mockPrisma.applicationLog.findFirst
        .mockResolvedValueOnce({ createdAt: new Date() })
        .mockResolvedValueOnce({ createdAt: new Date() });

      const result = await LogCleanupManager.getLogTableStats();

      expect(result.estimatedSize).toBe("2.00 GB");
    });
  });

  describe("manualCleanup", () => {
    const adminId = "admin-123";

    it("기본 수동 정리를 수행해야 함", async () => {
      mockPrisma.applicationLog.count.mockResolvedValue(50);
      mockPrisma.applicationLog.deleteMany.mockResolvedValue({ count: 50 });

      const result = await LogCleanupManager.manualCleanup(adminId);

      expect(result).toEqual({
        deletedCount: 50,
        dryRun: false,
        criteria: {
          beforeDate: undefined,
          logTypes: undefined,
          logLevels: undefined,
        },
      });

      expect(mockPrisma.applicationLog.deleteMany).toHaveBeenCalledWith({
        where: {},
      });

      expect(logAdminActionSpy).toHaveBeenCalledWith({
        adminId,
        action: "MANUAL_LOG_CLEANUP",
        details: "수동 로그 정리: 50개 삭제",
        affectedRecords: 50,
      });
    });

    it("특정 조건으로 수동 정리를 수행해야 함", async () => {
      const beforeDate = new Date("2024-01-01");
      const logTypes = ["ERROR", "WARN"];
      const logLevels = ["ERROR"];

      const options = {
        beforeDate,
        logTypes,
        logLevels,
      };

      mockPrisma.applicationLog.count.mockResolvedValue(25);
      mockPrisma.applicationLog.deleteMany.mockResolvedValue({ count: 25 });

      const result = await LogCleanupManager.manualCleanup(adminId, options);

      expect(result).toEqual({
        deletedCount: 25,
        dryRun: false,
        criteria: {
          beforeDate: beforeDate.toISOString(),
          logTypes,
          logLevels,
        },
      });

      expect(mockPrisma.applicationLog.count).toHaveBeenCalledWith({
        where: {
          createdAt: { lt: beforeDate },
          type: { in: logTypes },
          level: { in: logLevels },
        },
      });
    });

    it("드라이런 모드에서 실제 삭제 없이 카운트만 반환해야 함", async () => {
      const options = { dryRun: true };

      mockPrisma.applicationLog.count.mockResolvedValue(100);

      const result = await LogCleanupManager.manualCleanup(adminId, options);

      expect(result).toEqual({
        deletedCount: 100,
        dryRun: true,
        criteria: {
          beforeDate: undefined,
          logTypes: undefined,
          logLevels: undefined,
        },
      });

      expect(mockPrisma.applicationLog.deleteMany).not.toHaveBeenCalled();
      expect(logAdminActionSpy).not.toHaveBeenCalled();
    });

    it("삭제할 로그가 없을 때 올바르게 처리해야 함", async () => {
      mockPrisma.applicationLog.count.mockResolvedValue(0);

      const result = await LogCleanupManager.manualCleanup(adminId);

      expect(result.deletedCount).toBe(0);
      expect(mockPrisma.applicationLog.deleteMany).not.toHaveBeenCalled();
      expect(logAdminActionSpy).not.toHaveBeenCalled();
    });

    it("오류 발생 시 로깅하고 예외를 재발생시켜야 함", async () => {
      const error = new Error("Permission denied");
      const options = { beforeDate: new Date() };

      mockPrisma.applicationLog.count.mockRejectedValue(error);

      await expect(
        LogCleanupManager.manualCleanup(adminId, options),
      ).rejects.toThrow(error);

      expect(logErrorSpy).toHaveBeenCalledWith({
        userId: adminId,
        error,
        errorCode: "MANUAL_LOG_CLEANUP_ERROR",
        additionalInfo: { options },
      });
    });
  });

  describe("배치 처리 및 성능", () => {
    it("배치 간 지연 시간을 제대로 적용해야 함", async () => {
      const mockSetTimeout = jest
        .spyOn(global, "setTimeout")
        .mockImplementation(((callback: () => void) => {
          callback();
          return {} as NodeJS.Timeout;
        }) as any);

      mockPrisma.applicationLog.count.mockResolvedValue(1000);
      mockPrisma.applicationLog.findMany
        .mockResolvedValueOnce(
          Array.from({ length: 1000 }, (_, i) => ({ id: `log-${i}` })),
        )
        .mockResolvedValueOnce([]);

      mockPrisma.applicationLog.deleteMany.mockResolvedValue({ count: 1000 });

      await LogCleanupManager.cleanupOldLogs();

      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 100);
      mockSetTimeout.mockRestore();
    });
  });
});
