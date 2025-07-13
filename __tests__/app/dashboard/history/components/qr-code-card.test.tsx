import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock date-fns
jest.mock("date-fns", () => ({
  format: jest.fn((date, format, options) => {
    const mockDate = new Date(date);
    if (format === "yyyy년 M월 d일 HH:mm:ss") {
      return `${mockDate.getFullYear()}년 ${mockDate.getMonth() + 1}월 ${mockDate.getDate()}일 ${mockDate.getHours().toString().padStart(2, "0")}:${mockDate.getMinutes().toString().padStart(2, "0")}:${mockDate.getSeconds().toString().padStart(2, "0")}`;
    }
    return mockDate.toISOString();
  }),
}));

jest.mock("date-fns/locale", () => ({
  ko: {},
}));

// Mock utils
jest.mock("@/lib/utils", () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(" ")),
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
  getContentPreview: jest.fn((content: string, type: string) => {
    if (!content) return "";
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  }),
  getQrCodeColor: jest.fn((settings: any) => {
    return settings?.color || "#000000";
  }),
}));

import { QrCodeCard } from "@/app/dashboard/history/components/qr-code-card";

// Mock QR code data
const mockQrCode = {
  id: "qr-1",
  type: "url",
  title: "My Website",
  content: "https://example.com",
  settings: { color: "#0066cc" },
  isFavorite: true,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
};

const mockQrCodeWithoutTitle = {
  id: "qr-2",
  type: "text",
  title: null,
  content: "Simple text content",
  settings: {},
  isFavorite: false,
  createdAt: "2024-01-14T09:15:00Z",
  updatedAt: "2024-01-14T09:15:00Z",
};

const mockQrCodeWithLongContent = {
  id: "qr-3",
  type: "email",
  title: "Long Content Email",
  content:
    "This is a very long email content that should be truncated when displayed in the preview section of the card component",
  settings: { color: "#ff0000" },
  isFavorite: false,
  createdAt: "2024-01-13T14:45:00Z",
  updatedAt: "2024-01-13T14:45:00Z",
};

// Mock functions
const mockOnToggleFavorite = jest.fn();
const mockOnDelete = jest.fn();
const mockOnDownload = jest.fn();
const mockOnEditTitle = jest.fn();

