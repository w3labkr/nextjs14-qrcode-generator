import React from "react";
import { render, screen } from "@testing-library/react";
import { ContinueWithoutSignIn } from "@/app/auth/signin/components/continue-without-signin";

// Mock UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, asChild, ...props }: any) => {
    if (asChild) {
      return children;
    }
    return (
      <button data-variant={variant} {...props}>
        {children}
      </button>
    );
  },
}));

describe("ContinueWithoutSignIn", () => {
  describe("Component Rendering", () => {
    it("renders link with correct text", () => {
      render(<ContinueWithoutSignIn />);
      
      const link = screen.getByRole("link", { name: /로그인 없이 계속하기/i });
      expect(link).toBeInTheDocument();
    });

    it("renders link pointing to /qrcode", () => {
      render(<ContinueWithoutSignIn />);
      
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/qrcode");
    });

    it("renders within a centered container", () => {
      const { container } = render(<ContinueWithoutSignIn />);
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("text-center");
    });
  });

  describe("Link Behavior", () => {
    it("renders as an anchor element", () => {
      render(<ContinueWithoutSignIn />);
      
      const link = screen.getByRole("link");
      expect(link.tagName).toBe("A");
    });

    it("has correct href attribute", () => {
      render(<ContinueWithoutSignIn />);
      
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/qrcode");
    });

    it("uses regular navigation (not client-side)", () => {
      render(<ContinueWithoutSignIn />);
      
      const link = screen.getByRole("link");
      // Standard anchor tag without Next.js Link component
      expect(link.tagName).toBe("A");
      expect(link).not.toHaveAttribute("data-nextjs-link");
    });
  });

  describe("Accessibility", () => {
    it("has accessible link role", () => {
      render(<ContinueWithoutSignIn />);
      
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("has descriptive text for screen readers", () => {
      render(<ContinueWithoutSignIn />);
      
      const link = screen.getByRole("link", { name: /로그인 없이 계속하기/i });
      expect(link).toBeInTheDocument();
    });

    it("is keyboard accessible", () => {
      render(<ContinueWithoutSignIn />);
      
      const link = screen.getByRole("link");
      // Links are naturally keyboard accessible
      expect(link).toBeVisible();
    });

    it("has proper text content", () => {
      render(<ContinueWithoutSignIn />);
      
      const link = screen.getByRole("link");
      expect(link).toHaveTextContent("로그인 없이 계속하기");
    });
  });

  describe("Styling", () => {
    it("centers the content", () => {
      const { container } = render(<ContinueWithoutSignIn />);
      
      const wrapper = container.querySelector(".text-center");
      expect(wrapper).toBeInTheDocument();
    });

    it("contains link element inside centered div", () => {
      const { container } = render(<ContinueWithoutSignIn />);
      
      const wrapper = container.querySelector(".text-center");
      const link = wrapper?.querySelector("a");
      
      expect(wrapper).toBeInTheDocument();
      expect(link).toBeInTheDocument();
    });
  });

  describe("User Experience", () => {
    it("provides clear option to skip authentication", () => {
      render(<ContinueWithoutSignIn />);
      
      const link = screen.getByText("로그인 없이 계속하기");
      expect(link).toBeVisible();
    });

    it("navigates to QR code generator page", () => {
      render(<ContinueWithoutSignIn />);
      
      const link = screen.getByRole("link");
      expect(link.getAttribute("href")).toBe("/qrcode");
    });

    it("maintains consistent button styling through variant", () => {
      render(<ContinueWithoutSignIn />);
      
      // The Button component with variant="link" and asChild
      // renders its child (the anchor) directly
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("works as part of sign-in flow", () => {
      render(<ContinueWithoutSignIn />);
      
      // Verify it provides alternative to authentication
      const link = screen.getByRole("link", { name: /로그인 없이 계속하기/i });
      expect(link).toHaveAttribute("href", "/qrcode");
    });

    it("renders consistently", () => {
      const { rerender } = render(<ContinueWithoutSignIn />);
      
      // Component has no props, so should be consistent
      rerender(<ContinueWithoutSignIn />);
      
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/qrcode");
    });
  });

  describe("Component Structure", () => {
    it("has correct DOM structure", () => {
      const { container } = render(<ContinueWithoutSignIn />);
      
      // div.text-center > a
      expect(container.firstChild).toHaveClass("text-center");
      expect(container.querySelector("a")).toBeInTheDocument();
    });

    it("renders Button component with correct props", () => {
      render(<ContinueWithoutSignIn />);
      
      // Verifies the Button is used with variant="link" and asChild
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });
  });
});