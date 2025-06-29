import {
  convertQrCodesToCSV,
  convertTemplatesToCSV,
  convertLogsToCSV,
  parseQrCodesFromCSV,
  parseTemplatesFromCSV,
} from "@/lib/csv-utils";

describe("CSV Utils", () => {
  describe("convertQrCodesToCSV", () => {
    it("QR 코드 데이터를 CSV로 변환해야 한다", () => {
      const qrCodes = [
        {
          type: "URL",
          title: "Test QR 1",
          content: "https://example.com",
          settings: '{"width":400}',
          isFavorite: false,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          type: "TEXTAREA",
          title: "Test QR 2",
          content: "Hello, World",
          settings: '{"width":400}',
          isFavorite: true,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
        },
      ];

      const result = convertQrCodesToCSV(qrCodes);

      expect(result).toContain(
        "type,title,content,settings,isFavorite,createdAt,updatedAt",
      );
      expect(result).toContain("URL,Test QR 1,https://example.com");
      expect(result).toContain('TEXTAREA,Test QR 2,"Hello, World"');
    });

    it("빈 배열의 경우 헤더만 반환해야 한다", () => {
      const result = convertQrCodesToCSV([]);

      expect(result).toBe(
        "type,title,content,settings,isFavorite,createdAt,updatedAt\n",
      );
    });

    it("null 또는 undefined 배열의 경우 헤더만 반환해야 한다", () => {
      const result1 = convertQrCodesToCSV(null as any);
      const result2 = convertQrCodesToCSV(undefined as any);

      expect(result1).toBe(
        "type,title,content,settings,isFavorite,createdAt,updatedAt\n",
      );
      expect(result2).toBe(
        "type,title,content,settings,isFavorite,createdAt,updatedAt\n",
      );
    });

    it("특수 문자가 포함된 데이터를 올바르게 처리해야 한다", () => {
      const qrCodes = [
        {
          type: "URL",
          title: 'Test "QR" 1',
          content: "https://example.com?q=hello,world",
          settings: "{}",
          isFavorite: false,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ];

      const result = convertQrCodesToCSV(qrCodes);

      expect(result).toContain('"Test ""QR"" 1"');
      expect(result).toContain('"https://example.com?q=hello,world"');
    });
  });

  describe("convertTemplatesToCSV", () => {
    it("템플릿 데이터를 CSV로 변환해야 한다", () => {
      const templates = [
        {
          name: "Template 1",
          settings: '{"width":400}',
          isDefault: true,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          name: "Template 2",
          settings: '{"width":800}',
          isDefault: false,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
        },
      ];

      const result = convertTemplatesToCSV(templates);

      expect(result).toContain("name,settings,isDefault,createdAt,updatedAt");
      expect(result).toContain("Template 1");
      expect(result).toContain("Template 2");
    });

    it("빈 배열의 경우 헤더만 반환해야 한다", () => {
      const result = convertTemplatesToCSV([]);

      expect(result).toContain("name,settings,isDefault,createdAt,updatedAt");
    });
  });

  describe("convertLogsToCSV", () => {
    it("로그 데이터를 CSV로 변환해야 한다", () => {
      const logs = [
        {
          id: "log1",
          userId: "user1",
          type: "API",
          level: "INFO",
          action: "CREATE",
          message: "QR code created",
          details: "{}",
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0",
          createdAt: new Date("2024-01-01"),
        },
      ];

      const result = convertLogsToCSV(logs);

      expect(result).toContain(
        "id,userId,type,level,action,message,details,ipAddress,userAgent,createdAt",
      );
      expect(result).toContain("log1,user1,API,INFO,CREATE");
    });
  });

  describe("parseQrCodesFromCSV", () => {
    it("올바른 CSV 데이터를 파싱해야 한다", () => {
      const csvData = `type,title,content,settings,isFavorite,createdAt,updatedAt
URL,Test QR 1,https://example.com,{},false,2024-01-01,2024-01-01
TEXTAREA,Test QR 2,Hello World,{},true,2024-01-02,2024-01-02`;

      const result = parseQrCodesFromCSV(csvData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        type: "URL",
        title: "Test QR 1",
        content: "https://example.com",
        settings: {},
        isFavorite: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });
    });

    it("잘못된 CSV 형식의 경우 빈 배열을 반환해야 한다", () => {
      const csvData = "invalid csv data";
      const result = parseQrCodesFromCSV(csvData);

      expect(result).toEqual([]);
    });

    it("빈 CSV 데이터의 경우 빈 배열을 반환해야 한다", () => {
      const csvData = "";
      const result = parseQrCodesFromCSV(csvData);

      expect(result).toEqual([]);
    });

    it("헤더만 있는 CSV의 경우 빈 배열을 반환해야 한다", () => {
      const csvData =
        "type,title,content,settings,isFavorite,createdAt,updatedAt";
      const result = parseQrCodesFromCSV(csvData);

      expect(result).toEqual([]);
    });
  });

  describe("parseTemplatesFromCSV", () => {
    it("템플릿 CSV 데이터를 파싱해야 한다", () => {
      const csvData = `name,settings,isDefault,createdAt,updatedAt
Template 1,{},true,2024-01-01,2024-01-01
Template 2,{},false,2024-01-02,2024-01-02`;

      const result = parseTemplatesFromCSV(csvData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: "Template 1",
        settings: {},
        isDefault: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });
    });

    it("잘못된 형식의 경우 빈 배열을 반환해야 한다", () => {
      const csvData = "invalid";
      const result = parseTemplatesFromCSV(csvData);

      expect(result).toEqual([]);
    });
  });
});
