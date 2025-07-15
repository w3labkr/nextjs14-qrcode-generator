import { GET } from "@/app/api/admin/check/route";
import { getAdminEmails } from "@/lib/env-validation";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/env-validation", () => ({
  getAdminEmails: jest.fn(),
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data: any, init?: ResponseInit) => ({
      status: init?.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
}));

const mockGetAdminEmails = getAdminEmails as jest.MockedFunction<
  typeof getAdminEmails
>;

// Mock NextRequest
const createMockRequest = (url: string, options?: RequestInit) => {
  return {
    url,
    method: options?.method || "GET",
    headers: new Headers(),
    json: () => Promise.resolve(JSON.parse((options?.body as string) || "{}")),
  } as any;
};

describe("/api/admin/check", () => {
  const mockAuth = require("@/auth").auth;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should return false when no session exists", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const request = createMockRequest(
        "http://localhost:3000/api/admin/check",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ isAdmin: false });
    });

    it("should return false when session exists but no email", async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: "user-123" },
        expires: "2024-12-31T23:59:59.000Z",
      });

      const request = createMockRequest(
        "http://localhost:3000/api/admin/check",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ isAdmin: false });
    });

    it("should return false when user email is not in admin list", async () => {
      mockAuth.mockResolvedValueOnce({
        user: {
          id: "user-123",
          email: "regular@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      const request = createMockRequest(
        "http://localhost:3000/api/admin/check",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ isAdmin: false });
      expect(mockGetAdminEmails).toHaveBeenCalled();
    });

    it("should return true when user email is in admin list", async () => {
      mockAuth.mockResolvedValueOnce({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });
      mockGetAdminEmails.mockReturnValue([
        "admin@example.com",
        "other@example.com",
      ]);

      const request = createMockRequest(
        "http://localhost:3000/api/admin/check",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ isAdmin: true });
      expect(mockGetAdminEmails).toHaveBeenCalled();
    });

    it("should return false when an error occurs", async () => {
      mockAuth.mockRejectedValueOnce(new Error("Auth error"));

      const request = createMockRequest(
        "http://localhost:3000/api/admin/check",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ isAdmin: false });
    });

    it("should handle case-sensitive email comparison", async () => {
      mockAuth.mockResolvedValueOnce({
        user: {
          id: "admin-123",
          email: "ADMIN@EXAMPLE.COM",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      const request = createMockRequest(
        "http://localhost:3000/api/admin/check",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ isAdmin: false });
    });

    it("should handle empty admin emails list", async () => {
      mockAuth.mockResolvedValueOnce({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });
      mockGetAdminEmails.mockReturnValue([]);

      const request = createMockRequest(
        "http://localhost:3000/api/admin/check",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ isAdmin: false });
    });

    it("should handle null email in session", async () => {
      mockAuth.mockResolvedValueOnce({
        user: {
          id: "admin-123",
          email: null,
        },
        expires: "2024-12-31T23:59:59.000Z",
      });
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      const request = createMockRequest(
        "http://localhost:3000/api/admin/check",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ isAdmin: false });
    });

    it("should handle whitespace in email", async () => {
      mockAuth.mockResolvedValueOnce({
        user: {
          id: "admin-123",
          email: "  admin@example.com  ",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      const request = createMockRequest(
        "http://localhost:3000/api/admin/check",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ isAdmin: false });
    });

    it("should handle getAdminEmails throwing error", async () => {
      mockAuth.mockResolvedValueOnce({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });
      mockGetAdminEmails.mockImplementation(() => {
        throw new Error("Config error");
      });

      const request = createMockRequest(
        "http://localhost:3000/api/admin/check",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ isAdmin: false });
    });

    it("should handle multiple admin emails correctly", async () => {
      mockAuth.mockResolvedValueOnce({
        user: {
          id: "admin-123",
          email: "admin2@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });
      mockGetAdminEmails.mockReturnValue([
        "admin1@example.com",
        "admin2@example.com",
        "admin3@example.com",
      ]);

      const request = createMockRequest(
        "http://localhost:3000/api/admin/check",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ isAdmin: true });
    });

    it("should handle malformed session data", async () => {
      mockAuth.mockResolvedValueOnce({
        user: {},
        expires: "2024-12-31T23:59:59.000Z",
      });
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      const request = createMockRequest(
        "http://localhost:3000/api/admin/check",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ isAdmin: false });
    });
  });
});
