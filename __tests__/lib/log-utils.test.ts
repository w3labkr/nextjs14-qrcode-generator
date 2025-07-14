/**
 * @jest-environment node
 */

import {
  createAuthLog,
  createAccessLog,
  createErrorLog,
  createQRGenerationLog,
  createAuditLog,
  createAdminLog,
  createSystemLog,
} from "@/lib/log-utils";
import { UnifiedLogger } from "@/lib/unified-logging";
import type { AuthAction, LogLevel } from "@/types/logs";

// UnifiedLogger 모킹
jest.mock("@/lib/unified-logging");

const mockUnifiedLogger = UnifiedLogger as jest.Mocked<typeof UnifiedLogger>;

describe("log-utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createAuthLog", () => {
    it("기본적인 인증 로그를 생성해야 함", async () => {
      const mockLogAuth = jest.fn().mockResolvedValue({ id: "auth-log-1" });
      mockUnifiedLogger.logAuth = mockLogAuth;

      const result = await createAuthLog({
        userId: "user-123",
        action: "SIGNIN" as AuthAction,
        provider: "google",
        sessionId: "session-123",
      });

      expect(mockLogAuth).toHaveBeenCalledWith(
        {
          userId: "user-123",
          action: "Authentication signin",
          authAction: "SIGNIN",
          provider: "google",
          sessionId: "session-123",
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      );
      expect(result).toEqual({ id: "auth-log-1" });
    });

    it("커스텀 메시지와 level로 인증 로그를 생성해야 함", async () => {
      const mockLogAuth = jest.fn().mockResolvedValue({ id: "auth-log-2" });
      mockUnifiedLogger.logAuth = mockLogAuth;

      await createAuthLog({
        userId: "user-456",
        action: "SIGNOUT" as AuthAction,
        level: "WARN" as LogLevel,
        message: "Custom signout message",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      });

      expect(mockLogAuth).toHaveBeenCalledWith(
        {
          userId: "user-456",
          action: "Custom signout message",
          authAction: "SIGNOUT",
          provider: undefined,
          sessionId: undefined,
        },
        {
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
        },
      );
    });

    it("필수 매개변수만으로 인증 로그를 생성해야 함", async () => {
      const mockLogAuth = jest.fn().mockResolvedValue({ id: "auth-log-3" });
      mockUnifiedLogger.logAuth = mockLogAuth;

      await createAuthLog({
        action: "ERROR" as AuthAction,
      });

      expect(mockLogAuth).toHaveBeenCalledWith(
        {
          userId: undefined,
          action: "Authentication error",
          authAction: "ERROR",
          provider: undefined,
          sessionId: undefined,
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      );
    });
  });

  describe("createAccessLog", () => {
    it("기본적인 접근 로그를 생성해야 함", async () => {
      const mockLogAccess = jest.fn().mockResolvedValue({ id: "access-log-1" });
      mockUnifiedLogger.logAccess = mockLogAccess;

      const result = await createAccessLog({
        userId: "user-123",
        method: "GET",
        path: "/api/qrcodes",
        statusCode: 200,
        responseTime: 150,
        requestId: "req-123",
      });

      expect(mockLogAccess).toHaveBeenCalledWith(
        {
          userId: "user-123",
          method: "GET",
          path: "/api/qrcodes",
          statusCode: 200,
          responseTime: 150,
          requestId: "req-123",
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      );
      expect(result).toEqual({ id: "access-log-1" });
    });

    it("완전한 정보로 접근 로그를 생성해야 함", async () => {
      const mockLogAccess = jest.fn().mockResolvedValue({ id: "access-log-2" });
      mockUnifiedLogger.logAccess = mockLogAccess;

      await createAccessLog({
        userId: "user-456",
        method: "POST",
        path: "/api/qrcodes",
        statusCode: 201,
        responseTime: 300,
        ipAddress: "10.0.0.1",
        userAgent: "Chrome/100.0",
        requestId: "req-456",
      });

      expect(mockLogAccess).toHaveBeenCalledWith(
        {
          userId: "user-456",
          method: "POST",
          path: "/api/qrcodes",
          statusCode: 201,
          responseTime: 300,
          requestId: "req-456",
        },
        {
          ipAddress: "10.0.0.1",
          userAgent: "Chrome/100.0",
        },
      );
    });

    it("필수 매개변수만으로 접근 로그를 생성해야 함", async () => {
      const mockLogAccess = jest.fn().mockResolvedValue({ id: "access-log-3" });
      mockUnifiedLogger.logAccess = mockLogAccess;

      await createAccessLog({
        method: "DELETE",
        path: "/api/qrcodes/123",
        statusCode: 404,
      });

      expect(mockLogAccess).toHaveBeenCalledWith(
        {
          userId: undefined,
          method: "DELETE",
          path: "/api/qrcodes/123",
          statusCode: 404,
          responseTime: undefined,
          requestId: undefined,
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      );
    });
  });

  describe("createErrorLog", () => {
    it("Error 객체로 오류 로그를 생성해야 함", async () => {
      const mockLogError = jest.fn().mockResolvedValue({ id: "error-log-1" });
      mockUnifiedLogger.logError = mockLogError;

      const error = new Error("Database connection failed");
      const result = await createErrorLog({
        userId: "user-123",
        error,
        context: "database-connection",
      });

      expect(mockLogError).toHaveBeenCalledWith(
        {
          userId: "user-123",
          error,
          requestId: "database-connection",
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      );
      expect(result).toEqual({ id: "error-log-1" });
    });

    it("문자열 오류로 오류 로그를 생성해야 함", async () => {
      const mockLogError = jest.fn().mockResolvedValue({ id: "error-log-2" });
      mockUnifiedLogger.logError = mockLogError;

      await createErrorLog({
        userId: "user-456",
        error: "Validation failed",
        level: "WARN" as LogLevel,
        ipAddress: "172.16.0.1",
        userAgent: "Safari/14.0",
      });

      expect(mockLogError).toHaveBeenCalledWith(
        {
          userId: "user-456",
          error: "Validation failed",
          requestId: undefined,
        },
        {
          ipAddress: "172.16.0.1",
          userAgent: "Safari/14.0",
        },
      );
    });

    it("필수 매개변수만으로 오류 로그를 생성해야 함", async () => {
      const mockLogError = jest.fn().mockResolvedValue({ id: "error-log-3" });
      mockUnifiedLogger.logError = mockLogError;

      await createErrorLog({
        error: "Unknown error",
      });

      expect(mockLogError).toHaveBeenCalledWith(
        {
          userId: undefined,
          error: "Unknown error",
          requestId: undefined,
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      );
    });
  });

  describe("createQRGenerationLog", () => {
    it("성공적인 QR 코드 생성 로그를 생성해야 함", async () => {
      const mockLogQrGeneration = jest
        .fn()
        .mockResolvedValue({ id: "qr-log-1" });
      mockUnifiedLogger.logQrGeneration = mockLogQrGeneration;

      const result = await createQRGenerationLog({
        userId: "user-123",
        qrType: "URL",
        dataSize: 256,
        success: true,
      });

      expect(mockLogQrGeneration).toHaveBeenCalledWith(
        {
          userId: "user-123",
          qrType: "URL",
          size: "256",
          format: "PNG",
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      );
      expect(result).toEqual({ id: "qr-log-1" });
    });

    it("실패한 QR 코드 생성 로그를 생성해야 함", async () => {
      const mockLogQrGeneration = jest
        .fn()
        .mockResolvedValue({ id: "qr-log-2" });
      mockUnifiedLogger.logQrGeneration = mockLogQrGeneration;

      await createQRGenerationLog({
        userId: "user-456",
        qrType: "VCARD",
        success: false,
        ipAddress: "203.0.113.1",
        userAgent: "Edge/100.0",
      });

      expect(mockLogQrGeneration).toHaveBeenCalledWith(
        {
          userId: "user-456",
          qrType: "VCARD",
          size: undefined,
          format: "PNG",
        },
        {
          ipAddress: "203.0.113.1",
          userAgent: "Edge/100.0",
        },
      );
    });

    it("필수 매개변수만으로 QR 생성 로그를 생성해야 함", async () => {
      const mockLogQrGeneration = jest
        .fn()
        .mockResolvedValue({ id: "qr-log-3" });
      mockUnifiedLogger.logQrGeneration = mockLogQrGeneration;

      await createQRGenerationLog({
        qrType: "SMS",
        success: true,
      });

      expect(mockLogQrGeneration).toHaveBeenCalledWith(
        {
          userId: undefined,
          qrType: "SMS",
          size: undefined,
          format: "PNG",
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      );
    });
  });

  describe("createAuditLog", () => {
    it("생성 액션에 대한 감사 로그를 생성해야 함", async () => {
      const mockLogAudit = jest.fn().mockResolvedValue({ id: "audit-log-1" });
      mockUnifiedLogger.logAudit = mockLogAudit;

      const newValues = { title: "New QR Code", type: "URL" };
      const result = await createAuditLog({
        userId: "user-123",
        tableName: "qr_codes",
        recordId: "qr-456",
        action: "CREATE",
        newValues,
      });

      expect(mockLogAudit).toHaveBeenCalledWith(
        {
          userId: "user-123",
          action: "CREATE_QR_CODES",
          tableName: "qr_codes",
          recordId: "qr-456",
          oldValues: undefined,
          newValues,
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      );
      expect(result).toEqual({ id: "audit-log-1" });
    });

    it("업데이트 액션에 대한 감사 로그를 생성해야 함", async () => {
      const mockLogAudit = jest.fn().mockResolvedValue({ id: "audit-log-2" });
      mockUnifiedLogger.logAudit = mockLogAudit;

      const oldValues = { title: "Old Title" };
      const newValues = { title: "New Title" };

      await createAuditLog({
        userId: "user-456",
        tableName: "users",
        recordId: "user-789",
        action: "UPDATE",
        oldValues,
        newValues,
        ipAddress: "192.168.0.1",
        userAgent: "Firefox/98.0",
      });

      expect(mockLogAudit).toHaveBeenCalledWith(
        {
          userId: "user-456",
          action: "UPDATE_USERS",
          tableName: "users",
          recordId: "user-789",
          oldValues,
          newValues,
        },
        {
          ipAddress: "192.168.0.1",
          userAgent: "Firefox/98.0",
        },
      );
    });

    it("삭제 액션에 대한 감사 로그를 생성해야 함", async () => {
      const mockLogAudit = jest.fn().mockResolvedValue({ id: "audit-log-3" });
      mockUnifiedLogger.logAudit = mockLogAudit;

      const oldValues = { title: "Deleted QR Code", type: "TEXT" };

      await createAuditLog({
        tableName: "qr_codes",
        recordId: "qr-999",
        action: "DELETE",
        oldValues,
      });

      expect(mockLogAudit).toHaveBeenCalledWith(
        {
          userId: undefined,
          action: "DELETE_QR_CODES",
          tableName: "qr_codes",
          recordId: "qr-999",
          oldValues,
          newValues: undefined,
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      );
    });
  });

  describe("createAdminLog", () => {
    it("기본적인 관리자 로그를 생성해야 함", async () => {
      const mockLogAdminAction = jest
        .fn()
        .mockResolvedValue({ id: "admin-log-1" });
      mockUnifiedLogger.logAdminAction = mockLogAdminAction;

      const details = { operation: "user_ban", reason: "spam" };
      const result = await createAdminLog({
        userId: "admin-123",
        action: "USER_BAN",
        target: "user-456",
        details,
      });

      expect(mockLogAdminAction).toHaveBeenCalledWith(
        {
          adminId: "admin-123",
          action: "USER_BAN",
          targetUserId: "user-456",
          details: JSON.stringify(details),
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      );
      expect(result).toEqual({ id: "admin-log-1" });
    });

    it("완전한 정보로 관리자 로그를 생성해야 함", async () => {
      const mockLogAdminAction = jest
        .fn()
        .mockResolvedValue({ id: "admin-log-2" });
      mockUnifiedLogger.logAdminAction = mockLogAdminAction;

      const details = { bulk_operation: true, affected_count: 150 };

      await createAdminLog({
        userId: "admin-456",
        action: "BULK_DELETE_LOGS",
        level: "WARN" as LogLevel,
        details,
        ipAddress: "10.0.0.5",
        userAgent: "Admin-Panel/1.0",
      });

      expect(mockLogAdminAction).toHaveBeenCalledWith(
        {
          adminId: "admin-456",
          action: "BULK_DELETE_LOGS",
          targetUserId: undefined,
          details: JSON.stringify(details),
        },
        {
          ipAddress: "10.0.0.5",
          userAgent: "Admin-Panel/1.0",
        },
      );
    });

    it("시스템 사용자로 관리자 로그를 생성해야 함", async () => {
      const mockLogAdminAction = jest
        .fn()
        .mockResolvedValue({ id: "admin-log-3" });
      mockUnifiedLogger.logAdminAction = mockLogAdminAction;

      await createAdminLog({
        action: "SYSTEM_CLEANUP",
      });

      expect(mockLogAdminAction).toHaveBeenCalledWith(
        {
          adminId: "system",
          action: "SYSTEM_CLEANUP",
          targetUserId: undefined,
          details: "{}",
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      );
    });
  });

  describe("createSystemLog", () => {
    it("기본적인 시스템 로그를 생성해야 함", async () => {
      const mockLogSystem = jest.fn().mockResolvedValue({ id: "system-log-1" });
      mockUnifiedLogger.logSystem = mockLogSystem;

      const result = await createSystemLog({
        action: "DATABASE_BACKUP",
        message: "Daily backup completed successfully",
      });

      expect(mockLogSystem).toHaveBeenCalledWith({
        action: "DATABASE_BACKUP",
        message: "Daily backup completed successfully",
        metadata: undefined,
      });
      expect(result).toEqual({ id: "system-log-1" });
    });

    it("메타데이터와 함께 시스템 로그를 생성해야 함", async () => {
      const mockLogSystem = jest.fn().mockResolvedValue({ id: "system-log-2" });
      mockUnifiedLogger.logSystem = mockLogSystem;

      const metadata = {
        backup_size: "2.5GB",
        duration: "45min",
        tables_backed_up: 15,
      };

      await createSystemLog({
        action: "BACKUP_RESTORE",
        level: "INFO" as LogLevel,
        metadata,
      });

      expect(mockLogSystem).toHaveBeenCalledWith({
        action: "BACKUP_RESTORE",
        message: "BACKUP_RESTORE",
        metadata,
      });
    });

    it("액션만으로 시스템 로그를 생성해야 함", async () => {
      const mockLogSystem = jest.fn().mockResolvedValue({ id: "system-log-3" });
      mockUnifiedLogger.logSystem = mockLogSystem;

      await createSystemLog({
        action: "SERVER_START",
      });

      expect(mockLogSystem).toHaveBeenCalledWith({
        action: "SERVER_START",
        message: "SERVER_START",
        metadata: undefined,
      });
    });
  });
});
