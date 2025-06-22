"use server";

import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export async function devLogin() {
  console.log("devLogin 함수 실행됨");
  console.log("NODE_ENV:", process.env.NODE_ENV);

  // 개발 모드 체크를 더 관대하게 설정
  const isDevelopment =
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === undefined ||
    !process.env.NODE_ENV;

  if (!isDevelopment) {
    console.log("프로덕션 모드에서 접근 시도");
    return { success: false, error: "개발 모드에서만 사용 가능합니다." };
  }

  try {
    console.log("NextAuth signIn 실행 중...");

    const result = await signIn("dev-login", {
      email: "dev@example.com",
      redirect: false,
    });

    console.log("signIn 결과:", result);

    if (result?.error) {
      console.error("signIn 에러:", result.error);
      return { success: false, error: result.error };
    }

    // 성공 시 리다이렉트
    redirect("/dashboard");
  } catch (error) {
    console.error("개발 로그인 실패:", error);

    if (error instanceof Error) {
      console.error("에러 메시지:", error.message);
      console.error("에러 스택:", error.stack);
    }

    return {
      success: false,
      error: `임시 로그인에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
    };
  }
}
