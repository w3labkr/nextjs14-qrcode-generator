"use server";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// 개발 모드에서만 사용 가능한 임시 로그인
export async function devLogin() {
  // 프로덕션에서는 사용 불가
  if (process.env.NODE_ENV !== "development") {
    throw new Error("개발 모드에서만 사용 가능합니다.");
  }

  const devUser = {
    id: "dev-user",
    name: "개발자",
    email: "dev@example.com",
    image: null,
    emailVerified: new Date(),
  };

  try {
    // 기존 개발 사용자가 있는지 확인
    let user = await prisma.user.findUnique({
      where: { id: devUser.id },
    });

    // 없으면 생성
    if (!user) {
      user = await prisma.user.create({
        data: devUser,
      });
    }

    // 기존 세션 삭제
    await prisma.session.deleteMany({
      where: { userId: devUser.id },
    });

    // 새 세션 생성
    const sessionToken = `dev-session-${Date.now()}`;
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30일

    await prisma.session.create({
      data: {
        sessionToken,
        userId: devUser.id,
        expires,
      },
    });

    // 세션 쿠키 설정을 위해 리다이렉트
    redirect(`/api/auth/dev-callback?token=${sessionToken}`);
  } catch (error) {
    console.error("개발 로그인 실패:", error);
    throw new Error("임시 로그인에 실패했습니다.");
  }
}
