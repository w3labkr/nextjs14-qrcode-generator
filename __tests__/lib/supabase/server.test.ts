/**
 * @jest-environment node
 */
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// @supabase/ssr 모킹
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

// next/headers 모킹
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>;
const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe("supabase/server", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("createClient", () => {
    it("쿠키 스토어를 사용하여 Supabase 서버 클라이언트를 생성해야 한다", () => {
      // Mock cookie store
      const mockCookieStore = {
        getAll: jest.fn().mockReturnValue([
          { name: "session", value: "abc123" },
          { name: "user_id", value: "user123" },
        ]),
        set: jest.fn(),
      };

      // Mock Supabase client
      const mockSupabaseClient = { mock: "supabase-client" };
      mockCreateServerClient.mockReturnValue(mockSupabaseClient as any);

      const client = createClient(mockCookieStore as any);

      expect(createServerClient).toHaveBeenCalledWith(
        "https://test.supabase.co",
        "test-anon-key",
        {
          cookies: {
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          },
        },
      );

      expect(client).toBe(mockSupabaseClient);
    });

    it("쿠키 getAll 함수가 올바르게 작동해야 한다", () => {
      const mockCookieStore = {
        getAll: jest.fn().mockReturnValue([
          { name: "session", value: "abc123" },
          { name: "refresh_token", value: "refresh123" },
        ]),
        set: jest.fn(),
      };

      let capturedCookieConfig: any;
      mockCreateServerClient.mockImplementation((url, key, config) => {
        capturedCookieConfig = config;
        return { mock: "client" } as any;
      });

      createClient(mockCookieStore as any);

      // getAll 함수 테스트
      const getAllResult = capturedCookieConfig.cookies.getAll();
      expect(mockCookieStore.getAll).toHaveBeenCalled();
      expect(getAllResult).toEqual([
        { name: "session", value: "abc123" },
        { name: "refresh_token", value: "refresh123" },
      ]);
    });

    it("쿠키 setAll 함수가 올바르게 작동해야 한다", () => {
      const mockCookieStore = {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      };

      let capturedCookieConfig: any;
      mockCreateServerClient.mockImplementation((url, key, config) => {
        capturedCookieConfig = config;
        return { mock: "client" } as any;
      });

      createClient(mockCookieStore as any);

      // setAll 함수 테스트
      const cookiesToSet = [
        {
          name: "session",
          value: "new-session-value",
          options: { httpOnly: true, secure: true },
        },
        {
          name: "user_id",
          value: "user456",
          options: { maxAge: 3600 },
        },
      ];

      capturedCookieConfig.cookies.setAll(cookiesToSet);

      // cookieStore.set이 호출되었는지 확인
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "session",
        "new-session-value",
        { httpOnly: true, secure: true },
      );
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "user_id",
        "user456",
        { maxAge: 3600 },
      );
    });

    it("setAll에서 에러가 발생하면 무시해야 한다 (Server Component에서 호출된 경우)", () => {
      const mockCookieStore = {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn().mockImplementation(() => {
          throw new Error("Cannot set cookies in Server Component");
        }),
      };

      let capturedCookieConfig: any;
      mockCreateServerClient.mockImplementation((url, key, config) => {
        capturedCookieConfig = config;
        return { mock: "client" } as any;
      });

      createClient(mockCookieStore as any);

      // setAll 함수에서 에러가 발생해도 예외가 발생하지 않아야 함
      const cookiesToSet = [
        {
          name: "session",
          value: "new-session-value",
          options: { httpOnly: true },
        },
      ];

      expect(() => {
        capturedCookieConfig.cookies.setAll(cookiesToSet);
      }).not.toThrow();

      // set이 호출되었는지 확인
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "session",
        "new-session-value",
        { httpOnly: true },
      );
    });

    it("환경 변수가 없으면 createServerClient를 undefined로 호출한다", () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const mockCookieStore = {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      };

      const mockSupabaseClient = { mock: "client" };
      mockCreateServerClient.mockReturnValue(mockSupabaseClient as any);

      createClient(mockCookieStore as any);

      expect(createServerClient).toHaveBeenCalledWith(
        undefined,
        undefined,
        expect.any(Object),
      );
    });

    it("빈 쿠키 배열로도 정상 작동해야 한다", () => {
      const mockCookieStore = {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      };

      let capturedCookieConfig: any;
      mockCreateServerClient.mockImplementation((url, key, config) => {
        capturedCookieConfig = config;
        return { mock: "client" } as any;
      });

      const client = createClient(mockCookieStore as any);

      expect(capturedCookieConfig.cookies.getAll()).toEqual([]);
      expect(client).toEqual({ mock: "client" });
    });

    it("setAll에 빈 배열을 전달해도 정상 작동해야 한다", () => {
      const mockCookieStore = {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      };

      let capturedCookieConfig: any;
      mockCreateServerClient.mockImplementation((url, key, config) => {
        capturedCookieConfig = config;
        return { mock: "client" } as any;
      });

      createClient(mockCookieStore as any);

      // setAll에 빈 배열 전달
      capturedCookieConfig.cookies.setAll([]);

      // set이 호출되지 않았는지 확인
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it("다양한 쿠키 옵션을 올바르게 처리해야 한다", () => {
      const mockCookieStore = {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      };

      let capturedCookieConfig: any;
      mockCreateServerClient.mockImplementation((url, key, config) => {
        capturedCookieConfig = config;
        return { mock: "client" } as any;
      });

      createClient(mockCookieStore as any);

      // 다양한 쿠키 옵션 테스트
      const cookiesToSet = [
        {
          name: "session",
          value: "session-value",
          options: {
            httpOnly: true,
            secure: true,
            sameSite: "strict" as const,
            maxAge: 3600,
            path: "/",
            domain: ".example.com",
          },
        },
        {
          name: "theme",
          value: "dark",
          options: {
            httpOnly: false,
            secure: false,
            sameSite: "lax" as const,
          },
        },
        {
          name: "temp",
          value: "temp-value",
          options: undefined, // 옵션이 없는 경우
        },
      ];

      capturedCookieConfig.cookies.setAll(cookiesToSet);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "session",
        "session-value",
        {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 3600,
          path: "/",
          domain: ".example.com",
        },
      );

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "theme",
        "dark",
        {
          httpOnly: false,
          secure: false,
          sameSite: "lax",
        },
      );

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "temp",
        "temp-value",
        undefined,
      );
    });
  });
});