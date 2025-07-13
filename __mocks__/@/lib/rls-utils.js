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
  withRLSTransaction: jest.fn().mockImplementation(async (userId, callback) => {
    // Mock transaction object with basic Prisma operations
    const mockTx = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: userId || "test-user" }),
        findUnique: jest.fn().mockResolvedValue({ id: userId || "test-user" }),
        create: jest.fn().mockResolvedValue({ id: userId || "test-user" }),
      },
      qrCode: {
        create: jest.fn().mockResolvedValue({
          id: "test-qr-id",
          userId: userId || "test-user",
          type: "URL",
          title: "Test QR",
          content: "https://example.com",
          settings: "{}",
          createdAt: new Date(),
        }),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
      $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
    };
    
    if (typeof callback === "function") {
      return await callback(mockTx);
    }
    return callback;
  }),
  withAuthenticatedRLS: jest.fn().mockImplementation(async (callback) => {
    if (typeof callback === "function") {
      return await callback();
    }
    return callback;
  }),
  withAuthenticatedRLSTransaction: jest.fn().mockImplementation(async (session, callback) => {
    // Mock transaction object with basic Prisma operations
    const mockTx = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: session?.user?.id || "test-user" }),
        findUnique: jest.fn().mockResolvedValue({ id: session?.user?.id || "test-user" }),
        create: jest.fn().mockResolvedValue({ id: session?.user?.id || "test-user" }),
      },
      qrCode: {
        create: jest.fn().mockResolvedValue({
          id: "test-qr-id",
          userId: session?.user?.id || "test-user",
          type: "URL",
          title: "Test QR",
          content: "https://example.com",
          settings: "{}",
          createdAt: new Date(),
        }),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
    };
    
    if (typeof callback === "function") {
      return await callback(mockTx);
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
