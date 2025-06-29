"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { withAuthenticatedRLSTransaction, withoutRLS } from "@/lib/rls-utils";

export async function deleteAccount() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    const userId = session.user.id;

    return await withAuthenticatedRLSTransaction(session, async (tx) => {
      // 사용자 정보 조회
      const user = await tx.user.findFirst({
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

      // 관련 데이터 삭제 (RLS로 자동 필터링)
      const deletedQrCodes = await tx.qrCode.deleteMany({});
      const deletedTemplates = await tx.qrTemplate.deleteMany({});
      const deletedSessions = await tx.session.deleteMany({});
      const deletedAccounts = await tx.account.deleteMany({});

      // 사용자 삭제
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

      return {
        success: true,
        message: "계정과 모든 관련 데이터가 성공적으로 삭제되었습니다.",
      };
    });
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

    // 이메일 중복 검사와 사용자 업데이트를 위해 관리자 권한 필요
    const adminDb = await withoutRLS();

    // 이메일이 변경된 경우 중복 체크
    if (data.email !== session.user.email) {
      const existingUser = await adminDb.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== userId) {
        return { success: false, error: "이미 사용 중인 이메일입니다." };
      }
    }

    // 사용자 존재 여부 확인
    const existingUser = await adminDb.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      console.log("사용자를 찾을 수 없음:", { userId });
      return { success: false, error: "사용자를 찾을 수 없습니다." };
    }

    // 사용자 정보 업데이트
    const updatedUser = await adminDb.user.update({
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

export async function getConnectedAccounts() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    return await withAuthenticatedRLSTransaction(session, async (tx) => {
      const accounts = await tx.account.findMany({
        where: {
          userId: session.user!.id,
        },
        select: {
          id: true,
          type: true,
          provider: true,
          providerAccountId: true,
          access_token: false,
          refresh_token: false,
          expires_at: true,
          scope: true,
        },
      });

      return {
        success: true,
        accounts: accounts.map((account: any) => ({
          id: account.id,
          provider: account.provider,
          type: account.type,
          providerAccountId: account.providerAccountId,
          expiresAt: account.expires_at,
          scope: account.scope,
        })),
      };
    });
  } catch (error) {
    console.error("연동된 계정 조회 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "계정 조회에 실패했습니다.",
      accounts: [],
    };
  }
}

export async function disconnectOAuthProvider(provider: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("로그인이 필요합니다.");
    }

    return await withAuthenticatedRLSTransaction(session, async (tx) => {
      // 연결된 계정 수 확인
      const accountCount = await tx.account.count({
        where: {
          userId: session.user!.id,
        },
      });

      if (accountCount <= 1) {
        throw new Error("마지막 연동된 계정은 해제할 수 없습니다.");
      }

      // 해당 프로바이더 계정 삭제
      const deletedAccount = await tx.account.deleteMany({
        where: {
          userId: session.user!.id,
          provider: provider,
        },
      });

      if (deletedAccount.count === 0) {
        throw new Error("해당 프로바이더로 연동된 계정을 찾을 수 없습니다.");
      }

      return {
        success: true,
        message: `${provider} 연동이 성공적으로 해제되었습니다.`,
      };
    });
  } catch (error) {
    console.error("OAuth 연동 해제 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "연동 해제에 실패했습니다.",
    };
  }
}

export async function checkOAuthConnectionStatus(userId: string) {
  try {
    const client = await withoutRLS();
    const accounts = await client.account.findMany({
      where: {
        userId: userId,
      },
      select: {
        provider: true,
        type: true,
        providerAccountId: true,
      },
    });

    const connections = {
      google: accounts.find((acc: any) => acc.provider === "google"),
      github: accounts.find((acc: any) => acc.provider === "github"),
    };

    return {
      success: true,
      connections,
      totalConnections: accounts.length,
    };
  } catch (error) {
    console.error("OAuth 연동 상태 확인 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "연동 상태 확인에 실패했습니다.",
      connections: { google: null, github: null },
      totalConnections: 0,
    };
  }
}
