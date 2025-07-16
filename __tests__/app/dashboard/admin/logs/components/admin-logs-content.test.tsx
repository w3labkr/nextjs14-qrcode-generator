import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { AdminLogsContent } from "@/app/dashboard/admin/logs/components/admin-logs-content";
import { useToast } from "@/hooks/use-toast";

// Mock dependencies
jest.mock("axios");
jest.mock("@/hooks/use-toast");

// Mock UI components
jest.mock("@/components/ui/date-picker", () => ({
  DatePickerWithRange: ({ date, onDateChange }: any) => (
    <div data-testid="date-picker">
      <button onClick={() => onDateChange({ from: new Date(), to: new Date() })}>
        Set Date Range
      </button>
    </div>
  ),
}));

jest.mock("@/app/dashboard/admin/logs/components/admin-logs-data-table", () => ({
  AdminLogsDataTable: ({ data, loading }: any) => (
    <div data-testid="admin-logs-table">
      {loading ? "Loading..." : `Table with ${data.length} items`}
    </div>
  ),
}));

jest.mock("@/app/dashboard/admin/logs/components/logs-columns", () => ({
  adminLogsColumns: [],
}));

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe("AdminLogsContent", () => {
  const mockToast = jest.fn();

  const mockLogData = [
    {
      id: "log-1",
      type: "ACCESS",
      level: "INFO",
      priority: "NORMAL",
      message: "User accessed dashboard",
      createdAt: "2024-01-01T10:00:00.000Z",
      userId: "user-1",
    },
    {
      id: "log-2", 
      type: "ERROR",
      level: "ERROR",
      priority: "HIGH",
      message: "Database connection failed",
      createdAt: "2024-01-01T11:00:00.000Z",
      userId: "user-2",
    },
  ];

  const mockApiResponse = {
    data: {
      logs: mockLogData,
      totalCount: 50,
      totalPages: 5,
      currentPage: 1,
      limit: 10,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseToast.mockReturnValue({ toast: mockToast });
    mockAxios.post.mockResolvedValue(mockApiResponse);
  });

  describe("Component Rendering", () => {
    it("renders with default state", () => {
      render(<AdminLogsContent />);
      
      expect(screen.getByText("시스템 로그")).toBeInTheDocument();
      expect(screen.getByText("실시간 시스템 활동 및 오류 로그를 모니터링합니다.")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("로그 검색...")).toBeInTheDocument();
      expect(screen.getByTestId("admin-logs-table")).toBeInTheDocument();
    });

    it("renders with initial data", () => {
      render(<AdminLogsContent initialData={mockLogData} />);
      
      expect(screen.getByTestId("admin-logs-table")).toHaveTextContent(
        `Table with ${mockLogData.length} items`
      );
    });

    it("renders all filter controls", () => {
      render(<AdminLogsContent />);
      
      expect(screen.getByPlaceholderText("로그 검색...")).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /로그 타입/i })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /로그 레벨/i })).toBeInTheDocument();
      expect(screen.getByTestId("date-picker")).toBeInTheDocument();
    });

    it("renders action buttons", () => {
      render(<AdminLogsContent />);
      
      expect(screen.getByRole("button", { name: /새로고침/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /CSV 내보내기/i })).toBeInTheDocument();
    });
  });

  describe("Data Fetching", () => {
    it("fetches logs on mount", async () => {
      render(<AdminLogsContent />);
      
      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith("/api/admin/logs", {
          page: 1,
          limit: 10,
          type: undefined,
          level: undefined,
          search: undefined,
          startDate: undefined,
          endDate: undefined,
          orderBy: "desc",
        });
      });
    });

    it("shows loading state while fetching", async () => {
      // Make axios return a promise that doesn't resolve immediately
      mockAxios.post.mockImplementation(() => new Promise(() => {}));
      
      render(<AdminLogsContent />);
      
      expect(screen.getByTestId("admin-logs-table")).toHaveTextContent("Loading...");
    });

    it("handles API errors gracefully", async () => {
      const errorMessage = "Network Error";
      mockAxios.post.mockRejectedValue(new Error(errorMessage));
      
      render(<AdminLogsContent />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "오류",
          description: "로그를 가져오는 중 오류가 발생했습니다: Network Error",
          variant: "destructive",
        });
      });
    });

    it("handles axios errors with response", async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: { message: "Unauthorized access" },
        },
      };
      mockAxios.isAxiosError.mockReturnValue(true);
      mockAxios.post.mockRejectedValue(axiosError);
      
      render(<AdminLogsContent />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "오류",
          description: "로그를 가져오는 중 오류가 발생했습니다: Unauthorized access",
          variant: "destructive",
        });
      });
    });
  });

  describe("Search and Filtering", () => {
    it("updates search value and triggers fetch", async () => {
      const user = userEvent.setup();
      render(<AdminLogsContent />);
      
      const searchInput = screen.getByPlaceholderText("로그 검색...");
      await user.type(searchInput, "error");
      
      expect(searchInput).toHaveValue("error");
      
      // Should trigger fetch after debounce
      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith("/api/admin/logs", 
          expect.objectContaining({
            search: "error",
          })
        );
      }, { timeout: 2000 });
    });

    it("filters by log type", async () => {
      const user = userEvent.setup();
      render(<AdminLogsContent />);
      
      const typeSelect = screen.getByRole("combobox", { name: /로그 타입/i });
      await user.click(typeSelect);
      
      const errorOption = screen.getByText("오류");
      await user.click(errorOption);
      
      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith("/api/admin/logs", 
          expect.objectContaining({
            type: "ERROR",
          })
        );
      });
    });

    it("filters by log level", async () => {
      const user = userEvent.setup();
      render(<AdminLogsContent />);
      
      const levelSelect = screen.getByRole("combobox", { name: /로그 레벨/i });
      await user.click(levelSelect);
      
      const errorLevel = screen.getByText("ERROR");
      await user.click(errorLevel);
      
      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith("/api/admin/logs", 
          expect.objectContaining({
            level: "ERROR",
          })
        );
      });
    });

    it("filters by date range", async () => {
      const user = userEvent.setup();
      render(<AdminLogsContent />);
      
      const datePickerButton = screen.getByText("Set Date Range");
      await user.click(datePickerButton);
      
      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith("/api/admin/logs", 
          expect.objectContaining({
            startDate: expect.any(Date),
            endDate: expect.any(Date),
          })
        );
      });
    });

    it("clears all filters", async () => {
      const user = userEvent.setup();
      render(<AdminLogsContent />);
      
      // Set some filters first
      const searchInput = screen.getByPlaceholderText("로그 검색...");
      await user.type(searchInput, "test");
      
      // Clear filters
      const clearButton = screen.getByRole("button", { name: /필터 초기화/i });
      await user.click(clearButton);
      
      expect(searchInput).toHaveValue("");
      
      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith("/api/admin/logs", 
          expect.objectContaining({
            search: undefined,
            type: undefined,
            level: undefined,
            startDate: undefined,
            endDate: undefined,
          })
        );
      });
    });
  });

  describe("Pagination", () => {
    it("updates page size", async () => {
      const user = userEvent.setup();
      render(<AdminLogsContent />);
      
      const pageSizeSelect = screen.getByRole("combobox", { name: /페이지당 항목 수/i });
      await user.click(pageSizeSelect);
      
      const option25 = screen.getByText("25");
      await user.click(option25);
      
      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith("/api/admin/logs", 
          expect.objectContaining({
            limit: 25,
          })
        );
      });
    });
  });

  describe("CSV Export", () => {
    it("exports CSV with current filters", async () => {
      const user = userEvent.setup();
      const mockResponse = { data: "csv,data\ntest,value" };
      mockAxios.get.mockResolvedValue(mockResponse);
      
      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = jest.fn(() => "mocked-url");
      global.URL.revokeObjectURL = jest.fn();
      
      // Mock document.createElement and click
      const mockLink = {
        href: "",
        download: "",
        click: jest.fn(),
      };
      jest.spyOn(document, "createElement").mockReturnValue(mockLink as any);
      jest.spyOn(document.body, "appendChild").mockImplementation(() => mockLink as any);
      jest.spyOn(document.body, "removeChild").mockImplementation(() => mockLink as any);
      
      render(<AdminLogsContent />);
      
      const exportButton = screen.getByRole("button", { name: /CSV 내보내기/i });
      await user.click(exportButton);
      
      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledWith("/api/admin/logs/export", 
          expect.objectContaining({
            params: expect.objectContaining({
              format: "csv",
            }),
          })
        );
      });
      
      expect(mockToast).toHaveBeenCalledWith({
        title: "내보내기 완료",
        description: "CSV 파일이 다운로드되었습니다.",
      });
    });

    it("handles CSV export errors", async () => {
      const user = userEvent.setup();
      mockAxios.get.mockRejectedValue(new Error("Export failed"));
      
      render(<AdminLogsContent />);
      
      const exportButton = screen.getByRole("button", { name: /CSV 내보내기/i });
      await user.click(exportButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "오류",
          description: "CSV 내보내기 중 오류가 발생했습니다: Export failed",
          variant: "destructive",
        });
      });
    });
  });

  describe("Refresh Functionality", () => {
    it("refreshes data when refresh button is clicked", async () => {
      const user = userEvent.setup();
      render(<AdminLogsContent />);
      
      // Clear previous calls
      mockAxios.post.mockClear();
      
      const refreshButton = screen.getByRole("button", { name: /새로고침/i });
      await user.click(refreshButton);
      
      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalledWith("/api/admin/logs", 
          expect.objectContaining({
            page: 1,
            limit: 10,
          })
        );
      });
    });

    it("shows loading state during refresh", async () => {
      const user = userEvent.setup();
      // Make axios return a promise that doesn't resolve immediately
      mockAxios.post.mockImplementation(() => new Promise(() => {}));
      
      render(<AdminLogsContent />);
      
      const refreshButton = screen.getByRole("button", { name: /새로고침/i });
      await user.click(refreshButton);
      
      expect(screen.getByTestId("admin-logs-table")).toHaveTextContent("Loading...");
    });
  });

  describe("Column Visibility", () => {
    it("toggles column visibility", async () => {
      const user = userEvent.setup();
      render(<AdminLogsContent />);
      
      const settingsButton = screen.getByRole("button", { name: /컬럼 설정/i });
      await user.click(settingsButton);
      
      // Should show column visibility options
      expect(screen.getByText("컬럼 표시/숨기기")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty response data", async () => {
      mockAxios.post.mockResolvedValue({
        data: {
          logs: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          limit: 10,
        },
      });
      
      render(<AdminLogsContent />);
      
      await waitFor(() => {
        expect(screen.getByTestId("admin-logs-table")).toHaveTextContent("Table with 0 items");
      });
    });

    it("handles malformed API response", async () => {
      mockAxios.post.mockResolvedValue({
        data: {}, // Missing expected fields
      });
      
      render(<AdminLogsContent />);
      
      await waitFor(() => {
        expect(screen.getByTestId("admin-logs-table")).toHaveTextContent("Table with 0 items");
      });
    });

    it("handles network timeout", async () => {
      mockAxios.post.mockRejectedValue({ code: "ECONNABORTED" });
      
      render(<AdminLogsContent />);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "오류",
          description: expect.stringContaining("로그를 가져오는 중 오류가 발생했습니다"),
          variant: "destructive",
        });
      });
    });

    it("handles concurrent API requests properly", async () => {
      const user = userEvent.setup();
      render(<AdminLogsContent />);
      
      // Trigger multiple rapid requests
      const refreshButton = screen.getByRole("button", { name: /새로고침/i });
      await user.click(refreshButton);
      await user.click(refreshButton);
      await user.click(refreshButton);
      
      // Should handle concurrent requests gracefully
      await waitFor(() => {
        expect(mockAxios.post).toHaveBeenCalled();
      });
    });
  });
});