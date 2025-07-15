import { NextRequest } from "next/server";
import { GET } from "@/app/api/admin/logs/statistics/route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAdminEmails } from "@/lib/env-validation";

// Mock 설정
jest.mock("@/auth");
jest.mock("@/lib/prisma", () => ({
  prisma: {
    applicationLog: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));
jest.mock("@/lib/env-validation");

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGetAdminEmails = getAdminEmails as jest.MockedFunction<typeof getAdminEmails>;

describe("/api/admin/logs/statistics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("인증되지 않은 사용자는 401 에러", async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/admin/logs/statistics", {
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

      const request = new NextRequest("http://localhost/api/admin/logs/statistics", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("관리자 권한이 필요합니다");
    });

    it("관리자가 로그 통계 조회 성공", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      // 통계 데이터 모킹
      mockPrisma.applicationLog.count
        .mockResolvedValueOnce(1000) // 전체 로그 수
        .mockResolvedValueOnce(25) // 24시간 내 오류 로그
        .mockResolvedValueOnce(15) // 24시간 내 관리자 액션
        .mockResolvedValueOnce(5); // 1시간 내 활동

      mockPrisma.applicationLog.findMany.mockResolvedValue([
        { userId: "user1" },
        { userId: "user2" },
        { userId: "user3" },
      ]);

      const request = new NextRequest("http://localhost/api/admin/logs/statistics", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalLogs).toBe(1000);
      expect(data.errorLogs).toBe(25);
      expect(data.adminActions).toBe(15);
      expect(data.activeUsers).toBe(3);
      expect(data.recentActivity).toBe(5);
      expect(data.systemHealth).toBe("warning"); // 25개 오류 로그
      expect(data.averageResponseTime).toBeGreaterThan(0);
      expect(data.diskUsage).toBeLessThanOrEqual(100);
    });

    it("시스템 상태가 'good'인 경우", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      // 오류 로그 수를 적게 설정
      mockPrisma.applicationLog.count
        .mockResolvedValueOnce(1000)
        .mockResolvedValueOnce(5) // 5개 오류 로그 (good 상태)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3);

      mockPrisma.applicationLog.findMany.mockResolvedValue([
        { userId: "user1" },
        { userId: "user2" },
      ]);

      const request = new NextRequest("http://localhost/api/admin/logs/statistics", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.systemHealth).toBe("good");
    });

    it("시스템 상태가 'critical'인 경우", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      // 오류 로그 수를 많게 설정
      mockPrisma.applicationLog.count
        .mockResolvedValueOnce(1000)
        .mockResolvedValueOnce(100) // 100개 오류 로그 (critical 상태)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(8);

      mockPrisma.applicationLog.findMany.mockResolvedValue([
        { userId: "user1" },
      ]);

      const request = new NextRequest("http://localhost/api/admin/logs/statistics", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.systemHealth).toBe("critical");
    });

    it("디스크 사용량이 100%를 초과하지 않는지 확인", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      // 매우 많은 로그 수 설정
      mockPrisma.applicationLog.count
        .mockResolvedValueOnce(500000) // 50만 로그
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(2);

      mockPrisma.applicationLog.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost/api/admin/logs/statistics", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.diskUsage).toBeLessThanOrEqual(100);
    });

    it("데이터베이스 오류 시 500 에러", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      mockPrisma.applicationLog.count.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost/api/admin/logs/statistics", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("통계 조회에 실패했습니다");
    });

    it("시간 범위 쿼리가 올바르게 설정되는지 확인", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", id: "admin1" },
      } as any);
      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      const mockDate = new Date("2024-01-15T12:00:00Z");
      jest.spyOn(Date, "now").mockReturnValue(mockDate.getTime());

      mockPrisma.applicationLog.count
        .mockResolvedValueOnce(1000)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);

      mockPrisma.applicationLog.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost/api/admin/logs/statistics", {
        method: "GET",
      });

      await GET(request);

      // 24시간 전 계산 확인
      const expectedOneDayAgo = new Date(mockDate.getTime() - 24 * 60 * 60 * 1000);
      const expectedOneHourAgo = new Date(mockDate.getTime() - 60 * 60 * 1000);

      // 오류 로그 쿼리 확인
      expect(mockPrisma.applicationLog.count).toHaveBeenCalledWith({
        where: {
          level: { in: ["ERROR", "FATAL"] },
          createdAt: { gte: expectedOneDayAgo },
        },
      });

      // 관리자 액션 쿼리 확인
      expect(mockPrisma.applicationLog.count).toHaveBeenCalledWith({
        where: {
          type: "ADMIN",
          createdAt: { gte: expectedOneDayAgo },
        },
      });

      // 1시간 내 활동 쿼리 확인
      expect(mockPrisma.applicationLog.count).toHaveBeenCalledWith({
        where: {
          createdAt: { gte: expectedOneHourAgo },
        },
      });

      // 활성 사용자 쿼리 확인
      expect(mockPrisma.applicationLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: { not: null },
          createdAt: { gte: expectedOneDayAgo },
        },
        select: { userId: true },
        distinct: ["userId"],
      });
    });
  });
});