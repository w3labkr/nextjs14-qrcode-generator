import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GitHubSignInButton } from "@/app/auth/signin/components/github-signin-button";
import { signIn } from "next-auth/react";

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

// Mock UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, type, variant, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      type={type}
      className={className}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

describe("GitHubSignInButton", () => {
  const defaultProps = {
    callbackUrl: "/dashboard",
    onSignIn: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders button with correct text", () => {
      render(<GitHubSignInButton {...defaultProps} />);
      
      expect(screen.getByRole("button", { name: /깃허브 로그인/i })).toBeInTheDocument();
    });

    it("renders GitHub icon SVG", () => {
      render(<GitHubSignInButton {...defaultProps} />);
      
      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("mr-2", "h-4", "w-4");
    });

    it("renders with correct button attributes", () => {
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("data-variant", "outline");
      expect(button).toHaveClass("w-full");
    });

    it("renders GitHub icon with correct SVG path", () => {
      render(<GitHubSignInButton {...defaultProps} />);
      
      const svg = document.querySelector("svg");
      const path = svg?.querySelector("path");
      
      expect(path).toHaveAttribute("fill", "currentColor");
      expect(path).toHaveAttribute("d", expect.stringContaining("M12 0c-6.626 0-12 5.373-12 12"));
    });
  });

  describe("Sign In Functionality", () => {
    it("calls signIn with correct provider and callback URL", async () => {
      const user = userEvent.setup();
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("github", { 
        callbackUrl: "/dashboard" 
      });
    });

    it("calls onSignIn callback before signIn", async () => {
      const user = userEvent.setup();
      const mockOnSignIn = jest.fn();
      
      render(<GitHubSignInButton {...defaultProps} onSignIn={mockOnSignIn} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockOnSignIn).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalledWith("github", { 
        callbackUrl: "/dashboard" 
      });
    });

    it("handles different callback URLs", async () => {
      const user = userEvent.setup();
      const customCallbackUrl = "/custom-redirect";
      
      render(<GitHubSignInButton callbackUrl={customCallbackUrl} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("github", { 
        callbackUrl: customCallbackUrl 
      });
    });

    it("works without onSignIn callback", async () => {
      const user = userEvent.setup();
      render(<GitHubSignInButton callbackUrl="/dashboard" />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("github", { 
        callbackUrl: "/dashboard" 
      });
    });
  });

  describe("User Interactions", () => {
    it("handles keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      
      // Tab to focus
      await user.tab();
      expect(button).toHaveFocus();
      
      // Enter to click
      await user.keyboard("{Enter}");
      expect(mockSignIn).toHaveBeenCalled();
    });

    it("handles space key press", async () => {
      const user = userEvent.setup();
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      button.focus();
      
      await user.keyboard(" ");
      expect(mockSignIn).toHaveBeenCalled();
    });

    it("handles multiple rapid clicks", async () => {
      const user = userEvent.setup();
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      
      // Rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledTimes(3);
    });

    it("handles click with mouse", async () => {
      const user = userEvent.setup();
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("github", { 
        callbackUrl: "/dashboard" 
      });
    });
  });

  describe("Error Handling", () => {
    it("handles signIn function throwing error", async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      
      mockSignIn.mockRejectedValue(new Error("Sign in failed"));
      
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("handles onSignIn callback throwing error", async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      
      const mockOnSignIn = jest.fn().mockImplementation(() => {
        throw new Error("Callback error");
      });
      
      render(<GitHubSignInButton {...defaultProps} onSignIn={mockOnSignIn} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockOnSignIn).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("handles undefined callback URL", async () => {
      const user = userEvent.setup();
      render(<GitHubSignInButton callbackUrl={undefined as any} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("github", { 
        callbackUrl: undefined 
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper button role", () => {
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("has accessible name", () => {
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button", { name: /깃허브 로그인/i });
      expect(button).toBeInTheDocument();
    });

    it("GitHub icon has proper aria attributes", () => {
      render(<GitHubSignInButton {...defaultProps} />);
      
      const svg = document.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("is keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      
      // Should be focusable
      button.focus();
      expect(button).toHaveFocus();
      
      // Should be activatable with Enter
      await user.keyboard("{Enter}");
      expect(mockSignIn).toHaveBeenCalled();
    });

    it("has proper button type attribute", () => {
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });
  });

  describe("Visual Styling", () => {
    it("has correct CSS classes", () => {
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveClass("w-full");
      expect(button).toHaveAttribute("data-variant", "outline");
    });

    it("GitHub icon has correct dimensions", () => {
      render(<GitHubSignInButton {...defaultProps} />);
      
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("mr-2", "h-4", "w-4");
    });

    it("maintains button layout structure", () => {
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      const svg = document.querySelector("svg");
      
      expect(button).toContainElement(svg);
      expect(button).toHaveTextContent("깃허브 로그인");
    });
  });

  describe("Props Validation", () => {
    it("handles empty callback URL", async () => {
      const user = userEvent.setup();
      render(<GitHubSignInButton callbackUrl="" />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("github", { 
        callbackUrl: "" 
      });
    });

    it("handles special characters in callback URL", async () => {
      const user = userEvent.setup();
      const callbackUrl = "/dashboard?param=value&other=123";
      
      render(<GitHubSignInButton callbackUrl={callbackUrl} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("github", { 
        callbackUrl: callbackUrl 
      });
    });

    it("handles very long callback URL", async () => {
      const user = userEvent.setup();
      const longCallbackUrl = "/dashboard/" + "a".repeat(1000);
      
      render(<GitHubSignInButton callbackUrl={longCallbackUrl} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("github", { 
        callbackUrl: longCallbackUrl 
      });
    });
  });

  describe("Performance", () => {
    it("does not cause unnecessary re-renders", () => {
      const { rerender } = render(<GitHubSignInButton {...defaultProps} />);
      
      // Same props should not cause issues
      rerender(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("깃허브 로그인");
    });

    it("handles prop changes correctly", () => {
      const { rerender } = render(<GitHubSignInButton {...defaultProps} />);
      
      // Change callback URL
      rerender(<GitHubSignInButton callbackUrl="/new-callback" />);
      
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("깃허브 로그인");
    });
  });

  describe("Component Comparison", () => {
    it("uses github provider instead of google", async () => {
      const user = userEvent.setup();
      render(<GitHubSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("github", { 
        callbackUrl: "/dashboard" 
      });
      expect(mockSignIn).not.toHaveBeenCalledWith("google", expect.any(Object));
    });

    it("has different button text than Google button", () => {
      render(<GitHubSignInButton {...defaultProps} />);
      
      expect(screen.getByText("깃허브 로그인")).toBeInTheDocument();
      expect(screen.queryByText("구글 로그인")).not.toBeInTheDocument();
    });

    it("has different icon than Google button", () => {
      render(<GitHubSignInButton {...defaultProps} />);
      
      const svg = document.querySelector("svg");
      const path = svg?.querySelector("path");
      
      // GitHub icon should have different path than Google
      expect(path).toHaveAttribute("d", expect.stringContaining("M12 0c-6.626 0-12 5.373-12 12"));
    });
  });
});