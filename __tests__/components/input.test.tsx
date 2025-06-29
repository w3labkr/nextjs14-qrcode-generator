import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input 컴포넌트", () => {
  it("기본 입력 필드가 올바르게 렌더링되어야 한다", () => {
    render(<Input placeholder="텍스트를 입력하세요" />);

    const input = screen.getByPlaceholderText("텍스트를 입력하세요");
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("flex", "h-9", "w-full", "rounded-md");
  });

  it("다양한 type 속성이 올바르게 적용되어야 한다", () => {
    const { rerender } = render(<Input type="email" data-testid="input" />);

    let input = screen.getByTestId("input");
    expect(input).toHaveAttribute("type", "email");

    rerender(<Input type="password" data-testid="input" />);
    input = screen.getByTestId("input");
    expect(input).toHaveAttribute("type", "password");

    rerender(<Input type="number" data-testid="input" />);
    input = screen.getByTestId("input");
    expect(input).toHaveAttribute("type", "number");
  });

  it("사용자 입력이 올바르게 처리되어야 한다", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<Input onChange={handleChange} data-testid="input" />);

    const input = screen.getByTestId("input");
    await user.type(input, "Hello World");

    expect(input).toHaveValue("Hello World");
    expect(handleChange).toHaveBeenCalledTimes(11); // 'Hello World'는 11글자
  });

  it("disabled 상태가 올바르게 작동해야 한다", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<Input disabled onChange={handleChange} data-testid="input" />);

    const input = screen.getByTestId("input");
    expect(input).toBeDisabled();
    expect(input).toHaveClass(
      "disabled:cursor-not-allowed",
      "disabled:opacity-50",
    );

    await user.type(input, "test");
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("커스텀 className이 올바르게 적용되어야 한다", () => {
    render(<Input className="custom-class" data-testid="input" />);

    const input = screen.getByTestId("input");
    expect(input).toHaveClass("custom-class");
    // 기본 클래스도 유지되어야 함
    expect(input).toHaveClass("flex", "h-9", "w-full");
  });

  it("ref가 올바르게 전달되어야 한다", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} data-testid="input" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(screen.getByTestId("input"));
  });

  it("다른 HTML 속성들이 올바르게 전달되어야 한다", () => {
    render(
      <Input
        data-testid="input"
        placeholder="Enter text"
        maxLength={10}
        required
        autoComplete="off"
      />,
    );

    const input = screen.getByTestId("input");
    expect(input).toHaveAttribute("placeholder", "Enter text");
    expect(input).toHaveAttribute("maxLength", "10");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("autoComplete", "off");
  });

  it("focus 이벤트가 올바르게 처리되어야 한다", async () => {
    const user = userEvent.setup();
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();

    render(
      <Input onFocus={handleFocus} onBlur={handleBlur} data-testid="input" />,
    );

    const input = screen.getByTestId("input");

    await user.click(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
});
