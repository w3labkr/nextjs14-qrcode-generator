/**
 * @jest-environment node
 */

import { GET, POST } from "@/app/api/auth/refresh/route";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/api-logging", () => ({
  withApiLogging: (handler: Function) => handler,
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

describe("/api/auth/refresh", () => {
  const mockAuth = require("@/auth").auth;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return 401 when no session exists", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const request = createMockRequest(
        "http://localhost:3000/api/auth/refresh",
      );
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("should return session when authenticated", async () => {
      const mockSession = {
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: "2024-12-31T23:59:59.000Z",
      };
      mockAuth.mockResolvedValueOnce(mockSession);

      const request = createMockRequest(
        "http://localhost:3000/api/auth/refresh",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it("should handle auth errors gracefully", async () => {
      mockAuth.mockRejectedValueOnce(new Error("Auth error"));

      const request = createMockRequest(
        "http://localhost:3000/api/auth/refresh",
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe("POST", () => {
    it("should return 401 when no session exists", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const request = createMockRequest(
        "http://localhost:3000/api/auth/refresh",
        {
          method: "POST",
        },
      );
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it("should return session when authenticated", async () => {
      const mockSession = {
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
        },
        expires: "2024-12-31T23:59:59.000Z",
      };
      mockAuth.mockResolvedValueOnce(mockSession);

      const request = createMockRequest(
        "http://localhost:3000/api/auth/refresh",
        {
          method: "POST",
        },
      );
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it("should handle auth errors gracefully", async () => {
      mockAuth.mockRejectedValueOnce(new Error("Auth error"));

      const request = createMockRequest(
        "http://localhost:3000/api/auth/refresh",
        {
          method: "POST",
        },
      );
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
