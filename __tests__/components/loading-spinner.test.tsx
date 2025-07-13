import { render } from "@testing-library/react";
import { LoadingSpinner } from "@/components/loading-spinner";

describe("LoadingSpinner", () => {
  it("로딩 스피너가 정상적으로 렌더링되어야 한다", () => {
    const { container } = render(<LoadingSpinner />);
    
    // 로딩 스피너 컨테이너 확인
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin", "rounded-full", "h-8", "w-8", "border-b-2", "border-primary");
  });

  it("적절한 스타일링 클래스를 가져야 한다", () => {
    const { container } = render(<LoadingSpinner />);
    
    // 외부 컨테이너 확인
    const outerContainer = container.querySelector(".flex.min-h-screen");
    expect(outerContainer).toBeInTheDocument();
    expect(outerContainer).toHaveClass("flex", "min-h-screen", "items-center", "justify-center");
  });

  it("로딩 스피너의 구조가 올바르게 렌더링되어야 한다", () => {
    const { container } = render(<LoadingSpinner />);
    
    // 전체 구조 확인
    expect(container.firstChild).toHaveClass("flex", "min-h-screen", "items-center", "justify-center");
    
    // 스피너 div 확인
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("스냅샷 테스트", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
