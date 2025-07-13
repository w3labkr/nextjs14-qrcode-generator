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
});
