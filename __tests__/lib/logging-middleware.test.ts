/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { UnifiedLogger } from "@/lib/unified-logging";
import {
  logApiRequest,
  logAuthEvent,
  logError,
  logQrGeneration,
  logAudit,
  logSystem,
  PerformanceLogger,
  generateRequestId,
  shouldLog,
} from "@/lib/logging-middleware";

describe("logging-middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Jest 환경에서는 window 객체를 삭제하여 서버 환경 시뮬레이션
    delete (global as any).window;

    // UnifiedLogger 메서드들을 jest.spyOn으로 모킹
    jest.spyOn(UnifiedLogger, "getClientInfoFromRequest").mockReturnValue({
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
    });
    jest.spyOn(UnifiedLogger, "logAccess").mockResolvedValue(undefined);
    jest.spyOn(UnifiedLogger, "logAuth").mockResolvedValue(undefined);
    jest.spyOn(UnifiedLogger, "logError").mockResolvedValue(undefined);
    jest.spyOn(UnifiedLogger, "logQrGeneration").mockResolvedValue(undefined);
    jest.spyOn(UnifiedLogger, "logAudit").mockResolvedValue(undefined);
    jest.spyOn(UnifiedLogger, "logSystem").mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("logApiRequest", () => {
    it("서버 환경에서 API 요청을 로깅해야 한다", async () => {
      const mockRequest = {
        method: "GET",
        nextUrl: { pathname: "/api/test" },
        headers: {
          get: jest.fn((key: string) => {
            if (key === "x-request-id") return "test-id";
            return null;
          }),
        },
      } as unknown as NextRequest;

      const mockResponse = {
        status: 200,
      } as Response;

      await logApiRequest(mockRequest, mockResponse, "user123", 150);

      expect(UnifiedLogger.logAccess).toHaveBeenCalledWith(
        {
          userId: "user123",
          method: "GET",
          path: "/api/test",
          statusCode: 200,
          responseTime: 150,
          requestId: "test-id",
        },
        {
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
        },
      );
    });

    it("브라우저 환경에서는 로깅하지 않아야 한다", async () => {
      // 브라우저 환경 시뮬레이션 (window 객체 정의)
      (global as any).window = {};

      const mockRequest = {} as NextRequest;
      const mockResponse = {} as Response;

      await logApiRequest(mockRequest, mockResponse);

      expect(UnifiedLogger.logAccess).not.toHaveBeenCalled();
      
      // 정리
      delete (global as any).window;
    });

    it("로깅 중 에러가 발생하면 콘솔에 에러를 출력해야 한다", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockRequest = {
        method: "GET",
        nextUrl: { pathname: "/api/test" },
        headers: {
          get: jest.fn(() => null),
        },
      } as unknown as NextRequest;

      const mockResponse = { status: 200 } as Response;

      jest.spyOn(UnifiedLogger, "logAccess").mockRejectedValueOnce(new Error("Log error"));

      await logApiRequest(mockRequest, mockResponse);

      expect(consoleSpy).toHaveBeenCalledWith(
        "API 요청 로그 기록 실패:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("logAuthEvent", () => {
    it("서버 환경에서 인증 이벤트를 로깅해야 한다", async () => {
      const mockRequest = {
        method: "POST",
        nextUrl: { pathname: "/auth/signin" },
        headers: {
          get: jest.fn(() => null),
        },
      } as unknown as NextRequest;

      await logAuthEvent(
        "signin",
        "LOGIN",
        mockRequest,
        "user123",
        "google",
        "session123",
      );

      expect(UnifiedLogger.logAuth).toHaveBeenCalledWith(
        {
          userId: "user123",
          action: "signin",
          authAction: "LOGIN",
          provider: "google",
          sessionId: "session123",
        },
        {
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
        },
      );
    });

    it("request 없이도 로깅해야 한다", async () => {
      await logAuthEvent("logout", "LOGOUT", undefined, "user123");

      expect(UnifiedLogger.logAuth).toHaveBeenCalledWith(
        {
          userId: "user123",
          action: "logout",
          authAction: "LOGOUT",
          provider: undefined,
          sessionId: undefined,
        },
        undefined,
      );
    });

    it("브라우저 환경에서는 로깅하지 않아야 한다", async () => {
      // 브라우저 환경 시뮬레이션 (window 객체 정의)
      (global as any).window = {};

      await logAuthEvent("signin", "LOGIN");

      expect(UnifiedLogger.logAuth).not.toHaveBeenCalled();
      
      // 정리
      delete (global as any).window;
    });
  });

  describe("logError", () => {
    it("Error 객체로 에러를 로깅해야 한다", async () => {
      const error = new Error("Test error");
      const mockRequest = {
        method: "GET",
        nextUrl: { pathname: "/api/test" },
        headers: {
          get: jest.fn(() => null),
        },
      } as unknown as NextRequest;

      await logError(
        error,
        mockRequest,
        "user123",
        "E001",
        "req123",
        { extra: "data" },
      );

      expect(UnifiedLogger.logError).toHaveBeenCalledWith(
        {
          userId: "user123",
          error,
          errorCode: "E001",
          requestId: "req123",
          additionalInfo: { extra: "data" },
        },
        {
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
        },
      );
    });

    it("문자열로 에러를 로깅해야 한다", async () => {
      await logError("String error message");

      expect(UnifiedLogger.logError).toHaveBeenCalledWith(
        {
          userId: undefined,
          error: "String error message",
          errorCode: undefined,
          requestId: undefined,
          additionalInfo: undefined,
        },
        undefined,
      );
    });

    it("로깅 중 에러가 발생하면 콘솔에 에러를 출력해야 한다", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      jest.spyOn(UnifiedLogger, "logError").mockRejectedValueOnce(new Error("Log error"));

      await logError("Test error");

      expect(consoleSpy).toHaveBeenCalledWith(
        "에러 로그 기록 실패:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("logQrGeneration", () => {
    it("QR 코드 생성을 로깅해야 한다", async () => {
      const mockRequest = {
        method: "POST",
        nextUrl: { pathname: "/api/qr" },
        headers: {
          get: jest.fn(() => null),
        },
      } as unknown as NextRequest;

      await logQrGeneration(
        "url",
        mockRequest,
        "user123",
        "hash123",
        "256x256",
        "png",
        { color: "blue" },
      );

      expect(UnifiedLogger.logQrGeneration).toHaveBeenCalledWith(
        {
          userId: "user123",
          qrType: "url",
          contentHash: "hash123",
          size: "256x256",
          format: "png",
          customization: { color: "blue" },
        },
        {
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
        },
      );
    });

    it("최소 파라미터만으로 로깅해야 한다", async () => {
      await logQrGeneration("text");

      expect(UnifiedLogger.logQrGeneration).toHaveBeenCalledWith(
        {
          userId: undefined,
          qrType: "text",
          contentHash: undefined,
          size: undefined,
          format: undefined,
          customization: undefined,
        },
        undefined,
      );
    });
  });

  describe("logAudit", () => {
    it("감사 로그를 기록해야 한다", async () => {
      const mockRequest = {
        method: "POST",
        nextUrl: { pathname: "/api/admin" },
        headers: {
          get: jest.fn(() => null),
        },
      } as unknown as NextRequest;

      await logAudit(
        "UPDATE",
        "users",
        mockRequest,
        "user123",
        "record123",
        { name: "old" },
        { name: "new" },
        ["name"],
      );

      expect(UnifiedLogger.logAudit).toHaveBeenCalledWith(
        {
          userId: "user123",
          action: "UPDATE",
          tableName: "users",
          recordId: "record123",
          oldValues: { name: "old" },
          newValues: { name: "new" },
          changes: ["name"],
        },
        {
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
        },
      );
    });

    it("최소 파라미터만으로 로깅해야 한다", async () => {
      await logAudit("CREATE", "users");

      expect(UnifiedLogger.logAudit).toHaveBeenCalledWith(
        {
          userId: undefined,
          action: "CREATE",
          tableName: "users",
          recordId: undefined,
          oldValues: undefined,
          newValues: undefined,
          changes: undefined,
        },
        undefined,
      );
    });
  });

  describe("logSystem", () => {
    it("시스템 로그를 기록해야 한다", async () => {
      const mockRequest = {
        method: "GET",
        nextUrl: { pathname: "/api/system" },
        headers: {
          get: jest.fn(() => null),
        },
      } as unknown as NextRequest;

      await logSystem(
        "STARTUP",
        "Application started",
        mockRequest,
        "INFO",
        { version: "1.0.0" },
      );

      expect(UnifiedLogger.logSystem).toHaveBeenCalledWith(
        {
          action: "STARTUP",
          message: "Application started",
          level: "INFO",
          metadata: { version: "1.0.0" },
        },
        {
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
        },
      );
    });

    it("기본 로그 레벨(INFO)로 로깅해야 한다", async () => {
      await logSystem("TEST", "Test message");

      expect(UnifiedLogger.logSystem).toHaveBeenCalledWith(
        {
          action: "TEST",
          message: "Test message",
          level: "INFO",
          metadata: undefined,
        },
        undefined,
      );
    });
  });

  describe("PerformanceLogger", () => {
    beforeEach(() => {
      jest.spyOn(Date, "now").mockReturnValue(1000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("성능 측정 및 로깅을 해야 한다", async () => {
      const logger = new PerformanceLogger("test_action", "user123");

      jest.spyOn(Date, "now").mockReturnValue(1500);

      const duration = await logger.end({ extra: "data" });

      expect(duration).toBe(500);
      expect(UnifiedLogger.logSystem).toHaveBeenCalledWith({
        action: "test_action",
        message: "작업 완료: test_action (500ms)",
        level: "INFO",
        metadata: {
          duration: 500,
          userId: "user123",
          extra: "data",
        },
      });
    });

    it("userId 없이 성능 측정을 해야 한다", async () => {
      const logger = new PerformanceLogger("test_action");

      jest.spyOn(Date, "now").mockReturnValue(1200);

      const duration = await logger.end();

      expect(duration).toBe(200);
      expect(UnifiedLogger.logSystem).toHaveBeenCalledWith({
        action: "test_action",
        message: "작업 완료: test_action (200ms)",
        level: "INFO",
        metadata: {
          duration: 200,
          userId: undefined,
        },
      });
    });

    it("로깅 중 에러가 발생해도 duration을 반환해야 한다", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      
      // logSystem을 다시 모킹하여 에러 발생 시나리오 테스트
      jest.spyOn(UnifiedLogger, "logSystem").mockRejectedValueOnce(new Error("Log error"));

      const logger = new PerformanceLogger("test_action");
      jest.spyOn(Date, "now").mockReturnValue(1300);

      const duration = await logger.end();

      expect(duration).toBe(300);
      expect(consoleSpy).toHaveBeenCalledWith(
        "성능 로그 기록 실패:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("generateRequestId", () => {
    it("유니크한 요청 ID를 생성해야 한다", () => {
      jest.spyOn(Date, "now").mockReturnValue(1234567890);
      jest.spyOn(Math, "random").mockReturnValue(0.123456789);

      const id = generateRequestId();

      expect(id).toMatch(/^req_1234567890_[a-z0-9]+$/);
      expect(id).toContain("req_1234567890_");
    });

    it("여러 번 호출해도 다른 ID를 생성해야 한다", () => {
      const id1 = generateRequestId();
      // 시간 경과를 위해 약간의 딜레이
      jest.spyOn(Date, "now").mockReturnValue(Date.now() + 1);
      const id2 = generateRequestId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });

  describe("shouldLog", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("기본 로그 레벨(INFO)에서 올바르게 필터링해야 한다", () => {
      delete process.env.LOG_LEVEL;

      expect(shouldLog("DEBUG")).toBe(false);
      expect(shouldLog("INFO")).toBe(true);
      expect(shouldLog("WARN")).toBe(true);
      expect(shouldLog("ERROR")).toBe(true);
      expect(shouldLog("FATAL")).toBe(true);
    });

    it("DEBUG 레벨에서 모든 로그를 허용해야 한다", () => {
      process.env.LOG_LEVEL = "DEBUG";

      expect(shouldLog("DEBUG")).toBe(true);
      expect(shouldLog("INFO")).toBe(true);
      expect(shouldLog("WARN")).toBe(true);
      expect(shouldLog("ERROR")).toBe(true);
      expect(shouldLog("FATAL")).toBe(true);
    });

    it("ERROR 레벨에서 ERROR와 FATAL만 허용해야 한다", () => {
      process.env.LOG_LEVEL = "ERROR";

      expect(shouldLog("DEBUG")).toBe(false);
      expect(shouldLog("INFO")).toBe(false);
      expect(shouldLog("WARN")).toBe(false);
      expect(shouldLog("ERROR")).toBe(true);
      expect(shouldLog("FATAL")).toBe(true);
    });

    it("FATAL 레벨에서 FATAL만 허용해야 한다", () => {
      process.env.LOG_LEVEL = "FATAL";

      expect(shouldLog("DEBUG")).toBe(false);
      expect(shouldLog("INFO")).toBe(false);
      expect(shouldLog("WARN")).toBe(false);
      expect(shouldLog("ERROR")).toBe(false);
      expect(shouldLog("FATAL")).toBe(true);
    });
  });
});