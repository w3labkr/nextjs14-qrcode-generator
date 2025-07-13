import { setRememberMeCookie, getRememberMeCookie } from "@/lib/auth-utils";

// appConfig 모킹
jest.mock("@/config/app", () => ({
  appConfig: {
    session: {
      sessionMaxAgeRemember: 2592000, // 30일
    },
  },
}));

describe("auth-utils", () => {
  // 각 테스트 전에 document.cookie 초기화
  beforeEach(() => {
    // jsdom에서 document.cookie를 초기화
    Object.defineProperty(document, "cookie", {
      writable: true,
      configurable: true,
      value: "",
    });
  });

  describe("setRememberMeCookie", () => {
    it("remember가 true인 경우 쿠키를 올바르게 설정해야 한다", () => {
      const mockCookieSetter = jest.fn();
      Object.defineProperty(document, "cookie", {
        set: mockCookieSetter,
        configurable: true,
      });

      setRememberMeCookie(true);

      expect(mockCookieSetter).toHaveBeenCalledWith(
        "remember-me=true; path=/; max-age=2592000; secure; samesite=strict"
      );
    });

    it("remember가 false인 경우 쿠키를 올바르게 설정해야 한다", () => {
      const mockCookieSetter = jest.fn();
      Object.defineProperty(document, "cookie", {
        set: mockCookieSetter,
        configurable: true,
      });

      setRememberMeCookie(false);

      expect(mockCookieSetter).toHaveBeenCalledWith(
        "remember-me=false; path=/; max-age=2592000; secure; samesite=strict"
      );
    });

    it("appConfig의 sessionMaxAgeRemember 값을 사용해야 한다", () => {
      const mockCookieSetter = jest.fn();
      Object.defineProperty(document, "cookie", {
        set: mockCookieSetter,
        configurable: true,
      });

      setRememberMeCookie(true);

      const cookieCall = mockCookieSetter.mock.calls[0][0];
      expect(cookieCall).toContain("max-age=2592000");
    });

    it("보안 설정이 포함되어야 한다", () => {
      const mockCookieSetter = jest.fn();
      Object.defineProperty(document, "cookie", {
        set: mockCookieSetter,
        configurable: true,
      });

      setRememberMeCookie(true);

      const cookieCall = mockCookieSetter.mock.calls[0][0];
      expect(cookieCall).toContain("secure");
      expect(cookieCall).toContain("samesite=strict");
      expect(cookieCall).toContain("path=/");
    });
  });

  describe("getRememberMeCookie", () => {
    it("remember-me 쿠키가 true인 경우 true를 반환해야 한다", () => {
      Object.defineProperty(document, "cookie", {
        value: "remember-me=true; other-cookie=value",
        writable: true,
      });

      const result = getRememberMeCookie();
      expect(result).toBe(true);
    });

    it("remember-me 쿠키가 false인 경우 false를 반환해야 한다", () => {
      Object.defineProperty(document, "cookie", {
        value: "remember-me=false; other-cookie=value",
        writable: true,
      });

      const result = getRememberMeCookie();
      expect(result).toBe(false);
    });

    it("remember-me 쿠키가 없는 경우 false를 반환해야 한다", () => {
      Object.defineProperty(document, "cookie", {
        value: "other-cookie=value; another-cookie=test",
        writable: true,
      });

      const result = getRememberMeCookie();
      expect(result).toBe(false);
    });

    it("remember-me 쿠키가 true가 아닌 다른 값인 경우 false를 반환해야 한다", () => {
      Object.defineProperty(document, "cookie", {
        value: "remember-me=maybe; other-cookie=value",
        writable: true,
      });

      const result = getRememberMeCookie();
      expect(result).toBe(false);
    });

    it("여러 쿠키 중에서 remember-me 쿠키를 올바르게 찾아야 한다", () => {
      Object.defineProperty(document, "cookie", {
        value: "session=abc123; remember-me=true; theme=dark; lang=ko",
        writable: true,
      });

      const result = getRememberMeCookie();
      expect(result).toBe(true);
    });

    it("쿠키 값에 공백이 있어도 올바르게 처리해야 한다", () => {
      // 실제 함수가 trim()을 사용하므로 이 테스트는 공백이 있는 쿠키 이름과 값을 테스트
      Object.defineProperty(document, "cookie", {
        value: "other=test; remember-me=true; another=value",
        writable: true,
        configurable: true,
      });

      const result = getRememberMeCookie();
      expect(result).toBe(true);
    });

    it("remember-me가 부분 문자열로 포함된 다른 쿠키와 구분해야 한다", () => {
      Object.defineProperty(document, "cookie", {
        value: "not-remember-me=true; other-remember-me=false",
        writable: true,
      });

      const result = getRememberMeCookie();
      expect(result).toBe(false);
    });

    it("빈 문자열 쿠키인 경우 false를 반환해야 한다", () => {
      Object.defineProperty(document, "cookie", {
        value: "",
        writable: true,
      });

      const result = getRememberMeCookie();
      expect(result).toBe(false);
    });

    it("서버 사이드 환경(document가 undefined)에서 false를 반환해야 한다", () => {
      // document를 undefined로 모킹
      const originalDocument = global.document;
      delete (global as any).document;

      const result = getRememberMeCookie();
      expect(result).toBe(false);

      // document 복원
      global.document = originalDocument;
    });

    it("remember-me 쿠키가 = 기호 없이 잘못된 형식인 경우를 처리해야 한다", () => {
      Object.defineProperty(document, "cookie", {
        value: "remember-me; valid-cookie=value",
        writable: true,
      });

      const result = getRememberMeCookie();
      expect(result).toBe(false);
    });

    it("remember-me 쿠키가 여러 번 설정된 경우 첫 번째 값을 사용해야 한다", () => {
      Object.defineProperty(document, "cookie", {
        value: "remember-me=true; remember-me=false; other=value",
        writable: true,
      });

      const result = getRememberMeCookie();
      expect(result).toBe(true);
    });

    it("쿠키 값이 빈 문자열인 경우 false를 반환해야 한다", () => {
      Object.defineProperty(document, "cookie", {
        value: "remember-me=; other-cookie=value",
        writable: true,
      });

      const result = getRememberMeCookie();
      expect(result).toBe(false);
    });
  });
});
