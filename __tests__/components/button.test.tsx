import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button 컴포넌트", () => {
  it("기본 버튼이 올바르게 렌더링되어야 한다", () => {
    render(<Button>클릭하기</Button>);

    const button = screen.getByRole("button", { name: "클릭하기" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("inline-flex", "items-center", "justify-center");
  });

  it("다양한 variant 스타일이 적용되어야 한다", () => {
    const { rerender } = render(<Button variant="destructive">삭제</Button>);

    let button = screen.getByRole("button", { name: "삭제" });
    expect(button).toHaveClass("bg-destructive");

    rerender(<Button variant="outline">외곽선</Button>);
    button = screen.getByRole("button", { name: "외곽선" });
    expect(button).toHaveClass("border", "border-input");

    rerender(<Button variant="ghost">고스트</Button>);
    button = screen.getByRole("button", { name: "고스트" });
    expect(button).toHaveClass("hover:bg-accent");
  });

  it("다양한 size 스타일이 적용되어야 한다", () => {
    const { rerender } = render(<Button size="sm">작은 버튼</Button>);

    let button = screen.getByRole("button", { name: "작은 버튼" });
    expect(button).toHaveClass("h-8", "px-3");

    rerender(<Button size="lg">큰 버튼</Button>);
    button = screen.getByRole("button", { name: "큰 버튼" });
    expect(button).toHaveClass("h-10", "px-8");

    rerender(<Button size="icon">아이콘</Button>);
    button = screen.getByRole("button", { name: "아이콘" });
    expect(button).toHaveClass("h-9", "w-9");
  });

  it("클릭 이벤트가 올바르게 처리되어야 한다", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>클릭 테스트</Button>);

    const button = screen.getByRole("button", { name: "클릭 테스트" });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 상태가 올바르게 작동해야 한다", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <Button disabled onClick={handleClick}>
        비활성화된 버튼
      </Button>,
    );

    const button = screen.getByRole("button", { name: "비활성화된 버튼" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      "disabled:pointer-events-none",
      "disabled:opacity-50",
    );

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("커스텀 className이 올바르게 적용되어야 한다", () => {
    render(<Button className="custom-class">커스텀 버튼</Button>);

    const button = screen.getByRole("button", { name: "커스텀 버튼" });
    expect(button).toHaveClass("custom-class");
  });

  it("asChild prop이 작동해야 한다", () => {
    render(
      <Button asChild>
        <a href="/test">링크 버튼</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "링크 버튼" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });
});
