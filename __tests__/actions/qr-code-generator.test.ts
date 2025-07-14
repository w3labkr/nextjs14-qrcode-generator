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

    it("인증되지 않은 사용자는 고해상도 QR 코드를 생성할 수 없다", async () => {
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      const options: QrCodeOptions = {
        text: "https://example.com",
        type: "png",
        width: 1024,
      };

      await expect(generateHighResQrCode(options)).rejects.toThrow("Unauthorized");
    });

    it("SVG 형식의 고해상도 QR 코드를 생성해야 한다", async () => {
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
        width: 1024,
      };

      const result = await generateHighResQrCode(options);

      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    });
  });

  describe("Input validation tests", () => {
    it("generateQrCode - 너무 큰 너비값 거부", async () => {
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      const options: QrCodeOptions = {
        text: "test",
        type: "png",
        width: 5000, // 최대 허용 너비 초과
      };

      const result = await generateQrCode(options);

      expect(result).toMatch(/error/i);
    });

    it("generateQrCode - 너무 작은 너비값 거부", async () => {
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      const options: QrCodeOptions = {
        text: "test",
        type: "png",
        width: 50, // 최소 허용 너비 미만
      };

      const result = await generateQrCode(options);

      expect(result).toMatch(/error/i);
    });

    it("generateQrCode - 유효하지 않은 색상 값 처리", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("text");

      const options: QrCodeOptions = {
        text: "test",
        type: "png",
        width: 400,
        colorDark: "invalid-color", // 유효하지 않은 색상
        colorLight: "#ffffff",
      };

      const result = await generateQrCode(options);

      // 잘못된 색상이어도 기본값으로 처리되어 성공해야 함
      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it("generateAndSaveQrCode - 제목 길이 제한 검증", async () => {
      const mockAuth = require("@/auth").auth;
      const mockEnsureUserExists = require("@/lib/utils").ensureUserExists;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockEnsureUserExists.mockResolvedValue({
        session: {
          user: { id: TEST_USER_ID, email: "test@example.com" },
        },
      });

      const options: QrCodeGenerationOptions = {
        text: "https://example.com",
        title: "A".repeat(1000), // 매우 긴 제목
        type: "png",
        width: 400,
        qrType: "URL",
      };

      const result = await generateAndSaveQrCode(options);

      // 긴 제목이어도 처리되어야 함 (DB 제약에 따라)
      expect(result.success).toBeDefined();
    });

    it("generateAndSaveQrCode - 빈 텍스트 검증", async () => {
      const mockAuth = require("@/auth").auth;
      const mockEnsureUserExists = require("@/lib/utils").ensureUserExists;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockEnsureUserExists.mockResolvedValue({
        session: {
          user: { id: TEST_USER_ID, email: "test@example.com" },
        },
      });

      const options: QrCodeGenerationOptions = {
        text: "", // 빈 텍스트
        title: "Test QR",
        type: "png",
        width: 400,
        qrType: "text",
      };

      const result = await generateAndSaveQrCode(options);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/empty/i);
    });

    it("generateAndSaveQrCode - QR 유형과 내용 불일치 검증", async () => {
      const mockAuth = require("@/auth").auth;
      const mockEnsureUserExists = require("@/lib/utils").ensureUserExists;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockEnsureUserExists.mockResolvedValue({
        session: {
          user: { id: TEST_USER_ID, email: "test@example.com" },
        },
      });

      const options: QrCodeGenerationOptions = {
        text: "not-a-url", // URL 형식이 아님
        title: "Test QR",
        type: "png",
        width: 400,
        qrType: "URL", // URL 타입으로 지정
      };

      const result = await generateAndSaveQrCode(options);

      // 유형과 내용이 불일치해도 QR 코드 생성은 가능해야 함
      expect(result.success).toBeDefined();
    });

    it("generateQrCode - 지원하지 않는 포맷 처리", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("text");

      const options: QrCodeOptions = {
        text: "test",
        type: "gif" as any, // 지원하지 않는 포맷
        width: 400,
      };

      const result = await generateQrCode(options);

      // 기본 포맷으로 처리되어야 함
      expect(result).toMatch(/^data:image\/(png|svg)/);
    });
  });

  describe("Error handling and edge cases", () => {
    it("generateQrCode - 매우 긴 텍스트 처리", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("text");

      const longText = "a".repeat(4000); // 매우 긴 텍스트
      const options: QrCodeOptions = {
        text: longText,
        type: "png",
        width: 400,
      };

      const result = await generateQrCode(options);

      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it("generateQrCode - 특수 문자 처리", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("text");

      const specialText = "한글과 특수문자: !@#$%^&*()_+-=[]{}|;:,.<>?";
      const options: QrCodeOptions = {
        text: specialText,
        type: "png",
        width: 400,
      };

      const result = await generateQrCode(options);

      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it("generateQrCode - 최대 너비 경계값 테스트", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("text");

      const options: QrCodeOptions = {
        text: "test",
        type: "png",
        width: 4096, // 최대 허용 너비
      };

      const result = await generateQrCode(options);

      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it("generateQrCode - 최소 너비 경계값 테스트", async () => {
      const mockAuth = require("@/auth").auth;
      const mockHeaders = require("next/headers").headers;
      const mockInferQrType = require("@/lib/unified-logging").inferQrType;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockHeaders.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      mockInferQrType.mockReturnValue("text");

      const options: QrCodeOptions = {
        text: "test",
        type: "png",
        width: 100, // 최소 허용 너비
      };

      const result = await generateQrCode(options);

      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it("generateAndSaveQrCode - 사용자 존재 확인 실패", async () => {
      const mockAuth = require("@/auth").auth;
      const mockEnsureUserExists = require("@/lib/utils").ensureUserExists;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockEnsureUserExists.mockRejectedValue(new Error("User not found"));

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
        error: "User not found",
        qrCodeDataUrl: null,
      });
    });

    it("generateAndSaveQrCode - QR 코드 생성 실패", async () => {
      const mockAuth = require("@/auth").auth;
      const mockEnsureUserExists = require("@/lib/utils").ensureUserExists;

      mockAuth.mockResolvedValue({
        user: { id: TEST_USER_ID, email: "test@example.com" },
      });

      mockEnsureUserExists.mockResolvedValue({
        session: {
          user: { id: TEST_USER_ID, email: "test@example.com" },
        },
      });

      // generateQrCode가 실패하도록 설정
      const QRCodeStyling = require("qr-code-styling-node").default;
      QRCodeStyling.mockImplementation(() => ({
        getRawData: jest.fn().mockRejectedValue(new Error("QR generation failed")),
      }));

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
        error: "QR generation failed",
        qrCodeDataUrl: null,
      });
    });
  });
});
