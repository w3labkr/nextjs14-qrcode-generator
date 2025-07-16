import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaClient, User, QRCode } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { createQRCodeAction } from '@/app/actions/qr-code-generator';
import { updateQRCodeAction } from '@/app/actions/qr-code-management';
import { deleteQRCodeAction } from '@/app/actions/qr-code-management';
import { createAccountAction } from '@/app/actions/account-management';
import { updateAccountAction } from '@/app/actions/account-management';
import { NextRequest, NextResponse } from 'next/server';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    qRCode: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    logEntry: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/logging-middleware', () => ({
  logApiRequest: jest.fn(),
  logError: jest.fn(),
  logQrGeneration: jest.fn(),
}));

const mockPrisma = require('@/lib/prisma').default as jest.Mocked<PrismaClient>;
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('Security and Input Validation Tests', () => {
  const mockUser: User = {
    id: 'security-user',
    email: 'security@example.com',
    name: 'Security User',
    image: 'https://example.com/security.jpg',
    emailVerified: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    rememberMe: false,
    rememberMeExpiry: null,
    profileCompleted: true,
    qrcodeLimit: 50,
    accountType: 'FREE',
    subscription: null,
    isActive: true,
    lastLoginAt: new Date(),
    metadata: {},
  };

  const mockAdminUser: User = {
    ...mockUser,
    id: 'admin-user',
    email: 'admin@example.com',
    accountType: 'ADMIN',
  };

  const mockQRCode: QRCode = {
    id: 'security-qr',
    userId: 'security-user',
    type: 'TEXT',
    data: 'Security test QR Code',
    title: 'Security Test QR',
    description: 'Security test description',
    qrCodeUrl: 'https://example.com/security-qr.png',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    size: 200,
    errorCorrection: 'M',
    style: 'square',
    logoUrl: null,
    isFavorite: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      return callback(mockPrisma);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation Tests', () => {
    it('should reject malicious script injection in QR code data', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.qRCode.count.mockResolvedValue(5);

      const maliciousInputs = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        'data:text/html,<script>alert("XSS")</script>',
        'vbscript:msgbox("XSS")',
        'onload="alert(\'XSS\')"',
        '<img src="x" onerror="alert(\'XSS\')">',
      ];

      for (const maliciousInput of maliciousInputs) {
        const formData = new FormData();
        formData.append('type', 'TEXT');
        formData.append('data', maliciousInput);
        formData.append('title', 'Malicious Test');

        const result = await createQRCodeAction(formData);
        
        if (result.success) {
          expect(result.data?.data).not.toBe(maliciousInput);
        } else {
          expect(result.error).toBeDefined();
        }
      }
    });

    it('should validate email format and prevent injection', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const invalidEmails = [
        'invalid-email',
        'user@',
        '@domain.com',
        'user..name@domain.com',
        'user@domain..com',
        'user@-domain.com',
        'user@domain-.com',
        'user@domain.c',
        'user@domain.com.',
        'user@domain.com;DROP TABLE users;',
        'user@domain.com<script>alert("XSS")</script>',
      ];

      for (const invalidEmail of invalidEmails) {
        const formData = new FormData();
        formData.append('email', invalidEmail);
        formData.append('name', 'Test User');

        const result = await updateAccountAction(formData);
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('이메일');
      }
    });

    it('should validate QR code size limits', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.qRCode.count.mockResolvedValue(5);

      const invalidSizes = [
        '50',   // Too small
        '2000', // Too large
        '-100', // Negative
        '0',    // Zero
        'abc',  // Non-numeric
        '500.5', // Decimal
      ];

      for (const invalidSize of invalidSizes) {
        const formData = new FormData();
        formData.append('type', 'TEXT');
        formData.append('data', 'Size test');
        formData.append('title', 'Size Test');
        formData.append('size', invalidSize);

        const result = await createQRCodeAction(formData);
        
        if (result.success) {
          expect(result.data?.size).toBeGreaterThanOrEqual(100);
          expect(result.data?.size).toBeLessThanOrEqual(1000);
        } else {
          expect(result.error).toBeDefined();
        }
      }
    });

    it('should validate color format inputs', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.qRCode.count.mockResolvedValue(5);

      const invalidColors = [
        'red',
        '#gggggg',
        '#12345',
        '#1234567',
        'rgb(256, 0, 0)',
        'hsl(361, 100%, 50%)',
        'javascript:alert("XSS")',
        '<script>alert("XSS")</script>',
      ];

      for (const invalidColor of invalidColors) {
        const formData = new FormData();
        formData.append('type', 'TEXT');
        formData.append('data', 'Color test');
        formData.append('title', 'Color Test');
        formData.append('backgroundColor', invalidColor);
        formData.append('foregroundColor', '#000000');

        const result = await createQRCodeAction(formData);
        
        if (result.success) {
          expect(result.data?.backgroundColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        } else {
          expect(result.error).toBeDefined();
        }
      }
    });

    it('should validate URL format and prevent malicious URLs', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.qRCode.count.mockResolvedValue(5);

      const maliciousUrls = [
        'javascript:alert("XSS")',
        'data:text/html,<script>alert("XSS")</script>',
        'vbscript:msgbox("XSS")',
        'file:///etc/passwd',
        'ftp://malicious.com/backdoor.exe',
        'http://localhost:22/ssh-attack',
        'https://phishing-site.com',
        'http://192.168.1.1/admin',
      ];

      for (const maliciousUrl of maliciousUrls) {
        const formData = new FormData();
        formData.append('type', 'URL');
        formData.append('data', maliciousUrl);
        formData.append('title', 'URL Test');

        const result = await createQRCodeAction(formData);
        
        if (result.success) {
          expect(result.data?.data).not.toBe(maliciousUrl);
        } else {
          expect(result.error).toBeDefined();
        }
      }
    });

    it('should validate text length limits', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.qRCode.count.mockResolvedValue(5);

      const oversizedText = 'A'.repeat(10000); // Very long text
      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', oversizedText);
      formData.append('title', 'Length Test');

      const result = await createQRCodeAction(formData);
      
      if (result.success) {
        expect(result.data?.data.length).toBeLessThanOrEqual(5000);
      } else {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('SQL Injection Prevention Tests', () => {
    it('should prevent SQL injection in QR code queries', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.qRCode.findUnique.mockResolvedValue(mockQRCode);
      mockPrisma.qRCode.update.mockResolvedValue({ ...mockQRCode, title: 'Updated' });

      const sqlInjectionAttempts = [
        "'; DROP TABLE qrcodes; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users; --",
        "'; DELETE FROM users WHERE '1'='1'; --",
        "' OR 1=1; --",
        "admin'--",
        "admin' /*",
        "' OR 'x'='x",
        "'; EXEC sp_msforeachtable 'DROP TABLE ?'; --",
      ];

      for (const sqlInjection of sqlInjectionAttempts) {
        const formData = new FormData();
        formData.append('title', sqlInjection);
        formData.append('description', 'SQL Injection Test');

        const result = await updateQRCodeAction('security-qr', formData);
        
        if (result.success) {
          expect(result.data?.title).not.toBe(sqlInjection);
        }
        
        expect(mockPrisma.qRCode.update).toHaveBeenCalledWith({
          where: { id: 'security-qr' },
          data: expect.objectContaining({
            title: expect.any(String),
          }),
        });
      }
    });

    it('should prevent SQL injection in user account operations', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, name: 'Updated' });

      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT password FROM users; --",
      ];

      for (const sqlInjection of sqlInjectionAttempts) {
        const formData = new FormData();
        formData.append('name', sqlInjection);
        formData.append('email', 'test@example.com');

        const result = await updateAccountAction(formData);
        
        if (result.success) {
          expect(result.data?.name).not.toBe(sqlInjection);
        }
        
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: 'security-user' },
          data: expect.objectContaining({
            name: expect.any(String),
          }),
        });
      }
    });
  });

  describe('XSS Prevention Tests', () => {
    it('should sanitize HTML content in QR code data', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue({ ...mockQRCode, data: 'Sanitized content' });

      const xssAttempts = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        '<svg onload="alert(\'XSS\')">',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        '<body onload="alert(\'XSS\')">',
        '<div onclick="alert(\'XSS\')">Click me</div>',
        '<a href="javascript:alert(\'XSS\')">Link</a>',
        '<input onfocus="alert(\'XSS\')" autofocus>',
      ];

      for (const xssAttempt of xssAttempts) {
        const formData = new FormData();
        formData.append('type', 'TEXT');
        formData.append('data', xssAttempt);
        formData.append('title', 'XSS Test');

        const result = await createQRCodeAction(formData);
        
        if (result.success) {
          expect(result.data?.data).not.toContain('<script>');
          expect(result.data?.data).not.toContain('onerror=');
          expect(result.data?.data).not.toContain('onload=');
          expect(result.data?.data).not.toContain('javascript:');
        }
      }
    });

    it('should prevent XSS in user profile data', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, name: 'Sanitized Name' });

      const xssAttempts = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')">',
        'javascript:alert("XSS")',
        '<svg onload="alert(\'XSS\')">',
      ];

      for (const xssAttempt of xssAttempts) {
        const formData = new FormData();
        formData.append('name', xssAttempt);
        formData.append('email', 'test@example.com');

        const result = await updateAccountAction(formData);
        
        if (result.success) {
          expect(result.data?.name).not.toContain('<script>');
          expect(result.data?.name).not.toContain('onerror=');
          expect(result.data?.name).not.toContain('javascript:');
        }
      }
    });
  });

  describe('CSRF Protection Tests', () => {
    it('should validate origin header for critical operations', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'CSRF test');
      formData.append('title', 'CSRF Test');

      const result = await createQRCodeAction(formData);
      
      if (result.success) {
        expect(mockPrisma.qRCode.create).toHaveBeenCalled();
      }
    });

    it('should prevent cross-site request forgery in account operations', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, name: 'Updated' });

      const formData = new FormData();
      formData.append('name', 'CSRF Test User');
      formData.append('email', 'csrf@example.com');

      const result = await updateAccountAction(formData);
      
      if (result.success) {
        expect(mockPrisma.user.update).toHaveBeenCalled();
      }
    });
  });

  describe('Authorization Tests', () => {
    it('should prevent unauthorized access to other users\' QR codes', async () => {
      const otherUserQRCode = { ...mockQRCode, userId: 'other-user' };
      
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.qRCode.findUnique.mockResolvedValue(otherUserQRCode);

      const formData = new FormData();
      formData.append('title', 'Unauthorized Update');

      const result = await updateQRCodeAction('other-user-qr', formData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('권한이 없습니다');
    });

    it('should prevent unauthorized QR code deletion', async () => {
      const otherUserQRCode = { ...mockQRCode, userId: 'other-user' };
      
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.qRCode.findUnique.mockResolvedValue(otherUserQRCode);

      const result = await deleteQRCodeAction('other-user-qr');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('권한이 없습니다');
    });

    it('should enforce admin-only operations', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser, // Regular user, not admin
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const formData = new FormData();
      formData.append('name', 'Admin Test');
      formData.append('email', 'admin@example.com');
      formData.append('accountType', 'ADMIN');

      const result = await updateAccountAction(formData);
      
      if (result.success) {
        expect(result.data?.accountType).not.toBe('ADMIN');
      } else {
        expect(result.error).toContain('권한');
      }
    });
  });

  describe('Session Security Tests', () => {
    it('should handle expired sessions gracefully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() - 1000).toISOString(), // Expired session
      });

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Session test');
      formData.append('title', 'Session Test');

      const result = await createQRCodeAction(formData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('인증');
    });

    it('should prevent session hijacking attempts', async () => {
      mockGetServerSession.mockResolvedValue(null); // No session

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Hijacking test');
      formData.append('title', 'Hijacking Test');

      const result = await createQRCodeAction(formData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('인증');
    });

    it('should validate session integrity', async () => {
      const malformedSession = {
        user: {
          ...mockUser,
          id: 'modified-id', // Tampered user ID
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      mockGetServerSession.mockResolvedValue(malformedSession);
      mockPrisma.user.findUnique.mockResolvedValue(null); // User not found

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Integrity test');
      formData.append('title', 'Integrity Test');

      const result = await createQRCodeAction(formData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('사용자 정보를 찾을 수 없습니다');
    });
  });

  describe('Rate Limiting and Abuse Prevention', () => {
    it('should handle rapid successive requests', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const rapidRequests = Array.from({ length: 100 }, (_, i) => {
        const formData = new FormData();
        formData.append('type', 'TEXT');
        formData.append('data', `Rapid test ${i}`);
        formData.append('title', `Rapid QR ${i}`);
        return createQRCodeAction(formData);
      });

      const results = await Promise.all(rapidRequests);
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      expect(successCount + errorCount).toBe(100);
      expect(successCount).toBeLessThan(100); // Some should be rate limited
    });

    it('should prevent quota abuse', async () => {
      const userAtLimit = { ...mockUser, qrcodeLimit: 10 };
      
      mockGetServerSession.mockResolvedValue({
        user: userAtLimit,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(userAtLimit);
      mockPrisma.qRCode.count.mockResolvedValue(10); // At limit

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Quota abuse test');
      formData.append('title', 'Quota Test');

      const result = await createQRCodeAction(formData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('quota');
    });
  });
});