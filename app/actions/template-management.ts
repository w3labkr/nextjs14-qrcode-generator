"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { withRLS, withRLSTransaction } from "@/lib/rls-utils";
import { ensureUserExists } from "@/lib/utils";
import { TemplateData, TemplateUpdateData } from "@/types/qr-code-server";

export async function getUserTemplates() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = await withRLS(session.user.id);

  const templates = await db.qrTemplate.findMany({
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return templates;
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
      },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    const { name, settings, isDefault } = data;

    if (isDefault) {
      await tx.qrTemplate.updateMany({
        where: {
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
      },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    await tx.qrTemplate.delete({
      where: {
        id: templateId,
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
      isDefault: true,
    },
  });

  return defaultTemplate;
}
