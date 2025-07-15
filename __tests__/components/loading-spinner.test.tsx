import { render } from "@testing-library/react";
import { LoadingSpinner } from "@/components/loading-spinner";

describe("LoadingSpinner", () => {
  it("로딩 스피너가 정상적으로 렌더링되어야 한다", () => {
    const { container } = render(<LoadingSpinner />);

    // 로딩 스피너 컨테이너 확인
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass(
      "animate-spin",
      "rounded-full",
      "h-8",
      "w-8",
      "border-b-2",
      "border-primary",
    );
  });

  it("적절한 스타일링 클래스를 가져야 한다", () => {
    const { container } = render(<LoadingSpinner />);

    // 외부 컨테이너 확인
    const outerContainer = container.querySelector(".flex.min-h-screen");
    expect(outerContainer).toBeInTheDocument();
    expect(outerContainer).toHaveClass(
      "flex",
      "min-h-screen",
      "items-center",
      "justify-center",
    );
  });

  it("로딩 스피너의 구조가 올바르게 렌더링되어야 한다", () => {
    const { container } = render(<LoadingSpinner />);

    // 전체 구조 확인
    expect(container.firstChild).toHaveClass(
      "flex",
      "min-h-screen",
      "items-center",
      "justify-center",
    );

    // 스피너 div 확인
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("스냅샷 테스트", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toMatchSnapshot();
  });

  describe("접근성 테스트", () => {
    it("로딩 스피너가 스크린 리더에 적절히 노출되어야 한다", () => {
      const { container, getByRole } = render(<LoadingSpinner />);
      
      const spinner = getByRole("status");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute("aria-label", "로딩 중...");
    });

    it("스크린 리더용 텍스트를 가져야 한다", () => {
      const { container } = render(<LoadingSpinner />);
      
      const screenReaderText = container.querySelector(".sr-only");
      expect(screenReaderText).toBeInTheDocument();
      expect(screenReaderText).toHaveTextContent("로딩 중...");
    });

    it("로딩 상태를 나타내는 적절한 구조를 가져야 한다", () => {
      const { container } = render(<LoadingSpinner />);
      
      // 스피너가 중앙에 배치되어야 함
      const outerContainer = container.querySelector(".flex.min-h-screen");
      expect(outerContainer).toHaveClass("items-center", "justify-center");
    });

    it("로딩 애니메이션이 적용되어야 한다", () => {
      const { container } = render(<LoadingSpinner />);
      
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("animate-spin");
    });
  });

  describe("스타일링 테스트", () => {
    it("스피너의 크기와 색상이 정확해야 한다", () => {
      const { container } = render(<LoadingSpinner />);
      
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("h-8", "w-8");
      expect(spinner).toHaveClass("border-b-2", "border-primary");
    });

    it("스피너가 원형이어야 한다", () => {
      const { container } = render(<LoadingSpinner />);
      
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("rounded-full");
    });
  });
});
