/**
 * @jest-environment node
 */

// Mock DOM elements for Node environment
global.HTMLElement = class HTMLElement {} as any;

import { GET } from "@/app/api/qrcodes/route";
import { TEST_USER_ID } from "../test-utils";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/api-logging", () => ({
  withAuthenticatedApiLogging: (handler: Function) => handler,
}));

// Mock NextRequest
const createMockRequest = (url: string) => {
  return {
    url,
    method: "GET",
    headers: new Headers(),
  } as any;
};

describe("QR Codes API", () => {
  const mockAuth = require("@/auth").auth;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/qrcodes", () => {
    it("인증되지 않은 요청에 대해 401을 반환해야 한다", async () => {
      mockAuth.mockResolvedValue(null);

      const request = createMockRequest("http://localhost:3000/api/qrcodes");
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("인증된 사용자의 QR 코드 목록을 반환해야 한다", async () => {
      const mockSession = {
        user: {
          id: TEST_USER_ID,
          email: "test@example.com",
        },
      };

      const mockQrCodes = [
        {
          id: "qr1",
          type: "URL",
          title: "Test QR",
          content: "https://example.com",
          settings: JSON.stringify({ width: 300 }),
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // 글로벌 Prisma 모킹 조작
      const { prisma } = require("@/lib/prisma");
      prisma.qrCode.findMany.mockResolvedValue(mockQrCodes);
      prisma.qrCode.count.mockResolvedValue(1);

      mockAuth.mockResolvedValue(mockSession);

      const request = createMockRequest("http://localhost:3000/api/qrcodes");
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it("검색 매개변수를 올바르게 처리해야 한다", async () => {
      const mockSession = {
        user: {
          id: TEST_USER_ID,
          email: "test@example.com",
        },
      };

      // 글로벌 Prisma 모킹 조작
      const { prisma } = require("@/lib/prisma");
      prisma.qrCode.findMany.mockResolvedValue([]);
      prisma.qrCode.count.mockResolvedValue(0);

      mockAuth.mockResolvedValue(mockSession);

      const request = createMockRequest(
        "http://localhost:3000/api/qrcodes?page=2&limit=5&search=test&type=URL&favorite=true&sortBy=title&sortOrder=asc",
      );
      const response = await GET(request);

      expect(prisma.qrCode.findMany).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_ID,
          OR: [
            { title: { contains: "test" } },
            { content: { contains: "test" } },
          ],
          type: "URL",
          isFavorite: true,
        },
        orderBy: {
          title: "asc",
        },
        skip: 5,
        take: 5,
        select: expect.any(Object),
      });
    });

    it("잘못된 페이지 번호에 대해 기본값을 사용해야 한다", async () => {
      const mockSession = {
        user: {
          id: TEST_USER_ID,
          email: "test@example.com",
        },
      };

      const { prisma } = require("@/lib/prisma");
      prisma.qrCode.findMany.mockResolvedValue([]);
      prisma.qrCode.count.mockResolvedValue(0);

      mockAuth.mockResolvedValue(mockSession);

      const request = createMockRequest(
        "http://localhost:3000/api/qrcodes?page=invalid&limit=invalid"
      );
      const response = await GET(request);

      expect(prisma.qrCode.findMany).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_ID,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: 0, // 기본값 page=1이므로 skip=0
        take: 10, // 기본값 limit=10
        select: expect.any(Object),
      });
    });

    it("매우 큰 페이지 번호에 대해 적절히 처리해야 한다", async () => {
      const mockSession = {
        user: {
          id: TEST_USER_ID,
          email: "test@example.com",
        },
      };

      const { prisma } = require("@/lib/prisma");
      prisma.qrCode.findMany.mockResolvedValue([]);
      prisma.qrCode.count.mockResolvedValue(0);

      mockAuth.mockResolvedValue(mockSession);

      const request = createMockRequest(
        "http://localhost:3000/api/qrcodes?page=999999&limit=1000"
      );
      const response = await GET(request);

      expect(prisma.qrCode.findMany).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_ID,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: 9999990, // (999999 - 1) * 10 (limit은 100으로 제한됨)
        take: 100, // limit 최대값
        select: expect.any(Object),
      });
    });

    it("데이터베이스 오류를 적절히 처리해야 한다", async () => {
      const mockSession = {
        user: {
          id: TEST_USER_ID,
          email: "test@example.com",
        },
      };

      const { prisma } = require("@/lib/prisma");
      prisma.qrCode.findMany.mockRejectedValue(new Error("Database error"));

      mockAuth.mockResolvedValue(mockSession);

      const request = createMockRequest("http://localhost:3000/api/qrcodes");
      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it("빈 결과에 대해 적절한 응답을 반환해야 한다", async () => {
      const mockSession = {
        user: {
          id: TEST_USER_ID,
          email: "test@example.com",
        },
      };

      const { prisma } = require("@/lib/prisma");
      prisma.qrCode.findMany.mockResolvedValue([]);
      prisma.qrCode.count.mockResolvedValue(0);

      mockAuth.mockResolvedValue(mockSession);

      const request = createMockRequest("http://localhost:3000/api/qrcodes");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toEqual([]);
      expect(data.pagination.total).toBe(0);
      expect(data.pagination.totalPages).toBe(0);
    });

    it("잘못된 정렬 옵션에 대해 기본값을 사용해야 한다", async () => {
      const mockSession = {
        user: {
          id: TEST_USER_ID,
          email: "test@example.com",
        },
      };

      const { prisma } = require("@/lib/prisma");
      prisma.qrCode.findMany.mockResolvedValue([]);
      prisma.qrCode.count.mockResolvedValue(0);

      mockAuth.mockResolvedValue(mockSession);

      const request = createMockRequest(
        "http://localhost:3000/api/qrcodes?sortBy=invalid&sortOrder=invalid"
      );
      const response = await GET(request);

      expect(prisma.qrCode.findMany).toHaveBeenCalledWith({
        where: {
          userId: TEST_USER_ID,
        },
        orderBy: {
          createdAt: "desc", // 기본값
        },
        skip: 0,
        take: 10,
        select: expect.any(Object),
      });
    });
  });
});
