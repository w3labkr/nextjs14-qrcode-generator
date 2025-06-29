import { renderHook } from "@testing-library/react";
import { useToast } from "@/hooks/use-toast";

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("useToast Hook", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("기본 success 토스트를 표시해야 한다", () => {
    const { result } = renderHook(() => useToast());
    const sonnerToast = require("sonner").toast;

    result.current.toast({ title: "성공 메시지" });

    expect(sonnerToast.success).toHaveBeenCalledWith("성공 메시지", {
      description: undefined,
    });
  });

  it("error 토스트를 표시해야 한다", () => {
    const { result } = renderHook(() => useToast());
    const sonnerToast = require("sonner").toast;

    result.current.toast({
      title: "에러 메시지",
      variant: "destructive",
    });

    expect(sonnerToast.error).toHaveBeenCalledWith("에러 메시지", {
      description: undefined,
    });
  });

  it("설명과 함께 토스트를 표시해야 한다", () => {
    const { result } = renderHook(() => useToast());
    const sonnerToast = require("sonner").toast;

    result.current.toast({
      title: "제목",
      description: "상세 설명",
    });

    expect(sonnerToast.success).toHaveBeenCalledWith("제목", {
      description: "상세 설명",
    });
  });

  it("제목 없이 토스트를 표시할 때 기본 제목을 사용해야 한다", () => {
    const { result } = renderHook(() => useToast());
    const sonnerToast = require("sonner").toast;

    result.current.toast({ description: "설명만 있음" });

    expect(sonnerToast.success).toHaveBeenCalledWith("성공", {
      description: "설명만 있음",
    });
  });

  it("destructive variant에서 제목 없이 토스트를 표시할 때 기본 제목을 사용해야 한다", () => {
    const { result } = renderHook(() => useToast());
    const sonnerToast = require("sonner").toast;

    result.current.toast({
      description: "에러 설명",
      variant: "destructive",
    });

    expect(sonnerToast.error).toHaveBeenCalledWith("오류", {
      description: "에러 설명",
    });
  });

  it("default variant가 success 토스트를 표시해야 한다", () => {
    const { result } = renderHook(() => useToast());
    const sonnerToast = require("sonner").toast;

    result.current.toast({
      title: "제목",
      variant: "default",
    });

    expect(sonnerToast.success).toHaveBeenCalledWith("제목", {
      description: undefined,
    });
  });

  it("빈 객체로 호출 시 기본값을 사용해야 한다", () => {
    const { result } = renderHook(() => useToast());
    const sonnerToast = require("sonner").toast;

    result.current.toast({});

    expect(sonnerToast.success).toHaveBeenCalledWith("성공", {
      description: undefined,
    });
  });
});
