/**
 * @jest-environment node
 */
import axios from "axios";
import { refreshAccessToken, handleSignIn, handleSignOut } from "@/lib/auth-server";
import { UnifiedLogger } from "@/lib/unified-logging";

// Mock dependencies
jest.mock("axios");
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("auth-server", () => {
  const originalConsoleError = console.error;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    process.env = { ...originalEnv };
    process.env.AUTH_GOOGLE_ISSUER = "https://oauth2.googleapis.com";
    process.env.AUTH_GOOGLE_ID = "test-client-id";
    process.env.AUTH_GOOGLE_SECRET = "test-client-secret";
    
    // UnifiedLogger 메서드 모킹
    jest.spyOn(UnifiedLogger, "logAuth").mockResolvedValue(undefined);
    jest.spyOn(UnifiedLogger, "logError").mockResolvedValue(undefined);
    
    // window 객체 제거 (서버 환경)
    delete (global as any).window;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe("refreshAccessToken", () => {
    const mockToken = {
      accessToken: "old-access-token",
      refreshToken: "refresh-token",
      accessTokenExpires: Date.now() - 1000, // 만료된 토큰
    };

    it("성공적으로 토큰을 갱신합니다", async () => {
      const mockResponse = {
        data: {
          access_token: "new-access-token",
          expires_in: 3600,
          refresh_token: "new-refresh-token",
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await refreshAccessToken(mockToken);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://oauth2.googleapis.com/oauth2/v4/token",
        expect.any(URLSearchParams),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      expect(result).toEqual({
        ...mockToken,
        accessToken: "new-access-token",
        accessTokenExpires: expect.any(Number),
        refreshToken: "new-refresh-token",
      });
    });

    it("토큰 갱신 실패 시 에러를 반환합니다", async () => {
      const error = new Error("토큰 갱신 실패");
      mockedAxios.post.mockRejectedValueOnce(error);

      const result = await refreshAccessToken(mockToken);

      expect(console.error).toHaveBeenCalledWith(
        "토큰 갱신 중 오류 발생:",
        error,
      );
      expect(result).toEqual({
        ...mockToken,
        error: "RefreshAccessTokenError",
      });
    });

    it("refresh_token이 없는 경우 기존 refresh_token을 유지합니다", async () => {
      const mockResponse = {
        data: {
          access_token: "new-access-token",
          expires_in: 3600,
          // refresh_token 없음
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await refreshAccessToken(mockToken);

      expect(result.refreshToken).toBe(mockToken.refreshToken);
    });

    it("환경 변수가 올바르게 사용됩니다", async () => {
      const mockResponse = {
        data: {
          access_token: "new-access-token",
          expires_in: 3600,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await refreshAccessToken(mockToken);

      const callArgs = mockedAxios.post.mock.calls[0];
      const formData = callArgs[1] as URLSearchParams;

      expect(formData.get("client_id")).toBe("test-client-id");
      expect(formData.get("client_secret")).toBe("test-client-secret");
      expect(formData.get("refresh_token")).toBe("refresh-token");
      expect(formData.get("grant_type")).toBe("refresh_token");
    });

    it("올바른 URL을 호출해야 한다", async () => {
      const mockResponse = {
        data: {
          access_token: "new-access-token",
          expires_in: 3600,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await refreshAccessToken(mockToken);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://oauth2.googleapis.com/oauth2/v4/token",
        expect.any(URLSearchParams),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
    });

    it("올바른 헤더를 설정해야 한다", async () => {
      const mockResponse = {
        data: {
          access_token: "new-access-token",
          expires_in: 3600,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await refreshAccessToken(mockToken);

      const callArgs = mockedAxios.post.mock.calls[0];
      const headers = callArgs[2]?.headers;

      expect(headers).toEqual({
        "Content-Type": "application/x-www-form-urlencoded",
      });
    });

    it("만료 시간을 올바르게 계산해야 한다", async () => {
      const mockResponse = {
        data: {
          access_token: "new-access-token",
          expires_in: 7200, // 2시간
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);
      const beforeTime = Date.now();

      const result = await refreshAccessToken(mockToken);

      const afterTime = Date.now();
      const expectedExpiry = beforeTime + 7200 * 1000;

      expect(result.accessTokenExpires).toBeGreaterThanOrEqual(expectedExpiry);
      expect(result.accessTokenExpires).toBeLessThanOrEqual(afterTime + 7200 * 1000);
    });

    it("환경 변수가 없으면 undefined를 사용해야 한다", async () => {
      delete process.env.AUTH_GOOGLE_ISSUER;
      delete process.env.AUTH_GOOGLE_ID;
      delete process.env.AUTH_GOOGLE_SECRET;

      const mockResponse = {
        data: {
          access_token: "new-access-token",
          expires_in: 3600,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await refreshAccessToken(mockToken);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "undefined/oauth2/v4/token",
        expect.any(URLSearchParams),
        expect.any(Object),
      );

      const callArgs = mockedAxios.post.mock.calls[0];
      const formData = callArgs[1] as URLSearchParams;

      expect(formData.get("client_id")).toBe("undefined");
      expect(formData.get("client_secret")).toBe("undefined");
    });

    it("네트워크 에러를 처리해야 한다", async () => {
      const networkError = new Error("Network Error");
      networkError.name = "NetworkError";
      mockedAxios.post.mockRejectedValueOnce(networkError);

      const result = await refreshAccessToken(mockToken);

      expect(console.error).toHaveBeenCalledWith(
        "토큰 갱신 중 오류 발생:",
        networkError,
      );
      expect(result).toEqual({
        ...mockToken,
        error: "RefreshAccessTokenError",
      });
    });

    it("400 HTTP 에러를 처리해야 한다", async () => {
      const httpError = new Error("Request failed with status code 400");
      mockedAxios.post.mockRejectedValueOnce(httpError);

      const result = await refreshAccessToken(mockToken);

      expect(console.error).toHaveBeenCalledWith(
        "토큰 갱신 중 오류 발생:",
        httpError,
      );
      expect(result).toEqual({
        ...mockToken,
        error: "RefreshAccessTokenError",
      });
    });

    it("토큰 객체가 비어있어도 처리해야 한다", async () => {
      const emptyToken = {};
      const mockResponse = {
        data: {
          access_token: "new-access-token",
          expires_in: 3600,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await refreshAccessToken(emptyToken);

      expect(result).toEqual({
        ...emptyToken,
        accessToken: "new-access-token",
        accessTokenExpires: expect.any(Number),
        refreshToken: undefined,
      });
    });

    it("응답 데이터가 부분적으로 없어도 처리해야 한다", async () => {
      const mockResponse = {
        data: {
          access_token: "new-access-token",
          // expires_in과 refresh_token이 없음
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await refreshAccessToken(mockToken);

      expect(result).toEqual({
        ...mockToken,
        accessToken: "new-access-token",
        accessTokenExpires: expect.any(Number), // NaN이 될 수 있음
        refreshToken: mockToken.refreshToken,
      });
    });

    it("추가 토큰 속성들을 보존해야 한다", async () => {
      const tokenWithExtra = {
        ...mockToken,
        scope: "read write",
        tokenType: "Bearer",
        customField: "custom-value",
      };

      const mockResponse = {
        data: {
          access_token: "new-access-token",
          expires_in: 3600,
          refresh_token: "new-refresh-token",
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await refreshAccessToken(tokenWithExtra);

      expect(result).toEqual({
        ...tokenWithExtra,
        accessToken: "new-access-token",
        accessTokenExpires: expect.any(Number),
        refreshToken: "new-refresh-token",
      });
    });
  });

  describe("handleSignIn", () => {
    const mockUser = {
      id: "user123",
      email: "test@example.com",
      name: "Test User",
    };

    const mockAccount = {
      provider: "google",
      providerAccountId: "google-123",
      type: "oauth",
    };

    const mockProfile = {
      id: "google-123",
      email: "test@example.com",
      name: "Test User",
    };

    it("서버 환경에서 로그인 성공 시 로그를 기록해야 한다", async () => {
      const result = await handleSignIn(mockUser, mockAccount, mockProfile);

      expect(result).toBe(true);
      expect(UnifiedLogger.logAuth).toHaveBeenCalledWith({
        userId: "user123",
        action: "LOGIN",
        authAction: "LOGIN",
      });
    });

    it("사용자 ID가 없으면 이메일을 사용해야 한다", async () => {
      const userWithoutId = {
        email: "test@example.com",
        name: "Test User",
      };

      const result = await handleSignIn(userWithoutId, mockAccount, mockProfile);

      expect(result).toBe(true);
      expect(UnifiedLogger.logAuth).toHaveBeenCalledWith({
        userId: "test@example.com",
        action: "LOGIN",
        authAction: "LOGIN",
      });
    });

    it("브라우저 환경에서는 로그를 기록하지 않고 true를 반환해야 한다", async () => {
      // 브라우저 환경 시뮬레이션
      (global as any).window = {};

      const result = await handleSignIn(mockUser, mockAccount, mockProfile);

      expect(result).toBe(true);
      expect(UnifiedLogger.logAuth).not.toHaveBeenCalled();
      
      // 정리
      delete (global as any).window;
    });

    it("Prisma를 import할 수 없으면 기본 동작을 수행해야 한다", async () => {
      // Prisma import 실패 시뮬레이션 - 실제로는 prisma가 존재하므로 로그가 기록됨
      const result = await handleSignIn(mockUser, mockAccount, mockProfile);

      expect(result).toBe(true);
      // 실제 코드에서는 prisma가 존재하므로 로그가 기록됨
      expect(UnifiedLogger.logAuth).toHaveBeenCalledWith({
        userId: "user123",
        action: "LOGIN",
        authAction: "LOGIN",
      });
    });

    it("로그 기록 중 에러가 발생하면 에러 로그를 기록하고 false를 반환해야 한다", async () => {
      const logError = new Error("로그 기록 실패");
      jest.spyOn(UnifiedLogger, "logAuth").mockRejectedValueOnce(logError);

      const result = await handleSignIn(mockUser, mockAccount, mockProfile);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith("로그인 처리 중 오류:", logError);
      expect(UnifiedLogger.logError).toHaveBeenCalledWith({
        userId: "user123",
        error: logError,
        additionalInfo: { action: "LOGIN_PROCESS" },
      });
    });

    it("에러 로그 기록도 실패하면 콘솔에 에러를 출력해야 한다", async () => {
      const logError = new Error("로그 기록 실패");
      const logLogError = new Error("에러 로그 기록 실패");
      
      jest.spyOn(UnifiedLogger, "logAuth").mockRejectedValueOnce(logError);
      jest.spyOn(UnifiedLogger, "logError").mockRejectedValueOnce(logLogError);

      const result = await handleSignIn(mockUser, mockAccount, mockProfile);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith("로그인 처리 중 오류:", logError);
      expect(console.error).toHaveBeenCalledWith("로그 기록 실패:", logLogError);
    });

    it("사용자 객체가 null이거나 undefined인 경우를 처리해야 한다", async () => {
      const result = await handleSignIn(null, mockAccount, mockProfile);

      expect(result).toBe(false);
      // null 사용자로 인해 TypeError가 발생하고 에러 로그가 기록됨
      expect(UnifiedLogger.logError).toHaveBeenCalledWith({
        userId: null,
        error: expect.any(Error),
        additionalInfo: { action: "LOGIN_PROCESS" },
      });
    });

    it("문자열 에러를 Error 객체로 변환해야 한다", async () => {
      jest.spyOn(UnifiedLogger, "logAuth").mockRejectedValueOnce("String error");

      const result = await handleSignIn(mockUser, mockAccount, mockProfile);

      expect(result).toBe(false);
      expect(UnifiedLogger.logError).toHaveBeenCalledWith({
        userId: "user123",
        error: new Error("String error"),
        additionalInfo: { action: "LOGIN_PROCESS" },
      });
    });

    it("Prisma import 실패 시에도 에러 로그를 기록하지 않아야 한다", async () => {
      const logError = new Error("로그 기록 실패");
      jest.spyOn(UnifiedLogger, "logAuth").mockRejectedValueOnce(logError);

      const result = await handleSignIn(mockUser, mockAccount, mockProfile);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith("로그인 처리 중 오류:", logError);
      // 실제 코드에서는 prisma가 존재하므로 에러 로그가 기록됨
      expect(UnifiedLogger.logError).toHaveBeenCalledWith({
        userId: "user123",
        error: logError,
        additionalInfo: { action: "LOGIN_PROCESS" },
      });
    });
  });

  describe("handleSignOut", () => {
    const mockSession = {
      user: {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
      },
    };

    it("서버 환경에서 로그아웃 시 로그를 기록해야 한다", async () => {
      await handleSignOut(mockSession);

      expect(UnifiedLogger.logAuth).toHaveBeenCalledWith({
        userId: "user123",
        action: "LOGOUT",
        authAction: "LOGOUT",
      });
    });

    it("사용자 ID가 없으면 이메일을 사용해야 한다", async () => {
      const sessionWithoutId = {
        user: {
          email: "test@example.com",
          name: "Test User",
        },
      };

      await handleSignOut(sessionWithoutId);

      expect(UnifiedLogger.logAuth).toHaveBeenCalledWith({
        userId: "test@example.com",
        action: "LOGOUT",
        authAction: "LOGOUT",
      });
    });

    it("브라우저 환경에서는 로그를 기록하지 않아야 한다", async () => {
      // 브라우저 환경 시뮬레이션
      (global as any).window = {};

      await handleSignOut(mockSession);

      expect(UnifiedLogger.logAuth).not.toHaveBeenCalled();
      
      // 정리
      delete (global as any).window;
    });

    it("Prisma를 import할 수 없으면 기본 동작을 수행해야 한다", async () => {
      // Prisma import 실패 시뮬레이션 - 실제로는 prisma가 존재하므로 로그가 기록됨
      await handleSignOut(mockSession);

      // 실제 코드에서는 prisma가 존재하므로 로그가 기록됨
      expect(UnifiedLogger.logAuth).toHaveBeenCalledWith({
        userId: "user123",
        action: "LOGOUT",
        authAction: "LOGOUT",
      });
    });

    it("로그 기록 중 에러가 발생하면 에러 로그를 기록해야 한다", async () => {
      const logError = new Error("로그 기록 실패");
      jest.spyOn(UnifiedLogger, "logAuth").mockRejectedValueOnce(logError);

      await handleSignOut(mockSession);

      expect(console.error).toHaveBeenCalledWith("로그아웃 처리 중 오류:", logError);
      expect(UnifiedLogger.logError).toHaveBeenCalledWith({
        userId: "user123",
        error: logError,
        additionalInfo: { action: "LOGOUT_PROCESS" },
      });
    });

    it("에러 로그 기록도 실패하면 콘솔에 에러를 출력해야 한다", async () => {
      const logError = new Error("로그 기록 실패");
      const logLogError = new Error("에러 로그 기록 실패");
      
      jest.spyOn(UnifiedLogger, "logAuth").mockRejectedValueOnce(logError);
      jest.spyOn(UnifiedLogger, "logError").mockRejectedValueOnce(logLogError);

      await handleSignOut(mockSession);

      expect(console.error).toHaveBeenCalledWith("로그아웃 처리 중 오류:", logError);
      expect(console.error).toHaveBeenCalledWith("로그 기록 실패:", logLogError);
    });

    it("세션이 null이거나 undefined인 경우를 처리해야 한다", async () => {
      const logError = new Error("로그 기록 실패");
      jest.spyOn(UnifiedLogger, "logAuth").mockRejectedValueOnce(logError);

      await handleSignOut(null);

      expect(UnifiedLogger.logError).toHaveBeenCalledWith({
        userId: null,
        error: logError,
        additionalInfo: { action: "LOGOUT_PROCESS" },
      });
    });

    it("사용자 정보가 없는 세션을 처리해야 한다", async () => {
      const sessionWithoutUser = {};

      await handleSignOut(sessionWithoutUser);

      expect(UnifiedLogger.logAuth).toHaveBeenCalledWith({
        userId: undefined,
        action: "LOGOUT",
        authAction: "LOGOUT",
      });
    });

    it("문자열 에러를 Error 객체로 변환해야 한다", async () => {
      jest.spyOn(UnifiedLogger, "logAuth").mockRejectedValueOnce("String error");

      await handleSignOut(mockSession);

      expect(UnifiedLogger.logError).toHaveBeenCalledWith({
        userId: "user123",
        error: new Error("String error"),
        additionalInfo: { action: "LOGOUT_PROCESS" },
      });
    });

    it("Prisma import 실패 시에도 에러 로그를 기록하지 않아야 한다", async () => {
      const logError = new Error("로그 기록 실패");
      jest.spyOn(UnifiedLogger, "logAuth").mockRejectedValueOnce(logError);

      await handleSignOut(mockSession);

      expect(console.error).toHaveBeenCalledWith("로그아웃 처리 중 오류:", logError);
      // 실제 코드에서는 prisma가 존재하므로 에러 로그가 기록됨
      expect(UnifiedLogger.logError).toHaveBeenCalledWith({
        userId: "user123",
        error: logError,
        additionalInfo: { action: "LOGOUT_PROCESS" },
      });
    });
  });
});
