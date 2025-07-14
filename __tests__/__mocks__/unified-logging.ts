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
    return Promise.resolve({ id: "1", message: "mock log entry" });
  }

  static async logError() {
    return Promise.resolve({ id: "1", message: "mock error log" });
  }

  static async logAuth() {
    return Promise.resolve({ id: "1", message: "mock auth log" });
  }

  static async logApiAccess() {
    return Promise.resolve({ id: "1", message: "mock api log" });
  }

  static async logAPI() {
    return Promise.resolve({ id: "1", message: "mock api log" });
  }

  static async logQrGeneration() {
    return Promise.resolve({ id: "1", message: "mock qr generation log" });
  }

  static async logAudit() {
    return Promise.resolve({ id: "1", message: "mock audit log" });
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
  logSystem: jest.fn().mockResolvedValue(undefined),
  logAdminAction: jest.fn().mockResolvedValue(undefined),
  logAuth: jest.fn().mockResolvedValue(undefined),
  logAccess: jest.fn().mockResolvedValue(undefined),
  logAudit: jest.fn().mockResolvedValue(undefined),
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
