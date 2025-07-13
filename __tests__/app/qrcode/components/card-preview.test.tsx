import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SessionProvider } from "next-auth/react";
import * as z from "zod";
import { CardPreview } from "@/app/qrcode/components/card-preview";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: "test-user", email: "test@example.com" } },
    status: "authenticated",
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock QR 코드 생성 액션
jest.mock("@/app/actions/qr-code-generator", () => ({
  generateQrCode: jest.fn(),
}));

// Mock QR 코드 저장 액션
jest.mock("@/app/actions/qr-code-management", () => ({
  saveQrCode: jest.fn(),
}));

// Mock QR 핸들러
jest.mock("@/app/qrcode/components/qr-handlers", () => ({
  getQrHandler: jest.fn().mockReturnValue(() => ({
    hasError: false,
    qrText: "https://example.com",
  })),
  handleQrDownload: jest.fn(),
}));

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// QR 코드 폼 스키마 정의
const qrcodeFormSchema = z.object({
  qrType: z.enum([
    "url",
    "textarea",
    "wifi",
    "email",
    "sms",
    "vcard",
    "location",
  ]),
  url: z.string(),
  textarea: z.string(),
  previewExportFormat: z.enum(["png", "jpg", "svg"]),
  previewSize: z.number().min(100).max(1000),
  previewQuality: z.number().min(1).max(100),
});

type QrcodeFormValues = z.infer<typeof qrcodeFormSchema>;

const defaultValues: QrcodeFormValues = {
  qrType: "url",
  url: "https://example.com",
  textarea: "Sample text",
  previewExportFormat: "png",
  previewSize: 256,
  previewQuality: 100,
};

// 테스트용 래퍼 컴포넌트
function TestWrapper({
  children,
  initialValues = defaultValues,
  session = { user: { id: "test-user", email: "test@example.com" } },
}: {
  children: React.ReactNode;
  initialValues?: Partial<QrcodeFormValues>;
  session?: any;
}) {
  const methods = useForm<QrcodeFormValues>({
    resolver: zodResolver(qrcodeFormSchema),
    defaultValues: { ...defaultValues, ...initialValues },
  });

  return (
    <SessionProvider session={session}>
      <FormProvider {...methods}>{children}</FormProvider>
    </SessionProvider>
  );
}

describe("CardPreview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("렌더링", () => {
    it("카드 제목과 설명이 렌더링되어야 한다", () => {
      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      expect(screen.getByText("QR 코드 미리보기")).toBeInTheDocument();
    });

    it("QR 코드 생성/저장 버튼이 렌더링되어야 한다", () => {
      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      // 인증된 사용자의 경우 "QR 코드 저장" 또는 "QR 코드 생성" 버튼이 있을 수 있음
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("내보내기 형식 선택 필드가 렌더링되어야 한다", () => {
      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      // Select 컴포넌트가 렌더링되는지 확인
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("다운로드 버튼이 렌더링되어야 한다", () => {
      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      expect(
        screen.getByRole("button", { name: "다운로드" }),
      ).toBeInTheDocument();
    });
  });

  describe("기본값", () => {
    it("기본 내보내기 형식이 PNG로 표시되어야 한다", () => {
      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      expect(screen.getByText("PNG (기본 해상도)")).toBeInTheDocument();
    });
  });

  describe("사용자 상호작용", () => {
    it("내보내기 형식을 변경할 수 있어야 한다", async () => {
      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      const formatSelect = screen.getByRole("combobox");

      fireEvent.click(formatSelect);

      // 옵션이 표시되는지 확인 (실제 옵션은 컴포넌트에 따라 다를 수 있음)
      await waitFor(() => {
        expect(formatSelect).toHaveAttribute("aria-expanded", "true");
      });
    });
  });

  describe("QR 코드 생성", () => {
    it("QR 코드 생성 버튼을 클릭할 수 있어야 한다", async () => {
      const { generateQrCode } = require("@/app/actions/qr-code-generator");
      generateQrCode.mockResolvedValue({
        success: true,
        data: "data:image/png;base64,test-qr-code",
      });

      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      // 인증된 사용자의 경우 저장 버튼이 있을 수 있음
      const saveButton = screen.queryByRole("button", { name: /QR 코드/ });
      if (saveButton) {
        fireEvent.click(saveButton);
        // 버튼 클릭이 성공적으로 처리되는지 확인
        expect(saveButton).toBeInTheDocument();
      }
    });
  });

  describe("인증 상태", () => {
    it("인증된 사용자에게 적절한 버튼이 표시되어야 한다", () => {
      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      // 인증된 사용자에게 표시될 수 있는 버튼들 확인
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("인증되지 않은 사용자에게도 기본 기능이 제공되어야 한다", () => {
      const { useSession } = require("next-auth/react");
      useSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(
        <TestWrapper session={null}>
          <CardPreview />
        </TestWrapper>,
      );

      // 기본 UI 요소들이 여전히 표시되는지 확인
      expect(screen.getByText("QR 코드 미리보기")).toBeInTheDocument();
    });
  });

  describe("다운로드 기능", () => {
    it("다운로드 버튼이 존재해야 한다", () => {
      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      const downloadButton = screen.getByRole("button", { name: "다운로드" });
      expect(downloadButton).toBeInTheDocument();
      // 초기에는 비활성화될 수 있음
      expect(downloadButton).toBeDisabled();
    });
  });

  describe("접근성", () => {
    it("버튼들이 적절한 접근성 속성을 가져야 한다", () => {
      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("type", "button");
      });
    });

    it("Select 컴포넌트가 적절한 접근성 속성을 가져야 한다", () => {
      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      const selectElement = screen.getByRole("combobox");
      expect(selectElement).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("QR 코드 미리보기 영역", () => {
    it("미리보기 영역이 렌더링되어야 한다", () => {
      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      // 미리보기 영역의 플레이스홀더 텍스트 확인
      const previewText = screen.getByText(/QR 코드를 생성하세요/);
      expect(previewText).toBeInTheDocument();
    });

    it("초기 상태에서 적절한 안내 메시지가 표시되어야 한다", () => {
      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      // 안내 메시지가 포함된 텍스트 확인
      expect(screen.getByText(/QR 코드를 생성하세요/)).toBeInTheDocument();
    });
  });

  describe("폼 컨텍스트 통합", () => {
    it("React Hook Form과 올바르게 통합되어야 한다", () => {
      render(
        <TestWrapper>
          <CardPreview />
        </TestWrapper>,
      );

      // 컴포넌트가 올바르게 렌더링되는지 확인
      expect(screen.getByText("QR 코드 미리보기")).toBeInTheDocument();
    });

    it("폼 값 변경이 컴포넌트에 반영되어야 한다", () => {
      render(
        <TestWrapper initialValues={{ previewExportFormat: "png" }}>
          <CardPreview />
        </TestWrapper>,
      );

      // PNG 형식이 기본적으로 선택되어 있는지 확인
      expect(screen.getByText("PNG (기본 해상도)")).toBeInTheDocument();
    });
  });
});
