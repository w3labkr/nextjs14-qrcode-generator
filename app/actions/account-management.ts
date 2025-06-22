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
