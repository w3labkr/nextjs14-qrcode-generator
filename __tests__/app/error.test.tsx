import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Error from "@/app/error";

// Button 모킹
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

// logErrorAction 모킹
jest.mock("@/app/actions", () => ({
  logErrorAction: jest.fn(),
}));

import { logErrorAction } from "@/app/actions";

const mockLogErrorAction = logErrorAction as jest.MockedFunction<typeof logErrorAction>;

// console.error 모킹
const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

describe("Error", () => {
  const mockReset = jest.fn();
  const mockError: Error & { digest?: string } = {
    name: "Error",
    message: "Test error message",
    stack: "Error stack trace",
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogErrorAction.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("렌더링이 올바르게 됩니다", () => {
    render(<Error error={mockError} reset={mockReset} />);

    expect(screen.getByText("문제가 발생했습니다!")).toBeInTheDocument();
    expect(screen.getByText("예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")).toBeInTheDocument();
  });

  it("에러 로그가 기록됩니다", async () => {
    render(<Error error={mockError} reset={mockReset} />);

    await waitFor(() => {
      expect(mockLogErrorAction).toHaveBeenCalledWith({
        error: expect.stringContaining("글로벌 에러: Test error message"),
      });
    });
  });

  it("다시 시도 버튼이 올바르게 작동합니다", async () => {
    const user = userEvent.setup();
    render(<Error error={mockError} reset={mockReset} />);

    const retryButton = screen.getByText("다시 시도");
    await user.click(retryButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("홈으로 돌아가기 버튼이 올바른 스타일로 렌더링됩니다", () => {
    render(<Error error={mockError} reset={mockReset} />);

    const homeButton = screen.getByText("홈으로 돌아가기");
    expect(homeButton).toHaveAttribute("data-variant", "outline");
    expect(homeButton).toBeInTheDocument();
  });

  it("에러 로그 기록이 실패해도 컴포넌트가 정상 작동합니다", async () => {
    mockLogErrorAction.mockRejectedValue({ success: false, error: "Log error failed" });

    render(<Error error={mockError} reset={mockReset} />);

    await waitFor(() => {
      expect(mockLogErrorAction).toHaveBeenCalled();
    });

    // 컴포넌트는 여전히 정상적으로 렌더링되어야 함
    expect(screen.getByText("문제가 발생했습니다!")).toBeInTheDocument();
  });
});
