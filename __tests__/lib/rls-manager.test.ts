import { RLSManager } from "@/lib/rls-manager";
import { prisma } from "@/lib/prisma";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    $executeRawUnsafe: jest.fn(),
    $queryRaw: jest.fn(),
    user: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    qrCode: {
      findMany: jest.fn(),
    },
    applicationLog: {
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("RLSManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("setCurrentUser", () => {
    it("사용자 ID를 설정해야 함", async () => {
      const userId = "test-user-123";
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      await RLSManager.setCurrentUser(userId);

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_id = '${userId}'`
      );
    });

    it("데이터베이스 오류를 전파해야 함", async () => {
      const userId = "test-user-123";
      const dbError = new Error("Database connection failed");
      mockPrisma.$executeRawUnsafe.mockRejectedValue(dbError);

      await expect(RLSManager.setCurrentUser(userId)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("setAdminMode", () => {
    it("관리자 모드를 true로 설정해야 함", async () => {
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      await RLSManager.setAdminMode(true);

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.is_admin = true`
      );
    });

    it("관리자 모드를 false로 설정해야 함", async () => {
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      await RLSManager.setAdminMode(false);

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.is_admin = false`
      );
    });

    it("기본값은 true여야 함", async () => {
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      await RLSManager.setAdminMode();

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.is_admin = true`
      );
    });
  });

  describe("setUserContext", () => {
    it("사용자 ID와 관리자 모드를 동시에 설정해야 함", async () => {
      const userId = "test-user-123";
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      await RLSManager.setUserContext(userId, true);

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_id = '${userId}'`
      );
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.is_admin = true`
      );
    });

    it("관리자 모드 기본값은 false여야 함", async () => {
      const userId = "test-user-123";
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      await RLSManager.setUserContext(userId);

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.is_admin = false`
      );
    });

    it("오류 발생 시 에러 로그 출력 후 재전파해야 함", async () => {
      const userId = "test-user-123";
      const dbError = new Error("Database error");
      mockPrisma.$executeRawUnsafe.mockRejectedValue(dbError);

      await expect(RLSManager.setUserContext(userId)).rejects.toThrow(
        "Database error"
      );
      expect(console.error).toHaveBeenCalledWith("RLS 컨텍스트 설정 실패:", dbError);
    });
  });

  describe("clearContext", () => {
    it("모든 RLS 설정을 초기화해야 함", async () => {
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      await RLSManager.clearContext();

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `RESET app.current_user_id`
      );
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `RESET app.current_user_email`
      );
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `RESET app.is_admin`
      );
    });
  });

  describe("getCurrentContext", () => {
    it("현재 컨텍스트를 조회해야 함", async () => {
      const mockUserIdResult = [{ current_setting: "test-user-123" }];
      const mockIsAdminResult = [{ current_setting: "true" }];

      mockPrisma.$queryRaw
        .mockResolvedValueOnce(mockUserIdResult)
        .mockResolvedValueOnce(mockIsAdminResult);

      const context = await RLSManager.getCurrentContext();

      expect(context).toEqual({
        userId: "test-user-123",
        isAdmin: true,
      });
    });

    it("빈 결과에 대해 기본값을 반환해야 함", async () => {
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const context = await RLSManager.getCurrentContext();

      expect(context).toEqual({
        userId: null,
        isAdmin: false,
      });
    });

    it("isAdmin이 false인 경우 올바르게 파싱해야 함", async () => {
      const mockUserIdResult = [{ current_setting: "test-user-123" }];
      const mockIsAdminResult = [{ current_setting: "false" }];

      mockPrisma.$queryRaw
        .mockResolvedValueOnce(mockUserIdResult)
        .mockResolvedValueOnce(mockIsAdminResult);

      const context = await RLSManager.getCurrentContext();

      expect(context).toEqual({
        userId: "test-user-123",
        isAdmin: false,
      });
    });
  });

  describe("withUserContext", () => {
    it("사용자 컨텍스트를 설정하고 작업 실행 후 복원해야 함", async () => {
      const userId = "test-user-123";
      const previousContext = { userId: "prev-user", isAdmin: false };
      const operation = jest.fn().mockResolvedValue("operation result");

      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([{ current_setting: "prev-user" }])
        .mockResolvedValueOnce([{ current_setting: "false" }]);

      const result = await RLSManager.withUserContext(
        userId,
        true,
        operation
      );

      expect(result).toBe("operation result");
      expect(operation).toHaveBeenCalled();

      // 컨텍스트 설정 확인
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_id = '${userId}'`
      );
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.is_admin = true`
      );

      // 컨텍스트 복원 확인
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_id = 'prev-user'`
      );
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.is_admin = false`
      );
    });

    it("작업 실행 중 오류가 발생해도 컨텍스트를 복원해야 함", async () => {
      const userId = "test-user-123";
      const operation = jest.fn().mockRejectedValue(new Error("Operation failed"));

      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([{ current_setting: "prev-user" }])
        .mockResolvedValueOnce([{ current_setting: "false" }]);

      await expect(
        RLSManager.withUserContext(userId, false, operation)
      ).rejects.toThrow("Operation failed");

      // 컨텍스트 복원 확인
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_id = 'prev-user'`
      );
    });

    it("이전 컨텍스트가 없는 경우 컨텍스트를 클리어해야 함", async () => {
      const userId = "test-user-123";
      const operation = jest.fn().mockResolvedValue("result");

      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      await RLSManager.withUserContext(userId, false, operation);

      // 컨텍스트 클리어 확인
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `RESET app.current_user_id`
      );
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `RESET app.current_user_email`
      );
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `RESET app.is_admin`
      );
    });
  });

  describe("withAdminContext", () => {
    it("관리자 컨텍스트를 설정하고 작업 실행 후 복원해야 함", async () => {
      const operation = jest.fn().mockResolvedValue("admin result");

      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([{ current_setting: "user-id" }])
        .mockResolvedValueOnce([{ current_setting: "false" }]);

      const result = await RLSManager.withAdminContext(operation);

      expect(result).toBe("admin result");
      expect(operation).toHaveBeenCalled();

      // 관리자 모드 설정 확인
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.is_admin = true`
      );

      // 원래 관리자 모드 복원 확인
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.is_admin = false`
      );
    });
  });

  describe("validateContext", () => {
    it("유효한 CUID 사용자 ID를 검증해야 함", async () => {
      const cuidUserId = "c1234567890abcdef12345678";
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([{ current_setting: cuidUserId }])
        .mockResolvedValueOnce([{ current_setting: "false" }]);

      const validation = await RLSManager.validateContext();

      expect(validation).toEqual({
        valid: true,
        context: {
          userId: cuidUserId,
          isAdmin: false,
        },
      });
    });

    it("유효한 UUID 사용자 ID를 검증해야 함", async () => {
      const uuidUserId = "123e4567-e89b-12d3-a456-426614174000";
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([{ current_setting: uuidUserId }])
        .mockResolvedValueOnce([{ current_setting: "true" }]);

      const validation = await RLSManager.validateContext();

      expect(validation).toEqual({
        valid: true,
        context: {
          userId: uuidUserId,
          isAdmin: true,
        },
      });
    });

    it("사용자 컨텍스트가 설정되지 않은 경우 무효해야 함", async () => {
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ current_setting: "false" }]);

      const validation = await RLSManager.validateContext();

      expect(validation).toEqual({
        valid: false,
        error: "No user context set",
        context: {
          userId: null,
          isAdmin: false,
        },
      });
    });

    it("잘못된 사용자 ID 형식을 검증해야 함", async () => {
      const invalidUserId = "invalid-user-id";
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([{ current_setting: invalidUserId }])
        .mockResolvedValueOnce([{ current_setting: "false" }]);

      const validation = await RLSManager.validateContext();

      expect(validation).toEqual({
        valid: false,
        error: "Invalid user ID format",
        context: {
          userId: invalidUserId,
          isAdmin: false,
        },
      });
    });

    it("데이터베이스 오류를 처리해야 함", async () => {
      const dbError = new Error("Database connection failed");
      mockPrisma.$queryRaw.mockRejectedValue(dbError);

      const validation = await RLSManager.validateContext();

      expect(validation).toEqual({
        valid: false,
        error: "Database connection failed",
        context: null,
      });
    });
  });

  describe("benchmarkRLS", () => {
    it("성능 벤치마크를 실행해야 함", async () => {
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      const benchmark = await RLSManager.benchmarkRLS();

      expect(benchmark.success).toBe(true);
      expect(benchmark.results).toBeDefined();
      expect(benchmark.results.setContextAvg).toBeGreaterThan(0);
      expect(benchmark.results.clearContextAvg).toBeGreaterThan(0);
      expect(benchmark.iterations).toBe(100);
    });

    it("벤치마크 실행 중 오류를 처리해야 함", async () => {
      const dbError = new Error("Benchmark failed");
      mockPrisma.$executeRawUnsafe.mockRejectedValue(dbError);

      const benchmark = await RLSManager.benchmarkRLS();

      expect(benchmark.success).toBe(false);
      expect(benchmark.error).toBe("Benchmark failed");
    });

    it("벤치마크 후 컨텍스트를 클리어해야 함", async () => {
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      await RLSManager.benchmarkRLS();

      // 마지막 호출들이 컨텍스트 클리어인지 확인
      const calls = mockPrisma.$executeRawUnsafe.mock.calls;
      const lastCalls = calls.slice(-3);
      
      expect(lastCalls).toEqual([
        [`RESET app.current_user_id`],
        [`RESET app.current_user_email`],
        [`RESET app.is_admin`],
      ]);
    });
  });

  describe("testRLS", () => {
    it("RLS 테스트를 완전히 실행해야 함", async () => {
      const testUser = { id: "test-user-1", email: "test1@example.com" };
      const otherUser = { id: "test-user-2", email: "test2@example.com" };

      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.user.create
        .mockResolvedValueOnce(testUser)
        .mockResolvedValueOnce(otherUser);
      mockPrisma.qrCode.findMany
        .mockResolvedValueOnce([]) // 사용자 액세스 테스트
        .mockResolvedValueOnce([]); // 격리 테스트
      mockPrisma.applicationLog.findMany.mockResolvedValue([]);
      mockPrisma.user.deleteMany.mockResolvedValue({ count: 2 });

      const result = await RLSManager.testRLS();

      expect(result).toEqual({
        userAccess: true,
        adminAccess: true,
        isolation: true,
      });

      // 테스트 데이터 정리 확인
      expect(mockPrisma.user.deleteMany).toHaveBeenCalledWith({
        where: {
          email: {
            in: ["test1@example.com", "test2@example.com"],
          },
        },
      });
    });

    it("RLS 테스트 실행 중 오류를 처리해야 함", async () => {
      const testError = new Error("Test failed");
      mockPrisma.user.create.mockRejectedValue(testError);

      const result = await RLSManager.testRLS();

      expect(result).toEqual({
        userAccess: false,
        adminAccess: false,
        isolation: false,
        error: "Test failed",
      });
      expect(console.error).toHaveBeenCalledWith("RLS 테스트 실패:", testError);
    });

    it("테스트 후 컨텍스트를 클리어해야 함", async () => {
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.user.create.mockRejectedValue(new Error("Test error"));

      await RLSManager.testRLS();

      // 마지막 호출들이 컨텍스트 클리어인지 확인
      const calls = mockPrisma.$executeRawUnsafe.mock.calls;
      const lastCalls = calls.slice(-3);
      
      expect(lastCalls).toEqual([
        [`RESET app.current_user_id`],
        [`RESET app.current_user_email`],
        [`RESET app.is_admin`],
      ]);
    });
  });
});