import {
  withRLS,
  withRLSFull,
  resetRLS,
  withRLSTransaction,
  getPrismaWithRLS,
  testRLS,
  withoutRLS,
  withAuthenticatedRLS,
  withAuthenticatedRLSTransaction,
  getCurrentRLSContext,
  checkRLSStatus,
  measureRLSPerformance,
  getRlsUserId,
  validateRLSPolicies,
} from "@/lib/rls-utils";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    $executeRawUnsafe: jest.fn(),
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
    qrCode: {
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("RLS Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("withRLS", () => {
    it("유효한 CUID 사용자 ID로 RLS 설정", async () => {
      const userId = "c1234567890abcdef12345678";
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      const result = await withRLS(userId);

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_id = '${userId}'`
      );
      expect(result).toBe(prisma);
    });

    it("유효한 UUID 사용자 ID로 RLS 설정", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      const result = await withRLS(userId);

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_id = '${userId}'`
      );
      expect(result).toBe(prisma);
    });

    it("잘못된 사용자 ID 형식 거부", async () => {
      const invalidUserId = "invalid-user-id";

      await expect(withRLS(invalidUserId)).rejects.toThrow(
        "Invalid user ID format: must be CUID or UUID"
      );
    });

    it("빈 사용자 ID 거부", async () => {
      await expect(withRLS("")).rejects.toThrow(
        "Invalid user ID: must be a non-empty string"
      );
    });

    it("null 사용자 ID 거부", async () => {
      await expect(withRLS(null as any)).rejects.toThrow(
        "Invalid user ID: must be a non-empty string"
      );
    });

    it("데이터베이스 오류 처리", async () => {
      const userId = "c1234567890abcdef12345678";
      const dbError = new Error("Database connection failed");
      mockPrisma.$executeRawUnsafe.mockRejectedValue(dbError);

      await expect(withRLS(userId)).rejects.toThrow(
        "Failed to initialize RLS context"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Failed to set RLS context:",
        dbError
      );
    });
  });

  describe("withRLSFull", () => {
    it("사용자 ID와 이메일 모두 설정", async () => {
      const userId = "c1234567890abcdef12345678";
      const userEmail = "user@example.com";
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      const result = await withRLSFull(userId, userEmail);

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_id = '${userId}'`
      );
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_email = '${userEmail}'`
      );
      expect(result).toBe(prisma);
    });

    it("이메일 특수문자 이스케이프 처리", async () => {
      const userId = "c1234567890abcdef12345678";
      const userEmail = "user's@example.com";
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      await withRLSFull(userId, userEmail);

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_email = 'user''s@example.com'`
      );
    });

    it("이메일 없이 사용자 ID만 설정", async () => {
      const userId = "c1234567890abcdef12345678";
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      const result = await withRLSFull(userId);

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_id = '${userId}'`
      );
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledTimes(1);
      expect(result).toBe(prisma);
    });

    it("데이터베이스 오류 처리", async () => {
      const userId = "c1234567890abcdef12345678";
      const dbError = new Error("Database error");
      mockPrisma.$executeRawUnsafe.mockRejectedValue(dbError);

      await expect(withRLSFull(userId)).rejects.toThrow(
        "Failed to initialize RLS context"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Failed to set RLS context:",
        dbError
      );
    });
  });

  describe("resetRLS", () => {
    it("모든 RLS 설정 초기화", async () => {
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      await resetRLS();

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

    it("데이터베이스 오류 처리", async () => {
      const dbError = new Error("Reset failed");
      mockPrisma.$executeRawUnsafe.mockRejectedValue(dbError);

      await expect(resetRLS()).rejects.toThrow(
        "Failed to reset RLS context"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Failed to reset RLS context:",
        dbError
      );
    });
  });

  describe("withRLSTransaction", () => {
    it("트랜잭션과 함께 RLS 설정", async () => {
      const userId = "c1234567890abcdef12345678";
      const mockTx = {
        $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
      } as any;
      const callback = jest.fn().mockResolvedValue("transaction result");

      mockPrisma.$transaction.mockImplementation(
        async (fn: any) => await fn(mockTx)
      );

      const result = await withRLSTransaction(userId, callback);

      expect(mockTx.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_id = '${userId}'`
      );
      expect(callback).toHaveBeenCalledWith(mockTx);
      expect(result).toBe("transaction result");
    });

    it("트랜잭션 실행 중 오류 전파", async () => {
      const userId = "c1234567890abcdef12345678";
      const txError = new Error("Transaction failed");
      const callback = jest.fn().mockRejectedValue(txError);

      mockPrisma.$transaction.mockImplementation(
        async (fn: any) => await fn({
          $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
        })
      );

      await expect(withRLSTransaction(userId, callback)).rejects.toThrow(
        "Transaction failed"
      );
      expect(console.error).toHaveBeenCalledWith(
        "RLS transaction failed:",
        txError
      );
    });
  });

  describe("getPrismaWithRLS", () => {
    it("RLS가 설정된 Prisma 클라이언트 반환", async () => {
      const userId = "c1234567890abcdef12345678";
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      const result = await getPrismaWithRLS(userId);

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_id = '${userId}'`
      );
      expect(result).toBe(prisma);
    });
  });

  describe("testRLS", () => {
    it("RLS 테스트 실행", async () => {
      const userId = "c1234567890abcdef12345678";
      const mockQrCodes = [{ id: "1" }, { id: "2" }];

      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.qrCode.findMany.mockResolvedValue(mockQrCodes);

      const result = await testRLS(userId);

      expect(result).toEqual({
        qrCodesCount: 2,
      });
    });

    it("RLS 테스트 실패 처리", async () => {
      const userId = "c1234567890abcdef12345678";
      const testError = new Error("Test failed");

      mockPrisma.$executeRawUnsafe.mockRejectedValue(testError);

      await expect(testRLS(userId)).rejects.toThrow("Test failed");
      expect(console.error).toHaveBeenCalledWith(
        "RLS test failed:",
        testError
      );
    });
  });

  describe("withoutRLS", () => {
    it("RLS 정책 우회를 위한 설정 제거", async () => {
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      const result = await withoutRLS();

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `RESET app.current_user_id`
      );
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `RESET app.current_user_email`
      );
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `RESET app.is_admin`
      );
      expect(result).toBe(prisma);
    });

    it("관리자 액세스 초기화 실패 처리", async () => {
      const resetError = new Error("Reset failed");
      mockPrisma.$executeRawUnsafe.mockRejectedValue(resetError);

      await expect(withoutRLS()).rejects.toThrow(
        "Failed to initialize admin access"
      );
      expect(console.error).toHaveBeenCalledWith(
        "Failed to reset RLS for admin access:",
        resetError
      );
    });
  });

  describe("withAuthenticatedRLS", () => {
    it("인증된 사용자로 RLS 설정", async () => {
      const session = {
        user: {
          id: "c1234567890abcdef12345678",
          email: "user@example.com",
        },
      };
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      const result = await withAuthenticatedRLS(session);

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_id = '${session.user.id}'`
      );
      expect(result).toBe(prisma);
    });

    it("세션이 없는 경우 인증 오류", async () => {
      await expect(withAuthenticatedRLS(null)).rejects.toThrow(
        "Unauthorized: Valid session required"
      );
    });

    it("사용자 ID가 없는 경우 인증 오류", async () => {
      const session = { user: { email: "user@example.com" } };

      await expect(withAuthenticatedRLS(session)).rejects.toThrow(
        "Unauthorized: Valid session required"
      );
    });
  });

  describe("withAuthenticatedRLSTransaction", () => {
    it("인증된 사용자로 RLS 트랜잭션 실행", async () => {
      const session = {
        user: {
          id: "c1234567890abcdef12345678",
          email: "user@example.com",
        },
      };
      const mockTx = {
        $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
      } as any;
      const callback = jest.fn().mockResolvedValue("transaction result");

      mockPrisma.$transaction.mockImplementation(
        async (fn: any) => await fn(mockTx)
      );

      const result = await withAuthenticatedRLSTransaction(session, callback);

      expect(mockTx.$executeRawUnsafe).toHaveBeenCalledWith(
        `SET app.current_user_id = '${session.user.id}'`
      );
      expect(callback).toHaveBeenCalledWith(mockTx);
      expect(result).toBe("transaction result");
    });

    it("세션이 없는 경우 인증 오류", async () => {
      const callback = jest.fn();

      await expect(withAuthenticatedRLSTransaction(null, callback)).rejects.toThrow(
        "Unauthorized: Valid session required"
      );
    });
  });

  describe("getCurrentRLSContext", () => {
    it("현재 RLS 컨텍스트 조회", async () => {
      const mockResult = [{ current_setting: "c1234567890abcdef12345678" }];
      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await getCurrentRLSContext();

      expect(result).toBe("c1234567890abcdef12345678");
    });

    it("컨텍스트가 설정되지 않은 경우 null 반환", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await getCurrentRLSContext();

      expect(result).toBe(null);
    });

    it("데이터베이스 오류 처리", async () => {
      const dbError = new Error("Query failed");
      mockPrisma.$queryRaw.mockRejectedValue(dbError);

      const result = await getCurrentRLSContext();

      expect(result).toBe(null);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to get RLS context:",
        dbError
      );
    });
  });

  describe("checkRLSStatus", () => {
    it("RLS 상태 확인 성공", async () => {
      const mockResult = [
        {
          schemaname: "public",
          tablename: "qr_codes",
          rowsecurity: true,
          policy_count: 2,
        },
        {
          schemaname: "public",
          tablename: "users",
          rowsecurity: true,
          policy_count: 1,
        },
      ];
      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await checkRLSStatus();

      expect(result.success).toBe(true);
      expect(result.tables).toEqual(mockResult);
      expect(result.timestamp).toBeDefined();
    });

    it("RLS 상태 확인 실패", async () => {
      const dbError = new Error("Query failed");
      mockPrisma.$queryRaw.mockRejectedValue(dbError);

      const result = await checkRLSStatus();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Query failed");
      expect(result.timestamp).toBeDefined();
    });
  });

  describe("measureRLSPerformance", () => {
    it("RLS 성능 측정", async () => {
      const userId = "c1234567890abcdef12345678";
      const queryFn = jest.fn().mockResolvedValue("query result");
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      const result = await measureRLSPerformance(userId, queryFn);

      expect(result.result).toBe("query result");
      expect(result.executionTime).toBeGreaterThan(0);
      expect(queryFn).toHaveBeenCalledWith(prisma);
    });

    it("느린 쿼리 경고 로그", async () => {
      const userId = "c1234567890abcdef12345678";
      const queryFn = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve("result"), 1001))
      );
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      const result = await measureRLSPerformance(userId, queryFn);

      expect(result.executionTime).toBeGreaterThan(1000);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("Slow RLS query detected")
      );
    });

    it("쿼리 실행 중 오류 처리", async () => {
      const userId = "c1234567890abcdef12345678";
      const queryError = new Error("Query failed");
      const queryFn = jest.fn().mockRejectedValue(queryError);
      mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);

      await expect(measureRLSPerformance(userId, queryFn)).rejects.toThrow(
        "Query failed"
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("RLS query failed after"),
        queryError
      );
    });
  });

  describe("getRlsUserId", () => {
    it("deprecated 경고 메시지 출력", () => {
      const result = getRlsUserId();

      expect(result).toBe(null);
      expect(console.warn).toHaveBeenCalledWith(
        "getRlsUserId() is deprecated. Use getCurrentRLSContext() instead."
      );
    });
  });

  describe("validateRLSPolicies", () => {
    it("RLS 정책 검증 성공", async () => {
      const mockPolicies = [
        {
          schemaname: "public",
          tablename: "qr_codes",
          policyname: "qr_codes_select_policy",
          permissive: "PERMISSIVE",
          roles: ["public"],
          cmd: "SELECT",
          qual: "user_id = current_setting('app.current_user_id')",
          with_check: null,
        },
        {
          schemaname: "public",
          tablename: "users",
          policyname: "users_select_policy",
          permissive: "PERMISSIVE",
          roles: ["public"],
          cmd: "SELECT",
          qual: "id = current_setting('app.current_user_id')",
          with_check: null,
        },
      ];
      mockPrisma.$queryRaw.mockResolvedValue(mockPolicies);

      const result = await validateRLSPolicies();

      expect(result.success).toBe(true);
      expect(result.policies).toEqual(mockPolicies);
      expect(result.totalPolicies).toBe(2);
      expect(result.missingPolicies).toEqual([
        "accounts",
        "sessions",
        "application_logs",
      ]);
      expect(result.timestamp).toBeDefined();
    });

    it("RLS 정책 검증 실패", async () => {
      const dbError = new Error("Policy validation failed");
      mockPrisma.$queryRaw.mockRejectedValue(dbError);

      const result = await validateRLSPolicies();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Policy validation failed");
      expect(result.timestamp).toBeDefined();
    });

    it("모든 테이블에 정책이 있는 경우", async () => {
      const mockPolicies = [
        { schemaname: "public", tablename: "qr_codes", policyname: "policy1" },
        { schemaname: "public", tablename: "users", policyname: "policy2" },
        { schemaname: "public", tablename: "accounts", policyname: "policy3" },
        { schemaname: "public", tablename: "sessions", policyname: "policy4" },
        { schemaname: "public", tablename: "application_logs", policyname: "policy5" },
      ];
      mockPrisma.$queryRaw.mockResolvedValue(mockPolicies);

      const result = await validateRLSPolicies();

      expect(result.success).toBe(true);
      expect(result.missingPolicies).toEqual([]);
      expect(result.totalPolicies).toBe(5);
    });
  });
});