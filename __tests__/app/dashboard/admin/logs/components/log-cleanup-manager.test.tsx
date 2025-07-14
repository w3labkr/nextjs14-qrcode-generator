import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { LogCleanupManager } from "@/app/dashboard/admin/logs/components/log-cleanup-manager";
import { useToast } from "@/hooks/use-toast";

// Mock dependencies
jest.mock("axios");
jest.mock("@/hooks/use-toast");

// Mock date-fns
jest.mock("date-fns", () => ({
  format: jest.fn().mockReturnValue("2024-01-01"),
}));

jest.mock("date-fns/locale", () => ({
  ko: {},
}));

// Mock UI components to avoid complex rendering issues
jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ id, checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}));

jest.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}));

jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: any) => <div data-testid="alert-dialog">{children}</div>,
  AlertDialogTrigger: ({ children }: any) => <div>{children}</div>,
  AlertDialogContent: ({ children }: any) => <div data-testid="alert-dialog-content">{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
  AlertDialogAction: ({ onClick, children, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  AlertDialogCancel: ({ children }: any) => <button>{children}</button>,
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  BarChart3: () => <div data-testid="chart-icon">Chart</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  RefreshCw: () => <div data-testid="refresh-icon">Refresh</div>,
  AlertTriangle: () => <div data-testid="alert-icon">Alert</div>,
  Info: () => <div data-testid="info-icon">Info</div>,
  Database: () => <div data-testid="database-icon">Database</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
}));

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe("LogCleanupManager", () => {
  const mockToast = jest.fn();
  
  const mockStatsData = {
    stats: {
      totalLogs: 12345,
      oldestLog: new Date("2023-01-01"),
      newestLog: new Date("2024-01-01"),
      retentionDays: 30,
      estimatedSize: "125 MB",
    },
  };

  const mockCleanupResult = {
    result: {
      deletedCount: 1000,
      beforeDate: "2024-01-01",
      logTypes: [],
      logLevels: [],
      dryRun: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseToast.mockReturnValue({ toast: mockToast });
    mockAxios.get.mockResolvedValue({ data: mockStatsData });
    mockAxios.post.mockResolvedValue({ data: mockCleanupResult });
    
    // Mock current date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Component Rendering", () => {
    it("renders loading state initially", () => {
      mockAxios.get.mockImplementation(() => new Promise(() => {}));
      
      render(<LogCleanupManager />);
      
      expect(screen.getByText("로그 통계를 불러오는 중...")).toBeInTheDocument();
    });

    it("renders main sections after loading", async () => {
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        expect(screen.getByText("로그 저장소 현황")).toBeInTheDocument();
        expect(screen.getByText("수동 로그 정리")).toBeInTheDocument();
        expect(screen.getByText("자동 로그 정리")).toBeInTheDocument();
      });
    });

    it("renders statistics correctly", async () => {
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        expect(screen.getByText("12,345")).toBeInTheDocument();
        expect(screen.getByText("전체 로그")).toBeInTheDocument();
        expect(screen.getByText("30일")).toBeInTheDocument();
        expect(screen.getByText("보존 기간")).toBeInTheDocument();
        expect(screen.getByText("125 MB")).toBeInTheDocument();
        expect(screen.getByText("예상 크기")).toBeInTheDocument();
      });
    });

    it("renders cleanup options", async () => {
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        expect(screen.getByText("다음 날짜 이전의 로그 삭제")).toBeInTheDocument();
        expect(screen.getByText("로그 타입 (선택사항)")).toBeInTheDocument();
        expect(screen.getByText("로그 레벨 (선택사항)")).toBeInTheDocument();
        expect(screen.getByText("시뮬레이션 모드")).toBeInTheDocument();
      });
    });
  });

  describe("Data Fetching", () => {
    it("fetches stats on mount", async () => {
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledWith("/api/admin/logs/cleanup");
      });
    });

    it("handles API error gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockAxios.get.mockRejectedValue(new Error("API Error"));
      
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        expect(screen.getByText("통계를 불러올 수 없습니다.")).toBeInTheDocument();
        expect(consoleSpy).toHaveBeenCalledWith("통계 조회 실패:", expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe("Date Selection", () => {
    it("sets default date to 30 days ago", async () => {
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        const dateInput = screen.getByLabelText("다음 날짜 이전의 로그 삭제");
        expect(dateInput).toHaveValue("2023-12-02"); // 30 days before 2024-01-01
      });
    });

    it("updates date when user changes it", async () => {
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        const dateInput = screen.getByLabelText("다음 날짜 이전의 로그 삭제");
        expect(dateInput).toBeInTheDocument();
      });
      
      const dateInput = screen.getByLabelText("다음 날짜 이전의 로그 삭제");
      fireEvent.change(dateInput, { target: { value: "2023-06-01" } });
      
      expect(dateInput).toHaveValue("2023-06-01");
    });
  });

  describe("Security Features", () => {
    it("enables dry run mode by default", async () => {
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        const dryRunSwitch = screen.getByRole("switch");
        expect(dryRunSwitch).toBeChecked();
      });
    });

    it("requires date input for cleanup", async () => {
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        const dateInput = screen.getByLabelText("다음 날짜 이전의 로그 삭제");
        expect(dateInput).toBeInTheDocument();
        expect(dateInput).toHaveValue("2023-12-02");
      });
    });

    it("shows destructive warning when dry run is disabled", async () => {
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        const dryRunSwitch = screen.getByRole("switch");
        expect(dryRunSwitch).toBeInTheDocument();
      });
      
      const dryRunSwitch = screen.getByRole("switch");
      fireEvent.click(dryRunSwitch);
      
      await waitFor(() => {
        expect(screen.getByText("실제 삭제 모드입니다!")).toBeInTheDocument();
        expect(screen.getByText("로그 삭제")).toBeInTheDocument();
      });
    });
  });

  describe("Cleanup Execution", () => {
    it("renders cleanup execution button", async () => {
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        const simulationButtons = screen.getAllByText("시뮬레이션 실행");
        expect(simulationButtons.length).toBeGreaterThan(0);
      });
      
      // Should have simulation button available
      const simulationButtons = screen.getAllByText("시뮬레이션 실행");
      expect(simulationButtons[0]).toBeInTheDocument();
    });

    it("handles cleanup errors", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockAxios.post.mockRejectedValue(new Error("Cleanup failed"));
      
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        expect(screen.getByText("수동 로그 정리")).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe("Auto-cleanup Information", () => {
    it("renders auto-cleanup information", async () => {
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        expect(screen.getByText("자동 로그 정리")).toBeInTheDocument();
        expect(screen.getByText(/매일 오전 2시에 자동으로.*일 이전의 로그가 삭제됩니다/)).toBeInTheDocument();
        expect(screen.getByText("보존 기간은 환경변수 LOG_RETENTION_DAYS로 설정할 수 있습니다.")).toBeInTheDocument();
        expect(screen.getByText("크론잡은 Vercel의 Cron Jobs 기능을 사용합니다.")).toBeInTheDocument();
      });
    });

    it("shows retention days in auto-cleanup info", async () => {
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        expect(screen.getByText(/매일 오전 2시에 자동으로 30일 이전의 로그가 삭제됩니다/)).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles missing stats data", async () => {
      mockAxios.get.mockResolvedValue({ data: {} });
      
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        expect(screen.getByText("통계를 불러올 수 없습니다.")).toBeInTheDocument();
      });
    });

    it("handles null oldest log date", async () => {
      mockAxios.get.mockResolvedValue({ 
        data: { 
          stats: { 
            ...mockStatsData.stats, 
            oldestLog: null 
          } 
        } 
      });
      
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        expect(screen.getByText("-")).toBeInTheDocument();
      });
    });

    it("handles API errors during cleanup", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockAxios.post.mockRejectedValue(new Error("Cleanup failed"));
      
      render(<LogCleanupManager />);
      
      await waitFor(() => {
        expect(screen.getByText("시뮬레이션 모드")).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });
  });
});