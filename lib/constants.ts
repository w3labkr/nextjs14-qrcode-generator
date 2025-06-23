export const GITHUB_REPO_URL =
  "https://github.com/w3labkr/nextjs14-qrcode-generator";

export const COPYRIGHT_TEXT = "© 2025 W3LabKr. All rights reserved.";

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
} as const;
