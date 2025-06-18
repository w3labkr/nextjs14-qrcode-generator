/**
 * WiFi QR 코드 검증 및 유틸리티 함수들
 */

export interface WifiQrData {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

/**
 * WiFi QR 코드 문자열의 유효성을 검증합니다.
 */
export function validateWifiQrString(wifiString: string): {
  isValid: boolean;
  errors: string[];
  data?: WifiQrData;
} {
  const errors: string[] = [];

  // 기본 형식 검증
  if (!wifiString.startsWith("WIFI:")) {
    errors.push('WiFi QR 코드는 "WIFI:"로 시작해야 합니다.');
  }

  if (!wifiString.endsWith(";;")) {
    errors.push('WiFi QR 코드는 ";;"로 끝나야 합니다.');
  }

  // 필드 파싱
  const fields = parseWifiString(wifiString);

  if (!fields.ssid) {
    errors.push("SSID(네트워크 이름)는 필수입니다.");
  }

  if (!["WPA", "WEP", "nopass"].includes(fields.encryption)) {
    errors.push("지원되지 않는 암호화 방식입니다.");
  }

  // 암호화가 설정된 경우 비밀번호 확인
  if (
    (fields.encryption === "WPA" || fields.encryption === "WEP") &&
    !fields.password
  ) {
    errors.push("WPA/WEP 암호화 방식에는 비밀번호가 필요합니다.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? fields : undefined,
  };
}

/**
 * WiFi 문자열을 파싱하여 개별 필드를 추출합니다.
 */
export function parseWifiString(wifiString: string): WifiQrData {
  const defaultData: WifiQrData = {
    ssid: "",
    password: "",
    encryption: "WPA",
    hidden: false,
  };

  if (!wifiString.startsWith("WIFI:")) {
    return defaultData;
  }

  // WIFI: 제거하고 파싱
  const content = wifiString.slice(5);
  const parts = content.split(";");

  const data: WifiQrData = { ...defaultData };

  for (const part of parts) {
    if (!part.includes(":")) continue;

    const [key, ...valueParts] = part.split(":");
    const value = valueParts.join(":"); // 콜론이 포함된 값 처리

    switch (key) {
      case "T":
        if (["WPA", "WEP", "nopass"].includes(value)) {
          data.encryption = value as "WPA" | "WEP" | "nopass";
        }
        break;
      case "S":
        data.ssid = unescapeWifiString(value);
        break;
      case "P":
        data.password = unescapeWifiString(value);
        break;
      case "H":
        data.hidden = value.toLowerCase() === "true";
        break;
    }
  }

  return data;
}

/**
 * WiFi QR 코드에서 이스케이프된 문자를 복원합니다.
 */
export function unescapeWifiString(str: string): string {
  return str
    .replace(/\\:/g, ":")
    .replace(/\\"/g, '"')
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

/**
 * WiFi QR 코드용 문자를 이스케이프합니다.
 */
export function escapeWifiString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/"/g, '\\"')
    .replace(/:/g, "\\:");
}

/**
 * 일반적인 WiFi QR 코드 문제들을 진단합니다.
 */
export function diagnoseWifiQrIssues(wifiString: string): string[] {
  const suggestions: string[] = [];
  const data = parseWifiString(wifiString);

  // 일반적인 문제들 확인
  if (data.ssid.includes(" ") && !data.ssid.includes("\\ ")) {
    suggestions.push(
      "SSID에 공백이 포함되어 있습니다. 일부 기기에서 문제가 될 수 있습니다.",
    );
  }

  if (
    data.password.length > 0 &&
    data.password.length < 8 &&
    data.encryption === "WPA"
  ) {
    suggestions.push("WPA 비밀번호는 최소 8자 이상이어야 합니다.");
  }

  if (data.encryption === "WEP") {
    suggestions.push(
      "WEP 암호화는 보안이 약하므로 권장하지 않습니다. WPA를 사용하세요.",
    );
  }

  if (data.ssid.includes("\\") || data.password.includes("\\")) {
    suggestions.push(
      "백슬래시가 포함된 경우 일부 기기에서 문제가 될 수 있습니다.",
    );
  }

  return suggestions;
}
