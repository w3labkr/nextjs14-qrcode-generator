import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { QRCodeForm } from "@/app/qrcode/components/qrcode-form";
import { generateQRCode, createQRCode } from "@/app/actions/qr-code-generator";
import { getQRCode } from "@/app/actions/qr-code-management";
import { prisma } from "@/lib/prisma";

// Mock dependencies
jest.mock("next/navigation");
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() =>
    Promise.resolve({
      user: { id: "test-user-id", email: "test@example.com" },
    })
  ),
}));
jest.mock("@/app/actions/qr-code-generator");
jest.mock("@/app/actions/qr-code-management");
jest.mock("@/lib/prisma", () => ({
  prisma: {
    qRCode: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    log: {
      create: jest.fn(),
    },
  },
}));

const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
};

describe("QR Code Generation → Save → Dashboard Flow Integration", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Complete QR Code Creation Flow", () => {
    it("사용자가 QR 코드를 생성하고 저장한 후 대시보드에서 확인할 수 있어야 한다", async () => {
      // Step 1: QR 코드 생성 데이터 준비
      const qrCodeData = {
        type: "URL",
        title: "My Website",
        content: "https://example.com",
        settings: {
          size: 300,
          color: "#000000",
          backgroundColor: "#FFFFFF",
          margin: 4,
        },
      };

      // Mock QR 코드 생성 응답
      (generateQRCode as jest.Mock).mockResolvedValue({
        success: true,
        data: "data:image/png;base64,mockedQRCodeImage",
      });

      // Mock QR 코드 저장 응답
      const savedQRCode = {
        id: "qr-123",
        userId: "test-user-id",
        ...qrCodeData,
        isFavorite: false,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      };

      (createQRCode as jest.Mock).mockResolvedValue({
        success: true,
        data: savedQRCode,
      });

      // Mock 대시보드 데이터 조회
      (prisma.qRCode.findMany as jest.Mock).mockResolvedValue([savedQRCode]);

      // Step 2: QR 코드 폼 렌더링
      render(<QRCodeForm initialType="URL" />);

      // Step 3: 폼 입력
      const titleInput = screen.getByLabelText("제목");
      const contentInput = screen.getByLabelText("URL");
      
      await user.type(titleInput, qrCodeData.title);
      await user.type(contentInput, qrCodeData.content);

      // Step 4: QR 코드 생성 버튼 클릭
      const generateButton = screen.getByRole("button", { name: /생성/i });
      await user.click(generateButton);

      // Step 5: QR 코드 생성 확인
      await waitFor(() => {
        expect(generateQRCode).toHaveBeenCalledWith(expect.objectContaining({
          type: "URL",
          title: qrCodeData.title,
          content: qrCodeData.content,
        }));
      });

      // Step 6: QR 코드 저장 버튼 클릭 (생성 후 나타남)
      await waitFor(() => {
        const saveButton = screen.getByRole("button", { name: /저장/i });
        expect(saveButton).toBeInTheDocument();
      });

      const saveButton = screen.getByRole("button", { name: /저장/i });
      await user.click(saveButton);

      // Step 7: 저장 확인
      await waitFor(() => {
        expect(createQRCode).toHaveBeenCalledWith(expect.objectContaining({
          type: "URL",
          title: qrCodeData.title,
          content: qrCodeData.content,
        }));
      });

      // Step 8: 대시보드로 리다이렉트 확인
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/history");
      });

      // Step 9: 대시보드에서 저장된 QR 코드 조회 시뮬레이션
      const dashboardQRCodes = await prisma.qRCode.findMany({
        where: { userId: "test-user-id" },
        orderBy: { createdAt: "desc" },
      });

      expect(dashboardQRCodes).toHaveLength(1);
      expect(dashboardQRCodes[0]).toMatchObject({
        id: "qr-123",
        title: qrCodeData.title,
        content: qrCodeData.content,
        type: qrCodeData.type,
      });
    });

    it("QR 코드 생성 중 오류가 발생하면 적절한 에러 메시지를 표시해야 한다", async () => {
      // Mock 에러 응답
      (generateQRCode as jest.Mock).mockResolvedValue({
        success: false,
        error: "QR 코드 생성에 실패했습니다.",
      });

      render(<QRCodeForm initialType="URL" />);

      // 폼 입력
      const titleInput = screen.getByLabelText("제목");
      const contentInput = screen.getByLabelText("URL");
      
      await user.type(titleInput, "Test Title");
      await user.type(contentInput, "https://example.com");

      // 생성 버튼 클릭
      const generateButton = screen.getByRole("button", { name: /생성/i });
      await user.click(generateButton);

      // 에러 메시지 확인
      await waitFor(() => {
        expect(screen.getByText("QR 코드 생성에 실패했습니다.")).toBeInTheDocument();
      });

      // 저장 버튼이 나타나지 않아야 함
      expect(screen.queryByRole("button", { name: /저장/i })).not.toBeInTheDocument();
    });

    it("저장 중 오류가 발생하면 적절한 에러 메시지를 표시해야 한다", async () => {
      // QR 코드 생성은 성공
      (generateQRCode as jest.Mock).mockResolvedValue({
        success: true,
        data: "data:image/png;base64,mockedQRCodeImage",
      });

      // 저장은 실패
      (createQRCode as jest.Mock).mockResolvedValue({
        success: false,
        error: "데이터베이스 저장에 실패했습니다.",
      });

      render(<QRCodeForm initialType="URL" />);

      // 폼 입력 및 생성
      const titleInput = screen.getByLabelText("제목");
      const contentInput = screen.getByLabelText("URL");
      
      await user.type(titleInput, "Test Title");
      await user.type(contentInput, "https://example.com");

      const generateButton = screen.getByRole("button", { name: /생성/i });
      await user.click(generateButton);

      // 저장 버튼 대기 및 클릭
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /저장/i })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole("button", { name: /저장/i });
      await user.click(saveButton);

      // 에러 메시지 확인
      await waitFor(() => {
        expect(screen.getByText("데이터베이스 저장에 실패했습니다.")).toBeInTheDocument();
      });

      // 대시보드로 리다이렉트되지 않아야 함
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe("다양한 QR 코드 타입 통합 테스트", () => {
    const testCases = [
      {
        type: "URL",
        title: "회사 홈페이지",
        content: "https://company.com",
        labelName: "URL",
      },
      {
        type: "TEXT",
        title: "중요 메모",
        content: "이것은 중요한 메모입니다.",
        labelName: "텍스트",
      },
      {
        type: "EMAIL",
        title: "고객 지원 이메일",
        content: JSON.stringify({
          email: "support@company.com",
          subject: "문의사항",
          body: "안녕하세요, 문의드립니다.",
        }),
        labelName: "이메일 주소",
      },
      {
        type: "SMS",
        title: "긴급 연락처",
        content: JSON.stringify({
          phone: "010-1234-5678",
          message: "긴급 상황입니다.",
        }),
        labelName: "전화번호",
      },
    ];

    testCases.forEach(({ type, title, content, labelName }) => {
      it(`${type} 타입 QR 코드의 전체 플로우가 정상 작동해야 한다`, async () => {
        // Mock 설정
        (generateQRCode as jest.Mock).mockResolvedValue({
          success: true,
          data: `data:image/png;base64,mocked${type}QRCode`,
        });

        const savedQRCode = {
          id: `qr-${type}-123`,
          userId: "test-user-id",
          type,
          title,
          content: type === "URL" || type === "TEXT" ? content : JSON.parse(content),
          settings: {},
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (createQRCode as jest.Mock).mockResolvedValue({
          success: true,
          data: savedQRCode,
        });

        // 렌더링
        render(<QRCodeForm initialType={type as any} />);

        // 타입별 입력 처리
        const titleInput = screen.getByLabelText("제목");
        await user.type(titleInput, title);

        if (type === "URL" || type === "TEXT") {
          const contentInput = screen.getByLabelText(labelName);
          await user.type(contentInput, content);
        } else if (type === "EMAIL") {
          const emailData = JSON.parse(content);
          await user.type(screen.getByLabelText("이메일 주소"), emailData.email);
          await user.type(screen.getByLabelText("제목"), emailData.subject);
          await user.type(screen.getByLabelText("본문"), emailData.body);
        } else if (type === "SMS") {
          const smsData = JSON.parse(content);
          await user.type(screen.getByLabelText("전화번호"), smsData.phone);
          await user.type(screen.getByLabelText("메시지"), smsData.message);
        }

        // 생성 및 저장
        const generateButton = screen.getByRole("button", { name: /생성/i });
        await user.click(generateButton);

        await waitFor(() => {
          expect(generateQRCode).toHaveBeenCalled();
        });

        await waitFor(() => {
          const saveButton = screen.getByRole("button", { name: /저장/i });
          expect(saveButton).toBeInTheDocument();
        });

        const saveButton = screen.getByRole("button", { name: /저장/i });
        await user.click(saveButton);

        // 저장 확인
        await waitFor(() => {
          expect(createQRCode).toHaveBeenCalled();
          expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/history");
        });
      });
    });
  });

  describe("인증되지 않은 사용자 플로우", () => {
    beforeEach(() => {
      // 인증되지 않은 상태 모킹
      const { getServerSession } = require("next-auth");
      (getServerSession as jest.Mock).mockResolvedValue(null);
    });

    it("인증되지 않은 사용자도 QR 코드를 생성할 수 있어야 한다", async () => {
      (generateQRCode as jest.Mock).mockResolvedValue({
        success: true,
        data: "data:image/png;base64,mockedQRCodeImage",
      });

      render(<QRCodeForm initialType="URL" />);

      // 폼 입력
      const titleInput = screen.getByLabelText("제목");
      const contentInput = screen.getByLabelText("URL");
      
      await user.type(titleInput, "Public QR");
      await user.type(contentInput, "https://public.com");

      // 생성
      const generateButton = screen.getByRole("button", { name: /생성/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(generateQRCode).toHaveBeenCalled();
      });

      // 저장 버튼은 나타나지 않아야 함 (인증되지 않은 사용자)
      await waitFor(() => {
        expect(screen.queryByRole("button", { name: /저장/i })).not.toBeInTheDocument();
      });
    });
  });
});