import {
  getAdminEmails,
  getLogLevel,
  getLogRetentionDays,
} from "@/lib/env-validation";
import type { LogLevel } from "@/types/logs";

// 추가 환경 변수 검증 함수들
function getNodeEnv(): string {
  return process.env.NODE_ENV || "development";
}

function getPort(): number {
  const port = process.env.PORT;
  if (!port) return 3000;
  const parsed = parseInt(port, 10);
  return isNaN(parsed) || parsed < 1 || parsed > 65535 ? 3000 : parsed;
}

function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || "";
}

function getJwtSecret(): string {
  return process.env.JWT_SECRET || "";
}

function getRedisUrl(): string {
  return process.env.REDIS_URL || "";
}

function getMaxFileSize(): number {
  const size = process.env.MAX_FILE_SIZE;
  if (!size) return 10 * 1024 * 1024; // 10MB 기본값
  const parsed = parseInt(size, 10);
  return isNaN(parsed) || parsed < 1 ? 10 * 1024 * 1024 : parsed;
}

function getRateLimitWindow(): number {
  const window = process.env.RATE_LIMIT_WINDOW;
  if (!window) return 60 * 1000; // 1분 기본값
  const parsed = parseInt(window, 10);
  return isNaN(parsed) || parsed < 1 ? 60 * 1000 : parsed;
}

function getRateLimitMax(): number {
  const max = process.env.RATE_LIMIT_MAX;
  if (!max) return 100; // 100 요청 기본값
  const parsed = parseInt(max, 10);
  return isNaN(parsed) || parsed < 1 ? 100 : parsed;
}

function getSessionTimeout(): number {
  const timeout = process.env.SESSION_TIMEOUT;
  if (!timeout) return 24 * 60 * 60 * 1000; // 24시간 기본값
  const parsed = parseInt(timeout, 10);
  return isNaN(parsed) || parsed < 1 ? 24 * 60 * 60 * 1000 : parsed;
}

