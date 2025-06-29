module.exports = {
  withRLS: jest.fn().mockImplementation(() => ({
    qrCode: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  })),
  withAuthenticatedRLS: jest.fn(),
  setupRLS: jest.fn().mockResolvedValue(undefined),
  cleanupRLS: jest.fn().mockResolvedValue(undefined),
};
