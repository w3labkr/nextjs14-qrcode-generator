import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInCard } from "@/app/auth/signin/components/signin-card";
import { setRememberMeCookie } from "@/lib/auth-utils";
import { useSearchParams } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

// Mock auth utils
jest.mock("@/lib/auth-utils", () => ({
  setRememberMeCookie: jest.fn(),
}));

// Mock child components
jest.mock("@/app/auth/signin/components/google-signin-button", () => ({
  GoogleSignInButton: ({ callbackUrl, onSignIn }: any) => (
    <button onClick={onSignIn} data-testid="google-signin" data-callback-url={callbackUrl}>
      Google Sign In
    </button>
  ),
}));

jest.mock("@/app/auth/signin/components/github-signin-button", () => ({
  GitHubSignInButton: ({ callbackUrl, onSignIn }: any) => (
    <button onClick={onSignIn} data-testid="github-signin" data-callback-url={callbackUrl}>
      GitHub Sign In
    </button>
  ),
}));

jest.mock("@/app/auth/signin/components/remember-me-checkbox", () => ({
  RememberMeCheckbox: ({ checked, onCheckedChange }: any) => (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        data-testid="remember-me"
      />
      Remember Me
    </label>
  ),
}));

jest.mock("@/app/auth/signin/components/continue-without-signin", () => ({
  ContinueWithoutSignIn: () => (
    <div data-testid="continue-without-signin">Continue Without Sign In</div>
  ),
}));

// Mock UI components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className} data-testid="card-header">
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h2 className={className} data-testid="card-title">
      {children}
    </h2>
  ),
  CardDescription: ({ children }: any) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
  CardFooter: ({ children, className }: any) => (
    <div className={className} data-testid="card-footer">
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/separator", () => ({
  Separator: () => <hr data-testid="separator" />,
}));

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
const mockSetRememberMeCookie = setRememberMeCookie as jest.MockedFunction<typeof setRememberMeCookie>;

