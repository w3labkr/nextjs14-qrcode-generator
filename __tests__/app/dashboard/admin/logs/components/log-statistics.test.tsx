import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { LogStatistics } from "@/app/dashboard/admin/logs/components/log-statistics";

// Mock axios
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Activity: () => <div data-testid="activity-icon">Activity</div>,
  AlertTriangle: () => <div data-testid="alert-icon">Alert</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  TrendingUp: () => <div data-testid="trending-icon">Trending</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Database: () => <div data-testid="database-icon">Database</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>,
}));

describe("LogStatistics", () => {
  const mockStatisticsData = {
    totalLogs: 12345,
    errorLogs: 234,
    adminActions: 45,
    activeUsers: 78,
    recentActivity: 12,
    systemHealth: "good" as const,
    averageResponseTime: 150,
    diskUsage: 65,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Component Rendering", () => {
    it("renders loading state initially", () => {
      mockAxios.get.mockImplementation(() => new Promise(() => {}));
      
      render(<LogStatistics />);
      
      expect(screen.getAllByText("로딩 중...")).toHaveLength(4);
      expect(screen.getAllByText("집계 중...")).toHaveLength(4);
      expect(screen.getAllByText("-")).toHaveLength(4);
    });

    it("renders all statistics cards with correct data", async () => {
      mockAxios.get.mockResolvedValue({ data: mockStatisticsData });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("전체 로그")).toBeInTheDocument();
        expect(screen.getByText("12,345")).toBeInTheDocument();
        expect(screen.getByText("누적 시스템 로그")).toBeInTheDocument();
        
        expect(screen.getByText("오류 로그")).toBeInTheDocument();
        expect(screen.getByText("234")).toBeInTheDocument();
        expect(screen.getByText("24시간 내 오류 발생")).toBeInTheDocument();
        
        expect(screen.getByText("관리자 액션")).toBeInTheDocument();
        expect(screen.getByText("45")).toBeInTheDocument();
        expect(screen.getByText("24시간 내 관리자 활동")).toBeInTheDocument();
        
        expect(screen.getByText("활성 사용자")).toBeInTheDocument();
        expect(screen.getByText("78")).toBeInTheDocument();
        expect(screen.getByText("24시간 내 활성 사용자")).toBeInTheDocument();
      });
    });

    it("renders additional statistics cards", async () => {
      mockAxios.get.mockResolvedValue({ data: mockStatisticsData });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("최근 활동")).toBeInTheDocument();
        expect(screen.getByText("12")).toBeInTheDocument();
        expect(screen.getByText("최근 1시간 활동")).toBeInTheDocument();
        
        expect(screen.getByText("시스템 상태")).toBeInTheDocument();
        expect(screen.getByText("정상")).toBeInTheDocument();
        expect(screen.getByText("실시간 시스템 상태")).toBeInTheDocument();
        
        expect(screen.getByText("평균 응답시간")).toBeInTheDocument();
        expect(screen.getByText("150ms")).toBeInTheDocument();
        expect(screen.getByText("API 평균 응답시간")).toBeInTheDocument();
        
        expect(screen.getByText("로그 저장소")).toBeInTheDocument();
        expect(screen.getByText("65%")).toBeInTheDocument();
        expect(screen.getByText("로그 저장소 사용률")).toBeInTheDocument();
      });
    });

    it("renders all icons correctly", async () => {
      mockAxios.get.mockResolvedValue({ data: mockStatisticsData });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByTestId("database-icon")).toBeInTheDocument();
        expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
        expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
        expect(screen.getByTestId("users-icon")).toBeInTheDocument();
        expect(screen.getByTestId("trending-icon")).toBeInTheDocument();
        expect(screen.getByTestId("activity-icon")).toBeInTheDocument();
        expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
        expect(screen.getByTestId("zap-icon")).toBeInTheDocument();
      });
    });
  });

  describe("Data Fetching", () => {
    it("fetches statistics data on mount", async () => {
      mockAxios.get.mockResolvedValue({ data: mockStatisticsData });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledWith("/api/admin/logs/statistics");
      });
    });

    it("handles API errors gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockAxios.get.mockRejectedValue(new Error("API Error"));
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("통계 데이터를 불러올 수 없습니다.")).toBeInTheDocument();
        expect(consoleSpy).toHaveBeenCalledWith("통계 데이터 가져오기 실패:", expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });

    it("handles axios errors with response data", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const axiosError = {
        response: { data: { message: "Unauthorized" } },
        message: "Request failed with status code 401",
      };
      mockAxios.get.mockRejectedValue(axiosError);
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("통계 데이터를 불러올 수 없습니다.")).toBeInTheDocument();
        expect(consoleSpy).toHaveBeenCalledWith("통계 데이터 가져오기 실패:", axiosError);
      });
      
      consoleSpy.mockRestore();
    });

    it("handles network timeout", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockAxios.get.mockRejectedValue({ code: "ECONNABORTED" });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("통계 데이터를 불러올 수 없습니다.")).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe("System Health Status", () => {
    it("renders good health status correctly", async () => {
      mockAxios.get.mockResolvedValue({ 
        data: { ...mockStatisticsData, systemHealth: "good" } 
      });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("정상")).toBeInTheDocument();
      });
    });

    it("renders warning health status correctly", async () => {
      mockAxios.get.mockResolvedValue({ 
        data: { ...mockStatisticsData, systemHealth: "warning" } 
      });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("주의")).toBeInTheDocument();
      });
    });

    it("renders critical health status correctly", async () => {
      mockAxios.get.mockResolvedValue({ 
        data: { ...mockStatisticsData, systemHealth: "critical" } 
      });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("위험")).toBeInTheDocument();
      });
    });
  });

  describe("Auto-refresh Functionality", () => {
    it("sets up 30-second interval for data refresh", async () => {
      mockAxios.get.mockResolvedValue({ data: mockStatisticsData });
      
      render(<LogStatistics />);
      
      // Initial call
      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledTimes(1);
      });
      
      // Advance timer by 30 seconds
      jest.advanceTimersByTime(30000);
      
      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledTimes(2);
      });
      
      // Advance timer by another 30 seconds
      jest.advanceTimersByTime(30000);
      
      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledTimes(3);
      });
    });

    it("clears interval on component unmount", async () => {
      mockAxios.get.mockResolvedValue({ data: mockStatisticsData });
      
      const { unmount } = render(<LogStatistics />);
      
      // Initial call
      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledTimes(1);
      });
      
      // Unmount component
      unmount();
      
      // Advance timer - should not trigger additional calls
      jest.advanceTimersByTime(30000);
      
      // Should still be only 1 call
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it("handles errors during auto-refresh", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      
      // First call succeeds
      mockAxios.get.mockResolvedValueOnce({ data: mockStatisticsData });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("12,345")).toBeInTheDocument();
      });
      
      // Second call fails
      mockAxios.get.mockRejectedValueOnce(new Error("Network error"));
      
      jest.advanceTimersByTime(30000);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("통계 데이터 가져오기 실패:", expect.any(Error));
      });
      
      // Should still show previous data
      expect(screen.getByText("12,345")).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe("Number Formatting", () => {
    it("formats large numbers with thousands separators", async () => {
      mockAxios.get.mockResolvedValue({ 
        data: { 
          ...mockStatisticsData, 
          totalLogs: 1234567,
          errorLogs: 98765,
          adminActions: 4321,
          activeUsers: 9876,
          recentActivity: 543,
        } 
      });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("1,234,567")).toBeInTheDocument();
        expect(screen.getByText("98,765")).toBeInTheDocument();
        expect(screen.getByText("4,321")).toBeInTheDocument();
        expect(screen.getByText("9,876")).toBeInTheDocument();
        expect(screen.getByText("543")).toBeInTheDocument();
      });
    });

    it("handles zero values correctly", async () => {
      mockAxios.get.mockResolvedValue({ 
        data: { 
          ...mockStatisticsData, 
          totalLogs: 0,
          errorLogs: 0,
          adminActions: 0,
          activeUsers: 0,
          recentActivity: 0,
        } 
      });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getAllByText("0")).toHaveLength(5);
      });
    });

    it("handles single digit numbers", async () => {
      mockAxios.get.mockResolvedValue({ 
        data: { 
          ...mockStatisticsData, 
          totalLogs: 5,
          errorLogs: 3,
          adminActions: 1,
          activeUsers: 8,
          recentActivity: 2,
        } 
      });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("8")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles missing data fields gracefully", async () => {
      mockAxios.get.mockResolvedValue({ 
        data: { 
          totalLogs: 100,
          errorLogs: 0,
          adminActions: 0,
          activeUsers: 0,
          recentActivity: 0,
          systemHealth: "good",
          averageResponseTime: 0,
          diskUsage: 0,
          // Some fields missing but defaults provided
        } 
      });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("100")).toBeInTheDocument();
      });
    });

    it("handles malformed response data", async () => {
      mockAxios.get.mockResolvedValue({ data: null });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("통계 데이터를 불러올 수 없습니다.")).toBeInTheDocument();
      });
    });

    it("handles response without data field", async () => {
      mockAxios.get.mockResolvedValue({});
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("통계 데이터를 불러올 수 없습니다.")).toBeInTheDocument();
      });
    });

    it("handles extremely large numbers", async () => {
      mockAxios.get.mockResolvedValue({ 
        data: { 
          ...mockStatisticsData, 
          totalLogs: 999999999999,
          errorLogs: 888888888888,
        } 
      });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("999,999,999,999")).toBeInTheDocument();
        expect(screen.getByText("888,888,888,888")).toBeInTheDocument();
      });
    });

    it("handles negative numbers appropriately", async () => {
      mockAxios.get.mockResolvedValue({ 
        data: { 
          ...mockStatisticsData, 
          averageResponseTime: -50, // Invalid but should render
          diskUsage: -10,
        } 
      });
      
      render(<LogStatistics />);
      
      await waitFor(() => {
        expect(screen.getByText("-50ms")).toBeInTheDocument();
        expect(screen.getByText("-10%")).toBeInTheDocument();
      });
    });

    it("handles concurrent API requests during refresh", async () => {
      let resolveCount = 0;
      mockAxios.get.mockImplementation(() => {
        resolveCount++;
        return Promise.resolve({ data: { ...mockStatisticsData, totalLogs: resolveCount } });
      });
      
      render(<LogStatistics />);
      
      // Trigger multiple rapid refreshes
      jest.advanceTimersByTime(30000);
      jest.advanceTimersByTime(30000);
      jest.advanceTimersByTime(30000);
      
      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledTimes(4); // Initial + 3 refreshes
      });
    });
  });
});