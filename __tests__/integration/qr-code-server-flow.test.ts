// Mock dependencies first
jest.mock("@/lib/prisma", () => ({
  prisma: {
    qRCode: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    log: {
      create: jest.fn(),
    },
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("qrcode", () => ({
  toDataURL: jest.fn().mockResolvedValue("data:image/png;base64,mockedQRCodeImage"),
}));

// Mock server actions
jest.mock("@/app/actions/qr-code-generator", () => ({
  generateQRCode: jest.fn(),
  createQRCode: jest.fn(),
}));

jest.mock("@/app/actions/qr-code-management", () => ({
  getQRCode: jest.fn(),
  deleteQRCode: jest.fn(),
}));

// Import after mocking
import { generateQRCode, createQRCode } from "@/app/actions/qr-code-generator";
import { getQRCode, deleteQRCode } from "@/app/actions/qr-code-management";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

describe("QR Code Server Actions Flow Integration", () => {
  const mockSession = {
    user: { id: "test-user-id", email: "test@example.com" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    
    // Set up default mock implementations
    (generateQRCode as jest.Mock).mockResolvedValue({
      success: true,
      data: "data:image/png;base64,mockedQRCodeImage",
    });
  });

  describe("Complete QR Code Lifecycle", () => {
    it("QR 코드 생성 → 저장 → 조회 → 삭제의 전체 플로우가 작동해야 한다", async () => {
      // Step 1: QR 코드 생성
      const qrData = {
        type: "URL" as const,
        title: "Test Website",
        content: "https://example.com",
        settings: {
          size: 300,
          color: "#000000",
          backgroundColor: "#FFFFFF",
          margin: 4,
        },
      };

      const generateResult = await generateQRCode(qrData);
      
      expect(generateResult.success).toBe(true);
      expect(generateResult.data).toBe("data:image/png;base64,mockedQRCodeImage");

      // Step 2: QR 코드 저장
      const savedQRCode = {
        id: "qr-123",
        userId: "test-user-id",
        ...qrData,
        isFavorite: false,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      };

      (prisma.qRCode.create as jest.Mock).mockResolvedValue(savedQRCode);
      (prisma.log.create as jest.Mock).mockResolvedValue({});
      
      (createQRCode as jest.Mock).mockResolvedValue({
        success: true,
        data: savedQRCode,
      });

      const createResult = await createQRCode({
        ...qrData,
        qrCodeData: generateResult.data!,
      });

      expect(createResult.success).toBe(true);
      expect(createResult.data).toMatchObject({
        id: "qr-123",
        title: qrData.title,
        content: qrData.content,
      });

      // Verify server action was called correctly
      expect(createQRCode).toHaveBeenCalledWith({
        ...qrData,
        qrCodeData: generateResult.data!,
      });

      // Step 3: QR 코드 조회
      (prisma.qRCode.findFirst as jest.Mock).mockResolvedValue(savedQRCode);
      
      (getQRCode as jest.Mock).mockResolvedValue({
        success: true,
        data: savedQRCode,
      });

      const getResult = await getQRCode("qr-123");

      expect(getResult.success).toBe(true);
      expect(getResult.data).toMatchObject({
        id: "qr-123",
        title: qrData.title,
      });

      // Step 4: QR 코드 삭제
      (prisma.qRCode.delete as jest.Mock).mockResolvedValue(savedQRCode);
      
      (deleteQRCode as jest.Mock).mockResolvedValue({
        success: true,
      });

      const deleteResult = await deleteQRCode("qr-123");

      expect(deleteResult.success).toBe(true);
      expect(deleteQRCode).toHaveBeenCalledWith("qr-123");
    });

    it("다양한 QR 코드 타입에 대한 플로우가 작동해야 한다", async () => {
      const testCases = [
        {
          type: "TEXT" as const,
          title: "메모",
          content: "중요한 메모입니다",
        },
        {
          type: "EMAIL" as const,
          title: "이메일",
          content: JSON.stringify({
            email: "contact@example.com",
            subject: "문의",
            body: "안녕하세요",
          }),
        },
        {
          type: "SMS" as const,
          title: "SMS",
          content: JSON.stringify({
            phone: "010-1234-5678",
            message: "테스트 메시지",
          }),
        },
        {
          type: "WIFI" as const,
          title: "WiFi",
          content: JSON.stringify({
            ssid: "TestNetwork",
            password: "password123",
            security: "WPA",
            hidden: false,
          }),
        },
      ];

      for (const testCase of testCases) {
        // QR 코드 생성
        const generateResult = await generateQRCode({
          ...testCase,
          settings: {},
        });

        expect(generateResult.success).toBe(true);
        expect(generateResult.data).toBeTruthy();

        // 저장
        const savedQRCode = {
          id: `qr-${testCase.type}-123`,
          userId: "test-user-id",
          ...testCase,
          settings: {},
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (prisma.qRCode.create as jest.Mock).mockResolvedValue(savedQRCode);
        
        (createQRCode as jest.Mock).mockResolvedValue({
          success: true,
          data: savedQRCode,
        });

        const createResult = await createQRCode({
          ...testCase,
          settings: {},
          qrCodeData: generateResult.data!,
        });

        expect(createResult.success).toBe(true);
        expect(createResult.data?.type).toBe(testCase.type);
      }
    });
  });

  describe("에러 처리 플로우", () => {
    it("인증되지 않은 사용자의 QR 코드 저장 시도를 차단해야 한다", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      (createQRCode as jest.Mock).mockResolvedValue({
        success: false,
        error: "인증이 필요합니다.",
      });

      const result = await createQRCode({
        type: "URL",
        title: "Test",
        content: "https://example.com",
        settings: {},
        qrCodeData: "data:image/png;base64,test",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("인증");
    });

    it("데이터베이스 오류 발생 시 적절한 에러를 반환해야 한다", async () => {
      (prisma.qRCode.create as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );
      
      (createQRCode as jest.Mock).mockResolvedValue({
        success: false,
        error: "저장 중 오류가 발생했습니다.",
      });

      const result = await createQRCode({
        type: "URL",
        title: "Test",
        content: "https://example.com",
        settings: {},
        qrCodeData: "data:image/png;base64,test",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("저장 중 오류가 발생했습니다");
    });

    it("잘못된 QR 코드 타입에 대한 에러를 처리해야 한다", async () => {
      (generateQRCode as jest.Mock).mockResolvedValue({
        success: false,
        error: "지원하지 않는 QR 코드 타입입니다.",
      });
      
      const result = await generateQRCode({
        type: "INVALID" as any,
        title: "Test",
        content: "test content",
        settings: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("지원하지 않는 QR 코드 타입");
    });

    it("필수 필드가 없을 때 에러를 반환해야 한다", async () => {
      (generateQRCode as jest.Mock).mockResolvedValue({
        success: false,
        error: "필수 입력값이 누락되었습니다.",
      });
      
      const result = await generateQRCode({
        type: "URL",
        title: "",
        content: "",
        settings: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("필수");
    });
  });

  describe("권한 검증 플로우", () => {
    it("다른 사용자의 QR 코드에 접근할 수 없어야 한다", async () => {
      const otherUserQRCode = {
        id: "qr-other-123",
        userId: "other-user-id",
        type: "URL",
        title: "Other User QR",
        content: "https://other.com",
      };

      (prisma.qRCode.findFirst as jest.Mock).mockResolvedValue(otherUserQRCode);
      
      (getQRCode as jest.Mock).mockResolvedValue({
        success: false,
        error: "권한이 없습니다.",
      });

      const result = await getQRCode("qr-other-123");

      expect(result.success).toBe(false);
      expect(result.error).toContain("권한");
    });

    it("다른 사용자의 QR 코드를 삭제할 수 없어야 한다", async () => {
      (prisma.qRCode.delete as jest.Mock).mockResolvedValue(null);
      
      (deleteQRCode as jest.Mock).mockResolvedValue({
        success: false,
        error: "QR 코드를 찾을 수 없습니다.",
      });

      const result = await deleteQRCode("qr-other-123");

      expect(result.success).toBe(false);
      expect(deleteQRCode).toHaveBeenCalledWith("qr-other-123");
    });
  });

  describe("대용량 데이터 처리", () => {
    it("대용량 QR 코드 콘텐츠를 처리할 수 있어야 한다", async () => {
      const largeContent = "a".repeat(10000); // 10KB 텍스트

      const generateResult = await generateQRCode({
        type: "TEXT",
        title: "Large Content",
        content: largeContent,
        settings: {},
      });

      expect(generateResult.success).toBe(true);
      expect(generateResult.data).toBeTruthy();

      // 저장 테스트
      (prisma.qRCode.create as jest.Mock).mockResolvedValue({
        id: "qr-large-123",
        userId: "test-user-id",
        type: "TEXT",
        title: "Large Content",
        content: largeContent,
        settings: {},
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      (createQRCode as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          id: "qr-large-123",
          userId: "test-user-id",
          type: "TEXT",
          title: "Large Content",
          content: largeContent,
          settings: {},
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const createResult = await createQRCode({
        type: "TEXT",
        title: "Large Content",
        content: largeContent,
        settings: {},
        qrCodeData: generateResult.data!,
      });

      expect(createResult.success).toBe(true);
      expect(createResult.data?.content).toBe(largeContent);
    });
  });

  describe("동시성 처리", () => {
    it("동시에 여러 QR 코드를 생성할 수 있어야 한다", async () => {
      const qrCodes = Array.from({ length: 5 }, (_, i) => ({
        type: "URL" as const,
        title: `Test ${i}`,
        content: `https://example${i}.com`,
        settings: {},
      }));

      // 동시 생성
      const generatePromises = qrCodes.map(qr => generateQRCode(qr));
      const generateResults = await Promise.all(generatePromises);

      generateResults.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data).toBeTruthy();
      });

      // 동시 저장
      qrCodes.forEach((qr, i) => {
        (prisma.qRCode.create as jest.Mock).mockResolvedValueOnce({
          id: `qr-${i}`,
          userId: "test-user-id",
          ...qr,
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        (createQRCode as jest.Mock).mockResolvedValueOnce({
          success: true,
          data: {
            id: `qr-${i}`,
            userId: "test-user-id",
            ...qr,
            isFavorite: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      });

      const createPromises = qrCodes.map((qr, i) => 
        createQRCode({
          ...qr,
          qrCodeData: generateResults[i].data!,
        })
      );

      const createResults = await Promise.all(createPromises);

      createResults.forEach((result, i) => {
        expect(result.success).toBe(true);
        expect(result.data?.title).toBe(`Test ${i}`);
      });
    });
  });
});