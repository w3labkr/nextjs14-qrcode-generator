import { appConfig } from "@/config/app";

describe("App Configuration", () => {
  describe("appConfig", () => {
    it("앱 이름이 올바르게 설정되어 있어야 한다", () => {
      expect(appConfig.name).toBe("QR Code Generator");
    });

    it("앱 설명이 올바르게 설정되어 있어야 한다", () => {
      expect(appConfig.description).toBe(
        "다양한 유형의 QR 코드를 생성할 수 있는 웹 애플리케이션입니다.",
      );
    });

    it("버전이 v로 시작하는 문자열이어야 한다", () => {
      expect(appConfig.version).toMatch(/^v\d+\.\d+\.\d+/);
    });

    it("URL이 올바른 형식이어야 한다", () => {
      const urlRegex = /^https?:\/\/.+/;
      expect(appConfig.url).toMatch(urlRegex);
    });

    it("session 설정이 모든 필요한 속성을 가져야 한다", () => {
      expect(appConfig.session).toHaveProperty("refreshThresholdSeconds");
      expect(appConfig.session).toHaveProperty("sessionRefetchInterval");
      expect(appConfig.session).toHaveProperty("accessTokenExpiresIn");
      expect(appConfig.session).toHaveProperty("refreshTokenExpiresIn");
      expect(appConfig.session).toHaveProperty("manualRefreshThreshold");
      expect(appConfig.session).toHaveProperty("sessionMaxAgeDefault");
      expect(appConfig.session).toHaveProperty("sessionMaxAgeRemember");
    });

    it("토큰 갱신 임계값이 적절해야 한다", () => {
      expect(appConfig.session.refreshThresholdSeconds).toBe(600); // 10분
      expect(appConfig.session.refreshThresholdSeconds).toBeGreaterThan(0);
    });

    it("세션 갱신 주기가 적절해야 한다", () => {
      expect(appConfig.session.sessionRefetchInterval).toBe(180); // 3분
      expect(appConfig.session.sessionRefetchInterval).toBeGreaterThan(0);
    });

    it("액세스 토큰 만료 시간이 적절해야 한다", () => {
      expect(appConfig.session.accessTokenExpiresIn).toBe(3600); // 1시간
      expect(appConfig.session.accessTokenExpiresIn).toBeGreaterThan(0);
    });

    it("리프레시 토큰 만료 시간이 적절해야 한다", () => {
      expect(appConfig.session.refreshTokenExpiresIn).toBe(2592000); // 30일
      expect(appConfig.session.refreshTokenExpiresIn).toBeGreaterThan(0);
    });

    it("수동 갱신 임계값이 적절해야 한다", () => {
      expect(appConfig.session.manualRefreshThreshold).toBe(900); // 15분
      expect(appConfig.session.manualRefreshThreshold).toBeGreaterThan(0);
    });

    it("기본 세션 만료 시간이 적절해야 한다", () => {
      expect(appConfig.session.sessionMaxAgeDefault).toBe(86400); // 1일
      expect(appConfig.session.sessionMaxAgeDefault).toBeGreaterThan(0);
    });

    it("기억하기 세션 만료 시간이 적절해야 한다", () => {
      expect(appConfig.session.sessionMaxAgeRemember).toBe(2592000); // 30일
      expect(appConfig.session.sessionMaxAgeRemember).toBeGreaterThan(0);
    });

    it("기억하기 세션이 기본 세션보다 길어야 한다", () => {
      expect(appConfig.session.sessionMaxAgeRemember).toBeGreaterThan(
        appConfig.session.sessionMaxAgeDefault,
      );
    });

    it("리프레시 토큰이 액세스 토큰보다 오래 지속되어야 한다", () => {
      expect(appConfig.session.refreshTokenExpiresIn).toBeGreaterThan(
        appConfig.session.accessTokenExpiresIn,
      );
    });

    it("수동 갱신 임계값이 토큰 갱신 임계값보다 커야 한다", () => {
      expect(appConfig.session.manualRefreshThreshold).toBeGreaterThan(
        appConfig.session.refreshThresholdSeconds,
      );
    });

    it("설정 객체의 타입이 올바르게 정의되어 있어야 한다", () => {
      // 타입스크립트 컴파일 타임에 as const로 읽기 전용으로 처리됨
      expect(typeof appConfig.name).toBe("string");
      expect(typeof appConfig.description).toBe("string");
      expect(typeof appConfig.version).toBe("string");
      expect(typeof appConfig.url).toBe("string");
      expect(typeof appConfig.session).toBe("object");
    });

    it("모든 세션 값이 숫자여야 한다", () => {
      Object.values(appConfig.session).forEach((value) => {
        expect(typeof value).toBe("number");
        expect(value).toBeGreaterThan(0);
      });
    });
  });
});
