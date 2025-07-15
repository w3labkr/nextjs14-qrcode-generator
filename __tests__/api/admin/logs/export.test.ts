import { NextRequest } from "next/server";
import { POST } from "@/app/api/admin/logs/export/route";
import { auth } from "@/auth";
import { UnifiedLogger } from "@/lib/unified-logging";
import { getAdminEmails } from "@/lib/env-validation";
import { convertLogsToCSV } from "@/lib/csv-utils";

// Mock 설정
jest.mock("@/auth");
jest.mock("@/lib/unified-logging");
jest.mock("@/lib/env-validation");
jest.mock("@/lib/csv-utils");

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockUnifiedLogger = UnifiedLogger as jest.Mocked<typeof UnifiedLogger>;
const mockGetAdminEmails = getAdminEmails as jest.MockedFunction<typeof getAdminEmails>;
const mockConvertLogsToCSV = convertLogsToCSV as jest.MockedFunction<typeof convertLogsToCSV>;

describe("/api/admin/logs/export", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("인증되지 않은 사용자는 401 에러", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/admin/logs/export", {
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

      const request = new NextRequest("http://localhost/api/admin/logs/export", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("관리자 권한이 필요합니다");
    });

    it("관리자가 로그 CSV 내보내기 성공", async () => {
      const mockLogs = [
        {
          id: "log1",
          level: "INFO",
          message: "Test log",
          createdAt: new Date(),
        },
      ];

      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);
      mockUnifiedLogger.getClientInfoFromRequest.mockResolvedValue({
        ip: "127.0.0.1",
        userAgent: "test-agent",
      });
      mockUnifiedLogger.logAdminAction.mockResolvedValue(undefined);
      mockUnifiedLogger.getLogs.mockResolvedValue({
        logs: mockLogs,
        totalCount: 1,
      });
      mockConvertLogsToCSV.mockReturnValue("id,level,message\nlog1,INFO,Test log");

      const request = new NextRequest("http://localhost/api/admin/logs/export", {
        method: "POST",
        body: JSON.stringify({
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
      expect(response.headers.get("Content-Disposition")).toContain("attachment; filename=");
      
      const csvContent = await response.text();
      expect(csvContent).toBe("id,level,message\nlog1,INFO,Test log");

      // 관리자 액션 로깅 확인
      expect(mockUnifiedLogger.logAdminAction).toHaveBeenCalledWith(
        {
          adminId: "admin1",
          action: "EXPORT_LOGS",
          details: "로그 CSV 내보내기",
        },
        expect.any(Object)
      );
    });

    it("내보낼 로그가 없는 경우 404 에러", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);
      mockUnifiedLogger.getClientInfoFromRequest.mockResolvedValue({
        ip: "127.0.0.1",
        userAgent: "test-agent",
      });
      mockUnifiedLogger.logAdminAction.mockResolvedValue(undefined);
      mockUnifiedLogger.getLogs.mockResolvedValue({
        logs: [],
        totalCount: 0,
      });

      const request = new NextRequest("http://localhost/api/admin/logs/export", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("내보낼 로그 데이터가 없습니다");
    });

    it("로그 조회 실패 시 500 에러", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);
      mockUnifiedLogger.getClientInfoFromRequest.mockResolvedValue({
        ip: "127.0.0.1",
        userAgent: "test-agent",
      });
      mockUnifiedLogger.logAdminAction.mockResolvedValue(undefined);
      mockUnifiedLogger.getLogs.mockRejectedValue(new Error("Database error"));
      mockUnifiedLogger.logError.mockResolvedValue(undefined);

      const request = new NextRequest("http://localhost/api/admin/logs/export", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("로그 CSV 내보내기에 실패했습니다");
      expect(data.details).toBe("Database error");

      // 에러 로깅 확인
      expect(mockUnifiedLogger.logError).toHaveBeenCalledWith(
        {
          error: expect.any(Error),
          errorCode: "ADMIN_LOG_EXPORT_ERROR",
          additionalInfo: { endpoint: "/api/admin/logs/export" },
        },
        expect.any(Object)
      );
    });

    it("필터 옵션이 올바르게 전달되는지 확인", async () => {
      const mockLogs = [{ id: "log1", level: "INFO", message: "Test log" }];

      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);
      mockUnifiedLogger.getClientInfoFromRequest.mockResolvedValue({
        ip: "127.0.0.1",
        userAgent: "test-agent",
      });
      mockUnifiedLogger.logAdminAction.mockResolvedValue(undefined);
      mockUnifiedLogger.getLogs.mockResolvedValue({
        logs: mockLogs,
        totalCount: 1,
      });
      mockConvertLogsToCSV.mockReturnValue("csv-content");

      const filters = {
        dateFrom: "2024-01-01",
        dateTo: "2024-01-31",
        logLevel: "ERROR",
        logType: "ADMIN",
        page: 1,
        limit: 10,
      };

      const request = new NextRequest("http://localhost/api/admin/logs/export", {
        method: "POST",
        body: JSON.stringify(filters),
      });

      await POST(request);

      // 페이지네이션 제거된 필터로 호출되는지 확인
      expect(mockUnifiedLogger.getLogs).toHaveBeenCalledWith(
        {
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
          logLevel: "ERROR",
          logType: "ADMIN",
          page: undefined,
          limit: undefined,
        },
        "admin1",
        true
      );
    });
  });
});