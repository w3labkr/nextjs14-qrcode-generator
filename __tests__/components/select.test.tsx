import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TestSelect = ({
  onValueChange,
  defaultValue,
  value,
  disabled,
}: {
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
}) => {
  return (
    <Select
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      value={value}
      disabled={disabled}
    >
      <SelectTrigger data-testid="select-trigger" className="w-48">
        <SelectValue placeholder="옵션을 선택하세요" />
      </SelectTrigger>
      <SelectContent data-testid="select-content">
        <SelectItem value="option1" data-testid="option1">
          옵션 1
        </SelectItem>
        <SelectItem value="option2" data-testid="option2">
          옵션 2
        </SelectItem>
        <SelectItem value="option3" data-testid="option3" disabled>
          옵션 3 (비활성화)
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

describe("Select 컴포넌트", () => {
  it("기본 렌더링이 올바르게 되어야 한다", () => {
    render(<TestSelect />);

    expect(screen.getByTestId("select-trigger")).toBeInTheDocument();
    expect(screen.getByText("옵션을 선택하세요")).toBeInTheDocument();
  });

  it("클릭 시 옵션 목록이 표시되어야 한다", async () => {
    const user = userEvent.setup();

    render(<TestSelect />);

    const trigger = screen.getByTestId("select-trigger");
    await user.click(trigger);

    expect(screen.getByText("옵션 1")).toBeInTheDocument();
    expect(screen.getByText("옵션 2")).toBeInTheDocument();
    expect(screen.getByText("옵션 3 (비활성화)")).toBeInTheDocument();
  });

  it("옵션 선택 시 onValueChange가 호출되어야 한다", async () => {
    const user = userEvent.setup();
    const mockOnValueChange = jest.fn();

    render(<TestSelect onValueChange={mockOnValueChange} />);

    const trigger = screen.getByTestId("select-trigger");
    await user.click(trigger);

    const option1 = screen.getByText("옵션 1");
    await user.click(option1);

    expect(mockOnValueChange).toHaveBeenCalledWith("option1");
  });

  it("기본값이 올바르게 표시되어야 한다", () => {
    render(<TestSelect defaultValue="option2" />);

    expect(screen.getByText("옵션 2")).toBeInTheDocument();
  });

  it("제어된 값이 올바르게 표시되어야 한다", () => {
    render(<TestSelect value="option1" />);

    expect(screen.getByText("옵션 1")).toBeInTheDocument();
  });

  it("비활성화된 상태에서는 클릭이 되지 않아야 한다", async () => {
    const user = userEvent.setup();
    const mockOnValueChange = jest.fn();

    render(<TestSelect disabled onValueChange={mockOnValueChange} />);

    const trigger = screen.getByTestId("select-trigger");
    expect(trigger).toBeDisabled();

    await user.click(trigger);

    // 비활성화된 상태에서는 옵션이 표시되지 않음
    expect(screen.queryByText("옵션 1")).not.toBeInTheDocument();
  });

  it("비활성화된 옵션은 선택할 수 없어야 한다", async () => {
    const user = userEvent.setup();
    const mockOnValueChange = jest.fn();

    render(<TestSelect onValueChange={mockOnValueChange} />);

    const trigger = screen.getByTestId("select-trigger");
    await user.click(trigger);

    const disabledOption = screen.getByText("옵션 3 (비활성화)");

    // 비활성화된 옵션은 aria-disabled 속성을 가져야 함
    expect(disabledOption.closest('[role="option"]')).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("키보드 네비게이션이 작동해야 한다", async () => {
    const user = userEvent.setup();
    const mockOnValueChange = jest.fn();

    render(<TestSelect onValueChange={mockOnValueChange} />);

    const trigger = screen.getByTestId("select-trigger");

    // 트리거에 포커스
    await user.tab();
    expect(trigger).toHaveFocus();

    // Space 또는 Enter로 열기
    await user.keyboard(" ");

    expect(screen.getByText("옵션 1")).toBeInTheDocument();
  });

  it("placeholder가 올바르게 표시되어야 한다", () => {
    render(<TestSelect />);

    expect(screen.getByText("옵션을 선택하세요")).toBeInTheDocument();
  });

  it("SelectValue가 선택된 값을 올바르게 표시해야 한다", async () => {
    const user = userEvent.setup();

    render(<TestSelect />);

    const trigger = screen.getByTestId("select-trigger");
    await user.click(trigger);

    const option2 = screen.getByText("옵션 2");
    await user.click(option2);

    // 선택 후 트리거에 선택된 값이 표시됨
    expect(screen.getByText("옵션 2")).toBeInTheDocument();
  });
});
