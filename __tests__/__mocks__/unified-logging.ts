export const UnifiedLogger = {
  logError: jest.fn().mockResolvedValue(undefined),
  logInfo: jest.fn().mockResolvedValue(undefined),
  logWarning: jest.fn().mockResolvedValue(undefined),
  logActivity: jest.fn().mockResolvedValue(undefined),
};

export default {
  UnifiedLogger,
};
