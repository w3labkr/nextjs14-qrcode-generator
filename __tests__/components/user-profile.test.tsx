import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Session } from "next-auth";
import { UserProfile } from "@/components/user-profile";

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock UI components
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenuItem: ({ children, asChild, ...props }: any) =>
    asChild ? (
      <div data-testid="dropdown-menu-item" {...props}>
        {children}
      </div>
    ) : (
      <div data-testid="dropdown-menu-item" {...props}>
        {children}
      </div>
    ),
}));

// Mock lucide-react
jest.mock("lucide-react", () => ({
  User: ({ className }: any) => (
    <div data-testid="user-icon" className={className}>
      User
    </div>
  ),
}));

describe("UserProfile", () => {
  const mockSession: Session = {
    user: {
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      image: "https://example.com/avatar.jpg",
    },
    expires: "2024-12-31T23:59:59.000Z",
  };

  describe("Component Rendering", () => {
    it("renders with complete user session", () => {
      render(<UserProfile session={mockSession} />);

      expect(screen.getByTestId("dropdown-menu-item")).toBeInTheDocument();
      expect(screen.getByRole("link")).toBeInTheDocument();
    });

    it("links to account dashboard", () => {
      render(<UserProfile session={mockSession} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/dashboard/account");
    });

    it("has correct styling classes", () => {
      render(<UserProfile session={mockSession} />);

      const link = screen.getByRole("link");
      expect(link).toHaveClass("flex", "items-center", "justify-start", "gap-2", "p-2");
    });

    it("uses DropdownMenuItem with asChild prop", () => {
      render(<UserProfile session={mockSession} />);

      const dropdownItem = screen.getByTestId("dropdown-menu-item");
      const link = screen.getByRole("link");

      expect(dropdownItem).toContainElement(link);
    });
  });

  describe("User Name Display", () => {
    it("displays user name when available", () => {
      render(<UserProfile session={mockSession} />);

      const nameElement = screen.getByText("John Doe");
      expect(nameElement).toBeInTheDocument();
      expect(nameElement).toHaveClass("font-medium");
    });

    it("does not display name when not available", () => {
      const sessionWithoutName: Session = {
        ...mockSession,
        user: { ...mockSession.user, name: null },
      };

      render(<UserProfile session={sessionWithoutName} />);

      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    it("handles empty name string", () => {
      const sessionWithEmptyName: Session = {
        ...mockSession,
        user: { ...mockSession.user, name: "" },
      };

      render(<UserProfile session={sessionWithEmptyName} />);

      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    it("displays different user names", () => {
      const differentNames = ["Jane Smith", "김철수", "José García", "山田太郎"];

      differentNames.forEach((name) => {
        const sessionWithDifferentName: Session = {
          ...mockSession,
          user: { ...mockSession.user, name },
        };

        const { unmount } = render(<UserProfile session={sessionWithDifferentName} />);

        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByText(name)).toHaveClass("font-medium");

        unmount();
      });
    });
  });

  describe("User Email Display", () => {
    it("displays user email when available", () => {
      render(<UserProfile session={mockSession} />);

      const emailElement = screen.getByText("john@example.com");
      expect(emailElement).toBeInTheDocument();
      expect(emailElement).toHaveClass("w-[200px]", "truncate", "text-sm", "text-muted-foreground");
    });

    it("does not display email when not available", () => {
      const sessionWithoutEmail: Session = {
        ...mockSession,
        user: { ...mockSession.user, email: null },
      };

      render(<UserProfile session={sessionWithoutEmail} />);

      expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
    });

    it("handles empty email string", () => {
      const sessionWithEmptyEmail: Session = {
        ...mockSession,
        user: { ...mockSession.user, email: "" },
      };

      render(<UserProfile session={sessionWithEmptyEmail} />);

      expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
    });

    it("displays different email addresses", () => {
      const differentEmails = [
        "jane@example.com",
        "admin@company.co.kr",
        "user.name+tag@domain.com",
        "very.long.email.address@subdomain.example.com",
      ];

      differentEmails.forEach((email) => {
        const sessionWithDifferentEmail: Session = {
          ...mockSession,
          user: { ...mockSession.user, email },
        };

        const { unmount } = render(<UserProfile session={sessionWithDifferentEmail} />);

        expect(screen.getByText(email)).toBeInTheDocument();
        expect(screen.getByText(email)).toHaveClass("w-[200px]", "truncate", "text-sm", "text-muted-foreground");

        unmount();
      });
    });

    it("truncates long email addresses", () => {
      const longEmail = "very.long.email.address.that.should.be.truncated@subdomain.example.com";
      const sessionWithLongEmail: Session = {
        ...mockSession,
        user: { ...mockSession.user, email: longEmail },
      };

      render(<UserProfile session={sessionWithLongEmail} />);

      const emailElement = screen.getByText(longEmail);
      expect(emailElement).toHaveClass("truncate");
    });
  });

  describe("Layout and Structure", () => {
    it("has correct container structure", () => {
      render(<UserProfile session={mockSession} />);

      const link = screen.getByRole("link");
      const container = link.querySelector(".flex.flex-col");

      expect(container).toBeInTheDocument();
      expect(container).toHaveClass("flex", "flex-col", "space-y-1", "leading-none");
    });

    it("displays name and email in vertical layout", () => {
      render(<UserProfile session={mockSession} />);

      const nameElement = screen.getByText("John Doe");
      const emailElement = screen.getByText("john@example.com");
      const container = nameElement.parentElement;

      expect(container).toContainElement(nameElement);
      expect(container).toContainElement(emailElement);
      expect(container).toHaveClass("flex-col");
    });

    it("maintains proper spacing between elements", () => {
      render(<UserProfile session={mockSession} />);

      const container = screen.getByText("John Doe").parentElement;
      expect(container).toHaveClass("space-y-1");
    });

    it("uses semantic HTML structure", () => {
      render(<UserProfile session={mockSession} />);

      const nameElement = screen.getByText("John Doe");
      const emailElement = screen.getByText("john@example.com");

      expect(nameElement.tagName).toBe("P");
      expect(emailElement.tagName).toBe("P");
    });
  });

  describe("Session Variations", () => {
    it("renders with only name", () => {
      const sessionWithOnlyName: Session = {
        ...mockSession,
        user: { ...mockSession.user, email: null },
      };

      render(<UserProfile session={sessionWithOnlyName} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
    });

    it("renders with only email", () => {
      const sessionWithOnlyEmail: Session = {
        ...mockSession,
        user: { ...mockSession.user, name: null },
      };

      render(<UserProfile session={sessionWithOnlyEmail} />);

      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    it("renders with neither name nor email", () => {
      const sessionWithoutNameOrEmail: Session = {
        ...mockSession,
        user: { ...mockSession.user, name: null, email: null },
      };

      render(<UserProfile session={sessionWithoutNameOrEmail} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/dashboard/account");
    });

    it("handles missing user object", () => {
      const sessionWithoutUser: Session = {
        ...mockSession,
        user: undefined,
      };

      render(<UserProfile session={sessionWithoutUser} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("handles minimal user object", () => {
      const sessionWithMinimalUser: Session = {
        ...mockSession,
        user: { id: "user-123" },
      };

      render(<UserProfile session={sessionWithMinimalUser} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper link role", () => {
      render(<UserProfile session={mockSession} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("has accessible link text", () => {
      render(<UserProfile session={mockSession} />);

      const link = screen.getByRole("link");
      expect(link).toHaveTextContent("John Doe");
      expect(link).toHaveTextContent("john@example.com");
    });

    it("is keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<UserProfile session={mockSession} />);

      const link = screen.getByRole("link");

      // Focus with tab
      await user.tab();
      expect(link).toHaveFocus();
    });

    it("can be activated with Enter key", async () => {
      const user = userEvent.setup();
      render(<UserProfile session={mockSession} />);

      const link = screen.getByRole("link");
      link.focus();

      // Should be able to activate with Enter
      await user.keyboard("{Enter}");
      expect(link).toHaveFocus();
    });

    it("has proper text contrast classes", () => {
      render(<UserProfile session={mockSession} />);

      const nameElement = screen.getByText("John Doe");
      const emailElement = screen.getByText("john@example.com");

      expect(nameElement).toHaveClass("font-medium");
      expect(emailElement).toHaveClass("text-muted-foreground");
    });
  });

  describe("Navigation", () => {
    it("navigates to account dashboard", () => {
      render(<UserProfile session={mockSession} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/dashboard/account");
    });

    it("uses Next.js Link component", () => {
      render(<UserProfile session={mockSession} />);

      const link = screen.getByRole("link");
      expect(link.tagName).toBe("A");
    });

    it("maintains href consistency", () => {
      const { rerender } = render(<UserProfile session={mockSession} />);

      let link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/dashboard/account");

      const updatedSession = { ...mockSession, user: { ...mockSession.user, name: "Updated Name" } };
      rerender(<UserProfile session={updatedSession} />);

      link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/dashboard/account");
    });
  });

  describe("TypeScript Interface", () => {
    it("accepts Session type", () => {
      const validSession: Session = {
        user: {
          id: "user-456",
          name: "Test User",
          email: "test@example.com",
          image: "https://example.com/test.jpg",
        },
        expires: "2024-12-31T23:59:59.000Z",
      };

      render(<UserProfile session={validSession} />);

      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("handles optional user properties", () => {
      const sessionWithOptionalProps: Session = {
        user: {
          id: "user-789",
          name: "Optional Props User",
          // email is optional
          // image is optional
        },
        expires: "2024-12-31T23:59:59.000Z",
      };

      render(<UserProfile session={sessionWithOptionalProps} />);

      expect(screen.getByText("Optional Props User")).toBeInTheDocument();
    });

    it("works with different session structures", () => {
      const extendedSession: Session = {
        user: {
          id: "user-extended",
          name: "Extended User",
          email: "extended@example.com",
          image: "https://example.com/extended.jpg",
        },
        expires: "2024-12-31T23:59:59.000Z",
      };

      render(<UserProfile session={extendedSession} />);

      expect(screen.getByText("Extended User")).toBeInTheDocument();
      expect(screen.getByText("extended@example.com")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("does not cause unnecessary re-renders", () => {
      const { rerender } = render(<UserProfile session={mockSession} />);

      // Same session should not cause issues
      rerender(<UserProfile session={mockSession} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    it("handles session changes correctly", () => {
      const { rerender } = render(<UserProfile session={mockSession} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();

      const updatedSession: Session = {
        ...mockSession,
        user: { ...mockSession.user, name: "Jane Doe", email: "jane@example.com" },
      };

      rerender(<UserProfile session={updatedSession} />);

      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      expect(screen.queryByText("john@example.com")).not.toBeInTheDocument();
    });

    it("maintains stable link href", () => {
      const { rerender } = render(<UserProfile session={mockSession} />);

      let link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/dashboard/account");

      const updatedSession = { ...mockSession, user: { ...mockSession.user, name: "Updated Name" } };
      rerender(<UserProfile session={updatedSession} />);

      link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/dashboard/account");
    });
  });

  describe("Edge Cases", () => {
    it("handles null session user", () => {
      const sessionWithNullUser: Session = {
        ...mockSession,
        user: null,
      };

      render(<UserProfile session={sessionWithNullUser} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/dashboard/account");
    });

    it("handles undefined session user", () => {
      const sessionWithUndefinedUser: Session = {
        ...mockSession,
        user: undefined,
      };

      render(<UserProfile session={sessionWithUndefinedUser} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/dashboard/account");
    });

    it("handles special characters in user data", () => {
      const sessionWithSpecialChars: Session = {
        ...mockSession,
        user: {
          ...mockSession.user,
          name: "José García-Martínez",
          email: "josé.garcía+test@example.com",
        },
      };

      render(<UserProfile session={sessionWithSpecialChars} />);

      expect(screen.getByText("José García-Martínez")).toBeInTheDocument();
      expect(screen.getByText("josé.garcía+test@example.com")).toBeInTheDocument();
    });

    it("handles very long user names", () => {
      const sessionWithLongName: Session = {
        ...mockSession,
        user: {
          ...mockSession.user,
          name: "This is a very long user name that might cause layout issues",
        },
      };

      render(<UserProfile session={sessionWithLongName} />);

      const nameElement = screen.getByText("This is a very long user name that might cause layout issues");
      expect(nameElement).toBeInTheDocument();
      expect(nameElement).toHaveClass("font-medium");
    });

    it("handles empty strings in user data", () => {
      const sessionWithEmptyStrings: Session = {
        ...mockSession,
        user: {
          ...mockSession.user,
          name: "",
          email: "",
        },
      };

      render(<UserProfile session={sessionWithEmptyStrings} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      // Empty strings should not render
      expect(link).not.toHaveTextContent("John Doe");
      expect(link).not.toHaveTextContent("john@example.com");
    });
  });

  describe("Component Integration", () => {
    it("integrates with DropdownMenuItem", () => {
      render(<UserProfile session={mockSession} />);

      const dropdownItem = screen.getByTestId("dropdown-menu-item");
      expect(dropdownItem).toBeInTheDocument();
    });

    it("integrates with Next.js Link", () => {
      render(<UserProfile session={mockSession} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/dashboard/account");
    });

    it("maintains component composition", () => {
      render(<UserProfile session={mockSession} />);

      const dropdownItem = screen.getByTestId("dropdown-menu-item");
      const link = screen.getByRole("link");

      expect(dropdownItem).toContainElement(link);
    });
  });
});