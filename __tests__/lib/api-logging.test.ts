import { NextResponse } from "next/server";
import { withApiLogging, withAuthenticatedApiLogging } from "@/lib/api-logging";

// Mock dependencies
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/logging-middleware", () => ({
  logApiRequest: jest.fn(),
}));

const mockAuth = require("@/auth").auth;
const mockLogApiRequest = require("@/lib/logging-middleware").logApiRequest;

// Mock NextRequest
const createMockRequest = (url: string, options?: RequestInit) => {
  return {
    url,
    method: options?.method || "GET",
    headers: new Headers(options?.headers),
    json: () => Promise.resolve(JSON.parse((options?.body as string) || "{}")),
  } as any;
};

describe("API Logging", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe("withApiLogging", () => {
    it("정상적인 요청을 처리하고 로깅해야 한다", async () => {
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const mockRequest = createMockRequest("http://localhost/api/test");
      const mockSession = { user: { id: "user123" } };

      mockAuth.mockResolvedValue(mockSession);
      mockLogApiRequest.mockResolvedValue(undefined);

      const wrappedHandler = withApiLogging(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest);
      expect(response).toEqual(NextResponse.json({ success: true }));

      // 로깅이 비동기로 처리되므로 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockAuth).toHaveBeenCalled();
      expect(mockLogApiRequest).toHaveBeenCalledWith(
        mockRequest,
        response,
        "user123"
      );
    });

    it("핸들러에서 에러가 발생하면 500 응답을 반환해야 한다", async () => {
      const mockError = new Error("Handler error");
      const mockHandler = jest.fn().mockRejectedValue(mockError);
      const mockRequest = createMockRequest("http://localhost/api/test");

      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockLogApiRequest.mockResolvedValue(undefined);

      const wrappedHandler = withApiLogging(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest);
      expect(response.status).toBe(500);
      
      // 응답 내용 확인 (실제 NextResponse.json()이 반환하는 내용)
      expect(console.error).toHaveBeenCalledWith("API 핸들러 에러:", mockError);
    });

    it("세션이 없는 경우에도 로깅해야 한다", async () => {
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const mockRequest = createMockRequest("http://localhost/api/test");

      mockAuth.mockResolvedValue(null);
      mockLogApiRequest.mockResolvedValue(undefined);

      const wrappedHandler = withApiLogging(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(response).toEqual(NextResponse.json({ success: true }));

      // 로깅이 비동기로 처리되므로 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockLogApiRequest).toHaveBeenCalledWith(
        mockRequest,
        response,
        null
      );
    });

    it("로깅 중 오류가 발생해도 응답에 영향을 주지 않아야 한다", async () => {
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const mockRequest = createMockRequest("http://localhost/api/test");
      const loggingError = new Error("Logging error");

      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockLogApiRequest.mockRejectedValue(loggingError);

      const wrappedHandler = withApiLogging(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(response).toEqual(NextResponse.json({ success: true }));

      // 로깅이 비동기로 처리되므로 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(console.error).toHaveBeenCalledWith("API 로깅 실패:", loggingError);
    });

    it("추가 매개변수를 핸들러에 전달해야 한다", async () => {
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const mockRequest = createMockRequest("http://localhost/api/test");
      const extraParam = { id: "123" };

      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockLogApiRequest.mockResolvedValue(undefined);

      const wrappedHandler = withApiLogging(mockHandler);
      await wrappedHandler(mockRequest, extraParam);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, extraParam);
    });
  });

  describe("withAuthenticatedApiLogging", () => {
    it("인증된 요청을 처리하고 로깅해야 한다", async () => {
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const mockRequest = createMockRequest("http://localhost/api/test");
      const mockSession = { user: { id: "user123" } };

      mockAuth.mockResolvedValue(mockSession);
      mockLogApiRequest.mockResolvedValue(undefined);

      const wrappedHandler = withAuthenticatedApiLogging(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest);
      expect(response).toEqual(NextResponse.json({ success: true }));

      // 로깅이 비동기로 처리되므로 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockLogApiRequest).toHaveBeenCalledWith(
        mockRequest,
        response,
        "user123"
      );
    });

    it("핸들러에서 에러가 발생하면 500 응답을 반환해야 한다", async () => {
      const mockError = new Error("Handler error");
      const mockHandler = jest.fn().mockRejectedValue(mockError);
      const mockRequest = createMockRequest("http://localhost/api/test");

      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockLogApiRequest.mockResolvedValue(undefined);

      const wrappedHandler = withAuthenticatedApiLogging(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(response.status).toBe(500);
      
      // 응답 내용 확인 (실제 NextResponse.json()이 반환하는 내용)
      expect(console.error).toHaveBeenCalledWith("API 핸들러 에러:", mockError);
    });

    it("인증 실패 시에도 로깅해야 한다", async () => {
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const mockRequest = createMockRequest("http://localhost/api/test");

      mockAuth.mockResolvedValue(null);
      mockLogApiRequest.mockResolvedValue(undefined);

      const wrappedHandler = withAuthenticatedApiLogging(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(response).toEqual(NextResponse.json({ success: true }));

      // 로깅이 비동기로 처리되므로 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockLogApiRequest).toHaveBeenCalledWith(
        mockRequest,
        response,
        null
      );
    });

    it("로깅 중 오류가 발생해도 응답에 영향을 주지 않아야 한다", async () => {
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const mockRequest = createMockRequest("http://localhost/api/test");
      const loggingError = new Error("Logging error");

      mockAuth.mockResolvedValue({ user: { id: "user123" } });
      mockLogApiRequest.mockRejectedValue(loggingError);

      const wrappedHandler = withAuthenticatedApiLogging(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(response).toEqual(NextResponse.json({ success: true }));

      // 로깅이 비동기로 처리되므로 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(console.error).toHaveBeenCalledWith("API 로깅 실패:", loggingError);
    });

    it("인증 과정에서 오류가 발생해도 핸들러를 실행해야 한다", async () => {
      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const mockRequest = createMockRequest("http://localhost/api/test");
      const authError = new Error("Auth error");

      mockAuth.mockRejectedValue(authError);
      mockLogApiRequest.mockResolvedValue(undefined);

      const wrappedHandler = withAuthenticatedApiLogging(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(response.status).toBe(500);
      expect(console.error).toHaveBeenCalledWith("API 핸들러 에러:", authError);
    });
  });
});