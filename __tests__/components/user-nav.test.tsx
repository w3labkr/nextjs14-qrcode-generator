import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserNav } from "@/components/user-nav";
import { useSession, signIn, signOut } from "next-auth/react";
import { logAuthAction } from "@/app/actions";
import axios from "axios";

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock axios
jest.mock("axios");

// Mock actions
jest.mock("@/app/actions", () => ({
  logAuthAction: jest.fn(),
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock UserProfile component
jest.mock("@/components/user-profile", () => ({
  UserProfile: ({ session }: any) => (
    <div data-testid="user-profile">
      User Profile: {session?.user?.name || "Unknown"}
    </div>
  ),
}));

// Mock UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild, variant, className, ...props }: any) =>
    asChild ? (
      <div data-variant={variant} className={className} {...props}>
        {children}
      </div>
    ) : (
      <button data-variant={variant} className={className} {...props}>
        {children}
      </button>
    ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, asChild, onSelect, className, ...props }: any) =>
    asChild ? (
      <div className={className} {...props}>
        {children}
      </div>
    ) : (
      <div
        className={className}
        onClick={onSelect}
        role="menuitem"
        {...props}
      >
        {children}
      </div>
    ),
  DropdownMenuSeparator: () => <div data-testid="dropdown-separator" />,
}));

jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, className }: any) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src }: any) => <img data-testid="avatar-image" src={src} alt="Avatar" />,
  AvatarFallback: ({ children }: any) => <div data-testid="avatar-fallback">{children}</div>,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  User: () => <div data-testid="user-icon">User</div>,
  History: () => <div data-testid="history-icon">History</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  LogOut: () => <div data-testid="logout-icon">LogOut</div>,
  Database: () => <div data-testid="database-icon">Database</div>,
  UserCog: () => <div data-testid="user-cog-icon">UserCog</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockLogAuthAction = logAuthAction as jest.MockedFunction<typeof logAuthAction>;
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("UserNav", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: { isAdmin: false } });
  });

  describe("Loading State", () => {
    it("shows loading spinner when session is loading", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      render(<UserNav />);

      const loadingSpinner = screen.getByRole("generic");
      expect(loadingSpinner).toHaveClass("animate-pulse", "bg-gray-200", "rounded-full");
    });

    it("loading spinner has correct dimensions", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      render(<UserNav />);

      const loadingSpinner = screen.getByRole("generic");
      expect(loadingSpinner).toHaveClass("h-8", "w-8");
    });
  });

  describe("Unauthenticated State", () => {
    it("shows login button when user is unauthenticated", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<UserNav />);

      const loginLink = screen.getByRole("link", { name: "로그인" });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/auth/signin");
    });

    it("shows login button when session is null", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "authenticated",
      });

      render(<UserNav />);

      const loginLink = screen.getByRole("link", { name: "로그인" });
      expect(loginLink).toBeInTheDocument();
    });

    it("login button has correct styling", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<UserNav />);

      const loginButton = screen.getByRole("link", { name: "로그인" }).parentElement;
      expect(loginButton).toHaveAttribute("data-variant", "outline");
    });
  });

  describe("Authenticated State", () => {
    const mockSession = {
      user: {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });
    });

    it("renders user avatar with correct image", async () => {
      render(<UserNav />);

      await waitFor(() => {
        const avatarImage = screen.getByTestId("avatar-image");
        expect(avatarImage).toHaveAttribute("src", "https://example.com/avatar.jpg");
      });
    });

    it("renders user avatar fallback when no image", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { name: "John Doe", email: "john@example.com" } },
        status: "authenticated",
      });

      render(<UserNav />);

      await waitFor(() => {
        const avatarFallback = screen.getByTestId("avatar-fallback");
        expect(avatarFallback).toHaveTextContent("J");
      });
    });

    it("renders default fallback when no name", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { email: "john@example.com" } },
        status: "authenticated",
      });

      render(<UserNav />);

      await waitFor(() => {
        const avatarFallback = screen.getByTestId("avatar-fallback");
        expect(avatarFallback).toHaveTextContent("U");
      });
    });

    it("renders user profile in dropdown", async () => {
      render(<UserNav />);

      await waitFor(() => {
        const userProfile = screen.getByTestId("user-profile");
        expect(userProfile).toHaveTextContent("User Profile: John Doe");
      });
    });

    it("renders navigation menu items", async () => {
      render(<UserNav />);

      await waitFor(() => {
        expect(screen.getByRole("link", { name: /대시보드/i })).toHaveAttribute("href", "/dashboard");
        expect(screen.getByRole("link", { name: /히스토리/i })).toHaveAttribute("href", "/dashboard/history");
        expect(screen.getByRole("link", { name: /설정/i })).toHaveAttribute("href", "/dashboard/settings");
      });
    });

    it("renders menu icons correctly", async () => {
      render(<UserNav />);

      await waitFor(() => {
        expect(screen.getByTestId("user-icon")).toBeInTheDocument();
        expect(screen.getByTestId("history-icon")).toBeInTheDocument();
        expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
        expect(screen.getByTestId("logout-icon")).toBeInTheDocument();
      });
    });

    it("renders dropdown separators", async () => {
      render(<UserNav />);

      await waitFor(() => {
        const separators = screen.getAllByTestId("dropdown-separator");
        expect(separators.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Admin Functionality", () => {
    const mockAdminSession = {
      user: {
        id: "admin-123",
        name: "Admin User",
        email: "admin@example.com",
        image: "https://example.com/admin.jpg",
      },
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockAdminSession,
        status: "authenticated",
      });
    });

    it("checks admin status on mount", async () => {
      render(<UserNav />);

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledWith("/api/admin/check");
      });
    });

    it("shows admin menu when user is admin", async () => {
      mockAxios.get.mockResolvedValue({ data: { isAdmin: true } });

      render(<UserNav />);

      await waitFor(() => {
        const adminLink = screen.getByRole("link", { name: /관리자 로그/i });
        expect(adminLink).toBeInTheDocument();
        expect(adminLink).toHaveAttribute("href", "/dashboard/admin/logs");
      });
    });

    it("does not show admin menu when user is not admin", async () => {
      mockAxios.get.mockResolvedValue({ data: { isAdmin: false } });

      render(<UserNav />);

      await waitFor(() => {
        const adminLink = screen.queryByRole("link", { name: /관리자 로그/i });
        expect(adminLink).not.toBeInTheDocument();
      });
    });

    it("handles admin status check error", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockAxios.get.mockRejectedValue(new Error("API Error"));

      render(<UserNav />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("관리자 권한 확인 실패:", expect.any(Error));
      });

      // Should not show admin menu on error
      const adminLink = screen.queryByRole("link", { name: /관리자 로그/i });
      expect(adminLink).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("renders admin menu icon", async () => {
      mockAxios.get.mockResolvedValue({ data: { isAdmin: true } });

      render(<UserNav />);

      await waitFor(() => {
        expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
      });
    });
  });

  describe("Logout Functionality", () => {
    const mockSession = {
      user: {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
      },
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });
    });

    it("logs auth action before logout", async () => {
      render(<UserNav />);

      await waitFor(() => {
        const logoutButton = screen.getByRole("menuitem", { name: /로그아웃/i });
        expect(logoutButton).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole("menuitem", { name: /로그아웃/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogAuthAction).toHaveBeenCalledWith({
          action: "로그아웃",
          authAction: "LOGOUT",
        });
      });
    });

    it("calls signOut after logging action", async () => {
      render(<UserNav />);

      await waitFor(() => {
        const logoutButton = screen.getByRole("menuitem", { name: /로그아웃/i });
        expect(logoutButton).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole("menuitem", { name: /로그아웃/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/" });
      });
    });

    it("handles logout logging error gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockLogAuthAction.mockRejectedValue(new Error("Logging failed"));

      render(<UserNav />);

      await waitFor(() => {
        const logoutButton = screen.getByRole("menuitem", { name: /로그아웃/i });
        expect(logoutButton).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole("menuitem", { name: /로그아웃/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("로그아웃 로그 기록 실패:", expect.any(Error));
        expect(mockSignOut).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it("does not log auth action when no user id", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { name: "John Doe" } },
        status: "authenticated",
      });

      render(<UserNav />);

      await waitFor(() => {
        const logoutButton = screen.getByRole("menuitem", { name: /로그아웃/i });
        expect(logoutButton).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole("menuitem", { name: /로그아웃/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogAuthAction).not.toHaveBeenCalled();
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  describe("User Interactions", () => {
    const mockSession = {
      user: {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        image: "https://example.com/avatar.jpg",
      },
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });
    });

    it("dropdown menu has correct structure", async () => {
      render(<UserNav />);

      await waitFor(() => {
        expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument();
        expect(screen.getByTestId("dropdown-trigger")).toBeInTheDocument();
        expect(screen.getByTestId("dropdown-content")).toBeInTheDocument();
      });
    });

    it("avatar button has correct styling", async () => {
      render(<UserNav />);

      await waitFor(() => {
        const avatarButton = screen.getByRole("button");
        expect(avatarButton).toHaveAttribute("data-variant", "ghost");
        expect(avatarButton).toHaveClass("relative", "h-8", "w-8", "rounded-full");
      });
    });

    it("dropdown content has correct alignment", async () => {
      render(<UserNav />);

      await waitFor(() => {
        const dropdownContent = screen.getByTestId("dropdown-content");
        expect(dropdownContent).toHaveClass("w-56");
      });
    });

    it("logout button has cursor pointer", async () => {
      render(<UserNav />);

      await waitFor(() => {
        const logoutButton = screen.getByRole("menuitem", { name: /로그아웃/i });
        expect(logoutButton).toHaveClass("cursor-pointer");
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles session with minimal user data", async () => {
      mockUseSession.mockReturnValue({
        data: { user: {} },
        status: "authenticated",
      });

      render(<UserNav />);

      await waitFor(() => {
        const avatarFallback = screen.getByTestId("avatar-fallback");
        expect(avatarFallback).toHaveTextContent("U");
      });
    });

    it("handles session with empty user name", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { name: "" } },
        status: "authenticated",
      });

      render(<UserNav />);

      await waitFor(() => {
        const avatarFallback = screen.getByTestId("avatar-fallback");
        expect(avatarFallback).toHaveTextContent("U");
      });
    });

    it("handles session with null user", async () => {
      mockUseSession.mockReturnValue({
        data: { user: null },
        status: "authenticated",
      });

      render(<UserNav />);

      const loginLink = screen.getByRole("link", { name: "로그인" });
      expect(loginLink).toBeInTheDocument();
    });

    it("handles admin check with no session", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { name: "John" } },
        status: "authenticated",
      });

      render(<UserNav />);

      await waitFor(() => {
        expect(mockAxios.get).not.toHaveBeenCalled();
      });
    });

    it("handles admin check with no email", async () => {
      mockUseSession.mockReturnValue({
        data: { user: { name: "John", id: "123" } },
        status: "authenticated",
      });

      render(<UserNav />);

      await waitFor(() => {
        expect(mockAxios.get).not.toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    const mockSession = {
      user: {
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
      },
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
      });
    });

    it("avatar button is keyboard accessible", async () => {
      render(<UserNav />);

      await waitFor(() => {
        const avatarButton = screen.getByRole("button");
        expect(avatarButton).toBeInTheDocument();
      });
    });

    it("navigation links are accessible", async () => {
      render(<UserNav />);

      await waitFor(() => {
        const dashboardLink = screen.getByRole("link", { name: /대시보드/i });
        const historyLink = screen.getByRole("link", { name: /히스토리/i });
        const settingsLink = screen.getByRole("link", { name: /설정/i });
        
        expect(dashboardLink).toBeInTheDocument();
        expect(historyLink).toBeInTheDocument();
        expect(settingsLink).toBeInTheDocument();
      });
    });

    it("logout item has correct role", async () => {
      render(<UserNav />);

      await waitFor(() => {
        const logoutItem = screen.getByRole("menuitem", { name: /로그아웃/i });
        expect(logoutItem).toBeInTheDocument();
      });
    });

    it("avatar has correct alt text", async () => {
      render(<UserNav />);

      await waitFor(() => {
        const avatarImage = screen.getByTestId("avatar-image");
        expect(avatarImage).toHaveAttribute("alt", "Avatar");
      });
    });
  });
});