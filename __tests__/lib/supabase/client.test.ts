/**
 * @jest-environment jsdom
 */
import { createClient } from "@/lib/supabase/client";
import { createBrowserClient } from "@supabase/ssr";

// @supabase/ssr 모킹
jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(),
}));

const mockCreateBrowserClient = createBrowserClient as jest.MockedFunction<typeof createBrowserClient>;

describe("supabase/client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("createClient", () => {
    it("환경 변수를 사용하여 Supabase 브라우저 클라이언트를 생성해야 한다", () => {
      // 환경 변수 설정
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

      const mockClient = { mock: "client" };
      mockCreateBrowserClient.mockReturnValue(mockClient as any);

      const client = createClient();

      expect(createBrowserClient).toHaveBeenCalledWith(
        "https://test.supabase.co",
        "test-anon-key",
      );
      expect(client).toBe(mockClient);
    });

    it("환경 변수가 없으면 createBrowserClient를 undefined로 호출한다", () => {
      // 환경 변수 제거
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const mockClient = { mock: "client" };
      mockCreateBrowserClient.mockReturnValue(mockClient as any);

      createClient();

      expect(createBrowserClient).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });

    it("URL만 없으면 createBrowserClient를 undefined로 호출한다", () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

      const mockClient = { mock: "client" };
      mockCreateBrowserClient.mockReturnValue(mockClient as any);

      createClient();

      expect(createBrowserClient).toHaveBeenCalledWith(
        undefined,
        "test-anon-key",
      );
    });

    it("ANON_KEY만 없으면 createBrowserClient를 undefined로 호출한다", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const mockClient = { mock: "client" };
      mockCreateBrowserClient.mockReturnValue(mockClient as any);

      createClient();

      expect(createBrowserClient).toHaveBeenCalledWith(
        "https://test.supabase.co",
        undefined,
      );
    });

    it("빈 문자열 환경 변수로 createBrowserClient를 호출한다", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";

      const mockClient = { mock: "client" };
      mockCreateBrowserClient.mockReturnValue(mockClient as any);

      createClient();

      expect(createBrowserClient).toHaveBeenCalledWith(
        "",
        "",
      );
    });

    it("여러 번 호출해도 매번 새로운 클라이언트를 생성해야 한다", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

      const mockClient1 = { mock: "client1" };
      const mockClient2 = { mock: "client2" };
      
      mockCreateBrowserClient
        .mockReturnValueOnce(mockClient1 as any)
        .mockReturnValueOnce(mockClient2 as any);

      const client1 = createClient();
      const client2 = createClient();

      expect(createBrowserClient).toHaveBeenCalledTimes(2);
      expect(client1).toBe(mockClient1);
      expect(client2).toBe(mockClient2);
    });
  });
});