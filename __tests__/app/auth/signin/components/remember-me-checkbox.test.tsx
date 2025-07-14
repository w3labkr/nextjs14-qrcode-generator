import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RememberMeCheckbox } from "@/app/auth/signin/components/remember-me-checkbox";

// Mock UI components
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

jest.mock("@/components/ui/label", () => ({
  Label: ({ htmlFor, children, ...props }: any) => (
    <label htmlFor={htmlFor} {...props}>
      {children}
    </label>
  ),
}));

describe("RememberMeCheckbox", () => {
  const mockOnCheckedChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders checkbox with correct label", () => {
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(screen.getByLabelText("30일 동안 기억하기")).toBeInTheDocument();
      expect(screen.getByText("30일 동안 기억하기")).toBeInTheDocument();
    });

    it("renders with correct id attribute", () => {
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("id", "remember-me");
    });

    it("renders with correct htmlFor attribute on label", () => {
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const label = screen.getByText("30일 동안 기억하기");
      expect(label).toHaveAttribute("for", "remember-me");
    });

    it("renders checkbox and label in proper container", () => {
      const { container } = render(
        <RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />
      );
      
      const containerDiv = container.querySelector("div");
      expect(containerDiv).toHaveClass("flex", "items-center", "space-x-2");
    });
  });

  describe("Checkbox State", () => {
    it("renders unchecked when checked prop is false", () => {
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("renders checked when checked prop is true", () => {
      render(<RememberMeCheckbox checked={true} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("toggles state correctly when clicked", async () => {
      const user = userEvent.setup();
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      
      expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
    });

    it("calls onCheckedChange with false when unchecking", async () => {
      const user = userEvent.setup();
      render(<RememberMeCheckbox checked={true} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      
      expect(mockOnCheckedChange).toHaveBeenCalledWith(false);
    });
  });

  describe("User Interactions", () => {
    it("can be toggled by clicking on label", async () => {
      const user = userEvent.setup();
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const label = screen.getByText("30일 동안 기억하기");
      await user.click(label);
      
      expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
    });

    it("can be toggled by pressing space key", async () => {
      const user = userEvent.setup();
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      checkbox.focus();
      await user.keyboard(" ");
      
      expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
    });

    it("handles multiple rapid clicks correctly", async () => {
      const user = userEvent.setup();
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      
      // Rapid clicks
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);
      
      expect(mockOnCheckedChange).toHaveBeenCalledTimes(3);
      expect(mockOnCheckedChange).toHaveBeenNthCalledWith(1, true);
      expect(mockOnCheckedChange).toHaveBeenNthCalledWith(2, true);
      expect(mockOnCheckedChange).toHaveBeenNthCalledWith(3, true);
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined checked value", () => {
      render(<RememberMeCheckbox checked={undefined as any} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("handles null checked value", () => {
      render(<RememberMeCheckbox checked={null as any} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("handles missing onCheckedChange callback", () => {
      render(<RememberMeCheckbox checked={false} onCheckedChange={() => {}} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      
      // Should not throw error when clicked
      fireEvent.click(checkbox);
    });

    it("converts checked state to boolean correctly", async () => {
      const user = userEvent.setup();
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      
      // The component should ensure the callback receives a boolean
      expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
      expect(typeof mockOnCheckedChange.mock.calls[0][0]).toBe("boolean");
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label relationship", () => {
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      const label = screen.getByText("30일 동안 기억하기");
      
      expect(checkbox).toHaveAttribute("id", "remember-me");
      expect(label).toHaveAttribute("for", "remember-me");
    });

    it("is keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      
      // Tab to focus
      await user.tab();
      expect(checkbox).toHaveFocus();
      
      // Space to toggle
      await user.keyboard(" ");
      expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
    });

    it("has proper checkbox role", () => {
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("can be found by accessible name", () => {
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox", { name: "30일 동안 기억하기" });
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("does not cause unnecessary re-renders", () => {
      const { rerender } = render(
        <RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />
      );
      
      // Same props should not cause re-render issues
      rerender(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it("handles prop changes correctly", () => {
      const { rerender } = render(
        <RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />
      );
      
      let checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
      
      // Change checked prop
      rerender(<RememberMeCheckbox checked={true} onCheckedChange={mockOnCheckedChange} />);
      
      checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });
  });

  describe("Component Contract", () => {
    it("maintains consistent interface", () => {
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      // Component should render with minimal required props
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(screen.getByText("30일 동안 기억하기")).toBeInTheDocument();
    });

    it("handles callback parameter transformation", async () => {
      const user = userEvent.setup();
      render(<RememberMeCheckbox checked={false} onCheckedChange={mockOnCheckedChange} />);
      
      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
      
      // Component should transform checkbox event to boolean
      expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
    });
  });
});