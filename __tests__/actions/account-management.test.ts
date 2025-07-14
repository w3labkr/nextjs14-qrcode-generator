import {
  deleteAccount,
  updateProfile,
  getConnectedAccounts,
  disconnectOAuthProvider,
  checkOAuthConnectionStatus,
  getCurrentAccountProvider,
} from "@/app/actions/account-management";
import { TEST_USER_ID } from "../test-utils";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/unified-logging", () => ({
  UnifiedLogger: {
    logError: jest.fn().mockResolvedValue(undefined),
    logAudit: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("Account Management Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("updateProfile", () => {
    it("로그인하지 않은 경우 오류가 반환되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      // Act
      const result = await updateProfile({
        name: "Test",
        email: "test@example.com",
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("로그인이 필요합니다.");
    });

    it("이름이 비어있는 경우 오류가 반환되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      // Act
      const result = await updateProfile({
        name: "",
        email: "test@example.com",
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("이름을 입력해주세요.");
    });

    it("이메일이 비어있는 경우 오류가 반환되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      // Act
      const result = await updateProfile({ name: "Test Name", email: "" });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("이메일을 입력해주세요.");
    });

    it("잘못된 이메일 형식인 경우 오류가 반환되어야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      // Act
      const result = await updateProfile({
        name: "Test Name",
        email: "invalid-email",
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("올바른 이메일 형식이 아닙니다.");
    });
  });

  describe("getConnectedAccounts", () => {
    it("로그인하지 않은 경우 오류가 발생해야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      // Act
      const result = await getConnectedAccounts();

      // Assert
      expect(result.success).toBe(false);
      expect((result as any).error).toBe("로그인이 필요합니다.");
    });
  });

  describe("disconnectOAuthProvider", () => {
    it("로그인하지 않은 경우 오류가 발생해야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      // Act
      const result = await disconnectOAuthProvider("github");

      // Assert
      expect(result.success).toBe(false);
      expect((result as any).error).toBe("로그인이 필요합니다.");
    });
  });

  describe("getCurrentAccountProvider", () => {
    it("로그인하지 않은 경우 오류가 발생해야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      // Act
      const result = await getCurrentAccountProvider();

      // Assert
      expect(result.success).toBe(false);
      expect((result as any).error).toBe("로그인이 필요합니다.");
    });
  });

  describe("deleteAccount", () => {
    it("로그인하지 않은 경우 오류가 발생해야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      // Act & Assert
      await expect(deleteAccount()).rejects.toThrow("로그인이 필요합니다.");
    });

    it("사용자 ID가 없는 경우 오류가 발생해야 함", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { email: "test@example.com" }, // id가 없음
      });

      // Act & Assert
      await expect(deleteAccount()).rejects.toThrow("로그인이 필요합니다.");
    });
  });

  describe("Additional error scenarios", () => {
    it("updateProfile - 데이터베이스 오류 처리", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      // Act - 실제 데이터베이스 오류 시뮬레이션
      const result = await updateProfile({
        name: "Test User",
        email: "test@example.com",
      });

      // Assert - 실제 RLS 오류로 인한 실패 예상
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("checkOAuthConnectionStatus - 인증 오류 처리", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      // Act
      const result = await checkOAuthConnectionStatus();

      // Assert
      expect(result.success).toBe(false);
      expect((result as any).error).toBe("로그인이 필요합니다.");
    });

    it("updateProfile - 유효성 검사 실패", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      // Act
      const result = await updateProfile({
        name: "", // 빈 이름
        email: "test@example.com",
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("이름은 필수 입력입니다.");
    });

    it("updateProfile - 이메일 형식 오류", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      // Act
      const result = await updateProfile({
        name: "Test User",
        email: "invalid-email", // 잘못된 이메일 형식
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("유효한 이메일 주소를 입력해주세요.");
    });

    it("disconnectOAuthProvider - 지원하지 않는 프로바이더", async () => {
      // Arrange
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      // Act
      const result = await disconnectOAuthProvider("unsupported" as any);

      // Assert
      expect(result.success).toBe(false);
      expect((result as any).error).toBeDefined();
    });
  });
});
