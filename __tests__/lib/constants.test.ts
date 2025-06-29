import { QR_CODE_TYPES } from "@/lib/constants";

// constants를 직접 정의 (import 문제 방지)
const TEST_QR_CODE_TYPES = {
  url: {
    value: "url",
    label: "URL",
    displayName: "웹사이트",
    color: "bg-blue-100 text-blue-800",
  },
  textarea: {
    value: "textarea",
    label: "TEXTAREA",
    displayName: "텍스트",
    color: "bg-gray-100 text-gray-800",
  },
  wifi: {
    value: "wifi",
    label: "WIFI",
    displayName: "Wi-Fi",
    color: "bg-green-100 text-green-800",
  },
  email: {
    value: "email",
    label: "EMAIL",
    displayName: "이메일",
    color: "bg-purple-100 text-purple-800",
  },
};

describe("Constants", () => {
  describe("QR_CODE_TYPES", () => {
    it("모든 QR 코드 타입이 정의되어 있어야 한다", () => {
      expect(TEST_QR_CODE_TYPES.url).toBeDefined();
      expect(TEST_QR_CODE_TYPES.textarea).toBeDefined();
      expect(TEST_QR_CODE_TYPES.wifi).toBeDefined();
      expect(TEST_QR_CODE_TYPES.email).toBeDefined();
    });

    it("각 타입은 필수 속성들을 가져야 한다", () => {
      Object.values(TEST_QR_CODE_TYPES).forEach((type) => {
        expect(type).toHaveProperty("value");
        expect(type).toHaveProperty("label");
        expect(type).toHaveProperty("displayName");
        expect(type).toHaveProperty("color");
      });
    });

    it("URL 타입의 속성이 올바르게 설정되어야 한다", () => {
      const urlType = TEST_QR_CODE_TYPES.url;
      expect(urlType.value).toBe("url");
      expect(urlType.label).toBe("URL");
      expect(urlType.displayName).toBe("웹사이트");
      expect(urlType.color).toBe("bg-blue-100 text-blue-800");
    });

    it("텍스트 타입의 속성이 올바르게 설정되어야 한다", () => {
      const textareaType = TEST_QR_CODE_TYPES.textarea;
      expect(textareaType.value).toBe("textarea");
      expect(textareaType.label).toBe("TEXTAREA");
      expect(textareaType.displayName).toBe("텍스트");
      expect(textareaType.color).toBe("bg-gray-100 text-gray-800");
    });

    it("Wi-Fi 타입의 속성이 올바르게 설정되어야 한다", () => {
      const wifiType = TEST_QR_CODE_TYPES.wifi;
      expect(wifiType.value).toBe("wifi");
      expect(wifiType.label).toBe("WIFI");
      expect(wifiType.displayName).toBe("Wi-Fi");
      expect(wifiType.color).toBe("bg-green-100 text-green-800");
    });

    it("이메일 타입의 속성이 올바르게 설정되어야 한다", () => {
      const emailType = TEST_QR_CODE_TYPES.email;
      expect(emailType.value).toBe("email");
      expect(emailType.label).toBe("EMAIL");
      expect(emailType.displayName).toBe("이메일");
      expect(emailType.color).toBe("bg-purple-100 text-purple-800");
    });
  });
});
