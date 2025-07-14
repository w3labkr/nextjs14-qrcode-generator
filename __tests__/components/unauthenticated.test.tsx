import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Unauthenticated } from "@/components/unauthenticated";

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
  Button: ({ children, asChild, ...props }: any) =>
    asChild ? (
      <div data-testid="button-wrapper" {...props}>
        {children}
      </div>
    ) : (
      <button data-testid="button-wrapper" {...props}>
        {children}
      </button>
    ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardDescription: ({ children }: any) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children }: any) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
}));

describe("Unauthenticated", () => {
  describe("Component Rendering", () => {
    it("renders with default props", () => {
      render(<Unauthenticated />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
      expect(screen.getByTestId("card-header")).toBeInTheDocument();
      expect(screen.getByTestId("card-content")).toBeInTheDocument();
    });

    it("renders with default title", () => {
      render(<Unauthenticated />);

      const title = screen.getByTestId("card-title");
      expect(title).toHaveTextContent("로그인이 필요합니다");
    });

    it("renders with default description", () => {
      render(<Unauthenticated />);

      const description = screen.getByTestId("card-description");
      expect(description).toHaveTextContent("대시보드를 보려면 로그인해주세요.");
    });

    it("renders with default button text", () => {
      render(<Unauthenticated />);

      const link = screen.getByRole("link");
      expect(link).toHaveTextContent("로그인");
    });

    it("renders with default href", () => {
      render(<Unauthenticated />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/auth/signin");
    });
  });

  describe("Custom Props", () => {
    it("renders with custom title", () => {
      render(<Unauthenticated title="액세스 거부" />);

      const title = screen.getByTestId("card-title");
      expect(title).toHaveTextContent("액세스 거부");
    });

    it("renders with custom description", () => {
      render(<Unauthenticated description="이 페이지에 접근할 수 없습니다." />);

      const description = screen.getByTestId("card-description");
      expect(description).toHaveTextContent("이 페이지에 접근할 수 없습니다.");
    });

    it("renders with custom button text", () => {
      render(<Unauthenticated buttonText="시작하기" />);

      const link = screen.getByRole("link");
      expect(link).toHaveTextContent("시작하기");
    });

    it("renders with custom href", () => {
      render(<Unauthenticated href="/login" />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/login");
    });

    it("renders with all custom props", () => {
      render(
        <Unauthenticated
          title="사용자 인증 필요"
          description="계속하려면 로그인하세요."
          buttonText="로그인하기"
          href="/auth/login"
        />
      );

      const title = screen.getByTestId("card-title");
      const description = screen.getByTestId("card-description");
      const link = screen.getByRole("link");

      expect(title).toHaveTextContent("사용자 인증 필요");
      expect(description).toHaveTextContent("계속하려면 로그인하세요.");
      expect(link).toHaveTextContent("로그인하기");
      expect(link).toHaveAttribute("href", "/auth/login");
    });
  });

  describe("Layout and Styling", () => {
    it("has correct container styling", () => {
      render(<Unauthenticated />);

      const container = screen.getByTestId("card").parentElement;
      expect(container).toHaveClass(
        "flex",
        "min-h-screen",
        "items-center",
        "justify-center",
        "bg-gray-50"
      );
    });

    it("has correct card styling", () => {
      render(<Unauthenticated />);

      const card = screen.getByTestId("card");
      expect(card).toHaveClass("w-full", "max-w-md");
    });

    it("has correct header styling", () => {
      render(<Unauthenticated />);

      const header = screen.getByTestId("card-header");
      expect(header).toHaveClass("text-center");
    });

    it("has correct content styling", () => {
      render(<Unauthenticated />);

      const content = screen.getByTestId("card-content");
      expect(content).toHaveClass("text-center");
    });

    it("centers content vertically and horizontally", () => {
      render(<Unauthenticated />);

      const container = screen.getByTestId("card").parentElement;
      expect(container).toHaveClass("items-center", "justify-center");
    });

    it("has full screen height", () => {
      render(<Unauthenticated />);

      const container = screen.getByTestId("card").parentElement;
      expect(container).toHaveClass("min-h-screen");
    });
  });

  describe("Card Structure", () => {
    it("renders card header with title and description", () => {
      render(<Unauthenticated />);

      const header = screen.getByTestId("card-header");
      const title = screen.getByTestId("card-title");
      const description = screen.getByTestId("card-description");

      expect(header).toContainElement(title);
      expect(header).toContainElement(description);
    });

    it("renders card content with button", () => {
      render(<Unauthenticated />);

      const content = screen.getByTestId("card-content");
      const buttonWrapper = screen.getByTestId("button-wrapper");

      expect(content).toContainElement(buttonWrapper);
    });

    it("maintains proper card structure", () => {
      render(<Unauthenticated />);

      const card = screen.getByTestId("card");
      const header = screen.getByTestId("card-header");
      const content = screen.getByTestId("card-content");

      expect(card).toContainElement(header);
      expect(card).toContainElement(content);
    });
  });

  describe("Button and Link Integration", () => {
    it("uses Button component with asChild prop", () => {
      render(<Unauthenticated />);

      const buttonWrapper = screen.getByTestId("button-wrapper");
      const link = screen.getByRole("link");

      expect(buttonWrapper).toContainElement(link);
    });

    it("uses Next.js Link component", () => {
      render(<Unauthenticated />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/auth/signin");
    });

    it("button text matches link content", () => {
      render(<Unauthenticated buttonText="사용자 로그인" />);

      const link = screen.getByRole("link");
      expect(link).toHaveTextContent("사용자 로그인");
    });

    it("href prop controls link destination", () => {
      render(<Unauthenticated href="/custom/login" />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/custom/login");
    });
  });

  describe("Accessibility", () => {
    it("has proper heading structure", () => {
      render(<Unauthenticated />);

      const title = screen.getByTestId("card-title");
      expect(title.tagName).toBe("H2");
    });

    it("has descriptive text elements", () => {
      render(<Unauthenticated />);

      const description = screen.getByTestId("card-description");
      expect(description.tagName).toBe("P");
    });

    it("link has proper role", () => {
      render(<Unauthenticated />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("link has descriptive text", () => {
      render(<Unauthenticated />);

      const link = screen.getByRole("link", { name: "로그인" });
      expect(link).toBeInTheDocument();
    });

    it("is keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<Unauthenticated />);

      const link = screen.getByRole("link");
      
      // Focus with tab
      await user.tab();
      expect(link).toHaveFocus();
    });

    it("can be activated with Enter key", async () => {
      const user = userEvent.setup();
      render(<Unauthenticated />);

      const link = screen.getByRole("link");
      link.focus();
      
      // Should be able to activate with Enter
      await user.keyboard("{Enter}");
      expect(link).toHaveFocus();
    });
  });

  describe("Content Variations", () => {
    it("supports different authentication scenarios", () => {
      const scenarios = [
        {
          title: "로그인 만료",
          description: "세션이 만료되었습니다. 다시 로그인해주세요.",
          buttonText: "다시 로그인",
          href: "/auth/signin",
        },
        {
          title: "권한 없음",
          description: "이 페이지에 접근할 권한이 없습니다.",
          buttonText: "홈으로",
          href: "/",
        },
        {
          title: "계정 활성화 필요",
          description: "계정을 활성화한 후 다시 시도해주세요.",
          buttonText: "활성화",
          href: "/auth/activate",
        },
      ];

      scenarios.forEach((scenario) => {
        const { unmount } = render(<Unauthenticated {...scenario} />);
        
        expect(screen.getByTestId("card-title")).toHaveTextContent(scenario.title);
        expect(screen.getByTestId("card-description")).toHaveTextContent(scenario.description);
        expect(screen.getByRole("link")).toHaveTextContent(scenario.buttonText);
        expect(screen.getByRole("link")).toHaveAttribute("href", scenario.href);
        
        unmount();
      });
    });

    it("handles empty strings gracefully", () => {
      render(
        <Unauthenticated
          title=""
          description=""
          buttonText=""
          href=""
        />
      );

      const title = screen.getByTestId("card-title");
      const description = screen.getByTestId("card-description");
      const buttonWrapper = screen.getByTestId("button-wrapper");
      const link = buttonWrapper.querySelector("a");

      expect(title).toHaveTextContent("");
      expect(description).toHaveTextContent("");
      expect(link).toHaveTextContent("");
      expect(link).toHaveAttribute("href", "");
    });

    it("supports long text content", () => {
      const longTitle = "매우 긴 제목입니다. 이 제목은 여러 줄에 걸쳐 표시될 수 있습니다.";
      const longDescription = "이것은 매우 긴 설명입니다. 사용자에게 상세한 정보를 제공하기 위해 여러 문장으로 구성되어 있습니다. 이런 경우에도 적절히 표시되어야 합니다.";
      const longButtonText = "매우 긴 버튼 텍스트입니다";

      render(
        <Unauthenticated
          title={longTitle}
          description={longDescription}
          buttonText={longButtonText}
        />
      );

      expect(screen.getByTestId("card-title")).toHaveTextContent(longTitle);
      expect(screen.getByTestId("card-description")).toHaveTextContent(longDescription);
      expect(screen.getByRole("link")).toHaveTextContent(longButtonText);
    });
  });

  describe("TypeScript Interface", () => {
    it("all props are optional", () => {
      // Should not throw with no props
      render(<Unauthenticated />);
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("accepts string props", () => {
      render(
        <Unauthenticated
          title="Test Title"
          description="Test Description"
          buttonText="Test Button"
          href="/test"
        />
      );

      expect(screen.getByTestId("card-title")).toHaveTextContent("Test Title");
      expect(screen.getByTestId("card-description")).toHaveTextContent("Test Description");
      expect(screen.getByRole("link")).toHaveTextContent("Test Button");
      expect(screen.getByRole("link")).toHaveAttribute("href", "/test");
    });

    it("accepts partial props", () => {
      render(<Unauthenticated title="Only Title" />);

      expect(screen.getByTestId("card-title")).toHaveTextContent("Only Title");
      expect(screen.getByTestId("card-description")).toHaveTextContent("대시보드를 보려면 로그인해주세요.");
      expect(screen.getByRole("link")).toHaveTextContent("로그인");
      expect(screen.getByRole("link")).toHaveAttribute("href", "/auth/signin");
    });
  });

  describe("Performance", () => {
    it("does not cause unnecessary re-renders", () => {
      const { rerender } = render(<Unauthenticated />);

      // Same props should not cause issues
      rerender(<Unauthenticated />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("handles prop changes correctly", () => {
      const { rerender } = render(<Unauthenticated title="Original Title" />);

      expect(screen.getByTestId("card-title")).toHaveTextContent("Original Title");

      rerender(<Unauthenticated title="Updated Title" />);

      expect(screen.getByTestId("card-title")).toHaveTextContent("Updated Title");
    });

    it("maintains component state across re-renders", () => {
      const { rerender } = render(<Unauthenticated />);

      const originalCard = screen.getByTestId("card");

      rerender(<Unauthenticated buttonText="New Button" />);

      const updatedCard = screen.getByTestId("card");
      expect(updatedCard).toBeInTheDocument();
      expect(screen.getByRole("link")).toHaveTextContent("New Button");
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined props gracefully", () => {
      render(
        <Unauthenticated
          title={undefined}
          description={undefined}
          buttonText={undefined}
          href={undefined}
        />
      );

      // Should use defaults
      expect(screen.getByTestId("card-title")).toHaveTextContent("로그인이 필요합니다");
      expect(screen.getByTestId("card-description")).toHaveTextContent("대시보드를 보려면 로그인해주세요.");
      expect(screen.getByRole("link")).toHaveTextContent("로그인");
      expect(screen.getByRole("link")).toHaveAttribute("href", "/auth/signin");
    });

    it("handles special characters in content", () => {
      render(
        <Unauthenticated
          title="특수문자 테스트 !@#$%^&*()"
          description="이메일: test@example.com, 전화: 010-1234-5678"
          buttonText="로그인 → 계속"
          href="/auth/signin?redirect=%2Fdashboard"
        />
      );

      expect(screen.getByTestId("card-title")).toHaveTextContent("특수문자 테스트 !@#$%^&*()");
      expect(screen.getByTestId("card-description")).toHaveTextContent("이메일: test@example.com, 전화: 010-1234-5678");
      expect(screen.getByRole("link")).toHaveTextContent("로그인 → 계속");
      expect(screen.getByRole("link")).toHaveAttribute("href", "/auth/signin?redirect=%2Fdashboard");
    });

    it("handles different href formats", () => {
      const hrefFormats = [
        "/auth/signin",
        "/auth/signin?redirect=/dashboard",
        "https://example.com/login",
        "#login",
        "mailto:support@example.com",
        "tel:+1234567890",
      ];

      hrefFormats.forEach((href) => {
        const { unmount } = render(<Unauthenticated href={href} />);
        
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", href);
        
        unmount();
      });
    });
  });
});