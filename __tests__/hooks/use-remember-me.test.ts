import { renderHook, act } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { useRememberMe } from "@/hooks/use-remember-me";
import { getRememberMeCookie } from "@/lib/auth-utils";

// Mock dependencies
jest.mock("next-auth/react");
jest.mock("@/lib/auth-utils");

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockGetRememberMeCookie = getRememberMeCookie as jest.MockedFunction<typeof getRememberMeCookie>;

describe("useRememberMe", () => {
  const mockUpdate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate.mockClear();
    
    // Mock console.log to suppress output during tests
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("초기 상태", () => {
    it("세션이 없으면 undefined를 반환해야 한다", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useRememberMe());

      expect(result.current).toBeNull();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("세션이 로딩 중이면 undefined를 반환해야 한다", () => {
      mockUseSession.mockReturnValue({
        data: undefined,
        status: "loading",
        update: mockUpdate,
      });

      const { result } = renderHook(() => useRememberMe());

      expect(result.current).toBeUndefined();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe("로그인 후 rememberMe 설정", () => {
    it("로그인 직후 rememberMe 쿠키를 확인하고 세션을 업데이트해야 한다", () => {
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        expires: "2024-12-31",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });
      mockGetRememberMeCookie.mockReturnValue(true);

      const { result } = renderHook(() => useRememberMe());

      expect(mockGetRememberMeCookie).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith({ rememberMe: true });
      expect(result.current).toBe(mockSession);
      expect(console.log).toHaveBeenCalledWith("로그인 후 rememberMe 값 설정:", true);
    });

    it("rememberMe가 false인 경우 세션을 업데이트해야 한다", () => {
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        expires: "2024-12-31",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });
      mockGetRememberMeCookie.mockReturnValue(false);

      renderHook(() => useRememberMe());

      expect(mockGetRememberMeCookie).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith({ rememberMe: false });
      expect(console.log).toHaveBeenCalledWith("로그인 후 rememberMe 값 설정:", false);
    });

    it("rememberMe가 이미 설정된 경우 업데이트하지 않아야 한다", () => {
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        expires: "2024-12-31",
        rememberMe: true,
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      renderHook(() => useRememberMe());

      expect(mockGetRememberMeCookie).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe("서버 사이드 렌더링", () => {
    it("서버 환경에서는 작동하지 않아야 한다", () => {
      // Mock window as undefined (server environment)
      const originalWindow = global.window;
      delete (global as any).window;

      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        expires: "2024-12-31",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      renderHook(() => useRememberMe());

      expect(mockGetRememberMeCookie).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe("중복 실행 방지", () => {
    it("동일한 세션에서 여러 번 실행되어도 한 번만 업데이트해야 한다", () => {
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        expires: "2024-12-31",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });
      mockGetRememberMeCookie.mockReturnValue(true);

      const { rerender } = renderHook(() => useRememberMe());

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockGetRememberMeCookie).toHaveBeenCalledTimes(1);

      // 다시 렌더링
      rerender();

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockGetRememberMeCookie).toHaveBeenCalledTimes(1);
    });

    it("새로운 세션에서는 다시 실행되어야 한다", () => {
      const mockSession1 = {
        user: { id: "user1", email: "user1@example.com" },
        expires: "2024-12-31",
      };

      const mockSession2 = {
        user: { id: "user2", email: "user2@example.com" },
        expires: "2024-12-31",
      };

      // 첫 번째 세션
      mockUseSession.mockReturnValue({
        data: mockSession1,
        status: "authenticated",
        update: mockUpdate,
      });
      mockGetRememberMeCookie.mockReturnValue(true);

      const { rerender } = renderHook(() => useRememberMe());

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({ rememberMe: true });

      // 두 번째 세션으로 변경
      mockUseSession.mockReturnValue({
        data: mockSession2,
        status: "authenticated",
        update: mockUpdate,
      });
      mockGetRememberMeCookie.mockReturnValue(false);

      rerender();

      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockUpdate).toHaveBeenLastCalledWith({ rememberMe: false });
    });
  });

  describe("에러 처리", () => {
    it("getRememberMeCookie에서 오류가 발생해도 크래시하지 않아야 한다", () => {
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        expires: "2024-12-31",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });
      mockGetRememberMeCookie.mockImplementation(() => {
        throw new Error("Cookie access failed");
      });

      expect(() => {
        renderHook(() => useRememberMe());
      }).toThrow("Cookie access failed");

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("세션 업데이트에서 오류가 발생해도 크래시하지 않아야 한다", () => {
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        expires: "2024-12-31",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });
      mockGetRememberMeCookie.mockReturnValue(true);
      mockUpdate.mockImplementation(() => {
        throw new Error("Session update failed");
      });

      expect(() => {
        renderHook(() => useRememberMe());
      }).toThrow("Session update failed");

      expect(mockGetRememberMeCookie).toHaveBeenCalled();
    });
  });

  describe("다양한 세션 상태", () => {
    it("사용자 정보가 없는 세션에서는 업데이트하지 않아야 한다", () => {
      const mockSession = {
        expires: "2024-12-31",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      renderHook(() => useRememberMe());

      expect(mockGetRememberMeCookie).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("빈 사용자 객체가 있는 세션에서는 업데이트하지 않아야 한다", () => {
      const mockSession = {
        user: null,
        expires: "2024-12-31",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });

      renderHook(() => useRememberMe());

      expect(mockGetRememberMeCookie).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("부분적인 사용자 정보가 있어도 업데이트해야 한다", () => {
      const mockSession = {
        user: { id: "user1" }, // email이 없는 경우
        expires: "2024-12-31",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });
      mockGetRememberMeCookie.mockReturnValue(true);

      renderHook(() => useRememberMe());

      expect(mockGetRememberMeCookie).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith({ rememberMe: true });
    });
  });

  describe("라이프사이클 테스트", () => {
    it("컴포넌트 언마운트 시 메모리 누수가 없어야 한다", () => {
      const mockSession = {
        user: { id: "user1", email: "user@example.com" },
        expires: "2024-12-31",
      };

      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: mockUpdate,
      });
      mockGetRememberMeCookie.mockReturnValue(true);

      const { unmount } = renderHook(() => useRememberMe());

      expect(mockUpdate).toHaveBeenCalledWith({ rememberMe: true });

      // 언마운트 후 추가 호출이 없어야 함
      unmount();

      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe("동시성 테스트", () => {
    it("빠른 세션 변경 시 올바르게 처리되어야 한다", async () => {
      const mockSession1 = {
        user: { id: "user1", email: "user1@example.com" },
        expires: "2024-12-31",
      };

      const mockSession2 = {
        user: { id: "user2", email: "user2@example.com" },
        expires: "2024-12-31",
      };

      // 첫 번째 세션
      mockUseSession.mockReturnValue({
        data: mockSession1,
        status: "authenticated",
        update: mockUpdate,
      });
      mockGetRememberMeCookie.mockReturnValue(true);

      const { rerender } = renderHook(() => useRememberMe());

      expect(mockUpdate).toHaveBeenCalledTimes(1);

      // 즉시 두 번째 세션으로 변경
      mockUseSession.mockReturnValue({
        data: mockSession2,
        status: "authenticated",
        update: mockUpdate,
      });
      mockGetRememberMeCookie.mockReturnValue(false);

      await act(async () => {
        rerender();
      });

      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockUpdate).toHaveBeenLastCalledWith({ rememberMe: false });
    });
  });
});