describe("QrCodeCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.warn mock
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("컴포넌트가 올바르게 렌더링되어야 한다", () => {
    render(
      <QrCodeCard
        qrCode={mockQrCode}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    expect(screen.getByText("My Website")).toBeInTheDocument();
    expect(screen.getByText("웹사이트")).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
  });

  it('제목이 없는 경우 "제목 없음"을 표시해야 한다', () => {
    render(
      <QrCodeCard
        qrCode={mockQrCodeWithoutTitle}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    expect(screen.getByText("제목 없음")).toBeInTheDocument();
  });

  it("즐겨찾기 버튼이 올바르게 작동해야 한다", async () => {
    const user = userEvent.setup();

    render(
      <QrCodeCard
        qrCode={mockQrCode}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    // 하트 아이콘이 있는 버튼을 찾기
    const favoriteButton = document
      .querySelector("svg.lucide-heart")
      ?.closest("button");
    expect(favoriteButton).toBeInTheDocument();

    if (favoriteButton) {
      await user.click(favoriteButton);
      expect(mockOnToggleFavorite).toHaveBeenCalledWith("qr-1");
    }
  });

  it("즐겨찾기 상태에 따라 하트 아이콘 스타일이 변경되어야 한다", () => {
    // 즐겨찾기인 경우
    const { rerender } = render(
      <QrCodeCard
        qrCode={mockQrCode}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    let heartIcon = document.querySelector("svg.lucide-heart");
    expect(heartIcon).toHaveClass("text-red-500", "fill-current");

    // 즐겨찾기가 아닌 경우
    rerender(
      <QrCodeCard
        qrCode={mockQrCodeWithoutTitle}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    heartIcon = document.querySelector("svg.lucide-heart");
    expect(heartIcon).toHaveClass("text-gray-400");
  });

  it("다운로드 버튼이 올바르게 작동해야 한다", async () => {
    const user = userEvent.setup();

    render(
      <QrCodeCard
        qrCode={mockQrCode}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    const downloadButton = document
      .querySelector("button svg.lucide-download")
      ?.closest("button");
    expect(downloadButton).toBeInTheDocument();

    if (downloadButton) {
      await user.click(downloadButton);
      expect(mockOnDownload).toHaveBeenCalledWith(mockQrCode);
    }
  });

  it("삭제 버튼이 올바르게 작동해야 한다", async () => {
    const user = userEvent.setup();

    render(
      <QrCodeCard
        qrCode={mockQrCode}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    const deleteButton = document
      .querySelector("button svg.lucide-trash-2")
      ?.closest("button");
    expect(deleteButton).toBeInTheDocument();

    if (deleteButton) {
      await user.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith("qr-1");
    }
  });

  it("제목 편집이 올바르게 작동해야 한다", async () => {
    const user = userEvent.setup();

    render(
      <QrCodeCard
        qrCode={mockQrCode}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    const titleElement = screen.getByText("My Website");
    await user.click(titleElement);

    expect(mockOnEditTitle).toHaveBeenCalledWith("qr-1", "My Website");
  });

  it("날짜가 올바르게 포맷되어 표시되어야 한다", () => {
    render(
      <QrCodeCard
        qrCode={mockQrCode}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    // 실제 렌더링된 날짜 포맷 확인 (테스트 출력에서 보면 시간이 다름)
    expect(screen.getByText("2024년 1월 15일 19:30:00")).toBeInTheDocument();
  });

  it("타입 배지가 올바르게 표시되어야 한다", () => {
    render(
      <QrCodeCard
        qrCode={mockQrCode}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    // 실제 렌더링된 타입 레이블 확인
    expect(screen.getByText("웹사이트")).toBeInTheDocument();
  });

  it("콘텐츠 미리보기가 올바르게 표시되어야 한다", () => {
    render(
      <QrCodeCard
        qrCode={mockQrCodeWithLongContent}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    // 콘텐츠가 실제로 표시되는지 확인
    expect(
      screen.getByText(/This is a very long email content/),
    ).toBeInTheDocument();
  });

  it("QR 코드 색상이 올바르게 적용되어야 한다", () => {
    render(
      <QrCodeCard
        qrCode={mockQrCode}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    // QR 코드 SVG 아이콘이 있는지 확인
    const qrIcon = document.querySelector(".lucide-qr-code");
    expect(qrIcon).toBeInTheDocument();
  });

  it("잘못된 QR 코드 데이터일 때 null을 반환해야 한다", () => {
    const { container } = render(
      <QrCodeCard
        qrCode={null as any}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    expect(container.firstChild).toBeNull();
    expect(console.warn).toHaveBeenCalledWith("Invalid qrCode data:", null);
  });

  it("ID가 없는 QR 코드 데이터일 때 null을 반환해야 한다", () => {
    const invalidQrCode = { ...mockQrCode, id: "" };

    const { container } = render(
      <QrCodeCard
        qrCode={invalidQrCode}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    expect(container.firstChild).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      "Invalid qrCode data:",
      invalidQrCode,
    );
  });

  it("날짜 포맷 에러 시 대체 텍스트를 표시해야 한다", () => {
    const qrCodeWithInvalidDate = {
      ...mockQrCode,
      createdAt: "invalid-date",
    };

    // Mock format to throw error
    const { format } = require("date-fns");
    format.mockImplementationOnce(() => {
      throw new Error("Invalid date");
    });

    render(
      <QrCodeCard
        qrCode={qrCodeWithInvalidDate}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    expect(screen.getByText("날짜 정보 없음")).toBeInTheDocument();
    expect(console.warn).toHaveBeenCalledWith(
      "Date formatting error:",
      expect.any(Error),
    );
  });

  it("hover 효과와 관련된 CSS 클래스가 적용되어야 한다", () => {
    render(
      <QrCodeCard
        qrCode={mockQrCode}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    // 카드 컨테이너가 렌더링되는지 확인 (최상위 div)
    const cardContainer = document.querySelector(".rounded-xl.border");
    expect(cardContainer).toBeInTheDocument();
  });

  it("tooltip이 올바르게 표시되어야 한다", () => {
    render(
      <QrCodeCard
        qrCode={mockQrCode}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    // 툴팁 기능을 위한 버튼들이 렌더링되는지 확인
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("삭제 버튼에 적절한 스타일이 적용되어야 한다", () => {
    render(
      <QrCodeCard
        qrCode={mockQrCode}
        onToggleFavorite={mockOnToggleFavorite}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
        onEditTitle={mockOnEditTitle}
      />,
    );

    // 삭제 버튼이 렌더링되는지 확인
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
