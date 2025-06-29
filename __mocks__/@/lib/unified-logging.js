class UnifiedLogging {
  static logTypes = {
    API: "API",
    AUTH: "AUTH",
    AUDIT: "AUDIT",
    ERROR: "ERROR",
    QR_GENERATION: "QR_GENERATION",
  };

  static async createLog() {
    return Promise.resolve();
  }

  static async logError() {
    return Promise.resolve();
  }

  static async logAPI() {
    return Promise.resolve();
  }

  static async logAuth() {
    return Promise.resolve();
  }

  static async logAudit() {
    return Promise.resolve();
  }

  static async logQrGeneration() {
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

module.exports = {
  UnifiedLogging,
  UnifiedLogger: {
    logError: jest.fn().mockResolvedValue(undefined),
    logInfo: jest.fn().mockResolvedValue(undefined),
    logWarning: jest.fn().mockResolvedValue(undefined),
    logActivity: jest.fn().mockResolvedValue(undefined),
    logQrGeneration: jest.fn().mockResolvedValue(undefined),
    createLog: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue(undefined),
    error: jest.fn().mockResolvedValue(undefined),
  },
  inferQrType: jest.fn().mockReturnValue("url"),
};
