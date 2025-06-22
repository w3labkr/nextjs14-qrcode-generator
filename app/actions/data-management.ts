"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ImportData } from "@/types/qr-code-server";
import { inferQrCodeType } from "@/lib/utils";

export async function exportUserData() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [qrCodes, templates] = await Promise.all([
    prisma.qrCode.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        type: true,
        title: true,
        content: true,
        settings: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.qrTemplate.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        name: true,
        settings: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    user: {
      name: session.user.name,
      email: session.user.email,
    },
    qrCodes: qrCodes.map((qr) => ({
      ...qr,
      settings: JSON.parse(qr.settings),
    })),
    templates: templates.map((template) => ({
      ...template,
      settings: JSON.parse(template.settings),
    })),
    stats: {
      totalQrCodes: qrCodes.length,
      totalTemplates: templates.length,
      favoriteQrCodes: qrCodes.filter((qr) => qr.isFavorite).length,
      defaultTemplates: templates.filter((t) => t.isDefault).length,
    },
  };

  return exportData;
}

export async function exportQrCodes() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const qrCodes = await prisma.qrCode.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      type: true,
      title: true,
      content: true,
      settings: true,
      isFavorite: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    dataType: "qrcodes",
    user: {
      name: session.user.name,
      email: session.user.email,
    },
    qrCodes: qrCodes.map((qr) => ({
      ...qr,
      settings: JSON.parse(qr.settings),
    })),
    stats: {
      totalQrCodes: qrCodes.length,
      favoriteQrCodes: qrCodes.filter((qr) => qr.isFavorite).length,
    },
  };

  return exportData;
}

export async function exportTemplates() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const templates = await prisma.qrTemplate.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      name: true,
      settings: true,
      isDefault: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    dataType: "templates",
    user: {
      name: session.user.name,
      email: session.user.email,
    },
    templates: templates.map((template) => ({
      ...template,
      settings: JSON.parse(template.settings),
    })),
    stats: {
      totalTemplates: templates.length,
      defaultTemplates: templates.filter((t) => t.isDefault).length,
    },
  };

  return exportData;
}

