import { NextRequest } from "next/server";
import { GET } from "@/app/api/qrcodes/route";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/rls-utils", () => ({
  withAuthenticatedRLS: jest.fn(),
}));

jest.mock("@/lib/api-logging", () => ({
  withAuthenticatedApiLogging: jest.fn((handler) => handler),
}));

// Mock Request
const mockRequest = (method: string, searchParams?: Record<string, string>) => {
  const url = new URL("http://localhost:3000/api/qrcodes");
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const request = {
    method,
    url: url.toString(),
    nextUrl: url,
    headers: new Headers(),
  } as unknown as NextRequest;

  return request;
};

describe("/api/qrcodes API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/qrcodes", () => {
    it("인증된 사용자의 QR 코드 목록을 반환해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockWithAuthenticatedRLS =
        require("@/lib/rls-utils").withAuthenticatedRLS;

      mockAuth.mockResolvedValue({
        user: { id: "user1", email: "test@example.com" },
      });

      const mockQrCodes = [
        {
          id: "qr1",
          title: "Test QR",
          content: "https://example.com",
          type: "URL",
          createdAt: new Date("2024-01-01"),
        },
      ];

      const mockPrisma = {
        qrCode: {
          findMany: jest.fn().mockResolvedValue(mockQrCodes),
          count: jest.fn().mockResolvedValue(1),
        },
      };

      mockWithAuthenticatedRLS.mockResolvedValue(mockPrisma);

      const request = mockRequest("GET", { page: "1", limit: "10" });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockQrCodes);
    });

    it("인증되지 않은 사용자의 경우 401을 반환해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      mockAuth.mockResolvedValue(null);

      const request = mockRequest("GET");
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("검색 파라미터로 필터링해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockWithAuthenticatedRLS =
        require("@/lib/rls-utils").withAuthenticatedRLS;

      mockAuth.mockResolvedValue({
        user: { id: "user1", email: "test@example.com" },
      });

      const mockQrCodes = [
        {
          id: "qr1",
          title: "Example QR",
          content: "https://example.com",
          type: "URL",
        },
      ];

      const mockPrisma = {
        qrCode: {
          findMany: jest.fn().mockResolvedValue(mockQrCodes),
          count: jest.fn().mockResolvedValue(1),
        },
      };

      mockWithAuthenticatedRLS.mockResolvedValue(mockPrisma);

      const request = mockRequest("GET", {
        page: "1",
        limit: "10",
        search: "example",
        type: "URL",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.qrCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { title: { contains: "example", mode: "insensitive" } },
                  { content: { contains: "example", mode: "insensitive" } },
                ]),
              }),
              { type: "URL" },
            ]),
          }),
        }),
      );
    });

    it("페이지네이션이 올바르게 작동해야 한다", async () => {
      const mockAuth = require("@/auth").auth;
      const mockWithAuthenticatedRLS =
        require("@/lib/rls-utils").withAuthenticatedRLS;

      mockAuth.mockResolvedValue({
        user: { id: "user1", email: "test@example.com" },
      });

      const mockQrCodes = Array.from({ length: 5 }, (_, i) => ({
        id: `qr${i + 1}`,
        title: `QR ${i + 1}`,
        content: `content${i + 1}`,
        type: "URL",
      }));

      const mockPrisma = {
        qrCode: {
          findMany: jest.fn().mockResolvedValue(mockQrCodes),
          count: jest.fn().mockResolvedValue(25),
        },
      };

      mockWithAuthenticatedRLS.mockResolvedValue(mockPrisma);

      const request = mockRequest("GET", { page: "2", limit: "5" });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination).toEqual({
        currentPage: 2,
        totalPages: 5,
        totalItems: 25,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });
  });
});
