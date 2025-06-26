export const GITHUB_REPO_URL =
  "https://github.com/w3labkr/nextjs14-qrcode-generator";

export const COPYRIGHT_TEXT = "© 2025 W3LabKr. All rights reserved.";

// QR 코드 타입 관련 상수
export const QR_CODE_TYPES = {
  url: { value: "url", label: "URL", displayName: "웹사이트" },
  textarea: { value: "textarea", label: "TEXTAREA", displayName: "텍스트" },
  wifi: { value: "wifi", label: "WIFI", displayName: "Wi-Fi" },
  email: { value: "email", label: "EMAIL", displayName: "이메일" },
  sms: { value: "sms", label: "SMS", displayName: "문자" },
  vcard: { value: "vcard", label: "VCARD", displayName: "연락처" },
  location: { value: "location", label: "LOCATION", displayName: "지도" },
} as const;

export const QR_CODE_TYPE_VALUES = Object.keys(QR_CODE_TYPES) as Array<
  keyof typeof QR_CODE_TYPES
>;

// 토큰 관련 상수
export const TOKEN_CONFIG = {
  // 토큰 갱신 시점 (만료 10분 전)
  REFRESH_THRESHOLD_SECONDS: 600,
  // 세션 갱신 주기 (3분)
  SESSION_REFETCH_INTERVAL: 3 * 60,
  // 액세스 토큰 기본 만료 시간 (1시간)
  ACCESS_TOKEN_EXPIRES_IN: 60 * 60,
  // 리프레시 토큰 만료 시간 (30일)
  REFRESH_TOKEN_EXPIRES_IN: 30 * 24 * 60 * 60,
  // 수동 갱신 버튼 표시 시점 (만료 15분 전)
  MANUAL_REFRESH_THRESHOLD: 900,
  // 세션 만료 시간 설정
  SESSION_MAX_AGE_DEFAULT: 24 * 60 * 60, // 1일 (기본)
  SESSION_MAX_AGE_REMEMBER: 30 * 24 * 60 * 60, // 30일 (기억하기)
} as const;
