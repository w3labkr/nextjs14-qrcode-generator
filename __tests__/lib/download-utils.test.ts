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

// Mock window object
(global as any).window = (global as any).window || {};
(global as any).window.JSZip = jest.fn().mockImplementation(() => ({
  file: jest.fn(),
  generateAsync: jest.fn().mockResolvedValue(new Blob(["mock-zip-content"])),
}));

// Mock document
const mockAnchorElement = {
  click: jest.fn(),
  setAttribute: jest.fn(),
  style: {},
  href: "",
  download: "",
};

Object.defineProperty(document, "createElement", {
  value: jest.fn().mockReturnValue(mockAnchorElement),
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
    it("함수가 정의되어 있어야 한다", () => {
      expect(downloadCSVAsZip).toBeDefined();
    });
  });

  describe("downloadQrCode 함수", () => {
    it("함수가 정의되어 있어야 한다", () => {
      expect(downloadQrCode).toBeDefined();
    });
  });
});
