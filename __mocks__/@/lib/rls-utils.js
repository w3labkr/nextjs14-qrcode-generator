module.exports = {
  validateUserId: jest.fn(() => {
    // Mock 버전은 항상 성공
    return;
  }),
  withRLS: jest.fn().mockImplementation(async (callback) => {
    if (typeof callback === "function") {
      return await callback();
    }
    return callback;
  }),
  withRLSTransaction: jest.fn().mockImplementation(async (callback) => {
    if (typeof callback === "function") {
      return await callback();
    }
    return callback;
  }),
  withAuthenticatedRLS: jest.fn().mockImplementation(async (callback) => {
    if (typeof callback === "function") {
      return await callback();
    }
    return callback;
  }),
  withSystemRLS: jest.fn().mockImplementation(async (callback) => {
    if (typeof callback === "function") {
      return await callback();
    }
    return callback;
  }),
  withAdminRLS: jest.fn().mockImplementation(async (callback) => {
    if (typeof callback === "function") {
      return await callback();
    }
    return callback;
  }),
  setupRLS: jest.fn().mockResolvedValue(undefined),
  cleanupRLS: jest.fn().mockResolvedValue(undefined),
  resetRLS: jest.fn().mockResolvedValue(undefined),
};
