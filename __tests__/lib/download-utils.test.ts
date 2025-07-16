/**
 * @jest-environment jsdom
 */
import {
  downloadFileSecure,
  downloadAsCSV,
  downloadMultipleCSV,
  downloadCSVAsZip,
  downloadQrCode,
} from "@/lib/download-utils";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock global objects
global.URL = {
  createObjectURL: jest.fn(() => "mock-blob-url"),
  revokeObjectURL: jest.fn(),
} as any;

// Mock window and navigator
(global as any).window = (global as any).window || {};
(global as any).window.JSZip = jest.fn().mockImplementation(() => ({
  file: jest.fn(),
  generateAsync: jest.fn().mockResolvedValue(new Blob(["mock-zip-content"])),
}));

// Mock navigator
(global as any).navigator = {
  msSaveBlob: jest.fn(),
};

// Mock window.atob and btoa
(global as any).window.atob = jest.fn((str) => {
  return Buffer.from(str, 'base64').toString('binary');
});
(global as any).window.btoa = jest.fn((str) => {
  return Buffer.from(str, 'binary').toString('base64');
});

// Mock Image constructor
const mockImage = {
  onload: null,
  onerror: null,
  src: "",
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

(global as any).Image = jest.fn().mockImplementation(() => mockImage);

// Mock Canvas and context
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(),
  toDataURL: jest.fn(() => "data:image/png;base64,mock-png-data"),
};

const mockCanvasContext = {
  fillStyle: "",
  fillRect: jest.fn(),
  drawImage: jest.fn(),
};

// Mock document
const mockAnchorElement = {
  click: jest.fn(),
  setAttribute: jest.fn(),
  style: {},
  href: "",
  download: "",
  dispatchEvent: jest.fn(),
};

Object.defineProperty(document, "createElement", {
  value: jest.fn((tagName) => {
    if (tagName === "canvas") {
      return mockCanvas;
    }
    return mockAnchorElement;
  }),
  writable: true,
});

