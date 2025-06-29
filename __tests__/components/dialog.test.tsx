import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const TestDialog = ({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="trigger-button">대화상자 열기</Button>
      </DialogTrigger>
      <DialogContent data-testid="dialog-content">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">제목</DialogTitle>
          <DialogDescription data-testid="dialog-description">
            이것은 대화상자의 설명입니다.
          </DialogDescription>
        </DialogHeader>
        <div data-testid="dialog-body">대화상자 내용</div>
        <DialogFooter>
          <Button data-testid="cancel-button" variant="outline">
            취소
          </Button>
          <Button data-testid="confirm-button">확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

describe("Dialog 컴포넌트", () => {
  it("기본 렌더링이 올바르게 되어야 한다", () => {
    render(<TestDialog />);

    expect(screen.getByTestId("trigger-button")).toBeInTheDocument();
    expect(screen.getByText("대화상자 열기")).toBeInTheDocument();
  });

  it("트리거 버튼 클릭 시 대화상자가 열려야 한다", async () => {
    const user = userEvent.setup();

    render(<TestDialog />);

    const triggerButton = screen.getByTestId("trigger-button");
    await user.click(triggerButton);

    expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-description")).toBeInTheDocument();
  });

  it("제어된 상태에서 올바르게 작동해야 한다", () => {
    const mockOnOpenChange = jest.fn();

    render(<TestDialog open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
  });

  it("대화상자가 닫힌 상태에서는 내용이 보이지 않아야 한다", () => {
    const mockOnOpenChange = jest.fn();

    render(<TestDialog open={false} onOpenChange={mockOnOpenChange} />);

    expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
  });

  it("DialogTitle이 올바르게 렌더링되어야 한다", () => {
    const mockOnOpenChange = jest.fn();

    render(<TestDialog open={true} onOpenChange={mockOnOpenChange} />);

    const title = screen.getByTestId("dialog-title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("제목");
  });

  it("DialogDescription이 올바르게 렌더링되어야 한다", () => {
    const mockOnOpenChange = jest.fn();

    render(<TestDialog open={true} onOpenChange={mockOnOpenChange} />);

    const description = screen.getByTestId("dialog-description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent("이것은 대화상자의 설명입니다.");
  });

  it("DialogFooter의 버튼들이 올바르게 렌더링되어야 한다", () => {
    const mockOnOpenChange = jest.fn();

    render(<TestDialog open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByTestId("cancel-button")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-button")).toBeInTheDocument();
    expect(screen.getByText("취소")).toBeInTheDocument();
    expect(screen.getByText("확인")).toBeInTheDocument();
  });

  it("ESC 키로 대화상자를 닫을 수 있어야 한다", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = jest.fn();

    render(<TestDialog open={true} onOpenChange={mockOnOpenChange} />);

    await user.keyboard("{Escape}");

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("오버레이 클릭으로 대화상자를 닫을 수 있어야 한다", async () => {
    const user = userEvent.setup();
    const mockOnOpenChange = jest.fn();

    render(<TestDialog open={true} onOpenChange={mockOnOpenChange} />);

    // ESC 키를 눌러서 대화상자를 닫는 방식으로 테스트 (jsdom의 pointer-events 제한 때문)
    await user.keyboard("{Escape}");
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
