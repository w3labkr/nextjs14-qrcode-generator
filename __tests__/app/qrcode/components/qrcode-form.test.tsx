import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock child components
jest.mock("@/app/qrcode/components/card-url", () => ({
  CardUrl: () => <div data-testid="card-url">URL Card</div>,
}));

jest.mock("@/app/qrcode/components/card-textarea", () => ({
  CardTextarea: () => <div data-testid="card-textarea">Textarea Card</div>,
}));

jest.mock("@/app/qrcode/components/card-wifi", () => ({
  CardWifi: () => <div data-testid="card-wifi">WiFi Card</div>,
}));

jest.mock("@/app/qrcode/components/card-email", () => ({
  CardEmail: () => <div data-testid="card-email">Email Card</div>,
}));

jest.mock("@/app/qrcode/components/card-sms", () => ({
  CardSms: () => <div data-testid="card-sms">SMS Card</div>,
}));

jest.mock("@/app/qrcode/components/card-vcard", () => ({
  CardVCard: () => <div data-testid="card-vcard">VCard Card</div>,
}));

jest.mock("@/app/qrcode/components/card-location", () => ({
  CardLocation: () => <div data-testid="card-location">Location Card</div>,
}));

jest.mock("@/app/qrcode/components/card-style", () => ({
  CardStyle: () => <div data-testid="card-style">Style Card</div>,
}));

jest.mock("@/app/qrcode/components/card-preview", () => ({
  CardPreview: () => <div data-testid="card-preview">Preview Card</div>,
}));

import { QrcodeForm } from "@/app/qrcode/components/qrcode-form";

