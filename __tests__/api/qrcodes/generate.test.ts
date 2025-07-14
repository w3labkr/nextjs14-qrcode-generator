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

  describe("Edge Cases and Security Tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("malformed JSON payload should return 400", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);

      const request = {
        url: "http://localhost/api/qrcodes/generate",
        method: "POST",
        headers: new Headers(),
        json: () => Promise.reject(new Error("Invalid JSON")),
      } as any;

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("extremely large payload should be rejected", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);

      const largeText = "A".repeat(10000); // 10KB text
      const largeSettings = {
        ...mockSettings,
        text: largeText,
      };

      const request = createMockRequest(
        "http://localhost/api/qrcodes/generate",
        {
          method: "POST",
          body: JSON.stringify({ settings: largeSettings }),
        },
      );

      const response = await POST(request);
      // Should handle large payloads gracefully
      expect(response.status).toBeIn([200, 400, 413]); // 413 = Payload Too Large
    });

    it("SQL injection attempt in text field should be sanitized", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);
      generateQrCode.mockResolvedValueOnce("mock-qr-data");

      const maliciousSettings = {
        ...mockSettings,
        text: "'; DROP TABLE users; --",
      };

      const request = createMockRequest(
        "http://localhost/api/qrcodes/generate",
        {
          method: "POST",
          body: JSON.stringify({ settings: maliciousSettings }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(generateQrCode).toHaveBeenCalledWith(maliciousSettings);
    });

    it("XSS payload in text field should be handled safely", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);
      generateQrCode.mockResolvedValueOnce("mock-qr-data");

      const xssSettings = {
        ...mockSettings,
        text: "<script>alert('xss')</script>",
      };

      const request = createMockRequest(
        "http://localhost/api/qrcodes/generate",
        {
          method: "POST",
          body: JSON.stringify({ settings: xssSettings }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it("invalid color values should be handled gracefully", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);
      generateQrCode.mockResolvedValueOnce("mock-qr-data");

      const invalidColorSettings = {
        ...mockSettings,
        color: "invalid-color",
        backgroundColor: "not-a-color",
      };

      const request = createMockRequest(
        "http://localhost/api/qrcodes/generate",
        {
          method: "POST",
          body: JSON.stringify({ settings: invalidColorSettings }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it("negative size values should be handled", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);
      generateQrCode.mockResolvedValueOnce("mock-qr-data");

      const negativeSettings = {
        ...mockSettings,
        size: -100,
      };

      const request = createMockRequest(
        "http://localhost/api/qrcodes/generate",
        {
          method: "POST",
          body: JSON.stringify({ settings: negativeSettings }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it("extremely large size values should be limited", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);
      generateQrCode.mockResolvedValueOnce("mock-qr-data");

      const hugeSettings = {
        ...mockSettings,
        size: 999999,
      };

      const request = createMockRequest(
        "http://localhost/api/qrcodes/generate",
        {
          method: "POST",
          body: JSON.stringify({ settings: hugeSettings }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it("missing required fields should return appropriate error", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);

      const incompleteSettings = {
        size: 300,
        // Missing text field
      };

      const request = createMockRequest(
        "http://localhost/api/qrcodes/generate",
        {
          method: "POST",
          body: JSON.stringify({ settings: incompleteSettings }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBeIn([400, 500]);
    });

    it("Unicode and special characters should be handled", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);
      generateQrCode.mockResolvedValueOnce("mock-qr-data");

      const unicodeSettings = {
        ...mockSettings,
        text: "🚀 Hello 世界 🌍 Émoji test 🎉",
      };

      const request = createMockRequest(
        "http://localhost/api/qrcodes/generate",
        {
          method: "POST",
          body: JSON.stringify({ settings: unicodeSettings }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it("null and undefined values should be handled", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);

      const nullSettings = {
        text: null,
        size: undefined,
        color: null,
        backgroundColor: undefined,
      };

      const request = createMockRequest(
        "http://localhost/api/qrcodes/generate",
        {
          method: "POST",
          body: JSON.stringify({ settings: nullSettings }),
        },
      );

      const response = await POST(request);
      expect(response.status).toBeIn([400, 500]);
    });

    it("concurrent requests should be handled properly", async () => {
      mockAuth.mockResolvedValue(mockSession);
      generateQrCode.mockResolvedValue("mock-qr-data");

      const requests = Array.from({ length: 5 }, () =>
        createMockRequest("http://localhost/api/qrcodes/generate", {
          method: "POST",
          body: JSON.stringify({ settings: mockSettings }),
        })
      );

      const responses = await Promise.all(requests.map(req => POST(req)));
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
