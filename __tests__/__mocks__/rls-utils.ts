export const withRLS = jest.fn().mockImplementation(() => ({
  qrCode: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
}));

export const setupRLS = jest.fn().mockResolvedValue(undefined);
export const cleanupRLS = jest.fn().mockResolvedValue(undefined);
