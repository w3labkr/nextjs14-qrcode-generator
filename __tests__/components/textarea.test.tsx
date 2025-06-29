import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "@/components/ui/textarea";

describe("Textarea 컴포넌트", () => {
  it("기본 텍스트 영역이 올바르게 렌더링되어야 한다", () => {
    render(<Textarea placeholder="메시지를 입력하세요" />);

    const textarea = screen.getByPlaceholderText("메시지를 입력하세요");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass(
      "flex",
      "min-h-[60px]",
      "w-full",
      "rounded-md",
    );
  });

  it("사용자 입력이 올바르게 처리되어야 한다", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<Textarea onChange={handleChange} data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    const testText = "Hello\nWorld\nMultiline Text";

    await user.type(textarea, testText);

    expect(textarea).toHaveValue(testText);
    expect(handleChange).toHaveBeenCalledTimes(testText.length);
  });

  it("disabled 상태가 올바르게 작동해야 한다", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(
      <Textarea disabled onChange={handleChange} data-testid="textarea" />,
    );

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass(
      "disabled:cursor-not-allowed",
      "disabled:opacity-50",
    );

    await user.type(textarea, "test");
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("커스텀 className이 올바르게 적용되어야 한다", () => {
    render(
      <Textarea className="custom-textarea-class" data-testid="textarea" />,
    );

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveClass("custom-textarea-class");
    // 기본 클래스도 유지되어야 함
    expect(textarea).toHaveClass("flex", "min-h-[60px]", "w-full");
  });

  it("ref가 올바르게 전달되어야 한다", () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} data-testid="textarea" />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(ref.current).toBe(screen.getByTestId("textarea"));
  });

  it("다른 HTML 속성들이 올바르게 전달되어야 한다", () => {
    render(
      <Textarea
        data-testid="textarea"
        placeholder="Enter message"
        rows={5}
        maxLength={100}
        required
        readOnly
      />,
    );

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("placeholder", "Enter message");
    expect(textarea).toHaveAttribute("rows", "5");
    expect(textarea).toHaveAttribute("maxLength", "100");
    expect(textarea).toHaveAttribute("required");
    expect(textarea).toHaveAttribute("readOnly");
  });

  it("focus와 blur 이벤트가 올바르게 처리되어야 한다", async () => {
    const user = userEvent.setup();
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();

    render(
      <Textarea
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-testid="textarea"
      />,
    );

    const textarea = screen.getByTestId("textarea");

    await user.click(textarea);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("기본 최소 높이가 적용되어야 한다", () => {
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveClass("min-h-[60px]");
  });

  it("여러 줄 텍스트를 올바르게 처리해야 한다", async () => {
    const user = userEvent.setup();

    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId("textarea");
    const multilineText = "Line 1\nLine 2\nLine 3";

    await user.type(textarea, multilineText);

    expect(textarea).toHaveValue(multilineText);
    // 줄바꿈이 포함된 텍스트가 올바르게 저장되었는지 확인
    const lines = (textarea as HTMLTextAreaElement).value.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("Line 1");
    expect(lines[1]).toBe("Line 2");
    expect(lines[2]).toBe("Line 3");
  });
});
