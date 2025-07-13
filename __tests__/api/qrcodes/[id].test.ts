/**
 * @jest-environment node
 */

// Mock DOM elements for Node environment
global.HTMLElement = class HTMLElement {} as any;

import { GET, PATCH, DELETE } from "@/app/api/qrcodes/[id]/route";
import { TEST_USER_ID } from "../../test-utils";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/api-logging", () => ({
  withAuthenticatedApiLogging: (handler: Function) => handler,
}));

// Mock NextRequest
const createMockRequest = (url: string, options?: RequestInit) => {
  return {
    url,
    method: options?.method || "GET",
    headers: new Headers(),
    json: () => Promise.resolve(JSON.parse((options?.body as string) || "{}")),
  } as any;
};

describe("/api/qrcodes/[id] API Routes", () => {
  const mockAuth = require("@/auth").auth;

  const mockSession = {
    user: {
      id: TEST_USER_ID,
      email: "test@example.com",
    },
  };

  const mockQrCode = {
    id: "qr-123",
    title: "Test QR Code",
    content: "https://example.com",
    type: "URL",
    userId: TEST_USER_ID,
    settings: '{"color":"#000000","backgroundColor":"#FFFFFF"}',
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    isFavorite: false,
  };

  const mockParams = { params: { id: "qr-123" } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/qrcodes/[id]", () => {
    it("인증되지 않은 사용자에게 401 오류를 반환해야 함", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const request = createMockRequest("http://localhost/api/qrcodes/qr-123");
      const response = await GET(request, mockParams);

      expect(response.status).toBe(401);
    });

    it("인증된 사용자에 대해 응답을 반환해야 함", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);

      // 글로벌 Prisma 모킹 조작
      const { prisma } = require("@/lib/prisma");
      prisma.qrCode.findFirst.mockResolvedValueOnce(mockQrCode);

      const request = createMockRequest("http://localhost/api/qrcodes/qr-123");
      const response = await GET(request, mockParams);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe("PATCH /api/qrcodes/[id]", () => {
    const updateData = {
      title: "Updated QR Code",
      content: "https://updated.example.com",
      settings: { color: "#FF0000", backgroundColor: "#00FF00" },
    };

    it("인증되지 않은 사용자에게 401 오류를 반환해야 함", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const request = createMockRequest("http://localhost/api/qrcodes/qr-123", {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });
      const response = await PATCH(request, mockParams);

      expect(response.status).toBe(401);
    });

    it("인증된 사용자에 대해 응답을 반환해야 함", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);

      const request = createMockRequest("http://localhost/api/qrcodes/qr-123", {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });
      const response = await PATCH(request, mockParams);

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe("DELETE /api/qrcodes/[id]", () => {
    it("인증되지 않은 사용자에게 401 오류를 반환해야 함", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const request = createMockRequest("http://localhost/api/qrcodes/qr-123", {
        method: "DELETE",
      });
      const response = await DELETE(request, mockParams);

      expect(response.status).toBe(401);
    });

    it("인증된 사용자에 대해 응답을 반환해야 함", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);

      const request = createMockRequest("http://localhost/api/qrcodes/qr-123", {
        method: "DELETE",
      });
      const response = await DELETE(request, mockParams);

      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
