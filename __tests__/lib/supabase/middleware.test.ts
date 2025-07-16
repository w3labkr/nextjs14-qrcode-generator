/**
 * @jest-environment node
 */
import { createClient } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// @supabase/ssr 모킹
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

// NextResponse 모킹
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(),
  },
}));

const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>;
const mockNextResponse = NextResponse.next as jest.MockedFunction<typeof NextResponse.next>;

describe("supabase/middleware", () => {
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
    it("NextRequest를 사용하여 Supabase 서버 클라이언트를 생성해야 한다", () => {
      // Mock NextRequest
      const mockRequest = {
        headers: new Map([["user-agent", "test-agent"]]),
        cookies: {
          getAll: jest.fn().mockReturnValue([
            { name: "cookie1", value: "value1" },
            { name: "cookie2", value: "value2" },
          ]),
          set: jest.fn(),
        },
      } as unknown as NextRequest;

      // Mock NextResponse
      const mockResponse = {
        cookies: {
          set: jest.fn(),
        },
      };
      mockNextResponse.mockReturnValue(mockResponse as any);

      // Mock Supabase client
      const mockSupabaseClient = { mock: "supabase-client" };
      mockCreateServerClient.mockReturnValue(mockSupabaseClient as any);

      const response = createClient(mockRequest);

      expect(NextResponse.next).toHaveBeenCalledWith({
        request: {
          headers: mockRequest.headers,
        },
      });

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

      expect(response).toBe(mockResponse);
    });

    it("쿠키 getAll 함수가 올바르게 작동해야 한다", () => {
      const mockRequest = {
        headers: new Map(),
        cookies: {
          getAll: jest.fn().mockReturnValue([
            { name: "session", value: "abc123" },
            { name: "user_id", value: "user123" },
          ]),
          set: jest.fn(),
        },
      } as unknown as NextRequest;

      const mockResponse = {
        cookies: {
          set: jest.fn(),
        },
      };
      mockNextResponse.mockReturnValue(mockResponse as any);

      let capturedCookieConfig: any;
      mockCreateServerClient.mockImplementation((url, key, config) => {
        capturedCookieConfig = config;
        return { mock: "client" } as any;
      });

      createClient(mockRequest);

      // getAll 함수 테스트
      const getAllResult = capturedCookieConfig.cookies.getAll();
      expect(mockRequest.cookies.getAll).toHaveBeenCalled();
      expect(getAllResult).toEqual([
        { name: "session", value: "abc123" },
        { name: "user_id", value: "user123" },
      ]);
    });

    it("쿠키 setAll 함수가 올바르게 작동해야 한다", () => {
      const mockRequest = {
        headers: new Map(),
        cookies: {
          getAll: jest.fn().mockReturnValue([]),
          set: jest.fn(),
        },
      } as unknown as NextRequest;

      const mockResponse = {
        cookies: {
          set: jest.fn(),
        },
      };
      mockNextResponse.mockReturnValue(mockResponse as any);

      let capturedCookieConfig: any;
      mockCreateServerClient.mockImplementation((url, key, config) => {
        capturedCookieConfig = config;
        return { mock: "client" } as any;
      });

      createClient(mockRequest);

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

      // request.cookies.set이 호출되었는지 확인
      expect(mockRequest.cookies.set).toHaveBeenCalledWith("session", "new-session-value");
      expect(mockRequest.cookies.set).toHaveBeenCalledWith("user_id", "user456");

      // NextResponse.next가 다시 호출되었는지 확인
      expect(NextResponse.next).toHaveBeenCalledWith({
        request: mockRequest,
      });

      // response.cookies.set이 호출되었는지 확인
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        "session",
        "new-session-value",
        { httpOnly: true, secure: true },
      );
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        "user_id",
        "user456",
        { maxAge: 3600 },
      );
    });

    it("환경 변수가 없으면 createServerClient를 undefined로 호출한다", () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const mockRequest = {
        headers: new Map(),
        cookies: {
          getAll: jest.fn().mockReturnValue([]),
          set: jest.fn(),
        },
      } as unknown as NextRequest;

      const mockResponse = {
        cookies: {
          set: jest.fn(),
        },
      };
      mockNextResponse.mockReturnValue(mockResponse as any);

      const mockSupabaseClient = { mock: "client" };
      mockCreateServerClient.mockReturnValue(mockSupabaseClient as any);

      createClient(mockRequest);

      expect(createServerClient).toHaveBeenCalledWith(
        undefined,
        undefined,
        expect.any(Object),
      );
    });

    it("빈 쿠키 배열로도 정상 작동해야 한다", () => {
      const mockRequest = {
        headers: new Map(),
        cookies: {
          getAll: jest.fn().mockReturnValue([]),
          set: jest.fn(),
        },
      } as unknown as NextRequest;

      const mockResponse = {
        cookies: {
          set: jest.fn(),
        },
      };
      mockNextResponse.mockReturnValue(mockResponse as any);

      let capturedCookieConfig: any;
      mockCreateServerClient.mockImplementation((url, key, config) => {
        capturedCookieConfig = config;
        return { mock: "client" } as any;
      });

      const response = createClient(mockRequest);

      expect(capturedCookieConfig.cookies.getAll()).toEqual([]);
      expect(response).toBe(mockResponse);
    });

    it("setAll에 빈 배열을 전달해도 정상 작동해야 한다", () => {
      const mockRequest = {
        headers: new Map(),
        cookies: {
          getAll: jest.fn().mockReturnValue([]),
          set: jest.fn(),
        },
      } as unknown as NextRequest;

      const mockResponse = {
        cookies: {
          set: jest.fn(),
        },
      };
      mockNextResponse.mockReturnValue(mockResponse as any);

      let capturedCookieConfig: any;
      mockCreateServerClient.mockImplementation((url, key, config) => {
        capturedCookieConfig = config;
        return { mock: "client" } as any;
      });

      createClient(mockRequest);

      // setAll에 빈 배열 전달
      capturedCookieConfig.cookies.setAll([]);

      // 아무것도 호출되지 않았는지 확인
      expect(mockRequest.cookies.set).not.toHaveBeenCalled();
      expect(mockResponse.cookies.set).not.toHaveBeenCalled();
    });
  });
});