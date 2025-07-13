import { render, screen } from "@testing-library/react";

// Mock utils
jest.mock("@/lib/utils", () => ({
  getTypeLabel: jest.fn((type: string) => {
    const labels: { [key: string]: string } = {
      url: "URL",
      text: "텍스트",
      wifi: "Wi-Fi",
      email: "이메일",
      sms: "SMS",
      vcard: "연락처",
      location: "위치",
    };
    return labels[type] || type;
  }),
}));

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

import { StatsCards } from "@/app/dashboard/dashboard/components/stats-cards";

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

describe("StatsCards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("컴포넌트가 올바르게 렌더링되어야 한다", () => {
    render(<StatsCards stats={mockStats} loading={false} />);

    // 모든 카드 제목이 표시되어야 한다
    expect(screen.getByText("전체 QR 코드")).toBeInTheDocument();
    expect(screen.getByText("즐겨찾기")).toBeInTheDocument();
    expect(screen.getByText("이번 달")).toBeInTheDocument();
    expect(screen.getByText("인기 유형")).toBeInTheDocument();
  });

  it("통계 데이터가 올바르게 표시되어야 한다", () => {
    render(<StatsCards stats={mockStats} loading={false} />);

    // 통계 숫자가 올바르게 표시되어야 한다
    expect(screen.getByText("25")).toBeInTheDocument(); // total
    expect(screen.getByText("8")).toBeInTheDocument(); // favorites
    expect(screen.getByText("12")).toBeInTheDocument(); // thisMonth
    expect(screen.getByText("URL")).toBeInTheDocument(); // most popular type
  });

  it("설명 텍스트가 올바르게 표시되어야 한다", () => {
    render(<StatsCards stats={mockStats} loading={false} />);

    expect(screen.getByText("지금까지 생성한 QR 코드")).toBeInTheDocument();
    expect(screen.getByText("즐겨찾기로 저장된 QR 코드")).toBeInTheDocument();
    expect(screen.getByText("이번 달 생성된 QR 코드")).toBeInTheDocument();
    expect(screen.getByText("가장 많이 사용한 유형")).toBeInTheDocument();
  });

  it("로딩 상태를 올바르게 표시해야 한다", () => {
    render(<StatsCards stats={null} loading={true} />);

    // 로딩 스켈레톤이 4개 표시되어야 한다
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons).toHaveLength(4);
  });

  it("stats가 null일 때 기본값을 표시해야 한다", () => {
    render(<StatsCards stats={null} loading={false} />);

    // 기본값 0이 표시되어야 한다
    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(3); // total, favorites, thisMonth

    // 인기 유형은 "없음"이 표시되어야 한다
    expect(screen.getByText("없음")).toBeInTheDocument();
  });

  it('빈 byType 객체일 때 "없음"을 표시해야 한다', () => {
    const emptyTypeStats: QrCodeStats = {
      total: 5,
      favorites: 2,
      thisMonth: 3,
      byType: {},
    };

    render(<StatsCards stats={emptyTypeStats} loading={false} />);
    expect(screen.getByText("없음")).toBeInTheDocument();
  });

  it("가장 인기 있는 유형을 올바르게 계산해야 한다", () => {
    const differentTypeStats: QrCodeStats = {
      total: 20,
      favorites: 5,
      thisMonth: 8,
      byType: {
        email: 15, // 가장 많음
        url: 3,
        wifi: 2,
      },
    };

    render(<StatsCards stats={differentTypeStats} loading={false} />);
    expect(screen.getByText("이메일")).toBeInTheDocument();
  });

  it("아이콘들이 올바르게 렌더링되어야 한다", () => {
    render(<StatsCards stats={mockStats} loading={false} />);

    // 아이콘들이 있는지 확인 (className으로 확인)
    const qrCodeIcon = document.querySelector("svg.lucide-qr-code");
    const heartIcon = document.querySelector("svg.lucide-heart");
    const trendingUpIcon = document.querySelector("svg.lucide-trending-up");
    const plusIcon = document.querySelector("svg.lucide-plus");

    expect(qrCodeIcon).toBeTruthy();
    expect(heartIcon).toBeTruthy();
    expect(trendingUpIcon).toBeTruthy();
    expect(plusIcon).toBeTruthy();
  });

  it("그리드 레이아웃이 올바르게 적용되어야 한다", () => {
    render(<StatsCards stats={mockStats} loading={false} />);

    const gridContainer = document.querySelector(".grid");
    expect(gridContainer).toHaveClass(
      "grid-cols-1",
      "md:grid-cols-2",
      "lg:grid-cols-4",
      "gap-6",
      "mb-8",
    );
  });

  it("카드 구조가 올바르게 구성되어야 한다", () => {
    render(<StatsCards stats={mockStats} loading={false} />);

    // 4개의 카드가 있어야 한다
    const cards = document.querySelectorAll('[class*="card"]');
    expect(cards.length).toBeGreaterThanOrEqual(4);

    // 각 카드에 헤더와 콘텐츠가 있어야 한다
    const cardHeaders = document.querySelectorAll(
      '[class*="card"] [class*="header"]',
    );
    const cardContents = document.querySelectorAll(
      '[class*="card"] [class*="content"]',
    );

    expect(cardHeaders.length).toBeGreaterThanOrEqual(4);
    expect(cardContents.length).toBeGreaterThanOrEqual(4);
  });

  it("숫자 형식이 올바르게 표시되어야 한다", () => {
    const largeNumberStats: QrCodeStats = {
      total: 1234,
      favorites: 567,
      thisMonth: 89,
      byType: {
        url: 500,
        email: 400,
        wifi: 334,
      },
    };

    render(<StatsCards stats={largeNumberStats} loading={false} />);

    expect(screen.getByText("1234")).toBeInTheDocument();
    expect(screen.getByText("567")).toBeInTheDocument();
    expect(screen.getByText("89")).toBeInTheDocument();
  });

  it("단일 유형만 있을 때도 올바르게 처리해야 한다", () => {
    const singleTypeStats: QrCodeStats = {
      total: 10,
      favorites: 5,
      thisMonth: 3,
      byType: {
        url: 10,
      },
    };

    render(<StatsCards stats={singleTypeStats} loading={false} />);
    expect(screen.getByText("URL")).toBeInTheDocument();
  });
});
