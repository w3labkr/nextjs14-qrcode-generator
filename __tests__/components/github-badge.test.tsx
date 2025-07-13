import { render, screen } from "@testing-library/react";
import { GithubBadge } from "@/components/github-badge";
import { GITHUB_REPO_URL } from "@/lib/constants";

describe("GithubBadge", () => {
  it("GitHub 배지가 정상적으로 렌더링되어야 한다", () => {
    render(<GithubBadge />);

    // 링크 요소 확인
    const link = screen.getByRole("link", { name: /view source on github/i });
    expect(link).toBeInTheDocument();
  });

  it("올바른 href 속성을 가져야 한다", () => {
    render(<GithubBadge />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", GITHUB_REPO_URL);
  });

  it("새 탭에서 열리도록 설정되어야 한다", () => {
    render(<GithubBadge />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("적절한 CSS 클래스를 가져야 한다", () => {
    render(<GithubBadge />);

    const link = screen.getByRole("link");
    expect(link).toHaveClass("absolute", "top-0", "right-0", "z-20");
  });

  it("적절한 접근성 속성을 가져야 한다", () => {
    render(<GithubBadge />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-label", "View source on GitHub");
  });

  it("SVG 요소가 포함되어야 한다", () => {
    const { container } = render(<GithubBadge />);

    // SVG 요소 확인
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "80");
    expect(svg).toHaveAttribute("height", "80");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("SVG가 적절한 클래스를 가져야 한다", () => {
    const { container } = render(<GithubBadge />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass(
      "absolute",
      "top-0",
      "right-0",
      "border-0",
      "fill-gray-800",
      "text-white",
      "dark:fill-gray-200",
      "dark:text-black",
    );
  });

  it("octo-arm과 octo-body 요소가 있어야 한다", () => {
    const { container } = render(<GithubBadge />);

    const octoArm = container.querySelector(".octo-arm");
    const octoBody = container.querySelector(".octo-body");

    expect(octoArm).toBeInTheDocument();
    expect(octoBody).toBeInTheDocument();
  });

  it("스냅샷 테스트", () => {
    const { container } = render(<GithubBadge />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
