import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

// Button 모킹
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, size, className, ...props }: any) => (
    <button data-size={size} className={className} {...props}>
      {children}
    </button>
  ),
}));

// GithubBadge 모킹
jest.mock("@/components/github-badge", () => ({
  GithubBadge: () => <div data-testid="github-badge">GitHub Badge</div>,
}));

// Link 모킹
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// constants 모킹
jest.mock("@/lib/constants", () => ({
  COPYRIGHT_TEXT: "© 2024 Test Copyright",
}));

describe("HomePage", () => {
  it("렌더링이 올바르게 됩니다", () => {
    render(<HomePage />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText("QR 코드 생성기")).toBeInTheDocument();
  });

  it("메인 제목이 표시됩니다", () => {
    render(<HomePage />);

    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toHaveTextContent("QR 코드 생성기");
    expect(title).toHaveClass("text-4xl", "md:text-6xl", "font-bold");
  });

  it("부제목이 표시됩니다", () => {
    render(<HomePage />);

    expect(
      screen.getByText("빠르고 쉬운 QR 코드 생성 도구"),
    ).toBeInTheDocument();
  });

  it("설명 텍스트가 표시됩니다", () => {
    render(<HomePage />);

    expect(
      screen.getByText(
        "URL, 텍스트, 이메일, WiFi 등 다양한 형태의 QR 코드를 생성하세요.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "로고 삽입, 색상 커스터마이징, 프레임 옵션 등 고급 기능을 제공합니다.",
      ),
    ).toBeInTheDocument();
  });

  it("GitHub 배지가 표시됩니다", () => {
    render(<HomePage />);

    expect(screen.getByTestId("github-badge")).toBeInTheDocument();
  });

  it("QR 코드 생성 버튼이 올바른 링크로 연결됩니다", () => {
    render(<HomePage />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/qrcode");

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("QR 코드 생성하기");
    expect(button).toHaveAttribute("data-size", "lg");
  });

  it("푸터에 저작권 텍스트가 표시됩니다", () => {
    render(<HomePage />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent("© 2024 Test Copyright");
  });

  it("올바른 클래스명이 적용됩니다", () => {
    render(<HomePage />);

    const main = screen.getByRole("main");
    expect(main).toHaveClass("flex", "min-h-screen", "flex-col");

    const titleContainer = screen.getByText("QR 코드 생성기").closest("div");
    expect(titleContainer).toHaveClass("text-center", "max-w-3xl", "mx-auto");
  });

  it("반응형 클래스가 적용됩니다", () => {
    render(<HomePage />);

    // 메인 제목 반응형 클래스 확인
    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toHaveClass("text-4xl", "md:text-6xl");

    // 부제목 반응형 클래스 확인
    const subtitle = screen.getByText("빠르고 쉬운 QR 코드 생성 도구");
    expect(subtitle).toHaveClass("text-xl", "md:text-2xl");
  });

  it("그라디언트 텍스트 스타일이 적용됩니다", () => {
    render(<HomePage />);

    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toHaveClass(
      "bg-gradient-to-r",
      "from-blue-600",
      "to-purple-600",
      "bg-clip-text",
      "text-transparent",
    );
  });

  it("정확한 레이아웃 구조를 가집니다", () => {
    render(<HomePage />);

    // main → div(flex-1) → div(text-center) 구조
    const main = screen.getByRole("main");
    const flexContainer = main.firstElementChild;
    expect(flexContainer).toHaveClass(
      "flex-1",
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
    );

    const centerContainer = flexContainer?.firstElementChild;
    expect(centerContainer).toHaveClass("text-center", "max-w-3xl", "mx-auto");
  });
});
