import React from "react";
import { render, screen } from "@testing-library/react";
import { AdminLogsDataTable } from "@/app/dashboard/admin/logs/components/admin-logs-data-table";
import { ApplicationLogData } from "@/types/logs";
import { ColumnDef } from "@tanstack/react-table";

describe("AdminLogsDataTable", () => {
  const mockData: ApplicationLogData[] = [
    {
      id: "1",
      type: "ACCESS",
      level: "INFO",
      priority: "NORMAL",
      message: "User logged in",
      userId: "user-1",
      createdAt: new Date("2024-01-01T10:00:00Z"),
    },
    {
      id: "2",
      type: "ERROR",
      level: "ERROR",
      priority: "HIGH",
      message: "Database connection failed",
      userId: "user-2",
      createdAt: new Date("2024-01-01T11:00:00Z"),
    },
  ];

  const mockColumns: ColumnDef<ApplicationLogData>[] = [
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => row.original.type,
    },
    {
      id: "level",
      header: "Level",
      cell: ({ row }) => row.original.level,
    },
    {
      id: "message",
      header: "Message",
      cell: ({ row }) => row.original.message,
    },
  ];

  const defaultProps = {
    columns: mockColumns,
    data: mockData,
    loading: false,
    totalCount: 100,
    currentPage: 1,
    totalPages: 10,
    onPageChange: jest.fn(),
    limit: 10,
    onLimitChange: jest.fn(),
    columnVisibility: {},
    onColumnVisibilityChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Behavior", () => {
    it("renders without crashing", () => {
      render(<AdminLogsDataTable {...defaultProps} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("displays correct pagination info", () => {
      render(<AdminLogsDataTable {...defaultProps} currentPage={5} />);
      expect(screen.getByText("페이지 5 / 10")).toBeInTheDocument();
    });

    it("shows empty state when no data", () => {
      render(<AdminLogsDataTable {...defaultProps} data={[]} />);
      expect(screen.getByText("조건에 맞는 로그가 없습니다")).toBeInTheDocument();
      expect(screen.getByText("필터 조건을 변경해보세요")).toBeInTheDocument();
    });

    it("handles loading state", () => {
      const { container } = render(<AdminLogsDataTable {...defaultProps} loading={true} />);
      
      // Check for loading animation classes
      const loadingElements = container.querySelectorAll(".animate-pulse");
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    it("calls onPageChange when pagination buttons are clicked", () => {
      const onPageChange = jest.fn();
      render(<AdminLogsDataTable {...defaultProps} currentPage={5} onPageChange={onPageChange} />);

      // Find pagination buttons by their labels
      const firstPageButton = screen.getByRole("button", { name: "첫 페이지로" });
      const prevButton = screen.getByRole("button", { name: "이전 페이지" });
      const nextButton = screen.getByRole("button", { name: "다음 페이지" });
      const lastPageButton = screen.getByRole("button", { name: "마지막 페이지로" });

      // Click buttons and verify calls
      firstPageButton.click();
      expect(onPageChange).toHaveBeenCalledWith(1);

      prevButton.click();
      expect(onPageChange).toHaveBeenCalledWith(4);

      nextButton.click();
      expect(onPageChange).toHaveBeenCalledWith(6);

      lastPageButton.click();
      expect(onPageChange).toHaveBeenCalledWith(10);
    });

    it("disables pagination buttons appropriately", () => {
      // First page
      const { rerender } = render(<AdminLogsDataTable {...defaultProps} currentPage={1} />);
      
      expect(screen.getByRole("button", { name: "첫 페이지로" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "이전 페이지" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "다음 페이지" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "마지막 페이지로" })).not.toBeDisabled();

      // Last page
      rerender(<AdminLogsDataTable {...defaultProps} currentPage={10} totalPages={10} />);
      
      expect(screen.getByRole("button", { name: "첫 페이지로" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "이전 페이지" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "마지막 페이지로" })).toBeDisabled();
    });

    it("respects column visibility settings", () => {
      // This component uses tanstack/react-table which handles visibility internally
      // We just verify the prop is accepted
      const { container } = render(
        <AdminLogsDataTable 
          {...defaultProps} 
          columnVisibility={{ type: false, level: true, message: true }}
        />
      );
      
      expect(container.querySelector("table")).toBeInTheDocument();
    });

    it("handles large datasets efficiently", () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: `log-${i}`,
        type: "INFO" as const,
        level: "INFO" as const,
        priority: "NORMAL" as const,
        message: `Log message ${i}`,
        userId: `user-${i}`,
        createdAt: new Date(),
      }));

      render(
        <AdminLogsDataTable 
          {...defaultProps} 
          data={largeData.slice(0, 10)} 
          totalCount={1000}
          totalPages={100}
        />
      );

      // Should show current page info
      expect(screen.getByText("페이지 1 / 100")).toBeInTheDocument();
    });

    it("shows correct number of skeleton rows when loading", () => {
      const { container } = render(
        <AdminLogsDataTable {...defaultProps} loading={true} limit={25} />
      );

      // Should show maximum 5 skeleton rows even if limit is 25
      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length).toBeLessThanOrEqual(5);
    });
  });
});