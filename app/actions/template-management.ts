"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { withRLS, withRLSTransaction } from "@/lib/rls-utils";
import { ensureUserExists } from "@/lib/utils";
import { TemplateData, TemplateUpdateData } from "@/types/qr-code-server";

export async function getUserTemplates() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      console.log("세션 없음 - 사용자 인증 필요");
      throw new Error("Unauthorized");
    }

    // 토큰 오류가 있는 경우 처리
    if ((session as any)?.error) {
      console.log("토큰 오류 감지:", (session as any).error);
      throw new Error("TokenExpired");
    }

    const db = await withRLS(session.user.id);

    const templates = await db.qrTemplate.findMany({
      where: {
        userId: session.user.id, // 현재 사용자의 템플릿만 조회
      },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    return templates;
  } catch (error) {
    console.error("getUserTemplates 오류:", error);
    throw error;
  }
}

export async function saveTemplate(data: TemplateData) {
  const { session } = await ensureUserExists();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { name, settings, isDefault = false } = data;
  const userId = session.user.id;

  return await withRLSTransaction(userId, async (tx) => {
    if (isDefault) {
      await tx.qrTemplate.updateMany({
        where: {
          userId: userId, // 현재 사용자의 템플릿만 업데이트
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const template = await tx.qrTemplate.create({
      data: {
        userId,
        name,
        settings: JSON.stringify(settings),
        isDefault,
      },
    });

    return template;
  });
}

export async function updateTemplate(
  templateId: string,
  data: TemplateUpdateData,
) {
  const { session } = await ensureUserExists();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  return await withRLSTransaction(userId, async (tx) => {
    const template = await tx.qrTemplate.findFirst({
      where: {
        id: templateId,
        userId: userId, // 현재 사용자의 템플릿만 조회
      },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    const { name, settings, isDefault } = data;

    if (isDefault) {
      await tx.qrTemplate.updateMany({
        where: {
          userId: userId, // 현재 사용자의 템플릿만 업데이트
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedTemplate = await tx.qrTemplate.update({
      where: {
        id: templateId,
        userId: userId, // 현재 사용자의 템플릿만 수정
      },
      data: {
        ...(name && { name }),
        ...(settings && { settings: JSON.stringify(settings) }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return updatedTemplate;
  });
}

export async function deleteTemplate(templateId: string) {
  const { session } = await ensureUserExists();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  return await withRLSTransaction(userId, async (tx) => {
    const template = await tx.qrTemplate.findFirst({
      where: {
        id: templateId,
        userId: userId, // 현재 사용자의 템플릿만 조회
      },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    await tx.qrTemplate.delete({
      where: {
        id: templateId,
        userId: userId, // 현재 사용자의 템플릿만 삭제
      },
    });

    return { success: true };
  });
}

export async function getDefaultTemplate() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const db = await withRLS(session.user.id);

  const defaultTemplate = await db.qrTemplate.findFirst({
    where: {
      userId: session.user.id, // 현재 사용자의 템플릿만 조회
      isDefault: true,
    },
  });

  return defaultTemplate;
}
