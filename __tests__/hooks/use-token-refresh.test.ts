import { renderHook, act, waitFor } from "@testing-library/react";
import { useSession, signOut } from "next-auth/react";
import { useTokenRefresh } from "@/hooks/use-token-refresh";
import { appConfig } from "@/config/app";

// Mock dependencies
jest.mock("next-auth/react");
jest.mock("@/config/app", () => ({
  appConfig: {
    session: {
      refreshThresholdSeconds: 300, // 5분
    },
  },
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;

describe("useTokenRefresh", () => {
  const mockUpdate = jest.fn();
  let mockDateNow: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUpdate.mockClear();
    
    // Mock console methods
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Mock Date.now to return consistent timestamps
    mockDateNow = jest.spyOn(Date, "now").mockReturnValue(1000000000); // 1970-01-12T13:46:40.000Z
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("초기 상태", () => {
    it("세션이 없을 때 기본값을 반환해야 한다", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useTokenRefresh());

      expect(result.current.session).toBeNull();
      expect(result.current.status).toBe("unauthenticated");
      expect(result.current.isTokenExpiring).toBe(false);
      expect(result.current.hasTokenError).toBe(false);
      expect(result.current.timeUntilExpiry).toBe(0);
    });

    it("세션이 로딩 중일 때 적절한 상태를 반환해야 한다", () => {
      mockUseSession.mockReturnValue({
        data: undefined,
        status: "loading",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useTokenRefresh());

      expect(result.current.session).toBeUndefined();
      expect(result.current.status).toBe("loading");
      expect(result.current.isTokenExpiring).toBe(false);
      expect(result.current.hasTokenError).toBe(false);
    });
  });

  describe("토큰 갱신 스케줄링", () => {
    it("기억하기가 설정된 경우 토큰 갱신을 스케줄링해야 한다", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1시간 후
      
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: futureTimestamp,
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      renderHook(() => useTokenRefresh());

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("토큰 갱신이")
      );
    });

    it("기억하기가 설정되지 않은 경우 토큰 갱신을 스케줄링하지 않아야 한다", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600;
      
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: futureTimestamp,
        rememberMe: false,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      renderHook(() => useTokenRefresh());

      // 갱신 예약 로그가 없어야 함
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining("토큰 갱신이")
      );
    });

    it("토큰 만료 시간이 임계값보다 가까운 경우 즉시 갱신해야 한다", async () => {
      const nearExpiry = Math.floor(Date.now() / 1000) + 100; // 100초 후 (임계값 300초보다 짧음)
      
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: nearExpiry,
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      renderHook(() => useTokenRefresh());

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith("토큰 자동 갱신 시작...");
      });
    });
  });

  describe("토큰 갱신 실행", () => {
    it("토큰 갱신이 성공적으로 실행되어야 한다", async () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 600; // 10분 후
      
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: futureTimestamp,
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useTokenRefresh());

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(mockUpdate).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith("토큰 자동 갱신 시작...");
      expect(console.log).toHaveBeenCalledWith("토큰 갱신 완료");
    });

    it("토큰 갱신 중 오류가 발생하면 에러를 로그해야 한다", async () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 600;
      
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: futureTimestamp,
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      const refreshError = new Error("Token refresh failed");
      mockUpdate.mockRejectedValue(refreshError);

      const { result } = renderHook(() => useTokenRefresh());

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(console.error).toHaveBeenCalledWith("토큰 갱신 중 오류:", refreshError);
    });

    it("동시에 여러 토큰 갱신이 요청되면 하나만 실행되어야 한다", async () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 600;
      
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: futureTimestamp,
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useTokenRefresh());

      // 동시에 두 번 호출
      await act(async () => {
        await Promise.all([
          result.current.refreshToken(),
          result.current.refreshToken(),
        ]);
      });

      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe("자동 로그아웃", () => {
    it("RefreshAccessTokenError 시 자동 로그아웃해야 한다", () => {
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        error: "RefreshAccessTokenError",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      renderHook(() => useTokenRefresh());

      expect(console.warn).toHaveBeenCalledWith("토큰 갱신 실패로 인한 자동 로그아웃");
      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/auth/signin" });
    });

    it("AccessTokenExpired 시 자동 로그아웃해야 한다", () => {
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        error: "AccessTokenExpired",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      renderHook(() => useTokenRefresh());

      expect(console.warn).toHaveBeenCalledWith("기억하기 미설정으로 인한 토큰 만료 - 자동 로그아웃");
      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/auth/signin" });
    });
  });

  describe("상태 계산", () => {
    it("isTokenExpiring이 올바르게 계산되어야 한다", () => {
      const nearExpiry = Math.floor(Date.now() / 1000) + 200; // 200초 후 (임계값 300초보다 짧음)
      
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: nearExpiry,
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useTokenRefresh());

      expect(result.current.isTokenExpiring).toBe(true);
    });

    it("hasTokenError가 올바르게 계산되어야 한다", () => {
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        error: "RefreshAccessTokenError",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useTokenRefresh());

      expect(result.current.hasTokenError).toBe(true);
    });

    it("timeUntilExpiry가 올바르게 계산되어야 한다", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 1800; // 30분 후
      
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: futureTimestamp,
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useTokenRefresh());

      expect(result.current.timeUntilExpiry).toBe(1800);
    });

    it("토큰이 이미 만료된 경우 timeUntilExpiry가 0이어야 한다", () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 100; // 100초 전
      
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: pastTimestamp,
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useTokenRefresh());

      expect(result.current.timeUntilExpiry).toBe(0);
    });
  });

  describe("서버 사이드 렌더링", () => {
    it("서버 환경에서는 토큰 갱신을 실행하지 않아야 한다", async () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const futureTimestamp = Math.floor(Date.now() / 1000) + 600;
      
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: futureTimestamp,
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useTokenRefresh());

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(mockUpdate).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });

  describe("타이머 관리", () => {
    it("컴포넌트 언마운트 시 타이머가 정리되어야 한다", () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 600;
      
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: futureTimestamp,
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      const { unmount } = renderHook(() => useTokenRefresh());

      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it("새로운 토큰 갱신 스케줄링 시 이전 타이머가 정리되어야 한다", () => {
      const futureTimestamp1 = Math.floor(Date.now() / 1000) + 600;
      const futureTimestamp2 = Math.floor(Date.now() / 1000) + 1200;
      
      const mockSession1 = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: futureTimestamp1,
        rememberMe: true,
      };

      const mockSession2 = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: futureTimestamp2,
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession1,
        status: "authenticated",
        update: mockUpdate,
      });

      const { rerender } = renderHook(() => useTokenRefresh());

      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

      // 세션 업데이트
      mockUseSession.mockReturnValue({
        data: mockSession2,
        status: "authenticated",
        update: mockUpdate,
      });

      rerender();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe("에지 케이스", () => {
    it("accessTokenExpires가 없는 경우 처리되어야 한다", () => {
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useTokenRefresh());

      expect(result.current.isTokenExpiring).toBe(false);
      expect(result.current.timeUntilExpiry).toBe(0);
    });

    it("세션 상태 변경 시 적절히 대응해야 한다", () => {
      // 처음에는 unauthenticated
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: mockUpdate,
      });

      const { result, rerender } = renderHook(() => useTokenRefresh());

      expect(result.current.status).toBe("unauthenticated");

      // authenticated로 변경
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        accessTokenExpires: Math.floor(Date.now() / 1000) + 600,
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      rerender();

      expect(result.current.status).toBe("authenticated");
      expect(result.current.session).toBe(mockSession);
    });
  });
});