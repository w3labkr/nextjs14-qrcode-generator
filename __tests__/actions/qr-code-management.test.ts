import {
  getUserQrCodes,
  updateQrCode,
  deleteQrCode,
  toggleQrCodeFavorite,
  clearQrCodeHistory,
  getQrCodeStats,
  saveQrCode,
} from "@/app/actions/qr-code-management";
import { TEST_USER_ID, TEST_QR_CODE_ID } from "../test-utils";

// Mock dependencies first
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/unified-logging", () => ({
  UnifiedLogger: {
    logError: jest.fn().mockResolvedValue(undefined),
    logAudit: jest.fn().mockResolvedValue(undefined),
    logQrCodeAccess: jest.fn().mockResolvedValue(undefined),
    logQrCodeUpdate: jest.fn().mockResolvedValue(undefined),
    logQrCodeDeletion: jest.fn().mockResolvedValue(undefined),
  },
}));

// Use __mocks__ for RLS and utils
jest.mock("@/lib/utils", () => ({
  ensureUserExists: jest.fn(),
}));

describe("QR Code Management Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // 모든 테스트에서 기본적인 인증된 사용자 설정
    const mockAuth = require("@/auth").auth;
    mockAuth.mockResolvedValue({
      user: { id: TEST_USER_ID, email: "test@example.com" },
    });

    // Mock ensureUserExists
    const mockEnsureUserExists = require("@/lib/utils").ensureUserExists;
    mockEnsureUserExists.mockResolvedValue({
      session: {
        user: { id: TEST_USER_ID, email: "test@example.com" },
      },
    });
  });

  describe("getUserQrCodes", () => {
    it("인증된 사용자의 QR 코드 목록을 반환해야 한다", async () => {
      const result = await getUserQrCodes(1, 10);

      expect(result).toEqual({
        qrCodes: expect.arrayContaining([
          expect.objectContaining({
            id: "qr1",
            title: "Test QR 1",
            content: "https://example.com",
            type: "URL",
          }),
        ]),
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });
  });

  describe("toggleQrCodeFavorite", () => {
    it("QR 코드 즐겨찾기 상태를 토글해야 한다", async () => {
      const result = await toggleQrCodeFavorite("qr1");

      expect(result.id).toBe("c987654321098765432109876");
      expect(result.isFavorite).toBe(true);
    });
  });

  describe("deleteQrCode", () => {
    it("QR 코드를 삭제해야 한다", async () => {
      const result = await deleteQrCode("qr1");

      expect(result).toEqual({ success: true });
    });
  });

  describe("clearQrCodeHistory", () => {
    it("사용자의 모든 QR 코드를 삭제해야 한다", async () => {
      const result = await clearQrCodeHistory();

      expect(result).toEqual({
        success: true,
        message: expect.stringContaining("QR 코드가 삭제되었습니다."),
        deletedCount: 5,
      });
    });
  });

  describe("getQrCodeStats", () => {
    it("QR 코드 통계를 반환해야 한다", async () => {
      const result = await getQrCodeStats();

      expect(result).toEqual({
        success: true,
        stats: expect.objectContaining({
          total: 1,
          favorites: expect.any(Number),
          thisMonth: expect.any(Number),
          byType: expect.any(Object),
        }),
      });
    });

    it("인증되지 않은 사용자는 통계를 조회할 수 없다", async () => {
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      const result = await getQrCodeStats();
      expect(result).toEqual({
        success: false,
        error: "로그인이 필요합니다.",
      });
    });
  });

  describe("updateQrCode", () => {
    it("인증되지 않은 사용자는 QR 코드를 업데이트할 수 없다", async () => {
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      const updateData = {
        title: "Updated QR Code",
        text: "Updated content",
        qrType: "text" as const,
      };

      const result = await updateQrCode(TEST_QR_CODE_ID, updateData);
      expect(result).toEqual({
        success: false,
        error: "Unauthorized",
      });
    });

    it("데이터베이스 오류 시 적절한 에러 메시지를 반환해야 한다", async () => {
      const mockPrisma = require("@/lib/prisma").prisma;
      mockPrisma.qrCode.findFirst.mockRejectedValue(new Error("Database error"));

      const updateData = {
        title: "Updated QR Code",
        text: "Updated content",
        qrType: "text" as const,
      };

      const result = await updateQrCode(TEST_QR_CODE_ID, updateData);
      expect(result).toEqual({
        success: false,
        error: "Failed to update QR code",
      });
    });

    it("존재하지 않는 QR 코드는 업데이트할 수 없다", async () => {
      const mockPrisma = require("@/lib/prisma").prisma;
      mockPrisma.qrCode.findFirst.mockResolvedValue(null);

      const updateData = {
        title: "Updated QR Code",
        text: "Updated content",
        qrType: "text" as const,
      };

      const result = await updateQrCode(TEST_QR_CODE_ID, updateData);
      expect(result).toEqual({
        success: false,
        error: "QR Code not found",
      });
    });
  });

  describe("saveQrCode", () => {
    it("QR 코드를 성공적으로 저장해야 한다", async () => {
      const saveData: SaveQrCodeData = {
        title: "Test QR Code",
        content: "Test content",
        type: "text",
        settings: {
          width: 300,
          type: "png",
          color: "#000000",
          margin: 10,
        },
      };

      const result = await saveQrCode(saveData);

      expect(result).toEqual({
        success: true,
        qrCode: expect.objectContaining({
          content: "Test content",
          type: "text",
          userId: TEST_USER_ID,
          isFavorite: false,
        }),
      });
    });

    it("인증되지 않은 사용자는 QR 코드를 저장할 수 없다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockEnsureUserExists = require("@/lib/utils").ensureUserExists;
      
      mockAuth.mockResolvedValue(null);
      mockEnsureUserExists.mockRejectedValue(new Error("로그인이 필요합니다."));

      const saveData: SaveQrCodeData = {
        title: "Test QR Code",
        content: "Test content",
        type: "text",
        settings: {
          width: 300,
          type: "png",
          color: "#000000",
          margin: 10,
        },
      };

      const result = await saveQrCode(saveData);
      expect(result).toEqual({
        success: false,
        error: "로그인이 필요합니다.",
      });
    });

    it("데이터베이스 오류 시 적절한 에러를 반환해야 한다", async () => {
      const mockPrisma = require("@/lib/prisma").prisma;
      mockPrisma.qrCode.create.mockRejectedValue(new Error("Database error"));

      const saveData: SaveQrCodeData = {
        title: "Test QR Code",
        content: "Test content",
        type: "text",
        settings: {
          width: 300,
          type: "png",
          color: "#000000",
          margin: 10,
        },
      };

      const result = await saveQrCode(saveData);
      expect(result).toEqual({
        success: false,
        error: "Database error",
      });
    });
  });

  describe("Additional edge cases", () => {
    it("getUserQrCodes - 페이지네이션 기능 테스트", async () => {
      const result = await getUserQrCodes(2, 5);

      expect(result).toEqual({
        qrCodes: expect.any(Array),
        totalCount: 1,
        totalPages: 1,
        currentPage: 2,
      });
    });

    it("getQrCodeStats - 통계 데이터 구조 검증", async () => {
      const result = await getQrCodeStats();

      expect(result.success).toBe(true);
      expect(result.stats).toHaveProperty("total");
      expect(result.stats).toHaveProperty("favorites");
      expect(result.stats).toHaveProperty("thisMonth");
      expect(result.stats).toHaveProperty("byType");
      expect(typeof result.stats.total).toBe("number");
      expect(typeof result.stats.favorites).toBe("number");
      expect(typeof result.stats.thisMonth).toBe("number");
      expect(typeof result.stats.byType).toBe("object");
    });

    it("saveQrCode - 설정 데이터 JSON 직렬화 테스트", async () => {
      const saveData: SaveQrCodeData = {
        title: "Complex QR Code",
        content: "Complex content",
        type: "url",
        settings: {
          width: 512,
          type: "svg",
          color: "#FF0000",
          margin: 20,
        },
      };

      const result = await saveQrCode(saveData);

      expect(result).toEqual({
        success: true,
        qrCode: expect.objectContaining({
          content: "Complex content",
          type: "url",
          settings: expect.objectContaining({
            width: expect.any(Number),
            type: expect.any(String),
            color: expect.any(String),
            margin: expect.any(Number),
          }),
        }),
      });
    });
  });
});
