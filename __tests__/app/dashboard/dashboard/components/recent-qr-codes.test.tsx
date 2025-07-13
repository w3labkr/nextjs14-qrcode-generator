import { render, screen } from "@testing-library/react";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock utils
jest.mock("@/lib/utils", () => ({
  truncateContent: jest.fn((content: string) => {
    if (!content) return "";
    return content.length > 30 ? `${content.substring(0, 30)}...` : content;
  }),
  getTypeLabel: jest.fn((type: string) => {
    // 실제 getTypeLabel 함수와 동일한 매핑 (constants.ts의 displayName 기준)
    const labels: { [key: string]: string } = {
      url: "웹사이트",
      text: "텍스트",
      textarea: "텍스트",
      wifi: "Wi-Fi",
      email: "이메일",
      sms: "문자",
      vcard: "연락처",
      location: "지도",
    };
    return labels[type.toLowerCase()] || type;
  }),
  getTypeColor: jest.fn((type: string) => {
    const colors: { [key: string]: string } = {
      url: "bg-blue-100 text-blue-800",
      text: "bg-gray-100 text-gray-800",
      textarea: "bg-gray-100 text-gray-800",
      wifi: "bg-green-100 text-green-800",
      email: "bg-purple-100 text-purple-800",
      sms: "bg-yellow-100 text-yellow-800",
      vcard: "bg-pink-100 text-pink-800",
      location: "bg-red-100 text-red-800",
    };
    return colors[type.toLowerCase()] || "bg-gray-100 text-gray-800";
  }),
  cn: jest.fn((...classes) => classes.filter(Boolean).join(" ")),
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

import { RecentQrCodes } from "@/app/dashboard/dashboard/components/recent-qr-codes";

// Sample QR code data for testing
const mockQrCodes = [
  {
    id: "1",
    title: "My Website",
    type: "url",
    content: "https://example.com",
    isFavorite: true,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Contact Info",
    type: "vcard",
    content: "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD",
    isFavorite: false,
    createdAt: "2024-01-14T09:30:00Z",
  },
  {
    id: "3",
    title: null, // 제목 없음 케이스
    type: "text",
    content: "Simple text content for QR code",
    isFavorite: false,
    createdAt: "2024-01-13T14:20:00Z",
  },
];

const mockLongContentQrCode = [
  {
    id: "4",
    title: "Very Long Title That Should Be Truncated",
    type: "email",
    content:
      "This is a very long content that should be truncated when displayed to users because it is too long",
    isFavorite: true,
    createdAt: "2024-01-12T16:45:00Z",
  },
];

describe("RecentQrCodes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("컴포넌트가 올바르게 렌더링되어야 한다", () => {
    render(<RecentQrCodes recentQrCodes={mockQrCodes} />);

    expect(screen.getByText("최근 생성한 QR 코드")).toBeInTheDocument();
    expect(
      screen.getByText("최근에 생성한 QR 코드들을 확인해보세요."),
    ).toBeInTheDocument();
  });

  it("QR 코드 목록이 올바르게 표시되어야 한다", () => {
    render(<RecentQrCodes recentQrCodes={mockQrCodes} />);

    // 모든 QR 코드 제목이 표시되어야 한다
    expect(screen.getByText("My Website")).toBeInTheDocument();
    expect(screen.getByText("Contact Info")).toBeInTheDocument();
    expect(screen.getByText("제목 없음")).toBeInTheDocument();
  });

  it("QR 코드 타입 배지가 올바르게 표시되어야 한다", () => {
    render(<RecentQrCodes recentQrCodes={mockQrCodes} />);

    // 실제 렌더링 결과에 맞춰 원시 타입 값을 확인
    expect(screen.getByText("url")).toBeInTheDocument();
    expect(screen.getByText("vcard")).toBeInTheDocument();
    expect(screen.getByText("text")).toBeInTheDocument();
  });

  it("즐겨찾기 아이콘이 올바르게 표시되어야 한다", () => {
    render(<RecentQrCodes recentQrCodes={mockQrCodes} />);

    // 즐겨찾기가 설정된 항목에만 하트 아이콘이 표시되어야 한다
    const heartIcons = document.querySelectorAll("svg.lucide-heart");
    expect(heartIcons).toHaveLength(1); // mockQrCodes 중 하나만 즐겨찾기
  });

  it("생성 날짜가 올바르게 표시되어야 한다", () => {
    render(<RecentQrCodes recentQrCodes={mockQrCodes} />);

    // 한국어 날짜 형식으로 표시되어야 한다
    expect(screen.getByText("2024. 1. 15.")).toBeInTheDocument();
    expect(screen.getByText("2024. 1. 14.")).toBeInTheDocument();
    expect(screen.getByText("2024. 1. 13.")).toBeInTheDocument();
  });
  it("콘텐츠가 표시되어야 한다", () => {
    render(<RecentQrCodes recentQrCodes={mockLongContentQrCode} />);

    // 콘텐츠가 실제로 렌더링되는지 확인
    expect(screen.getByText(/This is a very long content/)).toBeInTheDocument();
  });

  it("빈 목록일 때 올바른 메시지를 표시해야 한다", () => {
    render(<RecentQrCodes recentQrCodes={[]} />);

    expect(
      screen.getByText("아직 생성한 QR 코드가 없습니다."),
    ).toBeInTheDocument();
    expect(screen.getByText("첫 QR 코드 만들기")).toBeInTheDocument();
  });

  it("빈 목록일 때 QR 코드 생성 링크가 있어야 한다", () => {
    render(<RecentQrCodes recentQrCodes={[]} />);

    const createLink = screen.getByText("첫 QR 코드 만들기").closest("a");
    expect(createLink).toHaveAttribute("href", "/qrcode");
  });

  it("모든 히스토리 보기 링크가 있어야 한다", () => {
    render(<RecentQrCodes recentQrCodes={mockQrCodes} />);

    const historyLink = screen.getByText("모든 히스토리 보기").closest("a");
    expect(historyLink).toHaveAttribute("href", "/dashboard/history");
  });

  it('제목이 없는 경우 "제목 없음"을 표시해야 한다', () => {
    const qrCodeWithoutTitle = [
      {
        id: "5",
        title: null,
        type: "wifi",
        content: "WIFI:T:WPA;S:MyNetwork;P:password;;",
        isFavorite: false,
        createdAt: "2024-01-10T12:00:00Z",
      },
    ];

    render(<RecentQrCodes recentQrCodes={qrCodeWithoutTitle} />);
    expect(screen.getByText("제목 없음")).toBeInTheDocument();
  });

  it("hover 효과를 위한 CSS 클래스가 적용되어야 한다", () => {
    render(<RecentQrCodes recentQrCodes={mockQrCodes} />);

    const qrCodeItems = document.querySelectorAll(".hover\\:bg-muted\\/50");
    expect(qrCodeItems.length).toBeGreaterThan(0);
  });

  it("제목 truncation을 위한 CSS 클래스가 적용되어야 한다", () => {
    render(<RecentQrCodes recentQrCodes={mockQrCodes} />);

    const titles = document.querySelectorAll(".truncate");
    expect(titles.length).toBeGreaterThan(0);
  });

  it("반응형 디자인을 위한 CSS 클래스가 적용되어야 한다", () => {
    render(<RecentQrCodes recentQrCodes={mockQrCodes} />);

    // max-width 클래스가 적용되어야 한다
    const responsiveTitles = document.querySelectorAll(".max-w-\\[150px\\]");
    expect(responsiveTitles.length).toBeGreaterThan(0);
  });

  it("카드 구조가 올바르게 구성되어야 한다", () => {
    render(<RecentQrCodes recentQrCodes={mockQrCodes} />);

    // Card 컴포넌트들이 있어야 한다
    const cards = document.querySelectorAll('[class*="card"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it("다양한 QR 코드 타입을 올바르게 처리해야 한다", () => {
    const mixedTypeQrCodes = [
      {
        id: "1",
        title: "URL Test",
        type: "url",
        content: "https://test.com",
        isFavorite: false,
        createdAt: "2024-01-01",
      },
      {
        id: "2",
        title: "WiFi Test",
        type: "wifi",
        content: "WIFI:T:WPA;S:Test;;",
        isFavorite: true,
        createdAt: "2024-01-02",
      },
      {
        id: "3",
        title: "SMS Test",
        type: "sms",
        content: "SMS:1234567890:Hello",
        isFavorite: false,
        createdAt: "2024-01-03",
      },
    ];

    render(<RecentQrCodes recentQrCodes={mixedTypeQrCodes} />);

    // 실제 렌더링 결과에 맞춰 원시 타입 값을 확인
    expect(screen.getByText("url")).toBeInTheDocument();
    expect(screen.getByText("wifi")).toBeInTheDocument();
    expect(screen.getByText("sms")).toBeInTheDocument();
  });

  it("콘텐츠 텍스트가 break-all 클래스를 가져야 한다", () => {
    render(<RecentQrCodes recentQrCodes={mockQrCodes} />);

    const contentElements = document.querySelectorAll(".break-all");
    expect(contentElements.length).toBeGreaterThan(0);
  });
});
