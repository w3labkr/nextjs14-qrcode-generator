import { render, screen } from "@testing-library/react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const testSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다"),
  email: z.string().email("올바른 이메일을 입력하세요"),
});

type TestFormData = z.infer<typeof testSchema>;

const TestForm = ({ onSubmit }: { onSubmit: (data: TestFormData) => void }) => {
  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} data-testid="test-form">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <input {...field} data-testid="name-input" />
              </FormControl>
              <FormDescription>사용자의 이름을 입력하세요</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <input {...field} type="email" data-testid="email-input" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button type="submit" data-testid="submit-button">
          제출
        </button>
      </form>
    </Form>
  );
};

describe("Form 컴포넌트", () => {
  it("기본 렌더링이 올바르게 되어야 한다", () => {
    const mockSubmit = jest.fn();

    render(<TestForm onSubmit={mockSubmit} />);

    expect(screen.getByTestId("test-form")).toBeInTheDocument();
    expect(screen.getByText("이름")).toBeInTheDocument();
    expect(screen.getByText("이메일")).toBeInTheDocument();
    expect(screen.getByTestId("name-input")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
  });

  it("FormLabel이 올바르게 렌더링되어야 한다", () => {
    const mockSubmit = jest.fn();

    render(<TestForm onSubmit={mockSubmit} />);

    const nameLabel = screen.getByText("이름");
    const emailLabel = screen.getByText("이메일");

    expect(nameLabel).toBeInTheDocument();
    expect(emailLabel).toBeInTheDocument();
    expect(nameLabel.tagName).toBe("LABEL");
    expect(emailLabel.tagName).toBe("LABEL");
  });

  it("FormDescription이 올바르게 렌더링되어야 한다", () => {
    const mockSubmit = jest.fn();

    render(<TestForm onSubmit={mockSubmit} />);

    expect(screen.getByText("사용자의 이름을 입력하세요")).toBeInTheDocument();
  });

  it("FormMessage가 검증 오류 시 표시되어야 한다", async () => {
    const mockSubmit = jest.fn();

    render(<TestForm onSubmit={mockSubmit} />);

    const submitButton = screen.getByTestId("submit-button");
    submitButton.click();

    // 검증 오류 메시지가 나타날 때까지 대기
    await screen.findByText("이름은 필수입니다");

    expect(screen.getByText("이름은 필수입니다")).toBeInTheDocument();
  });

  it("FormControl이 올바르게 작동해야 한다", () => {
    const mockSubmit = jest.fn();

    render(<TestForm onSubmit={mockSubmit} />);

    const nameInput = screen.getByTestId("name-input");
    const emailInput = screen.getByTestId("email-input");

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("FormItem이 올바른 구조를 가져야 한다", () => {
    const mockSubmit = jest.fn();

    render(<TestForm onSubmit={mockSubmit} />);

    // FormItem의 내부 구조가 올바른지 확인
    const nameLabel = screen.getByText("이름");
    const nameInput = screen.getByTestId("name-input");

    expect(nameLabel.closest("div")).toContainElement(nameInput);
  });
});
