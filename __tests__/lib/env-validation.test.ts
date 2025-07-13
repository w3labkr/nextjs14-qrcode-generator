import {
  getAdminEmails,
  getLogLevel,
  getLogRetentionDays,
} from "@/lib/env-validation";
import type { LogLevel } from "@/types/logs";

describe("Environment Validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getAdminEmails", () => {
    it("환경 변수가 없으면 빈 배열을 반환해야 한다", () => {
      delete process.env.ADMIN_EMAILS;
      const result = getAdminEmails();
      expect(result).toEqual([]);
    });

    it("단일 이메일 주소를 반환해야 한다", () => {
      process.env.ADMIN_EMAILS = "admin@example.com";
      const result = getAdminEmails();
      expect(result).toEqual(["admin@example.com"]);
    });

    it("여러 이메일 주소를 쉼표로 분리하여 반환해야 한다", () => {
      process.env.ADMIN_EMAILS =
        "admin1@example.com,admin2@example.com,admin3@example.com";
      const result = getAdminEmails();
      expect(result).toEqual([
        "admin1@example.com",
        "admin2@example.com",
        "admin3@example.com",
      ]);
    });

    it("공백이 포함된 이메일을 정리해야 한다", () => {
      process.env.ADMIN_EMAILS =
        " admin1@example.com , admin2@example.com , admin3@example.com ";
      const result = getAdminEmails();
      expect(result).toEqual([
        "admin1@example.com",
        "admin2@example.com",
        "admin3@example.com",
      ]);
    });

    it("빈 이메일 항목을 필터링해야 한다", () => {
      process.env.ADMIN_EMAILS =
        "admin1@example.com,,admin2@example.com, ,admin3@example.com";
      const result = getAdminEmails();
      expect(result).toEqual([
        "admin1@example.com",
        "admin2@example.com",
        "admin3@example.com",
      ]);
    });

    it("@가 없는 잘못된 이메일을 필터링해야 한다", () => {
      process.env.ADMIN_EMAILS =
        "admin1@example.com,invalid-email,admin2@example.com";
      const result = getAdminEmails();
      expect(result).toEqual(["admin1@example.com", "admin2@example.com"]);
    });

    it("모든 이메일이 잘못된 경우 빈 배열을 반환해야 한다", () => {
      process.env.ADMIN_EMAILS = "invalid-email1,invalid-email2";
      const result = getAdminEmails();
      expect(result).toEqual([]);
    });

    it("빈 문자열인 경우 빈 배열을 반환해야 한다", () => {
      process.env.ADMIN_EMAILS = "";
      const result = getAdminEmails();
      expect(result).toEqual([]);
    });

    it("공백만 있는 경우 빈 배열을 반환해야 한다", () => {
      process.env.ADMIN_EMAILS = "   ";
      const result = getAdminEmails();
      expect(result).toEqual([]);
    });
  });

  describe("getLogLevel", () => {
    it("환경 변수가 없으면 기본값 INFO를 반환해야 한다", () => {
      delete process.env.LOG_LEVEL;
      const result = getLogLevel();
      expect(result).toBe("INFO");
    });

    it("유효한 DEBUG 로그 레벨을 반환해야 한다", () => {
      process.env.LOG_LEVEL = "DEBUG";
      const result = getLogLevel();
      expect(result).toBe("DEBUG");
    });

    it("유효한 INFO 로그 레벨을 반환해야 한다", () => {
      process.env.LOG_LEVEL = "INFO";
      const result = getLogLevel();
      expect(result).toBe("INFO");
    });

    it("유효한 WARN 로그 레벨을 반환해야 한다", () => {
      process.env.LOG_LEVEL = "WARN";
      const result = getLogLevel();
      expect(result).toBe("WARN");
    });

    it("유효한 ERROR 로그 레벨을 반환해야 한다", () => {
      process.env.LOG_LEVEL = "ERROR";
      const result = getLogLevel();
      expect(result).toBe("ERROR");
    });

    it("유효한 FATAL 로그 레벨을 반환해야 한다", () => {
      process.env.LOG_LEVEL = "FATAL";
      const result = getLogLevel();
      expect(result).toBe("FATAL");
    });

    it("잘못된 로그 레벨이면 기본값 INFO를 반환해야 한다", () => {
      process.env.LOG_LEVEL = "INVALID";
      const result = getLogLevel();
      expect(result).toBe("INFO");
    });

    it("소문자 로그 레벨이면 기본값 INFO를 반환해야 한다", () => {
      process.env.LOG_LEVEL = "debug";
      const result = getLogLevel();
      expect(result).toBe("INFO");
    });

    it("빈 문자열이면 기본값 INFO를 반환해야 한다", () => {
      process.env.LOG_LEVEL = "";
      const result = getLogLevel();
      expect(result).toBe("INFO");
    });
  });

  describe("getLogRetentionDays", () => {
    it("환경 변수가 없으면 기본값 90을 반환해야 한다", () => {
      delete process.env.LOG_RETENTION_DAYS;
      const result = getLogRetentionDays();
      expect(result).toBe(90);
    });

    it("유효한 숫자를 반환해야 한다", () => {
      process.env.LOG_RETENTION_DAYS = "30";
      const result = getLogRetentionDays();
      expect(result).toBe(30);
    });

    it("큰 숫자를 반환해야 한다", () => {
      process.env.LOG_RETENTION_DAYS = "365";
      const result = getLogRetentionDays();
      expect(result).toBe(365);
    });

    it("1일을 반환해야 한다", () => {
      process.env.LOG_RETENTION_DAYS = "1";
      const result = getLogRetentionDays();
      expect(result).toBe(1);
    });

    it("숫자가 아니면 기본값 90을 반환해야 한다", () => {
      process.env.LOG_RETENTION_DAYS = "invalid";
      const result = getLogRetentionDays();
      expect(result).toBe(90);
    });

    it("0이면 기본값 90을 반환해야 한다", () => {
      process.env.LOG_RETENTION_DAYS = "0";
      const result = getLogRetentionDays();
      expect(result).toBe(90);
    });

    it("음수이면 기본값 90을 반환해야 한다", () => {
      process.env.LOG_RETENTION_DAYS = "-10";
      const result = getLogRetentionDays();
      expect(result).toBe(90);
    });

    it("소수점이 있으면 정수로 변환해야 한다", () => {
      process.env.LOG_RETENTION_DAYS = "30.5";
      const result = getLogRetentionDays();
      expect(result).toBe(30);
    });

    it("빈 문자열이면 기본값 90을 반환해야 한다", () => {
      process.env.LOG_RETENTION_DAYS = "";
      const result = getLogRetentionDays();
      expect(result).toBe(90);
    });

    it("공백만 있으면 기본값 90을 반환해야 한다", () => {
      process.env.LOG_RETENTION_DAYS = "   ";
      const result = getLogRetentionDays();
      expect(result).toBe(90);
    });
  });
});
