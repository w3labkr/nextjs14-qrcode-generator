import axios from "axios";
import { refreshAccessToken } from "@/lib/auth-server";

// Mock dependencies
jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("auth-server", () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    process.env.AUTH_GOOGLE_ISSUER = "https://oauth2.googleapis.com";
    process.env.AUTH_GOOGLE_ID = "test-client-id";
    process.env.AUTH_GOOGLE_SECRET = "test-client-secret";
  });

  afterEach(() => {
    console.error = originalConsoleError;
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
  });

  // handleSignIn과 handleSignOut은 기본적인 테스트만 작성
  describe("handleSignIn", () => {
    it("함수가 존재합니다", async () => {
      const { handleSignIn } = await import("@/lib/auth-server");
      expect(typeof handleSignIn).toBe("function");
    });
  });

  describe("handleSignOut", () => {
    it("함수가 존재합니다", async () => {
      const { handleSignOut } = await import("@/lib/auth-server");
      expect(typeof handleSignOut).toBe("function");
    });
  });
});
