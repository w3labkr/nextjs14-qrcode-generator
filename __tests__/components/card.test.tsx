import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("Card 컴포넌트들", () => {
  describe("Card", () => {
    it("기본 카드가 올바르게 렌더링되어야 한다", () => {
      render(<Card data-testid="card">카드 내용</Card>);

      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("rounded-xl", "border", "bg-card");
      expect(card).toHaveTextContent("카드 내용");
    });

    it("커스텀 className이 적용되어야 한다", () => {
      render(
        <Card className="custom-card" data-testid="card">
          내용
        </Card>,
      );

      const card = screen.getByTestId("card");
      expect(card).toHaveClass("custom-card", "rounded-xl", "border");
    });

    it("ref가 올바르게 전달되어야 한다", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Card ref={ref} data-testid="card">
          내용
        </Card>,
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toBe(screen.getByTestId("card"));
    });
  });

  describe("CardHeader", () => {
    it("카드 헤더가 올바르게 렌더링되어야 한다", () => {
      render(<CardHeader data-testid="card-header">헤더 내용</CardHeader>);

      const header = screen.getByTestId("card-header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("flex", "flex-col", "space-y-1.5", "p-6");
      expect(header).toHaveTextContent("헤더 내용");
    });
  });

  describe("CardTitle", () => {
    it("카드 제목이 올바르게 렌더링되어야 한다", () => {
      render(<CardTitle data-testid="card-title">카드 제목</CardTitle>);

      const title = screen.getByTestId("card-title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent("카드 제목");
    });
  });

  describe("CardDescription", () => {
    it("카드 설명이 올바르게 렌더링되어야 한다", () => {
      render(
        <CardDescription data-testid="card-description">
          카드 설명
        </CardDescription>,
      );

      const description = screen.getByTestId("card-description");
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent("카드 설명");
    });
  });

  describe("CardContent", () => {
    it("카드 콘텐츠가 올바르게 렌더링되어야 한다", () => {
      render(<CardContent data-testid="card-content">카드 콘텐츠</CardContent>);

      const content = screen.getByTestId("card-content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent("카드 콘텐츠");
    });
  });

  describe("CardFooter", () => {
    it("카드 푸터가 올바르게 렌더링되어야 한다", () => {
      render(<CardFooter data-testid="card-footer">카드 푸터</CardFooter>);

      const footer = screen.getByTestId("card-footer");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveTextContent("카드 푸터");
    });
  });

  describe("완전한 카드 구조", () => {
    it("모든 카드 컴포넌트가 함께 작동해야 한다", () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>테스트 제목</CardTitle>
            <CardDescription>테스트 설명</CardDescription>
          </CardHeader>
          <CardContent>
            <p>테스트 콘텐츠</p>
          </CardContent>
          <CardFooter>
            <button>테스트 버튼</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByTestId("full-card")).toBeInTheDocument();
      expect(screen.getByText("테스트 제목")).toBeInTheDocument();
      expect(screen.getByText("테스트 설명")).toBeInTheDocument();
      expect(screen.getByText("테스트 콘텐츠")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "테스트 버튼" }),
      ).toBeInTheDocument();
    });
  });
});
