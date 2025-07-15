import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/admin/logs/cleanup/route";
import { auth } from "@/auth";
import { LogCleanupManager } from "@/lib/log-cleanup";
import { getAdminEmails } from "@/lib/env-validation";

// Mock 설정
jest.mock("@/auth");
jest.mock("@/lib/log-cleanup");
jest.mock("@/lib/env-validation");

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockLogCleanupManager = LogCleanupManager as jest.Mocked<typeof LogCleanupManager>;
const mockGetAdminEmails = getAdminEmails as jest.MockedFunction<typeof getAdminEmails>;

describe("/api/admin/logs/cleanup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST - 수동 로그 정리", () => {
    it("인증되지 않은 사용자는 401 에러", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/admin/logs/cleanup", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("인증이 필요합니다");
    });

    it("관리자가 아닌 사용자는 403 에러", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "user@example.com", id: "user1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      const request = new NextRequest("http://localhost/api/admin/logs/cleanup", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("관리자 권한이 필요합니다");
    });

    it("관리자가 드라이런 모드로 로그 정리 성공", async () => {
      const mockResult = {
        deletedCount: 100,
        dryRun: true,
        affectedTables: ["application_log"],
      };

      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);
      mockLogCleanupManager.manualCleanup.mockResolvedValue(mockResult);

      const request = new NextRequest("http://localhost/api/admin/logs/cleanup", {
        method: "POST",
        body: JSON.stringify({
          beforeDate: "2024-01-01",
          logTypes: ["ERROR"],
          logLevels: ["FATAL"],
          dryRun: true,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.result).toEqual(mockResult);
      expect(data.timestamp).toBeDefined();

      expect(mockLogCleanupManager.manualCleanup).toHaveBeenCalledWith(
        "admin1",
        {
          beforeDate: new Date("2024-01-01"),
          logTypes: ["ERROR"],
          logLevels: ["FATAL"],
          dryRun: true,
        }
      );
    });

    it("실제 로그 정리 실행 성공", async () => {
      const mockResult = {
        deletedCount: 50,
        dryRun: false,
        affectedTables: ["application_log"],
      };

      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);
      mockLogCleanupManager.manualCleanup.mockResolvedValue(mockResult);

      const request = new NextRequest("http://localhost/api/admin/logs/cleanup", {
        method: "POST",
        body: JSON.stringify({
          beforeDate: "2024-01-01",
          dryRun: false,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.result).toEqual(mockResult);

      expect(mockLogCleanupManager.manualCleanup).toHaveBeenCalledWith(
        "admin1",
        {
          beforeDate: new Date("2024-01-01"),
          dryRun: false,
        }
      );
    });

    it("기본 옵션으로 로그 정리 실행", async () => {
      const mockResult = {
        deletedCount: 0,
        dryRun: true,
        affectedTables: [],
      };

      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);
      mockLogCleanupManager.manualCleanup.mockResolvedValue(mockResult);

      const request = new NextRequest("http://localhost/api/admin/logs/cleanup", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      expect(mockLogCleanupManager.manualCleanup).toHaveBeenCalledWith(
        "admin1",
        { dryRun: true }
      );
    });

    it("로그 정리 실패 시 500 에러", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);
      mockLogCleanupManager.manualCleanup.mockRejectedValue(new Error("Cleanup failed"));

      const request = new NextRequest("http://localhost/api/admin/logs/cleanup", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Cleanup failed");
    });
  });

  describe("GET - 로그 정리 통계", () => {
    it("인증되지 않은 사용자는 401 에러", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/admin/logs/cleanup", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("인증이 필요합니다");
    });

    it("관리자가 아닌 사용자는 403 에러", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "user@example.com", id: "user1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      const request = new NextRequest("http://localhost/api/admin/logs/cleanup", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("관리자 권한이 필요합니다");
    });

    it("관리자가 로그 통계 조회 성공", async () => {
      const mockStats = {
        totalLogs: 1000,
        oldestLogDate: new Date("2024-01-01"),
        newestLogDate: new Date("2024-12-31"),
        logsByType: {
          USER: 500,
          ADMIN: 300,
          SYSTEM: 200,
        },
        logsByLevel: {
          INFO: 600,
          WARN: 200,
          ERROR: 150,
          FATAL: 50,
        },
      };

      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);
      mockLogCleanupManager.getLogTableStats.mockResolvedValue(mockStats);

      const request = new NextRequest("http://localhost/api/admin/logs/cleanup", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.stats).toEqual(mockStats);
      expect(data.timestamp).toBeDefined();

      expect(mockLogCleanupManager.getLogTableStats).toHaveBeenCalled();
    });

    it("통계 조회 실패 시 500 에러", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);
      mockLogCleanupManager.getLogTableStats.mockRejectedValue(new Error("Stats failed"));

      const request = new NextRequest("http://localhost/api/admin/logs/cleanup", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Stats failed");
    });
  });
});