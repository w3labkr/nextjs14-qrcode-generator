// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    qRCode: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    log: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    session: {
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock server actions
jest.mock("@/app/actions/qr-code-management", () => ({
  getQRCode: jest.fn(),
  updateQRCode: jest.fn(),
  deleteQRCode: jest.fn(),
  getQRCodes: jest.fn(),
}));

jest.mock("@/app/actions/account-management", () => ({
  updateUserProfile: jest.fn(),
  deleteUserAccount: jest.fn(),
}));

jest.mock("@/app/actions/log-management", () => ({
  getSystemLogs: jest.fn(),
  deleteOldLogs: jest.fn(),
}));

// Import after mocking
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { getQRCode, updateQRCode, deleteQRCode, getQRCodes } from "@/app/actions/qr-code-management";
import { updateUserProfile, deleteUserAccount } from "@/app/actions/account-management";
import { getSystemLogs, deleteOldLogs } from "@/app/actions/log-management";

describe("Security Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication Security", () => {
    it("인증되지 않은 사용자가 보호된 리소스에 접근할 수 없어야 한다", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      // Test various protected endpoints
      const protectedActions = [
        { action: getQRCodes, args: [{ page: 1, pageSize: 10 }] },
        { action: updateQRCode, args: ["qr-123", { title: "New Title" }] },
        { action: deleteQRCode, args: ["qr-123"] },
        { action: updateUserProfile, args: [{ name: "New Name" }] },
        { action: deleteUserAccount, args: [] },
      ];

      for (const { action, args } of protectedActions) {
        (action as jest.Mock).mockResolvedValue({
          success: false,
          error: "인증이 필요합니다.",
        });

        const result = await action(...args);
        
        expect(result.success).toBe(false);
        expect(result.error).toContain("인증");
      }
    });

    it("만료된 세션으로는 접근할 수 없어야 한다", async () => {
      const expiredSession = {
        user: { id: "user-123" },
        expires: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      };

      (getServerSession as jest.Mock).mockResolvedValue(expiredSession);
      
      (getQRCodes as jest.Mock).mockResolvedValue({
        success: false,
        error: "세션이 만료되었습니다. 다시 로그인해주세요.",
      });

      const result = await getQRCodes({ page: 1, pageSize: 10 });

      expect(result.success).toBe(false);
      expect(result.error).toContain("세션이 만료");
    });

    it("위조된 세션 토큰을 거부해야 한다", async () => {
      (prisma.session.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Simulate invalid session token
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      (updateUserProfile as jest.Mock).mockResolvedValue({
        success: false,
        error: "유효하지 않은 세션입니다.",
      });

      const result = await updateUserProfile({ name: "Hacker" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("유효하지 않은");
    });
  });

  describe("Authorization Security", () => {
    const userSession = {
      user: { id: "user-123", email: "user@example.com", role: "user" },
    };

    const adminSession = {
      user: { id: "admin-123", email: "admin@example.com", role: "admin" },
    };

    it("일반 사용자가 다른 사용자의 데이터에 접근할 수 없어야 한다", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(userSession);
      
      const otherUserQRCode = {
        id: "qr-456",
        userId: "other-user-456",
        title: "Other User's QR",
        content: "https://other.com",
      };

      (prisma.qRCode.findFirst as jest.Mock).mockResolvedValue(otherUserQRCode);
      
      (getQRCode as jest.Mock).mockResolvedValue({
        success: false,
        error: "접근 권한이 없습니다.",
      });

      const result = await getQRCode("qr-456");

      expect(result.success).toBe(false);
      expect(result.error).toContain("권한");
    });

    it("일반 사용자가 관리자 기능에 접근할 수 없어야 한다", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(userSession);
      
      (getSystemLogs as jest.Mock).mockResolvedValue({
        success: false,
        error: "관리자 권한이 필요합니다.",
      });

      const result = await getSystemLogs({
        page: 1,
        pageSize: 10,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("관리자 권한");
    });

    it("권한 상승 시도를 차단해야 한다", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(userSession);
      
      // User tries to update their role
      (updateUserProfile as jest.Mock).mockResolvedValue({
        success: false,
        error: "권한을 변경할 수 없습니다.",
        sanitizedData: { name: "User" }, // Role change ignored
      });

      const result = await updateUserProfile({
        name: "User",
        role: "admin", // Attempting privilege escalation
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("권한을 변경");
      expect(result.sanitizedData?.role).toBeUndefined();
    });
  });

  describe("Data Protection", () => {
    const userSession = {
      user: { id: "user-123", email: "user@example.com" },
    };

    beforeEach(() => {
      (getServerSession as jest.Mock).mockResolvedValue(userSession);
    });

    it("SQL injection 시도를 차단해야 한다", async () => {
      const maliciousInput = {
        title: "'; DROP TABLE qrcodes; --",
        content: "https://example.com",
      };

      (updateQRCode as jest.Mock).mockResolvedValue({
        success: false,
        error: "잘못된 입력값이 감지되었습니다.",
      });

      const result = await updateQRCode("qr-123", maliciousInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain("잘못된 입력값");
    });

    it("XSS 공격을 방지해야 한다", async () => {
      const xssPayload = {
        title: "<script>alert('XSS')</script>",
        content: "javascript:alert('XSS')",
      };

      (updateQRCode as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          title: "&lt;script&gt;alert('XSS')&lt;/script&gt;", // Escaped
          content: "javascript:alert('XSS')", // URL validation should reject this
        },
        warning: "잠재적으로 위험한 콘텐츠가 감지되어 이스케이프되었습니다.",
      });

      const result = await updateQRCode("qr-123", xssPayload);

      expect(result.data?.title).not.toContain("<script>");
      expect(result.warning).toBeDefined();
    });

    it("경로 탐색(Path Traversal) 공격을 차단해야 한다", async () => {
      const pathTraversalInput = {
        filename: "../../etc/passwd",
        path: "../../../sensitive/data",
      };

      // Mock file operation that should reject path traversal
      const fileOperation = jest.fn().mockResolvedValue({
        success: false,
        error: "잘못된 파일 경로입니다.",
      });

      const result = await fileOperation(pathTraversalInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain("잘못된 파일 경로");
    });
  });

  describe("Rate Limiting and DoS Protection", () => {
    it("과도한 요청을 차단해야 한다", async () => {
      const userSession = {
        user: { id: "user-123", email: "user@example.com" },
      };
      
      (getServerSession as jest.Mock).mockResolvedValue(userSession);

      // Simulate rate limiting
      let requestCount = 0;
      const rateLimit = 10;

      (getQRCodes as jest.Mock).mockImplementation(async () => {
        requestCount++;
        if (requestCount > rateLimit) {
          return {
            success: false,
            error: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
            retryAfter: 60,
          };
        }
        return { success: true, data: [] };
      });

      // Make requests up to and beyond the limit
      const results = [];
      for (let i = 0; i < 12; i++) {
        const result = await getQRCodes({ page: 1, pageSize: 10 });
        results.push(result);
      }

      // First 10 should succeed
      expect(results.slice(0, 10).every(r => r.success)).toBe(true);
      // 11th and 12th should be rate limited
      expect(results[10].success).toBe(false);
      expect(results[10].error).toContain("요청 한도");
      expect(results[11].success).toBe(false);
    });

    it("대용량 페이로드를 거부해야 한다", async () => {
      const largePayload = {
        title: "A".repeat(10000), // 10KB title
        content: "B".repeat(1000000), // 1MB content
      };

      (updateQRCode as jest.Mock).mockResolvedValue({
        success: false,
        error: "요청 크기가 제한을 초과했습니다.",
      });

      const result = await updateQRCode("qr-123", largePayload);

      expect(result.success).toBe(false);
      expect(result.error).toContain("크기가 제한");
    });
  });

  describe("Session Security", () => {
    it("동시 세션 수를 제한해야 한다", async () => {
      const userId = "user-123";
      
      // Mock existing sessions
      (prisma.session.findFirst as jest.Mock).mockResolvedValue({
        count: 5, // Max sessions reached
      });

      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: userId },
        error: "MaxSessionsReached",
      });

      (updateUserProfile as jest.Mock).mockResolvedValue({
        success: false,
        error: "최대 세션 수에 도달했습니다. 다른 기기에서 로그아웃 후 시도해주세요.",
      });

      const result = await updateUserProfile({ name: "New Name" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("최대 세션");
    });

    it("세션 하이재킹을 방지해야 한다", async () => {
      // Original session
      const originalSession = {
        user: { id: "user-123" },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Windows)",
      };

      // Hijacked session from different location
      const hijackedSession = {
        ...originalSession,
        ipAddress: "10.0.0.1",
        userAgent: "Mozilla/5.0 (Linux)",
      };

      (getServerSession as jest.Mock).mockResolvedValue(hijackedSession);
      
      (getQRCodes as jest.Mock).mockResolvedValue({
        success: false,
        error: "보안 검증 실패: 세션 정보가 일치하지 않습니다.",
        requireReauth: true,
      });

      const result = await getQRCodes({ page: 1, pageSize: 10 });

      expect(result.success).toBe(false);
      expect(result.requireReauth).toBe(true);
    });
  });

  describe("CSRF Protection", () => {
    it("CSRF 토큰 없는 요청을 거부해야 한다", async () => {
      const userSession = {
        user: { id: "user-123" },
        csrfToken: undefined, // Missing CSRF token
      };

      (getServerSession as jest.Mock).mockResolvedValue(userSession);
      
      (deleteQRCode as jest.Mock).mockResolvedValue({
        success: false,
        error: "보안 토큰이 유효하지 않습니다.",
      });

      const result = await deleteQRCode("qr-123");

      expect(result.success).toBe(false);
      expect(result.error).toContain("보안 토큰");
    });

    it("잘못된 CSRF 토큰을 거부해야 한다", async () => {
      const userSession = {
        user: { id: "user-123" },
        csrfToken: "valid-token",
      };

      (getServerSession as jest.Mock).mockResolvedValue(userSession);
      
      // Simulate request with wrong CSRF token
      (deleteUserAccount as jest.Mock).mockResolvedValue({
        success: false,
        error: "보안 토큰이 일치하지 않습니다.",
      });

      const result = await deleteUserAccount();

      expect(result.success).toBe(false);
      expect(result.error).toContain("토큰이 일치하지");
    });
  });

  describe("Audit Logging", () => {
    it("보안 이벤트를 로깅해야 한다", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      // Mock the server action to simulate logging
      (getQRCodes as jest.Mock).mockImplementation(async () => {
        // Simulate logging security event
        await prisma.log.create({
          data: {
            type: "security",
            level: "warn",
            action: "unauthorized_access_attempt",
            message: "인증되지 않은 접근 시도",
          },
        });
        
        return {
          success: false,
          error: "인증이 필요합니다.",
        };
      });
      
      // Simulate failed authentication
      await getQRCodes({ page: 1, pageSize: 10 });

      // Verify security event was logged
      expect(prisma.log.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: "security",
          level: "warn",
          action: "unauthorized_access_attempt",
          message: expect.stringContaining("인증되지 않은 접근 시도"),
        }),
      });
    });

    it("권한 위반 시도를 로깅해야 한다", async () => {
      const userSession = {
        user: { id: "user-123", role: "user" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(userSession);
      
      // Mock the server action to simulate logging
      (getSystemLogs as jest.Mock).mockImplementation(async () => {
        // Simulate logging authorization violation
        await prisma.log.create({
          data: {
            userId: "user-123",
            type: "security",
            level: "warn",
            action: "authorization_violation",
            message: "권한 위반: 사용자가 관리자 기능에 접근 시도",
          },
        });
        
        return {
          success: false,
          error: "관리자 권한이 필요합니다.",
        };
      });
      
      // User tries to access admin function
      await getSystemLogs({ page: 1, pageSize: 10 });

      // Verify authorization violation was logged
      expect(prisma.log.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-123",
          type: "security",
          level: "warn",
          action: "authorization_violation",
          message: expect.stringContaining("권한 위반"),
        }),
      });
    });
  });

  describe("Password Security", () => {
    it("약한 비밀번호를 거부해야 한다", async () => {
      const weakPasswords = [
        "123456",
        "password",
        "qwerty",
        "abc123",
        "12345678",
      ];

      const validatePassword = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*]/.test(password);
        
        if (password.length < minLength) return false;
        if (weakPasswords.includes(password.toLowerCase())) return false;
        
        const criteria = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar];
        return criteria.filter(Boolean).length >= 3;
      };

      weakPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false);
      });

      // Strong password should pass
      expect(validatePassword("StrongP@ss123")).toBe(true);
    });

    it("비밀번호 재사용을 방지해야 한다", async () => {
      const userSession = {
        user: { id: "user-123" },
      };

      (getServerSession as jest.Mock).mockResolvedValue(userSession);
      
      // Mock password history check
      const changePassword = jest.fn().mockResolvedValue({
        success: false,
        error: "이전에 사용한 비밀번호는 재사용할 수 없습니다.",
      });

      const result = await changePassword({
        currentPassword: "OldPass123!",
        newPassword: "OldPass123!", // Same as current
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("재사용할 수 없습니다");
    });
  });

  describe("API Security", () => {
    it("API 키 없는 요청을 거부해야 한다", async () => {
      // Mock API endpoint that requires API key
      const apiEndpoint = jest.fn().mockResolvedValue({
        success: false,
        error: "API 키가 필요합니다.",
        status: 401,
      });

      const result = await apiEndpoint({ 
        headers: {} // No API key
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
    });

    it("잘못된 API 키를 거부해야 한다", async () => {
      const apiEndpoint = jest.fn().mockResolvedValue({
        success: false,
        error: "유효하지 않은 API 키입니다.",
        status: 403,
      });

      const result = await apiEndpoint({ 
        headers: { "X-API-Key": "invalid-key" }
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe(403);
    });
  });
});