import { 
  QR_CODE_TYPES, 
  QR_CODE_TYPE_VALUES, 
  GITHUB_REPO_URL, 
  COPYRIGHT_TEXT 
} from "@/lib/constants";

describe("Constants", () => {
  describe("GITHUB_REPO_URL", () => {
    it("올바른 GitHub URL을 반환해야 한다", () => {
      expect(GITHUB_REPO_URL).toBe("https://github.com/w3labkr/nextjs14-qrcode-generator");
      expect(GITHUB_REPO_URL).toMatch(/^https:\/\/github\.com\//);
    });
  });

  describe("COPYRIGHT_TEXT", () => {
    it("올바른 저작권 텍스트를 반환해야 한다", () => {
      expect(COPYRIGHT_TEXT).toBe("© 2025 W3LabKr. All rights reserved.");
      expect(COPYRIGHT_TEXT).toContain("2025");
      expect(COPYRIGHT_TEXT).toContain("W3LabKr");
    });
  });

  describe("QR_CODE_TYPES", () => {
    it("모든 QR 코드 타입이 정의되어 있어야 한다", () => {
      const expectedTypes = ['url', 'textarea', 'wifi', 'email', 'sms', 'vcard', 'location'];
      const actualTypes = Object.keys(QR_CODE_TYPES);
      
      expect(actualTypes).toEqual(expect.arrayContaining(expectedTypes));
      expect(actualTypes).toHaveLength(expectedTypes.length);
    });

    it("각 QR 코드 타입이 필요한 속성을 가져야 한다", () => {
      Object.values(QR_CODE_TYPES).forEach((type) => {
        expect(type).toHaveProperty('value');
        expect(type).toHaveProperty('label');
        expect(type).toHaveProperty('displayName');
        expect(type).toHaveProperty('color');
        
        expect(typeof type.value).toBe('string');
        expect(typeof type.label).toBe('string');
        expect(typeof type.displayName).toBe('string');
        expect(typeof type.color).toBe('string');
      });
    });

    it("URL 타입이 올바르게 정의되어 있어야 한다", () => {
      expect(QR_CODE_TYPES.url).toEqual({
        value: "url",
        label: "URL",
        displayName: "웹사이트",
        color: "bg-blue-100 text-blue-800",
      });
    });

    it("TEXTAREA 타입이 올바르게 정의되어 있어야 한다", () => {
      expect(QR_CODE_TYPES.textarea).toEqual({
        value: "textarea",
        label: "TEXTAREA",
        displayName: "텍스트",
        color: "bg-gray-100 text-gray-800",
      });
    });

    it("WIFI 타입이 올바르게 정의되어 있어야 한다", () => {
      expect(QR_CODE_TYPES.wifi).toEqual({
        value: "wifi",
        label: "WIFI",
        displayName: "Wi-Fi",
        color: "bg-green-100 text-green-800",
      });
    });

    it("EMAIL 타입이 올바르게 정의되어 있어야 한다", () => {
      expect(QR_CODE_TYPES.email).toEqual({
        value: "email",
        label: "EMAIL",
        displayName: "이메일",
        color: "bg-purple-100 text-purple-800",
      });
    });

    it("SMS 타입이 올바르게 정의되어 있어야 한다", () => {
      expect(QR_CODE_TYPES.sms).toEqual({
        value: "sms",
        label: "SMS",
        displayName: "문자",
        color: "bg-yellow-100 text-yellow-800",
      });
    });

    it("VCARD 타입이 올바르게 정의되어 있어야 한다", () => {
      expect(QR_CODE_TYPES.vcard).toEqual({
        value: "vcard",
        label: "VCARD",
        displayName: "연락처",
        color: "bg-pink-100 text-pink-800",
      });
    });

    it("LOCATION 타입이 올바르게 정의되어 있어야 한다", () => {
      expect(QR_CODE_TYPES.location).toEqual({
        value: "location",
        label: "LOCATION",
        displayName: "지도",
        color: "bg-red-100 text-red-800",
      });
    });

    it("모든 color 값이 Tailwind CSS 클래스 형식이어야 한다", () => {
      Object.values(QR_CODE_TYPES).forEach((type) => {
        expect(type.color).toMatch(/^bg-\w+-\d+ text-\w+-\d+$/);
      });
    });
  });

  describe("QR_CODE_TYPE_VALUES", () => {
    it("QR_CODE_TYPES의 모든 키를 포함해야 한다", () => {
      const expectedKeys = Object.keys(QR_CODE_TYPES);
      expect(QR_CODE_TYPE_VALUES).toEqual(expectedKeys);
    });

    it("배열이어야 한다", () => {
      expect(Array.isArray(QR_CODE_TYPE_VALUES)).toBe(true);
    });

    it("중복 값이 없어야 한다", () => {
      const uniqueValues = Array.from(new Set(QR_CODE_TYPE_VALUES));
      expect(QR_CODE_TYPE_VALUES).toHaveLength(uniqueValues.length);
    });
  });
});
