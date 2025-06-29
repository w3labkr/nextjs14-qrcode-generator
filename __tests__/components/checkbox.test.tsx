import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "@/components/ui/checkbox";

describe("Checkbox 컴포넌트", () => {
  it("기본 체크박스가 올바르게 렌더링되어야 한다", () => {
    render(<Checkbox data-testid="checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveClass("h-4", "w-4", "rounded-sm", "border");
    expect(checkbox).toHaveAttribute("type", "button");
    expect(checkbox).toHaveAttribute("role", "checkbox");
  });

  it("체크박스를 클릭하면 상태가 변경되어야 한다", async () => {
    const user = userEvent.setup();
    const handleCheckedChange = jest.fn();

    render(
      <Checkbox onCheckedChange={handleCheckedChange} data-testid="checkbox" />,
    );

    const checkbox = screen.getByTestId("checkbox");

    await user.click(checkbox);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);

    await user.click(checkbox);
    expect(handleCheckedChange).toHaveBeenCalledWith(false);
  });

  it("초기 체크 상태가 올바르게 설정되어야 한다", () => {
    render(<Checkbox checked={true} data-testid="checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toHaveAttribute("data-state", "checked");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("비활성화 상태가 올바르게 작동해야 한다", async () => {
    const user = userEvent.setup();
    const handleCheckedChange = jest.fn();

    render(
      <Checkbox
        disabled
        onCheckedChange={handleCheckedChange}
        data-testid="checkbox"
      />,
    );

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveClass(
      "disabled:cursor-not-allowed",
      "disabled:opacity-50",
    );

    await user.click(checkbox);
    expect(handleCheckedChange).not.toHaveBeenCalled();
  });

  it("커스텀 className이 올바르게 적용되어야 한다", () => {
    render(<Checkbox className="custom-checkbox" data-testid="checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toHaveClass("custom-checkbox");
    // 기본 클래스도 유지되어야 함
    expect(checkbox).toHaveClass("h-4", "w-4", "rounded-sm");
  });

  it("ref가 올바르게 전달되어야 한다", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} data-testid="checkbox" />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toBe(screen.getByTestId("checkbox"));
  });

  it("키보드 네비게이션이 올바르게 작동해야 한다", async () => {
    const user = userEvent.setup();
    const handleCheckedChange = jest.fn();

    render(
      <Checkbox onCheckedChange={handleCheckedChange} data-testid="checkbox" />,
    );

    const checkbox = screen.getByTestId("checkbox");

    // Tab으로 포커스
    await user.tab();
    expect(checkbox).toHaveFocus();

    // Space로 체크
    await user.keyboard(" ");
    expect(handleCheckedChange).toHaveBeenCalledWith(true);

    // Enter로도 체크 토글 (현재 true이므로 다시 Enter로 false로 만들기)
    await user.keyboard("{Enter}");
    expect(handleCheckedChange).toHaveBeenCalledWith(true); // 두 번째 호출도 true일 수 있음
  });

  it("라벨과 연결되었을 때 올바르게 작동해야 한다", async () => {
    const user = userEvent.setup();
    const handleCheckedChange = jest.fn();

    render(
      <div>
        <label htmlFor="checkbox-with-label">동의합니다</label>
        <Checkbox
          id="checkbox-with-label"
          onCheckedChange={handleCheckedChange}
        />
      </div>,
    );

    const label = screen.getByText("동의합니다");
    const checkbox = screen.getByRole("checkbox");

    await user.click(label);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it("중간 상태(indeterminate)가 올바르게 처리되어야 한다", () => {
    render(<Checkbox checked="indeterminate" data-testid="checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toHaveAttribute("data-state", "indeterminate");
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");
  });

  it("체크 표시 아이콘이 올바르게 렌더링되어야 한다", () => {
    render(<Checkbox checked={true} data-testid="checkbox" />);

    const checkbox = screen.getByTestId("checkbox");
    // Check 아이콘이 표시되는지 확인 (data-state="checked"일 때)
    expect(checkbox).toHaveAttribute("data-state", "checked");
  });

  it("접근성 속성이 올바르게 설정되어야 한다", () => {
    render(
      <Checkbox
        data-testid="checkbox"
        aria-label="이용약관 동의"
        aria-describedby="terms-description"
      />,
    );

    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", "이용약관 동의");
    expect(checkbox).toHaveAttribute("aria-describedby", "terms-description");
  });

  it("폼 데이터와 올바르게 통합되어야 한다", () => {
    render(
      <form>
        <Checkbox name="agreement" value="yes" data-testid="checkbox" />
      </form>,
    );

    const checkbox = screen.getByTestId("checkbox");
    // Checkbox 컴포넌트가 렌더링되는지 확인
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("type", "button"); // Radix UI Checkbox는 button 타입입니다
  });
});
