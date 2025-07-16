/**
 * Common mocking utilities for tests
 */

import { Session } from "next-auth";
import { SystemLogType } from "@/types/logs";

/**
 * Creates a mock session object
 */
export function createMockSession(overrides?: Partial<Session>): Session {
  return {
    user: {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      image: null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

/**
 * Creates a mock admin session
 */
export function createMockAdminSession(overrides?: Partial<Session>): Session {
  return createMockSession({
    user: {
      id: "admin-user-id",
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
      image: null,
    },
    ...overrides,
  });
}

/**
 * Mock implementation for getTypeLabel
 */
export function mockGetTypeLabel(type: SystemLogType): string {
  const labels: Record<SystemLogType, string> = {
    AUTH_LOGIN: "Login",
    AUTH_LOGOUT: "Logout",
    AUTH_SESSION_REFRESH: "Session Refresh",
    AUTH_FAILED: "Authentication Failed",
    PROFILE_UPDATE: "Profile Update",
    PROFILE_DELETE: "Profile Delete",
    QRCODE_CREATE: "QR Code Create",
    QRCODE_UPDATE: "QR Code Update",
    QRCODE_DELETE: "QR Code Delete",
    QRCODE_VIEW: "QR Code View",
    QRCODE_SCAN: "QR Code Scan",
    QRCODE_DOWNLOAD: "QR Code Download",
    SYSTEM_ERROR: "System Error",
    SYSTEM_MAINTENANCE: "System Maintenance",
    SYSTEM_STARTUP: "System Startup",
    SYSTEM_SHUTDOWN: "System Shutdown",
    ADMIN_ACTION: "Admin Action",
    ADMIN_CONFIG_CHANGE: "Admin Config Change",
    API_REQUEST: "API Request",
    API_ERROR: "API Error",
    SECURITY_ALERT: "Security Alert",
    SECURITY_VIOLATION: "Security Violation",
    DATA_IMPORT: "Data Import",
    DATA_EXPORT: "Data Export",
    DATA_BACKUP: "Data Backup",
    DATA_RESTORE: "Data Restore",
    EMAIL_SENT: "Email Sent",
    EMAIL_FAILED: "Email Failed",
    RATE_LIMIT: "Rate Limit",
    ACCESS_DENIED: "Access Denied",
  };
  return labels[type] || type;
}

/**
 * Mock Prisma client with common methods
 */
export function createMockPrismaClient() {
  return {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    qrCode: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    systemLog: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    account: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => {
      return callback({
        user: {
          findUnique: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          count: jest.fn(),
        },
        qrCode: {
          findUnique: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          count: jest.fn(),
        },
        systemLog: {
          findUnique: jest.fn(),
          findFirst: jest.fn(),
          findMany: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          count: jest.fn(),
        },
      });
    }),
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
}

/**
 * Mock for next-auth auth() function
 */
export function createMockAuth(session?: Session | null) {
  return jest.fn().mockResolvedValue(session);
}

/**
 * Mock for Next.js headers
 */
export function createMockHeaders() {
  const headersMap = new Map([
    ["x-forwarded-for", "127.0.0.1"],
    ["user-agent", "Mozilla/5.0 Test Browser"],
  ]);

  return jest.fn(() => ({
    get: jest.fn((key: string) => headersMap.get(key.toLowerCase())),
    has: jest.fn((key: string) => headersMap.has(key.toLowerCase())),
    forEach: jest.fn((callback: (value: string, key: string) => void) => {
      headersMap.forEach(callback);
    }),
  }));
}

/**
 * Mock for useToast hook
 */
export function createMockToast() {
  return {
    toast: jest.fn(),
    toasts: [],
    dismiss: jest.fn(),
  };
}

/**
 * Mock for axios
 */
export function createMockAxios() {
  return {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
    patch: jest.fn().mockResolvedValue({ data: {} }),
    request: jest.fn().mockResolvedValue({ data: {} }),
    create: jest.fn(() => createMockAxios()),
    defaults: {
      headers: {
        common: {},
      },
    },
  };
}