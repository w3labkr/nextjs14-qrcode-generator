import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Label } from "@/components/ui/label";

describe("Label 컴포넌트", () => {
  it("기본 라벨이 올바르게 렌더링되어야 한다", () => {
    render(<Label data-testid="label">라벨 텍스트</Label>);

    const label = screen.getByTestId("label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("text-sm", "font-medium", "leading-none");
    expect(label).toHaveTextContent("라벨 텍스트");
  });

  it("htmlFor 속성이 올바르게 적용되어야 한다", () => {
    render(
      <div>
        <Label htmlFor="test-input">이름</Label>
        <input id="test-input" type="text" />
      </div>,
    );

    const label = screen.getByText("이름");
    const input = screen.getByRole("textbox");

    expect(label).toHaveAttribute("for", "test-input");
    expect(input).toHaveAttribute("id", "test-input");
  });

  it("라벨 클릭 시 연결된 입력 필드에 포커스가 되어야 한다", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Label htmlFor="focus-test">클릭하여 포커스</Label>
        <input id="focus-test" type="text" />
      </div>,
    );

    const label = screen.getByText("클릭하여 포커스");
    const input = screen.getByRole("textbox");

    await user.click(label);

    expect(input).toHaveFocus();
  });

  it("커스텀 className이 올바르게 적용되어야 한다", () => {
    render(
      <Label className="custom-label" data-testid="label">
        커스텀 라벨
      </Label>,
    );

    const label = screen.getByTestId("label");
    expect(label).toHaveClass("custom-label");
    // 기본 클래스도 유지되어야 함
    expect(label).toHaveClass("text-sm", "font-medium");
  });

  it("ref가 올바르게 전달되어야 한다", () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(
      <Label ref={ref} data-testid="label">
        Ref 테스트
      </Label>,
    );

    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    expect(ref.current).toBe(screen.getByTestId("label"));
  });

  it("다른 HTML 속성들이 올바르게 전달되어야 한다", () => {
    render(
      <Label
        data-testid="label"
        title="라벨 도움말"
        onClick={() => {}}
        role="label"
      >
        속성 테스트
      </Label>,
    );

    const label = screen.getByTestId("label");
    expect(label).toHaveAttribute("title", "라벨 도움말");
    expect(label).toHaveAttribute("role", "label");
  });

  it("복잡한 콘텐츠를 포함할 수 있어야 한다", () => {
    render(
      <Label data-testid="label">
        <span>필수</span>
        <strong>이름</strong>
        <em>*</em>
      </Label>,
    );

    const label = screen.getByTestId("label");
    expect(label).toBeInTheDocument();
    expect(screen.getByText("필수")).toBeInTheDocument();
    expect(screen.getByText("이름")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("비활성화된 입력 필드와 연결된 라벨의 스타일이 적용되어야 한다", () => {
    render(
      <div>
        <Label
          htmlFor="disabled-input"
          className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          비활성화된 필드
        </Label>
        <input id="disabled-input" type="text" disabled className="peer" />
      </div>,
    );

    const label = screen.getByText("비활성화된 필드");
    expect(label).toHaveClass(
      "peer-disabled:cursor-not-allowed",
      "peer-disabled:opacity-70",
    );
  });

  it("폼 요소와의 접근성이 올바르게 작동해야 한다", () => {
    render(
      <form>
        <Label htmlFor="email-input">이메일 주소</Label>
        <input
          id="email-input"
          type="email"
          aria-describedby="email-help"
          required
        />
        <div id="email-help">유효한 이메일을 입력하세요</div>
      </form>,
    );

    const label = screen.getByText("이메일 주소");
    const input = screen.getByRole("textbox", { name: "이메일 주소" });

    expect(label).toBeInTheDocument();
    expect(input).toHaveAccessibleName("이메일 주소");
    expect(input).toBeRequired();
  });
});
