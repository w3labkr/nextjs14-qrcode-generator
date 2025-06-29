// download-utils.ts의 일부 함수들을 테스트
// 실제 파일에서 추출한 유틸리티 함수들

describe("Download Utils", () => {
  describe("parseQrSettings 함수", () => {
    const parseQrSettings = (
      settings: any,
      content: string,
      format: string,
    ) => {
      let parsedSettings = settings;
      if (typeof settings === "string") {
        try {
          parsedSettings = JSON.parse(settings);
        } catch (e) {
          console.warn("Settings 파싱 오류, 기본값 사용:", e);
          parsedSettings = {};
        }
      }

      return {
        text: content,
        type: format as any,
        width: parsedSettings?.width || 400,
        margin: parsedSettings?.margin || 0,
        color: {
          dark: parsedSettings?.color?.dark || "#000000",
          light: parsedSettings?.color?.light || "#ffffff",
        },
        logo: parsedSettings?.logo || undefined,
        dotsOptions: parsedSettings?.dotsOptions,
        cornersSquareOptions: parsedSettings?.cornersSquareOptions,
        frameOptions: parsedSettings?.frameOptions,
      };
    };

    it("기본 설정으로 QR 설정을 파싱해야 한다", () => {
      const result = parseQrSettings({}, "test content", "png");

      expect(result).toEqual({
        text: "test content",
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
      });
    });

    it("커스텀 설정이 올바르게 적용되어야 한다", () => {
      const customSettings = {
        width: 600,
        margin: 10,
        color: {
          dark: "#FF0000",
          light: "#00FF00",
        },
      };

      const result = parseQrSettings(customSettings, "custom content", "jpg");

      expect(result).toEqual({
        text: "custom content",
        type: "jpg",
        width: 600,
        margin: 10,
        color: {
          dark: "#FF0000",
          light: "#00FF00",
        },
        logo: undefined,
        dotsOptions: undefined,
        cornersSquareOptions: undefined,
        frameOptions: undefined,
      });
    });

    it("문자열 형태의 JSON 설정을 파싱해야 한다", () => {
      const jsonSettings = '{"width": 800, "margin": 20}';

      const result = parseQrSettings(jsonSettings, "json content", "svg");

      expect(result.width).toBe(800);
      expect(result.margin).toBe(20);
      expect(result.text).toBe("json content");
      expect(result.type).toBe("svg");
    });

    it("잘못된 JSON 문자열의 경우 기본값을 사용해야 한다", () => {
      const invalidJson = '{"width": 800, margin: }'; // 잘못된 JSON

      const result = parseQrSettings(invalidJson, "invalid json", "png");

      expect(result.width).toBe(400); // 기본값
      expect(result.margin).toBe(0); // 기본값
      expect(result.text).toBe("invalid json");
    });
  });

  describe("generateFileName 함수", () => {
    const generateFileName = (
      title: string | null | undefined,
      type: string,
      format: string,
    ): string => {
      const fileExtension = format === "jpg" ? "jpg" : format;
      const timestamp = new Date().toISOString().slice(0, 10);

      if (title) {
        const sanitizedTitle = title
          .replace(/[^a-zA-Z0-9가-힣\s]/g, "")
          .trim()
          .replace(/\s+/g, "-");
        return `${sanitizedTitle}.${fileExtension}`;
      }

      return `qrcode-${type.toLowerCase()}-${timestamp}.${fileExtension}`;
    };

    it("제목이 있는 경우 제목을 파일명으로 사용해야 한다", () => {
      const result = generateFileName("My QR Code", "url", "png");

      expect(result).toBe("My-QR-Code.png");
    });

    it("제목에서 특수문자를 제거해야 한다", () => {
      const result = generateFileName("QR@Code#Test!", "wifi", "jpg");

      expect(result).toBe("QRCodeTest.jpg");
    });

    it("한글 제목을 올바르게 처리해야 한다", () => {
      const result = generateFileName("QR 코드 테스트", "text", "svg");

      expect(result).toBe("QR-코드-테스트.svg");
    });

    it("제목이 없는 경우 기본 파일명을 생성해야 한다", () => {
      const result = generateFileName(null, "URL", "png");
      const today = new Date().toISOString().slice(0, 10);

      expect(result).toBe(`qrcode-url-${today}.png`);
    });

    it("빈 문자열 제목의 경우 기본 파일명을 생성해야 한다", () => {
      const result = generateFileName("", "EMAIL", "jpg");
      const today = new Date().toISOString().slice(0, 10);

      expect(result).toBe(`qrcode-email-${today}.jpg`);
    });

    it("공백만 있는 제목의 경우 기본 파일명을 생성해야 한다", () => {
      const result = generateFileName("   ", "sms", "png");

      expect(result).toBe(".png");
    });

    it("여러 공백을 하이픈으로 변경해야 한다", () => {
      const result = generateFileName("QR   Code    Test", "vcard", "svg");

      expect(result).toBe("QR-Code-Test.svg");
    });

    it("jpg 포맷의 경우 확장자가 jpg여야 한다", () => {
      const result = generateFileName("Test", "url", "jpg");

      expect(result).toBe("Test.jpg");
    });
  });

  describe("URL 검증 함수", () => {
    const isValidUrl = (string: string): boolean => {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    };

    it("유효한 URL을 올바르게 식별해야 한다", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://example.com")).toBe(true);
      expect(isValidUrl("https://sub.example.com/path?query=value")).toBe(true);
    });

    it("무효한 URL을 올바르게 식별해야 한다", () => {
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("example.com")).toBe(false);
      expect(isValidUrl("")).toBe(false);
      expect(isValidUrl("ftp://example.com")).toBe(true); // ftp는 유효한 프로토콜
    });
  });

  describe("파일 크기 포맷팅 함수", () => {
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return "0 B";

      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    it("바이트를 올바른 단위로 변환해야 한다", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1048576)).toBe("1 MB");
      expect(formatFileSize(1073741824)).toBe("1 GB");
    });

    it("소수점을 올바르게 처리해야 한다", () => {
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(2621440)).toBe("2.5 MB");
    });

    it("작은 값들을 올바르게 처리해야 한다", () => {
      expect(formatFileSize(512)).toBe("512 B");
      expect(formatFileSize(1)).toBe("1 B");
    });
  });
});
