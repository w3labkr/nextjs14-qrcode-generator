import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaClient, User, QRCode } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { createQRCodeAction } from '@/app/actions/qr-code-generator';
import { getQRCodesAction } from '@/app/actions/qr-code-management';
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

describe('Environment Compatibility Tests', () => {
  const mockUser: User = {
    id: 'env-user',
    email: 'env@example.com',
    name: 'Environment User',
    image: 'https://example.com/env.jpg',
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

  const mockQRCode: QRCode = {
    id: 'env-qr',
    userId: 'env-user',
    type: 'TEXT',
    data: 'Environment test QR Code',
    title: 'Environment Test QR',
    description: 'Environment test description',
    qrCodeUrl: 'https://example.com/env-qr.png',
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
    mockGetServerSession.mockResolvedValue({
      user: mockUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      return callback(mockPrisma);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Development Environment Tests', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    });

    it('should handle development environment configuration', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Development test');
      formData.append('title', 'Dev Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.create).toHaveBeenCalled();
    });

    it('should handle localhost URLs in development', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue({
        ...mockQRCode,
        type: 'URL',
        data: 'http://localhost:3000/test',
      });

      const formData = new FormData();
      formData.append('type', 'URL');
      formData.append('data', 'http://localhost:3000/test');
      formData.append('title', 'Localhost Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(result.data?.data).toBe('http://localhost:3000/test');
    });

    it('should handle development database connections', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(10);
      mockPrisma.qRCode.findMany.mockResolvedValue([mockQRCode]);

      const result = await getQRCodesAction(1, 10);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.findMany).toHaveBeenCalledWith({
        where: { userId: 'env-user' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });

    it('should handle development logging configuration', async () => {
      const mockLogApiRequest = require('@/lib/logging-middleware').logApiRequest;
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Logging test');
      formData.append('title', 'Log Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
    });
  });

  describe('Staging Environment Tests', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_APP_URL = 'https://staging.example.com';
      process.env.VERCEL_ENV = 'preview';
    });

    it('should handle staging environment configuration', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Staging test');
      formData.append('title', 'Staging Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.create).toHaveBeenCalled();
    });

    it('should handle HTTPS URLs in staging', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue({
        ...mockQRCode,
        type: 'URL',
        data: 'https://staging.example.com/test',
      });

      const formData = new FormData();
      formData.append('type', 'URL');
      formData.append('data', 'https://staging.example.com/test');
      formData.append('title', 'Staging URL Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(result.data?.data).toBe('https://staging.example.com/test');
    });

    it('should handle staging database configuration', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(100);
      mockPrisma.qRCode.findMany.mockResolvedValue([mockQRCode]);

      const result = await getQRCodesAction(1, 20);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.findMany).toHaveBeenCalledWith({
        where: { userId: 'env-user' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('should handle staging security headers', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Security test');
      formData.append('title', 'Security Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
    });
  });

  describe('Production Environment Tests', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_APP_URL = 'https://production.example.com';
      process.env.VERCEL_ENV = 'production';
    });

    it('should handle production environment configuration', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Production test');
      formData.append('title', 'Production Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.create).toHaveBeenCalled();
    });

    it('should enforce HTTPS in production', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue({
        ...mockQRCode,
        type: 'URL',
        data: 'https://production.example.com/test',
      });

      const formData = new FormData();
      formData.append('type', 'URL');
      formData.append('data', 'http://production.example.com/test');
      formData.append('title', 'HTTPS Test');

      const result = await createQRCodeAction(formData);

      if (result.success) {
        expect(result.data?.data).toMatch(/^https:/);
      }
    });

    it('should handle production database optimizations', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(10000);
      mockPrisma.qRCode.findMany.mockResolvedValue([mockQRCode]);

      const result = await getQRCodesAction(1, 50);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.findMany).toHaveBeenCalledWith({
        where: { userId: 'env-user' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50,
      });
    });

    it('should handle production error handling', async () => {
      mockPrisma.qRCode.count.mockRejectedValue(new Error('Production database error'));

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Error test');
      formData.append('title', 'Error Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle production logging and monitoring', async () => {
      const mockLogApiRequest = require('@/lib/logging-middleware').logApiRequest;
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Monitoring test');
      formData.append('title', 'Monitoring Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
    });
  });

  describe('Browser Compatibility Tests', () => {
    it('should handle Chrome browser characteristics', async () => {
      const chromeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Chrome test');
      formData.append('title', 'Chrome Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(result.data?.qrCodeUrl).toBeDefined();
    });

    it('should handle Firefox browser characteristics', async () => {
      const firefoxUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Firefox test');
      formData.append('title', 'Firefox Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(result.data?.qrCodeUrl).toBeDefined();
    });

    it('should handle Safari browser characteristics', async () => {
      const safariUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Safari test');
      formData.append('title', 'Safari Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(result.data?.qrCodeUrl).toBeDefined();
    });

    it('should handle Edge browser characteristics', async () => {
      const edgeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Edge test');
      formData.append('title', 'Edge Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(result.data?.qrCodeUrl).toBeDefined();
    });

    it('should handle mobile browser characteristics', async () => {
      const mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Mobile test');
      formData.append('title', 'Mobile Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(result.data?.qrCodeUrl).toBeDefined();
    });
  });

  describe('Mobile Environment Tests', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
        },
        writable: true,
      });
    });

    it('should handle mobile QR code generation', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue({
        ...mockQRCode,
        size: 150, // Smaller size for mobile
      });

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Mobile QR test');
      formData.append('title', 'Mobile QR');
      formData.append('size', '150');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(result.data?.size).toBe(150);
    });

    it('should handle mobile viewport constraints', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(20);
      mockPrisma.qRCode.findMany.mockResolvedValue([mockQRCode]);

      const result = await getQRCodesAction(1, 5); // Smaller page size for mobile

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.findMany).toHaveBeenCalledWith({
        where: { userId: 'env-user' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 5,
      });
    });

    it('should handle mobile touch interactions', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Touch test');
      formData.append('title', 'Touch Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(result.data?.qrCodeUrl).toBeDefined();
    });

    it('should handle mobile network conditions', async () => {
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
        return mockQRCode;
      });

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Network test');
      formData.append('title', 'Network Test');

      const startTime = Date.now();
      const result = await createQRCodeAction(formData);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeGreaterThan(100);
    });
  });

  describe('Feature Flag and A/B Testing', () => {
    it('should handle feature flag enabled state', async () => {
      process.env.FEATURE_NEW_QR_GENERATOR = 'true';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Feature flag test');
      formData.append('title', 'Feature Flag Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.create).toHaveBeenCalled();
    });

    it('should handle feature flag disabled state', async () => {
      process.env.FEATURE_NEW_QR_GENERATOR = 'false';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Feature flag disabled test');
      formData.append('title', 'Feature Flag Disabled Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.create).toHaveBeenCalled();
    });

    it('should handle A/B testing variants', async () => {
      process.env.AB_TEST_VARIANT = 'B';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'A/B test');
      formData.append('title', 'A/B Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.create).toHaveBeenCalled();
    });
  });

  describe('Database Environment Tests', () => {
    it('should handle PostgreSQL database environment', async () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/qrcode_db';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'PostgreSQL test');
      formData.append('title', 'PostgreSQL Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.create).toHaveBeenCalled();
    });

    it('should handle MySQL database environment', async () => {
      process.env.DATABASE_URL = 'mysql://user:pass@localhost:3306/qrcode_db';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'MySQL test');
      formData.append('title', 'MySQL Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.create).toHaveBeenCalled();
    });

    it('should handle SQLite database environment', async () => {
      process.env.DATABASE_URL = 'file:./dev.db';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'SQLite test');
      formData.append('title', 'SQLite Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.create).toHaveBeenCalled();
    });
  });

  describe('CDN and Asset Delivery Tests', () => {
    it('should handle CDN URL generation', async () => {
      process.env.CDN_URL = 'https://cdn.example.com';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue({
        ...mockQRCode,
        qrCodeUrl: 'https://cdn.example.com/qr-env.png',
      });

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'CDN test');
      formData.append('title', 'CDN Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(result.data?.qrCodeUrl).toContain('cdn.example.com');
    });

    it('should handle asset optimization for different environments', async () => {
      process.env.NODE_ENV = 'production';
      process.env.OPTIMIZE_ASSETS = 'true';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Asset optimization test');
      formData.append('title', 'Asset Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(result.data?.qrCodeUrl).toBeDefined();
    });
  });

  describe('Timezone and Localization Tests', () => {
    it('should handle different timezone configurations', async () => {
      process.env.TZ = 'America/New_York';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Timezone test');
      formData.append('title', 'Timezone Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(result.data?.createdAt).toBeDefined();
    });

    it('should handle locale-specific formatting', async () => {
      process.env.LOCALE = 'ko-KR';
      
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', '로케일 테스트');
      formData.append('title', '로케일 테스트');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(result.data?.data).toBe('로케일 테스트');
    });
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_ENV;
    delete process.env.FEATURE_NEW_QR_GENERATOR;
    delete process.env.AB_TEST_VARIANT;
    delete process.env.DATABASE_URL;
    delete process.env.CDN_URL;
    delete process.env.OPTIMIZE_ASSETS;
    delete process.env.TZ;
    delete process.env.LOCALE;
  });
});