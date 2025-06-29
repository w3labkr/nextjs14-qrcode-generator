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
