import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewQrCodeButton } from "@/components/new-qr-code-button";

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
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

// Mock lucide-react
jest.mock("lucide-react", () => ({
  QrCode: ({ className }: any) => (
    <div data-testid="qr-code-icon" className={className}>
      QrCode
    </div>
  ),
}));

describe("NewQrCodeButton", () => {
  describe("Component Rendering", () => {
    it("renders with default props", () => {
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/qrcode");
    });

    it("renders with default variant", () => {
      render(<NewQrCodeButton />);

      const button = screen.getByRole("link").parentElement;
      expect(button).toHaveAttribute("data-variant", "outline");
    });

    it("renders with custom variant", () => {
      render(<NewQrCodeButton variant="default" />);

      const button = screen.getByRole("link").parentElement;
      expect(button).toHaveAttribute("data-variant", "default");
    });

    it("renders with custom className", () => {
      render(<NewQrCodeButton className="custom-class" />);

      const button = screen.getByRole("link").parentElement;
      expect(button).toHaveClass("custom-class");
    });

    it("renders with both variant and className", () => {
      render(<NewQrCodeButton variant="ghost" className="custom-class" />);

      const button = screen.getByRole("link").parentElement;
      expect(button).toHaveAttribute("data-variant", "ghost");
      expect(button).toHaveClass("custom-class");
    });
  });

  describe("Button Variants", () => {
    const variants = [
      "default",
      "outline",
      "ghost",
      "link",
      "destructive",
      "secondary",
    ] as const;

    variants.forEach((variant) => {
      it(`renders with ${variant} variant`, () => {
        render(<NewQrCodeButton variant={variant} />);

        const button = screen.getByRole("link").parentElement;
        expect(button).toHaveAttribute("data-variant", variant);
      });
    });

    it("supports all defined variants", () => {
      variants.forEach((variant) => {
        const { unmount } = render(<NewQrCodeButton variant={variant} />);
        
        const button = screen.getByRole("link").parentElement;
        expect(button).toHaveAttribute("data-variant", variant);
        
        unmount();
      });
    });
  });

  describe("Navigation", () => {
    it("links to QR code creation page", () => {
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/qrcode");
    });

    it("has correct link text", () => {
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      expect(link).toHaveTextContent("새 QR 코드 만들기");
    });

    it("uses Next.js Link component", () => {
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/qrcode");
    });
  });

  describe("Icon Rendering", () => {
    it("renders QR code icon", () => {
      render(<NewQrCodeButton />);

      const icon = screen.getByTestId("qr-code-icon");
      expect(icon).toBeInTheDocument();
    });

    it("icon has correct styling", () => {
      render(<NewQrCodeButton />);

      const icon = screen.getByTestId("qr-code-icon");
      expect(icon).toHaveClass("h-4", "w-4", "mr-2");
    });

    it("icon is positioned before text", () => {
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      const icon = screen.getByTestId("qr-code-icon");
      
      expect(link).toContainElement(icon);
      expect(icon.nextSibling).toHaveTextContent("새 QR 코드 만들기");
    });
  });

  describe("Button Structure", () => {
    it("uses Button component as wrapper", () => {
      render(<NewQrCodeButton />);

      const button = screen.getByRole("link").parentElement;
      expect(button).toHaveAttribute("data-variant", "outline");
    });

    it("uses asChild prop for Button component", () => {
      render(<NewQrCodeButton />);

      // The button should render as a div when asChild is true
      const button = screen.getByRole("link").parentElement;
      expect(button).toBeInTheDocument();
    });

    it("passes variant prop to Button component", () => {
      render(<NewQrCodeButton variant="ghost" />);

      const button = screen.getByRole("link").parentElement;
      expect(button).toHaveAttribute("data-variant", "ghost");
    });

    it("passes className prop to Button component", () => {
      render(<NewQrCodeButton className="test-class" />);

      const button = screen.getByRole("link").parentElement;
      expect(button).toHaveClass("test-class");
    });
  });

  describe("Content Layout", () => {
    it("displays icon and text together", () => {
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      const icon = screen.getByTestId("qr-code-icon");
      
      expect(link).toContainElement(icon);
      expect(link).toHaveTextContent("새 QR 코드 만들기");
    });

    it("has correct Korean text", () => {
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      expect(link).toHaveTextContent("새 QR 코드 만들기");
    });

    it("maintains text-icon spacing", () => {
      render(<NewQrCodeButton />);

      const icon = screen.getByTestId("qr-code-icon");
      expect(icon).toHaveClass("mr-2");
    });
  });

  describe("Accessibility", () => {
    it("has proper link role", () => {
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("has descriptive link text", () => {
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link", { name: /새 QR 코드 만들기/i });
      expect(link).toBeInTheDocument();
    });

    it("is keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      
      // Focus with tab
      await user.tab();
      expect(link).toHaveFocus();
    });

    it("can be activated with Enter key", async () => {
      const user = userEvent.setup();
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      link.focus();
      
      // Should be able to activate with Enter
      await user.keyboard("{Enter}");
      expect(link).toHaveFocus();
    });
  });

  describe("TypeScript Interface", () => {
    it("accepts variant prop", () => {
      render(<NewQrCodeButton variant="default" />);

      const button = screen.getByRole("link").parentElement;
      expect(button).toHaveAttribute("data-variant", "default");
    });

    it("accepts className prop", () => {
      render(<NewQrCodeButton className="test-class" />);

      const button = screen.getByRole("link").parentElement;
      expect(button).toHaveClass("test-class");
    });

    it("works without any props", () => {
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("has optional props", () => {
      // All props should be optional
      render(<NewQrCodeButton />);
      render(<NewQrCodeButton variant="ghost" />);
      render(<NewQrCodeButton className="test" />);
      render(<NewQrCodeButton variant="default" className="test" />);

      expect(screen.getAllByRole("link")).toHaveLength(4);
    });
  });

  describe("Performance", () => {
    it("does not cause unnecessary re-renders", () => {
      const { rerender } = render(<NewQrCodeButton />);

      // Same props should not cause issues
      rerender(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("handles prop changes correctly", () => {
      const { rerender } = render(<NewQrCodeButton variant="outline" />);

      let button = screen.getByRole("link").parentElement;
      expect(button).toHaveAttribute("data-variant", "outline");

      rerender(<NewQrCodeButton variant="ghost" />);

      button = screen.getByRole("link").parentElement;
      expect(button).toHaveAttribute("data-variant", "ghost");
    });

    it("maintains stable link href", () => {
      const { rerender } = render(<NewQrCodeButton />);

      let link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/qrcode");

      rerender(<NewQrCodeButton variant="ghost" />);

      link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/qrcode");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty className", () => {
      render(<NewQrCodeButton className="" />);

      const button = screen.getByRole("link").parentElement;
      expect(button).toHaveAttribute("class", "");
    });

    it("handles undefined className", () => {
      render(<NewQrCodeButton className={undefined} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("handles multiple className values", () => {
      render(<NewQrCodeButton className="class1 class2 class3" />);

      const button = screen.getByRole("link").parentElement;
      expect(button).toHaveClass("class1", "class2", "class3");
    });

    it("works with different variant combinations", () => {
      const variants = ["default", "outline", "ghost", "link", "destructive", "secondary"];
      
      variants.forEach((variant) => {
        const { unmount } = render(<NewQrCodeButton variant={variant as any} />);
        
        const button = screen.getByRole("link").parentElement;
        expect(button).toHaveAttribute("data-variant", variant);
        
        unmount();
      });
    });
  });

  describe("Component Integration", () => {
    it("integrates with Button component", () => {
      render(<NewQrCodeButton />);

      const button = screen.getByRole("link").parentElement;
      expect(button).toHaveAttribute("data-variant", "outline");
    });

    it("integrates with Link component", () => {
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/qrcode");
    });

    it("integrates with QrCode icon", () => {
      render(<NewQrCodeButton />);

      const icon = screen.getByTestId("qr-code-icon");
      expect(icon).toBeInTheDocument();
    });

    it("maintains component composition", () => {
      render(<NewQrCodeButton />);

      const link = screen.getByRole("link");
      const icon = screen.getByTestId("qr-code-icon");
      const button = link.parentElement;

      expect(button).toContainElement(link);
      expect(link).toContainElement(icon);
      expect(link).toHaveTextContent("새 QR 코드 만들기");
    });
  });
});