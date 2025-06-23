"use server";

import { auth } from "@/auth";
import {
  withAuthenticatedRLS,
  withAuthenticatedRLSTransaction,
} from "@/lib/rls-utils";
import { ImportData } from "@/types/qr-code-server";
import { inferQrCodeType } from "@/lib/utils";

export async function exportUserData() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = await withAuthenticatedRLS(session);

  const [qrCodes, templates] = await Promise.all([
    db.qrCode.findMany({
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
    db.qrTemplate.findMany({
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
    dataType: "all",
    user: {
      id: session.user.id,
      email: session.user.email,
    },
    data: {
      qrCodes: qrCodes.map((qr: any) => ({
        ...qr,
        settings: JSON.parse(qr.settings || "{}"),
      })),
      templates: templates.map((template: any) => ({
        ...template,
        settings: JSON.parse(template.settings || "{}"),
      })),
    },
    statistics: {
      totalQrCodes: qrCodes.length,
      favoriteQrCodes: qrCodes.filter((qr: any) => qr.isFavorite).length,
      totalTemplates: templates.length,
      defaultTemplates: templates.filter((t: any) => t.isDefault).length,
    },
  };

  return exportData;
}

export async function exportQrCodes() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = await withAuthenticatedRLS(session);

  const qrCodes = await db.qrCode.findMany({
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
      id: session.user.id,
      email: session.user.email,
    },
    data: {
      qrCodes: qrCodes.map((qr: any) => ({
        ...qr,
        settings: JSON.parse(qr.settings || "{}"),
      })),
    },
    statistics: {
      totalQrCodes: qrCodes.length,
      favoriteQrCodes: qrCodes.filter((qr: any) => qr.isFavorite).length,
    },
  };

  return exportData;
}

export async function exportTemplates() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const db = await withAuthenticatedRLS(session);

  const templates = await db.qrTemplate.findMany({
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
      id: session.user.id,
      email: session.user.email,
    },
    data: {
      templates: templates.map((template: any) => ({
        ...template,
        settings: JSON.parse(template.settings || "{}"),
      })),
    },
    statistics: {
      totalTemplates: templates.length,
      defaultTemplates: templates.filter((t: any) => t.isDefault).length,
    },
  };

  return exportData;
}

export async function importUserData(data: ImportData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { qrCodes = [], templates = [], replaceExisting = false } = data;

  return await withAuthenticatedRLSTransaction(session, async (tx) => {
    // 사용자가 실제로 데이터베이스에 존재하는지 확인
    const existingUser = await tx.user.findFirst({
      where: { id: session.user!.id },
    });

    if (!existingUser) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    let importedQrCodes = 0;
    let importedTemplates = 0;

    if (replaceExisting) {
      await Promise.all([
        tx.qrCode.deleteMany({}), // RLS로 자동 필터링
        tx.qrTemplate.deleteMany({}), // RLS로 자동 필터링
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

          await tx.qrCode.create({
            data: {
              userId: session.user!.id,
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
            await tx.qrTemplate.updateMany({
              where: {
                isDefault: true,
              },
              data: {
                isDefault: false,
              },
            });
          }

          await tx.qrTemplate.create({
            data: {
              userId: session.user!.id,
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
  });
}

export async function importQrCodes(qrCodes: any[], replaceExisting = false) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await withAuthenticatedRLSTransaction(session, async (tx) => {
    if (replaceExisting) {
      await tx.qrCode.deleteMany({});
    }

    let importedCount = 0;

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

        await tx.qrCode.create({
          data: {
            userId: session.user!.id,
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
        importedCount++;
      } catch (error) {
        console.error("QR 코드 가져오기 오류:", error);
      }
    }

    return {
      success: true,
      imported: importedCount,
      total: qrCodes.length,
    };
  });
}

export async function importTemplates(
  templates: any[],
  replaceExisting = false,
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await withAuthenticatedRLSTransaction(session, async (tx) => {
    if (replaceExisting) {
      await tx.qrTemplate.deleteMany({});
    }

    let importedCount = 0;
    let hasDefaultTemplate = false;

    for (const template of templates) {
      try {
        if (!template.name || typeof template.name !== "string") {
          console.warn("템플릿 이름이 유효하지 않음:", template);
          continue;
        }

        const isDefault = template.isDefault && !hasDefaultTemplate;

        if (isDefault && !replaceExisting) {
          await tx.qrTemplate.updateMany({
            where: {
              isDefault: true,
            },
            data: {
              isDefault: false,
            },
          });
        }

        await tx.qrTemplate.create({
          data: {
            userId: session.user!.id,
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

        importedCount++;
      } catch (error) {
        console.error("템플릿 가져오기 오류:", error);
      }
    }

    return {
      success: true,
      imported: importedCount,
      total: templates.length,
    };
  });
}
