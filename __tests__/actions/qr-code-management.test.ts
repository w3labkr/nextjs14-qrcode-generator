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
  });
});
