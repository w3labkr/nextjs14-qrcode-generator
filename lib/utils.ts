import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 현재 세션에서 사용자를 확인하고, 데이터베이스에 없으면 생성합니다.
 * 개발 모드에서 유용합니다.
 */
export async function ensureUserExists() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  // 사용자가 실제로 데이터베이스에 존재하는지 확인
  let existingUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!existingUser) {
    // 개발 모드나 새로운 사용자의 경우 자동 생성
    existingUser = await prisma.user.create({
      data: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
    });
  }

  return { user: existingUser, session };
}
