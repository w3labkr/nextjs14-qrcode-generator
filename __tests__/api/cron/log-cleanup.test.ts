/**
 * @jest-environment node
 */

import { POST } from "@/app/api/cron/log-cleanup/route";

// Mock dependencies
jest.mock("@/lib/log-cleanup", () => ({
  LogCleanupManager: {
    cleanupOldLogs: jest.fn(),
    getLogTableStats: jest.fn(),
  },
}));

// Mock NextRequest
const createMockRequest = (url: string, headers: Record<string, string> = {}) => {
  return {
    url,
    method: "POST",
    headers: {
      get: jest.fn((name: string) => headers[name] || null),
    },
  } as any;
};

describe("/api/cron/log-cleanup", () => {
  const { LogCleanupManager } = require("@/lib/log-cleanup");
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock for environment variable
    process.env.CRON_SECRET = "test-cron-secret";
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  describe("POST", () => {
    it("should return 500 when CRON_SECRET is not set", async () => {
      delete process.env.CRON_SECRET;

      const request = createMockRequest("http://localhost:3000/api/cron/log-cleanup");
      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it("should return 401 when no authorization header", async () => {
      const request = createMockRequest("http://localhost:3000/api/cron/log-cleanup");
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it("should return 401 when invalid authorization header", async () => {
      const request = createMockRequest("http://localhost:3000/api/cron/log-cleanup", {
        authorization: "Bearer invalid-secret",
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it("should return 200 when cleanup is successful", async () => {
      LogCleanupManager.cleanupOldLogs.mockResolvedValueOnce({
        deletedCount: 100,
        message: "Cleanup successful",
      });
      LogCleanupManager.getLogTableStats.mockResolvedValueOnce({
        totalLogs: 1000,
        oldestLog: new Date(),
        newestLog: new Date(),
      });

      const request = createMockRequest("http://localhost:3000/api/cron/log-cleanup", {
        authorization: "Bearer test-cron-secret",
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(LogCleanupManager.cleanupOldLogs).toHaveBeenCalled();
      expect(LogCleanupManager.getLogTableStats).toHaveBeenCalled();
    });

    it("should handle cleanup errors gracefully", async () => {
      LogCleanupManager.cleanupOldLogs.mockRejectedValueOnce(new Error("Cleanup failed"));

      const request = createMockRequest("http://localhost:3000/api/cron/log-cleanup", {
        authorization: "Bearer test-cron-secret",
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it("should handle stats error gracefully", async () => {
      LogCleanupManager.cleanupOldLogs.mockResolvedValueOnce({
        deletedCount: 100,
        message: "Cleanup successful",
      });
      LogCleanupManager.getLogTableStats.mockRejectedValueOnce(new Error("Stats failed"));

      const request = createMockRequest("http://localhost:3000/api/cron/log-cleanup", {
        authorization: "Bearer test-cron-secret",
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
