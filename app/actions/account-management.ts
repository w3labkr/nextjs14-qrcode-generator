"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function deleteAccount() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            qrCodes: true,
            templates: true,
            accounts: true,
            sessions: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    await prisma.$transaction(async (tx) => {
      const deletedQrCodes = await tx.qrCode.deleteMany({
        where: { userId },
      });

      const deletedTemplates = await tx.qrTemplate.deleteMany({
        where: { userId },
      });

      const deletedSessions = await tx.session.deleteMany({
        where: { userId },
      });

      const deletedAccounts = await tx.account.deleteMany({
        where: { userId },
      });

      await tx.user.delete({
        where: { id: userId },
      });

      console.log("계정 삭제 완료:", {
        userId,
        userEmail: user.email,
        deletedQrCodes: deletedQrCodes.count,
        deletedTemplates: deletedTemplates.count,
        deletedSessions: deletedSessions.count,
        deletedAccounts: deletedAccounts.count,
      });
    });

    return {
      success: true,
      message: "계정과 모든 관련 데이터가 성공적으로 삭제되었습니다.",
    };
  } catch (error) {
    console.error("계정 삭제 오류:", error);
    throw new Error(
      error instanceof Error ? error.message : "계정 삭제에 실패했습니다.",
    );
  }
}

export async function updateProfile(data: { name: string; email: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const userId = session.user.id;

    console.log("프로필 업데이트 시작:", { userId, data });

    // 입력 데이터 검증
    if (!data.name?.trim()) {
      return { success: false, error: "이름을 입력해주세요." };
    }

    if (!data.email?.trim()) {
      return { success: false, error: "이메일을 입력해주세요." };
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: "올바른 이메일 형식이 아닙니다." };
    }

    // 이메일이 변경된 경우 중복 체크
    if (data.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== userId) {
        return { success: false, error: "이미 사용 중인 이메일입니다." };
      }
    }

    // 개발 환경에서 dev-user인 경우 특별 처리
    if (userId === "dev-user" && process.env.NODE_ENV === "development") {
      console.log("개발 사용자 프로필 업데이트 - 세션에서만 업데이트");
      return {
        success: true,
        message: "프로필이 성공적으로 업데이트되었습니다.",
        user: {
          id: userId,
          name: data.name.trim(),
          email: data.email.trim(),
          image: null,
        },
      };
    }

    // 사용자 존재 여부 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      console.log("사용자를 찾을 수 없음:", { userId });
      return { success: false, error: "사용자를 찾을 수 없습니다." };
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name.trim(),
        email: data.email.trim(),
      },
    });

    console.log("프로필 업데이트 완료:", { userId, updatedUser });

    return {
      success: true,
      message: "프로필이 성공적으로 업데이트되었습니다.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    };
  } catch (error) {
    console.error("프로필 업데이트 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "프로필 업데이트에 실패했습니다.",
    };
  }
}
