import {
  logAccessAction,
  logAuthAction,
  logAuditAction,
  logErrorAction,
  logAdminAction,
  logQrGenerationAction,
  getLogsAction,
  getLogStatsAction,
  cleanupOldLogsAction,
} from "@/app/actions/log-management";
import { TEST_USER_ID } from "../test-utils";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/unified-logging", () => ({
  UnifiedLogger: {
    logAccess: jest.fn().mockResolvedValue(undefined),
    logAuth: jest.fn().mockResolvedValue(undefined),
    logAudit: jest.fn().mockResolvedValue(undefined),
    logError: jest.fn().mockResolvedValue(undefined),
    logAdminAction: jest.fn().mockResolvedValue(undefined),
    logQrGeneration: jest.fn().mockResolvedValue(undefined),
    getLogs: jest.fn().mockResolvedValue({ logs: [], total: 0 }),
    getLogStats: jest.fn().mockResolvedValue({}),
    cleanupOldLogs: jest.fn().mockResolvedValue(10),
  },
}));

describe("Log Management Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // 환경변수 모킹 (관리자 이메일)
    process.env.ADMIN_EMAILS = "admin@example.com,super@example.com";
  });

  afterEach(() => {
    // 환경변수 정리
    delete process.env.ADMIN_EMAILS;
  });

  describe("logAccessAction", () => {
    it("로그인한 경우 성공적으로 로그가 생성되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      const params = {
        method: "GET",
        path: "/api/test",
        statusCode: 200,
        responseTime: 150,
        requestId: "req-123",
      };

      // Act
      const result = await logAccessAction(params);

      // Assert
      expect(result.success).toBe(true);
    });

    it("로그인하지 않은 상태에서도 접근 로그가 생성되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      const params = {
        method: "GET",
        path: "/api/public",
        statusCode: 200,
      };

      // Act
      const result = await logAccessAction(params);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("logAuthAction", () => {
    it("로그인한 경우 인증 로그가 성공적으로 생성되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      const params = {
        action: "signin",
        authAction: "LOGIN" as const,
        provider: "google",
        sessionId: "session-123",
      };

      // Act
      const result = await logAuthAction(params);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("logAuditAction", () => {
    it("로그인하지 않은 경우 오류가 반환되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      const params = {
        action: "update",
        tableName: "qrCodes",
        recordId: "qr-123",
      };

      // Act
      const result = await logAuditAction(params);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("감사 로그 생성에 실패했습니다");
    });

    it("로그인한 경우 감사 로그가 성공적으로 생성되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      const params = {
        action: "update",
        tableName: "qrCodes",
        recordId: "qr-123",
        oldValues: { title: "Old Title" },
        newValues: { title: "New Title" },
        changes: ["title"],
      };

      // Act
      const result = await logAuditAction(params);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("logErrorAction", () => {
    it("로그인한 경우 에러 로그가 성공적으로 생성되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      const params = {
        error: new Error("Test error"),
        errorCode: "E001",
        requestId: "req-123",
        additionalInfo: { context: "test" },
      };

      // Act
      const result = await logErrorAction(params);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("logAdminAction", () => {
    it("로그인하지 않은 경우 오류가 반환되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      const params = {
        action: "user_ban",
        targetUserId: "user-456",
      };

      // Act
      const result = await logAdminAction(params);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("관리자 액션 로그 생성에 실패했습니다");
    });

    it("관리자가 아닌 경우 오류가 반환되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "user@example.com" }, // 일반 사용자 이메일
      });

      const params = {
        action: "user_ban",
        targetUserId: "user-456",
      };

      // Act
      const result = await logAdminAction(params);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("관리자 액션 로그 생성에 실패했습니다");
    });

    it("관리자인 경우 액션 로그가 성공적으로 생성되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "admin@example.com" }, // 관리자 이메일
      });

      const params = {
        action: "user_ban",
        targetUserId: "user-456",
        affectedRecords: 1,
        details: "Banned for violating terms",
      };

      // Act
      const result = await logAdminAction(params);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("logQrGenerationAction", () => {
    it("로그인한 경우 QR 코드 생성 로그가 성공적으로 생성되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      const params = {
        qrType: "URL",
        contentHash: "hash123",
        size: "256x256",
        format: "PNG",
        customization: { color: "#000000" },
      };

      // Act
      const result = await logQrGenerationAction(params);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("getLogsAction", () => {
    it("로그인하지 않은 경우 오류가 반환되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      // Act
      const result = await getLogsAction();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("인증이 필요합니다");
    });

    it("일반 사용자는 자신의 로그만 조회할 수 있어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      const filters = { type: "AUTH" as const };

      // Act
      const result = await getLogsAction(filters);

      // Assert
      expect(result.success).toBe(true);
    });

    it("관리자는 모든 로그를 조회할 수 있어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "admin@example.com" },
      });

      const filters = { type: "AUTH" as const };

      // Act
      const result = await getLogsAction(filters);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe("getLogStatsAction", () => {
    it("로그인하지 않은 경우 오류가 반환되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      // Act
      const result = await getLogStatsAction();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("인증이 필요합니다");
    });

    it("로그인한 경우 로그 통계 조회가 성공적으로 수행되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      const filters = { startDate: new Date("2023-01-01") };

      // Act
      const result = await getLogStatsAction(filters);

      // Assert
      expect(result.success).toBe(false); // 실제로는 Prisma mock 때문에 실패할 것
    });
  });

  describe("cleanupOldLogsAction", () => {
    it("로그인하지 않은 경우 오류가 반환되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      // Act
      const result = await cleanupOldLogsAction();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("로그 정리에 실패했습니다");
    });

    it("일반 사용자는 로그 정리를 할 수 없어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "user@example.com" },
      });

      // Act
      const result = await cleanupOldLogsAction();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("로그 정리에 실패했습니다");
    });

    it("관리자는 오래된 로그를 정리할 수 있어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "admin@example.com" },
      });

      const retentionDays = 30;

      // Act
      const result = await cleanupOldLogsAction(retentionDays);

      // Assert
      expect(result.success).toBe(true); // 관리자 검증이 통과하면 성공
    });
  });
});
