/**
 * @jest-environment node
 */

// Mock DOM elements for Node environment
global.HTMLElement = class HTMLElement {} as any;

import { POST } from "@/app/api/qrcodes/generate/route";
import { TEST_USER_ID } from "../../test-utils";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/api-logging", () => ({
  withAuthenticatedApiLogging: (handler: Function) => handler,
}));

jest.mock("@/app/actions/qr-code-generator", () => ({
  generateQrCode: jest.fn(),
}));

// Mock NextRequest
const createMockRequest = (url: string, options?: RequestInit) => {
  return {
    url,
    method: options?.method || "POST",
    headers: new Headers(),
    json: () => Promise.resolve(JSON.parse((options?.body as string) || "{}")),
  } as any;
};

describe("/api/qrcodes/generate API Routes", () => {
  const mockAuth = require("@/auth").auth;
  const { generateQrCode } = require("@/app/actions/qr-code-generator");

  const mockSession = {
    user: {
      id: TEST_USER_ID,
      email: "test@example.com",
    },
  };

  const mockSettings = {
    text: "https://example.com",
    size: 300,
    color: "#000000",
    backgroundColor: "#FFFFFF",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/qrcodes/generate", () => {
    it("인증되지 않은 사용자에게 401 오류를 반환해야 함", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const request = createMockRequest(
        "http://localhost/api/qrcodes/generate",
        {
          method: "POST",
          body: JSON.stringify({ settings: mockSettings }),
        },
      );
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it("settings가 없는 경우 400 오류를 반환해야 함", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);

      const request = createMockRequest(
        "http://localhost/api/qrcodes/generate",
        {
          method: "POST",
          body: JSON.stringify({}),
        },
      );
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("QR 코드를 성공적으로 생성해야 함", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);
      generateQrCode.mockResolvedValueOnce(
        "data:image/png;base64,mockbase64data",
      );

      const request = createMockRequest(
        "http://localhost/api/qrcodes/generate",
        {
          method: "POST",
          body: JSON.stringify({ settings: mockSettings }),
        },
      );
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(generateQrCode).toHaveBeenCalledWith(mockSettings);
    });

    it("QR 코드 생성 실패 시 500 오류를 반환해야 함", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);
      generateQrCode.mockRejectedValueOnce(new Error("Generation failed"));

      const request = createMockRequest(
        "http://localhost/api/qrcodes/generate",
        {
          method: "POST",
          body: JSON.stringify({ settings: mockSettings }),
        },
      );
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
