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

jest.mock("@/lib/rls-utils", () => ({
  withAuthenticatedRLS: jest.fn(),
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
  const mockWithAuthenticatedRLS = require("@/lib/rls-utils").withAuthenticatedRLS;

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

      const mockDb = {
        qrCode: {
          findMany: jest.fn().mockResolvedValue(mockQrCodes),
          count: jest.fn().mockResolvedValue(1),
        },
      };

      mockAuth.mockResolvedValue(mockSession);
      mockWithAuthenticatedRLS.mockResolvedValue(mockDb);

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

      const mockDb = {
        qrCode: {
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
      };

      mockAuth.mockResolvedValue(mockSession);
      mockWithAuthenticatedRLS.mockResolvedValue(mockDb);

      const request = createMockRequest(
        "http://localhost:3000/api/qrcodes?page=2&limit=5&search=test&type=URL&favorite=true&sortBy=title&sortOrder=asc"
      );
      const response = await GET(request);

      expect(mockDb.qrCode.findMany).toHaveBeenCalledWith({
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
  });
});
