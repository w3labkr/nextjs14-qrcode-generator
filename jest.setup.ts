import "@testing-library/jest-dom";

// Ensure DOM environment is properly set up
if (typeof document !== "undefined") {
  // Create a DOM container for React testing
  if (!document.body) {
    document.body = document.createElement("body");
  }
  
  // Ensure document has proper structure
  if (!document.documentElement) {
    document.documentElement = document.createElement("html");
    document.documentElement.appendChild(document.body);
  }
}

// Check if we're in a browser environment before adding DOM APIs
if (typeof HTMLElement !== "undefined") {
  // Add missing DOM APIs for jsdom
  Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
    value: jest.fn(() => false),
    writable: true,
  });

  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    value: jest.fn(),
    writable: true,
  });

  Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
    value: jest.fn(),
    writable: true,
  });

  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
    value: jest.fn(),
    writable: true,
  });
}

// ResizeObserver Mock
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "";
  },
}));

// Mock lib/utils cn function before importing anything else
const mockCn = jest.fn(
  (...classes: (string | undefined | null | boolean)[]) => {
    return classes.filter(Boolean).join(" ");
  },
);

jest.doMock("@/lib/utils", () => {
  const actual = jest.requireActual("@/lib/utils");
  return {
    ...actual,
    cn: mockCn,
  };
});

// Mock NextAuth
jest.mock("@/auth", () => ({
  auth: jest.fn(() => Promise.resolve(null)),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: "c123456789012345678901234",
        email: "test@example.com",
      }),
      findFirst: jest.fn().mockResolvedValue({
        id: "c123456789012345678901234",
        email: "test@example.com",
      }),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
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
      create: jest.fn().mockResolvedValue({
        id: "c987654321098765432109876",
        userId: "test-user-id",
        type: "text",
        title: "Test QR",
        content: "Test content",
        settings: JSON.stringify({
          type: "png",
          color: "#000000",
          width: 256,
          margin: 10,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
      }),
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
    logEntry: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    applicationLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
    $queryRawUnsafe: jest.fn().mockResolvedValue([]),
    $transaction: jest.fn().mockImplementation((callback) => {
      if (typeof callback === "function") {
        const mockTx = {
          qrCode: {
            findMany: jest.fn().mockResolvedValue([]),
            findUnique: jest.fn().mockResolvedValue(null),
            findFirst: jest.fn().mockResolvedValue({
              id: "c987654321098765432109876",
              userId: "test-user-id",
              type: "text",
              title: "Test QR",
              content: "Test content",
              settings: JSON.stringify({
                type: "png",
                color: "#000000",
                width: 256,
                margin: 10,
              }),
              createdAt: new Date(),
              updatedAt: new Date(),
              isFavorite: false,
            }),
            create: jest.fn().mockResolvedValue({
              id: "c987654321098765432109876",
              userId: "test-user-id",
              type: "text",
              title: "Test QR",
              content: "Test content",
              settings: JSON.stringify({
                type: "png",
                color: "#000000",
                width: 256,
                margin: 10,
              }),
              createdAt: new Date(),
              updatedAt: new Date(),
              isFavorite: false,
            }),
            update: jest.fn().mockResolvedValue({
              id: "c987654321098765432109876",
              isFavorite: true,
            }),
            delete: jest.fn().mockResolvedValue({
              id: "c987654321098765432109876",
            }),
            deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
            count: jest.fn().mockResolvedValue(1),
            groupBy: jest.fn().mockResolvedValue([
              { type: "URL", _count: { _all: 5 } },
              { type: "TEXTAREA", _count: { _all: 3 } },
              { type: "EMAIL", _count: { _all: 2 } },
            ]),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue({
              id: "c123456789012345678901234",
              email: "test@example.com",
            }),
            findFirst: jest.fn().mockResolvedValue({
              id: "c123456789012345678901234",
              email: "test@example.com",
            }),
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
          },
          $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
        };
        return callback(mockTx);
      }
      return Promise.resolve();
    }),
  },
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { src, alt, ...rest } = props;
    return `<img src="${src}" alt="${alt}" />`;
  },
}));

// Mock canvas for QR code generation
jest.mock("canvas", () => ({
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(),
      putImageData: jest.fn(),
      createImageData: jest.fn(),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
    })),
    toBuffer: jest.fn(),
    toDataURL: jest.fn(),
  })),
  loadImage: jest.fn(),
}));

// Mock qrcode for testing
jest.mock("qrcode", () => ({
  toDataURL: jest.fn(() =>
    Promise.resolve("data:image/png;base64,mock-qr-code"),
  ),
  toString: jest.fn(() => Promise.resolve("mock-qr-string")),
}));

// Mock environment variables
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    const message = args[0]?.toString() || "";

    // Skip React warnings
    if (
      message.includes("Warning: ReactDOM.render is no longer supported") ||
      message.includes("Warning: An update to") ||
      message.includes("ReactDOMTestUtils.act") ||
      message.includes("useLayoutEffect does nothing on the server") ||
      message.includes("Component definition is missing display name")
    ) {
      return;
    }

    // Skip Radix UI pointer capture warnings
    if (
      message.includes("hasPointerCapture is not a function") ||
      message.includes("scrollIntoView is not a function") ||
      message.includes("Uncaught [TypeError")
    ) {
      return;
    }

    // Skip specific error patterns
    if (message.includes("Consider adding an error boundary")) {
      return;
    }

    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock Next.js runtime APIs for API route testing
global.Request = class MockRequest {
  public method: string;
  private _url: string;
  public headers: Headers;

  constructor(input: string | Request, init?: RequestInit) {
    this.method = init?.method || "GET";
    this._url = typeof input === "string" ? input : input.url;
    this.headers = new Headers(init?.headers);
  }

  get url() {
    return this._url;
  }

  static mockImplementation = jest.fn();
} as any;

global.Response = class MockResponse {
  public status: number;
  public statusText: string;
  public headers: Headers;

  constructor(body?: any, init?: ResponseInit) {
    this.status = init?.status || 200;
    this.statusText = init?.statusText || "OK";
    this.headers = new Headers(init?.headers);
  }

  static json = jest.fn(
    (data: any, init?: ResponseInit) =>
      new MockResponse(JSON.stringify(data), init),
  );
  static mockImplementation = jest.fn();
} as any;

global.Headers = class MockHeaders extends Map {
  get(name: string) {
    return super.get(name.toLowerCase());
  }

  set(name: string, value: string) {
    return super.set(name.toLowerCase(), value);
  }

  has(name: string) {
    return super.has(name.toLowerCase());
  }
} as any;
