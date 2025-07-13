/**
 * @jest-environment node
 */

import { GET } from "@/app/api/cron/keep-alive/route";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      count: jest.fn(),
    },
  },
}));

jest.mock("@/lib/api-logging", () => ({
  withApiLogging: (handler: Function) => handler,
}));

// Mock NextRequest
const createMockRequest = (url: string, headers: Record<string, string> = {}) => {
  return {
    url,
    method: "GET",
    headers: {
      get: jest.fn((name: string) => headers[name] || null),
    },
  } as any;
};

describe("/api/cron/keep-alive", () => {
  const { prisma } = require("@/lib/prisma");
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock for environment variable
    process.env.CRON_SECRET = "test-cron-secret";
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  describe("GET", () => {
    it("should return 401 when no authorization header", async () => {
      const request = createMockRequest("http://localhost:3000/api/cron/keep-alive");
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("should return 401 when invalid authorization header", async () => {
      const request = createMockRequest("http://localhost:3000/api/cron/keep-alive", {
        authorization: "Bearer invalid-secret",
      });
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("should return 200 and user count when authorized", async () => {
      prisma.user.count.mockResolvedValueOnce(42);

      const request = createMockRequest("http://localhost:3000/api/cron/keep-alive", {
        authorization: "Bearer test-cron-secret",
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.user.count).toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      prisma.user.count.mockRejectedValueOnce(new Error("Database error"));

      const request = createMockRequest("http://localhost:3000/api/cron/keep-alive", {
        authorization: "Bearer test-cron-secret",
      });
      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it("should handle missing CRON_SECRET environment variable", async () => {
      delete process.env.CRON_SECRET;

      const request = createMockRequest("http://localhost:3000/api/cron/keep-alive", {
        authorization: "Bearer any-secret",
      });
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });
});
