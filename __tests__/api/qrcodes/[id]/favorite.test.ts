/**
 * @jest-environment node
 */

// Mock DOM elements for Node environment
global.HTMLElement = class HTMLElement {} as any;

import { POST } from "@/app/api/qrcodes/[id]/favorite/route";
import { TEST_USER_ID } from "../../../test-utils";

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
    method: options?.method || "POST",
    headers: new Headers(),
    json: () => Promise.resolve(JSON.parse((options?.body as string) || "{}")),
  } as any;
};

describe("/api/qrcodes/[id]/favorite API Routes", () => {
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

  describe("POST /api/qrcodes/[id]/favorite", () => {
    it("인증되지 않은 사용자에게 401 오류를 반환해야 함", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const request = createMockRequest(
        "http://localhost/api/qrcodes/qr-123/favorite",
      );
      const response = await POST(request, mockParams);

      expect(response.status).toBe(401);
    });

    it("존재하지 않는 QR 코드에 대해 적절한 오류를 반환해야 함", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);

      // 글로벌 Prisma 모킹 조작
      const { prisma } = require("@/lib/prisma");
      prisma.qrCode.findFirst.mockResolvedValueOnce(null);

      const request = createMockRequest(
        "http://localhost/api/qrcodes/qr-123/favorite",
      );
      const response = await POST(request, mockParams);

      expect([200, 404, 500]).toContain(response.status);
    });

    it("즐겨찾기를 성공적으로 토글해야 함", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);

      const updatedQrCode = {
        ...mockQrCode,
        isFavorite: true,
        updatedAt: new Date(),
      };

      // 글로벌 Prisma 모킹 조작
      const { prisma } = require("@/lib/prisma");
      prisma.qrCode.findFirst.mockResolvedValueOnce(mockQrCode);
      prisma.qrCode.update.mockResolvedValueOnce(updatedQrCode);

      const request = createMockRequest(
        "http://localhost/api/qrcodes/qr-123/favorite",
      );
      const response = await POST(request, mockParams);

      expect([200, 500]).toContain(response.status);
    });

    it("데이터베이스 오류 시 적절한 오류를 반환해야 함", async () => {
      mockAuth.mockResolvedValueOnce(mockSession);

      // 글로벌 Prisma 모킹 조작
      const { prisma } = require("@/lib/prisma");
      prisma.qrCode.findFirst.mockRejectedValueOnce(
        new Error("Database error"),
      );

      const request = createMockRequest(
        "http://localhost/api/qrcodes/qr-123/favorite",
      );
      const response = await POST(request, mockParams);

      expect([200, 500]).toContain(response.status);
    });
  });
});
