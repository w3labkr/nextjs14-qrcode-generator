const mockPrisma = {
  create: jest.fn().mockResolvedValue({ id: "1", message: "mock log entry" }),
  logEntry: {
    create: jest.fn().mockResolvedValue({ id: "1", message: "mock log entry" }),
  },
};

export class UnifiedLogging {
  static logTypes = {
    API: "API",
    AUTH: "AUTH",
    AUDIT: "AUDIT",
    ERROR: "ERROR",
    QR_GENERATION: "QR_GENERATION",
  };

  static async createLog() {
    // Mock implementation - do nothing in tests
    return Promise.resolve();
  }

  static async logError() {
    // Mock implementation - do nothing in tests
    return Promise.resolve();
  }

  static async logAPI() {
    // Mock implementation - do nothing in tests
    return Promise.resolve();
  }

  static async logAuth() {
    // Mock implementation - do nothing in tests
    return Promise.resolve();
  }

  static async logAudit() {
    // Mock implementation - do nothing in tests
    return Promise.resolve();
  }

  static async logQrGeneration() {
    // Mock implementation - do nothing in tests
    return Promise.resolve();
  }

  static async getLogs() {
    return Promise.resolve([]);
  }

  static async getLogStats() {
    return Promise.resolve({
      total: 0,
      byType: {},
      byLevel: {},
    });
  }

  static async cleanupOldLogs() {
    return Promise.resolve({ deletedCount: 0 });
  }
}

export const UnifiedLogger = {
  logError: jest.fn().mockResolvedValue(undefined),
  logInfo: jest.fn().mockResolvedValue(undefined),
  logWarning: jest.fn().mockResolvedValue(undefined),
  logActivity: jest.fn().mockResolvedValue(undefined),
  logQrGeneration: jest.fn().mockResolvedValue(undefined),
  createLog: jest.fn().mockResolvedValue(undefined),
  create: jest.fn().mockResolvedValue(undefined),
  error: jest.fn().mockResolvedValue(undefined),
  prisma: mockPrisma,
};

export const inferQrType = jest.fn().mockReturnValue("url");

export default {
  UnifiedLogging,
  UnifiedLogger,
  inferQrType,
};
