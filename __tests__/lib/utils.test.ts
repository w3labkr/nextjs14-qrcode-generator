import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  cn,
  inferQrCodeType,
  truncateContent,
  getTypeLabel,
  getTypeColor,
  getContentPreview,
  getQrCodeColor,
} from "@/lib/utils";

describe("Utils 라이브러리", () => {
  describe("cn 함수", () => {
    it("클래스 이름들을 올바르게 병합해야 한다", () => {
      const result = cn("px-4", "py-2", "bg-blue-500");
      expect(result).toBe("px-4 py-2 bg-blue-500");
    });

    it("조건부 클래스를 올바르게 처리해야 한다", () => {
      const isActive = true;
      const result = cn(
        "base-class",
        isActive && "active-class",
        "another-class",
      );
      expect(result).toBe("base-class active-class another-class");
    });

    it("false 조건을 무시해야 한다", () => {
      const isActive = false;
      const result = cn(
        "base-class",
        isActive && "active-class",
        "another-class",
      );
      expect(result).toBe("base-class another-class");
    });

    it("중복되는 Tailwind 클래스를 올바르게 병합해야 한다", () => {
      const result = cn("px-4 py-2", "px-6");
      expect(result).toBe("py-2 px-6");
    });

    it("null과 undefined를 올바르게 처리해야 한다", () => {
      const result = cn("base-class", null, undefined, "another-class");
      expect(result).toBe("base-class another-class");
    });

    it("빈 문자열을 올바르게 처리해야 한다", () => {
      const result = cn("base-class", "", "another-class");
      expect(result).toBe("base-class another-class");
    });

    it("객체 형태의 조건부 클래스를 처리해야 한다", () => {
      const result = cn("base-class", {
        "active-class": true,
        "inactive-class": false,
        "hover-class": true,
      });
      expect(result).toBe("base-class active-class hover-class");
    });

    it("배열 형태의 클래스를 처리해야 한다", () => {
      const result = cn(["base-class", "another-class"], "extra-class");
      expect(result).toBe("base-class another-class extra-class");
    });
  });

  describe("inferQrCodeType 함수", () => {
    it("URL 타입을 올바르게 감지해야 한다", () => {
      expect(inferQrCodeType("https://example.com")).toBe("URL");
      expect(inferQrCodeType("http://test.com")).toBe("URL");
      expect(inferQrCodeType("HTTPS://EXAMPLE.COM")).toBe("URL");
    });

    it("EMAIL 타입을 올바르게 감지해야 한다", () => {
      expect(inferQrCodeType("mailto:test@example.com")).toBe("EMAIL");
      expect(inferQrCodeType("MAILTO:TEST@EXAMPLE.COM")).toBe("EMAIL");
    });

    it("SMS 타입을 올바르게 감지해야 한다", () => {
      expect(inferQrCodeType("sms:+1234567890")).toBe("SMS");
      expect(inferQrCodeType("SMS:+1234567890")).toBe("SMS");
    });

    it("WIFI 타입을 올바르게 감지해야 한다", () => {
      expect(inferQrCodeType("wifi:T:WPA;S:MyNetwork;P:password;;")).toBe(
        "WIFI",
      );
      expect(inferQrCodeType("WIFI:T:WPA;S:MyNetwork;P:password;;")).toBe(
        "WIFI",
      );
    });

    it("VCARD 타입을 올바르게 감지해야 한다", () => {
      expect(
        inferQrCodeType("BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD"),
      ).toBe("VCARD");
      expect(
        inferQrCodeType("begin:vcard\nversion:3.0\nfn:john doe\nend:vcard"),
      ).toBe("VCARD");
    });

    it("LOCATION 타입을 올바르게 감지해야 한다", () => {
      expect(inferQrCodeType("geo:37.7749,-122.4194")).toBe("LOCATION");
      expect(inferQrCodeType("GEO:37.7749,-122.4194")).toBe("LOCATION");
    });

    it("기본값으로 TEXTAREA를 반환해야 한다", () => {
      expect(inferQrCodeType("일반 텍스트")).toBe("TEXTAREA");
      expect(inferQrCodeType("")).toBe("TEXTAREA");
      expect(inferQrCodeType("123456")).toBe("TEXTAREA");
    });

    it("잘못된 입력값을 처리해야 한다", () => {
      expect(inferQrCodeType(null as any)).toBe("TEXTAREA");
      expect(inferQrCodeType(undefined as any)).toBe("TEXTAREA");
      expect(inferQrCodeType(123 as any)).toBe("TEXTAREA");
    });
  });

  describe("truncateContent 함수", () => {
    it("짧은 텍스트는 그대로 반환해야 한다", () => {
      const shortText = "짧은 텍스트";
      expect(truncateContent(shortText)).toBe(shortText);
    });

    it("긴 텍스트를 올바르게 자르고 생략표를 추가해야 한다", () => {
      const longText = "이것은 매우 긴 텍스트입니다. ".repeat(10);
      const result = truncateContent(longText, 50);
      expect(result).toHaveLength(53); // 50 + "..."
      expect(result.endsWith("...")).toBe(true);
    });

    it("기본 길이 80을 사용해야 한다", () => {
      const text = "a".repeat(100);
      const result = truncateContent(text);
      expect(result).toHaveLength(83); // 80 + "..."
    });

    it("정확히 maxLength와 같은 길이의 텍스트는 그대로 반환해야 한다", () => {
      const text = "a".repeat(80);
      const result = truncateContent(text, 80);
      expect(result).toBe(text);
    });
  });

  describe("getTypeLabel 함수", () => {
    it("URL 타입의 라벨을 반환해야 한다", () => {
      expect(getTypeLabel("URL")).toBe("웹사이트");
      expect(getTypeLabel("url")).toBe("웹사이트");
    });

    it("TEXTAREA 타입의 라벨을 반환해야 한다", () => {
      expect(getTypeLabel("TEXTAREA")).toBe("텍스트");
      expect(getTypeLabel("textarea")).toBe("텍스트");
    });

    it("TEXT를 TEXTAREA로 매핑해야 한다", () => {
      expect(getTypeLabel("TEXT")).toBe("텍스트");
      expect(getTypeLabel("text")).toBe("텍스트");
    });

    it("알 수 없는 타입은 원본을 반환해야 한다", () => {
      expect(getTypeLabel("UNKNOWN")).toBe("UNKNOWN");
      expect(getTypeLabel("invalid")).toBe("invalid");
    });
  });

  describe("getTypeColor 함수", () => {
    it("URL 타입의 색상을 반환해야 한다", () => {
      expect(getTypeColor("URL")).toBe("bg-blue-100 text-blue-800");
      expect(getTypeColor("url")).toBe("bg-blue-100 text-blue-800");
    });

    it("TEXTAREA 타입의 색상을 반환해야 한다", () => {
      expect(getTypeColor("TEXTAREA")).toBe("bg-gray-100 text-gray-800");
      expect(getTypeColor("textarea")).toBe("bg-gray-100 text-gray-800");
    });

    it("TEXT를 TEXTAREA로 매핑해야 한다", () => {
      expect(getTypeColor("TEXT")).toBe("bg-gray-100 text-gray-800");
      expect(getTypeColor("text")).toBe("bg-gray-100 text-gray-800");
    });

    it("알 수 없는 타입은 기본 색상을 반환해야 한다", () => {
      expect(getTypeColor("UNKNOWN")).toBe("bg-gray-100 text-gray-800");
      expect(getTypeColor("invalid")).toBe("bg-gray-100 text-gray-800");
    });
  });

  describe("getContentPreview 함수", () => {
    it("빈 내용에 대해 기본 메시지를 반환해야 한다", () => {
      expect(getContentPreview("", "URL")).toBe("내용 없음");
      expect(getContentPreview(null as any, "URL")).toBe("내용 없음");
      expect(getContentPreview(undefined as any, "URL")).toBe("내용 없음");
    });

    it("WIFI 타입의 JSON 데이터를 파싱해야 한다", () => {
      const wifiData = JSON.stringify({
        ssid: "MyNetwork",
        password: "secret",
      });
      expect(getContentPreview(wifiData, "WIFI")).toBe("SSID: MyNetwork");
    });

    it("잘못된 WIFI JSON에 대해 일반 미리보기를 반환해야 한다", () => {
      const invalidJson = "짧은텍스트";
      const result = getContentPreview(invalidJson, "WIFI");
      expect(result).toBe("짧은텍스트...");
    });

    it("WIFI JSON에 ssid가 없으면 기본값을 표시해야 한다", () => {
      const wifiData = JSON.stringify({ password: "secret" });
      expect(getContentPreview(wifiData, "WIFI")).toBe("SSID: 알 수 없음");
    });

    it("긴 내용을 50자로 자르고 생략표를 추가해야 한다", () => {
      const longContent = "이것은 매우 긴 내용입니다. ".repeat(5);
      const result = getContentPreview(longContent, "URL");
      expect(result).toHaveLength(53); // 50 + "..."
      expect(result.endsWith("...")).toBe(true);
    });

    it("50자 이하의 내용은 그대로 반환해야 한다", () => {
      const shortContent = "짧은 내용";
      expect(getContentPreview(shortContent, "URL")).toBe(shortContent);
    });
  });

  describe("getQrCodeColor 함수", () => {
    it("문자열 설정에서 color.dark를 추출해야 한다", () => {
      const settings = JSON.stringify({ color: { dark: "#ff0000" } });
      expect(getQrCodeColor(settings)).toBe("#ff0000");
    });

    it("객체 설정에서 color.dark를 추출해야 한다", () => {
      const settings = { color: { dark: "#00ff00" } };
      expect(getQrCodeColor(settings)).toBe("#00ff00");
    });

    it("foregroundColor를 추출해야 한다", () => {
      const settings = { foregroundColor: "#0000ff" };
      expect(getQrCodeColor(settings)).toBe("#0000ff");
    });

    it("color.dark가 있으면 foregroundColor보다 우선해야 한다", () => {
      const settings = {
        color: { dark: "#ff0000" },
        foregroundColor: "#0000ff",
      };
      expect(getQrCodeColor(settings)).toBe("#ff0000");
    });

    it("잘못된 JSON 문자열에 대해 기본 색상을 반환해야 한다", () => {
      const invalidJson = "invalid json";
      expect(getQrCodeColor(invalidJson)).toBe("#6b7280");
    });

    it("빈 설정에 대해 기본 색상을 반환해야 한다", () => {
      expect(getQrCodeColor({})).toBe("#6b7280");
      expect(getQrCodeColor(null)).toBe("#6b7280");
      expect(getQrCodeColor(undefined)).toBe("#6b7280");
    });

    it("설정 파싱 중 오류가 발생하면 기본 색상을 반환해야 한다", () => {
      const circularRef: any = {};
      circularRef.self = circularRef;
      expect(getQrCodeColor(circularRef)).toBe("#6b7280");
    });
  });
});