function getCorsOrigins(): string[] {
  const origins = process.env.CORS_ORIGINS;
  if (!origins) return ["http://localhost:3000"];
  return origins
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function getSmtpHost(): string {
  return process.env.SMTP_HOST || "";
}

function getSmtpPort(): number {
  const port = process.env.SMTP_PORT;
  if (!port) return 587;
  const parsed = parseInt(port, 10);
  return isNaN(parsed) || parsed < 1 || parsed > 65535 ? 587 : parsed;
}

function getSmtpUser(): string {
  return process.env.SMTP_USER || "";
}

function getSmtpPassword(): string {
  return process.env.SMTP_PASSWORD || "";
}

function getCloudinaryUrl(): string {
  return process.env.CLOUDINARY_URL || "";
}

function getAwsAccessKey(): string {
  return process.env.AWS_ACCESS_KEY_ID || "";
}

function getAwsSecretKey(): string {
  return process.env.AWS_SECRET_ACCESS_KEY || "";
}

function getAwsRegion(): string {
  return process.env.AWS_REGION || "us-east-1";
}

function getS3BucketName(): string {
  return process.env.S3_BUCKET_NAME || "";
}

function getEncryptionKey(): string {
  return process.env.ENCRYPTION_KEY || "";
}

function isProduction(): boolean {
  return getNodeEnv() === "production";
}

function isDevelopment(): boolean {
  return getNodeEnv() === "development";
}

function isTest(): boolean {
  return getNodeEnv() === "test";
}

function validateRequiredEnvVars(): { valid: boolean; missing: string[] } {
  const required = ["DATABASE_URL", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  return {
    valid: missing.length === 0,
    missing,
  };
}

function validateEmailConfig(): boolean {
  const smtp = getSmtpHost();
  const user = getSmtpUser();
  const pass = getSmtpPassword();
  return smtp.length > 0 && user.length > 0 && pass.length > 0;
}

function validateAwsConfig(): boolean {
  const accessKey = getAwsAccessKey();
  const secretKey = getAwsSecretKey();
  const region = getAwsRegion();
  const bucket = getS3BucketName();
  return accessKey.length > 0 && secretKey.length > 0 && region.length > 0 && bucket.length > 0;
}

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

  describe("Extended Environment Validation", () => {
    describe("getNodeEnv", () => {
      it("NODE_ENV가 설정되지 않으면 development를 반환해야 한다", () => {
        delete process.env.NODE_ENV;
        expect(getNodeEnv()).toBe("development");
      });

      it("NODE_ENV가 production이면 production을 반환해야 한다", () => {
        process.env.NODE_ENV = "production";
        expect(getNodeEnv()).toBe("production");
      });

      it("NODE_ENV가 test이면 test를 반환해야 한다", () => {
        process.env.NODE_ENV = "test";
        expect(getNodeEnv()).toBe("test");
      });
    });

    describe("getPort", () => {
      it("PORT가 설정되지 않으면 3000을 반환해야 한다", () => {
        delete process.env.PORT;
        expect(getPort()).toBe(3000);
      });

      it("유효한 포트 번호를 반환해야 한다", () => {
        process.env.PORT = "8080";
        expect(getPort()).toBe(8080);
      });

      it("포트 번호가 1보다 작으면 3000을 반환해야 한다", () => {
        process.env.PORT = "0";
        expect(getPort()).toBe(3000);
      });

      it("포트 번호가 65535보다 크면 3000을 반환해야 한다", () => {
        process.env.PORT = "65536";
        expect(getPort()).toBe(3000);
      });

      it("포트 번호가 숫자가 아니면 3000을 반환해야 한다", () => {
        process.env.PORT = "invalid";
        expect(getPort()).toBe(3000);
      });
    });

    describe("getDatabaseUrl", () => {
      it("DATABASE_URL이 설정되지 않으면 빈 문자열을 반환해야 한다", () => {
        delete process.env.DATABASE_URL;
        expect(getDatabaseUrl()).toBe("");
      });

      it("DATABASE_URL을 반환해야 한다", () => {
        process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
        expect(getDatabaseUrl()).toBe("postgresql://user:pass@localhost:5432/db");
      });
    });

    describe("getMaxFileSize", () => {
      it("MAX_FILE_SIZE가 설정되지 않으면 10MB를 반환해야 한다", () => {
        delete process.env.MAX_FILE_SIZE;
        expect(getMaxFileSize()).toBe(10 * 1024 * 1024);
      });

      it("유효한 파일 크기를 반환해야 한다", () => {
        process.env.MAX_FILE_SIZE = "5242880"; // 5MB
        expect(getMaxFileSize()).toBe(5242880);
      });

      it("파일 크기가 1보다 작으면 기본값을 반환해야 한다", () => {
        process.env.MAX_FILE_SIZE = "0";
        expect(getMaxFileSize()).toBe(10 * 1024 * 1024);
      });

      it("파일 크기가 숫자가 아니면 기본값을 반환해야 한다", () => {
        process.env.MAX_FILE_SIZE = "invalid";
        expect(getMaxFileSize()).toBe(10 * 1024 * 1024);
      });
    });

    describe("getRateLimitWindow", () => {
      it("RATE_LIMIT_WINDOW가 설정되지 않으면 1분을 반환해야 한다", () => {
        delete process.env.RATE_LIMIT_WINDOW;
        expect(getRateLimitWindow()).toBe(60 * 1000);
      });

      it("유효한 윈도우 시간을 반환해야 한다", () => {
        process.env.RATE_LIMIT_WINDOW = "120000"; // 2분
        expect(getRateLimitWindow()).toBe(120000);
      });

      it("윈도우 시간이 1보다 작으면 기본값을 반환해야 한다", () => {
        process.env.RATE_LIMIT_WINDOW = "0";
        expect(getRateLimitWindow()).toBe(60 * 1000);
      });
    });

    describe("getRateLimitMax", () => {
      it("RATE_LIMIT_MAX가 설정되지 않으면 100을 반환해야 한다", () => {
        delete process.env.RATE_LIMIT_MAX;
        expect(getRateLimitMax()).toBe(100);
      });

      it("유효한 최대 요청 수를 반환해야 한다", () => {
        process.env.RATE_LIMIT_MAX = "200";
        expect(getRateLimitMax()).toBe(200);
      });

      it("최대 요청 수가 1보다 작으면 기본값을 반환해야 한다", () => {
        process.env.RATE_LIMIT_MAX = "0";
        expect(getRateLimitMax()).toBe(100);
      });
    });

    describe("getSessionTimeout", () => {
      it("SESSION_TIMEOUT이 설정되지 않으면 24시간을 반환해야 한다", () => {
        delete process.env.SESSION_TIMEOUT;
        expect(getSessionTimeout()).toBe(24 * 60 * 60 * 1000);
      });

      it("유효한 세션 타임아웃을 반환해야 한다", () => {
        process.env.SESSION_TIMEOUT = "3600000"; // 1시간
        expect(getSessionTimeout()).toBe(3600000);
      });

      it("세션 타임아웃이 1보다 작으면 기본값을 반환해야 한다", () => {
        process.env.SESSION_TIMEOUT = "0";
        expect(getSessionTimeout()).toBe(24 * 60 * 60 * 1000);
      });
    });

    describe("getCorsOrigins", () => {
      it("CORS_ORIGINS가 설정되지 않으면 localhost를 반환해야 한다", () => {
        delete process.env.CORS_ORIGINS;
        expect(getCorsOrigins()).toEqual(["http://localhost:3000"]);
      });

      it("단일 오리진을 반환해야 한다", () => {
        process.env.CORS_ORIGINS = "https://example.com";
        expect(getCorsOrigins()).toEqual(["https://example.com"]);
      });

      it("여러 오리진을 반환해야 한다", () => {
        process.env.CORS_ORIGINS = "https://example.com,https://api.example.com";
        expect(getCorsOrigins()).toEqual(["https://example.com", "https://api.example.com"]);
      });

      it("공백이 있는 오리진을 처리해야 한다", () => {
        process.env.CORS_ORIGINS = " https://example.com , https://api.example.com ";
        expect(getCorsOrigins()).toEqual(["https://example.com", "https://api.example.com"]);
      });

      it("빈 오리진을 필터링해야 한다", () => {
        process.env.CORS_ORIGINS = "https://example.com,,https://api.example.com";
        expect(getCorsOrigins()).toEqual(["https://example.com", "https://api.example.com"]);
      });
    });

    describe("getSmtpPort", () => {
      it("SMTP_PORT가 설정되지 않으면 587을 반환해야 한다", () => {
        delete process.env.SMTP_PORT;
        expect(getSmtpPort()).toBe(587);
      });

      it("유효한 SMTP 포트를 반환해야 한다", () => {
        process.env.SMTP_PORT = "25";
        expect(getSmtpPort()).toBe(25);
      });

      it("포트가 범위를 벗어나면 기본값을 반환해야 한다", () => {
        process.env.SMTP_PORT = "70000";
        expect(getSmtpPort()).toBe(587);
      });
    });

    describe("getAwsRegion", () => {
      it("AWS_REGION이 설정되지 않으면 us-east-1을 반환해야 한다", () => {
        delete process.env.AWS_REGION;
        expect(getAwsRegion()).toBe("us-east-1");
      });

      it("설정된 AWS 리전을 반환해야 한다", () => {
        process.env.AWS_REGION = "ap-northeast-1";
        expect(getAwsRegion()).toBe("ap-northeast-1");
      });
    });

    describe("환경 상태 확인 함수", () => {
      it("isProduction이 올바르게 작동해야 한다", () => {
        process.env.NODE_ENV = "production";
        expect(isProduction()).toBe(true);

        process.env.NODE_ENV = "development";
        expect(isProduction()).toBe(false);
      });

      it("isDevelopment가 올바르게 작동해야 한다", () => {
        process.env.NODE_ENV = "development";
        expect(isDevelopment()).toBe(true);

        process.env.NODE_ENV = "production";
        expect(isDevelopment()).toBe(false);
      });

      it("isTest가 올바르게 작동해야 한다", () => {
        process.env.NODE_ENV = "test";
        expect(isTest()).toBe(true);

        process.env.NODE_ENV = "production";
        expect(isTest()).toBe(false);
      });
    });

    describe("validateRequiredEnvVars", () => {
      it("모든 필수 환경 변수가 설정되면 유효해야 한다", () => {
        process.env.DATABASE_URL = "postgresql://localhost:5432/db";
        process.env.JWT_SECRET = "secret-key";

        const result = validateRequiredEnvVars();
        expect(result.valid).toBe(true);
        expect(result.missing).toEqual([]);
      });

      it("필수 환경 변수가 누락되면 무효해야 한다", () => {
        delete process.env.DATABASE_URL;
        delete process.env.JWT_SECRET;

        const result = validateRequiredEnvVars();
        expect(result.valid).toBe(false);
        expect(result.missing).toEqual(["DATABASE_URL", "JWT_SECRET"]);
      });

      it("일부 필수 환경 변수가 누락되면 무효해야 한다", () => {
        process.env.DATABASE_URL = "postgresql://localhost:5432/db";
        delete process.env.JWT_SECRET;

        const result = validateRequiredEnvVars();
        expect(result.valid).toBe(false);
        expect(result.missing).toEqual(["JWT_SECRET"]);
      });
    });

    describe("validateEmailConfig", () => {
      it("모든 SMTP 설정이 있으면 유효해야 한다", () => {
        process.env.SMTP_HOST = "smtp.gmail.com";
        process.env.SMTP_USER = "user@gmail.com";
        process.env.SMTP_PASSWORD = "password";

        expect(validateEmailConfig()).toBe(true);
      });

      it("SMTP 설정이 누락되면 무효해야 한다", () => {
        delete process.env.SMTP_HOST;
        delete process.env.SMTP_USER;
        delete process.env.SMTP_PASSWORD;

        expect(validateEmailConfig()).toBe(false);
      });

      it("일부 SMTP 설정이 누락되면 무효해야 한다", () => {
        process.env.SMTP_HOST = "smtp.gmail.com";
        process.env.SMTP_USER = "user@gmail.com";
        delete process.env.SMTP_PASSWORD;

        expect(validateEmailConfig()).toBe(false);
      });
    });

    describe("validateAwsConfig", () => {
      it("모든 AWS 설정이 있으면 유효해야 한다", () => {
        process.env.AWS_ACCESS_KEY_ID = "access-key";
        process.env.AWS_SECRET_ACCESS_KEY = "secret-key";
        process.env.AWS_REGION = "us-east-1";
        process.env.S3_BUCKET_NAME = "my-bucket";

        expect(validateAwsConfig()).toBe(true);
      });

      it("AWS 설정이 누락되면 무효해야 한다", () => {
        delete process.env.AWS_ACCESS_KEY_ID;
        delete process.env.AWS_SECRET_ACCESS_KEY;
        delete process.env.AWS_REGION;
        delete process.env.S3_BUCKET_NAME;

        expect(validateAwsConfig()).toBe(false);
      });

      it("일부 AWS 설정이 누락되면 무효해야 한다", () => {
        process.env.AWS_ACCESS_KEY_ID = "access-key";
        process.env.AWS_SECRET_ACCESS_KEY = "secret-key";
        process.env.AWS_REGION = "us-east-1";
        delete process.env.S3_BUCKET_NAME;

        expect(validateAwsConfig()).toBe(false);
      });
    });

    describe("보안 관련 환경 변수", () => {
      it("JwtSecret이 빈 문자열이면 빈 문자열을 반환해야 한다", () => {
        delete process.env.JWT_SECRET;
        expect(getJwtSecret()).toBe("");
      });

      it("EncryptionKey가 빈 문자열이면 빈 문자열을 반환해야 한다", () => {
        delete process.env.ENCRYPTION_KEY;
        expect(getEncryptionKey()).toBe("");
      });

      it("Redis URL이 빈 문자열이면 빈 문자열을 반환해야 한다", () => {
        delete process.env.REDIS_URL;
        expect(getRedisUrl()).toBe("");
      });
    });

    describe("클라우드 서비스 설정", () => {
      it("Cloudinary URL이 빈 문자열이면 빈 문자열을 반환해야 한다", () => {
        delete process.env.CLOUDINARY_URL;
        expect(getCloudinaryUrl()).toBe("");
      });

      it("AWS Access Key가 빈 문자열이면 빈 문자열을 반환해야 한다", () => {
        delete process.env.AWS_ACCESS_KEY_ID;
        expect(getAwsAccessKey()).toBe("");
      });

      it("AWS Secret Key가 빈 문자열이면 빈 문자열을 반환해야 한다", () => {
        delete process.env.AWS_SECRET_ACCESS_KEY;
        expect(getAwsSecretKey()).toBe("");
      });

      it("S3 Bucket Name이 빈 문자열이면 빈 문자열을 반환해야 한다", () => {
        delete process.env.S3_BUCKET_NAME;
        expect(getS3BucketName()).toBe("");
      });
    });

    describe("이메일 설정", () => {
      it("SMTP Host가 빈 문자열이면 빈 문자열을 반환해야 한다", () => {
        delete process.env.SMTP_HOST;
        expect(getSmtpHost()).toBe("");
      });

      it("SMTP User가 빈 문자열이면 빈 문자열을 반환해야 한다", () => {
        delete process.env.SMTP_USER;
        expect(getSmtpUser()).toBe("");
      });

      it("SMTP Password가 빈 문자열이면 빈 문자열을 반환해야 한다", () => {
        delete process.env.SMTP_PASSWORD;
        expect(getSmtpPassword()).toBe("");
      });
    });
  });
});