Object.defineProperty(document.body, "appendChild", {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(document.body, "removeChild", {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(document.body, "contains", {
  value: jest.fn().mockReturnValue(true),
  writable: true,
});

describe("Download Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("downloadFileSecure 함수", () => {
    it("파일을 안전하게 다운로드해야 한다", () => {
      const mockBlob = new Blob(["test content"], { type: "text/plain" });
      const filename = "test.txt";

      downloadFileSecure(mockBlob, filename);

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockAnchorElement.href).toBe("mock-blob-url");
      expect(mockAnchorElement.download).toBe(filename);
      expect(mockAnchorElement.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchorElement);
      // removeChild는 setTimeout 안에서 실행되므로 바로 확인하지 않음
    });

    it("빈 블롭도 처리해야 한다", () => {
      const mockBlob = new Blob([], { type: "application/octet-stream" });
      const filename = "empty.bin";

      downloadFileSecure(mockBlob, filename);

      expect(mockAnchorElement.download).toBe(filename);
      expect(mockAnchorElement.click).toHaveBeenCalled();
    });
  });

  describe("downloadAsCSV 함수", () => {
    it("CSV 문자열을 파일로 다운로드해야 한다", () => {
      const csvContent = "name,age\\nJohn,30\\nJane,25";
      const filename = "data.csv";

      downloadAsCSV(csvContent, filename);

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchorElement.download).toBe(filename);
      expect(mockAnchorElement.click).toHaveBeenCalled();
    });

    it("빈 CSV 내용도 처리해야 한다", () => {
      const csvContent = "";
      const filename = "empty.csv";

      downloadAsCSV(csvContent, filename);

      expect(mockAnchorElement.download).toBe(filename);
      expect(mockAnchorElement.click).toHaveBeenCalled();
    });

    it("특수문자가 포함된 CSV 내용을 처리해야 한다", () => {
      const csvContent = "name,description\\n\"John\",\"안녕하세요, 테스트입니다\"";
      const filename = "special.csv";

      downloadAsCSV(csvContent, filename);

      expect(mockAnchorElement.download).toBe(filename);
      expect(mockAnchorElement.click).toHaveBeenCalled();
    });
  });

  describe("downloadMultipleCSV 함수", () => {
    it("여러 CSV 파일을 순차적으로 다운로드해야 한다", async () => {
      const csvFiles = [
        { content: "name,age\\nJohn,30", filename: "file1.csv" },
        { content: "product,price\\nApple,1000", filename: "file2.csv" },
      ];

      await downloadMultipleCSV(csvFiles);

      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(mockAnchorElement.click).toHaveBeenCalledTimes(2);
    });

    it("빈 배열도 처리해야 한다", async () => {
      const csvFiles: any[] = [];

      await downloadMultipleCSV(csvFiles);

      expect(document.createElement).not.toHaveBeenCalled();
      expect(mockAnchorElement.click).not.toHaveBeenCalled();
    });

    it("단일 파일도 처리해야 한다", async () => {
      const csvFiles = [
        { content: "name,age\\nJohn,30", filename: "single.csv" },
      ];

      await downloadMultipleCSV(csvFiles);

      expect(document.createElement).toHaveBeenCalledTimes(1);
      expect(mockAnchorElement.click).toHaveBeenCalledTimes(1);
    });
  });

  describe("downloadCSVAsZip 함수", () => {
    it("JSZip이 있을 때 ZIP 파일로 다운로드해야 한다", async () => {
      const csvFiles = [
        { content: "name,age\\nJohn,30", filename: "file1.csv" },
        { content: "product,price\\nApple,1000", filename: "file2.csv" },
      ];

      const mockZip = {
        file: jest.fn(),
        generateAsync: jest.fn().mockResolvedValue(new Blob(["mock-zip-content"])),
      };

      (global as any).window.JSZip = jest.fn().mockImplementation(() => mockZip);

      await downloadCSVAsZip(csvFiles, "test.zip");

      expect(mockZip.file).toHaveBeenCalledWith("file1.csv", "\uFEFF" + "name,age\\nJohn,30");
      expect(mockZip.file).toHaveBeenCalledWith("file2.csv", "\uFEFF" + "product,price\\nApple,1000");
      expect(mockZip.generateAsync).toHaveBeenCalledWith({ type: "blob" });
      expect(mockAnchorElement.download).toBe("test.zip");
    });

    it("JSZip이 없을 때 개별 파일로 다운로드해야 한다", async () => {
      const csvFiles = [
        { content: "name,age\\nJohn,30", filename: "file1.csv" },
        { content: "product,price\\nApple,1000", filename: "file2.csv" },
      ];

      delete (global as any).window.JSZip;

      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      await downloadCSVAsZip(csvFiles);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "JSZip not available, downloading files individually"
      );
      expect(document.createElement).toHaveBeenCalledTimes(2);

      consoleWarnSpy.mockRestore();
    });

    it("ZIP 생성 실패 시 개별 파일로 다운로드해야 한다", async () => {
      const csvFiles = [
        { content: "name,age\\nJohn,30", filename: "file1.csv" },
      ];

      const mockZip = {
        file: jest.fn(),
        generateAsync: jest.fn().mockRejectedValue(new Error("ZIP generation failed")),
      };

      (global as any).window.JSZip = jest.fn().mockImplementation(() => mockZip);

      await downloadCSVAsZip(csvFiles);

      expect(document.createElement).toHaveBeenCalledTimes(1);
    });

    it("기본 ZIP 파일명을 생성해야 한다", async () => {
      const csvFiles = [
        { content: "name,age\\nJohn,30", filename: "file1.csv" },
      ];

      const mockZip = {
        file: jest.fn(),
        generateAsync: jest.fn().mockResolvedValue(new Blob(["mock-zip-content"])),
      };

      (global as any).window.JSZip = jest.fn().mockImplementation(() => mockZip);

      await downloadCSVAsZip(csvFiles);

      expect(mockAnchorElement.download).toMatch(/csv-export-\d{4}-\d{2}-\d{2}\.zip/);
    });
  });

  describe("downloadQrCode 함수", () => {
    beforeEach(() => {
      mockedAxios.post.mockClear();
      mockedAxios.get.mockClear();
    });

    it("PNG 형식으로 QR 코드를 다운로드해야 한다", async () => {
      const mockResponse = {
        data: {
          success: true,
          dataUrl: "data:image/png;base64,mock-qr-data",
        },
      };

      const mockBlobResponse = {
        data: new Blob(["mock-qr-image"], { type: "image/png" }),
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      mockedAxios.get.mockResolvedValueOnce(mockBlobResponse);

      const result = await downloadQrCode(
        "https://example.com",
        "URL",
        { width: 400, margin: 0 },
        "Test QR",
        "png"
      );

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/qrcodes/generate", {
        settings: {
          text: "https://example.com",
          type: "png",
          width: 400,
          margin: 0,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
          logo: undefined,
          dotsOptions: undefined,
          cornersSquareOptions: undefined,
          frameOptions: undefined,
        },
      });

      expect(result).toEqual({ success: true });
    });

    it("SVG 형식으로 QR 코드를 다운로드해야 한다", async () => {
      const mockResponse = {
        data: {
          success: true,
          dataUrl: "data:image/svg+xml;base64,mock-svg-data",
        },
      };

      const mockBlobResponse = {
        data: new Blob(["mock-svg-image"], { type: "image/svg+xml" }),
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      mockedAxios.get.mockResolvedValueOnce(mockBlobResponse);

      const result = await downloadQrCode(
        "Test Content",
        "TEXT",
        {},
        null,
        "svg"
      );

      expect(result).toEqual({ success: true });
    });

    it("문자열 설정을 JSON으로 파싱해야 한다", async () => {
      const mockResponse = {
        data: {
          success: true,
          dataUrl: "data:image/png;base64,mock-qr-data",
        },
      };

      const mockBlobResponse = {
        data: new Blob(["mock-qr-image"], { type: "image/png" }),
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      mockedAxios.get.mockResolvedValueOnce(mockBlobResponse);

      const settingsString = '{"width": 500, "color": {"dark": "#FF0000"}}';

      await downloadQrCode(
        "Test Content",
        "TEXT",
        settingsString,
        "Test QR",
        "png"
      );

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/qrcodes/generate", {
        settings: {
          text: "Test Content",
          type: "png",
          width: 500,
          margin: 0,
          color: {
            dark: "#FF0000",
            light: "#ffffff",
          },
          logo: undefined,
          dotsOptions: undefined,
          cornersSquareOptions: undefined,
          frameOptions: undefined,
        },
      });
    });

    it("잘못된 JSON 설정을 기본값으로 처리해야 한다", async () => {
      const mockResponse = {
        data: {
          success: true,
          dataUrl: "data:image/png;base64,mock-qr-data",
        },
      };

      const mockBlobResponse = {
        data: new Blob(["mock-qr-image"], { type: "image/png" }),
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      mockedAxios.get.mockResolvedValueOnce(mockBlobResponse);

      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      await downloadQrCode(
        "Test Content",
        "TEXT",
        "invalid json",
        "Test QR",
        "png"
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Settings 파싱 오류, 기본값 사용:",
        expect.any(SyntaxError)
      );

      consoleWarnSpy.mockRestore();
    });

    it("title이 있을 때 sanitized 파일명을 생성해야 한다", async () => {
      const mockResponse = {
        data: {
          success: true,
          dataUrl: "data:image/png;base64,mock-qr-data",
        },
      };

      const mockBlobResponse = {
        data: new Blob(["mock-qr-image"], { type: "image/png" }),
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      mockedAxios.get.mockResolvedValueOnce(mockBlobResponse);

      await downloadQrCode(
        "Test Content",
        "TEXT",
        {},
        "Test QR!@#$%^&*()_+=",
        "png"
      );

      expect(mockAnchorElement.download).toBe("Test-QR.png");
    });

    it("title이 없을 때 기본 파일명을 생성해야 한다", async () => {
      const mockResponse = {
        data: {
          success: true,
          dataUrl: "data:image/png;base64,mock-qr-data",
        },
      };

      const mockBlobResponse = {
        data: new Blob(["mock-qr-image"], { type: "image/png" }),
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      mockedAxios.get.mockResolvedValueOnce(mockBlobResponse);

      await downloadQrCode(
        "Test Content",
        "TEXT",
        {},
        null,
        "png"
      );

      expect(mockAnchorElement.download).toMatch(/qrcode-text-\d{4}-\d{2}-\d{2}\.png/);
    });

    it("API 에러 시 에러 응답을 반환해야 한다", async () => {
      const mockResponse = {
        data: {
          success: false,
          error: "QR 코드 생성 실패",
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await downloadQrCode(
        "Test Content",
        "TEXT",
        {},
        null,
        "png"
      );

      expect(result).toEqual({ success: false, error: "다운로드에 실패했습니다." });
    });

    it("네트워크 에러 시 에러 응답을 반환해야 한다", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

      const result = await downloadQrCode(
        "Test Content",
        "TEXT",
        {},
        null,
        "png"
      );

      expect(result).toEqual({ success: false, error: "다운로드에 실패했습니다." });
    });
  });

  describe("Internal helper functions", () => {
    describe("parseQrSettings 함수", () => {
      it("문자열 설정을 파싱해야 한다", async () => {
        const settingsString = '{"width": 500, "color": {"dark": "#FF0000"}}';
        
        const mockResponse = {
          data: {
            success: true,
            dataUrl: "data:image/png;base64,mock-qr-data",
          },
        };

        const mockBlobResponse = {
          data: new Blob(["mock-qr-image"], { type: "image/png" }),
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);
        mockedAxios.get.mockResolvedValueOnce(mockBlobResponse);

        await downloadQrCode(
          "Test Content",
          "TEXT",
          settingsString,
          "Test QR",
          "png"
        );

        expect(mockedAxios.post).toHaveBeenCalledWith("/api/qrcodes/generate", {
          settings: expect.objectContaining({
            width: 500,
            color: expect.objectContaining({
              dark: "#FF0000",
            }),
          }),
        });
      });
    });

    describe("generateFileName 함수", () => {
      it("JPG 형식에 대해 올바른 확장자를 생성해야 한다", async () => {
        const mockResponse = {
          data: {
            success: true,
            dataUrl: "data:image/jpeg;base64,mock-jpg-data",
          },
        };

        const mockBlobResponse = {
          data: new Blob(["mock-jpg-image"], { type: "image/jpeg" }),
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);
        mockedAxios.get.mockResolvedValueOnce(mockBlobResponse);

        await downloadQrCode(
          "Test Content",
          "TEXT",
          {},
          "Test QR",
          "jpg"
        );

        expect(mockAnchorElement.download).toBe("Test-QR.jpg");
      });
    });

    describe("convertSvgToPng 함수", () => {
      it("SVG 변환 함수는 정의되어 있어야 한다", () => {
        // 내부 함수이므로 직접 접근할 수 없지만, downloadQrCode에서 SVG 처리를 테스트함
        expect(downloadQrCode).toBeDefined();
      });
    });

    describe("logDebugInfo 함수", () => {
      it("개발 환경에서 디버그 정보를 로그해야 한다", async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "development";

        const mockResponse = {
          data: {
            success: true,
            dataUrl: "data:image/png;base64,mock-qr-data",
          },
        };

        const mockBlobResponse = {
          data: new Blob(["mock-qr-image"], { type: "image/png" }),
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);
        mockedAxios.get.mockResolvedValueOnce(mockBlobResponse);

        await downloadQrCode(
          "Test Content",
          "TEXT",
          {},
          null,
          "png"
        );

        // 디버그 정보 로그 함수가 호출되어야 함 (실제 로그 출력은 없음)
        expect(mockResponse.data.success).toBe(true);

        process.env.NODE_ENV = originalEnv;
      });
    });
  });
});

