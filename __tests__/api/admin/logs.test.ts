/**
 * @jest-environment node
 */

import { POST } from "@/app/api/admin/logs/route";
import { getAdminEmails } from "@/lib/env-validation";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/env-validation", () => ({
  getAdminEmails: jest.fn(),
}));

// Mock unified logging to avoid complications
jest.mock("@/lib/unified-logging", () => ({
  UnifiedLogger: {
    getClientInfoFromRequest: jest.fn().mockResolvedValue({}),
    logAdminAction: jest.fn().mockResolvedValue(undefined),
    logError: jest.fn().mockResolvedValue(undefined),
    getLogs: jest.fn().mockResolvedValue({
      logs: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 100,
    }),
  },
}));

const mockGetAdminEmails = getAdminEmails as jest.MockedFunction<
  typeof getAdminEmails
>;

// Mock NextRequest
const createMockRequest = (url: string, options?: RequestInit) => {
  return {
    url,
    method: options?.method || "POST",
    headers: new Headers(),
    json: () => Promise.resolve(JSON.parse((options?.body as string) || "{}")),
  } as any;
};

describe("/api/admin/logs", () => {
  const mockAuth = require("@/auth").auth;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should return 401 when no session exists", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const requestBody = { filters: {} };
      const request = createMockRequest(
        "http://localhost:3000/api/admin/logs",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it("should return 401 when session exists but no email", async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: "user-123" },
        expires: "2024-12-31T23:59:59.000Z",
      });

      const requestBody = { filters: {} };
      const request = createMockRequest(
        "http://localhost:3000/api/admin/logs",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it("should return 403 when user is not admin", async () => {
      mockAuth.mockResolvedValueOnce({
        user: {
          id: "user-123",
          email: "regular@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      const requestBody = { filters: {} };
      const request = createMockRequest(
        "http://localhost:3000/api/admin/logs",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(403);
    });

    it("should return 200 when user is admin", async () => {
      mockAuth.mockResolvedValueOnce({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      const requestBody = { filters: {} };
      const request = createMockRequest(
        "http://localhost:3000/api/admin/logs",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });
});
