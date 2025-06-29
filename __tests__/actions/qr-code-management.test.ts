import {
  getUserQrCodes,
  updateQrCode,
  deleteQrCode,
  toggleQrCodeFavorite,
  clearQrCodeHistory,
  getQrCodeStats,
  saveQrCode,
} from "@/app/actions/qr-code-management";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/rls-utils", () => ({
  withRLS: jest.fn().mockResolvedValue({
    qrCode: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  }),
  withAuthenticatedRLSTransaction: jest.fn(),
  withoutRLS: jest.fn(),
}));

jest.mock("@/lib/unified-logging", () => ({
  UnifiedLogger: {
    logError: jest.fn().mockResolvedValue(undefined),
    logQrCodeAccess: jest.fn().mockResolvedValue(undefined),
    logQrCodeUpdate: jest.fn().mockResolvedValue(undefined),
    logQrCodeDeletion: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    qrCode: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("QR Code Management Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserQrCodes", () => {
    it("인증된 사용자의 QR 코드 목록을 반환해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockWithRLS = require("@/lib/rls-utils").withRLS;

      mockAuth.mockResolvedValue({
        user: { id: "user1", email: "test@example.com" },
      });

      const mockQrCodes = [
        {
          id: "qr1",
          title: "Test QR 1",
          content: "https://example.com",
          type: "URL",
          createdAt: new Date("2024-01-01"),
          isFavorite: false,
        },
      ];

      const mockDb = {
        qrCode: {
          findMany: jest.fn().mockResolvedValue(mockQrCodes),
          count: jest.fn().mockResolvedValue(1),
        },
      };

      mockWithRLS.mockResolvedValue(mockDb);

      const result = await getUserQrCodes(1, 10);

      expect(result).toEqual({
        success: true,
        data: mockQrCodes,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    });
  });

  describe("toggleQrCodeFavorite", () => {
    it("QR 코드 즐겨찾기 상태를 토글해야 한다", async () => {
      const mockAuth = require("@/auth").auth;

      mockAuth.mockResolvedValue({
        user: { id: "user1", email: "test@example.com" },
      });

      // withRLSTransaction mock 추가 필요
      const mockWithRLSTransaction = jest.fn();
      require("@/lib/rls-utils").withRLSTransaction = mockWithRLSTransaction;

      const updatedQrCode = {
        id: "qr1",
        title: "Test QR",
        isFavorite: true,
      };

      const mockTx = {
        qrCode: {
          findFirst: jest
            .fn()
            .mockResolvedValue({ id: "qr1", isFavorite: false }),
          update: jest.fn().mockResolvedValue(updatedQrCode),
        },
      };

      mockWithRLSTransaction.mockImplementation(
        async (userId: any, callback: any) => {
          return await callback(mockTx);
        },
      );

      const result = await toggleQrCodeFavorite("qr1");

      expect(result.id).toBe("qr1");
    });
  });

  describe("deleteQrCode", () => {
    it("QR 코드를 삭제해야 한다", async () => {
      const mockAuth = require("@/auth").auth;

      mockAuth.mockResolvedValue({
        user: { id: "user1", email: "test@example.com" },
      });

      const mockWithRLSTransaction = jest.fn();
      require("@/lib/rls-utils").withRLSTransaction = mockWithRLSTransaction;

      const mockTx = {
        qrCode: {
          findFirst: jest.fn().mockResolvedValue({ id: "qr1" }),
          delete: jest.fn().mockResolvedValue({ id: "qr1" }),
        },
      };

      mockWithRLSTransaction.mockImplementation(
        async (userId: any, callback: any) => {
          return await callback(mockTx);
        },
      );

      const result = await deleteQrCode("qr1");

      expect(result).toEqual({ id: "qr1" });
    });
  });

  describe("clearQrCodeHistory", () => {
    it("사용자의 모든 QR 코드를 삭제해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockWithAuthenticatedRLSTransaction =
        require("@/lib/rls-utils").withAuthenticatedRLSTransaction;

      mockAuth.mockResolvedValue({
        user: { id: "user1", email: "test@example.com" },
      });

      const mockTx = {
        qrCode: {
          deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
        },
      };

      mockWithAuthenticatedRLSTransaction.mockImplementation(
        async (session: any, callback: any) => {
          return await callback(mockTx);
        },
      );

      const result = await clearQrCodeHistory();

      expect(result).toEqual({
        success: true,
        message: "QR 코드 히스토리가 삭제되었습니다.",
        deletedCount: 5,
      });
    });
  });

  describe("getQrCodeStats", () => {
    it("QR 코드 통계를 반환해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockWithAuthenticatedRLSTransaction =
        require("@/lib/rls-utils").withAuthenticatedRLSTransaction;

      mockAuth.mockResolvedValue({
        user: { id: "user1", email: "test@example.com" },
      });

      const mockStats = {
        total: 10,
        byType: [
          { type: "URL", count: 5 },
          { type: "TEXTAREA", count: 3 },
          { type: "EMAIL", count: 2 },
        ],
        favorites: 3,
        recentCount: 5,
      };

      const mockTx = {
        qrCode: {
          count: jest.fn().mockResolvedValue(10),
          groupBy: jest.fn().mockResolvedValue([
            { type: "URL", _count: { _all: 5 } },
            { type: "TEXTAREA", _count: { _all: 3 } },
            { type: "EMAIL", _count: { _all: 2 } },
          ]),
        },
      };

      mockWithAuthenticatedRLSTransaction.mockImplementation(
        async (session: any, callback: any) => {
          return await callback(mockTx);
        },
      );

      const result = await getQrCodeStats();

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          total: 10,
        }),
      });
    });
  });
});
