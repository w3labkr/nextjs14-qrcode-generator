import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PrismaClient, User, QRCode, LogEntry } from '@prisma/client';
import { createMocks } from 'node-mocks-http';
import { getServerSession } from 'next-auth';
import { createQRCodeAction } from '@/app/actions/qr-code-generator';
import { deleteQRCodeAction } from '@/app/actions/qr-code-management';
import { createAccountAction } from '@/app/actions/account-management';
import { getQRCodesAction } from '@/app/actions/qr-code-management';
import { NextRequest, NextResponse } from 'next/server';
import { logApiRequest } from '@/lib/logging-middleware';

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
const mockLogApiRequest = logApiRequest as jest.MockedFunction<typeof logApiRequest>;

describe('Complex Business Logic Integration Tests', () => {
  const mockUser1: User = {
    id: 'user1',
    email: 'user1@example.com',
    name: 'User One',
    image: 'https://example.com/image1.jpg',
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

  const mockUser2: User = {
    id: 'user2',
    email: 'user2@example.com',
    name: 'User Two',
    image: 'https://example.com/image2.jpg',
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

  const mockQRCode1: QRCode = {
    id: 'qr1',
    userId: 'user1',
    type: 'TEXT',
    data: 'Test QR Code 1',
    title: 'Test QR 1',
    description: 'Test Description 1',
    qrCodeUrl: 'https://example.com/qr1.png',
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

  describe('Multi-User Scenarios', () => {
    it('should handle concurrent QR code creation by multiple users', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser1,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser1);
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode1);

      const formData1 = new FormData();
      formData1.append('type', 'TEXT');
      formData1.append('data', 'User 1 QR Code');
      formData1.append('title', 'User 1 Test');

      const formData2 = new FormData();
      formData2.append('type', 'TEXT');
      formData2.append('data', 'User 2 QR Code');
      formData2.append('title', 'User 2 Test');

      const [result1, result2] = await Promise.all([
        createQRCodeAction(formData1),
        createQRCodeAction(formData2),
      ]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(mockPrisma.qRCode.create).toHaveBeenCalledTimes(2);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should handle user quota limits in multi-user environment', async () => {
      const userAtLimit = { ...mockUser1, qrcodeLimit: 10 };
      
      mockGetServerSession.mockResolvedValue({
        user: userAtLimit,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(userAtLimit);
      mockPrisma.qRCode.count.mockResolvedValue(10);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Quota exceeded test');
      formData.append('title', 'Quota Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('quota');
      expect(mockPrisma.qRCode.create).not.toHaveBeenCalled();
    });

    it('should handle user account creation and immediate QR code generation', async () => {
      const newUser = { ...mockUser1, id: 'new-user' };
      
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValue(newUser);
      mockPrisma.qRCode.count.mockResolvedValue(0);
      mockPrisma.qRCode.create.mockResolvedValue({ ...mockQRCode1, userId: 'new-user' });

      mockGetServerSession.mockResolvedValue({
        user: newUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const accountData = new FormData();
      accountData.append('name', 'New User');
      accountData.append('email', 'newuser@example.com');

      const qrData = new FormData();
      qrData.append('type', 'TEXT');
      qrData.append('data', 'First QR Code');
      qrData.append('title', 'Welcome QR');

      const accountResult = await createAccountAction(accountData);
      expect(accountResult.success).toBe(true);

      mockPrisma.user.findUnique.mockResolvedValue(newUser);
      const qrResult = await createQRCodeAction(qrData);

      expect(qrResult.success).toBe(true);
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.qRCode.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Concurrency and Race Conditions', () => {
    it('should handle concurrent QR code deletion by same user', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser1,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.qRCode.findUnique.mockResolvedValue(mockQRCode1);
      mockPrisma.qRCode.delete.mockResolvedValue(mockQRCode1);

      const deletePromise1 = deleteQRCodeAction('qr1');
      const deletePromise2 = deleteQRCodeAction('qr1');

      const [result1, result2] = await Promise.all([
        deletePromise1,
        deletePromise2,
      ]);

      expect(result1.success || result2.success).toBe(true);
      expect(mockPrisma.qRCode.delete).toHaveBeenCalled();
    });

    it('should handle concurrent QR code list fetching with pagination', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser1,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const mockQRCodes = [mockQRCode1, { ...mockQRCode1, id: 'qr2' }];
      mockPrisma.qRCode.findMany.mockResolvedValue(mockQRCodes);
      mockPrisma.qRCode.count.mockResolvedValue(2);

      const fetchPromises = Array.from({ length: 5 }, (_, i) => 
        getQRCodesAction(i + 1, 10)
      );

      const results = await Promise.all(fetchPromises);

      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      expect(mockPrisma.qRCode.findMany).toHaveBeenCalledTimes(5);
    });

    it('should handle race condition in user quota checking', async () => {
      const userNearLimit = { ...mockUser1, qrcodeLimit: 10 };
      
      mockGetServerSession.mockResolvedValue({
        user: userNearLimit,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(userNearLimit);
      mockPrisma.qRCode.count.mockResolvedValue(9);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode1);

      const formData1 = new FormData();
      formData1.append('type', 'TEXT');
      formData1.append('data', 'Race condition test 1');
      formData1.append('title', 'Race Test 1');

      const formData2 = new FormData();
      formData2.append('type', 'TEXT');
      formData2.append('data', 'Race condition test 2');
      formData2.append('title', 'Race Test 2');

      const [result1, result2] = await Promise.all([
        createQRCodeAction(formData1),
        createQRCodeAction(formData2),
      ]);

      const successCount = [result1, result2].filter(r => r.success).length;
      expect(successCount).toBe(1);
    });
  });

  describe('Transaction Integrity', () => {
    it('should rollback transaction on QR code creation failure', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser1,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser1);
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockRejectedValue(new Error('Database error'));

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Transaction test');
      formData.append('title', 'Transaction Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('QR 코드 생성에 실패했습니다');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should maintain data consistency during bulk operations', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser1,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const mockQRCodes = Array.from({ length: 5 }, (_, i) => ({
        ...mockQRCode1,
        id: `qr${i + 1}`,
      }));

      mockPrisma.qRCode.findMany.mockResolvedValue(mockQRCodes);
      mockPrisma.qRCode.deleteMany.mockResolvedValue({ count: 5 });

      const deletePromises = mockQRCodes.map(qr => deleteQRCodeAction(qr.id));
      const results = await Promise.all(deletePromises);

      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(0);
    });

    it('should handle transaction timeout scenarios', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser1,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser1);
      mockPrisma.qRCode.count.mockResolvedValue(5);
      
      mockPrisma.$transaction.mockImplementation(async () => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Transaction timeout')), 100);
        });
      });

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Timeout test');
      formData.append('title', 'Timeout Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('QR 코드 생성에 실패했습니다');
    });
  });

  describe('Complex Business Flow Integration', () => {
    it('should handle complete user lifecycle with QR code management', async () => {
      const newUser = { ...mockUser1, id: 'lifecycle-user' };
      
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValue(newUser);
      mockPrisma.user.update.mockResolvedValue({ ...newUser, name: 'Updated Name' });
      mockPrisma.qRCode.count.mockResolvedValue(0);
      mockPrisma.qRCode.create.mockResolvedValue({ ...mockQRCode1, userId: 'lifecycle-user' });
      mockPrisma.qRCode.findMany.mockResolvedValue([{ ...mockQRCode1, userId: 'lifecycle-user' }]);
      mockPrisma.qRCode.delete.mockResolvedValue({ ...mockQRCode1, userId: 'lifecycle-user' });

      mockGetServerSession.mockResolvedValue({
        user: newUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const accountData = new FormData();
      accountData.append('name', 'Lifecycle User');
      accountData.append('email', 'lifecycle@example.com');

      const qrData = new FormData();
      qrData.append('type', 'TEXT');
      qrData.append('data', 'Lifecycle QR Code');
      qrData.append('title', 'Lifecycle QR');

      const accountResult = await createAccountAction(accountData);
      expect(accountResult.success).toBe(true);

      mockPrisma.user.findUnique.mockResolvedValue(newUser);
      const qrResult = await createQRCodeAction(qrData);
      expect(qrResult.success).toBe(true);

      const listResult = await getQRCodesAction(1, 10);
      expect(listResult.success).toBe(true);

      const deleteResult = await deleteQRCodeAction('qr1');
      expect(deleteResult.success).toBe(true);

      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.qRCode.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.qRCode.findMany).toHaveBeenCalled();
      expect(mockPrisma.qRCode.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle complex QR code generation with logging', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser1,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser1);
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode1);
      mockPrisma.logEntry.create.mockResolvedValue({
        id: 'log1',
        userId: 'user1',
        action: 'qr_generation',
        details: 'QR code generated successfully',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        timestamp: new Date(),
        metadata: {},
      });

      const formData = new FormData();
      formData.append('type', 'URL');
      formData.append('data', 'https://example.com');
      formData.append('title', 'Example URL');
      formData.append('description', 'Test URL QR Code');
      formData.append('backgroundColor', '#ffffff');
      formData.append('foregroundColor', '#000000');
      formData.append('size', '300');
      formData.append('errorCorrection', 'H');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'URL',
          data: 'https://example.com',
          title: 'Example URL',
          description: 'Test URL QR Code',
          backgroundColor: '#ffffff',
          foregroundColor: '#000000',
          size: 300,
          errorCorrection: 'H',
        }),
      });
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from database connection failures', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser1,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockRejectedValueOnce(new Error('Connection failed'));
      mockPrisma.user.findUnique.mockResolvedValue(mockUser1);
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode1);

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Recovery test');
      formData.append('title', 'Recovery Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('사용자 정보를 찾을 수 없습니다');
    });

    it('should handle partial system failures gracefully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: mockUser1,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPrisma.user.findUnique.mockResolvedValue(mockUser1);
      mockPrisma.qRCode.count.mockResolvedValue(5);
      mockPrisma.qRCode.create.mockResolvedValue(mockQRCode1);
      mockLogApiRequest.mockImplementation(() => {
        throw new Error('Logging service unavailable');
      });

      const formData = new FormData();
      formData.append('type', 'TEXT');
      formData.append('data', 'Partial failure test');
      formData.append('title', 'Partial Failure Test');

      const result = await createQRCodeAction(formData);

      expect(result.success).toBe(true);
      expect(mockPrisma.qRCode.create).toHaveBeenCalled();
    });
  });
});