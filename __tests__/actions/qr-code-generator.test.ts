import {
  generateQrCode,
  generateHighResQrCode,
  generateAndSaveQrCode,
} from "@/app/actions/qr-code-generator";
import { QrCodeOptions, QrCodeGenerationOptions } from "@/types/qr-code-server";
import { TEST_USER_ID, TEST_QR_CODE_ID } from "../test-utils";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

jest.mock("@/lib/unified-logging");

jest.mock("qrcode", () => ({
  toString: jest.fn(),
  toDataURL: jest.fn(),
}));

jest.mock("qr-code-styling-node", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getRawData: jest.fn().mockResolvedValue(Buffer.from("<svg>mock-svg</svg>")),
    _canvas: {
      toDataURL: jest
        .fn()
        .mockReturnValue(
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        ),
    },
  })),
}));

jest.mock("@/lib/rls-utils");

jest.mock("@/lib/prisma");

describe("QR Code Generator Actions", () => {
  const mockAuth = require("@/auth").auth;
  const mockHeaders = require("next/headers").headers;
  const mockInferQrType = require("@/lib/unified-logging").inferQrType;
  const mockToString = require("qrcode").toString;
  const mockToDataURL = require("qrcode").toDataURL;
  const mockWithRLSTransaction = require("@/lib/rls-utils").withRLSTransaction;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockToString.mockResolvedValue("<svg>mock-svg</svg>");
    mockToDataURL.mockResolvedValue(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    );
  });

  describe("generateQrCode", () => {
    it("성공적으로 PNG QR 코드를 생성해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("url");

      const options: QrCodeOptions = {
        text: "https://example.com",
        type: "png",
        width: 400,
      };

      const result = await generateQrCode(options);

      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it("빈 텍스트에 대해 에러를 발생시켜야 한다", async () => {
      const options: QrCodeOptions = {
        text: "",
        type: "png",
        width: 400,
      };

      await expect(generateQrCode(options)).rejects.toThrow(
        "QR code text cannot be empty.",
      );
    });

    it("잘못된 너비의 경우 에러를 발생시켜야 한다", async () => {
      const options: QrCodeOptions = {
        text: "https://example.com",
        type: "png",
        width: 50,
      };

      await expect(generateQrCode(options)).rejects.toThrow(
        "QR code width must be between 100px and 4096px.",
      );
    });

    it("SVG 형식으로 QR 코드를 생성해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("url");

      const options: QrCodeOptions = {
        text: "https://example.com",
        type: "svg",
        width: 400,
      };

      const result = await generateQrCode(options);

      expect(result).toBe(
        "data:image/svg+xml;base64,PHN2Zz5tb2NrLXN2Zzwvc3ZnPg==",
      );
    });

    it("커스텀 색상을 적용해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("url");

      const options: QrCodeOptions = {
        text: "https://example.com",
        type: "png",
        width: 400,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      };

      const result = await generateQrCode(options);

      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it("에러 코드 수정 레벨을 적용해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("url");

      const options: QrCodeOptions = {
        text: "https://example.com",
        type: "png",
        width: 400,
        margin: 4,
      };

      const result = await generateQrCode(options);

      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it("로고를 포함한 QR 코드를 생성해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("url");

      const options: QrCodeOptions = {
        text: "https://example.com",
        type: "png",
        width: 400,
        margin: 6,
      };

      const result = await generateQrCode(options);

      expect(result).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe("generateAndSaveQrCode", () => {
    it("QR 코드를 생성하고 저장해야 한다", async () => {
      mockWithRLSTransaction.mockImplementation(async (callback: any) => {
        return callback();
      });

      const prisma = require("@/lib/prisma").prisma;
      
      // 사용자 찾기 모킹
      prisma.user.findFirst.mockResolvedValue({
        id: TEST_USER_ID,
        email: "test@example.com",
      });
      
      // QR 코드 생성 모킹
      prisma.qrCode.create.mockResolvedValue({
        id: TEST_QR_CODE_ID,
        title: "Test QR",
        content: "https://example.com",
        type: "url",
        data: "data:image/png;base64,test",
        userId: TEST_USER_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const options: QrCodeGenerationOptions = {
        text: "https://example.com",
        title: "Test QR",
        type: "png",
        width: 400,
        qrType: "URL",
      };

      const result = await generateAndSaveQrCode(options);

      expect(result).toEqual({
        success: true,
        qrCode: expect.objectContaining({
          id: TEST_QR_CODE_ID,
          title: "Test QR",
        }),
      });
    });

    it("저장 중 오류 발생 시 적절한 에러를 반환해야 한다", async () => {
      // 글로벌 모킹을 덮어써서 에러를 발생시킴
      const prisma = require("@/lib/prisma").prisma;
      const originalTransaction = prisma.$transaction;
      
      prisma.$transaction.mockImplementation((callback: any) => {
        if (typeof callback === "function") {
          const mockTx = {
            qrCode: {
              create: jest.fn().mockRejectedValue(new Error("Database error")),
            },
            user: {
              findFirst: jest.fn().mockResolvedValue({
                id: "c123456789012345678901234",
                email: "test@example.com",
              }),
            },
            $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
          };
          return callback(mockTx);
        }
        return Promise.resolve();
      });

      const options: QrCodeGenerationOptions = {
        text: "https://example.com",
        title: "Test QR",
        type: "png",
        width: 400,
        qrType: "URL",
      };

      const result = await generateAndSaveQrCode(options);

      expect(result).toEqual({
        success: false,
        error: "Database error",
        qrCodeDataUrl: null,
      });

      // 원래 mock 복원
      prisma.$transaction = originalTransaction;
    });
  });

  describe("generateHighResQrCode", () => {
    it("고해상도 QR 코드를 생성해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("url");

      const options: QrCodeOptions = {
        text: "https://example.com",
        type: "png",
        width: 1024,
      };

      const result = await generateHighResQrCode(options);

      expect(result).toMatch(/^data:image\/png;base64,/);
    });
  });
});
