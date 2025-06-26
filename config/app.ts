import pkg from "@/package.json";

export const appConfig = {
  name: "QR Code Generator",
  description: "다양한 유형의 QR 코드를 생성할 수 있는 웹 애플리케이션입니다.",
  version: `v${pkg.version}`,
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  session: {
    // 토큰 갱신 시점 (만료 10분 전)
    refreshThresholdSeconds: 600,
    // 세션 갱신 주기 (3분)
    sessionRefetchInterval: 3 * 60,
    // 액세스 토큰 기본 만료 시간 (1시간)
    accessTokenExpiresIn: 60 * 60,
    // 리프레시 토큰 만료 시간 (30일)
    refreshTokenExpiresIn: 30 * 24 * 60 * 60,
    // 수동 갱신 버튼 표시 시점 (만료 15분 전)
    manualRefreshThreshold: 900,
    // 세션 만료 시간 설정
    sessionMaxAgeDefault: 24 * 60 * 60, // 1일 (기본)
    sessionMaxAgeRemember: 30 * 24 * 60 * 60, // 30일 (기억하기)
  },
} as const;
