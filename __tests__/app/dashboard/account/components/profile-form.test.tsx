import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileForm } from "@/app/dashboard/account/components/profile-form";
import { updateProfile } from "@/app/actions/account-management";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Mock dependencies
jest.mock("@/app/actions/account-management", () => ({
  updateProfile: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe("ProfileForm", () => {
  const mockSession = {
    user: {
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      image: "https://example.com/avatar.jpg",
    },
    expires: "2024-12-31T23:59:59.000Z",
  };

  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  const mockUpdate = jest.fn();

  const defaultProps = {
    session: mockSession,
    open: true,
    onOpenChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
      update: mockUpdate,
    });
    mockUseRouter.mockReturnValue(mockRouter as any);
    mockUpdateProfile.mockResolvedValue({ success: true });
  });

  describe("Rendering", () => {
    it("renders dialog when open is true", () => {
      render(<ProfileForm {...defaultProps} />);
      
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("프로필 수정")).toBeInTheDocument();
    });

    it("does not render dialog content when open is false", () => {
      render(<ProfileForm {...defaultProps} open={false} />);
      
      expect(screen.queryByText("프로필 수정")).not.toBeInTheDocument();
    });

    it("renders form fields correctly", () => {
      render(<ProfileForm {...defaultProps} />);
      
      expect(screen.getByLabelText("이름")).toBeInTheDocument();
      expect(screen.getByLabelText("이메일")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    });

    it("displays current user name from session", () => {
      render(<ProfileForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText("이름") as HTMLInputElement;
      expect(nameInput.value).toBe("John Doe");
    });

    it("shows email as read-only", () => {
      render(<ProfileForm {...defaultProps} />);
      
      const emailInput = screen.getByLabelText("이메일") as HTMLInputElement;
      expect(emailInput.value).toBe("john@example.com");
      expect(emailInput).toHaveAttribute("readonly");
    });

    it("handles session without user gracefully", () => {
      render(<ProfileForm {...defaultProps} session={null} />);
      
      const nameInput = screen.getByLabelText("이름") as HTMLInputElement;
      const emailInput = screen.getByLabelText("이메일") as HTMLInputElement;
      expect(nameInput.value).toBe("");
      expect(emailInput.value).toBe("");
    });
  });

  describe("Form Validation", () => {
    it("shows error for empty name", async () => {
      const user = userEvent.setup();
      render(<ProfileForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText("이름");
      await user.clear(nameInput);
      await user.tab(); // Trigger blur event for validation
      
      await waitFor(() => {
        expect(screen.getByText("이름을 입력해주세요")).toBeInTheDocument();
      });
    });

    it("shows error for name too long", async () => {
      const user = userEvent.setup();
      render(<ProfileForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText("이름");
      const longName = "A".repeat(51); // Exceeds 50 character limit
      
      await user.clear(nameInput);
      await user.type(nameInput, longName);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText("이름은 50자 이하여야 합니다")).toBeInTheDocument();
      });
    });

    it("disables submit button when form is invalid", async () => {
      const user = userEvent.setup();
      render(<ProfileForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText("이름");
      const submitButton = screen.getByRole("button", { name: "저장" });
      
      await user.clear(nameInput);
      
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it("enables submit button when form is valid", async () => {
      const user = userEvent.setup();
      render(<ProfileForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText("이름");
      const submitButton = screen.getByRole("button", { name: "저장" });
      
      await user.clear(nameInput);
      await user.type(nameInput, "Valid Name");
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("User Interactions", () => {
    it("updates form when user types", async () => {
      const user = userEvent.setup();
      render(<ProfileForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText("이름") as HTMLInputElement;
      
      await user.clear(nameInput);
      await user.type(nameInput, "Jane Doe");
      
      expect(nameInput.value).toBe("Jane Doe");
    });

    it("resets form and closes dialog on cancel", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      render(<ProfileForm {...defaultProps} onOpenChange={onOpenChange} />);
      
      const nameInput = screen.getByLabelText("이름");
      const cancelButton = screen.getByRole("button", { name: "취소" });
      
      // Modify the form
      await user.clear(nameInput);
      await user.type(nameInput, "Modified Name");
      
      // Cancel
      await user.click(cancelButton);
      
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("submits form with valid data", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      render(<ProfileForm {...defaultProps} onOpenChange={onOpenChange} />);
      
      const nameInput = screen.getByLabelText("이름");
      const submitButton = screen.getByRole("button", { name: "저장" });
      
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Name");
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          name: "Updated Name",
          email: "john@example.com",
        });
      });
    });

    it("prevents submission when form is loading", async () => {
      const user = userEvent.setup();
      // Make updateProfile return a promise that doesn't resolve immediately
      mockUpdateProfile.mockImplementation(() => new Promise(() => {}));
      
      render(<ProfileForm {...defaultProps} />);
      
      const submitButton = screen.getByRole("button", { name: "저장" });
      
      await user.click(submitButton);
      await user.click(submitButton); // Try to click again
      
      // Should only be called once
      expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe("Server Action Integration", () => {
    it("shows success toast and updates session on successful update", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      
      mockUpdateProfile.mockResolvedValue({ 
        success: true,
        user: { ...mockSession.user, name: "Updated Name" }
      });
      
      render(<ProfileForm {...defaultProps} onOpenChange={onOpenChange} />);
      
      const nameInput = screen.getByLabelText("이름");
      const submitButton = screen.getByRole("button", { name: "저장" });
      
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Name");
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith("프로필이 성공적으로 업데이트되었습니다.");
        expect(mockUpdate).toHaveBeenCalled();
        expect(mockRouter.refresh).toHaveBeenCalled();
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("shows error toast on failed update", async () => {
      const user = userEvent.setup();
      
      mockUpdateProfile.mockResolvedValue({ 
        success: false,
        error: "업데이트에 실패했습니다."
      });
      
      render(<ProfileForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText("이름");
      const submitButton = screen.getByRole("button", { name: "저장" });
      
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Name");
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("업데이트에 실패했습니다.");
      });
    });

    it("handles server action exceptions", async () => {
      const user = userEvent.setup();
      
      mockUpdateProfile.mockRejectedValue(new Error("Network error"));
      
      render(<ProfileForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText("이름");
      const submitButton = screen.getByRole("button", { name: "저장" });
      
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Name");
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("프로필 업데이트 중 오류가 발생했습니다.");
      });
    });

    it("handles session update failure gracefully", async () => {
      const user = userEvent.setup();
      
      mockUpdateProfile.mockResolvedValue({ success: true });
      mockUpdate.mockRejectedValue(new Error("Session update failed"));
      
      render(<ProfileForm {...defaultProps} />);
      
      const submitButton = screen.getByRole("button", { name: "저장" });
      await user.click(submitButton);
      
      // Should still show success even if session update fails
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalled();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles form state when session changes while open", () => {
      const { rerender } = render(<ProfileForm {...defaultProps} />);
      
      const newSession = {
        ...mockSession,
        user: { ...mockSession.user, name: "Changed Name" }
      };
      
      rerender(<ProfileForm {...defaultProps} session={newSession} />);
      
      const nameInput = screen.getByLabelText("이름") as HTMLInputElement;
      expect(nameInput.value).toBe("Changed Name");
    });

    it("disables submit when no changes made", () => {
      render(<ProfileForm {...defaultProps} />);
      
      const submitButton = screen.getByRole("button", { name: "저장" });
      expect(submitButton).toBeDisabled();
    });

    it("handles unicode characters in name", async () => {
      const user = userEvent.setup();
      render(<ProfileForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText("이름");
      const unicodeName = "김철수 🚀 Test 用户";
      
      await user.clear(nameInput);
      await user.type(nameInput, unicodeName);
      
      const submitButton = screen.getByRole("button", { name: "저장" });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          name: unicodeName,
          email: "john@example.com",
        });
      });
    });

    it("handles special characters in name", async () => {
      const user = userEvent.setup();
      render(<ProfileForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText("이름");
      const specialName = "O'Connor-Smith Jr.";
      
      await user.clear(nameInput);
      await user.type(nameInput, specialName);
      
      const submitButton = screen.getByRole("button", { name: "저장" });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          name: specialName,
          email: "john@example.com",
        });
      });
    });

    it("resets form when dialog is closed and reopened", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      const { rerender } = render(
        <ProfileForm {...defaultProps} onOpenChange={onOpenChange} />
      );
      
      // Modify form
      const nameInput = screen.getByLabelText("이름");
      await user.clear(nameInput);
      await user.type(nameInput, "Modified Name");
      
      // Close dialog
      rerender(<ProfileForm {...defaultProps} open={false} onOpenChange={onOpenChange} />);
      
      // Reopen dialog
      rerender(<ProfileForm {...defaultProps} open={true} onOpenChange={onOpenChange} />);
      
      // Form should be reset to original values
      const nameInputAfterReopen = screen.getByLabelText("이름") as HTMLInputElement;
      expect(nameInputAfterReopen.value).toBe("John Doe");
    });
  });

  describe("Accessibility", () => {
    it("has proper form labels", () => {
      render(<ProfileForm {...defaultProps} />);
      
      expect(screen.getByLabelText("이름")).toBeInTheDocument();
      expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    });

    it("associates error messages with form fields", async () => {
      const user = userEvent.setup();
      render(<ProfileForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText("이름");
      await user.clear(nameInput);
      await user.tab();
      
      await waitFor(() => {
        const errorMessage = screen.getByText("이름을 입력해주세요");
        expect(errorMessage).toBeInTheDocument();
        expect(nameInput).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<ProfileForm {...defaultProps} />);
      
      // Tab through form elements
      await user.tab(); // Name input
      expect(screen.getByLabelText("이름")).toHaveFocus();
      
      await user.tab(); // Email input (read-only, but still focusable)
      expect(screen.getByLabelText("이메일")).toHaveFocus();
      
      await user.tab(); // Cancel button
      expect(screen.getByRole("button", { name: "취소" })).toHaveFocus();
      
      await user.tab(); // Submit button
      expect(screen.getByRole("button", { name: "저장" })).toHaveFocus();
    });
  });
});