describe("QrcodeForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("컴포넌트가 올바르게 렌더링되어야 한다", () => {
    render(<QrcodeForm />);

    // 탭 리스트가 렌더링되는지 확인
    expect(screen.getByRole("tablist")).toBeInTheDocument();

    // 모든 탭이 렌더링되는지 확인
    expect(screen.getByRole("tab", { name: "URL" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "텍스트" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Wi-Fi" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "이메일" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "SMS" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "연락처" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "지도" })).toBeInTheDocument();

    // 기본적으로 URL 탭이 활성화되어야 한다
    expect(screen.getByRole("tab", { name: "URL" })).toHaveAttribute(
      "data-state",
      "active",
    );

    // 미리보기 컴포넌트가 항상 표시되어야 한다
    expect(screen.getByTestId("card-preview")).toBeInTheDocument();
  });

  describe("탭 전환", () => {
    it("텍스트 탭을 클릭하면 텍스트 카드가 표시되어야 한다", async () => {
      render(<QrcodeForm />);

      const textTab = screen.getByRole("tab", { name: "텍스트" });
      fireEvent.click(textTab);

      await waitFor(
        () => {
          expect(screen.getByTestId("card-textarea")).toBeInTheDocument();
          expect(screen.getByTestId("card-style")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });

    it("Wi-Fi 탭을 클릭하면 Wi-Fi 카드가 표시되어야 한다", async () => {
      render(<QrcodeForm />);

      const wifiTab = screen.getByRole("tab", { name: "Wi-Fi" });
      fireEvent.click(wifiTab);

      await waitFor(
        () => {
          expect(screen.getByTestId("card-wifi")).toBeInTheDocument();
          expect(screen.getByTestId("card-style")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });

    it("이메일 탭을 클릭하면 이메일 카드가 표시되어야 한다", async () => {
      render(<QrcodeForm />);

      const emailTab = screen.getByRole("tab", { name: "이메일" });
      fireEvent.click(emailTab);

      await waitFor(
        () => {
          expect(screen.getByTestId("card-email")).toBeInTheDocument();
          expect(screen.getByTestId("card-style")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });

    it("SMS 탭을 클릭하면 SMS 카드가 표시되어야 한다", async () => {
      render(<QrcodeForm />);

      const smsTab = screen.getByRole("tab", { name: "SMS" });
      fireEvent.click(smsTab);

      await waitFor(
        () => {
          expect(screen.getByTestId("card-sms")).toBeInTheDocument();
          expect(screen.getByTestId("card-style")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });

    it("연락처 탭을 클릭하면 연락처 카드가 표시되어야 한다", async () => {
      render(<QrcodeForm />);

      const vcardTab = screen.getByRole("tab", { name: "연락처" });
      fireEvent.click(vcardTab);

      await waitFor(
        () => {
          expect(screen.getByTestId("card-vcard")).toBeInTheDocument();
          expect(screen.getByTestId("card-style")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });

    it("지도 탭을 클릭하면 지도 카드가 표시되어야 한다", async () => {
      render(<QrcodeForm />);

      const locationTab = screen.getByRole("tab", { name: "지도" });
      fireEvent.click(locationTab);

      await waitFor(
        () => {
          expect(screen.getByTestId("card-location")).toBeInTheDocument();
          expect(screen.getByTestId("card-style")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  });

  describe("접근성", () => {
    it("탭 목록이 올바른 ARIA 속성을 가져야 한다", () => {
      render(<QrcodeForm />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("aria-orientation", "horizontal");

      // 각 탭이 올바른 ARIA 속성을 가져야 한다
      const tabs = screen.getAllByRole("tab");
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute("aria-controls");
        expect(tab).toHaveAttribute("aria-selected");
      });
    });

    it("활성 탭이 올바른 ARIA 상태를 가져야 한다", () => {
      render(<QrcodeForm />);

      const activeTab = screen.getByRole("tab", { name: "URL" });
      expect(activeTab).toHaveAttribute("aria-selected", "true");
      expect(activeTab).toHaveAttribute("data-state", "active");
    });

    it("비활성 탭이 올바른 ARIA 상태를 가져야 한다", () => {
      render(<QrcodeForm />);

      const inactiveTabs = [
        screen.getByRole("tab", { name: "텍스트" }),
        screen.getByRole("tab", { name: "Wi-Fi" }),
        screen.getByRole("tab", { name: "이메일" }),
      ];

      inactiveTabs.forEach((tab) => {
        expect(tab).toHaveAttribute("aria-selected", "false");
        expect(tab).toHaveAttribute("data-state", "inactive");
      });
    });

    it("키보드 탐색이 올바르게 작동해야 한다", () => {
      render(<QrcodeForm />);

      const firstTab = screen.getByRole("tab", { name: "URL" });
      firstTab.focus();

      expect(firstTab).toHaveFocus();
    });
  });

  describe("반응형 디자인", () => {
    it("그리드 레이아웃이 올바르게 적용되어야 한다", () => {
      render(<QrcodeForm />);

      const form = screen.getByTestId("card-preview").closest("form");
      expect(form).toHaveClass(
        "grid",
        "grid-cols-1",
        "sm:grid-cols-2",
        "gap-4",
      );
    });

    it("스크롤 영역이 올바르게 설정되어야 한다", () => {
      render(<QrcodeForm />);

      const scrollViewport = document.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      expect(scrollViewport).toBeInTheDocument();
    });
  });

  describe("탭 상태 관리", () => {
    it("한 번에 하나의 탭만 활성화되어야 한다", async () => {
      render(<QrcodeForm />);

      const urlTab = screen.getByRole("tab", { name: "URL" });
      const textTab = screen.getByRole("tab", { name: "텍스트" });

      // 초기 상태 확인
      expect(urlTab).toHaveAttribute("data-state", "active");
      expect(textTab).toHaveAttribute("data-state", "inactive");

      // 다른 탭 클릭
      fireEvent.click(textTab);

      await waitFor(
        () => {
          expect(textTab).toHaveAttribute("data-state", "active");
          expect(urlTab).toHaveAttribute("data-state", "inactive");
        },
        { timeout: 2000 },
      );
    });

    it("활성 탭의 콘텐츠만 표시되어야 한다", async () => {
      render(<QrcodeForm />);

      // 초기 상태에서는 URL 카드가 표시되어야 한다
      expect(screen.getByTestId("card-url")).toBeInTheDocument();
      expect(screen.queryByTestId("card-textarea")).not.toBeInTheDocument();

      // 텍스트 탭 클릭
      const textTab = screen.getByRole("tab", { name: "텍스트" });
      fireEvent.click(textTab);

      await waitFor(
        () => {
          expect(screen.getByTestId("card-textarea")).toBeInTheDocument();
          expect(screen.queryByTestId("card-url")).not.toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  });

  describe("컴포넌트 통합", () => {
    it("모든 하위 컴포넌트가 올바르게 렌더링되어야 한다", async () => {
      render(<QrcodeForm />);

      const tabConfigs = [
        { name: "URL", testId: "card-url" },
        { name: "텍스트", testId: "card-textarea" },
        { name: "Wi-Fi", testId: "card-wifi" },
        { name: "이메일", testId: "card-email" },
        { name: "SMS", testId: "card-sms" },
        { name: "연락처", testId: "card-vcard" },
        { name: "지도", testId: "card-location" },
      ];

      for (const config of tabConfigs) {
        const tab = screen.getByRole("tab", { name: config.name });
        fireEvent.click(tab);

        await waitFor(
          () => {
            expect(screen.getByTestId(config.testId)).toBeInTheDocument();
            expect(screen.getByTestId("card-style")).toBeInTheDocument();
          },
          { timeout: 2000 },
        );
      }

      // 미리보기는 항상 표시되어야 한다
      expect(screen.getByTestId("card-preview")).toBeInTheDocument();
    });

    it("폼이 올바르게 구성되어야 한다", () => {
      render(<QrcodeForm />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute("novalidate");
    });

    it("폼 제출이 올바르게 처리되어야 한다", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      render(<QrcodeForm />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();

      if (form) {
        fireEvent.submit(form);
        expect(consoleSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });
  });

  describe("레이아웃 검증", () => {
    it("좌측에는 탭과 콘텐츠가, 우측에는 미리보기가 배치되어야 한다", () => {
      render(<QrcodeForm />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();

      const leftColumn = form?.firstElementChild;
      const rightColumn = form?.lastElementChild;

      // 좌측 칼럼에는 탭들이 있어야 한다
      expect(leftColumn?.querySelector('[role="tablist"]')).toBeInTheDocument();

      // 우측 칼럼에는 미리보기가 있어야 한다
      expect(
        rightColumn?.querySelector('[data-testid="card-preview"]'),
      ).toBeInTheDocument();
    });

    it("각 탭 콘텐츠에는 해당 카드와 스타일 카드가 모두 포함되어야 한다", async () => {
      render(<QrcodeForm />);

      // URL 탭 (기본 활성)
      expect(screen.getByTestId("card-url")).toBeInTheDocument();
      expect(screen.getByTestId("card-style")).toBeInTheDocument();

      // 다른 탭들도 확인
      const textTab = screen.getByRole("tab", { name: "텍스트" });
      fireEvent.click(textTab);

      await waitFor(
        () => {
          expect(screen.getByTestId("card-textarea")).toBeInTheDocument();
          expect(screen.getByTestId("card-style")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  });
});
