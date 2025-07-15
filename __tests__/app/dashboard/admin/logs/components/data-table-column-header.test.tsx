import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTableColumnHeader } from "@/app/dashboard/admin/logs/components/data-table-column-header";
import { Column } from "@tanstack/react-table";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowDown: ({ className }: any) => <span className={className}>ArrowDown</span>,
  ArrowUp: ({ className }: any) => <span className={className}>ArrowUp</span>,
  ChevronsUpDown: ({ className }: any) => <span className={className}>ChevronsUpDown</span>,
  EyeOff: ({ className }: any) => <span className={className}>EyeOff</span>,
}));

describe("DataTableColumnHeader", () => {
  const mockColumn = {
    getCanSort: jest.fn(() => true),
    getIsSorted: jest.fn(() => false),
    toggleSorting: jest.fn(),
    toggleVisibility: jest.fn(),
  } as unknown as Column<any, any>;

  const defaultProps = {
    column: mockColumn,
    title: "Test Column",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders column title", () => {
      render(<DataTableColumnHeader {...defaultProps} />);
      expect(screen.getByText("Test Column")).toBeInTheDocument();
    });

    it("renders without sort button when column cannot be sorted", () => {
      const nonSortableColumn = {
        ...mockColumn,
        getCanSort: jest.fn(() => false),
      };

      render(<DataTableColumnHeader {...defaultProps} column={nonSortableColumn} />);
      
      expect(screen.getByText("Test Column")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("shows unsorted icon when column is not sorted", () => {
      render(<DataTableColumnHeader {...defaultProps} />);
      expect(screen.getByText("ChevronsUpDown")).toBeInTheDocument();
    });

    it("shows ascending icon when sorted ascending", () => {
      const sortedColumn = {
        ...mockColumn,
        getIsSorted: jest.fn(() => "asc"),
      };

      render(<DataTableColumnHeader {...defaultProps} column={sortedColumn} />);
      expect(screen.getByText("ArrowUp")).toBeInTheDocument();
      expect(screen.queryByText("ArrowDown")).not.toBeInTheDocument();
    });

    it("shows descending icon when sorted descending", () => {
      const sortedColumn = {
        ...mockColumn,
        getIsSorted: jest.fn(() => "desc"),
      };

      render(<DataTableColumnHeader {...defaultProps} column={sortedColumn} />);
      expect(screen.getByText("ArrowDown")).toBeInTheDocument();
      expect(screen.queryByText("ArrowUp")).not.toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <DataTableColumnHeader {...defaultProps} className="custom-class" />
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-class");
    });
  });

  describe("Dropdown Menu", () => {
    it("opens dropdown menu when button is clicked", async () => {
      const user = userEvent.setup();
      render(<DataTableColumnHeader {...defaultProps} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(screen.getByText("오름차순")).toBeInTheDocument();
      expect(screen.getByText("내림차순")).toBeInTheDocument();
      expect(screen.getByText("숨기기")).toBeInTheDocument();
    });

    it("calls toggleSorting(false) when ascending is clicked", async () => {
      const user = userEvent.setup();
      render(<DataTableColumnHeader {...defaultProps} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const ascMenuItem = screen.getByText("오름차순");
      await user.click(ascMenuItem);

      expect(mockColumn.toggleSorting).toHaveBeenCalledWith(false);
    });

    it("calls toggleSorting(true) when descending is clicked", async () => {
      const user = userEvent.setup();
      render(<DataTableColumnHeader {...defaultProps} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const descMenuItem = screen.getByText("내림차순");
      await user.click(descMenuItem);

      expect(mockColumn.toggleSorting).toHaveBeenCalledWith(true);
    });

    it("calls toggleVisibility(false) when hide is clicked", async () => {
      const user = userEvent.setup();
      render(<DataTableColumnHeader {...defaultProps} />);

      const button = screen.getByRole("button");
      await user.click(button);

      const hideMenuItem = screen.getByText("숨기기");
      await user.click(hideMenuItem);

      expect(mockColumn.toggleVisibility).toHaveBeenCalledWith(false);
    });
  });

  describe("Accessibility", () => {
    it("button is keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<DataTableColumnHeader {...defaultProps} />);

      const button = screen.getByRole("button");
      
      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Open menu with Enter key
      await user.keyboard("{Enter}");
      expect(screen.getByText("오름차순")).toBeInTheDocument();
    });

    it("dropdown menu items have proper icons", async () => {
      const user = userEvent.setup();
      render(<DataTableColumnHeader {...defaultProps} />);

      const button = screen.getByRole("button");
      await user.click(button);

      // Check that each menu item has its associated icon
      const ascItem = screen.getByText("오름차순").closest("div");
      expect(ascItem?.querySelector(".mr-2")).toBeInTheDocument();

      const descItem = screen.getByText("내림차순").closest("div");
      expect(descItem?.querySelector(".mr-2")).toBeInTheDocument();

      const hideItem = screen.getByText("숨기기").closest("div");
      expect(hideItem?.querySelector(".mr-2")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles column without sort capability", () => {
      const nonSortableColumn = {
        getCanSort: jest.fn(() => false),
        getIsSorted: jest.fn(() => false),
        toggleSorting: jest.fn(),
        toggleVisibility: jest.fn(),
      } as unknown as Column<any, any>;

      render(<DataTableColumnHeader column={nonSortableColumn} title="Test" />);
      
      // Should render as plain text without button
      expect(screen.getByText("Test")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("handles empty title", () => {
      render(<DataTableColumnHeader {...defaultProps} title="" />);
      
      // Should still render the button
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("handles very long title", () => {
      const longTitle = "This is a very long column title that might cause layout issues";
      render(<DataTableColumnHeader {...defaultProps} title={longTitle} />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("maintains state after re-render", () => {
      const { rerender } = render(<DataTableColumnHeader {...defaultProps} />);
      
      expect(screen.getByText("ChevronsUpDown")).toBeInTheDocument();

      // Update to sorted state
      const sortedColumn = {
        ...mockColumn,
        getIsSorted: jest.fn(() => "asc"),
      };

      rerender(<DataTableColumnHeader {...defaultProps} column={sortedColumn} />);
      
      expect(screen.getByText("ArrowUp")).toBeInTheDocument();
    });
  });
});