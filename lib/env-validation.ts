// 환경 변수 검증 유틸리티
import type { LogLevel } from "@/types/logs";

/**
 * 관리자 이메일 목록 가져오기
 */
export function getAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS;
  if (!adminEmails) {
    return [];
  }

  return adminEmails
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0 && email.includes("@"));
}

/**
 * 로그 레벨 가져오기
 */
export function getLogLevel(): LogLevel {
  const logLevel = process.env.LOG_LEVEL as LogLevel;
  const validLevels: LogLevel[] = ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"];

  if (logLevel && validLevels.includes(logLevel)) {
    return logLevel;
  }

  return "INFO"; // 기본값
}

/**
 * 로그 보존 기간 가져오기 (일 단위)
 */
export function getLogRetentionDays(): number {
  const retentionDays = process.env.LOG_RETENTION_DAYS;
  if (!retentionDays) {
    return 90; // 기본값: 90일
  }

  const days = parseInt(retentionDays, 10);
  if (isNaN(days) || days < 1) {
    return 90;
  }

  return days;
}

/**
 * 로그 디버그 모드 확인
 */
export function isLogDebugMode(): boolean {
  return process.env.LOG_DEBUG === "true";
}

/**
 * 인증 환경 변수 검증
 */
export function validateAuthEnvironment() {
  const requiredVars = {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error("❌ 누락된 환경 변수:", missingVars);
    return false;
  }

  // Google OAuth ID 형식 검증
  const googleId = process.env.AUTH_GOOGLE_ID;
  if (googleId && !googleId.endsWith(".apps.googleusercontent.com")) {
    console.error("❌ Google OAuth ID 형식이 올바르지 않습니다");
    return false;
  }

  // NEXTAUTH_URL 형식 검증
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl && !nextAuthUrl.startsWith("http")) {
    console.error("❌ NEXTAUTH_URL이 http/https로 시작하지 않습니다");
    return false;
  }

  console.log("✅ 모든 필수 환경 변수가 설정되었습니다");
  return true;
}

/**
 * 인증 환경 변수 로그
 */
export function logAuthEnvironment() {
  console.log("🔧 인증 환경 변수 상태:");
  console.log(
    "- AUTH_SECRET:",
    process.env.AUTH_SECRET ? "✅ 설정됨" : "❌ 누락",
  );
  console.log(
    "- AUTH_GOOGLE_ID:",
    process.env.AUTH_GOOGLE_ID ? "✅ 설정됨" : "❌ 누락",
  );
  console.log(
    "- AUTH_GOOGLE_SECRET:",
    process.env.AUTH_GOOGLE_SECRET ? "✅ 설정됨" : "❌ 누락",
  );
  console.log(
    "- AUTH_GITHUB_ID:",
    process.env.AUTH_GITHUB_ID ? "✅ 설정됨" : "❌ 누락",
  );
  console.log(
    "- AUTH_GITHUB_SECRET:",
    process.env.AUTH_GITHUB_SECRET ? "✅ 설정됨" : "❌ 누락",
  );
  console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "❌ 누락");
  console.log("- NODE_ENV:", process.env.NODE_ENV);
}
