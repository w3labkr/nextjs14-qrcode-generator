import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";

// AuthProvider 모킹
jest.mock("@/context/auth-provider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

// ClientOnly 모킹
jest.mock("@/components/client-only", () => ({
  ClientOnly: ({
    children,
    fallback,
  }: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) => <div data-testid="client-only">{children}</div>,
}));

// LoadingSpinner 모킹
jest.mock("@/components/loading-spinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// TailwindIndicator 모킹
jest.mock("@/components/tailwind-indicator", () => ({
  TailwindIndicator: () => <div data-testid="tailwind-indicator" />,
}));

// Toaster 모킹
jest.mock("@/components/ui/sonner", () => ({
  Toaster: ({
    richColors,
    closeButton,
  }: {
    richColors?: boolean;
    closeButton?: boolean;
  }) => (
    <div
      data-testid="toaster"
      data-rich-colors={richColors}
      data-close-button={closeButton}
    />
  ),
}));

describe("RootLayout", () => {
  it("AuthProvider로 children을 감쌉니다", () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>,
    );

    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("ClientOnly 컴포넌트가 렌더링됩니다", () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>,
    );

    expect(screen.getByTestId("client-only")).toBeInTheDocument();
  });

  it("Toaster가 올바른 props로 렌더링됩니다", () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>,
    );

    const toaster = screen.getByTestId("toaster");
    expect(toaster).toBeInTheDocument();
    expect(toaster).toHaveAttribute("data-rich-colors", "true");
    expect(toaster).toHaveAttribute("data-close-button", "true");
  });

  it("TailwindIndicator가 렌더링됩니다", () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>,
    );

    expect(screen.getByTestId("tailwind-indicator")).toBeInTheDocument();
  });

  it("root div가 존재합니다", () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>,
    );

    const rootDiv = document.getElementById("root");
    expect(rootDiv).toBeInTheDocument();
  });

  it("metadata export가 올바르게 정의되어 있습니다", async () => {
    const { metadata } = await import("@/app/layout");

    expect(metadata.title).toBe("오픈소스 QR 코드 생성기");
    expect(metadata.description).toContain("회원가입이나 로그인 없이");
    expect(metadata.formatDetection?.telephone).toBe(false);

    // icons 타입 안전하게 확인
    if (
      typeof metadata.icons === "object" &&
      metadata.icons &&
      "icon" in metadata.icons
    ) {
      expect(metadata.icons.icon).toBe("/favicon.ico");
    }

    // openGraph 타입 안전하게 확인
    expect(metadata.openGraph?.siteName).toBe("오픈소스 QR 코드 생성기");

    // twitter 타입 안전하게 확인
    expect(metadata.twitter).toBeDefined();
  });
});
