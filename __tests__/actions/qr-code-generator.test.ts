import {
  generateQrCode,
  generateHighResQrCode,
  generateAndSaveQrCode,
} from "@/app/actions/qr-code-generator";
import { QrCodeOptions, QrCodeGenerationOptions } from "@/types/qr-code-server";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/rls-utils", () => ({
  withAuthenticatedRLSTransaction: jest.fn(),
  withoutRLS: jest.fn(),
}));

jest.mock("@/lib/unified-logging", () => ({
  UnifiedLogger: {
    logError: jest.fn().mockResolvedValue(undefined),
    logQrGeneration: jest.fn().mockResolvedValue(undefined),
  },
  inferQrType: jest.fn(),
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

jest.mock("qrcode", () => ({
  toDataURL: jest.fn(() =>
    Promise.resolve("data:image/png;base64,mock-qr-code"),
  ),
  toString: jest.fn(() => Promise.resolve("<svg>mock-svg</svg>")),
}));

describe("QR Code Generator Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateQrCode", () => {
    it("기본 QR 코드를 생성해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: "user1", email: "test@example.com" },
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

      expect(result).toBe("data:image/png;base64,mock-qr-code");
    });

    it("빈 텍스트의 경우 에러를 발생시켜야 한다", async () => {
      const options: QrCodeOptions = {
        text: "",
        type: "png",
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
        user: { id: "user1", email: "test@example.com" },
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

      expect(result).toBe("<svg>mock-svg</svg>");
    });

    it("커스텀 색상을 적용해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: "user1", email: "test@example.com" },
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
          dark: "#ff0000",
          light: "#ffffff",
        },
      };

      const result = await generateQrCode(options);

      expect(result).toBe("data:image/png;base64,mock-qr-code");
    });
  });

  describe("generateHighResQrCode", () => {
    it("고해상도 QR 코드를 생성해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;

      mockAuth.mockResolvedValue({
        user: { id: "user1", email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      const options: QrCodeOptions = {
        text: "https://example.com",
        type: "png",
        width: 2048,
      };

      const result = await generateHighResQrCode(options);

      expect(result).toBe("data:image/png;base64,mock-qr-code");
    });
  });

  describe("generateAndSaveQrCode", () => {
    it("QR 코드를 생성하고 저장해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockWithAuthenticatedRLSTransaction =
        require("@/lib/rls-utils").withAuthenticatedRLSTransaction;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: "user1", email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("url");

      const mockTx = {
        user: {
          findFirst: jest.fn().mockResolvedValue({ id: "user1" }),
        },
        qrCode: {
          create: jest.fn().mockResolvedValue({
            id: "qr1",
            content: "https://example.com",
            type: "url",
          }),
        },
      };

      mockWithAuthenticatedRLSTransaction.mockImplementation(
        async (session: any, callback: any) => {
          return await callback(mockTx);
        },
      );

      const options: QrCodeGenerationOptions = {
        text: "https://example.com",
        type: "png",
        qrType: "URL",
        title: "Test QR",
      };

      const result = await generateAndSaveQrCode(options);

      expect(result).toEqual({
        qrCodeDataUrl: "data:image/png;base64,mock-qr-code",
        savedId: "qr1",
      });
    });

    it("로그인하지 않은 사용자의 경우 저장하지 않고 QR 코드만 생성해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue(null);

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("url");

      const options: QrCodeGenerationOptions = {
        text: "https://example.com",
        type: "png",
        qrType: "URL",
      };

      const result = await generateAndSaveQrCode(options);

      expect(result).toEqual({
        qrCodeDataUrl: "data:image/png;base64,mock-qr-code",
        savedId: null,
      });
    });
  });
});
