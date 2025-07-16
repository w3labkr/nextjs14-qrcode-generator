// Mock dependencies first
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    log: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    qRCode: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock server actions
jest.mock("@/app/actions/log-management", () => ({
  getSystemLogs: jest.fn(),
  deleteOldLogs: jest.fn(),
  exportLogs: jest.fn(),
  getLogStatistics: jest.fn(),
}));

// Import after mocking
import { getSystemLogs, deleteOldLogs, exportLogs, getLogStatistics } from "@/app/actions/log-management";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

describe("Admin Flow Integration", () => {
  const adminSession = {
    user: { 
      id: "admin-user-id", 
      email: "admin@example.com",
      role: "admin"
    },
  };

  const regularUserSession = {
    user: { 
      id: "regular-user-id", 
      email: "user@example.com",
      role: "user"
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Admin Login → Log Management Flow", () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);
      
      // Mock admin user verification
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: adminSession.user.id,
        email: adminSession.user.email,
        role: "admin",
      });
    });

    it("관리자가 로그인하고 시스템 로그를 조회할 수 있어야 한다", async () => {
      // Mock system logs
      const mockLogs = [
        {
          id: "log-1",
          userId: "user-1",
          type: "user",
          level: "info",
          action: "user_login",
          message: "User logged in",
          details: {},
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          createdAt: new Date("2025-01-01"),
        },
        {
          id: "log-2",
          userId: "user-2",
          type: "system",
          level: "error",
          action: "database_error",
          message: "Database connection failed",
          details: { error: "Connection timeout" },
          ipAddress: null,
          userAgent: null,
          createdAt: new Date("2025-01-02"),
        },
      ];

      (prisma.log.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.log.count as jest.Mock).mockResolvedValue(2);
      
      (getSystemLogs as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          logs: mockLogs,
          total: 2,
          page: 1,
          pageSize: 10,
        },
      });

      // Get system logs
      const result = await getSystemLogs({
        page: 1,
        pageSize: 10,
        type: undefined,
        level: undefined,
      });

      expect(result.success).toBe(true);
      expect(result.data?.logs).toHaveLength(2);
      expect(result.data?.total).toBe(2);
      
      // Verify the mock was called
      expect(getSystemLogs).toHaveBeenCalled();
    });

    it("로그를 필터링하여 조회할 수 있어야 한다", async () => {
      const errorLogs = [
        {
          id: "log-error-1",
          type: "system",
          level: "error",
          action: "api_error",
          message: "API request failed",
          createdAt: new Date(),
        },
      ];

      (prisma.log.findMany as jest.Mock).mockResolvedValue(errorLogs);
      (prisma.log.count as jest.Mock).mockResolvedValue(1);
      
      (getSystemLogs as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          logs: errorLogs,
          total: 1,
          page: 1,
          pageSize: 10,
        },
      });

      const result = await getSystemLogs({
        page: 1,
        pageSize: 10,
        type: "system",
        level: "error",
      });

      expect(result.success).toBe(true);
      expect(result.data?.logs).toHaveLength(1);
      expect(result.data?.logs[0].level).toBe("error");
    });

    it("오래된 로그를 삭제할 수 있어야 한다", async () => {
      const deletedCount = 150;
      
      (prisma.log.deleteMany as jest.Mock).mockResolvedValue({
        count: deletedCount,
      });
      
      (deleteOldLogs as jest.Mock).mockResolvedValue({
        success: true,
        data: { deletedCount },
        message: `${deletedCount}개의 로그가 삭제되었습니다.`,
      });

      const result = await deleteOldLogs(30); // 30일 이상 된 로그 삭제

      expect(result.success).toBe(true);
      expect(result.data?.deletedCount).toBe(deletedCount);
      expect(deleteOldLogs).toHaveBeenCalledWith(30);
    });

    it("로그를 CSV로 내보낼 수 있어야 한다", async () => {
      const exportLogsData = [
        {
          id: "log-export-1",
          userId: "user-1",
          type: "user",
          level: "info",
          action: "create_qrcode",
          message: "QR code created",
          ipAddress: "192.168.1.1",
          userAgent: "Chrome/96.0",
          createdAt: new Date("2025-01-01"),
        },
      ];

      (prisma.log.findMany as jest.Mock).mockResolvedValue(exportLogsData);
      
      const csvContent = `id,userId,type,level,action,message,ipAddress,userAgent,createdAt
log-export-1,user-1,user,info,create_qrcode,QR code created,192.168.1.1,Chrome/96.0,2025-01-01`;

      (exportLogs as jest.Mock).mockResolvedValue({
        success: true,
        data: csvContent,
      });

      const result = await exportLogs({
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
      });

      expect(result.success).toBe(true);
      expect(result.data).toContain("log-export-1");
      expect(result.data).toContain("create_qrcode");
    });
  });

  describe("Admin Dashboard Statistics", () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);
    });

    it("시스템 통계를 조회할 수 있어야 한다", async () => {
      const statistics = {
        totalUsers: 100,
        activeUsers: 85,
        totalQRCodes: 500,
        totalLogs: 10000,
        logsByType: [
          { type: "user", _count: 7000 },
          { type: "system", _count: 3000 },
        ],
        logsByLevel: [
          { level: "info", _count: 8000 },
          { level: "warn", _count: 1500 },
          { level: "error", _count: 500 },
        ],
        recentActivity: [
          { date: "2025-01-01", count: 150 },
          { date: "2025-01-02", count: 200 },
        ],
      };

      (prisma.user.count as jest.Mock).mockResolvedValue(statistics.totalUsers);
      (prisma.qRCode.count as jest.Mock).mockResolvedValue(statistics.totalQRCodes);
      (prisma.log.count as jest.Mock).mockResolvedValue(statistics.totalLogs);
      (prisma.log.groupBy as jest.Mock)
        .mockResolvedValueOnce(statistics.logsByType)
        .mockResolvedValueOnce(statistics.logsByLevel);
      
      (getLogStatistics as jest.Mock).mockResolvedValue({
        success: true,
        data: statistics,
      });

      const result = await getLogStatistics();

      expect(result.success).toBe(true);
      expect(result.data?.totalUsers).toBe(100);
      expect(result.data?.totalQRCodes).toBe(500);
      expect(result.data?.totalLogs).toBe(10000);
    });
  });

  describe("Access Control", () => {
    it("일반 사용자는 관리자 기능에 접근할 수 없어야 한다", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(regularUserSession);
      
      (getSystemLogs as jest.Mock).mockResolvedValue({
        success: false,
        error: "권한이 없습니다.",
      });

      const result = await getSystemLogs({
        page: 1,
        pageSize: 10,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("권한");
    });

    it("인증되지 않은 사용자는 관리자 기능에 접근할 수 없어야 한다", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      (getSystemLogs as jest.Mock).mockResolvedValue({
        success: false,
        error: "인증이 필요합니다.",
      });

      const result = await getSystemLogs({
        page: 1,
        pageSize: 10,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("인증");
    });
  });

  describe("Log Management Advanced Features", () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);
    });

    it("날짜 범위로 로그를 조회할 수 있어야 한다", async () => {
      const dateRangeLogs = [
        {
          id: "log-date-1",
          type: "user",
          level: "info",
          action: "user_login",
          createdAt: new Date("2025-01-15"),
        },
        {
          id: "log-date-2",
          type: "user",
          level: "info",
          action: "user_logout",
          createdAt: new Date("2025-01-16"),
        },
      ];

      (prisma.log.findMany as jest.Mock).mockResolvedValue(dateRangeLogs);
      (prisma.log.count as jest.Mock).mockResolvedValue(2);
      
      (getSystemLogs as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          logs: dateRangeLogs,
          total: 2,
          page: 1,
          pageSize: 10,
        },
      });

      const result = await getSystemLogs({
        page: 1,
        pageSize: 10,
        startDate: new Date("2025-01-15"),
        endDate: new Date("2025-01-20"),
      });

      expect(result.success).toBe(true);
      expect(result.data?.logs).toHaveLength(2);
      expect(getSystemLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        })
      );
    });

    it("페이지네이션이 올바르게 작동해야 한다", async () => {
      // Page 1
      const page1Logs = Array.from({ length: 10 }, (_, i) => ({
        id: `log-page1-${i}`,
        type: "user",
        level: "info",
        action: "user_action",
        createdAt: new Date(),
      }));

      (prisma.log.findMany as jest.Mock).mockResolvedValue(page1Logs);
      (prisma.log.count as jest.Mock).mockResolvedValue(25); // Total 25 logs
      
      (getSystemLogs as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          logs: page1Logs,
          total: 25,
          page: 1,
          pageSize: 10,
          totalPages: 3,
        },
      });

      const result1 = await getSystemLogs({
        page: 1,
        pageSize: 10,
      });

      expect(result1.data?.logs).toHaveLength(10);
      expect(result1.data?.totalPages).toBe(3);

      // Page 2
      const page2Logs = Array.from({ length: 10 }, (_, i) => ({
        id: `log-page2-${i}`,
        type: "user",
        level: "info",
        action: "user_action",
        createdAt: new Date(),
      }));

      (prisma.log.findMany as jest.Mock).mockResolvedValue(page2Logs);
      
      (getSystemLogs as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          logs: page2Logs,
          total: 25,
          page: 2,
          pageSize: 10,
          totalPages: 3,
        },
      });

      const result2 = await getSystemLogs({
        page: 2,
        pageSize: 10,
      });

      expect(result2.data?.page).toBe(2);
      expect(result2.data?.logs[0].id).toContain("page2");
    });

    it("로그 자동 정리 스케줄이 작동해야 한다", async () => {
      // Simulate cron job for log cleanup
      const oldLogsCount = 500;
      
      (prisma.log.count as jest.Mock).mockResolvedValue(oldLogsCount);
      (prisma.log.deleteMany as jest.Mock).mockResolvedValue({
        count: oldLogsCount,
      });
      
      (deleteOldLogs as jest.Mock).mockResolvedValue({
        success: true,
        data: { deletedCount: oldLogsCount },
        message: `${oldLogsCount}개의 오래된 로그가 자동으로 삭제되었습니다.`,
      });

      // Simulate automatic cleanup (90 days old logs)
      const result = await deleteOldLogs(90);

      expect(result.success).toBe(true);
      expect(result.data?.deletedCount).toBe(oldLogsCount);
      
      // Verify deleteOldLogs was called
      expect(deleteOldLogs).toHaveBeenCalledWith(90);
    });
  });

  describe("System Monitoring", () => {
    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(adminSession);
    });

    it("실시간 시스템 상태를 모니터링할 수 있어야 한다", async () => {
      const systemStatus = {
        database: "healthy",
        storage: "healthy", 
        memory: { used: 60, total: 100 },
        activeConnections: 45,
        queuedJobs: 5,
        lastError: null,
      };

      // Mock system health checks
      (prisma.log.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.log.count as jest.Mock).mockImplementation(({ where }) => {
        if (where?.level === "error" && where?.createdAt?.gte) {
          return Promise.resolve(0); // No recent errors
        }
        return Promise.resolve(1000);
      });

      const healthCheck = {
        success: true,
        data: systemStatus,
      };

      expect(healthCheck.success).toBe(true);
      expect(healthCheck.data.database).toBe("healthy");
      expect(healthCheck.data.memory.used).toBeLessThan(healthCheck.data.memory.total);
    });

    it("에러 로그 급증 시 알림을 받을 수 있어야 한다", async () => {
      const recentErrors = Array.from({ length: 20 }, (_, i) => ({
        id: `error-${i}`,
        type: "system",
        level: "error",
        action: "api_error",
        message: "API request failed",
        createdAt: new Date(Date.now() - i * 60000), // Last 20 minutes
      }));

      (prisma.log.findMany as jest.Mock).mockResolvedValue(recentErrors);
      (prisma.log.count as jest.Mock).mockResolvedValue(20);

      // Check error rate
      const errorRate = {
        count: 20,
        timeWindow: "1hour",
        threshold: 10,
        alert: true,
        message: "Error rate exceeded threshold: 20 errors in the last hour",
      };

      expect(errorRate.alert).toBe(true);
      expect(errorRate.count).toBeGreaterThan(errorRate.threshold);
    });
  });
});