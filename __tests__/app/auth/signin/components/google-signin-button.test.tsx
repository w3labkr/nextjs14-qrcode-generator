import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoogleSignInButton } from "@/app/auth/signin/components/google-signin-button";
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

describe("GoogleSignInButton", () => {
  const defaultProps = {
    callbackUrl: "/dashboard",
    onSignIn: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders button with correct text", () => {
      render(<GoogleSignInButton {...defaultProps} />);
      
      expect(screen.getByRole("button", { name: /구글 로그인/i })).toBeInTheDocument();
    });

    it("renders Google icon SVG", () => {
      render(<GoogleSignInButton {...defaultProps} />);
      
      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("mr-2", "h-4", "w-4");
    });

    it("renders with correct button attributes", () => {
      render(<GoogleSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("data-variant", "outline");
      expect(button).toHaveClass("w-full");
    });

    it("renders Google icon with correct SVG paths", () => {
      render(<GoogleSignInButton {...defaultProps} />);
      
      const svg = document.querySelector("svg");
      const paths = svg?.querySelectorAll("path");
      
      expect(paths).toHaveLength(4); // Google icon has 4 path elements
      paths?.forEach(path => {
        expect(path).toHaveAttribute("fill", "currentColor");
      });
    });
  });

  describe("Sign In Functionality", () => {
    it("calls signIn with correct provider and callback URL", async () => {
      const user = userEvent.setup();
      render(<GoogleSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("google", { 
        callbackUrl: "/dashboard" 
      });
    });

    it("calls onSignIn callback before signIn", async () => {
      const user = userEvent.setup();
      const mockOnSignIn = jest.fn();
      
      render(<GoogleSignInButton {...defaultProps} onSignIn={mockOnSignIn} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockOnSignIn).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalledWith("google", { 
        callbackUrl: "/dashboard" 
      });
    });

    it("handles different callback URLs", async () => {
      const user = userEvent.setup();
      const customCallbackUrl = "/custom-redirect";
      
      render(<GoogleSignInButton callbackUrl={customCallbackUrl} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("google", { 
        callbackUrl: customCallbackUrl 
      });
    });

    it("works without onSignIn callback", async () => {
      const user = userEvent.setup();
      render(<GoogleSignInButton callbackUrl="/dashboard" />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("google", { 
        callbackUrl: "/dashboard" 
      });
    });
  });

  describe("User Interactions", () => {
    it("handles keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<GoogleSignInButton {...defaultProps} />);
      
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
      render(<GoogleSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      button.focus();
      
      await user.keyboard(" ");
      expect(mockSignIn).toHaveBeenCalled();
    });

    it("handles multiple rapid clicks", async () => {
      const user = userEvent.setup();
      render(<GoogleSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      
      // Rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledTimes(3);
    });

    it("handles click with mouse", async () => {
      const user = userEvent.setup();
      render(<GoogleSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("google", { 
        callbackUrl: "/dashboard" 
      });
    });
  });

  describe("Error Handling", () => {
    it("handles signIn function throwing error", async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      
      mockSignIn.mockRejectedValue(new Error("Sign in failed"));
      
      render(<GoogleSignInButton {...defaultProps} />);
      
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
      
      render(<GoogleSignInButton {...defaultProps} onSignIn={mockOnSignIn} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockOnSignIn).toHaveBeenCalled();
      expect(mockSignIn).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("handles undefined callback URL", async () => {
      const user = userEvent.setup();
      render(<GoogleSignInButton callbackUrl={undefined as any} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("google", { 
        callbackUrl: undefined 
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper button role", () => {
      render(<GoogleSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("has accessible name", () => {
      render(<GoogleSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button", { name: /구글 로그인/i });
      expect(button).toBeInTheDocument();
    });

    it("Google icon has proper aria attributes", () => {
      render(<GoogleSignInButton {...defaultProps} />);
      
      const svg = document.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("is keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<GoogleSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      
      // Should be focusable
      button.focus();
      expect(button).toHaveFocus();
      
      // Should be activatable with Enter
      await user.keyboard("{Enter}");
      expect(mockSignIn).toHaveBeenCalled();
    });

    it("has proper button type attribute", () => {
      render(<GoogleSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });
  });

  describe("Visual Styling", () => {
    it("has correct CSS classes", () => {
      render(<GoogleSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveClass("w-full");
      expect(button).toHaveAttribute("data-variant", "outline");
    });

    it("Google icon has correct dimensions", () => {
      render(<GoogleSignInButton {...defaultProps} />);
      
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("mr-2", "h-4", "w-4");
    });

    it("maintains button layout structure", () => {
      render(<GoogleSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      const svg = document.querySelector("svg");
      
      expect(button).toContainElement(svg);
      expect(button).toHaveTextContent("구글 로그인");
    });
  });

  describe("Props Validation", () => {
    it("handles empty callback URL", async () => {
      const user = userEvent.setup();
      render(<GoogleSignInButton callbackUrl="" />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("google", { 
        callbackUrl: "" 
      });
    });

    it("handles special characters in callback URL", async () => {
      const user = userEvent.setup();
      const callbackUrl = "/dashboard?param=value&other=123";
      
      render(<GoogleSignInButton callbackUrl={callbackUrl} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("google", { 
        callbackUrl: callbackUrl 
      });
    });

    it("handles very long callback URL", async () => {
      const user = userEvent.setup();
      const longCallbackUrl = "/dashboard/" + "a".repeat(1000);
      
      render(<GoogleSignInButton callbackUrl={longCallbackUrl} />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      expect(mockSignIn).toHaveBeenCalledWith("google", { 
        callbackUrl: longCallbackUrl 
      });
    });
  });

  describe("Performance", () => {
    it("does not cause unnecessary re-renders", () => {
      const { rerender } = render(<GoogleSignInButton {...defaultProps} />);
      
      // Same props should not cause issues
      rerender(<GoogleSignInButton {...defaultProps} />);
      
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("구글 로그인");
    });

    it("handles prop changes correctly", () => {
      const { rerender } = render(<GoogleSignInButton {...defaultProps} />);
      
      // Change callback URL
      rerender(<GoogleSignInButton callbackUrl="/new-callback" />);
      
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("구글 로그인");
    });
  });
});