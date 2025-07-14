import React from "react";
import { render, screen } from "@testing-library/react";
import AdminLayout from "@/app/dashboard/admin/layout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminEmails } from "@/lib/env-validation";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/lib/env-validation", () => ({
  getAdminEmails: jest.fn(),
}));

jest.mock("@/components/access-denied-alert", () => ({
  AccessDeniedAlert: () => <div data-testid="access-denied">Access Denied</div>,
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockGetAdminEmails = getAdminEmails as jest.MockedFunction<typeof getAdminEmails>;

describe("AdminLayout", () => {
  const mockChildren = <div data-testid="admin-content">Admin Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to returning admin emails
    mockGetAdminEmails.mockReturnValue(["admin@example.com", "super@example.com"]);
  });

  describe("Authentication and Authorization", () => {
    it("redirects to signin when no session exists", async () => {
      mockAuth.mockResolvedValue(null);

      await AdminLayout({ children: mockChildren });

      expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
    });

    it("redirects to signin when session exists but no user", async () => {
      mockAuth.mockResolvedValue({
        expires: "2024-12-31T23:59:59.000Z",
      } as any);

      await AdminLayout({ children: mockChildren });

      expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
    });

    it("redirects to signin when user exists but no email", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "user-123" },
        expires: "2024-12-31T23:59:59.000Z",
      } as any);

      await AdminLayout({ children: mockChildren });

      expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
    });

    it("shows access denied for non-admin users", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-123",
          email: "regular@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      const result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);

      expect(screen.getByTestId("access-denied")).toBeInTheDocument();
      expect(screen.queryByTestId("admin-content")).not.toBeInTheDocument();
    });

    it("renders children for admin users", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      const result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);

      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
      expect(screen.queryByTestId("access-denied")).not.toBeInTheDocument();
    });

    it("handles case-insensitive admin email comparison", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: "ADMIN@EXAMPLE.COM", // Uppercase
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      mockGetAdminEmails.mockReturnValue(["admin@example.com"]); // Lowercase

      const result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);

      // Should still grant access due to case-insensitive comparison
      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    });
  });

  describe("Admin Email Configuration", () => {
    it("denies access when no admin emails are configured", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      mockGetAdminEmails.mockReturnValue([]); // No admin emails

      const result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);

      expect(screen.getByTestId("access-denied")).toBeInTheDocument();
    });

    it("grants access when user email is in admin list", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: "super@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      const result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);

      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    });

    it("handles multiple admin emails correctly", async () => {
      mockGetAdminEmails.mockReturnValue([
        "admin1@example.com",
        "admin2@example.com",
        "super@example.com",
      ]);

      // Test first admin
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-1",
          email: "admin1@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      let result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);
      expect(screen.getByTestId("admin-content")).toBeInTheDocument();

      // Clear and test second admin
      jest.clearAllMocks();
      mockGetAdminEmails.mockReturnValue([
        "admin1@example.com",
        "admin2@example.com",
        "super@example.com",
      ]);

      mockAuth.mockResolvedValue({
        user: {
          id: "admin-2",
          email: "admin2@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);
      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles auth function throwing an error", async () => {
      mockAuth.mockRejectedValue(new Error("Auth service unavailable"));

      await expect(AdminLayout({ children: mockChildren })).rejects.toThrow(
        "Auth service unavailable"
      );
    });

    it("handles getAdminEmails throwing an error", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      mockGetAdminEmails.mockImplementation(() => {
        throw new Error("Environment configuration error");
      });

      await expect(AdminLayout({ children: mockChildren })).rejects.toThrow(
        "Environment configuration error"
      );
    });

    it("handles malformed session data gracefully", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: null, // Malformed email
        },
        expires: "2024-12-31T23:59:59.000Z",
      } as any);

      await AdminLayout({ children: mockChildren });

      expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
    });

    it("handles session with undefined user email", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: undefined,
        },
        expires: "2024-12-31T23:59:59.000Z",
      } as any);

      await AdminLayout({ children: mockChildren });

      expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
    });
  });

  describe("Security Edge Cases", () => {
    it("denies access for empty email string", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: "",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      await AdminLayout({ children: mockChildren });

      expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
    });

    it("denies access for whitespace-only email", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: "   ",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      const result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);

      expect(screen.getByTestId("access-denied")).toBeInTheDocument();
    });

    it("prevents admin privilege escalation attempts", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "user-123",
          email: "admin@example.com.fake.com", // Similar but not exact
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      const result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);

      expect(screen.getByTestId("access-denied")).toBeInTheDocument();
    });

    it("handles unicode characters in email addresses", async () => {
      const unicodeEmail = "админ@пример.рф";
      
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: unicodeEmail,
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      mockGetAdminEmails.mockReturnValue([unicodeEmail]);

      const result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);

      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    });

    it("is not vulnerable to email header injection", async () => {
      const maliciousEmail = "admin@example.com\r\nBcc: attacker@evil.com";
      
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: maliciousEmail,
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      mockGetAdminEmails.mockReturnValue(["admin@example.com"]);

      const result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);

      // Should deny access due to exact string matching
      expect(screen.getByTestId("access-denied")).toBeInTheDocument();
    });

    it("handles extremely long email addresses", async () => {
      const longEmail = "a".repeat(1000) + "@example.com";
      
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: longEmail,
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      mockGetAdminEmails.mockReturnValue([longEmail]);

      const result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);

      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    });
  });

  describe("Session Validation", () => {
    it("handles expired sessions", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        expires: "2020-01-01T00:00:00.000Z", // Expired
      });

      // Layout should still grant access if session is returned by auth()
      // Session expiry validation is handled by the auth middleware
      const result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);

      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    });

    it("handles session without expiry date", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        // Missing expires field
      } as any);

      const result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);

      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    });

    it("handles session with malformed expiry date", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        expires: "invalid-date",
      } as any);

      const result = await AdminLayout({ children: mockChildren });
      render(result as React.ReactElement);

      expect(screen.getByTestId("admin-content")).toBeInTheDocument();
    });
  });

  describe("Component Rendering", () => {
    it("renders complex children components", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      const complexChildren = (
        <div>
          <h1>Admin Dashboard</h1>
          <div data-testid="admin-content">
            <p>Welcome to admin panel</p>
            <button>Admin Action</button>
          </div>
        </div>
      );

      const result = await AdminLayout({ children: complexChildren });
      render(result as React.ReactElement);

      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Welcome to admin panel")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Admin Action" })).toBeInTheDocument();
    });

    it("handles null children gracefully", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      const result = await AdminLayout({ children: null });
      render(result as React.ReactElement);

      // Should render without errors
      expect(screen.queryByTestId("access-denied")).not.toBeInTheDocument();
    });

    it("preserves children props and context", async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        expires: "2024-12-31T23:59:59.000Z",
      });

      const ChildComponent = ({ testProp }: { testProp: string }) => (
        <div data-testid="child-component">{testProp}</div>
      );

      const childrenWithProps = <ChildComponent testProp="test-value" />;
      const result = await AdminLayout({ children: childrenWithProps });
      render(result as React.ReactElement);

      expect(screen.getByTestId("child-component")).toHaveTextContent("test-value");
    });
  });
});