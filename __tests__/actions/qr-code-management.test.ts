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

// Mock prisma first
jest.mock("@/lib/prisma", () => ({
  prisma: {
    $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
    qrCode: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(0),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    },
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $transaction: jest.fn().mockImplementation((callback) => {
      if (typeof callback === "function") {
        const mockTx = {
          qrCode: {
            findMany: jest.fn().mockResolvedValue([]),
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({}),
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            count: jest.fn().mockResolvedValue(0),
            groupBy: jest.fn().mockResolvedValue([]),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
          },
          $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
        };
        return callback(mockTx);
      }
      return Promise.resolve();
    }),
  },
}));

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/rls-utils", () => ({
  withRLS: jest.fn(),
  withRLSTransaction: jest.fn(),
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
      groupBy: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe("QR Code Management Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // 모든 테스트에서 기본적인 인증된 사용자 설정
    const mockAuth = require("@/auth").auth;
    mockAuth.mockResolvedValue({
      user: { id: TEST_USER_ID, email: "test@example.com" },
    });

    // Mock withRLS to return a mock prisma client
    const mockWithRLS = require("@/lib/rls-utils").withRLS;
    mockWithRLS.mockImplementation(async (userId: string) => {
      return {
        qrCode: {
          findMany: jest.fn().mockResolvedValue([
            {
              id: "qr1",
              title: "Test QR 1",
              content: "https://example.com",
              type: "URL",
              createdAt: new Date("2024-01-01"),
              isFavorite: false,
            },
          ]),
          count: jest.fn().mockResolvedValue(1),
          update: jest.fn().mockResolvedValue({
            id: "qr1",
            isFavorite: true,
          }),
          delete: jest.fn().mockResolvedValue({ id: "qr1" }),
          groupBy: jest.fn().mockResolvedValue([
            { type: "URL", _count: { _all: 5 } },
            { type: "TEXTAREA", _count: { _all: 3 } },
            { type: "EMAIL", _count: { _all: 2 } },
          ]),
        },
      };
    });

    // Mock withRLSTransaction 
    const mockWithRLSTransaction = require("@/lib/rls-utils").withRLSTransaction;
    mockWithRLSTransaction.mockImplementation(async (userId: string, callback: any) => {
      const mockTx = {
        qrCode: {
          findFirst: jest.fn().mockResolvedValue({ id: "qr1", isFavorite: false }),
          update: jest.fn().mockResolvedValue({ id: "qr1", isFavorite: true }),
          delete: jest.fn().mockResolvedValue({ id: "qr1" }),
        },
      };
      return await callback(mockTx);
    });

    // Mock withAuthenticatedRLSTransaction
    const mockWithAuthenticatedRLSTransaction = require("@/lib/rls-utils").withAuthenticatedRLSTransaction;
    mockWithAuthenticatedRLSTransaction.mockImplementation(async (session: any, callback: any) => {
      const mockTx = {
        qrCode: {
          deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
          count: jest.fn().mockResolvedValue(10),
          groupBy: jest.fn().mockResolvedValue([
            { type: "URL", _count: { _all: 5 } },
            { type: "TEXTAREA", _count: { _all: 3 } },
            { type: "EMAIL", _count: { _all: 2 } },
          ]),
        },
      };
      return await callback(mockTx);
    });
  });

  describe("getUserQrCodes", () => {
    it("인증된 사용자의 QR 코드 목록을 반환해야 한다", async () => {
      const result = await getUserQrCodes(1, 10);

      expect(result).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: "qr1",
            title: "Test QR 1",
            content: "https://example.com",
            type: "URL",
          }),
        ]),
        pagination: expect.objectContaining({
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }),
      });
    });
  });

  describe("toggleQrCodeFavorite", () => {
    it("QR 코드 즐겨찾기 상태를 토글해야 한다", async () => {
      const result = await toggleQrCodeFavorite("qr1");

      expect(result.id).toBe("qr1");
    });
  });

  describe("deleteQrCode", () => {
    it("QR 코드를 삭제해야 한다", async () => {
      const result = await deleteQrCode("qr1");

      expect(result).toEqual({ id: "qr1" });
    });
  });

  describe("clearQrCodeHistory", () => {
    it("사용자의 모든 QR 코드를 삭제해야 한다", async () => {
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