export async function importUserData(data: ImportData) {
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

  const { qrCodes = [], templates = [], replaceExisting = false } = data;

  try {
    let importedQrCodes = 0;
    let importedTemplates = 0;

    if (replaceExisting) {
      await Promise.all([
        prisma.qrCode.deleteMany({
          where: { userId: session.user.id },
        }),
        prisma.qrTemplate.deleteMany({
          where: { userId: session.user.id },
        }),
      ]);
    }

    if (qrCodes.length > 0) {
      for (const qrCode of qrCodes) {
        try {
          if (!qrCode.content || typeof qrCode.content !== "string") {
            console.warn("QR 코드 컨텐츠가 유효하지 않음:", qrCode);
            continue;
          }

          const validTypes = [
            "URL",
            "TEXT",
            "WIFI",
            "EMAIL",
            "SMS",
            "VCARD",
            "LOCATION",
          ];
          let qrType = qrCode.type;

          if (!qrType || !validTypes.includes(qrType.toUpperCase())) {
            qrType = inferQrCodeType(qrCode.content);
          }

          await prisma.qrCode.create({
            data: {
              userId: session.user.id,
              type: qrType,
              title: qrCode.title || null,
              content: qrCode.content,
              settings:
                typeof qrCode.settings === "string"
                  ? qrCode.settings
                  : JSON.stringify(qrCode.settings || {}),
              isFavorite: Boolean(qrCode.isFavorite),
            },
          });
          importedQrCodes++;
        } catch (error) {
          console.error("QR 코드 가져오기 오류:", error);
        }
      }
    }

    if (templates.length > 0) {
      let hasDefaultTemplate = false;

      for (const template of templates) {
        try {
          if (!template.name || typeof template.name !== "string") {
            console.warn("템플릿 이름이 유효하지 않음:", template);
            continue;
          }

          const isDefault = template.isDefault && !hasDefaultTemplate;

          if (isDefault && !replaceExisting) {
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

          await prisma.qrTemplate.create({
            data: {
              userId: session.user.id,
              name: template.name,
              settings:
                typeof template.settings === "string"
                  ? template.settings
                  : JSON.stringify(template.settings || {}),
              isDefault,
            },
          });

          if (isDefault) {
            hasDefaultTemplate = true;
          }

          importedTemplates++;
        } catch (error) {
          console.error("템플릿 가져오기 오류:", error);
        }
      }
    }

    return {
      success: true,
      imported: {
        qrCodes: importedQrCodes,
        templates: importedTemplates,
      },
      total: {
        qrCodes: qrCodes.length,
        templates: templates.length,
      },
    };
  } catch (error) {
    console.error("데이터 가져오기 오류:", error);
    throw new Error("데이터 가져오기에 실패했습니다.");
  }
}

export async function importQrCodes(qrCodes: any[], replaceExisting = false) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    let importedQrCodes = 0;

    if (replaceExisting) {
      await prisma.qrCode.deleteMany({
        where: { userId: session.user.id },
      });
    }

    if (qrCodes.length > 0) {
      for (const qrCode of qrCodes) {
        try {
          if (!qrCode.content || typeof qrCode.content !== "string") {
            console.warn("QR 코드 컨텐츠가 유효하지 않음:", qrCode);
            continue;
          }

          const validTypes = [
            "URL",
            "TEXT",
            "WIFI",
            "EMAIL",
            "SMS",
            "VCARD",
            "LOCATION",
          ];
          let qrType = qrCode.type;

          if (!qrType || !validTypes.includes(qrType.toUpperCase())) {
            qrType = inferQrCodeType(qrCode.content);
          }

          await prisma.qrCode.create({
            data: {
              userId: session.user.id,
              type: qrType,
              title: qrCode.title || null,
              content: qrCode.content,
              settings:
                typeof qrCode.settings === "string"
                  ? qrCode.settings
                  : JSON.stringify(qrCode.settings || {}),
              isFavorite: Boolean(qrCode.isFavorite),
            },
          });
          importedQrCodes++;
        } catch (error) {
          console.error("QR 코드 가져오기 오류:", error);
        }
      }
    }

    return {
      success: true,
      imported: {
        qrCodes: importedQrCodes,
      },
      total: {
        qrCodes: qrCodes.length,
      },
    };
  } catch (error) {
    console.error("QR 코드 가져오기 오류:", error);
    throw new Error("QR 코드 가져오기에 실패했습니다.");
  }
}

export async function importTemplates(
  templates: any[],
  replaceExisting = false,
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    let importedTemplates = 0;

    if (replaceExisting) {
      await prisma.qrTemplate.deleteMany({
        where: { userId: session.user.id },
      });
    }

    if (templates.length > 0) {
      let hasDefaultTemplate = false;

      for (const template of templates) {
        try {
          if (!template.name || typeof template.name !== "string") {
            console.warn("템플릿 이름이 유효하지 않음:", template);
            continue;
          }

          const isDefault = template.isDefault && !hasDefaultTemplate;

          if (isDefault && !replaceExisting) {
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

          await prisma.qrTemplate.create({
            data: {
              userId: session.user.id,
              name: template.name,
              settings:
                typeof template.settings === "string"
                  ? template.settings
                  : JSON.stringify(template.settings || {}),
              isDefault,
            },
          });

          if (isDefault) {
            hasDefaultTemplate = true;
          }

          importedTemplates++;
        } catch (error) {
          console.error("템플릿 가져오기 오류:", error);
        }
      }
    }

    return {
      success: true,
      imported: {
        templates: importedTemplates,
      },
      total: {
        templates: templates.length,
      },
    };
  } catch (error) {
    console.error("템플릿 가져오기 오류:", error);
    throw new Error("템플릿 가져오기에 실패했습니다.");
  }
}
