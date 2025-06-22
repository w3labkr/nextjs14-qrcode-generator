"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TemplateData, TemplateUpdateData } from "@/types/qr-code-server";

export async function getUserTemplates() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const templates = await prisma.qrTemplate.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return templates;
}

export async function saveTemplate(data: TemplateData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 사용자가 실제로 데이터베이스에 존재하는지 확인
  const existingUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!existingUser) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  const { name, settings, isDefault = false } = data;

  if (isDefault) {
    await prisma.qrTemplate.updateMany({
      where: {
        userId: session.user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const template = await prisma.qrTemplate.create({
    data: {
      userId: session.user.id,
      name,
      settings: JSON.stringify(settings),
      isDefault,
    },
  });

  return template;
}

export async function updateTemplate(
  templateId: string,
  data: TemplateUpdateData,
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 사용자가 실제로 데이터베이스에 존재하는지 확인
  const existingUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!existingUser) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  const template = await prisma.qrTemplate.findFirst({
    where: {
      id: templateId,
      userId: session.user.id,
    },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  const { name, settings, isDefault } = data;

  if (isDefault) {
    await prisma.qrTemplate.updateMany({
      where: {
        userId: session.user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  const updatedTemplate = await prisma.qrTemplate.update({
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
}

export async function deleteTemplate(templateId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 사용자가 실제로 데이터베이스에 존재하는지 확인
  const existingUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!existingUser) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  const template = await prisma.qrTemplate.findFirst({
    where: {
      id: templateId,
      userId: session.user.id,
    },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  await prisma.qrTemplate.delete({
    where: {
      id: templateId,
    },
  });

  return { success: true };
}

export async function getDefaultTemplate() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const defaultTemplate = await prisma.qrTemplate.findFirst({
    where: {
      userId: session.user.id,
      isDefault: true,
    },
  });

  return defaultTemplate;
}
