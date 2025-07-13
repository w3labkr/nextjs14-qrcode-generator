import { getAuthStatus } from "@/lib/auth-helpers";
import { auth } from "@/auth";

// auth 모듈을 모킹
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

describe("auth-helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAuthStatus", () => {
    it("인증된 사용자의 경우 올바른 상태를 반환해야 한다", async () => {
      // 인증된 사용자 세션 모킹
      const mockSession = {
        user: {
          id: "user-123",
          name: "John Doe",
          email: "john@example.com",
          image: "https://example.com/avatar.jpg",
        },
        expires: "2024-12-31T23:59:59.999Z",
      };

      (auth as jest.Mock).mockResolvedValue(mockSession);

      const result = await getAuthStatus();

      expect(result).toEqual({
        session: mockSession,
        isAuthenticated: true,
        isUnauthenticated: false,
        user: mockSession.user,
      });
      expect(auth).toHaveBeenCalledTimes(1);
    });

    it("인증되지 않은 사용자의 경우 올바른 상태를 반환해야 한다", async () => {
      // 인증되지 않은 상태 모킹 (null 세션)
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await getAuthStatus();

      expect(result).toEqual({
        session: null,
        isAuthenticated: false,
        isUnauthenticated: true,
        user: null,
      });
      expect(auth).toHaveBeenCalledTimes(1);
    });

    it("세션은 있지만 user가 없는 경우 인증되지 않은 상태로 처리해야 한다", async () => {
      // user가 없는 세션 모킹
      const mockSession = {
        expires: "2024-12-31T23:59:59.999Z",
      };

      (auth as jest.Mock).mockResolvedValue(mockSession);

      const result = await getAuthStatus();

      expect(result).toEqual({
        session: mockSession,
        isAuthenticated: false,
        isUnauthenticated: true,
        user: null,
      });
      expect(auth).toHaveBeenCalledTimes(1);
    });

    it("세션에 user가 있지만 빈 객체인 경우에도 인증된 상태로 처리해야 한다", async () => {
      // 빈 user 객체가 있는 세션 모킹 - JavaScript에서 빈 객체도 truthy
      const mockSession = {
        user: {},
        expires: "2024-12-31T23:59:59.999Z",
      };

      (auth as jest.Mock).mockResolvedValue(mockSession);

      const result = await getAuthStatus();

      expect(result).toEqual({
        session: mockSession,
        isAuthenticated: true,
        isUnauthenticated: false,
        user: {},
      });
      expect(auth).toHaveBeenCalledTimes(1);
    });

    it("최소한의 user 정보만 있는 경우 인증된 상태로 처리해야 한다", async () => {
      // 최소한의 user 정보만 있는 세션
      const mockSession = {
        user: {
          id: "user-456",
        },
        expires: "2024-12-31T23:59:59.999Z",
      };

      (auth as jest.Mock).mockResolvedValue(mockSession);

      const result = await getAuthStatus();

      expect(result).toEqual({
        session: mockSession,
        isAuthenticated: true,
        isUnauthenticated: false,
        user: mockSession.user,
      });
      expect(auth).toHaveBeenCalledTimes(1);
    });

    it("auth() 함수에서 예외가 발생하면 에러를 전파해야 한다", async () => {
      const mockError = new Error("Authentication service unavailable");
      (auth as jest.Mock).mockRejectedValue(mockError);

      await expect(getAuthStatus()).rejects.toThrow("Authentication service unavailable");
      expect(auth).toHaveBeenCalledTimes(1);
    });

    it("세션 객체가 undefined인 경우 인증되지 않은 상태로 처리해야 한다", async () => {
      (auth as jest.Mock).mockResolvedValue(undefined);

      const result = await getAuthStatus();

      expect(result).toEqual({
        session: undefined,
        isAuthenticated: false,
        isUnauthenticated: true,
        user: null,
      });
      expect(auth).toHaveBeenCalledTimes(1);
    });

    it("user 필드만 있고 다른 필드는 없는 경우에도 올바르게 처리해야 한다", async () => {
      const mockSession = {
        user: {
          id: "user-789",
          email: "test@example.com",
        },
      };

      (auth as jest.Mock).mockResolvedValue(mockSession);

      const result = await getAuthStatus();

      expect(result).toEqual({
        session: mockSession,
        isAuthenticated: true,
        isUnauthenticated: false,
        user: mockSession.user,
      });
      expect(auth).toHaveBeenCalledTimes(1);
    });

    it("user.id가 falsy 값인 경우에도 user 객체가 존재하면 인증된 상태로 처리해야 한다", async () => {
      // JavaScript의 !!session?.user는 user 객체 존재 여부만 확인
      const mockSession = {
        user: {
          id: "",
          name: "Empty ID User",
          email: "empty@example.com",
        },
        expires: "2024-12-31T23:59:59.999Z",
      };

      (auth as jest.Mock).mockResolvedValue(mockSession);

      const result = await getAuthStatus();

      expect(result).toEqual({
        session: mockSession,
        isAuthenticated: true,
        isUnauthenticated: false,
        user: mockSession.user,
      });
      expect(auth).toHaveBeenCalledTimes(1);
    });

    it("여러 번 호출해도 일관된 결과를 반환해야 한다", async () => {
      const mockSession = {
        user: {
          id: "consistent-user",
          email: "consistent@example.com",
        },
      };

      (auth as jest.Mock).mockResolvedValue(mockSession);

      const result1 = await getAuthStatus();
      const result2 = await getAuthStatus();

      expect(result1).toEqual(result2);
      expect(auth).toHaveBeenCalledTimes(2);
    });
  });
});