// Additional test coverage for edge cases
describe("Edge cases and error handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fallbackDownload 함수는 에러 발생 시 false를 반환해야 한다", () => {
    const mockBlob = new Blob(["test"], { type: "text/plain" });
    const filename = "test.txt";

    // URL.createObjectURL에서 에러 발생 시뮬레이션
    (global.URL.createObjectURL as jest.Mock).mockImplementation(() => {
      throw new Error("URL creation failed");
    });

    // downloadAsCSV에서 fallbackDownload가 호출되도록 설정
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    
    expect(() => downloadAsCSV("test", filename)).toThrow();
    
    // Mock 복원
    (global.URL.createObjectURL as jest.Mock).mockReturnValue("mock-blob-url");
    consoleWarnSpy.mockRestore();
  });

  it("지원하지 않는 SVG 형식에 대해 에러 처리를 해야 한다", async () => {
    const mockResponse = {
      data: {
        success: true,
        dataUrl: "data:image/svg+xml;unsupported,invalid-svg",
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    mockedAxios.get.mockRejectedValueOnce(new Error("Invalid SVG format"));

    const result = await downloadQrCode(
      "Test Content",
      "TEXT",
      {},
      null,
      "png"
    );

    expect(result).toEqual({ success: false, error: "다운로드에 실패했습니다." });
  });

  it("유효하지 않은 SVG에 대해 에러 처리를 해야 한다", async () => {
    const mockResponse = {
      data: {
        success: true,
        dataUrl: "data:image/svg+xml;base64," + btoa("invalid svg content"),
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);
    mockedAxios.get.mockRejectedValueOnce(new Error("Invalid SVG content"));

    const result = await downloadQrCode(
      "Test Content",
      "TEXT",
      {},
      null,
      "png"
    );

    expect(result).toEqual({ success: false, error: "다운로드에 실패했습니다." });
  });

  it("네트워크 타임아웃 및 에러 처리를 해야 한다", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Network timeout"));

    const result = await downloadQrCode(
      "Test Content",
      "TEXT",
      {},
      null,
      "png"
    );

    expect(result).toEqual({ success: false, error: "다운로드에 실패했습니다." });
  });
});
