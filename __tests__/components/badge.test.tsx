import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge 컴포넌트", () => {
  it("기본 뱃지가 올바르게 렌더링되어야 한다", () => {
    render(<Badge data-testid="badge">기본 뱃지</Badge>);

    const badge = screen.getByTestId("badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("inline-flex", "items-center", "rounded-md");
    expect(badge).toHaveTextContent("기본 뱃지");
  });

  it("다양한 variant가 올바르게 적용되어야 한다", () => {
    const { rerender } = render(
      <Badge variant="default" data-testid="badge">
        기본
      </Badge>,
    );

    let badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("bg-primary", "text-primary-foreground");

    rerender(
      <Badge variant="secondary" data-testid="badge">
        보조
      </Badge>,
    );
    badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("bg-secondary", "text-secondary-foreground");

    rerender(
      <Badge variant="destructive" data-testid="badge">
        삭제
      </Badge>,
    );
    badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("bg-destructive", "text-destructive-foreground");

    rerender(
      <Badge variant="outline" data-testid="badge">
        외곽선
      </Badge>,
    );
    badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("text-foreground");
  });

  it("커스텀 className이 올바르게 적용되어야 한다", () => {
    render(
      <Badge className="custom-badge" data-testid="badge">
        커스텀
      </Badge>,
    );

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("custom-badge");
    // 기본 클래스도 유지되어야 함
    expect(badge).toHaveClass("inline-flex", "items-center");
  });

  it("HTML 속성이 올바르게 전달되어야 한다", () => {
    render(
      <Badge
        data-testid="badge"
        title="뱃지 제목"
        onClick={() => {}}
        role="status"
      >
        속성 테스트
      </Badge>,
    );

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveAttribute("title", "뱃지 제목");
    expect(badge).toHaveAttribute("role", "status");
  });

  it("다양한 콘텐츠 타입을 처리해야 한다", () => {
    render(
      <Badge data-testid="badge">
        <span>아이콘</span>
        텍스트
        <strong>강조</strong>
      </Badge>,
    );

    const badge = screen.getByTestId("badge");
    expect(badge).toBeInTheDocument();
    expect(screen.getByText("아이콘")).toBeInTheDocument();
    expect(screen.getByText("텍스트")).toBeInTheDocument();
    expect(screen.getByText("강조")).toBeInTheDocument();
  });

  it("빈 콘텐츠도 처리해야 한다", () => {
    render(<Badge data-testid="badge"></Badge>);

    const badge = screen.getByTestId("badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toBeEmptyDOMElement();
  });

  it("기본 스타일 클래스가 모두 적용되어야 한다", () => {
    render(<Badge data-testid="badge">스타일 테스트</Badge>);

    const badge = screen.getByTestId("badge");
    const expectedClasses = [
      "inline-flex",
      "items-center",
      "rounded-md",
      "border",
      "px-2.5",
      "py-0.5",
      "text-xs",
      "font-semibold",
    ];

    expectedClasses.forEach((className) => {
      expect(badge).toHaveClass(className);
    });
  });
});
