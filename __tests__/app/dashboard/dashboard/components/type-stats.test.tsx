import { render, screen } from "@testing-library/react";

// Import the TypeStats component - it will use the mocked utils
import { TypeStats } from "@/app/dashboard/dashboard/components/type-stats";

// Get access to the mocked functions
import { getTypeLabel } from "@/lib/utils";

// Mock constants
jest.mock("@/lib/constants", () => ({
  QR_CODE_TYPES: {
    URL: "url",
    TEXT: "text",
    WIFI: "wifi",
    EMAIL: "email",
    SMS: "sms",
    VCARD: "vcard",
    LOCATION: "location",
  },
}));

// Type definition matching the component
interface QrCodeStats {
  total: number;
  favorites: number;
  thisMonth: number;
  byType: { [key: string]: number };
}

// Sample data for testing
const mockStats: QrCodeStats = {
  total: 25,
  favorites: 8,
  thisMonth: 12,
  byType: {
    url: 10,
    wifi: 5,
    email: 4,
    text: 3,
    sms: 2,
    vcard: 1,
  },
};

const mockEmptyStats: QrCodeStats = {
  total: 0,
  favorites: 0,
  thisMonth: 0,
  byType: {},
};

describe("TypeStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("컴포넌트가 올바르게 렌더링되어야 한다", () => {
    render(<TypeStats stats={mockStats} />);

    expect(screen.getByText("유형별 통계")).toBeInTheDocument();
    expect(
      screen.getByText("생성한 QR 코드를 유형별로 확인해보세요."),
    ).toBeInTheDocument();
  });

  it("유형별 통계가 올바르게 표시되어야 한다", () => {
    render(<TypeStats stats={mockStats} />);

    // 모든 유형과 개수가 표시되어야 한다
    expect(screen.getByText("URL")).toBeInTheDocument();
    expect(screen.getByText("Wi-Fi")).toBeInTheDocument();
    expect(screen.getByText("이메일")).toBeInTheDocument();
    expect(screen.getByText("텍스트")).toBeInTheDocument();
    expect(screen.getByText("SMS")).toBeInTheDocument();
    expect(screen.getByText("연락처")).toBeInTheDocument();

    // 개수가 올바르게 표시되어야 한다
    expect(screen.getByText("10")).toBeInTheDocument(); // url
    expect(screen.getByText("5")).toBeInTheDocument(); // wifi
    expect(screen.getByText("4")).toBeInTheDocument(); // email
    expect(screen.getByText("3")).toBeInTheDocument(); // text
    expect(screen.getByText("2")).toBeInTheDocument(); // sms
    expect(screen.getByText("1")).toBeInTheDocument(); // vcard
  });

  it("유형이 개수 순으로 정렬되어 표시되어야 한다", () => {
    render(<TypeStats stats={mockStats} />);

    const countElements = screen.getAllByText(/^\d+$/);
    const counts = countElements.map((el) => parseInt(el.textContent || "0"));

    // 내림차순으로 정렬되어 있는지 확인
    for (let i = 0; i < counts.length - 1; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i + 1]);
    }
  });

  it("빈 통계일 때 적절한 메시지를 표시해야 한다", () => {
    render(<TypeStats stats={mockEmptyStats} />);

    expect(
      screen.getByText("아직 생성한 QR 코드가 없습니다."),
    ).toBeInTheDocument();
  });

  it("stats가 null일 때 빈 상태 메시지를 표시해야 한다", () => {
    render(<TypeStats stats={null} />);

    expect(
      screen.getByText("아직 생성한 QR 코드가 없습니다."),
    ).toBeInTheDocument();
  });

  it("byType이 없는 경우 빈 상태 메시지를 표시해야 한다", () => {
    const statsWithoutByType = {
      total: 5,
      favorites: 2,
      thisMonth: 3,
      byType: {},
    };

    render(<TypeStats stats={statsWithoutByType} />);
    expect(
      screen.getByText("아직 생성한 QR 코드가 없습니다."),
    ).toBeInTheDocument();
  });

  it("배지(Badge) 컴포넌트가 올바르게 렌더링되어야 한다", () => {
    render(<TypeStats stats={mockStats} />);

    // Badge 요소들이 렌더링되어야 한다
    const badges = document.querySelectorAll('[class*="badge"]');
    expect(badges.length).toBeGreaterThan(0);
  });

  it("숫자가 큰 폰트 사이즈로 표시되어야 한다", () => {
    render(<TypeStats stats={mockStats} />);

    // text-2xl font-bold 클래스가 적용된 요소들이 있어야 한다
    const largeNumbers = document.querySelectorAll(".text-2xl.font-bold");
    expect(largeNumbers.length).toBe(6); // 6개의 유형
  });

  it("카드 구조가 올바르게 구성되어야 한다", () => {
    render(<TypeStats stats={mockStats} />);

    // Card 관련 요소들이 있어야 한다
    const cardElements = document.querySelectorAll('[class*="card"]');
    expect(cardElements.length).toBeGreaterThan(0);
  });

  it("항목들이 space-y-4 간격으로 배치되어야 한다", () => {
    render(<TypeStats stats={mockStats} />);

    const spaceContainer = document.querySelector(".space-y-4");
    expect(spaceContainer).toBeInTheDocument();
  });

  it("각 항목이 justify-between 레이아웃을 가져야 한다", () => {
    render(<TypeStats stats={mockStats} />);

    const justifyBetweenElements =
      document.querySelectorAll(".justify-between");
    expect(justifyBetweenElements.length).toBeGreaterThan(0);
  });

  it("단일 유형만 있을 때도 올바르게 처리해야 한다", () => {
    const singleTypeStats: QrCodeStats = {
      total: 5,
      favorites: 2,
      thisMonth: 3,
      byType: {
        url: 5,
      },
    };

    render(<TypeStats stats={singleTypeStats} />);

    expect(screen.getByText("URL")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("같은 개수의 유형들도 올바르게 처리해야 한다", () => {
    const equalCountStats: QrCodeStats = {
      total: 6,
      favorites: 3,
      thisMonth: 4,
      byType: {
        url: 3,
        email: 3,
      },
    };

    render(<TypeStats stats={equalCountStats} />);

    expect(screen.getByText("URL")).toBeInTheDocument();
    expect(screen.getByText("이메일")).toBeInTheDocument();
    expect(screen.getAllByText("3")).toHaveLength(2);
  });

  it("대용량 숫자도 올바르게 표시해야 한다", () => {
    const largeNumberStats: QrCodeStats = {
      total: 10000,
      favorites: 500,
      thisMonth: 1000,
      byType: {
        url: 9999,
        email: 1,
      },
    };

    render(<TypeStats stats={largeNumberStats} />);

    expect(screen.getByText("9999")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("getTypeLabel 함수가 올바르게 호출되어야 한다", () => {
    render(<TypeStats stats={mockStats} />);

    // 모든 유형에 대해 getTypeLabel이 호출되어야 한다
    expect(getTypeLabel).toHaveBeenCalledWith("url");
    expect(getTypeLabel).toHaveBeenCalledWith("wifi");
    expect(getTypeLabel).toHaveBeenCalledWith("email");
    expect(getTypeLabel).toHaveBeenCalledWith("text");
    expect(getTypeLabel).toHaveBeenCalledWith("sms");
    expect(getTypeLabel).toHaveBeenCalledWith("vcard");
  });
});