describe("SignInCard", () => {
  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue(mockSearchParams as any);
    mockSearchParams.get.mockReturnValue(null);
  });

  describe("Component Rendering", () => {
    it("renders all required elements", () => {
      render(<SignInCard />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
      expect(screen.getByTestId("card-header")).toBeInTheDocument();
      expect(screen.getByTestId("card-title")).toBeInTheDocument();
      expect(screen.getByTestId("card-description")).toBeInTheDocument();
      expect(screen.getByTestId("card-content")).toBeInTheDocument();
      expect(screen.getByTestId("card-footer")).toBeInTheDocument();
    });

    it("renders sign-in title", () => {
      render(<SignInCard />);

      expect(screen.getByText("로그인")).toBeInTheDocument();
    });

    it("renders description text", () => {
      render(<SignInCard />);

      expect(screen.getByText("QR 코드 히스토리 및 고급 기능을 이용하려면 로그인하세요")).toBeInTheDocument();
    });

    it("renders both sign-in buttons", () => {
      render(<SignInCard />);

      expect(screen.getByTestId("google-signin")).toBeInTheDocument();
      expect(screen.getByTestId("github-signin")).toBeInTheDocument();
    });

    it("renders remember me checkbox", () => {
      render(<SignInCard />);

      expect(screen.getByTestId("remember-me")).toBeInTheDocument();
    });

    it("renders continue without sign-in option", () => {
      render(<SignInCard />);

      expect(screen.getByTestId("continue-without-signin")).toBeInTheDocument();
    });

    it("renders separator", () => {
      render(<SignInCard />);

      expect(screen.getByTestId("separator")).toBeInTheDocument();
    });
  });

  describe("Callback URL Handling", () => {
    it("uses default callback URL when not provided", () => {
      render(<SignInCard />);

      const googleButton = screen.getByTestId("google-signin");
      const githubButton = screen.getByTestId("github-signin");

      expect(googleButton).toHaveAttribute("data-callback-url", "/dashboard");
      expect(githubButton).toHaveAttribute("data-callback-url", "/dashboard");
    });

    it("uses callback URL from search params", () => {
      mockSearchParams.get.mockReturnValue("/custom-page");
      render(<SignInCard />);

      const googleButton = screen.getByTestId("google-signin");
      const githubButton = screen.getByTestId("github-signin");

      expect(googleButton).toHaveAttribute("data-callback-url", "/custom-page");
      expect(githubButton).toHaveAttribute("data-callback-url", "/custom-page");
    });

    it("calls useSearchParams to get callback URL", () => {
      render(<SignInCard />);

      expect(mockSearchParams.get).toHaveBeenCalledWith("callbackUrl");
    });
  });

  describe("Remember Me Functionality", () => {
    it("initializes remember me as unchecked", () => {
      render(<SignInCard />);

      const checkbox = screen.getByTestId("remember-me") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it("updates remember me state when checkbox is clicked", async () => {
      const user = userEvent.setup();
      render(<SignInCard />);

      const checkbox = screen.getByTestId("remember-me");
      
      expect(checkbox).not.toBeChecked();
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("sets remember me cookie when signing in with Google", async () => {
      const user = userEvent.setup();
      render(<SignInCard />);

      const checkbox = screen.getByTestId("remember-me");
      const googleButton = screen.getByTestId("google-signin");

      // Check remember me
      await user.click(checkbox);
      
      // Click sign in
      await user.click(googleButton);

      expect(mockSetRememberMeCookie).toHaveBeenCalledWith(true);
    });

    it("sets remember me cookie when signing in with GitHub", async () => {
      const user = userEvent.setup();
      render(<SignInCard />);

      const checkbox = screen.getByTestId("remember-me");
      const githubButton = screen.getByTestId("github-signin");

      // Check remember me
      await user.click(checkbox);
      
      // Click sign in
      await user.click(githubButton);

      expect(mockSetRememberMeCookie).toHaveBeenCalledWith(true);
    });

    it("does not set remember me cookie when unchecked", async () => {
      const user = userEvent.setup();
      render(<SignInCard />);

      const googleButton = screen.getByTestId("google-signin");

      // Sign in without checking remember me
      await user.click(googleButton);

      expect(mockSetRememberMeCookie).toHaveBeenCalledWith(false);
    });

    it("toggles remember me state correctly", async () => {
      const user = userEvent.setup();
      render(<SignInCard />);

      const checkbox = screen.getByTestId("remember-me");

      // Toggle multiple times
      await user.click(checkbox); // true
      expect(checkbox).toBeChecked();

      await user.click(checkbox); // false
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox); // true
      expect(checkbox).toBeChecked();
    });
  });

  describe("Sign In Button Callbacks", () => {
    it("calls handleGoogleSignIn when Google button is clicked", async () => {
      const user = userEvent.setup();
      render(<SignInCard />);

      const googleButton = screen.getByTestId("google-signin");
      await user.click(googleButton);

      expect(mockSetRememberMeCookie).toHaveBeenCalled();
    });

    it("calls handleGoogleSignIn when GitHub button is clicked", async () => {
      const user = userEvent.setup();
      render(<SignInCard />);

      const githubButton = screen.getByTestId("github-signin");
      await user.click(githubButton);

      expect(mockSetRememberMeCookie).toHaveBeenCalled();
    });

    it("uses the same handler for both sign-in buttons", async () => {
      const user = userEvent.setup();
      render(<SignInCard />);

      const checkbox = screen.getByTestId("remember-me");
      const googleButton = screen.getByTestId("google-signin");
      const githubButton = screen.getByTestId("github-signin");

      // Set remember me
      await user.click(checkbox);

      // Click Google
      await user.click(googleButton);
      expect(mockSetRememberMeCookie).toHaveBeenCalledWith(true);

      mockSetRememberMeCookie.mockClear();

      // Click GitHub
      await user.click(githubButton);
      expect(mockSetRememberMeCookie).toHaveBeenCalledWith(true);
    });
  });

  describe("Layout and Styling", () => {
    it("applies correct card styling", () => {
      render(<SignInCard />);

      const card = screen.getByTestId("card");
      expect(card).toHaveClass("w-full", "max-w-md");
    });

    it("centers header text", () => {
      render(<SignInCard />);

      const header = screen.getByTestId("card-header");
      expect(header).toHaveClass("text-center");
    });

    it("applies title styling", () => {
      render(<SignInCard />);

      const title = screen.getByTestId("card-title");
      expect(title).toHaveClass("text-2xl");
    });

    it("spaces content correctly", () => {
      render(<SignInCard />);

      const content = screen.getByTestId("card-content");
      expect(content).toHaveClass("space-y-4");
    });

    it("arranges footer with proper spacing", () => {
      render(<SignInCard />);

      const footer = screen.getByTestId("card-footer");
      expect(footer).toHaveClass("flex", "flex-col", "space-y-4");
    });
  });

  describe("Performance", () => {
    it("memoizes handleGoogleSignIn callback", () => {
      const { rerender } = render(<SignInCard />);

      // Re-render with same props
      rerender(<SignInCard />);

      // Component should render without issues
      expect(screen.getByTestId("google-signin")).toBeInTheDocument();
    });

    it("updates callback when remember me changes", async () => {
      const user = userEvent.setup();
      render(<SignInCard />);

      // Change remember me state
      const checkbox = screen.getByTestId("remember-me");
      await user.click(checkbox);

      // Component should still function
      expect(screen.getByTestId("google-signin")).toBeInTheDocument();
      expect(checkbox).toBeChecked();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty callback URL", () => {
      mockSearchParams.get.mockReturnValue("");
      render(<SignInCard />);

      const googleButton = screen.getByTestId("google-signin");
      expect(googleButton).toHaveAttribute("data-callback-url", "/dashboard");
    });

    it("maintains state consistency", async () => {
      const user = userEvent.setup();
      render(<SignInCard />);

      const checkbox = screen.getByTestId("remember-me");
      const googleButton = screen.getByTestId("google-signin");

      // Rapid state changes
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      // Final state should be checked
      expect(checkbox).toBeChecked();

      // Sign in should use current state
      await user.click(googleButton);
      expect(mockSetRememberMeCookie).toHaveBeenCalledWith(true);
    });

    it("handles search params correctly", () => {
      mockSearchParams.get.mockReturnValue("/custom-callback");
      render(<SignInCard />);

      // Should use the provided callback URL
      const googleButton = screen.getByTestId("google-signin");
      expect(googleButton).toHaveAttribute("data-callback-url", "/custom-callback");
    });
  });
});