export const prisma = {
  qrCode: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    count: jest.fn().mockResolvedValue(0),
    groupBy: jest.fn().mockResolvedValue([]),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
  },
  logEntry: {
    create: jest.fn().mockResolvedValue({}),
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
  $queryRawUnsafe: jest.fn().mockResolvedValue([]),
  $transaction: jest.fn().mockImplementation((callback) => {
    if (typeof callback === "function") {
      return callback(prisma);
    }
    return Promise.resolve();
  }),
};

export default prisma;
