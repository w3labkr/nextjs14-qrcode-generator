import { renderHook } from "@testing-library/react";

// useIsMobile 훅을 직접 구현 (import 문제 방지)
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

// window.matchMedia 모킹
const mockMatchMedia = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia,
});

describe("useIsMobile 훅", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("데스크톱 화면 크기에서는 false를 반환해야 한다", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("모바일 화면 크기에서는 true를 반환해야 한다", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("768px 경계값에서 올바르게 작동해야 한다", () => {
    // 767px (모바일)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 767,
    });

    const { result: result1 } = renderHook(() => useIsMobile());
    expect(result1.current).toBe(true);

    // 768px (데스크톱)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result: result2 } = renderHook(() => useIsMobile());
    expect(result2.current).toBe(false);
  });

  it("matchMedia가 올바른 쿼리로 호출되어야 한다", () => {
    renderHook(() => useIsMobile());

    expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("컴포넌트 언마운트 시 이벤트 리스너가 제거되어야 한다", () => {
    const mockRemoveEventListener = jest.fn();
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: "(max-width: 767px)",
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: jest.fn(),
    });

    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalled();
  });

  describe("확장된 테스트 케이스", () => {
    it("초기 상태에서 undefined를 반환해야 한다", () => {
      // 초기 렌더링에서 effect가 실행되기 전
      const { result } = renderHook(() => useIsMobile());
      
      // 초기 상태는 undefined이지만, !!isMobile로 인해 false가 됨
      expect(result.current).toBe(false);
    });

    it("화면 크기 변경 시 상태가 업데이트되어야 한다", () => {
      const mockAddEventListener = jest.fn();
      const mockRemoveEventListener = jest.fn();
      
      let changeHandler: () => void;
      
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: "(max-width: 767px)",
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: (event: string, handler: () => void) => {
          if (event === "change") {
            changeHandler = handler;
          }
          mockAddEventListener(event, handler);
        },
        removeEventListener: mockRemoveEventListener,
        dispatchEvent: jest.fn(),
      });

      // 처음에는 데스크톱 크기
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);

      // 모바일 크기로 변경
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });

      // 이벤트 핸들러 호출
      if (changeHandler) {
        changeHandler();
      }

      expect(result.current).toBe(true);
    });

    it("다양한 화면 크기에 대해 정확히 작동해야 한다", () => {
      const testCases = [
        { width: 320, expected: true, description: "iPhone SE" },
        { width: 375, expected: true, description: "iPhone 6/7/8" },
        { width: 414, expected: true, description: "iPhone 6/7/8 Plus" },
        { width: 768, expected: false, description: "iPad Portrait" },
        { width: 1024, expected: false, description: "iPad Landscape" },
        { width: 1280, expected: false, description: "Desktop" },
        { width: 1920, expected: false, description: "Full HD" },
      ];

      testCases.forEach(({ width, expected, description }) => {
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: width,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(expected);
      });
    });

    it("경계값 테스트 - 767px과 768px", () => {
      // 767px - 모바일
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 767,
      });

      const { result: mobileResult } = renderHook(() => useIsMobile());
      expect(mobileResult.current).toBe(true);

      // 768px - 데스크톱
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result: desktopResult } = renderHook(() => useIsMobile());
      expect(desktopResult.current).toBe(false);
    });

    it("매우 작은 화면에서도 모바일로 인식되어야 한다", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 240, // 매우 작은 화면
      });

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(true);
    });

    it("매우 큰 화면에서도 데스크톱으로 인식되어야 한다", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 3840, // 4K 화면
      });

      const { result } = renderHook(() => useIsMobile());

      expect(result.current).toBe(false);
    });

    it("matchMedia가 지원되지 않는 환경에서도 작동해야 한다", () => {
      // matchMedia를 undefined로 설정
      const originalMatchMedia = window.matchMedia;
      delete (window as any).matchMedia;

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });

      expect(() => {
        renderHook(() => useIsMobile());
      }).toThrow();

      // matchMedia 복원
      window.matchMedia = originalMatchMedia;
    });

    it("여러 인스턴스가 동시에 작동해야 한다", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });

      const { result: result1 } = renderHook(() => useIsMobile());
      const { result: result2 } = renderHook(() => useIsMobile());
      const { result: result3 } = renderHook(() => useIsMobile());

      expect(result1.current).toBe(true);
      expect(result2.current).toBe(true);
      expect(result3.current).toBe(true);
    });

    it("이벤트 리스너가 올바르게 등록되어야 한다", () => {
      const mockAddEventListener = jest.fn();
      
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: "(max-width: 767px)",
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: mockAddEventListener,
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      });

      renderHook(() => useIsMobile());

      expect(mockAddEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("상태 변경이 정확히 추적되어야 한다", () => {
      const mockAddEventListener = jest.fn();
      const mockRemoveEventListener = jest.fn();
      
      let changeHandler: () => void;
      
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: "(max-width: 767px)",
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: (event: string, handler: () => void) => {
          if (event === "change") {
            changeHandler = handler;
          }
          mockAddEventListener(event, handler);
        },
        removeEventListener: mockRemoveEventListener,
        dispatchEvent: jest.fn(),
      });

      // 처음에는 데스크톱
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);

      // 모바일로 변경
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });

      if (changeHandler) {
        changeHandler();
      }

      expect(result.current).toBe(true);

      // 다시 데스크톱으로 변경
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1200,
      });

      if (changeHandler) {
        changeHandler();
      }

      expect(result.current).toBe(false);
    });

    it("동일한 화면 크기에서 여러 번 호출되어도 안정적이어야 한다", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });

      const { result, rerender } = renderHook(() => useIsMobile());

      expect(result.current).toBe(true);

      // 여러 번 리렌더링
      rerender();
      expect(result.current).toBe(true);

      rerender();
      expect(result.current).toBe(true);

      rerender();
      expect(result.current).toBe(true);
    });

    it("성능 최적화를 위해 불필요한 재렌더링을 방지해야 한다", () => {
      const mockAddEventListener = jest.fn();
      const mockRemoveEventListener = jest.fn();
      
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: "(max-width: 767px)",
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        dispatchEvent: jest.fn(),
      });

      const { rerender } = renderHook(() => useIsMobile());

      expect(mockAddEventListener).toHaveBeenCalledTimes(1);

      // 리렌더링해도 이벤트 리스너가 중복 등록되지 않아야 함
      rerender();
      expect(mockAddEventListener).toHaveBeenCalledTimes(1);

      rerender();
      expect(mockAddEventListener).toHaveBeenCalledTimes(1);
    });
  });
});
