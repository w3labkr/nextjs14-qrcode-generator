export const prisma = {
  qrCode: {
    findMany: jest.fn().mockResolvedValue([
      {
        id: "qr1",
        title: "Test QR 1",
        content: "https://example.com",
        type: "URL",
        createdAt: new Date("2024-01-01"),
        isFavorite: false,
      },
    ]),
    findFirst: jest.fn().mockResolvedValue({
      id: "qr1",
      title: "Test QR 1",
      content: "https://example.com",
      type: "URL",
      createdAt: new Date("2024-01-01"),
      isFavorite: false,
    }),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({
      id: "qr1",
      isFavorite: true,
    }),
    delete: jest.fn().mockResolvedValue({ id: "qr1" }),
    deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
    count: jest.fn().mockResolvedValue(1),
    groupBy: jest.fn().mockResolvedValue([
      { type: "URL", _count: { _all: 5 } },
      { type: "TEXTAREA", _count: { _all: 3 } },
      { type: "EMAIL", _count: { _all: 2 } },
    ]),
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
  applicationLog: {
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
