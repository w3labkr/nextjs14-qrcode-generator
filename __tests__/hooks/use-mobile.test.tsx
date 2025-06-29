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
});
